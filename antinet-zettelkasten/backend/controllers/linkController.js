// backend/controllers/linkController.js
import mongoose from "mongoose";
import Link from "../models/linkModel.js";

export const createLink=async(req,res)=>{
 try{
  const{fromNote,toNote,relationType,description}=req.body;

  if(!fromNote||!toNote||!relationType)
   return res.status(400).json({success:false,message:"fromNote, toNote and relationType are required"});

  if(!mongoose.Types.ObjectId.isValid(fromNote))
   return res.status(400).json({success:false,message:"Invalid fromNote id"});

  if(!mongoose.Types.ObjectId.isValid(toNote))
   return res.status(400).json({success:false,message:"Invalid toNote id"});

  if(!mongoose.Types.ObjectId.isValid(relationType))
   return res.status(400).json({success:false,message:"Invalid relationType id"});

  const link=await Link.create({
   fromNote,
   toNote,
   relationType,
   description
  });

  return res.status(201).json({success:true,message:"Link created successfully",data:link});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to create link",error:error.message});
 }
};

export const getLinks=async(req,res)=>{
 try{
  const{fromNote,toNote,relationType}=req.query;
  const query={};

  if(fromNote){
   if(!mongoose.Types.ObjectId.isValid(fromNote))
    return res.status(400).json({success:false,message:"Invalid fromNote id"});
   query.fromNote=fromNote;
  }

  if(toNote){
   if(!mongoose.Types.ObjectId.isValid(toNote))
    return res.status(400).json({success:false,message:"Invalid toNote id"});
   query.toNote=toNote;
  }

  if(relationType){
   if(!mongoose.Types.ObjectId.isValid(relationType))
    return res.status(400).json({success:false,message:"Invalid relationType id"});
   query.relationType=relationType;
  }

  const links=await Link.find(query)
  .populate("fromNote")
  .populate("toNote")
  .populate("relationType")
  .sort({createdAt:-1});

  return res.status(200).json({success:true,count:links.length,data:links});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch links",error:error.message});
 }
};

export const getLinkById=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"Invalid link id"});

  const link=await Link.findById(id)
  .populate("fromNote")
  .populate("toNote")
  .populate("relationType");

  if(!link)
   return res.status(404).json({success:false,message:"Link not found"});

  return res.status(200).json({success:true,data:link});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch link",error:error.message});
 }
};

export const updateLink=async(req,res)=>{
 try{
  const{id}=req.params;
  const updateData={...req.body};

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"Invalid link id"});

  if(updateData.fromNote&&!mongoose.Types.ObjectId.isValid(updateData.fromNote))
   return res.status(400).json({success:false,message:"Invalid fromNote id"});

  if(updateData.toNote&&!mongoose.Types.ObjectId.isValid(updateData.toNote))
   return res.status(400).json({success:false,message:"Invalid toNote id"});

  if(updateData.relationType&&!mongoose.Types.ObjectId.isValid(updateData.relationType))
   return res.status(400).json({success:false,message:"Invalid relationType id"});

  const link=await Link.findByIdAndUpdate(
   id,
   updateData,
   {returnDocument:"after",runValidators:true}
  )
  .populate("fromNote")
  .populate("toNote")
  .populate("relationType");

  if(!link)
   return res.status(404).json({success:false,message:"Link not found"});

  return res.status(200).json({success:true,message:"Link updated successfully",data:link});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to update link",error:error.message});
 }
};

export const deleteLink=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"Invalid link id"});

  const link=await Link.findByIdAndDelete(id);

  if(!link)
   return res.status(404).json({success:false,message:"Link not found"});

  return res.status(200).json({success:true,message:"Link deleted successfully"});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to delete link",error:error.message});
 }
};