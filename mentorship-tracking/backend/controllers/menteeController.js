// backend/controllers/menteeController.js
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import {fileURLToPath} from "url";
import Mentee from "../models/menteeModel.js";
import Program from "../models/programModel.js";
import Status from "../models/statusModel.js";
import State from "../models/locations/stateModel.js";
import Country from "../models/locations/countryModel.js";

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const backendDir=path.resolve(__dirname,"..");

const isValidObjectId=value=>mongoose.Types.ObjectId.isValid(value);

const ensureDir=dir=>{
 if(!fs.existsSync(dir))fs.mkdirSync(dir,{recursive:true});
};

const getSafeMenteeName=value=>{
 const menteeName=(value||"").trim();
 // eslint-disable-next-line no-control-regex
 return menteeName.replace(/[<>:"/\\|?*\x00-\x1F]/g,"_");
};

const createMenteeFolders=menteeDoc=>{
 const safeMenteeName=getSafeMenteeName(menteeDoc?.fullName)||"general";
 const menteeDir=path.join(backendDir,"public","mentee",safeMenteeName);
 const imagesDir=path.join(menteeDir,"images");
 const docsDir=path.join(menteeDir,"docs");

 ensureDir(menteeDir);
 ensureDir(imagesDir);
 ensureDir(docsDir);

 return {safeMenteeName,menteeDir,imagesDir,docsDir};
};

const validatePrograms=async programs=>{
 if(programs===undefined)return null;

 if(!Array.isArray(programs)){
  return "Programs must be an array";
 }

 const invalidProgramId=programs.find(programId=>!isValidObjectId(programId));
 if(invalidProgramId){
  return "Invalid program id";
 }

 const uniqueProgramIds=[...new Set(programs.map(String))];
 const programCount=await Program.countDocuments({_id:{$in:uniqueProgramIds}});
 if(programCount!==uniqueProgramIds.length){
  return "One or more programs are invalid";
 }

 return null;
};

const validateCourses=async courses=>{
 if(courses===undefined)return null;
 if(!Array.isArray(courses))return "Courses must be an array";
 const programIds=[...new Set(courses.map(item=>String(item?.program||"")).filter(Boolean))];
 const programs=await Program.find({_id:{$in:programIds}});
 const courseMap=new Map(programs.map(program=>[String(program._id),new Set((program.courses||[]).map(course=>String(course._id)))]));
 const invalid=courses.find(item=>!isValidObjectId(item?.program)||!isValidObjectId(item?.course)||!courseMap.get(String(item.program))?.has(String(item.course)));
 return invalid?"One or more selected courses are invalid":null;
};

const validateStatus=async status=>{
 if(status===undefined||status===null||status==="")return null;

 if(!isValidObjectId(status)){
  return "Invalid mentee status id";
 }

 const statusDoc=await Status.findOne({_id:status,type:"mentee",isActive:true});
 if(!statusDoc){
  return "Invalid mentee status";
 }

 return null;
};

const normalizeMenteePayload=body=>({
 firstName:body.firstName,
 lastName:body.lastName,
 email:body.email||"",
 phone:body.phone||"",
 image:body.image||"",
 businessName:body.businessName||"",
 website:body.website||"",
 address1:body.address1||"",
 address2:body.address2||"",
 city:body.city||"",
 state:body.state||null,
 country:body.country||null,
 postalCode:body.postalCode||"",
 hoursNeeded:body.hoursNeeded??150,
 externshipStartDate:body.externshipStartDate||null,
 externshipEndDate:body.externshipEndDate||null,
 preferredMeetingDay:body.preferredMeetingDay||null,
 preferredMeetingTime:body.preferredMeetingTime||null,
 meetingDuration:body.meetingDuration??30,
 meetingFrequency:body.meetingFrequency||"Weekly",
 meetingMethod:body.meetingMethod||null,
 status:body.status||null,
 isFlagged:Boolean(body.isFlagged),
 flagReason:body.isFlagged?(body.flagReason||""):"",
 riskLevel:body.riskLevel||"low",
 currentGoalProgress:body.currentGoalProgress||null,
 meetingRegularity:body.meetingRegularity||null,
 finalVerification:body.finalVerification||null,
 mentorAgreementStatus:body.mentorAgreementCompleted?"signed":(body.mentorAgreementStatus||"not-started"),
 mentorAgreementCompleted:(body.mentorAgreementStatus?body.mentorAgreementStatus==="signed":Boolean(body.mentorAgreementCompleted)),
 mentorAgreementCompletedDate:(body.mentorAgreementStatus?body.mentorAgreementStatus==="signed":Boolean(body.mentorAgreementCompleted))?(body.mentorAgreementCompletedDate||new Date()):null,
 notes:Array.isArray(body.notes)?body.notes:[],
 programs:Array.isArray(body.programs)?body.programs:[],
 courses:Array.isArray(body.courses)?body.courses.map(item=>({program:item.program,course:item.course})):[],
 createdBy:body.createdBy
});

const populateMentee=query=>query
 .populate({path:"state",model:State})
 .populate({path:"country",model:Country})
 .populate("programs")
 .populate("meetingMethod")
 .populate("status")
 .populate("createdBy","name email");

export const createMentee=async(req,res)=>{
 try{
  const statusError=await validateStatus(req.body.status);
  if(statusError){
   return res.status(400).json({success:false,message:statusError});
  }

  const programError=await validatePrograms(req.body.programs);
  if(programError){
   return res.status(400).json({success:false,message:programError});
  }
  const courseError=await validateCourses(req.body.courses);
  if(courseError)return res.status(400).json({success:false,message:courseError});

  if(!req.body.createdBy||!isValidObjectId(req.body.createdBy)){
   return res.status(400).json({success:false,message:"Invalid createdBy id"});
  }

  if(req.body.state&&!isValidObjectId(req.body.state)){
   return res.status(400).json({success:false,message:"Invalid state id"});
  }

  if(req.body.country&&!isValidObjectId(req.body.country)){
   return res.status(400).json({success:false,message:"Invalid country id"});
  }

  if(req.body.meetingMethod&&!isValidObjectId(req.body.meetingMethod)){
   return res.status(400).json({success:false,message:"Invalid meeting method id"});
  }

  const menteePayload=normalizeMenteePayload(req.body);

  const mentee=await Mentee.create(menteePayload);
  createMenteeFolders(mentee);

  const newMentee=await populateMentee(Mentee.findById(mentee._id));

  return res.status(201).json({success:true,mentee:newMentee});
 }catch(error){
  return res.status(500).json({success:false,message:"Error creating mentee",error:error.message});
 }
};

export const getMentees=async(req,res)=>{
 try{
  const mentees=await populateMentee(
   Mentee.find().sort({createdAt:-1})
  );

  return res.status(200).json({success:true,count:mentees.length,mentees});
 }catch(error){
  return res.status(500).json({success:false,message:"Error fetching mentees",error:error.message});
 }
};

export const getMenteeById=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!isValidObjectId(id)){
   return res.status(400).json({success:false,message:"Invalid mentee id"});
  }

  const mentee=await populateMentee(Mentee.findById(id));

  if(!mentee){
   return res.status(404).json({success:false,message:"Mentee not found"});
  }

  return res.status(200).json({success:true,mentee});
 }catch(error){
  return res.status(500).json({success:false,message:"Error fetching mentee",error:error.message});
 }
};

