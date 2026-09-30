import Ingredient from "../../models/recipes/IngredientModel.js";
import Recipe from "../../models/recipes/ReceipeModel.js";
import VendorIngredientPrice from "../../models/recipes/VendorIngredientPriceModel.js";
import "../../models/recipes/CategoryModel.js";
import {ingredientDisplayName,ingredientIdentity} from "../../utils/ingredientIdentity.js";

const idOf=value=>typeof value==="object"?(value?._id||null):(value||null);
const ingredientPayload=body=>({
 business:idOf(body.business),
 name:ingredientDisplayName(body.name||body.ingredientName),
 ingredientName:ingredientDisplayName(body.name||body.ingredientName),
 category:idOf(body.category),
 description:String(body.description||"").trim(),
 isCostingIngredient:body.isCostingIngredient!==false,
 isActive:body.isActive!==false
});

const findDuplicateIngredient=async(payload,excludeId=null)=>{
 const query={};
 if(payload.business)query.business=payload.business;
 else query.$or=[{business:null},{business:{$exists:false}}];
 if(excludeId)query._id={$ne:excludeId};

 const candidates=await Ingredient.find(query).select("name ingredientName").lean();
 const identity=ingredientIdentity(payload.name);
 return candidates.find(candidate=>ingredientIdentity(candidate)===identity)||null;
};

export const createIngredient=async(req,res)=>{
 try{
  const payload=ingredientPayload(req.body);
  if(!payload.name)return res.status(400).json({message:"Ingredient name is required"});
  const duplicate=await findDuplicateIngredient(payload);
  if(duplicate)return res.status(409).json({message:"This ingredient already exists. Use the existing global ingredient; recipe quantities belong on the recipe line.",ingredient:duplicate});
  const row=await Ingredient.create(payload);
  res.status(201).json(row);
 }catch(error){
  res.status(400).json({message:"Failed to create ingredient",error:error.message});
 }
};

export const getIngredients=async(req,res)=>{
 try{
  const query={};
  if(req.query.business)query.business=req.query.business;
  if(req.query.isActive==="true")query.isActive=true;
  if(req.query.isActive==="false")query.isActive=false;
  const rows=await Ingredient.find(query).populate("business category").sort({name:1,ingredientName:1}).lean();
  res.status(200).json(rows);
 }catch(error){
  res.status(500).json({message:"Failed to load ingredients",error:error.message});
 }
};

export const updateIngredient=async(req,res)=>{
 try{
  const existing=await Ingredient.findById(req.params.id);
  if(!existing)return res.status(404).json({message:"Ingredient not found"});
  const payload=ingredientPayload({...existing.toObject(),...req.body});
  if(!payload.name)return res.status(400).json({message:"Ingredient name is required"});
  const duplicate=await findDuplicateIngredient(payload,existing._id);
  if(duplicate)return res.status(409).json({message:"Another global ingredient already uses this name.",ingredient:duplicate});
  Object.assign(existing,payload);
  await existing.save();
  const row=await Ingredient.findById(existing._id).populate("business category").lean();
  res.status(200).json(row);
 }catch(error){
  res.status(400).json({message:"Failed to update ingredient",error:error.message});
 }
};

export const deleteIngredient=async(req,res)=>{
 try{
  const [recipeUses,vendorPriceUses]=await Promise.all([
   Recipe.countDocuments({"ingredients.ingredient":req.params.id}),
   VendorIngredientPrice.countDocuments({ingredient:req.params.id})
  ]);
  if(recipeUses||vendorPriceUses){
   return res.status(409).json({message:`This ingredient cannot be deleted because it is used by ${recipeUses} recipe${recipeUses===1?"":"s"} and ${vendorPriceUses} vendor price${vendorPriceUses===1?"":"s"}. Remove those links first.`});
  }
  const row=await Ingredient.findByIdAndDelete(req.params.id);
  if(!row)return res.status(404).json({message:"Ingredient not found"});
  res.status(200).json({message:"Ingredient deleted"});
 }catch(error){
  res.status(400).json({message:"Failed to delete ingredient",error:error.message});
 }
};

export const getIngredientById=async(req,res)=>{
 try{
  const row=await Ingredient.findById(req.params.id).populate("business category").lean();
  if(!row)return res.status(404).json({message:"Ingredient not found"});
  res.status(200).json(row);
 }catch(error){
  res.status(400).json({message:"Failed to load ingredient",error:error.message});
 }
};
