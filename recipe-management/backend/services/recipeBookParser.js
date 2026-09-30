

const entities={amp:"&",lt:"<",gt:">",quot:'"',apos:"'",nbsp:" ",ndash:"–",mdash:"—",frac14:"¼",frac12:"½",frac34:"¾"};
const decode=value=>String(value||"")
 .replace(/<br\s*\/?\s*>/gi,"\n")
 .replace(/<[^>]+>/g,"")
 .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi,(match,entity)=>{
  if(entity[0]==="#"){
   const hex=entity[1]?.toLowerCase()==="x";
   const code=parseInt(entity.slice(hex?2:1),hex?16:10);
   return Number.isFinite(code)?String.fromCodePoint(code):match;
  }
  return entities[entity.toLowerCase()]||match;
 })
 .replace(/\s+/g," ")
 .trim();

const parseTable=html=>{
 const rows=[];
 for(const rowMatch of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)){
  const cells=[...rowMatch[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(match=>decode(match[1]));
  if(cells.some(Boolean))rows.push(cells);
 }
 return rows;
};

const tokenize=html=>{
 const blocks=[];
 const pattern=/<h[1-6]\b[^>]*>[\s\S]*?<\/h[1-6]>|<p\b[^>]*>[\s\S]*?<\/p>|<table\b[^>]*>[\s\S]*?<\/table>|<[ou]l\b[^>]*>[\s\S]*?<\/[ou]l>/gi;
 for(const match of html.matchAll(pattern)){
  const raw=match[0];
  if(/^<table/i.test(raw)){blocks.push({type:"table",rows:parseTable(raw)});continue;}
  if(/^<[ou]l/i.test(raw)){
   for(const item of raw.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)){
    const text=decode(item[1]);
    if(text)blocks.push({type:"list",text});
   }
   continue;
  }
  const heading=/^<h([1-6])/i.exec(raw);
  const text=decode(raw);
  if(text)blocks.push({type:heading?`h${heading[1]}`:"p",text});
 }
 return blocks;
};

