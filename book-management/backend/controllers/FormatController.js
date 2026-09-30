// backend/controllers/FormatController.js
import FormatModel from "../models/FormatModel.js";
import mongoose from "mongoose";

export const createFormat=async(req,res)=>{
 try{
  const format=await FormatModel.create({
   name:req.body.name
  });
  return res.status(201).json({success:true,message:"Format created successfully",format});
 }catch(error){
  if(error.code===11000)return res.status(409).json({success:false,message:"Format already exists"});
  return res.status(500).json({success:false,message:"Failed to create format",error:error.message});
 }
};

export const getFormats=async(req,res)=>{
 try{
  const {search=""}=req.query;

  const query={};

  if(search){
   query.name={$regex:search,$options:"i"};
  }

  const formats=await FormatModel.find(query).sort({name:1});

  return res.status(200).json({success:true,formats});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch formats",error:error.message});
 }
};

export const getFormatById=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid format id"});

  const format=await FormatModel.findById(id);

  if(!format)return res.status(404).json({success:false,message:"Format not found"});

  return res.status(200).json({success:true,format});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch format",error:error.message});
 }
};

export const updateFormat=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid format id"});

  const format=await FormatModel.findByIdAndUpdate(id,{
   name:req.body.name
  },{new:true,runValidators:true});

  if(!format)return res.status(404).json({success:false,message:"Format not found"});

  return res.status(200).json({success:true,message:"Format updated successfully",format});
 }catch(error){
  if(error.code===11000)return res.status(409).json({success:false,message:"Format already exists"});
  return res.status(500).json({success:false,message:"Failed to update format",error:error.message});
 }
};

export const deleteFormat=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid format id"});

  const format=await FormatModel.findByIdAndDelete(id);

  if(!format)return res.status(404).json({success:false,message:"Format not found"});

  return res.status(200).json({success:true,message:"Format deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete format",error:error.message});
 }
};