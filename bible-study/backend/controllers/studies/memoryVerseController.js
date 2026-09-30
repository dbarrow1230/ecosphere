// backend/controllers/studies/memoryVerseController.js
import MemoryVerse from "../../models/studies/memoryVerseModel.js";

export const getMemoryVerses=async(req,res)=>{
 try{
  const {user,study,memorized}=req.query;
  const filter={};

  if(user)filter.user=user;
  if(study)filter.study=study;
  if(memorized==="true")filter.memorized=true;
  if(memorized==="false")filter.memorized=false;

  const items=await MemoryVerse.find(filter)
   .populate("user")
   .populate("study")
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
   message:"Failed to fetch memory verses",
   error:err.message
  });
 }
};

export const getMemoryVerseById=async(req,res)=>{
 try{
  const item=await MemoryVerse.findById(req.params.id)
   .populate("user")
   .populate("study")
   .populate("status");

  if(!item){
   return res.status(404).json({
    success:false,
    message:"Memory verse not found"
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
   message:"Failed to fetch memory verse",
   error:err.message
  });
 }
};

export const createMemoryVerse=async(req,res)=>{
 try{
  const item=await MemoryVerse.create(req.body);

  return res.status(201).json({
   success:true,
   message:"Memory verse created successfully",
   data:item
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to create memory verse",
   error:err.message
  });
 }
};

export const updateMemoryVerse=async(req,res)=>{
 try{
  const item=await MemoryVerse.findByIdAndUpdate(req.params.id,req.body,{
   returnDocument:"after",
   runValidators:true
  });

  if(!item){
   return res.status(404).json({
    success:false,
    message:"Memory verse not found"
   });
  }

  return res.status(200).json({
   success:true,
   message:"Memory verse updated successfully",
   data:item
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to update memory verse",
   error:err.message
  });
 }
};

export const deleteMemoryVerse=async(req,res)=>{
 try{
  const item=await MemoryVerse.findByIdAndDelete(req.params.id);

  if(!item){
   return res.status(404).json({
    success:false,
    message:"Memory verse not found"
   });
  }

  return res.status(200).json({
   success:true,
   message:"Memory verse deleted successfully"
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to delete memory verse",
   error:err.message
  });
 }
};