const labels=["Cuisine","Course","Category","Dietary Considerations","Yield (Imperial)","Yield (Metric)","Yield","Serving Size","Servings","Prep Time","Cook Time","Chill Time","Rest Time","Total Time","Taste","Aroma","Mouthfeel","Fermentation Temperature Adjustment","Room Temperature Adjustment","Flavor Profile","General Description","Description","Suggested Price","Menu Description","Origins","Origin","History","Cultural Significance","Techniques","Equipment","HACCP","CCP","Ingredients","Instructions","Directions","Method","Plating","Notes","Storage","Nutritional Information","Nutrition","Allergen Disclaimer","Allergen Warning"];
const escaped=labels.map(label=>label.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|");
const readLabel=(text,label)=>{
 const expression=new RegExp(`(?:^|\\n)${label.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}\\s*:\\s*([\\s\\S]*?)(?=\\n(?:${escaped})(?:\\s*:|\\s*(?=\\n|$))|$)`,`i`);
 return expression.exec(text)?.[1]?.trim()||"";
};
const first=value=>String(value||"").split(/[,;/]/)[0].trim();
const splitValues=value=>String(value||"").split(/[,;]/).map(item=>item.trim()).filter(Boolean);
const cleanHeading=value=>String(value||"").replace(/:$/g,"").trim().toLowerCase();
const metadataPattern=/^(?:Cuisine|Course|Category|Dietary Considerations|Yield|Serving Size|Servings|Prep Time|Cook Time|Bake Time|Air Fry Time|Chill Time|Rest Time|Total Time|Flavor Profile|Taste|Aroma|Mouthfeel|Fermentation Temperature Adjustment|Room Temperature Adjustment|General Description|Description|Plating|Storage|Allergen Disclaimer|Allergen Warning)\s*:/i;
const instructionPattern=/^(?:preheat|prepare|heat|place|arrange|combine|mix|stir|whisk|add|pour|cook|bake|roast|fry|sauté|saute|simmer|boil|drain|serve|remove|spread|top|garnish|brush|pat|rinse|wash|slice|cut|fold|knead|roll|divide|transfer|cover|refrigerate|chill|allow|let|season|melt|blend|strain|toss|dust|dip|working|return)\b/i;
const measurementPattern=/^(?:about\s+|approximately\s+|approx\.?\s+|~\s*)?(?:(?:\d+\s+)?(?:\d+\/\d+|\d+(?:\.\d+)?|[¼½¾⅓⅔⅛⅜⅝⅞])|a\s+pinch|pinch|to\s+taste|as\s+needed)\b/i;
const ingredientUnitPattern=/\b(?:cups?|tablespoons?|tbsp|teaspoons?|tsp|ounces?|oz|pounds?|lbs?|grams?|g|kilograms?|kg|milliliters?|ml|liters?|l|cloves?|cans?|packages?|packets?|boxes?|sticks?|bunch(?:es)?|slices?|pieces?|large|medium|small|whole)\b/i;
const fractionValues={"¼":.25,"½":.5,"¾":.75,"⅓":1/3,"⅔":2/3,"⅛":.125,"⅜":.375,"⅝":.625,"⅞":.875};
const measurementParts=display=>{
 const text=String(display||"").trim().replace(/^(?:about|approximately|approx\.?|~)\s+/i,"");
 if(/^\d+(?:\.\d+)?\s*[-–]\s*\d+(?:\.\d+)?\b/.test(text))return{quantity:null,unitName:""};
 const mixed=text.match(/^(\d+)\s+(\d+)\/(\d+)\s*(.*)$/);
 if(mixed)return{quantity:Number(mixed[1])+Number(mixed[2])/Number(mixed[3]),unitName:mixed[4].trim()};
 const fraction=text.match(/^(\d+)\/(\d+)\s*(.*)$/);
 if(fraction)return{quantity:Number(fraction[1])/Number(fraction[2]),unitName:fraction[3].trim()};
 const unicode=text.match(/^([¼½¾⅓⅔⅛⅜⅝⅞])\s*(.*)$/);
 if(unicode)return{quantity:fractionValues[unicode[1]],unitName:unicode[2].trim()};
 const number=text.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
 return number?{quantity:Number(number[1]),unitName:number[2].trim()}:{quantity:null,unitName:""};
};
const withMeasurements=item=>{
 const imperial=measurementParts(item.imperialDisplay);
 const metric=measurementParts(item.metricDisplay);
 return{...item,imperialQuantity:imperial.quantity,imperialUnitName:imperial.unitName,metricQuantity:metric.quantity,metricUnitName:metric.unitName};
};

const parseFreeIngredient=text=>{
 const clean=String(text||"").replace(/\s+-\s*$/g,"").trim();
 const parenthetical=clean.match(/^(.+?)\s*\(([^)]*)\)\s*(?:\/\s*([^,]+))?(?:,\s*(.*))?$/);
 if(parenthetical){
  const rawName=parenthetical[1].trim();
  const nameComma=rawName.indexOf(",");
  const ingredientName=nameComma>=0?rawName.slice(0,nameComma).trim():rawName;
  const namePreparation=nameComma>=0?rawName.slice(nameComma+1).trim():"";
  const inner=parenthetical[2].trim();
  const metric=parenthetical[3]?.trim()||"";
  const trailing=parenthetical[4]?.trim()||"";
  const innerMeasurement=inner.match(/((?:\d+\s+)?\d+\/\d+|\d+(?:\.\d+)?|[¼½¾⅓⅔⅛⅜⅝⅞])\s*(cups?|tablespoons?|tbsp|teaspoons?|tsp|ounces?|oz|pounds?|lbs?|grams?|g|kilograms?|kg|milliliters?|ml|liters?|l)\b/i);
  if(innerMeasurement){
   const imperialDisplay=innerMeasurement[0];
   const preparation=[namePreparation,inner.replace(imperialDisplay,"").replace(/^[,\s]+|[,\s]+$/g,""),trailing].filter(Boolean).join(", ");
   return withMeasurements({name:ingredientName,imperialDisplay,metricDisplay:metric,preparation,time:""});
  }
  return withMeasurements({name:ingredientName,imperialDisplay:"",metricDisplay:"",preparation:[namePreparation,inner,trailing].filter(Boolean).join(", "),time:""});
 }
 const comma=clean.indexOf(",");
 const main=comma>=0?clean.slice(0,comma).trim():clean;
 const preparation=comma>=0?clean.slice(comma+1).trim():"";
 const prefix=/^(.*?\b(?:cups?|tablespoons?|tbsp|teaspoons?|tsp|ounces?|oz|pounds?|lbs?|grams?|g|kilograms?|kg|milliliters?|ml|liters?|l|cloves?|cans?|packages?|packets?|boxes?|sticks?|bunch(?:es)?|slices?|pieces?|large|medium|small|whole)\b)\s+(.+)$/i.exec(main);
 if(prefix)return withMeasurements({name:prefix[2].replace(/^of\s+/i,"").trim(),imperialDisplay:/\b(?:g|kg|ml|l)\b/i.test(prefix[1])?"":prefix[1].trim(),metricDisplay:/\b(?:g|kg|ml|l)\b/i.test(prefix[1])?prefix[1].trim():"",preparation,time:""});
 const quantityOnly=/^((?:\d+\s+)?(?:\d+\/\d+|\d+(?:\.\d+)?|[¼½¾⅓⅔⅛⅜⅝⅞]))\s+(.+)$/.exec(main);
 if(quantityOnly)return withMeasurements({name:quantityOnly[2].trim(),imperialDisplay:quantityOnly[1],metricDisplay:"",preparation,time:""});
 return withMeasurements({name:main,imperialDisplay:"",metricDisplay:"",preparation,time:""});
};
const splitDualMeasurement=value=>{
 const text=String(value||"").trim();
 const match=/^(.*?)(?:\(([^()]*)\))?$/.exec(text);
 const prefix=match?.[1]?.trim()||"";
 const measures=(match?.[2]||"").split("/").map(item=>item.trim());
 if(measures.length!==2)return{imperialDisplay:text,metricDisplay:""};
 const metric=measures.find(item=>/\b(?:mg|g|kg|ml|l)\b/i.test(item))||measures[0];
 const imperial=measures.find(item=>item!==metric)||measures[1];
 return{imperialDisplay:[prefix,imperial].filter(Boolean).join(" "),metricDisplay:[prefix,metric].filter(Boolean).join(" ")};
};

