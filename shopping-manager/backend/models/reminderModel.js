import mongoose from "mongoose";

const reminderModel=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},

 title:{type:String,required:true,trim:true},
 message:{type:String,required:true,trim:true},

 audienceType:{type:String,enum:["all","selected"],default:"selected"},
 selectedUsers:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}],

 channels:{
  email:{type:Boolean,default:false},
  sms:{type:Boolean,default:false},
  inApp:{type:Boolean,default:true}
 },

 /* base timing */
 sendAt:{type:Date,required:true},

 /* recurring tracking */
 nextRunAt:{type:Date,default:null},
 lastSentAt:{type:Date,default:null},
 sentAt:{type:Date,default:null},

 status:{ type:String,  enum:["pending","processing","sent","failed","paused"],  default:"pending" },

 /* recurrence */
 isRecurring:{type:Boolean,default:false},
 recurrenceRule:{ type:String,  enum:["","weekly","bi-weekly"],  default:"" },
 recurrenceEndAt:{type:Date,default:null},

 reminderOffsetMinutes:{type:Number,default:30},
 modalDismissedBy:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}]
},{timestamps:true,collection:"reminders"});

const Reminder=mongoose.model("Reminder",reminderModel);

export default Reminder;