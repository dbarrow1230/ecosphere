// backend/controllers/timesheetController.js
import mongoose from "mongoose";
import Timesheet from "../models/timesheetModel.js";

export const createTimesheet=async(req,res)=>{
 try{
  const{
   mentee,
   weekNumber,
   weekStarting,
   weekEnding,
   hours,
   dailyHours,
   source,
   status,
   signedAt,
   notes,
   createdBy
  }=req.body;

  if(!mentee||!weekNumber||!weekStarting||hours===undefined||!createdBy){
   return res.status(400).json({success:false,message:"mentee, weekNumber, weekStarting, hours, and createdBy are required"});
  }

  const timesheet=await Timesheet.create({
   mentee,
   weekNumber,
   weekStarting,
   weekEnding:weekEnding||null,
   hours,
   dailyHours:{
    wednesday:Number(dailyHours?.wednesday||0),
    thursday:Number(dailyHours?.thursday||0),
    friday:Number(dailyHours?.friday||0),
    saturday:Number(dailyHours?.saturday||0),
    sunday:Number(dailyHours?.sunday||0),
    monday:Number(dailyHours?.monday||0),
    tuesday:Number(dailyHours?.tuesday||0)
   },
   source:source||"portal",
   status:status||"pending",
   signedAt:signedAt||null,
   notes:notes||"",
   createdBy
  });

  const populatedTimesheet=await Timesheet.findById(timesheet._id)
  .populate("mentee")
  .populate("createdBy","name email username fullName");

  return res.status(201).json({success:true,timesheet:populatedTimesheet});
 }catch(error){
  if(error?.code===11000){
   return res.status(409).json({success:false,message:"A timesheet already exists for this mentee and week. Edit the existing week instead."});
  }
  return res.status(500).json({success:false,message:"Error creating timesheet",error:error.message});
 }
};

export const getTimesheets=async(req,res)=>{
 try{
  const{mentee,weekNumber,status,source,createdBy}=req.query;
  let query={};
  if(mentee) query.mentee=mentee;
  if(weekNumber) query.weekNumber=Number(weekNumber);
  if(status) query.status=status;
  if(source) query.source=source;
  if(createdBy) query.createdBy=createdBy;

  const timesheets=await Timesheet.find(query)
  .populate("mentee")
  .populate("createdBy","name email username fullName")
  .sort({weekStarting:-1});

  return res.status(200).json({success:true,count:timesheets.length,timesheets});
 }catch(error){
  return res.status(500).json({success:false,message:"Error fetching timesheets",error:error.message});
 }
};

export const getTimesheetById=async(req,res)=>{
 try{
  const{id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({success:false,message:"Invalid timesheet id"});
  }

  const timesheet=await Timesheet.findById(id)
  .populate("mentee")
  .populate("createdBy","name email username fullName");

  if(!timesheet){
   return res.status(404).json({success:false,message:"Timesheet not found"});
  }

  return res.status(200).json({success:true,timesheet});
 }catch(error){
  return res.status(500).json({success:false,message:"Error fetching timesheet",error:error.message});
 }
};

export const getTimesheetsByMentee=async(req,res)=>{
 try{
  const{menteeId}=req.params;
  if(!mongoose.Types.ObjectId.isValid(menteeId)){
   return res.status(400).json({success:false,message:"Invalid mentee id"});
  }

  const timesheets=await Timesheet.find({mentee:menteeId})
  .populate("createdBy","name email username fullName")
  .sort({weekNumber:1});

  return res.status(200).json({success:true,count:timesheets.length,timesheets});
 }catch(error){
  return res.status(500).json({success:false,message:"Error fetching timesheets",error:error.message});
 }
};

export const updateTimesheet=async(req,res)=>{
 try{
  const{id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({success:false,message:"Invalid timesheet id"});
  }

  const existingTimesheet=await Timesheet.findById(id);
  if(!existingTimesheet){
   return res.status(404).json({success:false,message:"Timesheet not found"});
  }

  const{
   _id,
   mentee,
   weekNumber,
   ...editableFields
  }=req.body;

  const payload={
   ...editableFields,
   dailyHours:{
    wednesday:Number(req.body?.dailyHours?.wednesday||0),
    thursday:Number(req.body?.dailyHours?.thursday||0),
    friday:Number(req.body?.dailyHours?.friday||0),
    saturday:Number(req.body?.dailyHours?.saturday||0),
    sunday:Number(req.body?.dailyHours?.sunday||0),
    monday:Number(req.body?.dailyHours?.monday||0),
    tuesday:Number(req.body?.dailyHours?.tuesday||0)
   }
  };

  const timesheet=await Timesheet.findByIdAndUpdate(id,payload,{returnDocument:"after",runValidators:true})
  .populate("mentee")
  .populate("createdBy","name email username fullName");

  return res.status(200).json({success:true,timesheet});
 }catch(error){
  return res.status(500).json({success:false,message:"Error updating timesheet",error:error.message});
 }
};

export const deleteTimesheet=async(req,res)=>{
 try{
  const{id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({success:false,message:"Invalid timesheet id"});
  }

  const timesheet=await Timesheet.findByIdAndDelete(id);

  if(!timesheet){
   return res.status(404).json({success:false,message:"Timesheet not found"});
  }

  return res.status(200).json({success:true,message:"Timesheet deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Error deleting timesheet",error:error.message});
 }
};
