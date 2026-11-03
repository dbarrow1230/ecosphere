// backend/controllers/master/VendorCategoryController.js
import VendorCategory from "../../models/master/VendorCategoryModel.js";

export const createVendorCategory=async(req,res)=>{
 try{
  const{name,code,description,isActive}=req.body;
  if(!name?.trim())return res.status(400).json({message:"Vendor category name is required"});
  const trimmedName=name.trim();
  const finalCode=code?.trim()?.toUpperCase()||undefined;
  const existingName=await VendorCategory.findOne({name:trimmedName});
  if(existingName)return res.status(409).json({message:"Vendor category name already exists"});
  if(finalCode){
   const existingCode=await VendorCategory.findOne({code:finalCode});
   if(existingCode)return res.status(409).json({message:"Vendor category code already exists"});
  }
  const vendorCategory=await VendorCategory.create({
   name:trimmedName,
   code:finalCode,
   description:description?.trim()||"",
   isActive:isActive!==undefined?isActive:true
  });
  return res.status(201).json({message:"Vendor category created successfully",vendorCategory});
 }catch(error){
  return res.status(500).json({message:"Failed to create vendor category",error:error.message});
 }
};

export const getVendorCategories=async(req,res)=>{
 try{
  const vendorCategories=await VendorCategory.find().sort({name:1});
  return res.status(200).json(vendorCategories);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch vendor categories",error:error.message});
 }
};

export const getVendorCategoryById=async(req,res)=>{
 try{
  const vendorCategory=await VendorCategory.findById(req.params.id);
  if(!vendorCategory)return res.status(404).json({message:"Vendor category not found"});
  return res.status(200).json(vendorCategory);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch vendor category",error:error.message});
 }
};

export const updateVendorCategory=async(req,res)=>{
 try{
  const{name,code,description,isActive}=req.body;
  const vendorCategory=await VendorCategory.findById(req.params.id);
  if(!vendorCategory)return res.status(404).json({message:"Vendor category not found"});
  if(name!==undefined){
   if(!name?.trim())return res.status(400).json({message:"Vendor category name is required"});
   const trimmedName=name.trim();
   const existingName=await VendorCategory.findOne({_id:{$ne:req.params.id},name:trimmedName});
   if(existingName)return res.status(409).json({message:"Vendor category name already exists"});
   vendorCategory.name=trimmedName;
  }
  if(code!==undefined){
   const finalCode=code?.trim()?code.trim().toUpperCase():undefined;
   if(finalCode){
    const existingCode=await VendorCategory.findOne({_id:{$ne:req.params.id},code:finalCode});
    if(existingCode)return res.status(409).json({message:"Vendor category code already exists"});
   }
   vendorCategory.code=finalCode;
  }
  if(description!==undefined)vendorCategory.description=description?.trim()||"";
  if(isActive!==undefined)vendorCategory.isActive=isActive;
  await vendorCategory.save();
  return res.status(200).json({message:"Vendor category updated successfully",vendorCategory});
 }catch(error){
  return res.status(500).json({message:"Failed to update vendor category",error:error.message});
 }
};

export const deleteVendorCategory=async(req,res)=>{
 try{
  const vendorCategory=await VendorCategory.findByIdAndDelete(req.params.id);
  if(!vendorCategory)return res.status(404).json({message:"Vendor category not found"});
  return res.status(200).json({message:"Vendor category deleted successfully"});
 }catch(error){
  return res.status(500).json({message:"Failed to delete vendor category",error:error.message});
 }
};