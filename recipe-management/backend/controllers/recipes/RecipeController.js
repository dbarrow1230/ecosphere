import {nutritionInputsChanged} from "../../services/recipeUpdatePolicy.js";
// backend/controllers/recipes/RecipeController.js
import Recipe from "../../models/recipes/ReceipeModel.js";
import RecipeCosting from "../../models/recipes/RecipeCostingModel.js";
import {generateRecipeNumber} from "../../services/recipeNumberService.js";
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";
import {validateRecipePrices} from "../../../../shared/culinary/vendorHistory.js";
import {enrichNutrition} from "../../services/automaticNutrition.js";

const filenameOnly=value=>String(value||"").replace(/\\/g,"/").split("?")[0].split("/").pop();
const recipePayload=body=>({...body,image:filenameOnly(body.image),nutritionSync:{status:"needs_review",issues:["Nutrition has not been updated from USDA. Use Update Nutrition from USDA when ready."]},suggestedNutrition:body.nutrition||{}});

export const createRecipe=async(req,res)=>{
 try{
  const payload=recipePayload(req.body);
  delete payload.allergenReview;delete payload.allergenReviewHistory;
  payload.ingredients=await validateRecipePrices(businessInfoConnection,mongoose,payload);
  const generated=payload.recipeNumber&&payload.recipeSequence?{recipeNumber:payload.recipeNumber,recipeSequence:payload.recipeSequence}:await generateRecipeNumber(payload);
  const recipe=await Recipe.create({...payload,...generated,isActive:true});
  return res.status(201).json({message:"Recipe created successfully",recipe});
 }catch(error){
  if(error.code===11000)return res.status(409).json({message:"Recipe already exists for this business"});
  return res.status(500).json({message:"Failed to create recipe",error:error.message});
 }
};

export const getRecipes=async(req,res)=>{
 try{
  const filter={isActive:{$ne:false}};
  if(req.query.business)filter.business=req.query.business;
  if(req.query.cuisine)filter.cuisines=req.query.cuisine;
  if(req.query.course)filter.courses=req.query.course;
  if(req.query.mealType)filter.mealType=req.query.mealType;
  if(req.query.category)filter.categories=req.query.category;
  if(req.query.isActive!==undefined)filter.isActive=req.query.isActive==="true";

  const recipes=await Recipe.find(filter)
   .populate("business")
   .populate("parentRecipe","name recipeNumber")
   .populate("cuisines")
   .populate("courses")
   .populate("mealType")
   .populate("categories")
   .populate("primaryCuisine primaryCourse primaryCategory")
   .populate("allergens")
   .populate("dietaryConsiderations")
   .populate("equipment")
   .populate("techniqueRefs")
   .populate("yield.imperialUnit")
   .populate("yield.metricUnit")
   .populate("servingSize.imperialUnit")
   .populate("servingSize.metricUnit")
   .populate("ingredients.ingredient")
   .populate("ingredients.imperialUnit")
   .populate("ingredients.metricUnit")
   .sort({createdAt:-1});

  return res.status(200).json(recipes);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch recipes",error:error.message});
 }
};

export const getRecipeById=async(req,res)=>{
 try{
  const recipe=await Recipe.findById(req.params.id)
   .populate("business")
   .populate("parentRecipe","name recipeNumber")
   .populate("cuisines")
   .populate("courses")
   .populate("mealType")
   .populate("categories")
   .populate("primaryCuisine primaryCourse primaryCategory")
   .populate("allergens")
   .populate("dietaryConsiderations")
   .populate("equipment")
   .populate("techniqueRefs")
   .populate("yield.imperialUnit")
   .populate("yield.metricUnit")
   .populate("servingSize.imperialUnit")
   .populate("servingSize.metricUnit")
   .populate("ingredients.ingredient")
   .populate("ingredients.imperialUnit")
   .populate("ingredients.metricUnit");

  if(!recipe)return res.status(404).json({message:"Recipe not found"});
  return res.status(200).json(recipe);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch recipe",error:error.message});
 }
};

export const updateRecipe=async(req,res)=>{
 try{
  const existing=await Recipe.findById(req.params.id);
  if(!existing)return res.status(404).json({message:"Recipe not found"});
  const payload={...req.body};
  delete payload.nutritionSync;delete payload.suggestedNutrition;delete payload._id;
  delete payload.allergenReview;delete payload.allergenReviewHistory;
  if(Object.hasOwn(payload,'image'))payload.image=filenameOnly(payload.image);
  const merged={...existing.toObject(),...payload};
  if(Object.hasOwn(payload,"ingredients")||Object.hasOwn(payload,"business"))payload.ingredients=await validateRecipePrices(businessInfoConnection,mongoose,merged);
  const classificationsChanged=['business','primaryCuisine','primaryCourse','primaryCategory'].some(field=>Object.hasOwn(payload,field)&&String(existing[field]||'')!==String(payload[field]||''));
  const canGenerate=merged.business&&merged.primaryCuisine&&merged.primaryCourse&&merged.primaryCategory;
  if(canGenerate&&(classificationsChanged||!existing.recipeNumber||!existing.recipeSequence||/^IMPORT-/i.test(existing.recipeNumber))){Object.assign(payload,await generateRecipeNumber(merged));}
  else{delete payload.recipeNumber;delete payload.recipeSequence;}
  if(nutritionInputsChanged(existing.toObject(),payload)){
   payload.nutritionSync={status:'needs_review',issues:['Ingredients or servings changed. Use Update Nutrition from USDA to recalculate.']};
  }else if(Object.hasOwn(payload,'nutrition')&&JSON.stringify(payload.nutrition)!==JSON.stringify(existing.toObject().nutrition)){
   payload.nutritionSync={status:'needs_review',issues:['Nutrition was manually edited and has not been verified by USDA.']};
  }
  const recipe=await Recipe.findByIdAndUpdate(req.params.id,payload,{returnDocument:"after",runValidators:true})
   .populate("business")
   .populate("parentRecipe","name recipeNumber")
   .populate("cuisines")
   .populate("courses")
   .populate("mealType")
   .populate("categories")
   .populate("primaryCuisine primaryCourse primaryCategory")
   .populate("allergens")
   .populate("dietaryConsiderations")
   .populate("equipment")
   .populate("techniqueRefs")
   .populate("yield.imperialUnit")
   .populate("yield.metricUnit")
   .populate("servingSize.imperialUnit")
   .populate("servingSize.metricUnit")
   .populate("ingredients.ingredient")
   .populate("ingredients.imperialUnit")
   .populate("ingredients.metricUnit");

  if(!recipe)return res.status(404).json({message:"Recipe not found"});
  return res.status(200).json({message:"Recipe updated successfully",recipe});
 }catch(error){
  if(error.code===11000)return res.status(409).json({message:"Recipe already exists for this business"});
  return res.status(500).json({message:"Failed to update recipe",error:error.message});
 }
};

