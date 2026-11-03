//backend/controllers/foundation/categoryController.js
import Category from "../../models/foundation/categoryModel.js";

export const createCategory=async(req,res)=>{
 try{
  const payload={...req.body};
  if(req.user?._id) payload.createdBy=req.user._id;

  const category=await Category.create(payload);
  return res.status(201).json(category);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const getCategories=async(req,res)=>{
 try{
  const query={};
  if(req.query.type) query.type=req.query.type;
  if(req.query.parent) query.parent=req.query.parent;
  if(req.query.isActive!==undefined) query.isActive=req.query.isActive==="true";

  const categories=await Category.find(query)
  .populate("parent")
  .populate("createdBy","firstName lastName email")
  .populate("updatedBy","firstName lastName email")
  .sort({sortOrder:1,name:1});

  return res.status(200).json(categories);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const getCategoryById=async(req,res)=>{
 try{
  const category=await Category.findById(req.params.id)
  .populate("parent")
  .populate("createdBy","firstName lastName email")
  .populate("updatedBy","firstName lastName email");

  if(!category){
   return res.status(404).json({message:"Category not found"});
  }

  return res.status(200).json(category);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const updateCategory=async(req,res)=>{
 try{
  const payload={...req.body};
  if(req.user?._id) payload.updatedBy=req.user._id;

  const category=await Category.findByIdAndUpdate(
   req.params.id,
   {$set:payload},
   {returnDocument:"after",runValidators:true}
  )
  .populate("parent")
  .populate("createdBy","firstName lastName email")
  .populate("updatedBy","firstName lastName email");

  if(!category){
   return res.status(404).json({message:"Category not found"});
  }

  return res.status(200).json(category);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const deleteCategory=async(req,res)=>{
 try{
  const category=await Category.findById(req.params.id);

  if(!category){
   return res.status(404).json({message:"Category not found"});
  }

  await category.deleteOne();

  return res.status(200).json({message:"Category removed"});
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const deactivateCategory=async(req,res)=>{
 try{
  const category=await Category.findById(req.params.id);

  if(!category){
   return res.status(404).json({message:"Category not found"});
  }

  category.isActive=false;
  if(req.user?._id) category.updatedBy=req.user._id;

  const updatedCategory=await category.save();

  return res.status(200).json(updatedCategory);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};