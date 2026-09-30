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
 const match=String(text||"").match(new RegExp(`^${escaped}\\s*:\\s*(.+)$`,"im"));
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

const splitSentences=block=>String(block||"")
 .split(/\r?\n+/)
 .map(line=>cleanLine(line))
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
  metric:cells[1]||"",
  ingredient:null,
  ingredientName:cells[2]||"",
  preparation:cells.slice(3).join(" ")
 }))
 .filter(row=>row.code);

const parseIngredients=block=>parseTableRows(block)
 .filter(cells=>!/^imperial/i.test(cells[0]||""))
 .map(cells=>{
  const [imperialDisplay="",metricDisplay="",ingredientName="",preparation="",time=""]=cells;
  return{
   ingredient:null,
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

const parseInstructions=block=>splitSentences(block).map((instruction,index)=>({
 stepNumber:index+1,
 instruction,
 ccpRefs:[...instruction.matchAll(/\b(CCP\d+)\b/gi)].map(match=>match[1].toUpperCase())
}));

const parseYieldLike=value=>{
 const clean=cleanLine(value);
 const paren=clean.match(/\((.*?)\)/);
 const parts=paren?.[1]?.split(/\s*\/\s*/)||[];
 return{
  imperialDisplay:parts[0]||clean,
  metricDisplay:parts[1]||parts[0]||clean,
  imperialQuantity:parseQuantity(parts[0]||clean),
  imperialUnit:null,
  imperialUnitName:parseUnitName(parts[0]||clean),
  metricQuantity:parseQuantity(parts[1]||parts[0]||clean),
  metricUnit:null,
  metricUnitName:parseUnitName(parts[1]||parts[0]||clean)
 };
};

const parseAllergens=text=>{
 const allergenBlock=String(text||"").split(/\r?\n/).slice(-6).join("\n");
 return [...allergenBlock.matchAll(/[🥛🥚🌾]\s*([A-Za-z ]+)/gu)]
  .map(match=>cleanLine(match[1]))
  .filter(Boolean);
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
 })),
 ccpIngredients:recipe.ccp.map(item=>({
  code:item.code,
  ingredientName:item.ingredientName,
  ingredient:item.ingredient
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

 const recipe={
  name:getValueAfterLabel(sourceText,"Recipe Name"),
  cuisine:null,
  course:null,
  category:null,
  dietaryConsiderations:[],
  referenceNames:{
   cuisine:getValueAfterLabel(sourceText,"Cuisine"),
   course:getValueAfterLabel(sourceText,"Course"),
   category:getValueAfterLabel(sourceText,"Category"),
   dietaryConsiderations:dietaryConsiderationNames
  },
  dietaryConsiderationNames,
  yield:parseYieldLike(getValueAfterLabel(sourceText,"Yield")),
  servingSize:parseYieldLike(getValueAfterLabel(sourceText,"Serving Size")),
  times:{
   prepTime:getValueAfterLabel(sourceText,"Prep Time"),
   cookTime:getValueAfterLabel(sourceText,"Cook Time"),
   chillTime:getValueAfterLabel(sourceText,"Chill Time"),
   restTime:getValueAfterLabel(sourceText,"Rest Time")
  },
  flavorProfile:{
   taste:getValueAfterLabel(flavorBlock,"Taste"),
   aroma:getValueAfterLabel(flavorBlock,"Aroma"),
   mouthfeel:getValueAfterLabel(flavorBlock,"Mouthfeel")
  },
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
  plating:splitSentences(getBlock(sourceText,["plating"],["notes"])),
  notes:splitSentences(getBlock(sourceText,["notes"],["storage"])),
  storage:splitSentences(getBlock(sourceText,["storage"],["nutritional information"])),
  nutrition:parseNutrition(nutritionBlock),
  allergens:parseAllergens(sourceText),
  importMetadata:{
   sourceText,
   parserVersion,
   parsedAt:new Date()
  },
  isActive:false
 };

 return{
  recipe,
  unresolvedMappings:buildUnresolvedMappings(recipe)
 };
};

export default parseRecipeText;
