import {isNonIngredientLine,asLabelLine} from "./ingredientRows.js";
import {idOf,measurements,normalizeOffer,unitDefinition} from "./pricing.js";
export const consolidateRequirements=(recipes,records=[])=>{
 const grouped=new Map();const issues=[];
 for(const {recipe,factor=1} of recipes){
  if(!Number.isFinite(Number(factor))||Number(factor)<=0)throw new Error("Recipe scaling factor must be positive.");
  for(const line of recipe.ingredients||[]){
   if(isNonIngredientLine(line))continue;
   const measure=measurements(line,records)[0];
   if(!measure){issues.push(`${recipe.name}: ingredient ${idOf(line.ingredient)} needs a measured quantity.`);continue;}
   const key=`${idOf(line.ingredient)}:${measure.dimension}`;
   const entry=grouped.get(key)||{key,ingredient:idOf(line.ingredient),dimension:measure.dimension,baseUnit:measure.baseUnit,requiredQuantity:0,recipes:[]};
   entry.requiredQuantity+=measure.baseQuantity*Number(factor);entry.recipes.push(idOf(recipe));grouped.set(key,entry);
  }
 }
 return{requirements:[...grouped.values()],issues};
};
export const purchasingComparison=({requirements,offers,inventory=[],vendors=[],business,manual={},records=[],maxCombinations=50000})=>{
 const lines=requirements.map(requirement=>{
  const inStock=inventory.filter(item=>idOf(item.business)===idOf(business)&&idOf(item.ingredient)===requirement.ingredient).reduce((sum,item)=>{
   const unit=unitDefinition(item.unit,records);return sum+(unit?.dimension===requirement.dimension?Math.max(0,Number(item.quantityOnHand||0)-Number(item.committedQuantity||0))*unit.factor:0);
  },0);
  const neededQuantity=Math.max(0,requirement.requiredQuantity-inStock);
  const choices=offers.filter(offer=>offer.isActive!==false&&idOf(offer.business)===idOf(business)&&idOf(offer.ingredient)===requirement.ingredient).flatMap(offer=>{
   const pack=normalizeOffer(offer,records);
   if(!pack||pack.dimension!==requirement.dimension||vendors.find(vendor=>idOf(vendor)===idOf(offer.vendor))?.isActive===false)return[];
   const multiple=Number(vendors.find(vendor=>idOf(vendor)===idOf(offer.vendor))?.purchasingTerms?.packMultiple||1);
   const packs=Math.ceil(Math.max(0,neededQuantity/pack.baseQuantity-1e-10)/multiple)*multiple;
   if(offer.availablePacks!==null&&offer.availablePacks!==undefined&&Number(offer.availablePacks)<packs)return[];
   return[{offering:idOf(offer),vendor:idOf(offer.vendor),product:[offer.brand,offer.sku,offer.packSizeName].filter(Boolean).join(" · "),packs,packQuantity:pack.baseQuantity,packCost:pack.packCost,purchaseCost:packs*pack.packCost,purchasedQuantity:packs*pack.baseQuantity,availabilityKnown:offer.availablePacks!==null&&offer.availablePacks!==undefined,preferred:Boolean(offer.isPreferred)}];
  }).sort((a,b)=>a.purchaseCost-b.purchaseCost);
  return{...requirement,inventoryQuantity:Math.min(inStock,requirement.requiredQuantity),neededQuantity,choices};
 });
 const plan=(selected,label)=>{
  const orders=new Map();const missing=[];
  lines.forEach((line,index)=>{
   if(line.neededQuantity===0)return;
   const choice=selected[index];if(!choice){missing.push(line.key);return;}
   const vendor=vendors.find(item=>idOf(item)===choice.vendor);
   const order=orders.get(choice.vendor)||{vendor:choice.vendor,name:vendor?.legalName||vendor?.name||choice.vendor,subtotal:0,deliveryCost:Number(vendor?.purchasingTerms?.deliveryCost||0),minimumOrder:Number(vendor?.purchasingTerms?.minimumOrder||0),termsKnown:vendor?.purchasingTerms?.deliveryCost!==null&&vendor?.purchasingTerms?.deliveryCost!==undefined,minimumPacks:Number(vendor?.purchasingTerms?.minimumPacks||0),quantityTermsUnresolved:Boolean(vendor?.purchasingTerms?.quantityMinimumUnresolved||vendor?.purchasingTerms?.orderMultipleUnresolved),lines:[]};
   order.subtotal+=choice.purchaseCost;order.lines.push({...line,...choice,choices:undefined});orders.set(choice.vendor,order);
  });
  const values=[...orders.values()].map(order=>({...order,total:order.subtotal+order.deliveryCost,minimumMet:order.subtotal>=order.minimumOrder&&order.lines.reduce((sum,line)=>sum+line.packs,0)>=order.minimumPacks&&!order.quantityTermsUnresolved}));
  const complete=!missing.length&&values.every(order=>order.minimumMet);
  return{label,complete,missing,orders:values,total:complete?values.reduce((sum,order)=>sum+order.total,0):null};
 };
 const vendorIds=[...new Set(lines.flatMap(line=>line.choices.map(choice=>choice.vendor)))];
 const singleVendor=vendorIds.map(vendor=>plan(lines.map(line=>line.choices.find(choice=>choice.vendor===vendor)),"One vendor")).sort((a,b)=>(a.total??Infinity)-(b.total??Infinity));
 const candidates=lines.map(line=>line.neededQuantity===0?[null]:manual[line.key]?line.choices.filter(choice=>choice.offering===manual[line.key]):line.choices);
 let searched=0;let best=null;let searchComplete=true;
 const visit=(index,selected)=>{
  if(searched>=maxCombinations){searchComplete=false;return;}
  if(index===lines.length){searched++;const option=plan(selected,"Multiple vendors");if(option.complete&&(!best||option.total<best.total))best=option;return;}
  for(const choice of candidates[index]){visit(index+1,[...selected,choice]);if(!searchComplete)return;}
 };
 if(lines.length<=100)visit(0,[]);else searchComplete=false;
 const manualPlan=plan(lines.map(line=>line.choices.find(choice=>choice.offering===manual[line.key])||(!manual[line.key]?line.choices[0]:null)),"Manual selections");
 return{lines,singleVendor,multipleVendor:best,manualPlan,searchComplete,searched,reviewRequired:!best||!searchComplete||lines.some(line=>line.choices.some(choice=>!choice.availabilityKnown))||[...(best?.orders||[])].some(order=>!order.termsKnown)};
};
export const purchasingCsv=plan=>{
 const escape=value=>'"'+String(value??"").replace(/"/g,'""').replace(/^[=+@\-]/,"'$&")+'"';
 const rows=[["Vendor","Ingredient","Product","Required quantity","Inventory used","Base unit","Packs","Pack quantity","Pack cost","Line cost","Delivery cost","Order total"]];
 for(const order of plan.orders||[])for(const [index,line] of order.lines.entries())rows.push([order.name,line.name||line.ingredient,line.product,line.requiredQuantity,line.inventoryQuantity,line.baseUnit,line.packs,line.packQuantity,line.packCost,line.purchaseCost,index===0?order.deliveryCost:"",index===0?order.total:""]);
 return rows.map(row=>row.map(escape).join(",")).join("\r\n");
};
