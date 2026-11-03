// backend/controllers/studies/crossReferenceController.js
import CrossReference from "../../models/studies/crossReferenceModel.js";

export const getCrossReferences=async(req,res)=>{
 try{
  const {user,study}=req.query;
  const filter={};

  if(user)filter.user=user;
  if(study)filter.study=study;

  const items=await CrossReference.find(filter)
   .populate("user")
   .populate("study")
   .populate("theme")
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
   message:"Failed to fetch cross references",
   error:err.message
  });
 }
};

export const getCrossReferenceById=async(req,res)=>{
 try{
  const item=await CrossReference.findById(req.params.id)
   .populate("user")
   .populate("study")
   .populate("theme");

  if(!item){
   return res.status(404).json({
    success:false,
    message:"Cross reference not found"
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
   message:"Failed to fetch cross reference",
   error:err.message
  });
 }
};

export const createCrossReference=async(req,res)=>{
 try{
  const item=await CrossReference.create(req.body);

  return res.status(201).json({
   success:true,
   message:"Cross reference created successfully",
   data:item
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to create cross reference",
   error:err.message
  });
 }
};

export const updateCrossReference=async(req,res)=>{
 try{
  const item=await CrossReference.findByIdAndUpdate(req.params.id,req.body,{
   returnDocument:"after",
   runValidators:true
  });

  if(!item){
   return res.status(404).json({
    success:false,
    message:"Cross reference not found"
   });
  }

  return res.status(200).json({
   success:true,
   message:"Cross reference updated successfully",
   data:item
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to update cross reference",
   error:err.message
  });
 }
};

export const deleteCrossReference=async(req,res)=>{
 try{
  const item=await CrossReference.findByIdAndDelete(req.params.id);

  if(!item){
   return res.status(404).json({
    success:false,
    message:"Cross reference not found"
   });
  }

  return res.status(200).json({
   success:true,
   message:"Cross reference deleted successfully"
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to delete cross reference",
   error:err.message
  });
 }
};