import Recipe from "../../models/recipes/ReceipeModel.js";
import RecipeCosting from "../../models/recipes/RecipeCostingModel.js";
import {parseRecipeBook} from "../../services/recipeBookParser.js";
import {parseRecipeText} from "../../utils/parseRecipeText.js";
import {generateRecipeNumber} from "../../services/recipeNumberService.js";
import Cuisine from "../../models/recipes/CuisineModel.js";
import Course from "../../models/recipes/CourseModel.js";
import Category from "../../models/recipes/CategoryModel.js";
import Ingredient from "../../models/recipes/IngredientModel.js";
import Dietary from "../../models/recipes/DietaryModel.js";
import Technique from "../../models/recipes/TechniqueModel.js";
import ImperialUnit from "../../models/reference/ImperialUnitModel.js";
import MetricUnit from "../../models/reference/MetricUnitModel.js";

const exact=value=>new RegExp(`^${String(value||"").replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}$`,"i");
const normalizedName=value=>String(value||"").trim().toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const resolveNamed=async(Model,value)=>{
 const name=String(value||"").trim();
 if(!name)return null;
 const exactMatch=await Model.findOne({name:exact(name)});
 if(exactMatch)return exactMatch;
 const existing=(await Model.find({})).find(item=>normalizedName(item.name)===normalizedName(name));
 if(existing)return existing;
 try{return await Model.create({name,isActive:true});}
 catch(error){if(error.code===11000)return Model.findOne({name:exact(name)});throw error;}
};
const resolveUnit=async(Model,value)=>{
 const unit=String(value||"").trim();
 if(!unit)return null;
 const aliases={tablespoons:"tbsp",tablespoon:"tbsp",teaspoons:"tsp",teaspoon:"tsp",ounces:"oz",ounce:"oz",pounds:"lb",pound:"lb",lbs:"lb",cups:"cup",grams:"g",gram:"g",kilograms:"kg",kilogram:"kg",milliliters:"ml",milliliter:"ml",liters:"l",liter:"l"};
 const values=[unit,unit.replace(/s$/i,""),aliases[unit.toLowerCase()]].filter(Boolean);
 return Model.findOne({$or:values.flatMap(candidate=>[{name:exact(candidate)},{symbol:exact(candidate)}])});
};
const resolveMeasurement=async value=>({
 imperialQuantity:value?.imperialQuantity??null,
 imperialUnit:(await resolveUnit(ImperialUnit,value?.imperialUnitName))?._id||null,
 metricQuantity:value?.metricQuantity??null,
 metricUnit:(await resolveUnit(MetricUnit,value?.metricUnitName))?._id||null
});
const countMeasurement=async description=>{
 const match=String(description||"").trim().match(/^(\d+(?:\.\d+)?)\s+(.+)/);
 if(!match)return null;
 const [imperialUnit,metricUnit]=await Promise.all([ImperialUnit.findOne({type:"count",isActive:{$ne:false}}),MetricUnit.findOne({type:"count",isActive:{$ne:false}})]);
 return{imperialQuantity:Number(match[1]),imperialUnit:imperialUnit?._id||null,metricQuantity:Number(match[1]),metricUnit:metricUnit?._id||null};
};

export const parseRecipeBookFile=async(req,res)=>{
 try{
  if(!req.file)return res.status(400).json({message:"Choose a .docx recipe book."});
  if(!/\.docx$/i.test(req.file.originalname))return res.status(400).json({message:"Only .docx files are supported."});
  const result=await parseRecipeBook(req.file.buffer);
  return res.json({...result,fileName:req.file.originalname});
 }catch(error){return res.status(500).json({message:"Failed to parse recipe book",error:error.message});}
};

export const parseRecipeTextDraft=async(req,res)=>{
 try{
  const text=String(req.body?.text||"").trim();
  if(!text)return res.status(400).json({message:"Paste GPT recipe text first."});

  const parsed=parseRecipeText(text);
  if(!parsed.recipe?.name)return res.status(400).json({message:"The pasted text does not contain a Recipe Name."});

  const recipe={
   ...parsed.recipe,
   warnings:[
    ...(!parsed.recipe.ingredients.length?["No ingredient rows were detected."]:[]),
    ...(!parsed.recipe.instructions.length?["No instruction steps were detected."]:[])
   ]
  };

  return res.json({
   recipes:[recipe],
   unresolvedMappings:parsed.unresolvedMappings,
   summary:{recipes:1,ingredients:recipe.ingredients.length,warnings:recipe.warnings.length}
  });
 }catch(error){
  return res.status(400).json({message:"Failed to parse pasted recipe text",error:error.message});
 }
};

