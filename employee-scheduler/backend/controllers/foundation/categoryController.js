// backend/controllers/foundation/categoryController.js
import Category from "../../models/foundation/categoryModel.js";

export const createCategory=async(req,res)=>{
 try{
  const payload={
   business:req.body.business,
   name:req.body.name||"",
   code:req.body.code||"",
   parentCategory:req.body.parentCategory||null,
   description:req.body.description||"",
   color:req.body.color||"",
   icon:req.body.icon||"",
   isActive:req.body.isActive!==undefined?req.body.isActive:true,
   notes:Array.isArray(req.body.notes)?req.body.notes:[]
  };

  if(!payload.business||!payload.name){
   return res.status(400).json({message:"business and name are required"});
  }

  const category=await Category.create(payload);

  const populatedCategory=await Category.findById(category._id)
   .populate("business","name")
   .populate("parentCategory","name code");

  res.status(201).json({
   message:"Category created successfully",
   data:populatedCategory
  });
 }catch(err){
  if(err?.code===11000){
   return res.status(409).json({message:"Category code already exists for this business"});
  }
  res.status(500).json({message:"Failed to create category",error:err.message});
 }
};

export const getCategories=async(req,res)=>{
 try{
  const query={};

  if(req.query.business)query.business=req.query.business;
  if(req.query.parentCategory)query.parentCategory=req.query.parentCategory;
  if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";
  if(req.query.search){
   const value=req.query.search.trim();
   query.$or=[
    {name:{$regex:value,$options:"i"}},
    {code:{$regex:value,$options:"i"}},
    {description:{$regex:value,$options:"i"}}
   ];
  }

  const categories=await Category.find(query)
   .populate("business","name")
   .populate("parentCategory","name code")
   .sort({name:1});

  res.status(200).json({
   message:"Categories fetched successfully",
   data:categories
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch categories",error:err.message});
 }
};

export const getCategoryById=async(req,res)=>{
 try{
  const category=await Category.findById(req.params.id)
   .populate("business","name")
   .populate("parentCategory","name code");

  if(!category){
   return res.status(404).json({message:"Category not found"});
  }

  res.status(200).json({
   message:"Category fetched successfully",
   data:category
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch category",error:err.message});
 }
};

export const updateCategory=async(req,res)=>{
 try{
  const existing=await Category.findById(req.params.id);

  if(!existing){
   return res.status(404).json({message:"Category not found"});
  }

  const category=await Category.findByIdAndUpdate(
   req.params.id,
   {
    $set:{
     business:req.body.business!==undefined?req.body.business:existing.business,
     name:req.body.name!==undefined?req.body.name:existing.name,
     code:req.body.code!==undefined?req.body.code:existing.code,
     parentCategory:req.body.parentCategory!==undefined?req.body.parentCategory:existing.parentCategory,
     description:req.body.description!==undefined?req.body.description:existing.description,
     color:req.body.color!==undefined?req.body.color:existing.color,
     icon:req.body.icon!==undefined?req.body.icon:existing.icon,
     isActive:req.body.isActive!==undefined?req.body.isActive:existing.isActive,
     notes:req.body.notes!==undefined?req.body.notes:existing.notes
    }
   },
   {returnDocument:"after",runValidators:true}
  )
   .populate("business","name")
   .populate("parentCategory","name code");

  res.status(200).json({
   message:"Category updated successfully",
   data:category
  });
 }catch(err){
  if(err?.code===11000){
   return res.status(409).json({message:"Category code already exists for this business"});
  }
  res.status(500).json({message:"Failed to update category",error:err.message});
 }
};

export const deleteCategory=async(req,res)=>{
 try{
  const category=await Category.findByIdAndDelete(req.params.id);

  if(!category){
   return res.status(404).json({message:"Category not found"});
  }

  res.status(200).json({
   message:"Category deleted successfully"
  });
 }catch(err){
  res.status(500).json({message:"Failed to delete category",error:err.message});
 }
};