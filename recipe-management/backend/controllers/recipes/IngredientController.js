import {cleanIngredientName} from "../../../../shared/culinary/ingredientRows.js";
import Ingredient from "../../models/recipes/IngredientModel.js";
import Recipe from "../../models/recipes/ReceipeModel.js";
import RecipeCosting from "../../models/recipes/RecipeCostingModel.js";
import VendorIngredientPrice from "../../models/recipes/VendorIngredientPriceModel.js";
import "../../models/recipes/CategoryModel.js";

const clean=body=>({
 name:cleanIngredientName(body.name||body.ingredientName),description:String(body.description||"").trim(),
 unit:String(body.unit||"g").trim(),notes:String(body.notes||"").trim(),isActive:body.isActive!==false,
 business:body.business?._id||body.business||null,category:body.category?._id||body.category||null,
 ingredientName:cleanIngredientName(body.name||body.ingredientName),isCostingIngredient:body.isCostingIngredient===true
});

export const createIngredient=async(req,res)=>{
 try{
  const payload=clean(req.body);
  if(!payload.name)return res.status(400).json({message:"Ingredient name is required"});
  if(!payload.unit)return res.status(400).json({message:"Ingredient unit is required"});
  const ingredient=await Ingredient.create(payload);
  return res.status(201).json({message:"Ingredient created successfully",ingredient});
 }catch(error){
  if(error.code===11000)return res.status(409).json({message:"Ingredient name already exists"});
  return res.status(500).json({message:"Failed to create ingredient",error:error.message});
 }
};

export const getIngredients=async(req,res)=>{
 try{
  const filter={recordType:{$nin:["label","instruction"]}};
  if(req.query.business)filter.business=req.query.business;
  if(req.query.isActive!==undefined)filter.isActive=req.query.isActive==="true";
  const ingredients=await Ingredient.find(filter).populate("business category").sort({name:1});
  return res.json(ingredients);
 }catch(error){return res.status(500).json({message:"Failed to fetch ingredients",error:error.message});}
};

export const getIngredientById=async(req,res)=>{
 try{
  const ingredient=await Ingredient.findById(req.params.id).populate("business category");
  if(!ingredient)return res.status(404).json({message:"Ingredient not found"});
  return res.json(ingredient);
 }catch(error){return res.status(500).json({message:"Failed to fetch ingredient",error:error.message});}
};

export const updateIngredient=async(req,res)=>{
 try{
  const existing=await Ingredient.findById(req.params.id);
  if(!existing)return res.status(404).json({message:"Ingredient not found"});
  const payload=clean({...existing.toObject(),...req.body});
  if(!payload.name||!payload.unit)return res.status(400).json({message:"Ingredient name and unit are required"});
  const ingredient=await Ingredient.findByIdAndUpdate(req.params.id,payload,{returnDocument:"after",runValidators:true});
  if(!ingredient)return res.status(404).json({message:"Ingredient not found"});
  return res.json({message:"Ingredient updated successfully",ingredient});
 }catch(error){
  if(error.code===11000)return res.status(409).json({message:"Ingredient name already exists"});
  return res.status(500).json({message:"Failed to update ingredient",error:error.message});
 }
};

export const deleteIngredient=async(req,res)=>{
 try{
  const uses=await Promise.all([Recipe.countDocuments({"ingredients.ingredient":req.params.id}),RecipeCosting.countDocuments({"ingredients.ingredient":req.params.id}),VendorIngredientPrice.countDocuments({ingredient:req.params.id})]);
  if(uses.some(Boolean))return res.status(409).json({message:"This ingredient is linked to recipes, costings, or vendor prices."});
  const ingredient=await Ingredient.findByIdAndDelete(req.params.id);
  if(!ingredient)return res.status(404).json({message:"Ingredient not found"});
  return res.json({message:"Ingredient deleted successfully"});
 }catch(error){return res.status(500).json({message:"Failed to delete ingredient",error:error.message});}
};
