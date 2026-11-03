// backend/controllers/noteHistoryController.js
import mongoose from "mongoose";
import NoteHistory from "../models/noteHistoryModel.js";

export const createNoteHistory=async(req,res)=>{
 try{
  const{
   note,
   user,
   title,
   content,
   summary,
   version,
   changeType,
   noteType,
   notebook
  }=req.body;

  if(!note||!user||version===undefined)
   return res.status(400).json({success:false,message:"note, user and version are required"});

  if(!mongoose.Types.ObjectId.isValid(note))
   return res.status(400).json({success:false,message:"Invalid note id"});

  if(!mongoose.Types.ObjectId.isValid(user))
   return res.status(400).json({success:false,message:"Invalid user id"});

  if(noteType&&!mongoose.Types.ObjectId.isValid(noteType))
   return res.status(400).json({success:false,message:"Invalid noteType id"});

  if(notebook&&!mongoose.Types.ObjectId.isValid(notebook))
   return res.status(400).json({success:false,message:"Invalid notebook id"});

  const history=await NoteHistory.create({
   note,
   user,
   title,
   content,
   summary,
   version,
   changeType,
   noteType,
   notebook
  });

  return res.status(201).json({success:true,message:"Note history created successfully",data:history});
 }
 catch(error){
  if(error.code===11000)
   return res.status(409).json({success:false,message:"Version already exists for this note"});
  return res.status(500).json({success:false,message:"Failed to create note history",error:error.message});
 }
};

export const getNoteHistories=async(req,res)=>{
 try{
  const{note,user,version}=req.query;
  const query={};

  if(note){
   if(!mongoose.Types.ObjectId.isValid(note))
    return res.status(400).json({success:false,message:"Invalid note id"});
   query.note=note;
  }

  if(user){
   if(!mongoose.Types.ObjectId.isValid(user))
    return res.status(400).json({success:false,message:"Invalid user id"});
   query.user=user;
  }

  if(version!==undefined)query.version=version;

  const histories=await NoteHistory.find(query)
  .populate("note")
  .populate("user","username email")
  .populate("noteType")
  .populate("notebook")
  .sort({version:-1});

  return res.status(200).json({success:true,count:histories.length,data:histories});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch note history",error:error.message});
 }
};

export const getNoteHistoryById=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"Invalid history id"});

  const history=await NoteHistory.findById(id)
  .populate("note")
  .populate("user","username email")
  .populate("noteType")
  .populate("notebook");

  if(!history)
   return res.status(404).json({success:false,message:"Note history not found"});

  return res.status(200).json({success:true,data:history});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch note history",error:error.message});
 }
};

export const updateNoteHistory=async(req,res)=>{
 try{
  const{id}=req.params;
  const updateData={...req.body};

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"Invalid history id"});

  if(updateData.note&&!mongoose.Types.ObjectId.isValid(updateData.note))
   return res.status(400).json({success:false,message:"Invalid note id"});

  if(updateData.user&&!mongoose.Types.ObjectId.isValid(updateData.user))
   return res.status(400).json({success:false,message:"Invalid user id"});

  if(updateData.noteType&&!mongoose.Types.ObjectId.isValid(updateData.noteType))
   return res.status(400).json({success:false,message:"Invalid noteType id"});

  if(updateData.notebook&&!mongoose.Types.ObjectId.isValid(updateData.notebook))
   return res.status(400).json({success:false,message:"Invalid notebook id"});

  const history=await NoteHistory.findByIdAndUpdate(
   id,
   updateData,
   {returnDocument:"after",runValidators:true}
  )
  .populate("note")
  .populate("user","username email")
  .populate("noteType")
  .populate("notebook");

  if(!history)
   return res.status(404).json({success:false,message:"Note history not found"});

  return res.status(200).json({success:true,message:"Note history updated successfully",data:history});
 }
 catch(error){
  if(error.code===11000)
   return res.status(409).json({success:false,message:"Version already exists for this note"});
  return res.status(500).json({success:false,message:"Failed to update note history",error:error.message});
 }
};

export const deleteNoteHistory=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"Invalid history id"});

  const history=await NoteHistory.findByIdAndDelete(id);

  if(!history)
   return res.status(404).json({success:false,message:"Note history not found"});

  return res.status(200).json({success:true,message:"Note history deleted successfully"});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to delete note history",error:error.message});
 }
};