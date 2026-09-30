// backend/controllers/categoryController.js
import Category from "../../models/reference/categoryModel.js";

const makeSlug=value=>String(value||"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)+/g,"");

export const createCategory=async(req,res)=>{
 try{
  const{name,slug,description,image,status}=req.body;
  const categoryName=String(name||"").trim();

  if(!categoryName)return res.status(400).json({success:false,message:"Name is required"});
  const exactName=new RegExp(`^${categoryName.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}$`,"i");
  const existing=await Category.findOne({name:exactName});
  if(existing)return res.status(200).json({success:true,category:existing,alreadyExists:true});

  const category=new Category({
   name:categoryName,
   slug:slug&&String(slug).trim()?makeSlug(slug):makeSlug(categoryName),
   description:description||"",
   image:image||"",
   status:status||"active"
  });

  const saved=await category.save();
  return res.status(201).json({success:true,category:saved});
 }catch(error){
  if(error.code===11000)return res.status(409).json({success:false,message:"A category with this name or slug already exists."});
  return res.status(500).json({success:false,message:error.message});
 }
};

export const getCategories=async(req,res)=>{
 try{
  const categories=await Category.find().sort({name:1});
  return res.status(200).json({success:true,categories});
 }catch(error){
  return res.status(500).json({success:false,message:error.message});
 }
};

export const updateCategory=async(req,res)=>{
 try{
  const{id}=req.params;
  const updated=await Category.findByIdAndUpdate(id,req.body,{returnDocument:"after"});
  return res.status(200).json({success:true,category:updated});
 }catch(error){
  return res.status(500).json({success:false,message:error.message});
 }
};

export const deleteCategory=async(req,res)=>{
 try{
  const{id}=req.params;
  await Category.findByIdAndDelete(id);
  return res.status(200).json({success:true});
 }catch(error){
  return res.status(500).json({success:false,message:error.message});
 }
};
