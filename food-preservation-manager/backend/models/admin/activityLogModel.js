// backend/models/admin/activityLogModel.js
import mongoose from "mongoose";

const activityLogSchema=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User"},

 action:{type:String,required:true,trim:true}, // created, updated, deleted, uploaded, reserved
 entityType:{type:String,required:true,trim:true},
 entityId:{type:mongoose.Schema.Types.ObjectId},

 message:{type:String,trim:true,default:""},

 meta:{type:mongoose.Schema.Types.Mixed,default:{}},

 ip:{type:String,trim:true,default:""}
},{timestamps:true,collection:"activity_logs"});

const ActivityLog=mongoose.models.ActivityLog||mongoose.model("ActivityLog",activityLogSchema);

export default ActivityLog;