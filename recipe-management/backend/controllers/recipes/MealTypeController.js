import MealType from "../../models/recipes/MealTypeModel.js";

const slugify=value=>String(value||"").toLowerCase().trim().replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-");

export const getMealTypes=async(req,res)=>{
 try{return res.json(await MealType.find().sort({name:1}));}
 catch(error){return res.status(500).json({message:"Failed to fetch meal types",error:error.message});}
};
export const createMealType=async(req,res)=>{
 try{
  const name=String(req.body.name||"").trim();
  if(!name)return res.status(400).json({message:"Meal type name is required"});
  const mealType=await MealType.create({name,slug:slugify(req.body.slug||name),description:String(req.body.description||"").trim(),isActive:req.body.isActive!==false});
  return res.status(201).json({message:"Meal type created successfully",mealType});
 }catch(error){if(error.code===11000)return res.status(409).json({message:"Meal type already exists"});return res.status(500).json({message:"Failed to create meal type",error:error.message});}
};
export const updateMealType=async(req,res)=>{
 try{
  const name=String(req.body.name||"").trim();
  if(!name)return res.status(400).json({message:"Meal type name is required"});
  const mealType=await MealType.findByIdAndUpdate(req.params.id,{name,slug:slugify(req.body.slug||name),description:String(req.body.description||"").trim(),isActive:req.body.isActive!==false},{returnDocument:"after",runValidators:true});
  if(!mealType)return res.status(404).json({message:"Meal type not found"});
  return res.json({message:"Meal type updated successfully",mealType});
 }catch(error){if(error.code===11000)return res.status(409).json({message:"Meal type already exists"});return res.status(500).json({message:"Failed to update meal type",error:error.message});}
};
export const deleteMealType=async(req,res)=>{
 try{const mealType=await MealType.findByIdAndDelete(req.params.id);if(!mealType)return res.status(404).json({message:"Meal type not found"});return res.json({message:"Meal type deleted successfully"});}
 catch(error){return res.status(500).json({message:"Failed to delete meal type",error:error.message});}
};