export const importRecipeBookDrafts=async(req,res)=>{
 const {business,recipes=[]}=req.body;
 if(!business)return res.status(400).json({message:"Select a target business."});
 if(!Array.isArray(recipes)||!recipes.length)return res.status(400).json({message:"Select at least one recipe."});
 const results=[];
 for(const [draftIndex,draft] of recipes.entries()){
  try{
   const name=String(draft.name||"").trim();
   if(!name){results.push({name:"Unnamed recipe",status:"skipped",message:"Recipe name is required."});continue;}
   const existingRecipe=await Recipe.findOne({business,name:exact(name)});
   const cuisine=await resolveNamed(Cuisine,draft.cuisine||draft.sourceCuisine);
   const course=await resolveNamed(Course,draft.course||draft.sourceCourse);
   const category=await resolveNamed(Category,draft.category||draft.sourceCategory);
   const dietaryConsiderations=[];
   for(const dietaryName of draft.dietaryConsiderations||draft.dietaryConsiderationNames||[]){
    const dietary=await resolveNamed(Dietary,dietaryName);
    if(dietary)dietaryConsiderations.push(dietary._id);
   }
   const techniqueRefs=[];
   for(const techniqueName of draft.techniques||[]){const technique=await resolveNamed(Technique,techniqueName);if(technique)techniqueRefs.push(technique._id);}
   const recipeIngredients=[];
   for(const item of draft.ingredients||[]){
    const ingredient=await resolveNamed(Ingredient,item.name||item.ingredientName||item.sourceName);
    if(ingredient){
     const imperialUnit=await resolveUnit(ImperialUnit,item.imperialUnitName);
     const metricUnit=await resolveUnit(MetricUnit,item.metricUnitName);
     recipeIngredients.push({ingredient:ingredient._id,imperialQuantity:item.imperialQuantity??null,imperialUnit:imperialUnit?._id||null,metricQuantity:item.metricQuantity??null,metricUnit:metricUnit?._id||null,preparation:item.preparation||"",time:item.time||"",note:item.note||""});
    }
   }
   const servings=Number(draft.servings||0)||null;
   const parsedServingSize=await resolveMeasurement(draft.servingSize);
   const servingSize=parsedServingSize.imperialQuantity!==null||parsedServingSize.metricQuantity!==null?parsedServingSize:await countMeasurement(draft.servingSizeDescription)||parsedServingSize;
   const parsedYield=await resolveMeasurement(draft.yield);
   const calculatedYield=servings?{imperialQuantity:servingSize.imperialQuantity===null?parsedYield.imperialQuantity:Number(servingSize.imperialQuantity)*servings,imperialUnit:servingSize.imperialUnit||parsedYield.imperialUnit,metricQuantity:servingSize.metricQuantity===null?parsedYield.metricQuantity:Number(servingSize.metricQuantity)*servings,metricUnit:servingSize.metricUnit||parsedYield.metricUnit}:parsedYield;
   const recipeDraft={business,name,cuisines:cuisine?[cuisine._id]:[],courses:course?[course._id]:[],categories:category?[category._id]:[],primaryCuisine:cuisine?._id||null,primaryCourse:course?._id||null,primaryCategory:category?._id||null,dietaryConsiderations:[...new Set(dietaryConsiderations.map(String))],servings,servingSize,servingSizeDescription:draft.servingSizeDescription||"",yield:calculatedYield,generalDescription:draft.generalDescription||"",menuDescription:draft.menuDescription||"",times:draft.times||{},flavorProfile:draft.flavorProfile||{},fermentationTemperatureAdjustment:draft.fermentationTemperatureAdjustment||"",techniques:draft.techniques||[],techniqueRefs:[...new Set(techniqueRefs.map(String))],equipmentNames:draft.equipmentNames||[],ingredients:recipeIngredients,instructions:draft.instructions||[],plating:draft.plating||[],notes:draft.notes||[],storage:draft.storage||[],haccp:draft.haccp||[],ccp:draft.ccp||[],nutrition:draft.nutrition||{},suggestedNutrition:draft.nutrition||{},nutritionSync:{status:"pending"},suggestedPrice:Number(draft.suggestedPrice||0),isActive:true};
   const generated=existingRecipe?{}:cuisine&&course&&category?await generateRecipeNumber(recipeDraft):{recipeNumber:`IMPORT-${Date.now().toString(36).toUpperCase()}-${String(draftIndex+1).padStart(4,"0")}`,recipeSequence:Date.now()+draftIndex};
   const recipe=existingRecipe?await Recipe.findByIdAndUpdate(existingRecipe._id,recipeDraft,{returnDocument:"after",runValidators:true}):await Recipe.create({...recipeDraft,...generated});
   const costingIngredients=(draft.ingredients||[]).filter(item=>item.vendorIngredientPrice).map(item=>({
    ingredient:item.ingredient,vendor:item.vendor||null,vendorIngredientPrice:item.vendorIngredientPrice,
    imperialQuantity:item.imperialQuantity??null,imperialUnit:item.imperialUnit||null,
    metricQuantity:item.metricQuantity??null,metricUnit:item.metricUnit||null,
    unitCost:Number(item.unitCost||0),totalCost:Number(item.totalCost||0),vendorPackCost:Number(item.vendorPackCost||0),
    vendorPackImperialDisplay:item.vendorPackImperialDisplay||"",vendorPackMetricDisplay:item.vendorPackMetricDisplay||""
   }));
   if(costingIngredients.length){
    const ingredientCost=costingIngredients.reduce((total,item)=>total+item.totalCost,0);
    await RecipeCosting.findOneAndUpdate({business,recipe:recipe._id},{business,recipe:recipe._id,yield:draft.yield||{},ingredients:costingIngredients,totals:{ingredientCost,totalCost:ingredientCost},pricing:{suggestedPrice:Number(draft.suggestedPrice||0)}},{upsert:true,returnDocument:"after",runValidators:true});
   }
   results.push({name,status:existingRecipe?"updated":"imported",id:recipe._id,message:`${existingRecipe?"Updated":"Imported"} with ${recipe.ingredients.length} ingredients, ${recipe.instructions.length} instructions, and ${costingIngredients.length} vendor cost selections.`});
  }catch(error){results.push({name:draft.name||"Unnamed recipe",status:"error",message:error.message});}
 }
 return res.json({results,summary:{imported:results.filter(item=>item.status==="imported").length,updated:results.filter(item=>item.status==="updated").length,duplicates:0,skipped:results.filter(item=>item.status==="skipped").length,errors:results.filter(item=>item.status==="error").length}});
};
