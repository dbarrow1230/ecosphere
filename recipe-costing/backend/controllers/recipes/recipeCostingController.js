// backend/controllers/recipes/recipeCostingController.js
import RecipeCosting from "../../models/recipes/RecipeCostingModel.js";
import Recipe from "../../models/recipes/ReceipeModel.js";

import "../../models/reference/businessModel.js";
import "../../models/reference/vendorModel.js";
import "../../models/recipes/VendorIngredientPriceModel.js";
import "../../models/reference/ImperialUnitModel.js";
import "../../models/reference/MetricUnitModel.js";

const recipeCostingPopulate=[
 "business",
 "recipe",
 "yield.imperialUnit",
 "yield.metricUnit",
 "ingredients.vendor",
 "ingredients.ingredient",
 "ingredients.vendorIngredientPrice",
 "ingredients.imperialUnit",
 "ingredients.metricUnit"
].join(" ");

export const getRecipeCostings=async(req,res)=>{
 try{
  const query={isActive:true};
  if(req.query.business)query.business=req.query.business;
  if(req.query.recipe)query.recipe=req.query.recipe;
  const costings=await RecipeCosting.find(query)
   .populate(recipeCostingPopulate)
   .sort({createdAt:-1})
   .lean();

  res.status(200).json(costings);
 }catch(err){
  res.status(500).json({message:"Failed to fetch recipe costings",error:err.message});
 }
};

export const getRecipeCostingById=async(req,res)=>{
 try{
  const costing=await RecipeCosting.findById(req.params.id)
   .populate(recipeCostingPopulate)
   .lean();

  if(!costing)return res.status(404).json({message:"Recipe costing not found"});
  res.status(200).json(costing);
 }catch(err){
  res.status(500).json({message:"Failed to fetch recipe costing",error:err.message});
 }
};

export const getRecipeCostingByRecipeNumber=async(req,res)=>{
 try{
  const recipeQuery={recipeNumber:req.params.recipeNumber};
  if(req.query.business)recipeQuery.business=req.query.business;
  const recipe=await Recipe.findOne(recipeQuery).lean();

  if(!recipe)return res.status(404).json({message:"Recipe not found"});

  const costing=await RecipeCosting.findOne({
   recipe:recipe._id,
   isActive:true
  })
   .populate(recipeCostingPopulate)
   .lean();

  if(!costing)return res.status(404).json({message:"Recipe costing not found"});
  res.status(200).json(costing);
 }catch(err){
  res.status(500).json({message:"Failed to fetch recipe costing by recipe number",error:err.message});
 }
};

export const createRecipeCosting=async(req,res)=>{
 try{
  const existing=await RecipeCosting.findOne({business:req.body.business,recipe:req.body.recipe});
  const costing=existing?Object.assign(existing,req.body,{isActive:true}):new RecipeCosting(req.body);
  const savedCosting=await costing.save();

  const populatedCosting=await RecipeCosting.findById(savedCosting._id)
   .populate(recipeCostingPopulate)
   .lean();

  res.status(201).json(populatedCosting);
 }catch(err){
  if(err.code===11000){
   return res.status(400).json({message:"This business already has a costing for this recipe",error:err.message});
  }

  res.status(400).json({message:"Failed to create recipe costing",error:err.message});
 }
};

export const updateRecipeCosting=async(req,res)=>{
 try{
  const updatedCosting=await RecipeCosting.findByIdAndUpdate(req.params.id,req.body,{
   returnDocument:"after",
   runValidators:true
  })
   .populate(recipeCostingPopulate)
   .lean();

  if(!updatedCosting)return res.status(404).json({message:"Recipe costing not found"});
  res.status(200).json(updatedCosting);
 }catch(err){
  res.status(400).json({message:"Failed to update recipe costing",error:err.message});
 }
};

export const deleteRecipeCosting=async(req,res)=>{
 try{
  const deletedCosting=await RecipeCosting.findByIdAndUpdate(req.params.id,{
   isActive:false
  },{
   returnDocument:"after"
  })
   .populate(recipeCostingPopulate)
   .lean();

  if(!deletedCosting)return res.status(404).json({message:"Recipe costing not found"});
  res.status(200).json({message:"Recipe costing archived successfully",costing:deletedCosting});
 }catch(err){
  res.status(500).json({message:"Failed to archive recipe costing",error:err.message});
 }
};
