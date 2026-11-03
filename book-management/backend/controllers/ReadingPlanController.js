import mongoose from "mongoose";
import ReadingPlanModel from "../models/ReadingPlanModel.js";

const VALID_DAYS=["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

const toObjectId=value=>mongoose.Types.ObjectId.isValid(value)?new mongoose.Types.ObjectId(value):null;

const toNumber=value=>{
 const number=Number(value);
 return Number.isFinite(number)&&number>=0?number:0;
};

const toDate=value=>{
 if(!value)return null;
 const date=new Date(value);
 return Number.isNaN(date.getTime())?null:date;
};

const normalizePlanPayload=body=>({
 name:(body?.name||"Reading Plan").toString().trim(),
 book:toObjectId(body?.book),
 subject:(body?.subject||"General").toString().trim(),
 daysOfWeek:Array.isArray(body?.daysOfWeek)?body.daysOfWeek.map(day=>String(day).toLowerCase().trim()).filter(day=>VALID_DAYS.includes(day)):[],
 startDate:toDate(body?.startDate),
 endDate:toDate(body?.endDate),
 startPage:toNumber(body?.startPage),
 targetPage:toNumber(body?.targetPage),
 pagesPerSession:toNumber(body?.pagesPerSession),
 status:["active","paused","completed","archived"].includes(body?.status)?body.status:"active",
 notes:(body?.notes||"").toString().trim()
});

const populatePlan=query=>query.populate("book");

const planDuplicateQuery=payload=>({
 book:payload.book,
 subject:payload.subject,
 status:payload.status,
 daysOfWeek:payload.daysOfWeek
});

export const createReadingPlan=async(req,res)=>{
 try{
  const payload=normalizePlanPayload(req.body);
  if(!payload.book)return res.status(400).json({success:false,message:"A valid book is required"});
  const existing=await ReadingPlanModel.findOne(planDuplicateQuery(payload));
  if(existing)return res.status(409).json({success:false,message:"An active reading plan already exists for this book, subject, and days."});
  const plan=await ReadingPlanModel.create(payload);
  const populated=await populatePlan(ReadingPlanModel.findById(plan._id));
  return res.status(201).json({success:true,message:"Reading plan created successfully",plan:populated});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to create reading plan",error:error.message});
 }
};

export const getReadingPlans=async(req,res)=>{
 try{
  const {status="",subject="",book=""}=req.query;
  const query={};

  if(status)query.status=status;
  if(subject)query.subject={$regex:subject,$options:"i"};
  if(book&&mongoose.Types.ObjectId.isValid(book))query.book=book;

  const plans=await populatePlan(ReadingPlanModel.find(query).sort({status:1,startDate:1,subject:1,name:1}));
  return res.status(200).json({success:true,plans});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch reading plans",error:error.message});
 }
};

export const getReadingPlanById=async(req,res)=>{
 try{
  if(!mongoose.Types.ObjectId.isValid(req.params.id))return res.status(400).json({success:false,message:"Invalid reading plan id"});
  const plan=await populatePlan(ReadingPlanModel.findById(req.params.id));
  if(!plan)return res.status(404).json({success:false,message:"Reading plan not found"});
  return res.status(200).json({success:true,plan});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch reading plan",error:error.message});
 }
};

export const updateReadingPlan=async(req,res)=>{
 try{
  if(!mongoose.Types.ObjectId.isValid(req.params.id))return res.status(400).json({success:false,message:"Invalid reading plan id"});
  const payload=normalizePlanPayload(req.body);
  if(!payload.book)return res.status(400).json({success:false,message:"A valid book is required"});
  const existing=await ReadingPlanModel.findOne({...planDuplicateQuery(payload),_id:{$ne:req.params.id}});
  if(existing)return res.status(409).json({success:false,message:"Another active reading plan already exists for this book, subject, and days."});
  const plan=await ReadingPlanModel.findByIdAndUpdate(req.params.id,payload,{new:true,runValidators:true});
  if(!plan)return res.status(404).json({success:false,message:"Reading plan not found"});
  const populated=await populatePlan(ReadingPlanModel.findById(plan._id));
  return res.status(200).json({success:true,message:"Reading plan updated successfully",plan:populated});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to update reading plan",error:error.message});
 }
};

export const deleteReadingPlan=async(req,res)=>{
 try{
  if(!mongoose.Types.ObjectId.isValid(req.params.id))return res.status(400).json({success:false,message:"Invalid reading plan id"});
  const plan=await ReadingPlanModel.findByIdAndDelete(req.params.id);
  if(!plan)return res.status(404).json({success:false,message:"Reading plan not found"});
  return res.status(200).json({success:true,message:"Reading plan deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete reading plan",error:error.message});
 }
};
