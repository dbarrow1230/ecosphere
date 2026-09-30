const parserVersion="recipe-text-v1";

const cleanLine=value=>String(value||"")
 .replace(/^[^\w#$~]+/u,"")
 .replace(/\s+/g," ")
 .trim();

const normalizeHeader=value=>cleanLine(value)
 .toLowerCase()
 .replace(/\(.*?\)/g,"")
 .replace(/[^a-z0-9]+/g," ")
 .trim();

const getValueAfterLabel=(text,label)=>{
 const escaped=label.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
 const match=String(text||"").match(new RegExp(`^${escaped}(?:\\s*\\([^)]*\\))?\\s*:?[ \\t]*(.+)$`,"im"));
 return match?.[1]?.trim()||"";
};

const getBlock=(text,startLabels,endLabels=[])=>{
 const lines=String(text||"").split(/\r?\n/);
 const startIndex=lines.findIndex(line=>startLabels.includes(normalizeHeader(line)));
 if(startIndex<0)return "";

 const endIndex=lines.findIndex((line,index)=>index>startIndex&&endLabels.includes(normalizeHeader(line)));
 const slice=lines.slice(startIndex+1,endIndex<0?lines.length:endIndex);
 return slice.join("\n").trim();
};

const splitBullets=block=>String(block||"")
 .split(/\r?\n/)
 .map(line=>cleanLine(line.replace(/^[•*-]\s*/,"")))
 .filter(Boolean);

const splitLines=block=>String(block||"")
 .split(/\r?\n+/)
 .map(line=>cleanLine(line))
 .filter(Boolean);

const splitListItems=block=>splitLines(block)
 .flatMap(line=>line.split(/(?<=[.!?])\s+(?=[A-Z0-9])/))
 .map(cleanLine)
 .filter(Boolean);

const parseQuantity=value=>{
 const display=cleanLine(value);
 const mixed=display.match(/^(\d+)\s+(\d+)\/(\d+)\b/);
 if(mixed)return Number(mixed[1])+Number(mixed[2])/Number(mixed[3]);

 const fraction=display.match(/^(\d+)\/(\d+)\b/);
 if(fraction)return Number(fraction[1])/Number(fraction[2]);

 const decimal=display.match(/^(\d+(?:\.\d+)?)/);
 return decimal?Number(decimal[1]):null;
};

const parseUnitName=value=>{
 const display=cleanLine(value);
 return display
  .replace(/^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)\s*/,"")
  .trim();
};

const parseTableRows=block=>{
 return String(block||"")
  .split(/\r?\n/)
  .map(line=>line.trim())
  .filter(Boolean)
  .filter(line=>!/^[-\s|]+$/.test(line))
  .map(line=>line.split(/\t+|\s{2,}|\s*\|\s*/).map(cell=>cleanLine(cell)))
  .filter(cells=>cells.length>1);
};

const parseHaccp=block=>parseTableRows(block)
 .filter(cells=>!/^haccp code/i.test(cells[0]||""))
 .map(cells=>({
  code:cells[0]||"",
  description:cells.slice(1).join(" ")
 }))
 .filter(row=>row.code&&row.description);

const parseCcp=block=>parseTableRows(block)
 .filter(cells=>!/^ccp code/i.test(cells[0]||""))
 .map(cells=>({
  code:cells[0]||"",
  criticalControlPoint:cells[1]||"",
  hazard:cells[2]||"",
  criticalLimit:cells[3]||"",
  monitoring:cells[4]||"",
  correctiveAction:cells[5]||"",
  verification:cells[6]||"",
  records:cells.slice(7).join(" ")
 }))
 .filter(row=>row.code&&row.criticalControlPoint);

const parseIngredients=block=>parseTableRows(block)
 .filter(cells=>!/^imperial/i.test(cells[0]||""))
 .map(cells=>{
  const [imperialDisplay="",metricDisplay="",ingredientName="",preparation="",time=""]=cells;
 return{
  ingredient:null,
   name:ingredientName,
   ingredientName,
   imperialQuantity:parseQuantity(imperialDisplay),
   imperialUnit:null,
   imperialUnitName:parseUnitName(imperialDisplay),
   imperialDisplay,
   metricQuantity:parseQuantity(metricDisplay),
   metricUnit:null,
   metricUnitName:parseUnitName(metricDisplay),
   metricDisplay,
   preparation:preparation==="-"||preparation==="—"?"":preparation,
   time:time==="-"||time==="—"?"":time,
   note:""
  };
 })
 .filter(row=>row.ingredientName);

const nutritionFieldMap={
 "calories":"calories",
 "total fat":"totalFat",
 "saturated fat":"saturatedFat",
 "trans fat":"transFat",
 "polyunsaturated fat":"polyunsaturatedFat",
 "monounsaturated fat":"monounsaturatedFat",
 "cholesterol":"cholesterol",
 "sodium":"sodium",
 "potassium":"potassium",
 "total carbohydrate":"totalCarbohydrate",
 "dietary fiber":"dietaryFiber",
 "sugars":"sugars",
 "protein":"protein",
 "vitamin a":"vitaminA",
 "vitamin b6":"vitaminB6",
 "vitamin b12":"vitaminB12",
 "vitamin c":"vitaminC",
 "vitamin d":"vitaminD",
 "vitamin e":"vitaminE",
 "calcium":"calcium",
 "magnesium":"magnesium",
 "iron":"iron"
};

const parseNutrition=block=>{
 const nutrition={};
 parseTableRows(block)
  .filter(cells=>!/^nutrient/i.test(cells[0]||""))
  .forEach(cells=>{
   const key=nutritionFieldMap[normalizeHeader(cells[0])];
   if(key)nutrition[key]=cells.slice(1).join(" ");
  });
 return nutrition;
};

const parseInstructions=block=>splitLines(block).map((instruction,index)=>({
 stepNumber:index+1,
 instruction,
 ccpRefs:[...instruction.matchAll(/\b(CCP\d+)\b/gi)].map(match=>match[1].toUpperCase())
}));

const parseYieldLike=value=>{
 const clean=cleanLine(value);
 const candidates=[clean.replace(/\([^)]*\)/g,"").trim(),...[...clean.matchAll(/\(([^)]*)\)/g)].map(match=>match[1])]
  .flatMap(part=>part.split(/\s*\/\s*/))
  .map(part=>part.trim())
  .filter(Boolean);
 const metricPattern=/(?:^|\s)(?:mg|g|kg|ml|l)(?:\s|$)/i;
 const imperialPattern=/(?:^|\s)(?:oz|ounce|ounces|lb|lbs|pound|pounds|cup|cups|tsp|tbsp|fl oz|pint|quart|gallon)(?:\s|$)/i;
 const metricDisplay=candidates.find(part=>metricPattern.test(part))||"";
 const imperialDisplay=candidates.find(part=>imperialPattern.test(part))||"";
 return{
  imperialDisplay,
  metricDisplay,
  imperialQuantity:parseQuantity(imperialDisplay),
  imperialUnit:null,
  imperialUnitName:parseUnitName(imperialDisplay),
  metricQuantity:parseQuantity(metricDisplay),
  metricUnit:null,
  metricUnitName:parseUnitName(metricDisplay)
 };
};
const parseServings=value=>Number((String(value||"").match(/\d+(?:\.\d+)?/)||[])[0]||0)||null;
const parseFlavorItems=value=>String(value||"").split(/\s*,\s*|\r?\n/).map(cleanLine).filter(Boolean);

