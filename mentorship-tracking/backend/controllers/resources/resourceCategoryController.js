// backend/controllers/resources/resourceCategoryController.js
import ResourceCategory from "../../models/resources/resourceCategoryModel.js";

export const createResourceCategory=async(req,res)=>{
 try{
  const category=await ResourceCategory.create({...req.body,createdBy:req.user?._id||req.body.createdBy});
  res.status(201).json(category);
 }catch(error){
  res.status(400).json({message:error.message});
 }
};

export const getResourceCategories=async(req,res)=>{
 try{
  const categories=await ResourceCategory.find().sort({name:1});
  res.status(200).json(categories);
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

export const getResourceCategoryById=async(req,res)=>{
 try{
  const category=await ResourceCategory.findById(req.params.id);

  if(!category){
   return res.status(404).json({message:"Resource category not found"});
  }

  res.status(200).json(category);
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

export const updateResourceCategory=async(req,res)=>{
 try{
  const category=await ResourceCategory.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after",runValidators:true});

  if(!category){
   return res.status(404).json({message:"Resource category not found"});
  }

  res.status(200).json(category);
 }catch(error){
  res.status(400).json({message:error.message});
 }
};

export const deleteResourceCategory=async(req,res)=>{
 try{
  const category=await ResourceCategory.findByIdAndDelete(req.params.id);

  if(!category){
   return res.status(404).json({message:"Resource category not found"});
  }

  res.status(200).json({message:"Resource category deleted"});
 }catch(error){
  res.status(500).json({message:error.message});
 }
};
