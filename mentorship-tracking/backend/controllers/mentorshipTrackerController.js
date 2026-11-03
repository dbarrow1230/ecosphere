import mongoose from "mongoose";
import MentorshipTracker from "../models/mentorshipTrackerModel.js";

const cleanList=value=>(Array.isArray(value)?value:String(value||"").split("\n")).map(item=>String(item).trim()).filter(Boolean);
const cleanCourses=value=>(Array.isArray(value)?value:[]).map(item=>({
 program:mongoose.Types.ObjectId.isValid(item?.program)?item.program:null,
 programName:String(item?.programName||"").trim(),
 courseNumber:String(item?.courseNumber||"").trim(),
 courseName:String(item?.courseName||"").trim()
})).filter(item=>item.program&&(item.courseNumber||item.courseName));

export const getMentorshipTracker=async(req,res)=>{
 if(!mongoose.Types.ObjectId.isValid(req.params.menteeId))return res.status(400).json({success:false,message:"Invalid mentee id"});
 const tracker=await MentorshipTracker.findOne({mentee:req.params.menteeId}).populate("program");
 res.json({success:true,tracker});
};

export const saveMentorshipTracker=async(req,res)=>{
 try{
  if(!mongoose.Types.ObjectId.isValid(req.params.menteeId))return res.status(400).json({success:false,message:"Invalid mentee id"});
  const alignment=req.body.alignment||{};
  const tracker=await MentorshipTracker.findOneAndUpdate(
   {mentee:req.params.menteeId},
   {$set:{
    program:mongoose.Types.ObjectId.isValid(req.body.program)?req.body.program:null,
    courseNumber:String(req.body.courseNumber||"").trim(),
    courseName:String(req.body.courseName||"").trim(),
    courses:cleanCourses(req.body.courses),
    changeNoticeHours:Number(req.body.changeNoticeHours||0),
    suggestions:cleanList(req.body.suggestions),
    research:cleanList(req.body.research),
    alignment:{
     goalsRelevant:alignment.goalsRelevant!==false,
     hoursOnTrack:alignment.hoursOnTrack!==false,
     menteeEngaged:alignment.menteeEngaged!==false,
     meetingPlanWorking:alignment.meetingPlanWorking!==false,
     notes:String(alignment.notes||"").trim()
    },
    actionPlanNotes:String(req.body.actionPlanNotes||"").trim(),
    createdBy:req.body.createdBy||null
   }},
   {returnDocument:"after",upsert:true,runValidators:true,setDefaultsOnInsert:true}
  );
  await tracker.populate("program");
  res.json({success:true,tracker});
 }catch(error){res.status(500).json({success:false,message:"Failed to save mentorship tracker",error:error.message});}
};
