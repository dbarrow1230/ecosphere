// backend/controllers/referenceController.js
import mongoose from "mongoose";
import Reference from "../models/referenceModel.js";

export const createReference=async(req,res)=>{
 try{
  const{
   note,
   source,
   title,
   chapter,
   verse,
   page,
   description
  }=req.body;

  if(!note||!source||!title)
   return res.status(400).json({success:false,message:"note, source and title are required"});

  if(!mongoose.Types.ObjectId.isValid(note))
   return res.status(400).json({success:false,message:"Invalid note id"});

  if(!mongoose.Types.ObjectId.isValid(source))
   return res.status(400).json({success:false,message:"Invalid source id"});

  const reference=await Reference.create({
   note,
   source,
   title,
   chapter,
   verse,
   page,
   description
  });

  return res.status(201).json({success:true,message:"Reference created successfully",data:reference});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to create reference",error:error.message});
 }
};

export const getReferences=async(req,res)=>{
 try{
  const{note,source,title}=req.query;
  const query={};

  if(note){
   if(!mongoose.Types.ObjectId.isValid(note))
    return res.status(400).json({success:false,message:"Invalid note id"});
   query.note=note;
  }

  if(source){
   if(!mongoose.Types.ObjectId.isValid(source))
    return res.status(400).json({success:false,message:"Invalid source id"});
   query.source=source;
  }

  if(title)query.title=title;

  const references=await Reference.find(query)
  .populate("note")
  .populate("source")
  .sort({createdAt:-1});

  return res.status(200).json({success:true,count:references.length,data:references});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch references",error:error.message});
 }
};

export const getReferenceById=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"Invalid reference id"});

  const reference=await Reference.findById(id)
  .populate("note")
  .populate("source");

  if(!reference)
   return res.status(404).json({success:false,message:"Reference not found"});

  return res.status(200).json({success:true,data:reference});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch reference",error:error.message});
 }
};

export const updateReference=async(req,res)=>{
 try{
  const{id}=req.params;
  const updateData={...req.body};

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"Invalid reference id"});

  if(updateData.note&&!mongoose.Types.ObjectId.isValid(updateData.note))
   return res.status(400).json({success:false,message:"Invalid note id"});

  if(updateData.source&&!mongoose.Types.ObjectId.isValid(updateData.source))
   return res.status(400).json({success:false,message:"Invalid source id"});

  const reference=await Reference.findByIdAndUpdate(
   id,
   updateData,
   {returnDocument:"after",runValidators:true}
  )
  .populate("note")
  .populate("source");

  if(!reference)
   return res.status(404).json({success:false,message:"Reference not found"});

  return res.status(200).json({success:true,message:"Reference updated successfully",data:reference});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to update reference",error:error.message});
 }
};

export const deleteReference=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"Invalid reference id"});

  const reference=await Reference.findByIdAndDelete(id);

  if(!reference)
   return res.status(404).json({success:false,message:"Reference not found"});

  return res.status(200).json({success:true,message:"Reference deleted successfully"});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to delete reference",error:error.message});
 }
};