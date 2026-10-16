// backend/controllers/recipes/VendorCategoryController.js
import VendorCategory from "../../models/recipes/VendorCategoryModel.js";
import mongoose from "mongoose";

const validateParent=async(parent,categoryId="")=>{
 if(!parent)return null;
 if(!mongoose.isValidObjectId(parent))throw new Error("Choose a valid parent category.");
 const seen=new Set([String(categoryId)]);let current=String(parent);
 while(current){if(seen.has(current))throw new Error("A category cannot be its own parent or descendant.");seen.add(current);const record=await VendorCategory.findById(current);if(!record||record.isActive===false)throw new Error("Parent category is unavailable.");current=record.parent?String(record.parent):"";}
 return parent;
};
const buildSlug=value=>String(value||"").toLowerCase().trim().replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-");

export const createVendorCategory=async(req,res)=>{
 try{
  const{name,slug,code,description,isActive,parent}=req.body;
  if(!name?.trim())return res.status(400).json({message:"Vendor category name is required"});
  const trimmedName=name.trim();
  const finalCode=code?.trim()?.toUpperCase()||undefined;
  const finalSlug=buildSlug(slug||trimmedName);
  const existingName=await VendorCategory.findOne({name:trimmedName});
  if(existingName)return res.status(409).json({message:"Vendor category name already exists"});
  if(finalCode){
   const existingCode=await VendorCategory.findOne({code:finalCode});
   if(existingCode)return res.status(409).json({message:"Vendor category code already exists"});
  }
  const existingSlug=await VendorCategory.findOne({slug:finalSlug});
  if(existingSlug)return res.status(409).json({message:"Vendor category slug already exists"});
  let parentId;try{parentId=await validateParent(parent);}catch(error){return res.status(400).json({message:error.message});}
  const vendorCategory=await VendorCategory.create({
   parent:parentId,
   name:trimmedName,
   slug:finalSlug,
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
  const vendorCategories=await VendorCategory.find({isActive:{$ne:false}}).sort({name:1});
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
  const{name,slug,code,description,isActive}=req.body;
  const vendorCategory=await VendorCategory.findById(req.params.id);
  if(!vendorCategory)return res.status(404).json({message:"Vendor category not found"});
  if(Object.hasOwn(req.body,"parent")){try{vendorCategory.parent=await validateParent(req.body.parent,req.params.id);}catch(error){return res.status(400).json({message:error.message});}}
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
  if(slug!==undefined||name!==undefined){
   const finalSlug=buildSlug(slug||vendorCategory.name);
   const existingSlug=await VendorCategory.findOne({_id:{$ne:req.params.id},slug:finalSlug});
   if(existingSlug)return res.status(409).json({message:"Vendor category slug already exists"});
   vendorCategory.slug=finalSlug;
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
  if(await VendorCategory.exists({parent:req.params.id}))return res.status(409).json({message:"Move or remove subcategories before deleting this category."});
  const vendorCategory=await VendorCategory.findByIdAndDelete(req.params.id);
  if(!vendorCategory)return res.status(404).json({message:"Vendor category not found"});
  return res.status(200).json({message:"Vendor category deleted successfully"});
 }catch(error){
  return res.status(500).json({message:"Failed to delete vendor category",error:error.message});
 }
};
