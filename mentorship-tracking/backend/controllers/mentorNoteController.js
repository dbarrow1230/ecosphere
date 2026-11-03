// backend/controllers/mentorNoteController.js
import mongoose from "mongoose";
import MentorNote from "../models/mentorNoteModel.js";

export const createMentorNote=async(req,res)=>{
 try{
  const{mentee,note,createdBy}=req.body;
  if(!mentee||!note||!createdBy){
   return res.status(400).json({success:false,message:"mentee, note, and createdBy are required"});
  }
  const mentorNote=await MentorNote.create(req.body);
  return res.status(201).json({success:true,mentorNote});
 }catch(error){
  return res.status(500).json({success:false,message:"Error creating mentor note",error:error.message});
 }
};

export const getMentorNotes=async(req,res)=>{
 try{
  const{mentee,weekNumber,category,riskLevel,createdBy}=req.query;
  let query={};
  if(mentee)query.mentee=mentee;
  if(weekNumber)query.weekNumber=Number(weekNumber);
  if(category)query.category=category;
  if(riskLevel)query.riskLevel=riskLevel;
  if(createdBy)query.createdBy=createdBy;

  const mentorNotes=await MentorNote.find(query)
  .populate("mentee")
  .populate("createdBy","name email")
  .sort({createdAt:-1});

  return res.status(200).json({success:true,count:mentorNotes.length,mentorNotes});
 }catch(error){
  return res.status(500).json({success:false,message:"Error fetching mentor notes",error:error.message});
 }
};

export const getMentorNoteById=async(req,res)=>{
 try{
  const{id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({success:false,message:"Invalid mentor note id"});
  }
  const mentorNote=await MentorNote.findById(id)
  .populate("mentee")
  .populate("createdBy","name email");

  if(!mentorNote){
   return res.status(404).json({success:false,message:"Mentor note not found"});
  }

  return res.status(200).json({success:true,mentorNote});
 }catch(error){
  return res.status(500).json({success:false,message:"Error fetching mentor note",error:error.message});
 }
};

export const getMentorNotesByMentee=async(req,res)=>{
 try{
  const{menteeId}=req.params;
  if(!mongoose.Types.ObjectId.isValid(menteeId)){
   return res.status(400).json({success:false,message:"Invalid mentee id"});
  }

  const mentorNotes=await MentorNote.find({mentee:menteeId})
  .populate("createdBy","name email")
  .sort({createdAt:-1});

  return res.status(200).json({success:true,count:mentorNotes.length,mentorNotes});
 }catch(error){
  return res.status(500).json({success:false,message:"Error fetching mentor notes",error:error.message});
 }
};

export const updateMentorNote=async(req,res)=>{
 try{
  const{id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({success:false,message:"Invalid mentor note id"});
  }

  const mentorNote=await MentorNote.findByIdAndUpdate(id,req.body,{returnDocument:"after",runValidators:true})
  .populate("mentee")
  .populate("createdBy","name email");

  if(!mentorNote){
   return res.status(404).json({success:false,message:"Mentor note not found"});
  }

  return res.status(200).json({success:true,mentorNote});
 }catch(error){
  return res.status(500).json({success:false,message:"Error updating mentor note",error:error.message});
 }
};

export const deleteMentorNote=async(req,res)=>{
 try{
  const{id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({success:false,message:"Invalid mentor note id"});
  }

  const mentorNote=await MentorNote.findByIdAndDelete(id);

  if(!mentorNote){
   return res.status(404).json({success:false,message:"Mentor note not found"});
  }

  return res.status(200).json({success:true,message:"Mentor note deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Error deleting mentor note",error:error.message});
 }
};