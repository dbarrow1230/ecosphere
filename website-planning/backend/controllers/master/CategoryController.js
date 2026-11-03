// backend/controllers/master/CategoryController.js
import Category from "../../models/master/CategoryModel.js";

const buildSlug=value=>value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-");

export const createCategory=async(req,res)=>{
 try{
  const{name,slug,description,isActive}=req.body;
  if(!name?.trim())return res.status(400).json({message:"Category name is required"});
  const trimmedName=name.trim();
  const finalSlug=(slug?.trim()?buildSlug(slug):buildSlug(trimmedName));
  const existingName=await Category.findOne({name:trimmedName});
  if(existingName)return res.status(409).json({message:"Category name already exists"});
  const existingSlug=await Category.findOne({slug:finalSlug});
  if(existingSlug)return res.status(409).json({message:"Category slug already exists"});
  const category=await Category.create({
   name:trimmedName,
   slug:finalSlug,
   description:description?.trim()||"",
   isActive:isActive!==undefined?isActive:true
  });
  return res.status(201).json({message:"Category created successfully",category});
 }catch(error){
  return res.status(500).json({message:"Failed to create category",error:error.message});
 }
};

export const getCategories=async(req,res)=>{
 try{
  const categories=await Category.find().sort({name:1});
  return res.status(200).json(categories);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch categories",error:error.message});
 }
};

export const getCategoryById=async(req,res)=>{
 try{
  const category=await Category.findById(req.params.id);
  if(!category)return res.status(404).json({message:"Category not found"});
  return res.status(200).json(category);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch category",error:error.message});
 }
};

export const updateCategory=async(req,res)=>{
 try{
  const{name,slug,description,isActive}=req.body;
  const category=await Category.findById(req.params.id);
  if(!category)return res.status(404).json({message:"Category not found"});
  if(name!==undefined){
   if(!name?.trim())return res.status(400).json({message:"Category name is required"});
   const trimmedName=name.trim();
   const existingName=await Category.findOne({_id:{$ne:req.params.id},name:trimmedName});
   if(existingName)return res.status(409).json({message:"Category name already exists"});
   category.name=trimmedName;
  }
  const nextSlug=slug!==undefined?(slug?.trim()?buildSlug(slug):buildSlug(category.name)):category.slug;
  if(nextSlug){
   const existingSlug=await Category.findOne({_id:{$ne:req.params.id},slug:nextSlug});
   if(existingSlug)return res.status(409).json({message:"Category slug already exists"});
   category.slug=nextSlug;
  }
  if(description!==undefined)category.description=description?.trim()||"";
  if(isActive!==undefined)category.isActive=isActive;
  await category.save();
  return res.status(200).json({message:"Category updated successfully",category});
 }catch(error){
  return res.status(500).json({message:"Failed to update category",error:error.message});
 }
};

export const deleteCategory=async(req,res)=>{
 try{
  const category=await Category.findByIdAndDelete(req.params.id);
  if(!category)return res.status(404).json({message:"Category not found"});
  return res.status(200).json({message:"Category deleted successfully"});
 }catch(error){
  return res.status(500).json({message:"Failed to delete category",error:error.message});
 }
};