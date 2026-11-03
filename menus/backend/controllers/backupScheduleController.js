import mongoose from "mongoose";
import BackupSchedule from "../models/backupScheduleModel.js";
import {calculateNextBackupRun,getBackupScheduleValidationError} from "../utils/backupScheduleUtils.js";

const getUserId=req=>{
 const value=String(req.user?._id||req.body?.userId||req.query?.userId||"");
 return mongoose.Types.ObjectId.isValid(value)?value:"";
};

const buildPayload=body=>({
 backupType:String(body.backupType||"full").trim().toLowerCase(),
 frequency:String(body.frequency||"weekly").trim().toLowerCase(),
 startDate:String(body.startDate||"").trim(),
 time:String(body.time||"").trim(),
 dayOfWeek:body.frequency==="weekly"?Number(body.dayOfWeek):null,
 dayOfMonth:body.frequency==="monthly"?Number(body.dayOfMonth):null,
 timeZone:String(body.timeZone||"America/New_York").trim(),
 retentionDays:Number(body.retentionDays),
 backupLocation:String(body.backupLocation||"").trim()
});

export const getBackupSchedules=async(req,res)=>{
 try{
  const userId=getUserId(req);
  if(!userId)return res.status(400).json({success:false,message:"A valid user ID is required"});
  const schedules=await BackupSchedule.find({userId}).sort({createdAt:-1});
  return res.json({success:true,data:schedules});
 }catch(error){
  return res.status(500).json({success:false,message:error.message});
 }
};

export const createBackupSchedule=async(req,res)=>{
 try{
  const userId=getUserId(req);
  if(!userId)return res.status(400).json({success:false,message:"A valid user ID is required"});
  const payload=buildPayload(req.body);
  const validationError=getBackupScheduleValidationError(payload);
  if(validationError)return res.status(400).json({success:false,message:validationError});
  payload.nextRunAt=calculateNextBackupRun(payload);
  const schedule=await BackupSchedule.create({...payload,userId,status:"active"});
  return res.status(201).json({success:true,message:"Automatic backup scheduled",data:schedule});
 }catch(error){
  return res.status(400).json({success:false,message:error.message});
 }
};

export const updateBackupSchedule=async(req,res)=>{
 try{
  const userId=getUserId(req);
  if(!userId)return res.status(400).json({success:false,message:"A valid user ID is required"});
  const existing=await BackupSchedule.findOne({_id:req.params.id,userId});
  if(!existing)return res.status(404).json({success:false,message:"Backup schedule not found"});
  const payload=buildPayload(req.body);
  const validationError=getBackupScheduleValidationError(payload);
  if(validationError)return res.status(400).json({success:false,message:validationError});
  payload.nextRunAt=existing.status==="active"?calculateNextBackupRun(payload):null;
  const schedule=await BackupSchedule.findOneAndUpdate(
   {_id:req.params.id,userId},
   payload,
   {returnDocument:"after",runValidators:true}
  );
  return res.json({success:true,message:"Backup schedule updated",data:schedule});
 }catch(error){
  return res.status(400).json({success:false,message:error.message});
 }
};

export const pauseBackupSchedule=async(req,res)=>{
 try{
  const userId=getUserId(req);
  const schedule=await BackupSchedule.findOneAndUpdate(
   {_id:req.params.id,userId,status:"active"},
   {status:"paused",nextRunAt:null,isRunning:false},
   {returnDocument:"after"}
  );
  if(!schedule)return res.status(409).json({success:false,message:"Only an active schedule can be paused"});
  return res.json({success:true,message:"Automatic backup paused",data:schedule});
 }catch(error){
  return res.status(400).json({success:false,message:error.message});
 }
};

export const resumeBackupSchedule=async(req,res)=>{
 try{
  const userId=getUserId(req);
  const existing=await BackupSchedule.findOne({_id:req.params.id,userId,status:"paused"});
  if(!existing)return res.status(409).json({success:false,message:"Only a paused schedule can be resumed"});
  existing.status="active";
  existing.isRunning=false;
  existing.nextRunAt=calculateNextBackupRun(existing);
  await existing.save();
  return res.json({success:true,message:"Automatic backup resumed",data:existing});
 }catch(error){
  return res.status(400).json({success:false,message:error.message});
 }
};

export const deleteBackupSchedule=async(req,res)=>{
 try{
  const userId=getUserId(req);
  const schedule=await BackupSchedule.findOneAndDelete({_id:req.params.id,userId});
  if(!schedule)return res.status(404).json({success:false,message:"Backup schedule not found"});
  return res.json({success:true,message:"Backup schedule deleted"});
 }catch(error){
  return res.status(500).json({success:false,message:error.message});
 }
};