const ingredientRows=rows=>{
 if(rows.length<2)return [];
 const headers=rows[0].map(cell=>cell.toLowerCase());
 const index=terms=>headers.findIndex(header=>terms.some(term=>header.includes(term)));
 const ingredientIndex=index(["ingredient"]);
 if(ingredientIndex<0)return [];
 const imperialIndex=index(["imperial"]);
 const metricIndex=index(["metric"]);
 const preparationIndex=index(["preparation"]);
 const timeIndex=index(["time"]);
 return rows.slice(1).map(row=>withMeasurements({
  name:row[ingredientIndex]||"",
  imperialDisplay:imperialIndex>=0?row[imperialIndex]||"":"",
  metricDisplay:metricIndex>=0?row[metricIndex]||"":"",
  preparation:preparationIndex>=0?row[preparationIndex]||"":"",
  time:timeIndex>=0?row[timeIndex]||"":""
 })).filter(item=>item.name);
};

const ccpRows=rows=>{
 if(rows.length<2)return [];
 const headers=rows[0].map(cell=>normalizeHeader(cell));
 const find=names=>headers.findIndex(header=>names.some(name=>header.includes(name)));
 const indexes={code:find(["ccp code"]),criticalControlPoint:find(["critical control point"]),hazard:find(["hazard"]),criticalLimit:find(["critical limit"]),monitoring:find(["monitoring"]),correctiveAction:find(["corrective action"]),verification:find(["verification"]),records:find(["records"])};
 if(indexes.code<0||indexes.criticalControlPoint<0)return [];
 return rows.slice(1).map(row=>Object.fromEntries(Object.entries(indexes).map(([key,index])=>[key,index>=0?row[index]||"":""]))).filter(item=>item.code&&item.criticalControlPoint);
};

