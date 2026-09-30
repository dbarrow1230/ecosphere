import mongoose from "mongoose";

const reminderSchema=new mongoose.Schema({
 userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},
 selectedUsers:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}],
 audienceType:{type:String,enum:["selected","all"],default:"selected"},
 reminderId:{type:String,required:true,trim:true},
 parentModel:{type:String,default:"User",trim:true},
 parentRecordId:{type:mongoose.Schema.Types.ObjectId,default:null,index:true},
 parentDisplayId:{type:String,default:"",trim:true},
 title:{type:String,required:true,trim:true},
 message:{type:String,default:"",trim:true},
 reminderType:{type:String,enum:["review","follow-up","process","research","custom"],default:"custom"},
 sendAt:{type:Date,required:true,index:true},
 nextRunAt:{type:Date,default:null,index:true},
 lastSentAt:{type:Date,default:null},
 sentAt:{type:Date,default:null},
 isRecurring:{type:Boolean,default:false},
 recurrenceRule:{type:String,enum:["","daily","weekly","bi-weekly","monthly"],default:""},
 recurrenceEndAt:{type:Date,default:null},
 channels:{
  email:{type:Boolean,default:false},
  inApp:{type:Boolean,default:true}
 },
 reminderOffsetMinutes:{type:Number,default:30,min:0},
 modalDismissedBy:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}],
 status:{type:String,enum:["pending","processing","sent","failed","paused","archived"],default:"pending",index:true},
 dismissedAt:{type:Date,default:null}
},{timestamps:true,collection:"reminders"});

reminderSchema.index({userId:1,reminderId:1},{unique:true});
reminderSchema.index({userId:1,status:1,sendAt:1});
reminderSchema.index({userId:1,parentModel:1,parentRecordId:1});

const Reminder=mongoose.models.Reminder||mongoose.model("Reminder",reminderSchema);

export default Reminder;
