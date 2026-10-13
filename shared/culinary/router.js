import {inventoryWithOrderReceipts} from "./receivingLedger.js";
import {createHash} from "node:crypto";
import {idOf,normalizeOffer,priceChange} from "./pricing.js";
import {previewCosting,priceSnapshot} from "./vendorHistory.js";
import {consolidateRequirements,purchasingComparison,purchasingCsv} from "./purchasing.js";
import {assessRecipe,aggregateAssessments,allergyConflicts} from "./allergens.js";
const fingerprint=value=>createHash("sha256").update(value).digest("hex");
export const createCulinaryRouter=({express,mongoose,businessConnection,localConnection=mongoose.connection,menuConnection=localConnection,enableMenus=false,enableEvents=false,menuItemCollection="menu_items"})=>{
 const router=express.Router();const ObjectId=mongoose.Types.ObjectId;
 const objectId=value=>{if(!ObjectId.isValid(idOf(value)))throw new Error("A valid record ID is required.");return new ObjectId(idOf(value));};
 const scoped=(record,business)=>record&&idOf(record.business)===idOf(business);
 const guard=handler=>async(req,res)=>{try{await businessConnection.asPromise();const business=objectId(req.query.business||req.body?.business);await handler(req,res,business);}catch(error){res.status(400).json({message:error.message});}};
 const db=()=>businessConnection.db;
 const local=()=>localConnection.db;
 const menusDb=()=>menuConnection.db;
 const unitRecords=async()=>[...await db().collection("imperial_units").find({}).toArray(),...await db().collection("metric_units").find({}).toArray()];
 const recipeData=async business=>{
  const [recipes,costings,offers,ingredients,allergens,records,vendors]=await Promise.all([
   db().collection("recipes").find({business,isActive:{$ne:false}}).toArray(),db().collection("recipe_costings").find({business,isActive:{$ne:false}}).toArray(),db().collection("vendor_ingredient_prices").find({business}).toArray(),db().collection("ingredients").find({$or:[{business},{business:null},{business:{$exists:false}}]}).toArray(),db().collection("allergens").find({isActive:{$ne:false}}).toArray(),unitRecords(),db().collection("vendors").find({}).toArray()
  ]);
  return{recipes,costings,offers:offers.map(offer=>({...offer,isActive:offer.isActive!==false&&vendors.find(vendor=>idOf(vendor)===idOf(offer.vendor))?.isActive!==false,isPreferred:Boolean(offer.isPreferred||vendors.find(vendor=>idOf(vendor)===idOf(offer.vendor))?.isPreferred)})),ingredients,allergens,records,vendors:vendors.map(vendor=>({...vendor,purchasingTerms:vendor.purchasingTermsByBusiness?.[idOf(business)]||vendor.purchasingTerms||{minimumOrder:vendor.ordering?.minimumOrderValue??0,deliveryCost:vendor.ordering?.deliveryCost??null,quantityMinimumUnresolved:Number(vendor.ordering?.minimumOrderQty||0)>0,orderMultipleUnresolved:Number(vendor.ordering?.orderMultiple||1)>1}}))};
 };
 const recipeAssessment=(recipe,data)=>{
  const costing=data.costings.find(item=>idOf(item.recipe)===idOf(recipe));const used=new Set();
  const ingredients=(recipe.ingredients||[]).map(line=>{if(line.vendorIngredientPrice)return line;const index=(costing?.ingredients||[]).findIndex((item,i)=>!used.has(i)&&idOf(item.ingredient)===idOf(line.ingredient));if(index<0)return line;used.add(index);return{...line,vendorIngredientPrice:costing.ingredients[index].vendorIngredientPrice};});
  const result=assessRecipe({...recipe,ingredients},data.ingredients,data.offers,data.allergens);
  result.fingerprint=fingerprint(result.inputSignature);delete result.inputSignature;
  result.review=recipe.allergenReview||null;
  result.reviewCurrent=Boolean(!result.reviewRequired&&recipe.allergenReview?.fingerprint===result.fingerprint);
  return result;
 };
 const linkedMenu=async(menuId,business)=>{
  const menu=await menusDb().collection("menus").findOne({_id:objectId(menuId),business});
  if(!menu)throw new Error("Menu is not assigned to this business.");return menu;
 };
 const menuRecipes=async(menu,data)=>{
  const itemIds=(menu.items||[]).flatMap(item=>{const value=item?.item||item;return ObjectId.isValid(idOf(value))?[objectId(value)]:[];});
  const items=await menusDb().collection(menuItemCollection).find({$or:[{menu:menu._id},{_id:{$in:itemIds}}]}).toArray();
  const issues=items.flatMap(item=>item.business&&!scoped(item,menu.business)?[`${item.name}: dish belongs to another business.`]:!item.recipe?[`${item.name}: dish needs a business recipe link.`]:[]);
  if(itemIds.some(value=>!items.some(item=>idOf(item)===idOf(value))))issues.push("Some existing menu dishes are missing.");
  const assignments=[...(menu.recipeAssignments||[]),...items.filter(item=>item.recipe&&(!item.business||scoped(item,menu.business))&&!(menu.recipeAssignments||[]).some(assignment=>idOf(assignment.recipe)===idOf(item.recipe))).map(item=>({recipe:item.recipe,servingsPerGuest:item.servingsPerGuest||1,menuItem:item._id,dishName:item.name}))];
  if(!assignments.length)issues.push(`Menu ${menu.name} has no business recipe assignments.`);
  const linked=assignments.map(assignment=>{const recipe=data.recipes.find(item=>idOf(item)===idOf(assignment.recipe));if(!recipe)throw new Error("Menu recipe is missing or belongs to another business.");return{recipe,servingsPerGuest:Number(assignment.servingsPerGuest||1),menuItem:assignment.menuItem,dishName:assignment.dishName};});
  linked.issues=issues;return linked;
 };
 const selection=async(body,business,data)=>{
  let menus=[];let event=null;
  if(body.event){
   if(!enableEvents)throw new Error("Events are handled by Catering Management.");
   event=await local().collection("events").findOne({_id:objectId(body.event),business});
   if(!event)throw new Error("Event is not assigned to this business.");
   menus=event.menuAssignments||[];
  }else menus=(body.menus||[]).map(menu=>typeof menu==="object"?menu:{menu,guests:body.guests});
  if(!menus.length)throw new Error("Select at least one business menu or event menu.");
  const recipes=[];
  for(const assignment of menus){
   const menu=await linkedMenu(assignment.menu,business);
   const guests=Number(assignment.guests||event?.guestCount||body.guests);
   if(!Number.isFinite(guests)||guests<=0)throw new Error("A positive guest count is required.");
   const menuLinks=await menuRecipes(menu,data);if(menuLinks.issues.length)throw new Error(menuLinks.issues.join(" "));
   for(const linked of menuLinks){
    const servings=Number(linked.recipe.servings);
    if(!Number.isFinite(servings)||servings<=0)throw new Error(`${linked.recipe.name}: record recipe servings before purchasing.`);
    recipes.push({recipe:linked.recipe,factor:guests*linked.servingsPerGuest/servings});
   }
  }
  return{recipes,event};
 };
 const selectedRecipeData=(data,recipeId)=>{
  if(!recipeId)return data;
  const recipe=data.recipes.find(item=>idOf(item)===idOf(recipeId));if(!recipe)throw new Error("Selected recipe was not found for this business.");
  const ingredients=new Set((recipe.ingredients||[]).map(line=>idOf(line.ingredient)));
  const costing=data.costings.find(item=>idOf(item.recipe)===idOf(recipe));const used=new Set();
  const products=new Set((recipe.ingredients||[]).map(line=>{if(line.vendorIngredientPrice)return idOf(line.vendorIngredientPrice);const index=(costing?.ingredients||[]).findIndex((saved,i)=>!used.has(i)&&idOf(saved.ingredient)===idOf(line.ingredient)&&(!line.vendor||idOf(saved.vendor)===idOf(line.vendor)));if(index<0)return "";used.add(index);return idOf(costing.ingredients[index].vendorIngredientPrice);}).filter(Boolean));
  return{...data,recipes:[recipe],costings:data.costings.filter(item=>idOf(item.recipe)===idOf(recipe)),ingredients:data.ingredients.filter(item=>ingredients.has(idOf(item))),offers:data.offers.filter(item=>products.has(idOf(item)))};
 };
 router.get("/options",guard(async(req,res,business)=>{
  const data=selectedRecipeData(await recipeData(business),req.query.recipe);
  const menus=enableMenus?await menusDb().collection("menus").find({$or:[{business},{business:{$exists:false}},{business:null}]}).toArray():[];
  const inventory=enableMenus||enableEvents?await inventoryWithOrderReceipts(local(),business,true):[];
  const events=enableEvents?await local().collection("events").find({$or:[{business},{business:{$exists:false}},{business:null}]}).toArray():[];
  const menuItems=enableMenus?await menusDb().collection(menuItemCollection).find({$or:[{business},{business:{$exists:false}},{business:null}]}).toArray():[];
  const selected=data.recipes[0];
  const recipeIngredients=req.query.recipe?(selected.ingredients||[]).map(line=>{const ingredient=data.ingredients.find(item=>idOf(item)===idOf(line.ingredient));const vendor=data.vendors.find(item=>idOf(item)===idOf(line.vendor));const display=system=>{const quantity=line[`${system}Quantity`];const unit=data.records.find(item=>idOf(item)===idOf(line[`${system}Unit`]));return quantity===null||quantity===undefined||quantity===""?"":`${quantity} ${unit?.symbol||unit?.name||""}`.trim();};return{ingredient:idOf(line.ingredient),name:ingredient?.name||"Unknown ingredient",vendor:idOf(line.vendor),vendorName:vendor?.legalName||vendor?.name||"",offering:idOf(line.vendorIngredientPrice),quantity:[display("imperial"),display("metric")].filter(Boolean).join(" / ")||"Quantity not recorded"};}):[];
  const costReviews=req.query.recipe?[previewCosting(selected,data.costings.find(item=>idOf(item.recipe)===idOf(selected)),data.offers,data.records)]:[];
  res.json({recipeIngredients,costReviews,recipes:data.recipes.map(({_id,name,servings})=>({_id,name,servings})),ingredients:data.ingredients,allergens:data.allergens,offers:data.offers.map(offer=>({...offer,comparison:normalizeOffer(offer,data.records),vendorName:data.vendors.find(item=>idOf(item)===idOf(offer.vendor))?.legalName||"Vendor"})),vendors:data.vendors.filter(vendor=>data.offers.some(offer=>idOf(offer.vendor)===idOf(vendor))),menus,events,inventory,menuItems});
 }));
 router.get("/cost-review",guard(async(req,res,business)=>{
  const data=selectedRecipeData(await recipeData(business),req.query.recipe);
  res.json(data.recipes.map(recipe=>previewCosting(recipe,data.costings.find(item=>idOf(item.recipe)===idOf(recipe)),data.offers,data.records)));
 }));
 router.get("/prices/:id/history",guard(async(req,res,business)=>{
  const offer=await db().collection("vendor_ingredient_prices").findOne({_id:objectId(req.params.id),business});
  if(!offer)return res.status(404).json({message:"Offering not found for this business."});
  const versions=[...(offer.priceHistory||[]),priceSnapshot(offer)];const records=await unitRecords();
  res.json({offering:offer._id,vendor:offer.vendor,ingredient:offer.ingredient,versions:versions.map((version,index)=>{const current=normalizeOffer(version,records),previous=normalizeOffer(versions[index-1],records);const comparable=current&&previous&&current.dimension===previous.dimension;return{...version,...priceChange(versions[index-1]?.packCost,version.packCost),normalizedUnitCost:current?.normalizedUnitCost??null,baseUnit:current?.baseUnit||"",normalizedChange:comparable?priceChange(previous.normalizedUnitCost,current.normalizedUnitCost):{difference:null,percent:null}};})});
 }));
 router.get("/recipes/:id/allergens",guard(async(req,res,business)=>{
  const data=await recipeData(business);const recipe=data.recipes.find(item=>idOf(item)===req.params.id);
  if(!recipe)return res.status(404).json({message:"Recipe not found for this business."});
  res.json(recipeAssessment(recipe,data));
 }));
 router.post("/recipes/:id/allergen-review",guard(async(req,res,business)=>{
  const data=await recipeData(business);const recipe=data.recipes.find(item=>idOf(item)===req.params.id);
  if(!recipe)return res.status(404).json({message:"Recipe not found for this business."});
  const assessment=recipeAssessment(recipe,data);
  if(assessment.reviewRequired)throw new Error("Resolve missing, unknown, expired, or unverified declarations before verification.");
  if(req.body.fingerprint!==assessment.fingerprint)throw new Error("Assessment inputs changed. Reassess before review.");
  const reviewer=String(req.body.reviewer||"").trim();if(!reviewer)throw new Error("Reviewer name is required.");
  const review={fingerprint:assessment.fingerprint,reviewer,reviewedAt:new Date(),notes:String(req.body.notes||"")};
  const result=await db().collection("recipes").updateOne({_id:recipe._id,business,updatedAt:recipe.updatedAt},{$set:{allergenReview:review},$push:{allergenReviewHistory:review}});
  if(!result.matchedCount)throw new Error("Recipe changed during review. Reassess and try again.");
  res.json(review);
 }));
 router.put("/allergens/:kind/:id",guard(async(req,res,business)=>{
  const collection=req.params.kind==="ingredient"?"ingredients":req.params.kind==="offering"?"vendor_ingredient_prices":null;
  if(!collection)throw new Error("Choose ingredient or offering.");
  const query={_id:objectId(req.params.id),...(collection==="vendor_ingredient_prices"?{business}:{})};
  const existing=await db().collection(collection).findOne(query);
  if(!existing)return res.status(404).json({message:"Ingredient or offering not found."});
  if(!Array.isArray(req.body.declarations))throw new Error("Allergen declarations must be an array.");
  const catalog=await db().collection("allergens").find({isActive:{$ne:false}}).toArray();const seen=new Set();
  const declarations=req.body.declarations.map(item=>{
   const allergen=objectId(item.allergen);
   if(!catalog.some(record=>idOf(record)===idOf(allergen))||seen.has(idOf(allergen)))throw new Error("Allergen must be unique and present in the existing catalog.");seen.add(idOf(allergen));
   if(!["present","cross_contact","absent","unknown"].includes(item.status))throw new Error("Invalid allergen declaration status.");
   const declaration={allergen,status:item.status,source:String(item.source||"").trim(),verifiedBy:String(item.verifiedBy||"").trim(),verifiedAt:item.verifiedAt?new Date(item.verifiedAt):null,expiresAt:item.expiresAt?new Date(item.expiresAt):null,notes:String(item.notes||"")};
   if(declaration.verifiedAt&&(!declaration.source||!declaration.verifiedBy||!Number.isFinite(declaration.verifiedAt.getTime())||declaration.verifiedAt>new Date()))throw new Error("Verification requires a source, reviewer, and valid date.");
   if(declaration.expiresAt&&!Number.isFinite(declaration.expiresAt.getTime()))throw new Error("Invalid declaration expiry date.");
   return declaration;
  });
  const information={declarations,version:Number(existing.allergenInformation?.version||0)+1,updatedAt:new Date()};
  const filter={...query,"allergenInformation.version":existing.allergenInformation?.version??{$exists:false}};
  const update={$set:{allergenInformation:information,updatedAt:new Date()},$push:{allergenHistory:{...(existing.allergenInformation||{declarations:[]}),recordedAt:new Date()}}};
  const result=await db().collection(collection).updateOne(filter,update);
  if(!result.matchedCount)throw new Error("Declaration changed during editing. Reload and try again.");
  const affectedFilter=collection==="ingredients"?{"ingredients.ingredient":existing._id}:{$or:[{"ingredients.vendorIngredientPrice":existing._id},{_id:{$in:(await db().collection("recipe_costings").find({business,"ingredients.vendorIngredientPrice":existing._id}).toArray()).map(item=>item.recipe)}}]};
  const affected=await db().collection("recipes").find({business,...affectedFilter}).project({_id:1,name:1}).toArray();
  res.json({allergenInformation:information,affectedRecipes:affected});
 }));
 router.get("/allergens/:kind/:id/history",guard(async(req,res,business)=>{
  const collection=req.params.kind==="ingredient"?"ingredients":req.params.kind==="offering"?"vendor_ingredient_prices":null;
  if(!collection)throw new Error("Choose ingredient or offering.");
  const record=await db().collection(collection).findOne({_id:objectId(req.params.id),...(collection==="vendor_ingredient_prices"?{business}:{})});
  if(!record)return res.status(404).json({message:"Record not found."});res.json({current:record.allergenInformation||null,history:record.allergenHistory||[]});
 }));
 if(enableMenus){
  router.put("/menu-items/:id/recipe",guard(async(req,res,business)=>{
   const item=await menusDb().collection(menuItemCollection).findOne({_id:objectId(req.params.id)});
   if(!item||item.business&&!scoped(item,business))throw new Error("Menu item belongs to another business or does not exist.");
   const menu=await linkedMenu(req.body.menu,business);if(item.menu&&idOf(item.menu)!==idOf(menu))throw new Error("Preserve the menu item existing menu assignment.");
   const recipe=await db().collection("recipes").findOne({_id:objectId(req.body.recipe),business,isActive:{$ne:false}});if(!recipe)throw new Error("Recipe is not assigned to this business.");
   const servingsPerGuest=Number(req.body.servingsPerGuest||1);if(!Number.isFinite(servingsPerGuest)||servingsPerGuest<=0)throw new Error("Servings per guest must be positive.");
   const result=await menusDb().collection(menuItemCollection).updateOne({_id:item._id,business:item.business===undefined?{$exists:false}:item.business},{$set:{business,menu:menu._id,recipe:recipe._id,servingsPerGuest,updatedAt:new Date()}});if(!result.matchedCount)throw new Error("Menu item changed during editing.");res.json({menu:menu._id,recipe:recipe._id,servingsPerGuest});
  }));
  router.put("/menus/:id/recipes",guard(async(req,res,business)=>{
   const menu=await menusDb().collection("menus").findOne({_id:objectId(req.params.id)});
   if(!menu||menu.business&&!scoped(menu,business))throw new Error("Menu belongs to another business or does not exist.");
   const assignments=req.body.recipeAssignments;if(!Array.isArray(assignments))throw new Error("Recipe assignments must be an array.");
   const seen=new Set();const recipes=await db().collection("recipes").find({business,isActive:{$ne:false}}).toArray();
   const recipeAssignments=assignments.map(item=>{
    const recipe=objectId(item.recipe);const servingsPerGuest=Number(item.servingsPerGuest);
    if(!recipes.some(record=>idOf(record)===idOf(recipe))||seen.has(idOf(recipe)))throw new Error("Choose unique recipes assigned to this business.");seen.add(idOf(recipe));
    if(!Number.isFinite(servingsPerGuest)||servingsPerGuest<=0)throw new Error("Servings per guest must be positive.");return{recipe,servingsPerGuest};
   });
   const updated=await menusDb().collection("menus").updateOne({_id:menu._id,business:menu.business===undefined?{$exists:false}:menu.business},{$set:{business,recipeAssignments,updatedAt:new Date()}});
   if(!updated.matchedCount)throw new Error("Menu changed during editing. Reload and try again.");res.json({business,recipeAssignments});
  }));
  router.get("/menus/:id/allergens",guard(async(req,res,business)=>{
   const data=await recipeData(business);const menu=await linkedMenu(req.params.id,business);
   const linked=await menuRecipes(menu,data);const assessment=aggregateAssessments(linked.map(({recipe,menuItem,dishName})=>({...recipeAssessment(recipe,data),menuItem,dishName})));res.json({...assessment,issues:linked.issues,reviewRequired:assessment.reviewRequired||linked.issues.length>0,reviewCurrent:assessment.reviewCurrent&&!linked.issues.length,menu:menu._id,name:menu.name});
  }));
 }
 if(enableEvents){
  router.put("/inventory/:id/ingredient",guard(async(req,res,business)=>{
   const record=await local().collection("inventory").findOne({_id:objectId(req.params.id)});
   if(!record||record.business&&!scoped(record,business))throw new Error("Inventory belongs to another business or does not exist.");
   const ingredient=objectId(req.body.ingredient);if(!await db().collection("ingredients").findOne({_id:ingredient}))throw new Error("Ingredient not found.");
   const result=await local().collection("inventory").updateOne({_id:record._id,business:record.business===undefined?{$exists:false}:record.business},{$set:{business,ingredient}});if(!result.matchedCount)throw new Error("Inventory changed during editing.");res.json({business,ingredient});
  }));
  router.put("/events/:id/menus",guard(async(req,res,business)=>{
   const event=await local().collection("events").findOne({_id:objectId(req.params.id)});
   if(!event||event.business&&!scoped(event,business))throw new Error("Event belongs to another business or does not exist.");
   if(!Array.isArray(req.body.menuAssignments))throw new Error("Menu assignments must be an array.");
   const menuAssignments=[];const seen=new Set();
   for(const assignment of req.body.menuAssignments){const menu=await linkedMenu(assignment.menu,business);const guests=Number(assignment.guests||event.guestCount);if(seen.has(idOf(menu))||!Number.isFinite(guests)||guests<=0)throw new Error("Choose unique menus with a positive guest count.");seen.add(idOf(menu));menuAssignments.push({menu:menu._id,guests});}
   const customerAllergens=(req.body.customerAllergens||[]).map(objectId);const catalog=await db().collection("allergens").find({_id:{$in:customerAllergens}}).toArray();if(catalog.length!==customerAllergens.length)throw new Error("Choose customer allergies from the existing catalog.");
   const result=await local().collection("events").updateOne({_id:event._id,business:event.business===undefined?{$exists:false}:event.business},{$set:{business,menuAssignments,customerAllergens,updatedAt:new Date()}});
   if(!result.matchedCount)throw new Error("Event changed during editing. Reload and try again.");res.json({business,menuAssignments,customerAllergens});
  }));
  const eventAssessment=async(eventId,business)=>{
   const data=await recipeData(business);const selected=await selection({event:eventId},business,data);
   const assessments=selected.recipes.map(({recipe})=>recipeAssessment(recipe,data));const assessment=aggregateAssessments(assessments);
   const conflicts=allergyConflicts(assessment,selected.event.customerAllergens||[]);
   return{...assessment,event:selected.event._id,conflicts,allergyNotes:selected.event.allergies||"",reviewRequired:assessment.reviewRequired||Boolean(selected.event.allergies)||conflicts.length>0,fingerprint:fingerprint(JSON.stringify({recipes:assessments.map(item=>item.fingerprint),quantities:selected.recipes.map(item=>item.factor),assignments:selected.event.menuAssignments,allergies:selected.event.customerAllergens,notes:selected.event.allergies})),snapshots:selected.event.allergenSnapshots||[]};
  };
  router.get("/events/:id/allergens",guard(async(req,res,business)=>res.json(await eventAssessment(req.params.id,business))));
  router.post("/events/:id/allergen-snapshot",guard(async(req,res,business)=>{
   const assessment=await eventAssessment(req.params.id,business);const reviewer=String(req.body.reviewer||"").trim();if(!reviewer)throw new Error("Reviewer name is required.");if(req.body.fingerprint!==assessment.fingerprint)throw new Error("Assessment changed. Reload before recording a snapshot.");
   const snapshot={...assessment,snapshots:undefined,reviewer,recordedAt:new Date()};
   await local().collection("events").updateOne({_id:objectId(req.params.id),business},{$push:{allergenSnapshots:snapshot}});res.status(201).json(snapshot);
  }));
  router.post("/purchasing/compare",guard(async(req,res,business)=>{
   const data=await recipeData(business);const selected=await selection(req.body,business,data);
   const consolidated=consolidateRequirements(selected.recipes,data.records);
   const inventory=req.body.useInventory===false?[]:await inventoryWithOrderReceipts(local(),business);
   const comparison=purchasingComparison({...consolidated,offers:data.offers,vendors:data.vendors,inventory,business,manual:req.body.manual||{},records:data.records});
   for(const line of comparison.lines)line.name=data.ingredients.find(item=>idOf(item)===line.ingredient)?.name||line.ingredient;
   for(const plan of [...comparison.singleVendor,comparison.multipleVendor,comparison.manualPlan].filter(Boolean)){
    for(const order of plan.orders)for(const line of order.lines)line.name=data.ingredients.find(item=>idOf(item)===line.ingredient)?.name||line.ingredient;
    if(consolidated.issues.length){plan.complete=false;plan.total=null;}
   }
   res.json({...comparison,issues:consolidated.issues,reviewRequired:comparison.reviewRequired||consolidated.issues.length>0,csv:{manual:purchasingCsv(comparison.manualPlan),multiple:comparison.multipleVendor?purchasingCsv(comparison.multipleVendor):null}});
  }));
  router.put("/vendors/:id/terms",guard(async(req,res,business)=>{
   const vendor=objectId(req.params.id);if(!await db().collection("vendor_ingredient_prices").findOne({business,vendor}))throw new Error("Vendor has no offerings for this business.");
   const vendorRecord=await db().collection("vendors").findOne({_id:vendor});if(!vendorRecord)throw new Error("Vendor record not found.");
   if(Number(vendorRecord.ordering?.minimumOrderQty||0)>0&&(req.body.minimumPacks===undefined||req.body.minimumPacks===null||req.body.minimumPacks===""))throw new Error("Confirm the existing minimum order quantity in whole packs.");
   if(Number(vendorRecord.ordering?.orderMultiple||1)>1&&(req.body.packMultiple===undefined||req.body.packMultiple===null||req.body.packMultiple===""))throw new Error("Confirm the existing ordering multiple in whole packs.");
   const minimumOrder=Number(req.body.minimumOrder),deliveryCost=Number(req.body.deliveryCost),minimumPacks=Number(req.body.minimumPacks||0),packMultiple=Number(req.body.packMultiple||1);if(!Number.isFinite(minimumOrder)||!Number.isFinite(deliveryCost)||minimumOrder<0||deliveryCost<0||!Number.isInteger(minimumPacks)||minimumPacks<0||!Number.isInteger(packMultiple)||packMultiple<1)throw new Error("Minimum order and delivery cost must be nonnegative.");
   await db().collection("vendors").updateOne({_id:vendor},{$set:{[`purchasingTermsByBusiness.${idOf(business)}`]:{minimumOrder,deliveryCost,minimumPacks,packMultiple,updatedAt:new Date()}}});res.json({minimumOrder,deliveryCost,minimumPacks,packMultiple});
  }));
 }
 return router;
};

