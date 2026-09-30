// backend/controllers/archiveController.js
import mongoose from "mongoose";
import Archive from "../models/archiveModel.js";

export const createArchive=async(req,res)=>{
 try{
  const{note,archivedBy,unarchivedBy=null,reason,archivedAt,unarchivedAt}=req.body;

  if(!note||!archivedBy)
   return res.status(400).json({success:false,message:"Note and archivedBy are required"});

  if(!mongoose.Types.ObjectId.isValid(note))
   return res.status(400).json({success:false,message:"Invalid note id"});

  if(!mongoose.Types.ObjectId.isValid(archivedBy))
   return res.status(400).json({success:false,message:"Invalid archivedBy id"});

  if(unarchivedBy&&!mongoose.Types.ObjectId.isValid(unarchivedBy))
   return res.status(400).json({success:false,message:"Invalid unarchivedBy id"});

  const archive=await Archive.create({
   note,
   archivedBy,
   unarchivedBy,
   reason,
   archivedAt,
   unarchivedAt
  });

  return res.status(201).json({success:true,message:"Archive created successfully",data:archive});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to create archive",error:error.message});
 }
};

export const getArchives=async(req,res)=>{
 try{
  const{note,archivedBy,unarchivedBy,user}=req.query;
  const query={};

  if(note){
   if(!mongoose.Types.ObjectId.isValid(note))
    return res.status(400).json({success:false,message:"Invalid note id"});
   query.note=note;
  }

  const owner=archivedBy||user;
  if(owner){
   if(!mongoose.Types.ObjectId.isValid(owner))
    return res.status(400).json({success:false,message:"Invalid archivedBy id"});
   query.archivedBy=owner;
  }

  if(unarchivedBy){
   if(!mongoose.Types.ObjectId.isValid(unarchivedBy))
    return res.status(400).json({success:false,message:"Invalid unarchivedBy id"});
   query.unarchivedBy=unarchivedBy;
  }

  const archives=await Archive.find(query)
  .populate("note")
  .populate("archivedBy","username email")
  .populate("unarchivedBy","username email")
  .sort({createdAt:-1});

  return res.status(200).json({success:true,count:archives.length,data:archives});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch archives",error:error.message});
 }
};

export const getArchiveById=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"Invalid archive id"});

  const archive=await Archive.findById(id)
  .populate("note")
  .populate("archivedBy","username email")
  .populate("unarchivedBy","username email");

  if(!archive)
   return res.status(404).json({success:false,message:"Archive not found"});

  return res.status(200).json({success:true,data:archive});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch archive",error:error.message});
 }
};

export const updateArchive=async(req,res)=>{
 try{
  const{id}=req.params;
  const updateData={...req.body};

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"Invalid archive id"});

  if(updateData.note&&!mongoose.Types.ObjectId.isValid(updateData.note))
   return res.status(400).json({success:false,message:"Invalid note id"});

  if(updateData.archivedBy&&!mongoose.Types.ObjectId.isValid(updateData.archivedBy))
   return res.status(400).json({success:false,message:"Invalid archivedBy id"});

  if(updateData.unarchivedBy&&!mongoose.Types.ObjectId.isValid(updateData.unarchivedBy))
   return res.status(400).json({success:false,message:"Invalid unarchivedBy id"});

  const archive=await Archive.findByIdAndUpdate(
   id,
   updateData,
   {returnDocument:"after",runValidators:true}
  )
  .populate("note")
  .populate("archivedBy","username email")
  .populate("unarchivedBy","username email");

  if(!archive)
   return res.status(404).json({success:false,message:"Archive not found"});

  return res.status(200).json({success:true,message:"Archive updated successfully",data:archive});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to update archive",error:error.message});
 }
};

export const deleteArchive=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"Invalid archive id"});

  const archive=await Archive.findByIdAndDelete(id);

  if(!archive)
   return res.status(404).json({success:false,message:"Archive not found"});

  return res.status(200).json({success:true,message:"Archive deleted successfully"});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to delete archive",error:error.message});
 }
};