const parseAllergens=text=>{
 const source=String(text||"");
 const sectionMatch=source.match(/(?:⚠️?\s*)?Allergen Disclaimers?\s*:?[\s\S]*$/i);
 const allergenBlock=sectionMatch?.[0]||source;
 const canonical={egg:"Eggs",eggs:"Eggs",peanut:"Peanuts",peanuts:"Peanuts",milk:"Milk",wheat:"Wheat",gluten:"Gluten",soy:"Soybeans",soybean:"Soybeans",soybeans:"Soybeans",sesame:"Sesame",fish:"Fish",mustard:"Mustard",celery:"Celery",lupin:"Lupin",sulfite:"Sulfites",sulfites:"Sulfites"};
 return [...allergenBlock.matchAll(/(?:🥛|🥚|🌾|🥜|🥜|🫘|🐟|🦐|🦀|🥚|🌱|🧂)?\s*([A-Za-z][A-Za-z -]*?)\s*:(?:[^\r\n]*)/gu)]
  .map(match=>cleanLine(match[1]))
  .map(value=>canonical[value.toLowerCase()]||value)
  .filter((value,index,items)=>value&&items.indexOf(value)===index);
};

const buildUnresolvedMappings=recipe=>({
 cuisine:recipe.referenceNames.cuisine&&!recipe.cuisine?recipe.referenceNames.cuisine:"",
 course:recipe.referenceNames.course&&!recipe.course?recipe.referenceNames.course:"",
 category:recipe.referenceNames.category&&!recipe.category?recipe.referenceNames.category:"",
 dietaryConsiderations:recipe.dietaryConsiderationNames||[],
 equipment:recipe.equipmentNames||[],
 ingredients:recipe.ingredients.map(item=>({
  name:item.ingredientName,
  ingredient:item.ingredient,
  imperialUnitName:item.imperialUnitName,
  imperialUnit:item.imperialUnit,
  metricUnitName:item.metricUnitName,
  metricUnit:item.metricUnit
 }))
});

