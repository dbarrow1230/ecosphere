const trailingSeparators=/\s+(?:[-–—]+\s*)+$/;
const leadingLooseMeasurement=/^\s*(?:\d+(?:\.\d+)?|\d+\s+\d+\/\d+|\d+\/\d+)(?:\s*[-–]\s*\d+(?:\.\d+)?)?\s*(?:fl\.?\s*oz(?:s|\.|unces?)?|oz(?:s|\.|unces?)?|lb(?:s|\.|pounds?)?|g(?:rams?)?|kg|kilograms?|mg|milligrams?|ml|milliliters?|l|liters?|tsp\.?|teaspoons?|tbsp\.?|tablespoons?|cups?|pints?|quarts?|gallons?|sticks?|cans?|packages?|packets?|each|ea\.?|count|ct\.?)\b\s*/i;

const withoutLeadingRecipeQuantity=value=>{
 const text=String(value||"").trim();
 const match=text.match(/^\(([^)]*)\)\s*(.*)$/);
 if(!match||!/[0-9]/.test(match[1]))return text;
 return match[2].trim();
};

export const ingredientDisplayName=value=>withoutLeadingRecipeQuantity(
 value?.name||value?.ingredientName||value?.displayName||value||""
)
 .replace(leadingLooseMeasurement,"")
 .replace(trailingSeparators,"")
 .replace(/\s+/g," ")
 .trim();

export const ingredientIdentity=value=>ingredientDisplayName(value).toLocaleLowerCase();
