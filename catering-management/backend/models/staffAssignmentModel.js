// backend/models/staffAssignmentModel.js
import mongoose from "mongoose";

const staffAssignmentSchema=new mongoose.Schema({
 event:{type:mongoose.Schema.Types.ObjectId,ref:"Event",required:true},
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 role:{type:String,required:true,trim:true},
 shiftDate:{type:Date,required:true},
 startTime:{type:String,trim:true,default:""},
 endTime:{type:String,trim:true,default:""},
 status:{type:String,enum:["assigned","confirmed","declined","completed","cancelled"],default:"assigned"},
 notes:{type:String,trim:true,default:""}
},{timestamps:true, collection:"staffassignments"});

const StaffAssignment=mongoose.models.StaffAssignment||mongoose.model("StaffAssignment",staffAssignmentSchema);

export default StaffAssignment;