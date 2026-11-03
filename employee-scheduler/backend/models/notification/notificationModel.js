// backend/models/notifications/notificationModel.js
import mongoose from "mongoose";

const noteSchema=new mongoose.Schema({
 date:{type:Date,default:Date.now},
 text:{type:String,trim:true}
},{_id:false});

const notificationSchema=new mongoose.Schema({
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},

 employee:{type:mongoose.Schema.Types.ObjectId,ref:"Employee",default:null,index:true},
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null,index:true},

 type:{type:String,enum:[
  "shift-assigned",
  "shift-updated",
  "schedule-published",
  "time-off-submitted",
  "time-off-approved",
  "time-off-denied",
  "missed-clock-out",
  "overtime-alert",
  "payroll-processed",
  "general"
 ],default:"general",index:true},

 title:{type:String,trim:true,default:""},
 message:{type:String,trim:true,default:""},

 entityType:{type:String,trim:true,default:""},
 entityId:{type:mongoose.Schema.Types.ObjectId,default:null,index:true},

 isRead:{type:Boolean,default:false,index:true},
 readAt:{type:Date,default:null},

 status:{type:String,enum:["active","archived"],default:"active",index:true},

 notes:{type:[noteSchema],default:[]}
},{timestamps:true,collection:"notifications"});

notificationSchema.index({business:1,employee:1,isRead:1,createdAt:-1});
notificationSchema.index({business:1,user:1,isRead:1,createdAt:-1});
notificationSchema.index({business:1,type:1,status:1});

const Notification=mongoose.models.Notification||mongoose.model("Notification",notificationSchema);

export default Notification;