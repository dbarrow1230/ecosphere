// backend/controllers/statusController.js
import mongoose from "mongoose";
import Status from "../models/statusModel.js";

export const createStatus=async(req,res)=>{
 try{
  const{name,code,type}=req.body;
  if(!name||!code||!type){
   return res.status(400).json({success:false,message:"name, code, and type are required"});
  }
  const status=await Status.create(req.body);
  return res.status(201).json({success:true,status});
 }catch(error){
  return res.status(500).json({success:false,message:"Error creating status",error:error.message});
 }
};

export const getStatuses=async(req,res)=>{
 try{
  const{type,isActive}=req.query;
  let query={};
  if(type)query.type=type;
  if(isActive!==undefined)query.isActive=isActive==="true";

  const statuses=await Status.find(query)
  .populate("createdBy","name email")
  .sort({sortOrder:1,name:1});

  return res.status(200).json({success:true,count:statuses.length,statuses});
 }catch(error){
  return res.status(500).json({success:false,message:"Error fetching statuses",error:error.message});
 }
};

export const getStatusById=async(req,res)=>{
 try{
  const{id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({success:false,message:"Invalid status id"});
  }

  const status=await Status.findById(id)
  .populate("createdBy","name email");

  if(!status){
   return res.status(404).json({success:false,message:"Status not found"});
  }

  return res.status(200).json({success:true,status});
 }catch(error){
  return res.status(500).json({success:false,message:"Error fetching status",error:error.message});
 }
};

export const updateStatus=async(req,res)=>{
 try{
  const{id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({success:false,message:"Invalid status id"});
  }

  const status=await Status.findByIdAndUpdate(id,req.body,{returnDocument:"after",runValidators:true})
  .populate("createdBy","name email");

  if(!status){
   return res.status(404).json({success:false,message:"Status not found"});
  }

  return res.status(200).json({success:true,status});
 }catch(error){
  return res.status(500).json({success:false,message:"Error updating status",error:error.message});
 }
};

export const deleteStatus=async(req,res)=>{
 try{
  const{id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({success:false,message:"Invalid status id"});
  }

  const status=await Status.findByIdAndDelete(id);

  if(!status){
   return res.status(404).json({success:false,message:"Status not found"});
  }

  return res.status(200).json({success:true,message:"Status deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Error deleting status",error:error.message});
 }
};