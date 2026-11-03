import mongoose from "mongoose";

const mentorshipTrackerSchema=new mongoose.Schema({
 mentee:{type:mongoose.Schema.Types.ObjectId,ref:"Mentee",required:true,unique:true,index:true},
 program:{type:mongoose.Schema.Types.ObjectId,ref:"Program",default:null},
 courseNumber:{type:String,trim:true,default:""},
 courseName:{type:String,trim:true,default:""},
 courses:[{
  program:{type:mongoose.Schema.Types.ObjectId,ref:"Program",default:null},
  programName:{type:String,trim:true,default:""},
  courseNumber:{type:String,trim:true,default:""},
  courseName:{type:String,trim:true,default:""}
 }],
 changeNoticeHours:{type:Number,min:0,default:1},
 suggestions:{type:[String],default:[]},
 research:{type:[String],default:[]},
 alignment:{
  goalsRelevant:{type:Boolean,default:true},
  hoursOnTrack:{type:Boolean,default:true},
  menteeEngaged:{type:Boolean,default:true},
  meetingPlanWorking:{type:Boolean,default:true},
  notes:{type:String,trim:true,default:""}
 },
 actionPlanNotes:{type:String,trim:true,default:""},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"mentorship_trackers"});

export default mongoose.model("MentorshipTracker",mentorshipTrackerSchema);
