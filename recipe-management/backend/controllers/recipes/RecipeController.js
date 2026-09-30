import {nutritionInputsChanged} from "../../services/recipeUpdatePolicy.js";
// backend/controllers/recipes/RecipeController.js
import Recipe from "../../models/recipes/ReceipeModel.js";
import RecipeCosting from "../../models/recipes/RecipeCostingModel.js";
import {generateRecipeNumber} from "../../services/recipeNumberService.js";

const filenameOnly=value=>String(value||"").replace(/\\/g,"/").split("?")[0].split("/").pop();
const recipePayload=body=>({...body,image:filenameOnly(body.image),nutritionSync:{status:"pending"},suggestedNutrition:body.nutrition||{}});

export const createRecipe=async(req,res)=>{
 try{
  const payload=recipePayload(req.body);
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
  const filter={};
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
  if(Object.hasOwn(payload,'image'))payload.image=filenameOnly(payload.image);
  const merged={...existing.toObject(),...payload};
  const classificationsChanged=['business','primaryCuisine','primaryCourse','primaryCategory'].some(field=>Object.hasOwn(payload,field)&&String(existing[field]||'')!==String(payload[field]||''));
  const canGenerate=merged.business&&merged.primaryCuisine&&merged.primaryCourse&&merged.primaryCategory;
  if(classificationsChanged&&canGenerate){Object.assign(payload,await generateRecipeNumber(merged));}
  else{delete payload.recipeNumber;delete payload.recipeSequence;}
  if(nutritionInputsChanged(existing.toObject(),payload)){
   payload.nutritionSync={status:'pending'};
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
  const recipe=await Recipe.findByIdAndDelete(req.params.id);
  if(!recipe)return res.status(404).json({message:"Recipe not found"});
  await RecipeCosting.deleteMany({recipe:recipe._id});
  return res.status(200).json({message:"Recipe deleted successfully"});
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
 try{
  if(!process.env.USDA_API_KEY)return res.status(503).json({message:"USDA is not configured in the running backend. Restart the backend after setting USDA_API_KEY."});
  const filter=req.body?.force===true?{_id:req.params.id,"nutritionSync.status":{$nin:["pending","processing"]}}:{_id:req.params.id,$or:[{nutritionSync:null},{nutritionSync:{$exists:false}}]};
  await Recipe.updateOne(filter,{$set:{nutritionSync:{status:"pending",requestedAt:new Date()}}},{timestamps:false});
  const recipe=await Recipe.findById(req.params.id).select("nutrition nutritionSync").lean();
  if(!recipe)return res.status(404).json({message:"Recipe not found"});
  return res.json(recipe);
 }catch{return res.status(500).json({message:"Unable to check automatic nutrition."});}
};
