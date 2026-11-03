// backend/controllers/recipes/DietaryController.js
import Dietary from "../../models/recipes/DietaryModel.js";

const buildSlug=value=>value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-");

export const createDietary=async(req,res)=>{
 try{
  const{name,slug,description,isActive}=req.body;
  if(!name?.trim())return res.status(400).json({message:"Dietary name is required"});
  const trimmedName=name.trim();
  const finalSlug=(slug?.trim()?buildSlug(slug):buildSlug(trimmedName));
  const existingName=await Dietary.findOne({name:trimmedName});
  if(existingName)return res.status(409).json({message:"Dietary name already exists"});
  const existingSlug=await Dietary.findOne({slug:finalSlug});
  if(existingSlug)return res.status(409).json({message:"Dietary slug already exists"});
  const dietary=await Dietary.create({
   name:trimmedName,
   slug:finalSlug,
   description:description?.trim()||"",
   isActive:isActive!==undefined?isActive:true
  });
  return res.status(201).json({message:"Dietary created successfully",dietary});
 }catch(error){
  return res.status(500).json({message:"Failed to create dietary",error:error.message});
 }
};

export const getDietaries=async(req,res)=>{
 try{
  const dietaries=await Dietary.find().sort({name:1});
  return res.status(200).json(dietaries);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch dietaries",error:error.message});
 }
};

export const getDietaryById=async(req,res)=>{
 try{
  const dietary=await Dietary.findById(req.params.id);
  if(!dietary)return res.status(404).json({message:"Dietary not found"});
  return res.status(200).json(dietary);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch dietary",error:error.message});
 }
};

export const updateDietary=async(req,res)=>{
 try{
  const{name,slug,description,isActive}=req.body;
  const dietary=await Dietary.findById(req.params.id);
  if(!dietary)return res.status(404).json({message:"Dietary not found"});
  if(name!==undefined){
   if(!name?.trim())return res.status(400).json({message:"Dietary name is required"});
   const trimmedName=name.trim();
   const existingName=await Dietary.findOne({_id:{$ne:req.params.id},name:trimmedName});
   if(existingName)return res.status(409).json({message:"Dietary name already exists"});
   dietary.name=trimmedName;
  }
  const nextSlug=slug!==undefined?(slug?.trim()?buildSlug(slug):buildSlug(dietary.name)):dietary.slug;
  if(nextSlug){
   const existingSlug=await Dietary.findOne({_id:{$ne:req.params.id},slug:nextSlug});
   if(existingSlug)return res.status(409).json({message:"Dietary slug already exists"});
   dietary.slug=nextSlug;
  }
  if(description!==undefined)dietary.description=description?.trim()||"";
  if(isActive!==undefined)dietary.isActive=isActive;
  await dietary.save();
  return res.status(200).json({message:"Dietary updated successfully",dietary});
 }catch(error){
  return res.status(500).json({message:"Failed to update dietary",error:error.message});
 }
};

export const deleteDietary=async(req,res)=>{
 try{
  const dietary=await Dietary.findByIdAndDelete(req.params.id);
  if(!dietary)return res.status(404).json({message:"Dietary not found"});
  return res.status(200).json({message:"Dietary deleted successfully"});
 }catch(error){
  return res.status(500).json({message:"Failed to delete dietary",error:error.message});
 }
};