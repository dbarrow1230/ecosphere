// backend/controllers/master/RecipeController.js
import Recipe from "../../models/master/ReceipeModel.js";

export const createRecipe=async(req,res)=>{
 try{
  const recipe=await Recipe.create(req.body);
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
  if(req.query.cuisine)filter.cuisine=req.query.cuisine;
  if(req.query.course)filter.course=req.query.course;
  if(req.query.category)filter.category=req.query.category;
  if(req.query.isActive!==undefined)filter.isActive=req.query.isActive==="true";

  const recipes=await Recipe.find(filter)
   .populate("business")
   .populate("cuisine")
   .populate("course")
   .populate("category")
   .populate("dietaryConsiderations")
   .populate("yield.imperialUnit")
   .populate("yield.metricUnit")
   .populate("servingSize.imperialUnit")
   .populate("servingSize.metricUnit")
   .populate("equipment")
   .populate("ccp.ingredient")
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
   .populate("cuisine")
   .populate("course")
   .populate("category")
   .populate("dietaryConsiderations")
   .populate("yield.imperialUnit")
   .populate("yield.metricUnit")
   .populate("servingSize.imperialUnit")
   .populate("servingSize.metricUnit")
   .populate("equipment")
   .populate("ccp.ingredient")
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
  const recipe=await Recipe.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after",runValidators:true})
   .populate("business")
   .populate("cuisine")
   .populate("course")
   .populate("category")
   .populate("dietaryConsiderations")
   .populate("yield.imperialUnit")
   .populate("yield.metricUnit")
   .populate("servingSize.imperialUnit")
   .populate("servingSize.metricUnit")
   .populate("equipment")
   .populate("ccp.ingredient")
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
  return res.status(200).json({message:"Recipe deleted successfully"});
 }catch(error){
  return res.status(500).json({message:"Failed to delete recipe",error:error.message});
 }
};