function normalizeHeader(value){return String(value||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();}

const parseRecipe=(name,blocks,inheritedCategory="")=>{
 const joined=blocks.filter(block=>block.text).map(block=>block.text).join("\n");
 const ingredients=[];
 const instructions=[];
 const notes=[];
 const plating=[];
 const storage=[];
 const ccp=[];
 let section="";
 let sawTable=false;

 for(const block of blocks){
  if(block.type==="table"){
   const parsedCcp=ccpRows(block.rows);
   if(parsedCcp.length)ccp.push(...parsedCcp);
   else ingredients.push(...ingredientRows(block.rows));
   sawTable=true;
   continue;
  }
  const text=block.text||"";
  const heading=cleanHeading(text);
  if(["ingredients","ingredients table"].includes(heading)){section="ingredients";continue;}
  if(/^(pasta dough|filling|sauce)( \(.*\))?$/.test(heading)){
   section=sawTable?"instructions":"ingredients";
   continue;
  }
  if(["instructions","directions","method","assemble ravioli","cook ravioli"].includes(heading)){section="instructions";continue;}
  if(heading==="notes"){section="notes";continue;}
  if(heading==="plating"){section="plating";continue;}
  if(heading==="storage"){section="storage";continue;}
  if(/^plating\s*:/i.test(text)){plating.push(text.replace(/^plating\s*:/i,"").trim());section="";continue;}
  if(/^storage\s*:/i.test(text)){storage.push(text.replace(/^storage\s*:/i,"").trim());section="";continue;}
  if(metadataPattern.test(text)||heading==="flavor profile")continue;
  if(section==="ingredients"&&text&&!/^[A-Za-z ]+\s*:/.test(text))ingredients.push(parseFreeIngredient(text));
  if(section==="instructions"&&text)instructions.push(text);
  if(section==="notes"&&text)notes.push(text);
  if(section==="plating"&&text)plating.push(text);
  if(section==="storage"&&text)storage.push(text);
  if(!section&&block.type==="list"){section="instructions";instructions.push(text);continue;}
  const instructionText=text.replace(/^\d+[.)]\s*/,"");
  if(!section&&instructionPattern.test(instructionText)){section="instructions";instructions.push(instructionText);continue;}
  if(!section&&(measurementPattern.test(text)||ingredientUnitPattern.test(text)||/^(?:salt|pepper|oil|water|optional)\b/i.test(text))){ingredients.push(parseFreeIngredient(text));continue;}
 }

 const yieldText=readLabel(joined,"Yield");
 const servingsText=readLabel(joined,"Servings")||(/\bservings?\b/i.test(yieldText)?yieldText:"");
 const servings=Number((servingsText.match(/\d+(?:\.\d+)?/)||[])[0]||0)||null;
 const splitYield=withMeasurements(splitDualMeasurement(/\bservings?\b/i.test(yieldText)?"":yieldText));
 const imperialYield=readLabel(joined,"Yield (Imperial)")||splitYield.imperialDisplay;
 const metricYield=readLabel(joined,"Yield (Metric)")||splitYield.metricDisplay;
 const parsedYield=withMeasurements({imperialDisplay:imperialYield,metricDisplay:metricYield});
 const serving=readLabel(joined,"Serving Size")||readLabel(joined,"Servings");
 const splitServing=withMeasurements(splitDualMeasurement(serving));
 const allergenText=readLabel(joined,"Allergen Disclaimer")||readLabel(joined,"Allergen Warning");
 const description=readLabel(joined,"General Description")||readLabel(joined,"Description");

 if(!instructions.length){
  const lastTable=blocks.reduce((last,block,index)=>block.type==="table"?index:last,-1);
  blocks.slice(lastTable+1).filter(block=>block.type==="list").forEach(block=>instructions.push(block.text));
 }

 return{
  sourceName:name,name,cuisine:first(readLabel(joined,"Cuisine")),course:first(readLabel(joined,"Course")),category:first(readLabel(joined,"Category"))||inheritedCategory,
  dietaryConsiderations:splitValues(readLabel(joined,"Dietary Considerations")),
  yield:parsedYield,servingSize:splitServing,servingSizeDescription:serving,servings,
  times:{prepTime:readLabel(joined,"Prep Time"),cookTime:readLabel(joined,"Cook Time"),chillTime:readLabel(joined,"Chill Time"),restTime:readLabel(joined,"Rest Time")},
  flavorProfile:{taste:splitValues(readLabel(joined,"Taste")),aroma:splitValues(readLabel(joined,"Aroma")),mouthfeel:splitValues(readLabel(joined,"Mouthfeel"))},
  fermentationTemperatureAdjustment:readLabel(joined,"Fermentation Temperature Adjustment")||readLabel(joined,"Room Temperature Adjustment"),
  generalDescription:description,ingredients,instructions:instructions.map((instruction,index)=>({stepNumber:index+1,instruction})),ccp,plating,notes,storage,
  allergens:allergenText?splitValues(allergenText):[],isActive:true,
  warnings:[...(!ingredients.length?["No ingredient rows were detected."]:[]),...(!instructions.length?["No instruction steps were detected."]:[]),...(!readLabel(joined,"Cuisine")?["Cuisine is missing."]:[]),...(!readLabel(joined,"Course")?["Course is missing."]:[]),...(!(readLabel(joined,"Category")||inheritedCategory)?["Category is missing."]:[])]
 };
};

export const parseRecipeBook=async buffer=>{
 // Document conversion is optional at server startup.
 let mammoth;
 try{({default:mammoth}=await import("mammoth"));}
 catch(error){if(error.code!=="ERR_MODULE_NOT_FOUND")throw error;throw new Error("DOCX import requires the mammoth dependency. Install the declared project dependencies and retry.");}
 const {value:html,messages}=await mammoth.convertToHtml({buffer},{styleMap:["p[style-name='Title'] => h6:fresh"]});
 const blocks=tokenize(html);
 const recipeHeading=blocks.some(block=>block.type==="h1")?"h1":"h2";
 const recipes=[];
 let current=null;
 let sectionTitle="";
 for(const block of blocks){
  if(block.type==="h6"){
   const value=block.text.trim();
   if(value&&!/^table of contents$/i.test(value))sectionTitle=value;
   continue;
  }
  if(block.type===recipeHeading){
   if(current)recipes.push(parseRecipe(current.name,current.blocks,current.category));
   current={name:block.text,blocks:[]};
   current.category=sectionTitle;
  }else if(current)current.blocks.push(block);
 }
 if(current)recipes.push(parseRecipe(current.name,current.blocks,current.category));
 return{recipes,messages:messages.map(message=>message.message),summary:{recipes:recipes.length,ingredients:recipes.reduce((total,recipe)=>total+recipe.ingredients.length,0),warnings:recipes.reduce((total,recipe)=>total+recipe.warnings.length,0)}};
};
