import mongoose from "mongoose";
import ReadingGoalModel from "../models/ReadingGoalModel.js";

const toNumber=(value,defaultValue=0)=>{
 const number=Number(value);
 return Number.isFinite(number)&&number>=0?number:defaultValue;
};

const normalizeGoalPayload=body=>({
 name:(body?.name||"Reading Goal").toString().trim(),
 period:["monthly","yearly"].includes(body?.period)?body.period:"monthly",
 year:toNumber(body?.year,new Date().getFullYear()),
 month:body?.period==="yearly"?null:Math.min(12,Math.max(1,toNumber(body?.month,new Date().getMonth()+1))),
 targetBooks:toNumber(body?.targetBooks),
 targetPages:toNumber(body?.targetPages),
 booksCompleted:toNumber(body?.booksCompleted),
 pagesRead:toNumber(body?.pagesRead),
 status:["active","paused","completed","archived"].includes(body?.status)?body.status:"active",
 notes:(body?.notes||"").toString().trim()
});

const goalDuplicateQuery=payload=>({
 period:payload.period,
 year:payload.year,
 month:payload.period==="yearly"?null:payload.month,
 status:payload.status
});

export const createReadingGoal=async(req,res)=>{
 try{
  const payload=normalizeGoalPayload(req.body);
  const existing=await ReadingGoalModel.findOne(goalDuplicateQuery(payload));
  if(existing)return res.status(409).json({success:false,message:"An active reading goal already exists for this period."});
  const goal=await ReadingGoalModel.create(payload);
  return res.status(201).json({success:true,message:"Reading goal created successfully",goal});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to create reading goal",error:error.message});
 }
};

export const getReadingGoals=async(req,res)=>{
 try{
  const {period="",year="",month="",status=""}=req.query;
  const query={};

  if(period)query.period=period;
  if(year)query.year=Number(year);
  if(month)query.month=Number(month);
  if(status)query.status=status;

  const goals=await ReadingGoalModel.find(query).sort({year:-1,month:-1,createdAt:-1});
  return res.status(200).json({success:true,goals});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch reading goals",error:error.message});
 }
};

export const getCurrentReadingGoal=async(req,res)=>{
 try{
  const now=new Date();
  const goal=await ReadingGoalModel.findOne({
   status:"active",
   $or:[
    {period:"monthly",year:now.getFullYear(),month:now.getMonth()+1},
    {period:"yearly",year:now.getFullYear()}
   ]
  }).sort({period:1,updatedAt:-1});

  return res.status(200).json({success:true,goal});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch current reading goal",error:error.message});
 }
};

export const getReadingGoalById=async(req,res)=>{
 try{
  if(!mongoose.Types.ObjectId.isValid(req.params.id))return res.status(400).json({success:false,message:"Invalid reading goal id"});
  const goal=await ReadingGoalModel.findById(req.params.id);
  if(!goal)return res.status(404).json({success:false,message:"Reading goal not found"});
  return res.status(200).json({success:true,goal});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch reading goal",error:error.message});
 }
};

export const updateReadingGoal=async(req,res)=>{
 try{
  if(!mongoose.Types.ObjectId.isValid(req.params.id))return res.status(400).json({success:false,message:"Invalid reading goal id"});
  const payload=normalizeGoalPayload(req.body);
  const existing=await ReadingGoalModel.findOne({...goalDuplicateQuery(payload),_id:{$ne:req.params.id}});
  if(existing)return res.status(409).json({success:false,message:"Another active reading goal already exists for this period."});
  const goal=await ReadingGoalModel.findByIdAndUpdate(req.params.id,payload,{new:true,runValidators:true});
  if(!goal)return res.status(404).json({success:false,message:"Reading goal not found"});
  return res.status(200).json({success:true,message:"Reading goal updated successfully",goal});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to update reading goal",error:error.message});
 }
};

export const deleteReadingGoal=async(req,res)=>{
 try{
  if(!mongoose.Types.ObjectId.isValid(req.params.id))return res.status(400).json({success:false,message:"Invalid reading goal id"});
  const goal=await ReadingGoalModel.findByIdAndDelete(req.params.id);
  if(!goal)return res.status(404).json({success:false,message:"Reading goal not found"});
  return res.status(200).json({success:true,message:"Reading goal deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete reading goal",error:error.message});
 }
};