export const updateMentee=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!isValidObjectId(id)){
   return res.status(400).json({success:false,message:"Invalid mentee id"});
  }

  const statusError=await validateStatus(req.body.status);
  if(statusError){
   return res.status(400).json({success:false,message:statusError});
  }

  const programError=await validatePrograms(req.body.programs);
  if(programError){
   return res.status(400).json({success:false,message:programError});
  }
  const courseError=await validateCourses(req.body.courses);
  if(courseError)return res.status(400).json({success:false,message:courseError});

  if(req.body.createdBy&&!isValidObjectId(req.body.createdBy)){
   return res.status(400).json({success:false,message:"Invalid createdBy id"});
  }

  if(req.body.state&&!isValidObjectId(req.body.state)){
   return res.status(400).json({success:false,message:"Invalid state id"});
  }

  if(req.body.country&&!isValidObjectId(req.body.country)){
   return res.status(400).json({success:false,message:"Invalid country id"});
  }

  if(req.body.meetingMethod&&!isValidObjectId(req.body.meetingMethod)){
   return res.status(400).json({success:false,message:"Invalid meeting method id"});
  }

  const existingMentee=await Mentee.findById(id);
  if(!existingMentee){
   return res.status(404).json({success:false,message:"Mentee not found"});
  }

  const menteePayload=normalizeMenteePayload({
   ...existingMentee.toObject(),
   ...req.body,
   createdBy:req.body.createdBy||existingMentee.createdBy
  });

  const mentee=await Mentee.findByIdAndUpdate(id,menteePayload,{returnDocument:"after",runValidators:true});

  createMenteeFolders(mentee);

  const populatedMentee=await populateMentee(Mentee.findById(mentee._id));

  return res.status(200).json({success:true,mentee:populatedMentee});
 }catch(error){
  return res.status(500).json({success:false,message:"Error updating mentee",error:error.message});
 }
};

export const deleteMentee=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!isValidObjectId(id)){
   return res.status(400).json({success:false,message:"Invalid mentee id"});
  }

  const mentee=await Mentee.findByIdAndDelete(id);

  if(!mentee){
   return res.status(404).json({success:false,message:"Mentee not found"});
  }

  return res.status(200).json({success:true,message:"Mentee deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Error deleting mentee",error:error.message});
 }
};

export const updateMenteeAgreement=async(req,res)=>{
 try{
  const{id}=req.params;
  if(!isValidObjectId(id)){
   return res.status(400).json({success:false,message:"Invalid mentee id"});
  }

  const allowedStatuses=[
   "not-started",
   "waiting-for-mentee-signature",
   "waiting-for-career-services",
   "waiting-for-mentor-signature",
   "signed"
  ];
  const mentorAgreementStatus=String(req.body.mentorAgreementStatus||"");
  if(!allowedStatuses.includes(mentorAgreementStatus)){
   return res.status(400).json({success:false,message:"Invalid agreement stage"});
  }

  const isSigned=mentorAgreementStatus==="signed";
  const signedDate=isSigned?(req.body.mentorAgreementCompletedDate||new Date()):null;
  const mentee=await Mentee.findByIdAndUpdate(id,{
   $set:{
    mentorAgreementStatus,
    mentorAgreementCompleted:isSigned,
    mentorAgreementCompletedDate:signedDate
   }
  },{returnDocument:"after",runValidators:true});

  if(!mentee)return res.status(404).json({success:false,message:"Mentee not found"});
  const populatedMentee=await populateMentee(Mentee.findById(mentee._id));
  return res.status(200).json({success:true,mentee:populatedMentee});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to update agreement",error:error.message});
 }
};
