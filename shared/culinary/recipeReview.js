import {isNonIngredientLine,asLabelLine} from "./ingredientRows.js";
import {idOf} from "./pricing.js";
import {previewCosting} from "./vendorHistory.js";
export const recipeReviewOptions=(recipe,lookups={})=>{
 const lines=(recipe.ingredients||[]).filter(line=>!isNonIngredientLine(line));
 const ingredientIds=new Set(lines.map(line=>idOf(line.ingredient)));
 const productIds=new Set(lines.map(line=>idOf(line.vendorIngredientPrice)).filter(Boolean));
 const records=[...(lookups.imperialUnits||[]),...(lookups.metricUnits||[])];
 const ingredients=[...(lookups.ingredients||[]),...lines.map(line=>line.ingredient).filter(value=>value&&typeof value==="object")].filter((item,index,items)=>ingredientIds.has(idOf(item))&&items.findIndex(value=>idOf(value)===idOf(item))===index);
 const offers=(lookups.vendorIngredientPrices||[]).filter(offer=>productIds.has(idOf(offer))&&idOf(offer.business)===idOf(recipe.business)).map(offer=>({...offer,vendorName:offer.vendor?.legalName||offer.vendor?.name||(lookups.vendors||[]).find(vendor=>idOf(vendor)===idOf(offer.vendor))?.legalName||"Vendor"}));
 const recipeIngredients=lines.map(line=>{
  const product=offers.find(offer=>idOf(offer)===idOf(line.vendorIngredientPrice));
  const vendorId=idOf(line.vendor||product?.vendor);
  const vendor=(lookups.vendors||[]).find(item=>idOf(item)===vendorId);
  const measurement=system=>{const quantity=line[`${system}Quantity`];const value=line[`${system}Unit`];const unit=value&&typeof value==="object"?value:records.find(item=>idOf(item)===idOf(value));return quantity===null||quantity===undefined||quantity===""?"":`${quantity} ${unit?.symbol||unit?.name||""}`.trim();};
  return{ingredient:idOf(line.ingredient),name:ingredients.find(item=>idOf(item)===idOf(line.ingredient))?.name||line.sourceName||"Unknown ingredient",vendor:vendorId,vendorName:vendor?.legalName||vendor?.name||product?.vendorName||"",offering:idOf(line.vendorIngredientPrice),quantity:[measurement("imperial"),measurement("metric")].filter(Boolean).join(" / ")||"Quantity not recorded"};
 });
 return{recipes:[{_id:idOf(recipe),name:recipe.name}],ingredients,offers,recipeIngredients,costReviews:[previewCosting(recipe,recipe.recipeCosting,offers,records)],allergens:lookups.allergens||[],vendors:lookups.vendors||[],menus:[],events:[],inventory:[],menuItems:[]};
};
