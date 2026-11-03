export const rowName=line=>String(line?.sourceName||line?.ingredient?.name||line?.ingredient?.ingredientName||line?.name||"").trim();
export const isNonIngredientLine=line=>{
 if(line?.isLabel||line?.isHeading||["label","heading","instruction"].includes(line?.rowType||line?.lineType||line?.ingredient?.recordType))return true;
 const hasQuantity=[line?.imperialQuantity,line?.metricQuantity].some(value=>value!==null&&value!==undefined&&value!=="");
 return !hasQuantity&&/^for (?:the\b|assembly\b|serving\b|garnish\b)/i.test(rowName(line));
};
export function asLabelLine(line){
 return {...(line._id?{_id:line._id}:{}),rowType:line.rowType==="instruction"?"instruction":"label",sourceName:rowName(line),preparation:line.preparation||"",time:line.time||"",note:line.note||""};
}
export function cleanIngredientName(value){
 let text=String(value||"").trim().replaceAll("½","1/2").replaceAll("¼","1/4").replaceAll("¾","3/4");
 text=text.replace(/^\(([^)]*)\)\s*/, (match,inside)=>/\d/.test(inside)?"":match);
 text=text.replace(/^\s*(?:\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)(?:\s*[-–]\s*\d+(?:\.\d+)?)?\s*(?:fl\.?\s*oz|oz|ounces?|lbs?|pounds?|grams?|g|kg|kilograms?|mg|ml|milliliters?|liters?|l|tsp\.?|teaspoons?|tbsp\.?|tablespoons?|cups?|pints?|quarts?|gallons?|sticks?|cans?|packages?|packets?|each|ea\.?|count|ct\.?)\b\s*/i,"");
 return text.replace(/\s*(?:[-–—]+\s*)+$/,"").replace(/\s+\d+(?:\.\d+)?\s*(?:min(?:utes?)?|sec(?:onds?)?)\s*$/i,"").replace(/\s+/g," ").trim();
}
