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

export const isUsableIngredientName=value=>{
 const original=String(value?.name||value?.ingredientName||value?.displayName||value||"").trim();
 const display=ingredientDisplayName(value);
 if(!display||display.length<2)return false;
 if((original.match(/\(/g)||[]).length!==(original.match(/\)/g)||[]).length)return false;
 if(/^(?:[-–—_|]+|\d+(?:\.\d+)?(?:\s*[-–—])?)$/.test(display))return false;
 if(/\b(?:prep time|cook time|chill time|rest time|flavor profile|recipe name|instructions?)\s*:/i.test(display))return false;
 return /[a-z]/i.test(display);
};
