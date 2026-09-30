// backend/controllers/FileTypeController.js
import FileTypeModel from "../models/FileTypeModel.js";
import mongoose from "mongoose";

export const createFileType=async(req,res)=>{
 try{
  const fileType=await FileTypeModel.create({
   name:req.body.name
  });
  return res.status(201).json({success:true,message:"File type created successfully",fileType});
 }catch(error){
  if(error.code===11000)return res.status(409).json({success:false,message:"File type already exists"});
  return res.status(500).json({success:false,message:"Failed to create file type",error:error.message});
 }
};

export const getFileTypes=async(req,res)=>{
 try{
  const {search=""}=req.query;

  const query={};

  if(search){
   query.name={$regex:search,$options:"i"};
  }

  const fileTypes=await FileTypeModel.find(query).sort({name:1});

  return res.status(200).json({success:true,fileTypes});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch file types",error:error.message});
 }
};

export const getFileTypeById=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid file type id"});

  const fileType=await FileTypeModel.findById(id);

  if(!fileType)return res.status(404).json({success:false,message:"File type not found"});

  return res.status(200).json({success:true,fileType});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch file type",error:error.message});
 }
};

export const updateFileType=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid file type id"});

  const fileType=await FileTypeModel.findByIdAndUpdate(id,{
   name:req.body.name
  },{new:true,runValidators:true});

  if(!fileType)return res.status(404).json({success:false,message:"File type not found"});

  return res.status(200).json({success:true,message:"File type updated successfully",fileType});
 }catch(error){
  if(error.code===11000)return res.status(409).json({success:false,message:"File type already exists"});
  return res.status(500).json({success:false,message:"Failed to update file type",error:error.message});
 }
};

export const deleteFileType=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid file type id"});

  const fileType=await FileTypeModel.findByIdAndDelete(id);

  if(!fileType)return res.status(404).json({success:false,message:"File type not found"});

  return res.status(200).json({success:true,message:"File type deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete file type",error:error.message});
 }
};