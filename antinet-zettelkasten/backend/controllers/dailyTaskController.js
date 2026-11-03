import mongoose from "mongoose";
import DailyTask from "../models/dailyTaskModel.js";

const getUserId=req=>{
 const value=req.user?._id||req.body?.userId||req.query?.userId||"";
 return mongoose.isValidObjectId(value)?value:null;
};
const validDate=value=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(`${value}T12:00:00Z`))&&new Date(`${value}T12:00:00Z`).toISOString().slice(0,10)===value;
const validTime=value=>!value||/^([01]\d|2[0-3]):[0-5]\d$/.test(value);
const recurrenceRules=new Set(["none","daily","weekly","biweekly","monthly"]);
const payloadFrom=(body={},partial=false)=>{
 const payload={};
 for(const field of ["title","details","scheduledDate","startTime","recurrenceRule","recurrenceEndDate"]){
  if(!partial||Object.prototype.hasOwnProperty.call(body,field))payload[field]=String(body[field]||"").trim();
 }
 if(!partial&&!payload.recurrenceRule)payload.recurrenceRule="none";
 if(!partial||Object.prototype.hasOwnProperty.call(body,"completedDates"))payload.completedDates=Array.isArray(body.completedDates)?body.completedDates:[];
 if(!partial||Object.prototype.hasOwnProperty.call(body,"completed"))payload.completed=body.completed===true;
 return payload;
};
const validatePayload=(payload,existing={})=>{
 const merged={...existing,...payload};
 if(!merged.title)return "Task title is required";
 if(merged.title.length>200)return "Task title is too long";
 if(merged.details?.length>5000)return "Task details are too long";
 if(!validDate(merged.scheduledDate))return "Choose a valid task date";
 if(!validTime(merged.startTime))return "Use a valid task time";
 if(!recurrenceRules.has(merged.recurrenceRule||"none"))return "Choose a valid repeat frequency";
 if(merged.recurrenceEndDate&&!validDate(merged.recurrenceEndDate))return "Choose a valid repeat end date";
 if(merged.recurrenceEndDate&&merged.recurrenceEndDate<merged.scheduledDate)return "Repeat end date must be on or after the start date";
 if(!Array.isArray(merged.completedDates)||merged.completedDates.some(date=>!validDate(date)))return "Use valid completion dates";
 return "";
};

export const listDailyTasks=async(req,res)=>{
 try{
  const userId=getUserId(req);
  if(!userId)return res.status(400).json({success:false,message:"A valid user is required"});
  const filter={userId};
  const {from,to}=req.query;
  if(from||to){
   if((from&&!validDate(from))||(to&&!validDate(to))||(from&&to&&from>to))return res.status(400).json({success:false,message:"Choose a valid date range"});
   filter.scheduledDate={};
   if(from)filter.scheduledDate.$gte=from;
   if(to)filter.scheduledDate.$lte=to;
  }
  const tasks=await DailyTask.find(filter).sort({scheduledDate:1,startTime:1,createdAt:1});
  return res.json({success:true,data:tasks});
 }catch(error){return res.status(500).json({success:false,message:error.message});}
};

export const getDailyTask=async(req,res)=>{
 try{
  const userId=getUserId(req);
  if(!userId||!mongoose.isValidObjectId(req.params.id))return res.status(400).json({success:false,message:"A valid user and task are required"});
  const task=await DailyTask.findOne({_id:req.params.id,userId});
  return task?res.json({success:true,data:task}):res.status(404).json({success:false,message:"Task not found"});
 }catch(error){return res.status(500).json({success:false,message:error.message});}
};

export const createDailyTask=async(req,res)=>{
 try{
  const userId=getUserId(req);
  if(!userId)return res.status(400).json({success:false,message:"A valid user is required"});
  const payload=payloadFrom(req.body);
  const error=validatePayload(payload);
  if(error)return res.status(400).json({success:false,message:error});
  const task=await DailyTask.create({...payload,userId});
  return res.status(201).json({success:true,data:task});
 }catch(error){return res.status(400).json({success:false,message:error.message});}
};

export const updateDailyTask=async(req,res)=>{
 try{
  const userId=getUserId(req);
  if(!userId||!mongoose.isValidObjectId(req.params.id))return res.status(400).json({success:false,message:"A valid user and task are required"});
  const existing=await DailyTask.findOne({_id:req.params.id,userId});
  if(!existing)return res.status(404).json({success:false,message:"Task not found"});
  const payload=payloadFrom(req.body,true);
  const error=validatePayload(payload,existing.toObject());
  if(error)return res.status(400).json({success:false,message:error});
  const task=await DailyTask.findOneAndUpdate({_id:req.params.id,userId},{$set:payload},{returnDocument:"after",runValidators:true});
  return res.json({success:true,data:task});
 }catch(error){return res.status(400).json({success:false,message:error.message});}
};

export const deleteDailyTask=async(req,res)=>{
 try{
  const userId=getUserId(req);
  if(!userId||!mongoose.isValidObjectId(req.params.id))return res.status(400).json({success:false,message:"A valid user and task are required"});
  const task=await DailyTask.findOneAndDelete({_id:req.params.id,userId});
  return task?res.json({success:true,message:"Task deleted"}):res.status(404).json({success:false,message:"Task not found"});
 }catch(error){return res.status(500).json({success:false,message:error.message});}
};
