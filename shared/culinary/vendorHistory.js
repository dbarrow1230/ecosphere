import {vendorUnitCost} from "./vendorUnitCost.js";
import {isNonIngredientLine,asLabelLine} from "./ingredientRows.js";
import {costLine,idOf,measurements,priceChange} from "./pricing.js";
const priceFields=["packCost","unitCost","effectiveDate","imperialQuantity","imperialUnit","imperialDisplay","metricQuantity","metricUnit","metricDisplay","brand","sku","itemCode","packSizeName"];
const editableFields=["business","vendor","ingredient",...priceFields,"notes","isPreferred","isActive","availablePacks","productCategory","productCategoryPath"];
export const priceSnapshot=value=>Object.fromEntries(["business","vendor","ingredient",...priceFields].map(key=>[key,value[key]??null]));
export const pricePayload=body=>{const payload=Object.fromEntries(editableFields.filter(key=>Object.hasOwn(body,key)).map(key=>[key,key.endsWith("Unit")||key==="productCategory"?body[key]||null:body[key]]));const calculated=vendorUnitCost(payload);if(calculated&&body.unitCostOverride!==true)payload.unitCost=calculated.cost;return payload;};
export const buildPriceUpdate=(existing,body)=>{
 const payload=pricePayload(body);
 if(body.unitCostOverride!==true&&["packCost","imperialQuantity","imperialUnit","metricQuantity","metricUnit"].some(key=>Object.hasOwn(body,key))){const calculated=vendorUnitCost({...existing,...payload});if(calculated)payload.unitCost=calculated.cost;}
 const ingredientChanged=Object.hasOwn(payload,"ingredient")&&idOf(payload.ingredient)!==idOf(existing.ingredient);
 if(ingredientChanged&&body.reassignIngredient!==true)throw new Error("Select an existing ingredient explicitly to correct this offering link.");
 for(const key of ["business","vendor"]){if(Object.hasOwn(payload,key)&&idOf(payload[key])!==idOf(existing[key]))throw new Error("Create a separate offering to change its business, vendor, or ingredient. Existing product history must retain its identity.");}
 const changed=ingredientChanged||priceFields.some(key=>Object.hasOwn(payload,key)&&(key==="effectiveDate"?new Date(payload[key]).getTime()!==new Date(existing[key]).getTime():String(payload[key]??"")!==String(existing[key]??"")));
 if(changed)payload.effectiveDate=body.effectiveDate||new Date();
 if(changed&&!ingredientChanged&&new Date(payload.effectiveDate)<new Date(existing.effectiveDate)){
  const historical={...priceSnapshot({...existing,...payload}),recordedAt:new Date()};
  for(const key of priceFields)delete payload[key];
  return {$set:payload,$inc:{__v:1},$push:{priceHistory:historical}};
 }
 const update={$set:payload,$inc:{__v:1}};
 if(changed)update.$push={priceHistory:{...priceSnapshot(existing),recordedAt:new Date()}};
 if(ingredientChanged){update.$set.allergenInformation=null;if(existing.allergenInformation)update.$push.allergenHistory={...existing.allergenInformation,ingredient:existing.ingredient,recordedAt:new Date()};}
 return update;
};
export const updateVendorPrice=async(Model,recordId,body)=>{
 const existing=await Model.findById(recordId).lean();
 if(!existing)return null;
 if(body.reassignIngredient===true&&idOf(body.ingredient)!==idOf(existing.ingredient)){
  const ObjectId=Model.base.Types.ObjectId;const ingredient=await Model.db.collection("ingredients").findOne({_id:new ObjectId(idOf(body.ingredient)),$or:[{business:existing.business},{business:null},{business:{$exists:false}}]});
  if(!ingredient)throw new Error("Selected ingredient is missing or belongs to another business.");
 }
 const updated=await Model.findOneAndUpdate({_id:existing._id,__v:existing.__v??{$exists:false}},buildPriceUpdate(existing,body),{returnDocument:"after",runValidators:true});
 if(!updated)throw new Error("This offering changed during editing. Reload and try again.");
 return updated;
};
export const validateRecipePrices=async(connection,mongoose,source)=>{
 await connection.asPromise();
 const db=connection.db;
 const business=new mongoose.Types.ObjectId(idOf(source.business));
 const records=await Promise.all([db.collection("imperial_units").find({}).toArray(),db.collection("metric_units").find({}).toArray()]).then(values=>values.flat());
 const ingredients=[];
 for(const line of source.ingredients||[]){
  if(isNonIngredientLine(line)){ingredients.push(asLabelLine(line));continue;}
  const ingredient=await db.collection("ingredients").findOne({_id:new mongoose.Types.ObjectId(idOf(line.ingredient)),$or:[{business},{business:null},{business:{$exists:false}}]});
  if(!ingredient)throw new Error("Ingredient is missing or belongs to another business.");
  if(!line.vendorIngredientPrice){ingredients.push({...line,vendor:line.vendor||null,vendorIngredientPrice:null,priceSnapshot:null});continue;}
  const offer=await db.collection("vendor_ingredient_prices").findOne({_id:new mongoose.Types.ObjectId(idOf(line.vendorIngredientPrice)),business,ingredient:new mongoose.Types.ObjectId(idOf(line.ingredient)),isActive:{$ne:false}});
  if(!offer||line.vendor&&idOf(line.vendor)!==idOf(offer.vendor))throw new Error("Vendor product does not match the recipe business, ingredient, or vendor.");
  const vendor=await db.collection("vendors").findOne({_id:offer.vendor,isActive:{$ne:false}});if(!vendor)throw new Error("The selected vendor is inactive or missing.");
  const calculation=costLine(line,offer,records);
  if(calculation.error)throw new Error(calculation.error);
  ingredients.push({...line,vendor:offer.vendor,vendorIngredientPrice:offer._id,unitCost:calculation.unitCost,totalCost:calculation.totalCost,vendorPackCost:offer.packCost,vendorPackImperialDisplay:offer.imperialDisplay||"",vendorPackMetricDisplay:offer.metricDisplay||"",priceSnapshot:{...priceSnapshot(offer),capturedAt:new Date()}});
 }
 return ingredients;
};
export const previewCosting=(recipe,costing,offers,records=[])=>{
 const used=new Set();
 const sourceLines=(recipe.ingredients?.length?recipe.ingredients:costing?.ingredients||[]).filter(line=>!isNonIngredientLine(line)).map(line=>{
  const index=(costing?.ingredients||[]).findIndex((saved,i)=>!used.has(i)&&idOf(saved.ingredient)===idOf(line.ingredient)&&(!line.vendorIngredientPrice||idOf(saved.vendorIngredientPrice)===idOf(line.vendorIngredientPrice)));
  if(index<0)return line;used.add(index);return{...costing.ingredients[index],...line,vendorIngredientPrice:line.vendorIngredientPrice||costing.ingredients[index].vendorIngredientPrice,vendor:line.vendor||costing.ingredients[index].vendor,totalCost:costing.ingredients[index].totalCost};
 });
 const lines=sourceLines.map(line=>{
  const offer=offers.find(item=>idOf(item)===idOf(line.vendorIngredientPrice)&&idOf(item.business)===idOf(recipe.business)&&idOf(item.ingredient)===idOf(line.ingredient)&&item.isActive!==false);
  const calculation=offer?costLine(line,offer,records):{error:!line.vendor?"No vendor assigned — price unavailable.":!line.vendorIngredientPrice?"No vendor product selected — price unavailable.":"Selected product is unavailable; review required.",totalCost:null};
  const previous=Number(line.totalCost||0);
  return{ingredient:idOf(line.ingredient),vendor:idOf(line.vendor),offering:idOf(line.vendorIngredientPrice),previousCost:previous,estimatedCost:calculation.totalCost,...priceChange(previous,calculation.totalCost),issue:calculation.error||""};
 });
 const complete=lines.length>0&&lines.every(line=>!line.issue);
 const previousIngredientCost=Number(costing?.totals?.ingredientCost??lines.reduce((sum,line)=>sum+line.previousCost,0));
 const estimatedIngredientCost=complete?lines.reduce((sum,line)=>sum+line.estimatedCost,0):null;
 const difference=complete?estimatedIngredientCost-previousIngredientCost:null;
 const previousTotal=Number(costing?.totals?.totalCost??previousIngredientCost);
 const estimatedTotal=complete?previousTotal+difference:null;
 const recipeYield=measurements(costing?.yield||recipe.yield,records)[0]?.quantity||Number(recipe.servings)||0;
 const sellingPrice=Number(costing?.pricing?.suggestedPrice||0)||Number(costing?.pricing?.sellingPricePerYield||0)*recipeYield||Number(recipe.suggestedPrice||0);
 const target=Number(costing?.pricing?.foodCostPercent||costing?.pricing?.targetFoodCostPercent||0);
 return{recipe:idOf(recipe),name:recipe.name,business:idOf(recipe.business),lines,complete,reviewRequired:!complete||Math.abs(difference||0)>.005,previousIngredientCost,estimatedIngredientCost,previousTotal,estimatedTotal,difference,percent:priceChange(previousIngredientCost,estimatedIngredientCost).percent,costPerUnit:complete&&recipeYield>0?estimatedTotal/recipeYield:null,actualFoodCostPercent:complete&&sellingPrice>0?estimatedIngredientCost/sellingPrice*100:null,suggestedPrice:complete&&target>0?estimatedIngredientCost/(target/100):null};
};
export const costingSnapshot=value=>({business:value.business,recipe:value.recipe,ingredients:value.ingredients,totals:value.totals,pricing:value.pricing,yield:value.yield,recordedAt:new Date()});
