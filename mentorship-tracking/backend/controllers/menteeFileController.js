// backend/controllers/menteeFileController.js
import mongoose from "mongoose";
import Mentee from "../models/menteeModel.js";
import MenteeFile from "../models/menteeFileModel.js";

const isValidObjectId=value=>mongoose.Types.ObjectId.isValid(value);

const normalizeFileType=value=>{
 const fileType=(value||"").trim().toLowerCase();
 return fileType||null;
};

const normalizeCategory=value=>{
 const category=(value||"general").trim().toLowerCase();

 return category||"general";
};

const normalizeWeekNumber=value=>{
 if(value===undefined||value===null||value==="") return null;
 const parsed=Number(value);
 if(Number.isNaN(parsed)) return NaN;
 if(parsed<=0) return null;
 return parsed;
};

export const createMenteeFile=async(req,res)=>{
 try{
  const {mentee,createdBy,description}=req.body;
  const weekNumber=normalizeWeekNumber(req.body.weekNumber);
  const fileType=normalizeFileType(req.body.fileType);
  const category=normalizeCategory(req.body.category);
  const fileName=String(req.body.fileName||"").trim();
  const filePath=String(req.body.filePath||"").trim();

  if(!mentee||!isValidObjectId(mentee)){
   return res.status(400).json({success:false,message:"Valid mentee id is required"});
  }

  if(!createdBy||!isValidObjectId(createdBy)){
   return res.status(400).json({success:false,message:"Valid createdBy id is required"});
  }

  if(!fileType){
   return res.status(400).json({success:false,message:"Invalid file type"});
  }

  if(Number.isNaN(weekNumber)){
   return res.status(400).json({success:false,message:"Invalid week number"});
  }

  if(!fileName){
   return res.status(400).json({success:false,message:"fileName is required"});
  }

  if(!filePath){
   return res.status(400).json({success:false,message:"filePath is required"});
  }

  const menteeDoc=await Mentee.findById(mentee);
  if(!menteeDoc){
   return res.status(404).json({success:false,message:"Mentee not found"});
  }

  const menteeFile=await MenteeFile.create({
   mentee:menteeDoc._id,
   weekNumber,
   fileName,
   filePath,
   fileType,
   category,
   description:(description||"").trim(),
   createdBy
  });

  return res.status(201).json({success:true,menteeFile});
 }catch(error){
  const status=error?.name==="ValidationError"?400:500;
  return res.status(status).json({
   success:false,
   message:error?.message||"Error creating mentee file"
  });
 }
};

export const getMenteeFiles=async(req,res)=>{
 try{
  const query={};

  if(req.query.mentee){
   if(!isValidObjectId(req.query.mentee)){
    return res.status(400).json({success:false,message:"Invalid mentee id"});
   }
   query.mentee=req.query.mentee;
  }

  if(req.query.fileType){
   const fileType=normalizeFileType(req.query.fileType);
   if(!fileType){
    return res.status(400).json({success:false,message:"Invalid file type"});
   }
   query.fileType=fileType;
  }

  if(req.query.category){
   query.category=normalizeCategory(req.query.category);
  }

  if(req.query.weekNumber!==undefined&&req.query.weekNumber!==""){
   const weekNumber=normalizeWeekNumber(req.query.weekNumber);
   if(Number.isNaN(weekNumber)){
    return res.status(400).json({success:false,message:"Invalid week number"});
   }
   if(weekNumber!==null){
    query.weekNumber=weekNumber;
   }
  }

  const menteeFiles=await MenteeFile.find(query)
   .populate("mentee","firstName lastName")
   .sort({createdAt:-1});

  return res.status(200).json({success:true,count:menteeFiles.length,menteeFiles});
 }catch(error){
  return res.status(500).json({success:false,message:error?.message||"Error fetching mentee files"});
 }
};

export const getMenteeFileById=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!isValidObjectId(id)){
   return res.status(400).json({success:false,message:"Invalid file id"});
  }

  const menteeFile=await MenteeFile.findById(id)
   .populate("mentee","firstName lastName");

  if(!menteeFile){
   return res.status(404).json({success:false,message:"File not found"});
  }

  return res.status(200).json({success:true,menteeFile});
 }catch(error){
  return res.status(500).json({success:false,message:error?.message||"Error fetching mentee file"});
 }
};

export const updateMenteeFile=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!isValidObjectId(id)){
   return res.status(400).json({success:false,message:"Invalid file id"});
  }

  const existingFile=await MenteeFile.findById(id);
  if(!existingFile){
   return res.status(404).json({success:false,message:"File not found"});
  }

  if(req.body.mentee&&!isValidObjectId(req.body.mentee)){
   return res.status(400).json({success:false,message:"Invalid mentee id"});
  }

  if(req.body.createdBy&&!isValidObjectId(req.body.createdBy)){
   return res.status(400).json({success:false,message:"Invalid createdBy id"});
  }

  if(req.body.mentee){
   const menteeDoc=await Mentee.findById(req.body.mentee);
   if(!menteeDoc){
    return res.status(404).json({success:false,message:"Mentee not found"});
   }
  }

  let fileType=existingFile.fileType;
  if(req.body.fileType!==undefined){
   fileType=normalizeFileType(req.body.fileType);
   if(!fileType){
    return res.status(400).json({success:false,message:"Invalid file type"});
   }
  }

  let weekNumber=existingFile.weekNumber;
  if(req.body.weekNumber!==undefined){
   weekNumber=normalizeWeekNumber(req.body.weekNumber);
   if(Number.isNaN(weekNumber)){
    return res.status(400).json({success:false,message:"Invalid week number"});
   }
  }

  const menteeFile=await MenteeFile.findByIdAndUpdate(
   id,
   {
    mentee:req.body.mentee||existingFile.mentee,
    weekNumber,
    fileName:req.body.fileName!==undefined?String(req.body.fileName).trim():existingFile.fileName,
    filePath:req.body.filePath!==undefined?String(req.body.filePath).trim():existingFile.filePath,
    fileType,
    category:req.body.category!==undefined?normalizeCategory(req.body.category):existingFile.category,
    description:req.body.description!==undefined?String(req.body.description).trim():existingFile.description,
    createdBy:req.body.createdBy||existingFile.createdBy
   },
   {returnDocument:"after",runValidators:true}
  )
   .populate("mentee","firstName lastName");

  return res.status(200).json({success:true,menteeFile});
 }catch(error){
  const status=error?.name==="ValidationError"?400:500;
  return res.status(status).json({success:false,message:error?.message||"Error updating mentee file"});
 }
};

export const deleteMenteeFile=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!isValidObjectId(id)){
   return res.status(400).json({success:false,message:"Invalid file id"});
  }

  const menteeFile=await MenteeFile.findByIdAndDelete(id);

  if(!menteeFile){
   return res.status(404).json({success:false,message:"File not found"});
  }

  return res.status(200).json({success:true,message:"Mentee file deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:error?.message||"Error deleting mentee file"});
 }
};
