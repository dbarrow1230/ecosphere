// /backend/controllers/categoryController.js
import Category from '../models/categoryModel.js';

export const createCategory=async(req,res)=>{
try{
const{name,slug,description,image,parentCategory,isActive}=req.body;
if(!name||!slug)return res.status(400).json({success:false,message:'Name and slug are required'});
const existing=await Category.findOne({$or:[{name:name.trim()},{slug:slug.trim().toLowerCase()}]});
if(existing)return res.status(409).json({success:false,message:'Category with this name or slug already exists'});
const category=await Category.create({name,slug,description,image,parentCategory,isActive});
res.status(201).json({success:true,message:'Category created successfully',category});
}catch(error){
res.status(500).json({success:false,message:'Error creating category',error:error.message});
}
};

export const getCategories=async(req,res)=>{
try{
const categories=await Category.find({}).populate('parentCategory').sort({createdAt:-1});
res.status(200).json({success:true,count:categories.length,categories});
}catch(error){
res.status(500).json({success:false,message:'Error fetching categories',error:error.message});
}
};

export const getActiveCategories=async(req,res)=>{
try{
const categories=await Category.find({isActive:true}).populate('parentCategory').sort({name:1});
res.status(200).json({success:true,count:categories.length,categories});
}catch(error){
res.status(500).json({success:false,message:'Error fetching active categories',error:error.message});
}
};

export const getParentCategories=async(req,res)=>{
try{
const categories=await Category.find({parentCategory:null,isActive:true}).sort({name:1});
res.status(200).json({success:true,count:categories.length,categories});
}catch(error){
res.status(500).json({success:false,message:'Error fetching parent categories',error:error.message});
}
};

export const getCategoryById=async(req,res)=>{
try{
const category=await Category.findById(req.params.id).populate('parentCategory');
if(!category)return res.status(404).json({success:false,message:'Category not found'});
res.status(200).json({success:true,category});
}catch(error){
res.status(500).json({success:false,message:'Error fetching category',error:error.message});
}
};

export const getCategoryBySlug=async(req,res)=>{
try{
const category=await Category.findOne({slug:req.params.slug.trim().toLowerCase()}).populate('parentCategory');
if(!category)return res.status(404).json({success:false,message:'Category not found'});
res.status(200).json({success:true,category});
}catch(error){
res.status(500).json({success:false,message:'Error fetching category',error:error.message});
}
};

export const updateCategory=async(req,res)=>{
try{
const{name,slug,description,image,parentCategory,isActive}=req.body;
const category=await Category.findById(req.params.id);
if(!category)return res.status(404).json({success:false,message:'Category not found'});
if(name&&name.trim()!==category.name){
const existingName=await Category.findOne({name:name.trim(),_id:{$ne:req.params.id}});
if(existingName)return res.status(409).json({success:false,message:'Category name already exists'});
}
if(slug&&slug.trim().toLowerCase()!==category.slug){
const existingSlug=await Category.findOne({slug:slug.trim().toLowerCase(),_id:{$ne:req.params.id}});
if(existingSlug)return res.status(409).json({success:false,message:'Category slug already exists'});
}
category.name=name??category.name;
category.slug=slug?slug.trim().toLowerCase():category.slug;
category.description=description??category.description;
category.image=image??category.image;
category.parentCategory=parentCategory!==undefined?parentCategory:category.parentCategory;
category.isActive=isActive!==undefined?isActive:category.isActive;
await category.save();
const updatedCategory=await Category.findById(category._id).populate('parentCategory');
res.status(200).json({success:true,message:'Category updated successfully',category:updatedCategory});
}catch(error){
res.status(500).json({success:false,message:'Error updating category',error:error.message});
}
};

export const deleteCategory=async(req,res)=>{
try{
const category=await Category.findById(req.params.id);
if(!category)return res.status(404).json({success:false,message:'Category not found'});
await Category.findByIdAndDelete(req.params.id);
res.status(200).json({success:true,message:'Category deleted successfully'});
}catch(error){
res.status(500).json({success:false,message:'Error deleting category',error:error.message});
}
};