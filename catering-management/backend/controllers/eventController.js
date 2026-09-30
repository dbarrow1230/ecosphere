// backend/controllers/eventController.js
import Event from "../models/eventModel.js";

export const createEvent=async(req,res)=>{
 try{
  const event=await Event.create(req.body);
  res.status(201).json({success:true,message:"Event created successfully",event});
 }catch(error){
  res.status(400).json({success:false,message:error.message});
 }
};

export const getEvents=async(req,res)=>{
 try{
  const events=await Event.find().sort({eventDate:1,createdAt:-1});
  res.status(200).json({success:true,count:events.length,events});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const getSingleEvent=async(req,res)=>{
 try{
  const event=await Event.findById(req.params.id);
  if(!event){
   return res.status(404).json({success:false,message:"Event not found"});
  }
  res.status(200).json({success:true,event});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const updateEvent=async(req,res)=>{
 try{
  const event=await Event.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after",runValidators:true});
  if(!event){
   return res.status(404).json({success:false,message:"Event not found"});
  }
  res.status(200).json({success:true,message:"Event updated successfully",event});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const deleteEvent=async(req,res)=>{
 try{
  const event=await Event.findByIdAndDelete(req.params.id);
  if(!event){
   return res.status(404).json({success:false,message:"Event not found"});
  }
  res.status(200).json({success:true,message:"Event deleted successfully"});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};
