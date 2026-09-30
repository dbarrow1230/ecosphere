import Ingredient from "../../models/recipes/IngredientModel.js";

const clean=body=>({
 name:String(body.name||"").trim(),description:String(body.description||"").trim(),
 unit:String(body.unit||"").trim(),notes:String(body.notes||"").trim(),isActive:body.isActive!==false
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
  const filter={};
  if(req.query.isActive!==undefined)filter.isActive=req.query.isActive==="true";
  const ingredients=await Ingredient.find(filter).sort({name:1});
  return res.json(ingredients);
 }catch(error){return res.status(500).json({message:"Failed to fetch ingredients",error:error.message});}
};

export const getIngredientById=async(req,res)=>{
 try{
  const ingredient=await Ingredient.findById(req.params.id);
  if(!ingredient)return res.status(404).json({message:"Ingredient not found"});
  return res.json(ingredient);
 }catch(error){return res.status(500).json({message:"Failed to fetch ingredient",error:error.message});}
};

export const updateIngredient=async(req,res)=>{
 try{
  const payload=clean(req.body);
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
  const ingredient=await Ingredient.findByIdAndDelete(req.params.id);
  if(!ingredient)return res.status(404).json({message:"Ingredient not found"});
  return res.json({message:"Ingredient deleted successfully"});
 }catch(error){return res.status(500).json({message:"Failed to delete ingredient",error:error.message});}
};