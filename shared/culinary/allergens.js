import {isNonIngredientLine,asLabelLine} from "./ingredientRows.js";
import {idOf} from "./pricing.js";
const rank={absent:0,unknown:1,cross_contact:2,present:3};
export const declarationStatus=(record,allergen,now=new Date())=>{
 const declaration=record?.allergenInformation?.declarations?.find(item=>idOf(item.allergen)===idOf(allergen));
 if(!declaration)return{status:"unknown",verified:false,issue:"No declaration"};
 const date=new Date(declaration.verifiedAt);
 const expired=declaration.expiresAt&&new Date(declaration.expiresAt)<=now;
 const verified=Boolean(declaration.verifiedBy&&declaration.source&&Number.isFinite(date.getTime())&&date<=now&&!expired);
 const status=rank[declaration.status]!==undefined?declaration.status:"unknown";
 return{...declaration,status:status==="absent"&&!verified?"unknown":status,verified,issue:verified?"":"Declaration requires verification"};
};
export const assessRecipe=(recipe,ingredients,offers,allergens,now=new Date())=>{
 const issues=[];
 if(!allergens.length)issues.push("Allergen catalog is missing.");
 if(!recipe.ingredients?.length)issues.push("Recipe has no ingredient assessment inputs.");
 const lines=(recipe.ingredients||[]).filter(line=>!isNonIngredientLine(line)).map(line=>{
  const ingredient=ingredients.find(item=>idOf(item)===idOf(line.ingredient));
  const offer=line.vendorIngredientPrice?offers.find(item=>idOf(item)===idOf(line.vendorIngredientPrice)&&idOf(item.ingredient)===idOf(line.ingredient)&&idOf(item.business)===idOf(recipe.business)&&item.isActive!==false):null;
  const sources=[ingredient,...(line.vendorIngredientPrice?[offer]:[])];
  if(!ingredient)issues.push(`Ingredient ${idOf(line.ingredient)} is missing.`);
  if(!offer)issues.push(`${ingredient?.name||idOf(line.ingredient)}: supplier product is unspecified or unavailable.`);
  const risks=allergens.map(allergen=>{
   const declarations=sources.map(source=>declarationStatus(source,allergen,now));
   const status=declarations.reduce((result,item)=>rank[item.status]>rank[result]?item.status:result,"absent");
   return{allergen:idOf(allergen),name:allergen.name,status,verified:declarations.every(item=>item.verified&&item.status!=="unknown"),sources:declarations};
  });
  return{ingredient:idOf(line.ingredient),name:ingredient?.name||"Unknown ingredient",offering:idOf(line.vendorIngredientPrice),sourceVersion:{ingredient:ingredient?.allergenInformation?.version||0,product:offer?.allergenInformation?.version||0,brand:offer?.brand||"",sku:offer?.sku||"",itemCode:offer?.itemCode||"",pack:offer?.packSizeName||""},risks};
 });
 const risks=allergens.map(allergen=>{
  const manual=(recipe.allergens||[]).some(item=>idOf(item)===idOf(allergen));
  const values=lines.map(line=>line.risks.find(item=>item.allergen===idOf(allergen)));
  const status=manual?"present":values.reduce((result,item)=>rank[item.status]>rank[result]?item.status:result,"absent");
  return{allergen:idOf(allergen),name:allergen.name,emoji:allergen.emoji||"",status:values.length?status:manual?"present":"unknown",manual,verified:values.length>0&&values.every(item=>item.verified)};
 });
 const reviewRequired=issues.length>0||risks.some(item=>!item.verified||item.status==="unknown");
 const inputs={recipe:idOf(recipe),business:idOf(recipe.business),manual:(recipe.allergens||[]).map(idOf).sort(),lines:lines.map(line=>({ingredient:line.ingredient,offering:line.offering,sourceVersion:line.sourceVersion,risks:line.risks})),issues};
 return{recipe:idOf(recipe),name:recipe.name,risks,lines,issues,reviewRequired,inputSignature:JSON.stringify(inputs),assessedAt:now};
};
export const aggregateAssessments=assessments=>{
 const risks=new Map();
 for(const assessment of assessments)for(const risk of assessment.risks){const old=risks.get(risk.allergen);if(!old||rank[risk.status]>rank[old.status])risks.set(risk.allergen,risk);}
 return{risks:[...risks.values()],recipes:assessments,reviewCurrent:assessments.length>0&&assessments.every(item=>item.reviewCurrent&&!item.reviewRequired),reviewRequired:!assessments.length||assessments.some(item=>item.reviewRequired||!item.reviewCurrent)};
};
export const allergyConflicts=(assessment,allergyIds=[])=>assessment.risks.filter(risk=>allergyIds.map(idOf).includes(risk.allergen)&&risk.status!=="absent").map(risk=>({...risk,conflict:risk.status==="present"?"Confirmed presence":risk.status==="cross_contact"?"Possible cross-contact":"Unknown exposure; review required"}));
