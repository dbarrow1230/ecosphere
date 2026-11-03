import Allergen from "../../models/recipes/AllergenModel.js";

const clean=body=>({name:String(body.name||"").trim(),emoji:String(body.emoji||"").trim(),description:String(body.description||"").trim(),isActive:body.isActive!==false});

export const createAllergen=async(req,res)=>{
 try{const payload=clean(req.body);if(!payload.name)return res.status(400).json({message:"Allergen name is required"});const allergen=await Allergen.create(payload);return res.status(201).json({message:"Allergen created successfully",allergen});}
 catch(error){if(error.code===11000)return res.status(409).json({message:"Allergen name already exists"});return res.status(500).json({message:"Failed to create allergen",error:error.message});}
};

export const getAllergens=async(req,res)=>{try{return res.json(await Allergen.find().sort({name:1}));}catch(error){return res.status(500).json({message:"Failed to fetch allergens",error:error.message});}};
export const getAllergenById=async(req,res)=>{try{const allergen=await Allergen.findById(req.params.id);return allergen?res.json(allergen):res.status(404).json({message:"Allergen not found"});}catch(error){return res.status(500).json({message:"Failed to fetch allergen",error:error.message});}};
export const updateAllergen=async(req,res)=>{try{const payload=clean(req.body);if(!payload.name)return res.status(400).json({message:"Allergen name is required"});const allergen=await Allergen.findByIdAndUpdate(req.params.id,payload,{returnDocument:"after",runValidators:true});return allergen?res.json({message:"Allergen updated successfully",allergen}):res.status(404).json({message:"Allergen not found"});}catch(error){if(error.code===11000)return res.status(409).json({message:"Allergen name already exists"});return res.status(500).json({message:"Failed to update allergen",error:error.message});}};
export const deleteAllergen=async(req,res)=>{try{const allergen=await Allergen.findByIdAndDelete(req.params.id);return allergen?res.json({message:"Allergen deleted successfully"}):res.status(404).json({message:"Allergen not found"});}catch(error){return res.status(500).json({message:"Failed to delete allergen",error:error.message});}};
