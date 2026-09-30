import Recipe from "../../models/recipes/ReceipeModel.js";
import "../../models/recipes/IngredientModel.js";
import "../../models/recipes/CategoryModel.js";
import "../../models/recipes/CourseModel.js";
import "../../models/recipes/CuisineModel.js";
import "../../models/recipes/DietaryModel.js";
import "../../models/reference/ImperialUnitModel.js";
import "../../models/reference/MetricUnitModel.js";

const populate="business cuisine course category dietaryConsiderations yield.imperialUnit yield.metricUnit servingSize.imperialUnit servingSize.metricUnit ingredients.ingredient ingredients.imperialUnit ingredients.metricUnit";

export const getRecipes=async(req,res)=>{
 try{
  const query={};
  if(req.query.business)query.business=req.query.business;
  if(req.query.isActive==="true")query.isActive=true;
  if(req.query.isActive==="false")query.isActive=false;
  const rows=await Recipe.find(query).populate(populate).sort({name:1}).lean();
  res.status(200).json(rows);
 }catch(error){
  res.status(500).json({message:"Failed to load recipes",error:error.message});
 }
};

export const getRecipeById=async(req,res)=>{
 try{
  const row=await Recipe.findById(req.params.id).populate(populate).lean();
  if(!row)return res.status(404).json({message:"Recipe not found"});
  res.status(200).json(row);
 }catch(error){
  res.status(400).json({message:"Failed to load recipe",error:error.message});
 }
};
