// backend/models/weeklySessionModel.js
import mongoose from "mongoose";

const weeklySessionModel=new mongoose.Schema({
 mentee:{type:mongoose.Schema.Types.ObjectId,ref:"Mentee",required:true,index:true},
 weekNumber:{type:Number,required:true,min:1},
 sessionDate:{type:Date,required:true},
 sessionType:{type:mongoose.Schema.Types.ObjectId,ref:"MeetingMethod",default:null},
 competencyDiscussed:{type:String,trim:true},
 actionPlanStep:{type:String,trim:true},
 howWhenCompleted:{type:String,trim:true},
 notes:{type:String,trim:true},
 status:{type:String,enum:["scheduled","completed","missed","cancelled","rescheduled"],default:"scheduled"},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true}
},{timestamps:true,collection:"weekly_sessions"});

const WeeklySession=mongoose.model("WeeklySession",weeklySessionModel);

export default WeeklySession;