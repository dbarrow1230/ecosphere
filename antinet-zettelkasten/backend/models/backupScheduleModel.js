import mongoose from "mongoose";

const backupScheduleSchema=new mongoose.Schema({
 userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},
 backupType:{
  type:String,
  enum:["full","notes","favorites","archived","tags"],
  default:"full",
  required:true
 },
 frequency:{
  type:String,
  enum:["daily","weekly","monthly"],
  default:"weekly",
  required:true
 },
 startDate:{type:String,required:true,trim:true},
 time:{type:String,required:true,trim:true},
 dayOfWeek:{type:Number,min:0,max:6,default:null},
 dayOfMonth:{type:Number,min:1,max:31,default:null},
 timeZone:{type:String,default:"America/New_York",trim:true},
 retentionDays:{type:Number,min:1,max:3650,default:30},
 backupLocation:{type:String,default:"",trim:true},
 status:{type:String,enum:["active","paused"],default:"active",index:true},
 nextRunAt:{type:Date,default:null,index:true},
 lastRunAt:{type:Date,default:null},
 lastStatus:{type:String,enum:["","completed","failed"],default:""},
 lastMessage:{type:String,default:"",trim:true},
 isRunning:{type:Boolean,default:false,index:true}
},{timestamps:true,collection:"backup_schedules"});

backupScheduleSchema.index({userId:1,status:1,nextRunAt:1});

const BackupSchedule=mongoose.model("BackupSchedule",backupScheduleSchema);

export default BackupSchedule;
