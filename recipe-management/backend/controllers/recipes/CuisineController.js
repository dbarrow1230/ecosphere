// backend/controllers/recipes/CuisineController.js
import Cuisine from "../../models/recipes/CuisineModel.js";

const buildSlug=value=>value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-");

export const createCuisine=async(req,res)=>{
 try{
  const{name,slug,description,isActive}=req.body;
  if(!name?.trim())return res.status(400).json({message:"Cuisine name is required"});
  const trimmedName=name.trim();
  const finalSlug=(slug?.trim()?buildSlug(slug):buildSlug(trimmedName));
  const existingName=await Cuisine.findOne({name:trimmedName});
  if(existingName)return res.status(409).json({message:"Cuisine name already exists"});
  const existingSlug=await Cuisine.findOne({slug:finalSlug});
  if(existingSlug)return res.status(409).json({message:"Cuisine slug already exists"});
  const cuisine=await Cuisine.create({
   name:trimmedName,
   slug:finalSlug,
   description:description?.trim()||"",
   isActive:isActive!==undefined?isActive:true
  });
  return res.status(201).json({message:"Cuisine created successfully",cuisine});
 }catch(error){
  return res.status(500).json({message:"Failed to create cuisine",error:error.message});
 }
};

export const getCuisines=async(req,res)=>{
 try{
  const cuisines=await Cuisine.find().sort({name:1});
  return res.status(200).json(cuisines);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch cuisines",error:error.message});
 }
};

export const getCuisineById=async(req,res)=>{
 try{
  const cuisine=await Cuisine.findById(req.params.id);
  if(!cuisine)return res.status(404).json({message:"Cuisine not found"});
  return res.status(200).json(cuisine);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch cuisine",error:error.message});
 }
};

export const updateCuisine=async(req,res)=>{
 try{
  const{name,slug,description,isActive}=req.body;
  const cuisine=await Cuisine.findById(req.params.id);
  if(!cuisine)return res.status(404).json({message:"Cuisine not found"});
  if(name!==undefined){
   if(!name?.trim())return res.status(400).json({message:"Cuisine name is required"});
   const trimmedName=name.trim();
   const existingName=await Cuisine.findOne({_id:{$ne:req.params.id},name:trimmedName});
   if(existingName)return res.status(409).json({message:"Cuisine name already exists"});
   cuisine.name=trimmedName;
  }
  const nextSlug=slug!==undefined?(slug?.trim()?buildSlug(slug):buildSlug(cuisine.name)):cuisine.slug;
  if(nextSlug){
   const existingSlug=await Cuisine.findOne({_id:{$ne:req.params.id},slug:nextSlug});
   if(existingSlug)return res.status(409).json({message:"Cuisine slug already exists"});
   cuisine.slug=nextSlug;
  }
  if(description!==undefined)cuisine.description=description?.trim()||"";
  if(isActive!==undefined)cuisine.isActive=isActive;
  await cuisine.save();
  return res.status(200).json({message:"Cuisine updated successfully",cuisine});
 }catch(error){
  return res.status(500).json({message:"Failed to update cuisine",error:error.message});
 }
};

export const deleteCuisine=async(req,res)=>{
 try{
  const cuisine=await Cuisine.findByIdAndDelete(req.params.id);
  if(!cuisine)return res.status(404).json({message:"Cuisine not found"});
  return res.status(200).json({message:"Cuisine deleted successfully"});
 }catch(error){
  return res.status(500).json({message:"Failed to delete cuisine",error:error.message});
 }
};