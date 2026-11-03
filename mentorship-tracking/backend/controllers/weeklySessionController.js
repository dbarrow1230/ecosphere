// backend/controllers/weeklySessionController.js
import mongoose from "mongoose";
import WeeklySession from "../models/weeklySessionModel.js";

const allowedStatuses=["scheduled","completed","missed","cancelled","rescheduled"];

const buildPopulateQuery=query=>{
 return query
 .populate("mentee")
 .populate("sessionType")
 .populate("createdBy","name email");
};

export const createWeeklySession=async(req,res)=>{
 try{
  const{mentee,weekNumber,sessionDate,sessionType,status,createdBy}=req.body;

  if(!mentee||!weekNumber||!sessionDate||!createdBy){
   return res.status(400).json({success:false,message:"mentee, weekNumber, sessionDate, and createdBy are required"});
  }

  if(!mongoose.Types.ObjectId.isValid(mentee)){
   return res.status(400).json({success:false,message:"Invalid mentee id"});
  }

  if(!mongoose.Types.ObjectId.isValid(createdBy)){
   return res.status(400).json({success:false,message:"Invalid createdBy id"});
  }

  if(sessionType&& !mongoose.Types.ObjectId.isValid(sessionType)){
   return res.status(400).json({success:false,message:"Invalid session type id"});
  }

  if(status&& !allowedStatuses.includes(status)){
   return res.status(400).json({success:false,message:"Invalid weekly session status"});
  }

  const weeklySession=await WeeklySession.create({
   mentee,
   weekNumber:Number(weekNumber),
   sessionDate,
   sessionType:sessionType||null,
   competencyDiscussed:req.body.competencyDiscussed,
   actionPlanStep:req.body.actionPlanStep,
   howWhenCompleted:req.body.howWhenCompleted,
   notes:req.body.notes,
   status:status||"scheduled",
   createdBy
  });

  const newWeeklySession=await buildPopulateQuery(WeeklySession.findById(weeklySession._id));

  return res.status(201).json({success:true,weeklySession:newWeeklySession});
 }catch(error){
  return res.status(500).json({success:false,message:"Error creating weekly session",error:error.message});
 }
};

export const getWeeklySessions=async(req,res)=>{
 try{
  const{mentee,weekNumber,status,createdBy}=req.query;
  let query={};

  if(mentee){
   if(!mongoose.Types.ObjectId.isValid(mentee)){
    return res.status(400).json({success:false,message:"Invalid mentee id"});
   }
   query.mentee=mentee;
  }

  if(weekNumber)query.weekNumber=Number(weekNumber);

  if(status){
   if(!allowedStatuses.includes(status)){
    return res.status(400).json({success:false,message:"Invalid weekly session status"});
   }
   query.status=status;
  }

  if(createdBy){
   if(!mongoose.Types.ObjectId.isValid(createdBy)){
    return res.status(400).json({success:false,message:"Invalid createdBy id"});
   }
   query.createdBy=createdBy;
  }

  const weeklySessions=await buildPopulateQuery(
   WeeklySession.find(query).sort({sessionDate:1})
  );

  return res.status(200).json({success:true,count:weeklySessions.length,weeklySessions});
 }catch(error){
  return res.status(500).json({success:false,message:"Error fetching weekly sessions",error:error.message});
 }
};

export const getWeeklySessionById=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({success:false,message:"Invalid weekly session id"});
  }

  const weeklySession=await buildPopulateQuery(WeeklySession.findById(id));

  if(!weeklySession){
   return res.status(404).json({success:false,message:"Weekly session not found"});
  }

  return res.status(200).json({success:true,weeklySession});
 }catch(error){
  return res.status(500).json({success:false,message:"Error fetching weekly session",error:error.message});
 }
};

export const getWeeklySessionsByMentee=async(req,res)=>{
 try{
  const{menteeId}=req.params;

  if(!mongoose.Types.ObjectId.isValid(menteeId)){
   return res.status(400).json({success:false,message:"Invalid mentee id"});
  }

  const weeklySessions=await buildPopulateQuery(
   WeeklySession.find({mentee:menteeId}).sort({weekNumber:1,sessionDate:1})
  );

  return res.status(200).json({success:true,count:weeklySessions.length,weeklySessions});
 }catch(error){
  return res.status(500).json({success:false,message:"Error fetching weekly sessions",error:error.message});
 }
};

export const updateWeeklySession=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({success:false,message:"Invalid weekly session id"});
  }

  if(req.body.mentee&& !mongoose.Types.ObjectId.isValid(req.body.mentee)){
   return res.status(400).json({success:false,message:"Invalid mentee id"});
  }

  if(req.body.createdBy&& !mongoose.Types.ObjectId.isValid(req.body.createdBy)){
   return res.status(400).json({success:false,message:"Invalid createdBy id"});
  }

  if(req.body.sessionType&& !mongoose.Types.ObjectId.isValid(req.body.sessionType)){
   return res.status(400).json({success:false,message:"Invalid session type id"});
  }

  if(req.body.status&& !allowedStatuses.includes(req.body.status)){
   return res.status(400).json({success:false,message:"Invalid weekly session status"});
  }

  if(req.body.weekNumber!==undefined){
   req.body.weekNumber=Number(req.body.weekNumber);
  }

  const weeklySession=await buildPopulateQuery(
   WeeklySession.findByIdAndUpdate(id,req.body,{returnDocument:"after",runValidators:true})
  );

  if(!weeklySession){
   return res.status(404).json({success:false,message:"Weekly session not found"});
  }

  return res.status(200).json({success:true,weeklySession});
 }catch(error){
  return res.status(500).json({success:false,message:"Error updating weekly session",error:error.message});
 }
};

export const deleteWeeklySession=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({success:false,message:"Invalid weekly session id"});
  }

  const weeklySession=await WeeklySession.findByIdAndDelete(id);

  if(!weeklySession){
   return res.status(404).json({success:false,message:"Weekly session not found"});
  }

  return res.status(200).json({success:true,message:"Weekly session deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Error deleting weekly session",error:error.message});
 }
};