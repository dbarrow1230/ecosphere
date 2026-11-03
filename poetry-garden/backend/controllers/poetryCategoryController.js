// backend/controllers/poetryCategoryController.js
import PoetryCategory from "../models/PoetryCategory.js";

export const getPoetryCategories=async(req,res)=>{
 try{
  const categories=await PoetryCategory.find().sort({name:1});
  res.json(categories);
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

export const getPoetryCategory=async(req,res)=>{
 try{
  const category=await PoetryCategory.findById(req.params.id);

  if(!category){
   return res.status(404).json({message:"Poetry category not found"});
  }

  res.json(category);
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

export const createPoetryCategory=async(req,res)=>{
 try{
  const category=await PoetryCategory.create(req.body);
  res.status(201).json(category);
 }catch(error){
  if(error.code===11000){
   return res.status(409).json({message:"Poetry category already exists"});
  }

  res.status(400).json({message:error.message});
 }
};

export const updatePoetryCategory=async(req,res)=>{
 try{
  const category=await PoetryCategory.findByIdAndUpdate(
   req.params.id,
   req.body,
   {returnDocument:"after",runValidators:true}
  );

  if(!category){
   return res.status(404).json({message:"Poetry category not found"});
  }

  res.json(category);
 }catch(error){
  if(error.code===11000){
   return res.status(409).json({message:"Poetry category already exists"});
  }

  res.status(400).json({message:error.message});
 }
};

export const deletePoetryCategory=async(req,res)=>{
 try{
  const category=await PoetryCategory.findByIdAndDelete(req.params.id);

  if(!category){
   return res.status(404).json({message:"Poetry category not found"});
  }

  res.json({message:"Poetry category deleted"});
 }catch(error){
  res.status(500).json({message:error.message});
 }
};