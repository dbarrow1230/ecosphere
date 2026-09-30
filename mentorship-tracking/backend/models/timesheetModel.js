// backend/models/timesheetModel.js
import mongoose from "mongoose";

const timesheetModel=new mongoose.Schema({
 mentee:{type:mongoose.Schema.Types.ObjectId,ref:"Mentee",required:true,index:true},
 weekNumber:{type:Number,required:true,min:1},
 weekStarting:{type:Date,required:true},
 weekEnding:{type:Date,default:null},
 hours:{type:Number,required:true,min:0,max:40},
 dailyHours:{
  wednesday:{type:Number,default:0,min:0,max:24},
  thursday:{type:Number,default:0,min:0,max:24},
  friday:{type:Number,default:0,min:0,max:24},
  saturday:{type:Number,default:0,min:0,max:24},
  sunday:{type:Number,default:0,min:0,max:24},
  monday:{type:Number,default:0,min:0,max:24},
  tuesday:{type:Number,default:0,min:0,max:24}
 },
 source:{type:String,enum:["portal","manual"],default:"portal"},
 status:{type:String,enum:["pending","signed","rejected"],default:"pending"},
 signedAt:{type:Date,default:null},
 notes:{type:String,trim:true},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true}
},{timestamps:true,collection:"timesheets"});

timesheetModel.index({mentee:1,weekNumber:1},{unique:true});

const Timesheet=mongoose.model("Timesheet",timesheetModel);

export default Timesheet;
