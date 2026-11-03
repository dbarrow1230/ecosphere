// backend/controllers/studies/libraryItemController.js
import LibraryItem from "../../models/studies/libraryItemModel.js";

export const getLibraryItems=async(req,res)=>{
 try{
  const {user,study,method}=req.query;
  const filter={};

  if(user)filter.user=user;
  if(study)filter.study=study;
  if(method)filter.method=method;

  const items=await LibraryItem.find(filter)
   .populate("user")
   .populate("study")
   .populate("method")
   .populate("type")
   .populate("category")
   .populate("status")
   .sort({createdAt:-1});

  return res.status(200).json({
   success:true,
   count:items.length,
   data:items
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch library items",
   error:err.message
  });
 }
};

export const getLibraryItemById=async(req,res)=>{
 try{
  const item=await LibraryItem.findById(req.params.id)
   .populate("user")
   .populate("study")
   .populate("method")
   .populate("type")
   .populate("category")
   .populate("status");

  if(!item){
   return res.status(404).json({
    success:false,
    message:"Library item not found"
   });
  }

  return res.status(200).json({
   success:true,
   data:item
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch library item",
   error:err.message
  });
 }
};

export const createLibraryItem=async(req,res)=>{
 try{
  const item=await LibraryItem.create(req.body);

  return res.status(201).json({
   success:true,
   message:"Library item created successfully",
   data:item
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to create library item",
   error:err.message
  });
 }
};

export const updateLibraryItem=async(req,res)=>{
 try{
  const item=await LibraryItem.findByIdAndUpdate(req.params.id,req.body,{
   returnDocument:"after",
   runValidators:true
  });

  if(!item){
   return res.status(404).json({
    success:false,
    message:"Library item not found"
   });
  }

  return res.status(200).json({
   success:true,
   message:"Library item updated successfully",
   data:item
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to update library item",
   error:err.message
  });
 }
};

export const deleteLibraryItem=async(req,res)=>{
 try{
  const item=await LibraryItem.findByIdAndDelete(req.params.id);

  if(!item){
   return res.status(404).json({
    success:false,
    message:"Library item not found"
   });
  }

  return res.status(200).json({
   success:true,
   message:"Library item deleted successfully"
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to delete library item",
   error:err.message
  });
 }
};