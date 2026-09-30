// backend/controllers/meetingMethodController.js
import mongoose from "mongoose";
import MeetingMethod from "../models/meetingMethodModel.js";

export const createMeetingMethod=async(req,res)=>{
 try{
  const {name,description,isActive,createdBy}=req.body;

  if(!name?.trim()){
   return res.status(400).json({success:false,message:"Name is required"});
  }

  if(createdBy&& !mongoose.Types.ObjectId.isValid(createdBy)){
   return res.status(400).json({success:false,message:"Invalid createdBy id"});
  }

  const existingMethod=await MeetingMethod.findOne({name:name.trim()});
  if(existingMethod){
   return res.status(400).json({success:false,message:"Meeting method already exists"});
  }

  const method=await MeetingMethod.create({
   name:name.trim(),
   description:description?.trim()||"",
   isActive:isActive!==undefined?Boolean(isActive):true,
   createdBy:createdBy||null
  });

  const newMethod=await MeetingMethod.findById(method._id).populate("createdBy","name email");

  return res.status(201).json({success:true,meetingMethod:newMethod});
 }catch(error){
  return res.status(500).json({success:false,message:"Error creating meeting method",error:error.message});
 }
};

export const getMeetingMethods=async(req,res)=>{
 try{
  const methods=await MeetingMethod.find()
   .populate("createdBy","name email")
   .sort({name:1});

  return res.status(200).json({success:true,count:methods.length,meetingMethods:methods});
 }catch(error){
  return res.status(500).json({success:false,message:"Error fetching meeting methods",error:error.message});
 }
};

export const getMeetingMethodById=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({success:false,message:"Invalid meeting method id"});
  }

  const method=await MeetingMethod.findById(id).populate("createdBy","name email");

  if(!method){
   return res.status(404).json({success:false,message:"Meeting method not found"});
  }

  return res.status(200).json({success:true,meetingMethod:method});
 }catch(error){
  return res.status(500).json({success:false,message:"Error fetching meeting method",error:error.message});
 }
};

export const updateMeetingMethod=async(req,res)=>{
 try{
  const {id}=req.params;
  const {name,description,isActive,createdBy}=req.body;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({success:false,message:"Invalid meeting method id"});
  }

  if(createdBy&& !mongoose.Types.ObjectId.isValid(createdBy)){
   return res.status(400).json({success:false,message:"Invalid createdBy id"});
  }

  if(name!==undefined&& !name.trim()){
   return res.status(400).json({success:false,message:"Name is required"});
  }

  if(name?.trim()){
   const existingMethod=await MeetingMethod.findOne({_id:{$ne:id},name:name.trim()});
   if(existingMethod){
    return res.status(400).json({success:false,message:"Meeting method already exists"});
   }
  }

  const method=await MeetingMethod.findByIdAndUpdate(
   id,
   {
    ...(name!==undefined?{name:name.trim()}:{ }),
    ...(description!==undefined?{description:description.trim()}:{ }),
    ...(isActive!==undefined?{isActive:Boolean(isActive)}:{ }),
    ...(createdBy!==undefined?{createdBy:createdBy||null}:{ })
   },
   {returnDocument:"after",runValidators:true}
  ).populate("createdBy","name email");

  if(!method){
   return res.status(404).json({success:false,message:"Meeting method not found"});
  }

  return res.status(200).json({success:true,meetingMethod:method});
 }catch(error){
  return res.status(500).json({success:false,message:"Error updating meeting method",error:error.message});
 }
};

export const deleteMeetingMethod=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({success:false,message:"Invalid meeting method id"});
  }

  const method=await MeetingMethod.findByIdAndDelete(id);

  if(!method){
   return res.status(404).json({success:false,message:"Meeting method not found"});
  }

  return res.status(200).json({success:true,message:"Meeting method deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Error deleting meeting method",error:error.message});
 }
};