export const deleteRecipe=async(req,res)=>{
 try{
  const recipe=await Recipe.findByIdAndUpdate(req.params.id,{isActive:false},{returnDocument:"after"});
  if(!recipe)return res.status(404).json({message:"Recipe not found"});
  await RecipeCosting.updateMany({recipe:recipe._id},{$set:{isActive:false}});
  return res.status(200).json({message:"Recipe archived successfully"});
 }catch(error){
  return res.status(500).json({message:"Failed to delete recipe",error:error.message});
 }
};

export const reserveRecipeNumber=async(req,res)=>{
 try{
  const {business,primaryCourse,primaryCuisine,primaryCategory}=req.body;
  if(!business||!primaryCourse||!primaryCuisine||!primaryCategory)return res.status(400).json({message:"Business and all three primary classifications are required."});
  return res.status(201).json(await generateRecipeNumber({business,primaryCourse,primaryCuisine,primaryCategory}));
 }catch(error){return res.status(500).json({message:"Failed to reserve recipe number",error:error.message});}
};

export const regenerateImportRecipeNumbers=async(req,res)=>{
 try{
  const filter={recipeNumber:/^IMPORT-/i};
  if(req.body.business)filter.business=req.body.business;
  const recipes=await Recipe.find(filter);
  const results=[];
  for(const recipe of recipes){
   if(!recipe.business||!recipe.primaryCuisine||!recipe.primaryCourse||!recipe.primaryCategory){results.push({id:recipe._id,name:recipe.name,status:"skipped",message:"Primary cuisine, course, and category are required."});continue;}
   try{const generated=await generateRecipeNumber(recipe);recipe.recipeNumber=generated.recipeNumber;recipe.recipeSequence=generated.recipeSequence;await recipe.save();results.push({id:recipe._id,name:recipe.name,status:"updated",recipeNumber:recipe.recipeNumber});}
   catch(error){results.push({id:recipe._id,name:recipe.name,status:"error",message:error.message});}
  }
  return res.json({message:"Import recipe-number update completed.",summary:{found:recipes.length,updated:results.filter(item=>item.status==="updated").length,skipped:results.filter(item=>item.status==="skipped").length,errors:results.filter(item=>item.status==="error").length},results});
 }catch(error){return res.status(500).json({message:"Failed to update import recipe numbers",error:error.message});}
};

export const syncRecipeNutrition=async(req,res)=>{
 let guard=null;
 try{
  if(req.body?.force!==true)return res.status(400).json({message:"Use Update Nutrition from USDA to request an update."});
  if(!process.env.USDA_API_KEY)return res.status(503).json({message:"USDA is not configured in the running backend. Restart the backend after setting USDA_API_KEY."});
  const now=new Date();
  const recipe=await Recipe.findOneAndUpdate({_id:req.params.id,$or:[{"nutritionSync.status":{$ne:"processing"}},{"nutritionSync.startedAt":{$lt:new Date(Date.now()-30*60*1000)}},{"nutritionSync.startedAt":{$exists:false}}]},{$set:{nutritionSync:{status:"processing",requestedAt:now,startedAt:now}}},{returnDocument:"after",timestamps:false}).populate("ingredients.ingredient ingredients.metricUnit ingredients.imperialUnit").lean();
  if(!recipe)return res.status(409).json({message:"Recipe is missing or a nutrition update is already running."});
  guard={_id:recipe._id,"nutritionSync.status":"processing","nutritionSync.startedAt":now};
  const result=await enrichNutrition(recipe);
  const {nutrition,...metadata}=result;
  const nutritionSync={...metadata,checkedAt:new Date(),source:result.status==="complete"?"USDA FoodData Central":"Unverified recipe nutrition"};
  const update={nutritionSync,...(nutrition?{nutrition,suggestedNutrition:recipe.suggestedNutrition||recipe.nutrition}:{})};
  const saved=await Recipe.collection.updateOne(guard,{$set:update});
  if(!saved.matchedCount)return res.status(409).json({message:"Recipe changed during the nutrition update. Save your changes and request a new update."});
  return res.json({nutrition:nutrition||recipe.nutrition,nutritionSync});
 }catch(error){
  if(guard)await Recipe.collection.updateOne(guard,{$set:{nutritionSync:{status:"error",issues:[error.message||"USDA update failed. Retry manually."],checkedAt:new Date()}}});
  return res.status(500).json({message:"Unable to update nutrition from USDA. Retry manually."});
 }
};
