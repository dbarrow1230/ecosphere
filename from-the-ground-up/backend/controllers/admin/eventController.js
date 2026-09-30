import mongoose from "mongoose";
import Event from "../../models/admin/eventModel.js";

const isValidObjectId=id=>mongoose.Types.ObjectId.isValid(id);

export const createEvent=async(req,res)=>{
 try{
  const event=await Event.create(req.body);
  return res.status(201).json({success:true,message:"Event created successfully",event,data:event});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to create event",error:error.message});
 }
};

export const getEvents=async(req,res)=>{
 try{
  const events=await Event.find({}).sort({eventDate:1,createdAt:-1});
  return res.status(200).json({success:true,events,data:events});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch events",error:error.message});
 }
};

export const getEventById=async(req,res)=>{
 try{
  if(!isValidObjectId(req.params.id))return res.status(400).json({success:false,message:"Invalid event id"});
  const event=await Event.findById(req.params.id);
  if(!event)return res.status(404).json({success:false,message:"Event not found"});
  return res.status(200).json({success:true,event,data:event});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch event",error:error.message});
 }
};

export const updateEvent=async(req,res)=>{
 try{
  if(!isValidObjectId(req.params.id))return res.status(400).json({success:false,message:"Invalid event id"});
  const event=await Event.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});
  if(!event)return res.status(404).json({success:false,message:"Event not found"});
  return res.status(200).json({success:true,message:"Event updated successfully",event,data:event});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to update event",error:error.message});
 }
};

export const deleteEvent=async(req,res)=>{
 try{
  if(!isValidObjectId(req.params.id))return res.status(400).json({success:false,message:"Invalid event id"});
  const event=await Event.findByIdAndDelete(req.params.id);
  if(!event)return res.status(404).json({success:false,message:"Event not found"});
  return res.status(200).json({success:true,message:"Event deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete event",error:error.message});
 }
};
