// backend/controllers/noteTypeController.js
import mongoose from "mongoose";
import NoteType from "../models/noteTypeModel.js";

export const createNoteType=async(req,res)=>{
 try{
  const{name,description}=req.body;

  if(!name)
   return res.status(400).json({success:false,message:"name is required"});

  const noteType=await NoteType.create({
   name,
   description
  });

  return res.status(201).json({success:true,message:"Note type created successfully",data:noteType});
 }
 catch(error){
  if(error.code===11000)
   return res.status(409).json({success:false,message:"Note type already exists"});
  return res.status(500).json({success:false,message:"Failed to create note type",error:error.message});
 }
};

export const getNoteTypes=async(req,res)=>{
 try{
  const{name}=req.query;
  const query={};

  if(name)query.name=name;

  const noteTypes=await NoteType.find(query)
  .sort({name:1});

  return res.status(200).json({success:true,count:noteTypes.length,data:noteTypes});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch note types",error:error.message});
 }
};

export const getNoteTypeById=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"Invalid noteType id"});

  const noteType=await NoteType.findById(id);

  if(!noteType)
   return res.status(404).json({success:false,message:"Note type not found"});

  return res.status(200).json({success:true,data:noteType});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch note type",error:error.message});
 }
};

export const updateNoteType=async(req,res)=>{
 try{
  const{id}=req.params;
  const updateData={...req.body};

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"Invalid noteType id"});

  const noteType=await NoteType.findByIdAndUpdate(
   id,
   updateData,
   {returnDocument:"after",runValidators:true}
  );

  if(!noteType)
   return res.status(404).json({success:false,message:"Note type not found"});

  return res.status(200).json({success:true,message:"Note type updated successfully",data:noteType});
 }
 catch(error){
  if(error.code===11000)
   return res.status(409).json({success:false,message:"Note type already exists"});
  return res.status(500).json({success:false,message:"Failed to update note type",error:error.message});
 }
};

export const deleteNoteType=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"Invalid noteType id"});

  const noteType=await NoteType.findByIdAndDelete(id);

  if(!noteType)
   return res.status(404).json({success:false,message:"Note type not found"});

  return res.status(200).json({success:true,message:"Note type deleted successfully"});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to delete note type",error:error.message});
 }
};