export const parseRecipeText=text=>{
 const sourceText=String(text||"").trim();

 const flavorBlock=getBlock(sourceText,["flavor profile"],["general description"]);
 const haccpBlock=getBlock(sourceText,["haccp table"],["ccp table"]);
 const ccpBlock=getBlock(sourceText,["ccp table"],["ingredients"]);
 const ingredientsBlock=getBlock(sourceText,["ingredients"],["instructions"]);
 const instructionsBlock=getBlock(sourceText,["instructions"],["plating"]);
 const nutritionBlock=getBlock(sourceText,["nutritional information"],[]);
 const equipmentNames=splitBullets(getBlock(sourceText,["equipment"],["haccp table"]));
 const dietaryConsiderationNames=getValueAfterLabel(sourceText,"Dietary Considerations")
  .split(/\s*,\s*/)
  .map(cleanLine)
  .filter(Boolean);

 const cuisineName=getValueAfterLabel(sourceText,"Cuisine");
 const courseName=getValueAfterLabel(sourceText,"Course");
 const categoryName=getValueAfterLabel(sourceText,"Category");
 const temperatureAdjustment=getValueAfterLabel(sourceText,"Fermentation Temperature Adjustment")||getValueAfterLabel(sourceText,"Room Temperature Adjustment");
 const cleanMouthfeel=getValueAfterLabel(flavorBlock,"Mouthfeel").split(/\s+(?:Fermentation|Room) Temperature Adjustment\s*:/i)[0].trim();

 const recipe={
  name:getValueAfterLabel(sourceText,"Recipe Name"),
  sourceName:getValueAfterLabel(sourceText,"Recipe Name"),
  cuisine:cuisineName,
  course:courseName,
  category:categoryName,
  dietaryConsiderations:[],
  referenceNames:{
   cuisine:cuisineName,
   course:courseName,
   category:categoryName,
   dietaryConsiderations:dietaryConsiderationNames
  },
  dietaryConsiderationNames,
  yield:parseYieldLike(/\bservings?\b/i.test(getValueAfterLabel(sourceText,"Yield"))?"":getValueAfterLabel(sourceText,"Yield")),
  servings:parseServings(getValueAfterLabel(sourceText,"Servings")||getValueAfterLabel(sourceText,"Yield")),
  servingSize:parseYieldLike(getValueAfterLabel(sourceText,"Serving Size")),
  servingSizeDescription:getValueAfterLabel(sourceText,"Serving Size"),
  times:{
   prepTime:getValueAfterLabel(sourceText,"Prep Time"),
   cookTime:getValueAfterLabel(sourceText,"Cook Time"),
   chillTime:getValueAfterLabel(sourceText,"Chill Time"),
   restTime:getValueAfterLabel(sourceText,"Rest Time")
  },
  flavorProfile:{
   taste:parseFlavorItems(getValueAfterLabel(flavorBlock,"Taste")),
   aroma:parseFlavorItems(getValueAfterLabel(flavorBlock,"Aroma")),
   mouthfeel:parseFlavorItems(cleanMouthfeel)
  },
  fermentationTemperatureAdjustment:temperatureAdjustment,
  generalDescription:getBlock(sourceText,["general description"],["suggested price"]),
  suggestedPrice:Number((getBlock(sourceText,["suggested price"],["menu description"]).match(/\$?(\d+(?:\.\d+)?)/)||[])[1]||0),
  suggestedPriceDisplay:cleanLine(getBlock(sourceText,["suggested price"],["menu description"])),
  menuDescription:getBlock(sourceText,["menu description"],["origins"]),
  origin:getBlock(sourceText,["origins"],["history"]),
  history:getBlock(sourceText,["history"],["cultural significance"]),
  culturalSignificance:getBlock(sourceText,["cultural significance"],["techniques"]),
  techniques:splitBullets(getBlock(sourceText,["techniques"],["equipment"])),
  equipment:[],
  equipmentNames,
  haccp:parseHaccp(haccpBlock),
  ccp:parseCcp(ccpBlock),
  ingredients:parseIngredients(ingredientsBlock),
  instructions:parseInstructions(instructionsBlock),
  plating:splitListItems(getBlock(sourceText,["plating"],["notes"])),
  notes:splitListItems(getBlock(sourceText,["notes"],["storage"])),
  storage:splitListItems(getBlock(sourceText,["storage"],["nutritional information"])),
  nutrition:parseNutrition(nutritionBlock),
  allergens:parseAllergens(sourceText),
  importMetadata:{
   sourceText,
   parserVersion,
   parsedAt:new Date()
  },
  isActive:true
 };

 return{
  recipe,
  unresolvedMappings:buildUnresolvedMappings(recipe)
 };
};

export default parseRecipeText;
