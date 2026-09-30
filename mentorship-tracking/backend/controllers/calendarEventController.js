// backend/controllers/calendarEventController.js
import mongoose from "mongoose";
import CalendarEvent from "../models/calendarEventModel.js";
import Status from "../models/statusModel.js";

const normalizeNotes=value=>{
 const values=Array.isArray(value)?value:(value?[value]:[]);
 return values.map(item=>String(item||"").trim()).filter(Boolean);
};

export const createCalendarEvent=async(req,res)=>{
 try{
  const{mentee,weekNumber,title,start,end,eventType,status,weeklySession,notes,createdBy}=req.body;
  if(!title||!start||!end||!createdBy){
   return res.status(400).json({success:false,message:"title, start, end, and createdBy are required"});
  }

  if(status){
   if(!mongoose.Types.ObjectId.isValid(status)){
    return res.status(400).json({success:false,message:"Invalid calendar event status id"});
   }
   const statusDoc=await Status.findOne({_id:status,type:"calendarEvent",isActive:true});
   if(!statusDoc){
    return res.status(400).json({success:false,message:"Invalid calendar event status"});
   }
  }

  const calendarEvent=await CalendarEvent.create({
   mentee:mentee||null,
   weekNumber,
   title,
   start,
   end,
   eventType,
   status:status||null,
   weeklySession:weeklySession||null,
   notes:normalizeNotes(notes),
   createdBy
  });

  const newCalendarEvent=await CalendarEvent.findById(calendarEvent._id)
  .populate("mentee")
  .populate("status")
  .populate("weeklySession")
  .populate("createdBy","name email");

  return res.status(201).json({success:true,message:"Calendar event created successfully",calendarEvent:newCalendarEvent});
 }catch(error){
  return res.status(500).json({success:false,message:"Error creating calendar event",error:error.message});
 }
};

export const getCalendarEvents=async(req,res)=>{
 try{
  const{mentee,weekNumber,eventType,status,createdBy,startDate,endDate}=req.query;
  let query={};
  if(mentee)query.mentee=mentee;
  if(weekNumber)query.weekNumber=Number(weekNumber);
  if(eventType)query.eventType=eventType;
  if(status)query.status=status;
  if(createdBy)query.createdBy=createdBy;
  if(startDate||endDate){
   query.start={};
   if(startDate)query.start.$gte=new Date(startDate);
   if(endDate)query.start.$lte=new Date(endDate);
  }

  const calendarEvents=await CalendarEvent.find(query)
  .populate("mentee")
  .populate("status")
  .populate("weeklySession")
  .populate("createdBy","name email")
  .sort({start:1});

  return res.status(200).json({success:true,count:calendarEvents.length,calendarEvents});
 }catch(error){
  return res.status(500).json({success:false,message:"Error fetching calendar events",error:error.message});
 }
};

export const getCalendarEventById=async(req,res)=>{
 try{
  const{id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({success:false,message:"Invalid calendar event id"});
  }

  const calendarEvent=await CalendarEvent.findById(id)
  .populate("mentee")
  .populate("status")
  .populate("weeklySession")
  .populate("createdBy","name email");

  if(!calendarEvent){
   return res.status(404).json({success:false,message:"Calendar event not found"});
  }

  return res.status(200).json({success:true,calendarEvent});
 }catch(error){
  return res.status(500).json({success:false,message:"Error fetching calendar event",error:error.message});
 }
};

export const getCalendarEventsByMentee=async(req,res)=>{
 try{
  const{menteeId}=req.params;
  if(!mongoose.Types.ObjectId.isValid(menteeId)){
   return res.status(400).json({success:false,message:"Invalid mentee id"});
  }

  const calendarEvents=await CalendarEvent.find({mentee:menteeId})
  .populate("status")
  .populate("weeklySession")
  .populate("createdBy","name email")
  .sort({start:1});

  return res.status(200).json({success:true,count:calendarEvents.length,calendarEvents});
 }catch(error){
  return res.status(500).json({success:false,message:"Error fetching mentee calendar events",error:error.message});
 }
};

export const updateCalendarEvent=async(req,res)=>{
 try{
  const{id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({success:false,message:"Invalid calendar event id"});
  }

  if(req.body.status){
   if(!mongoose.Types.ObjectId.isValid(req.body.status)){
    return res.status(400).json({success:false,message:"Invalid calendar event status id"});
   }
   const statusDoc=await Status.findOne({_id:req.body.status,type:"calendarEvent",isActive:true});
   if(!statusDoc){
    return res.status(400).json({success:false,message:"Invalid calendar event status"});
   }
  }

  const updates={...req.body};
  if(Object.hasOwn(updates,"notes"))updates.notes=normalizeNotes(updates.notes);
  if(updates.mentee==="")updates.mentee=null;

  const updatedCalendarEvent=await CalendarEvent.findByIdAndUpdate(id,updates,{returnDocument:"after",runValidators:true})
  .populate("mentee")
  .populate("status")
  .populate("weeklySession")
  .populate("createdBy","name email");

  if(!updatedCalendarEvent){
   return res.status(404).json({success:false,message:"Calendar event not found"});
  }

  return res.status(200).json({success:true,message:"Calendar event updated successfully",calendarEvent:updatedCalendarEvent});
 }catch(error){
  return res.status(500).json({success:false,message:"Error updating calendar event",error:error.message});
 }
};

export const deleteCalendarEvent=async(req,res)=>{
 try{
  const{id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({success:false,message:"Invalid calendar event id"});
  }

  const deletedCalendarEvent=await CalendarEvent.findByIdAndDelete(id);

  if(!deletedCalendarEvent){
   return res.status(404).json({success:false,message:"Calendar event not found"});
  }

  return res.status(200).json({success:true,message:"Calendar event deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Error deleting calendar event",error:error.message});
 }
};
