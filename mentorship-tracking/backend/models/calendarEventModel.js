// backend/models/calendarEventModel.js
import mongoose from "mongoose";

const calendarEventModel=new mongoose.Schema({
 mentee:{type:mongoose.Schema.Types.ObjectId,ref:"Mentee",default:null,index:true},
 weekNumber:{type:Number,min:1},
 title:{type:String,trim:true,required:true},
 start:{type:Date,required:true},
 end:{type:Date,required:true},
 eventType:{type:String,enum:["session","reminder","follow-up","other","start-date","end-date"],default:"session"},
 status:{type:mongoose.Schema.Types.ObjectId,ref:"Status",default:null},
 weeklySession:{type:mongoose.Schema.Types.ObjectId,ref:"WeeklySession",default:null},
 notes:{type:[String],default:[]},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true}
},{timestamps:true,collection:"calendar_events"});

const CalendarEvent=mongoose.model("CalendarEvent",calendarEventModel);

export default CalendarEvent;
