// backend/controllers/noteController.js
import mongoose from "mongoose";
import Note from "../models/noteModel.js";

export const createNote=async(req,res)=>{
 try{
  const{
   user,
   notebook,
   noteType,
   title,
   noteId,
   content,
   summary,
   tags=[],
   links=[],
   isArchived=false,
   isFavorite=false,
   status="active"
  }=req.body;

  if(!user||!noteType||!title||!noteId)
   return res.status(400).json({success:false,message:"user, noteType, title and noteId are required"});

  if(!mongoose.Types.ObjectId.isValid(user))
   return res.status(400).json({success:false,message:"Invalid user id"});

  if(notebook&&!mongoose.Types.ObjectId.isValid(notebook))
   return res.status(400).json({success:false,message:"Invalid notebook id"});

  if(!mongoose.Types.ObjectId.isValid(noteType))
   return res.status(400).json({success:false,message:"Invalid noteType id"});

  const note=await Note.create({
   user,
   notebook,
   noteType,
   title,
   noteId,
   content,
   summary,
   tags,
   links,
   isArchived,
   isFavorite,
   status
  });

  return res.status(201).json({success:true,message:"Note created successfully",data:note});
 }
 catch(error){
  if(error.code===11000)
   return res.status(409).json({success:false,message:"noteId already exists"});
  return res.status(500).json({success:false,message:"Failed to create note",error:error.message});
 }
};

export const getNotes=async(req,res)=>{
 try{
  const{user,notebook,status,isArchived,isFavorite,title}=req.query;
  const query={};

  if(user){
   if(!mongoose.Types.ObjectId.isValid(user))
    return res.status(400).json({success:false,message:"Invalid user id"});
   query.user=user;
  }

  if(notebook){
   if(!mongoose.Types.ObjectId.isValid(notebook))
    return res.status(400).json({success:false,message:"Invalid notebook id"});
   query.notebook=notebook;
  }

  if(status)query.status=status;
  if(isArchived!==undefined)query.isArchived=isArchived;
  if(isFavorite!==undefined)query.isFavorite=isFavorite;
  if(title)query.title=title;

  const notes=await Note.find(query)
  .populate("user","username email")
  .populate("notebook")
  .populate("noteType")
  .populate("tags")
  .populate("links")
  .sort({updatedAt:-1});

  return res.status(200).json({success:true,count:notes.length,data:notes});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch notes",error:error.message});
 }
};

export const getNoteById=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"Invalid note id"});

  const note=await Note.findById(id)
  .populate("user","username email")
  .populate("notebook")
  .populate("noteType")
  .populate("tags")
  .populate("links");

  if(!note)
   return res.status(404).json({success:false,message:"Note not found"});

  return res.status(200).json({success:true,data:note});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch note",error:error.message});
 }
};

export const updateNote=async(req,res)=>{
 try{
  const{id}=req.params;
  const updateData={...req.body};

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"Invalid note id"});

  if(updateData.user&&!mongoose.Types.ObjectId.isValid(updateData.user))
   return res.status(400).json({success:false,message:"Invalid user id"});

  if(updateData.notebook&&!mongoose.Types.ObjectId.isValid(updateData.notebook))
   return res.status(400).json({success:false,message:"Invalid notebook id"});

  if(updateData.noteType&&!mongoose.Types.ObjectId.isValid(updateData.noteType))
   return res.status(400).json({success:false,message:"Invalid noteType id"});

  const note=await Note.findByIdAndUpdate(
   id,
   updateData,
   {returnDocument:"after",runValidators:true}
  )
  .populate("user","username email")
  .populate("notebook")
  .populate("noteType")
  .populate("tags")
  .populate("links");

  if(!note)
   return res.status(404).json({success:false,message:"Note not found"});

  return res.status(200).json({success:true,message:"Note updated successfully",data:note});
 }
 catch(error){
  if(error.code===11000)
   return res.status(409).json({success:false,message:"noteId already exists"});
  return res.status(500).json({success:false,message:"Failed to update note",error:error.message});
 }
};

export const deleteNote=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"Invalid note id"});

  const note=await Note.findByIdAndDelete(id);

  if(!note)
   return res.status(404).json({success:false,message:"Note not found"});

  return res.status(200).json({success:true,message:"Note deleted successfully"});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to delete note",error:error.message});
 }
};