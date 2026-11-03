// backend/controllers/master/RecipeCostingController.js
import RecipeCosting from "../../models/master/RecipeCostingModel.js";

export const createRecipeCosting=async(req,res)=>{
 try{
  const recipeCosting=await RecipeCosting.create(req.body);
  return res.status(201).json({message:"Recipe costing created successfully",recipeCosting});
 }catch(error){
  if(error.code===11000)return res.status(409).json({message:"Recipe costing already exists for this business and recipe"});
  return res.status(500).json({message:"Failed to create recipe costing",error:error.message});
 }
};

export const getRecipeCostings=async(req,res)=>{
 try{
  const filter={};
  if(req.query.business)filter.business=req.query.business;
  if(req.query.recipe)filter.recipe=req.query.recipe;
  if(req.query.isActive!==undefined)filter.isActive=req.query.isActive==="true";
  const recipeCostings=await RecipeCosting.find(filter)
   .populate("business")
   .populate("recipe")
   .populate("yield.imperialUnit")
   .populate("yield.metricUnit")
   .populate("ingredients.ingredient")
   .populate("ingredients.vendor")
   .populate("ingredients.vendorIngredientPrice")
   .populate("ingredients.imperialUnit")
   .populate("ingredients.metricUnit")
   .sort({createdAt:-1});
  return res.status(200).json(recipeCostings);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch recipe costings",error:error.message});
 }
};

export const getRecipeCostingById=async(req,res)=>{
 try{
  const recipeCosting=await RecipeCosting.findById(req.params.id)
   .populate("business")
   .populate("recipe")
   .populate("yield.imperialUnit")
   .populate("yield.metricUnit")
   .populate("ingredients.ingredient")
   .populate("ingredients.vendor")
   .populate("ingredients.vendorIngredientPrice")
   .populate("ingredients.imperialUnit")
   .populate("ingredients.metricUnit");
  if(!recipeCosting)return res.status(404).json({message:"Recipe costing not found"});
  return res.status(200).json(recipeCosting);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch recipe costing",error:error.message});
 }
};

export const updateRecipeCosting=async(req,res)=>{
 try{
  const recipeCosting=await RecipeCosting.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after",runValidators:true})
   .populate("business")
   .populate("recipe")
   .populate("yield.imperialUnit")
   .populate("yield.metricUnit")
   .populate("ingredients.ingredient")
   .populate("ingredients.vendor")
   .populate("ingredients.vendorIngredientPrice")
   .populate("ingredients.imperialUnit")
   .populate("ingredients.metricUnit");
  if(!recipeCosting)return res.status(404).json({message:"Recipe costing not found"});
  return res.status(200).json({message:"Recipe costing updated successfully",recipeCosting});
 }catch(error){
  if(error.code===11000)return res.status(409).json({message:"Recipe costing already exists for this business and recipe"});
  return res.status(500).json({message:"Failed to update recipe costing",error:error.message});
 }
};

export const deleteRecipeCosting=async(req,res)=>{
 try{
  const recipeCosting=await RecipeCosting.findByIdAndDelete(req.params.id);
  if(!recipeCosting)return res.status(404).json({message:"Recipe costing not found"});
  return res.status(200).json({message:"Recipe costing deleted successfully"});
 }catch(error){
  return res.status(500).json({message:"Failed to delete recipe costing",error:error.message});
 }
};