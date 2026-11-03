// backend/models/meetingMethodModel.js
import mongoose from "mongoose";

const meetingMethodSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true,unique:true},
 description:{type:String,trim:true},
 isActive:{type:Boolean,default:true},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"meeting_methods"});

const MeetingMethod=mongoose.model("MeetingMethod",meetingMethodSchema);

export default MeetingMethod;