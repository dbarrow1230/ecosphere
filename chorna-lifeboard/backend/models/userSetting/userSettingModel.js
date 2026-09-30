// backend/models/userSetting/userSettingModel.js
import mongoose from "mongoose";

const userSettingModel=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,unique:true},

 dashboard:{
  defaultView:{type:String,enum:["daily","weekly","monthly","yearly"],default:"daily"},
  showPrivateJournalCount:{type:Boolean,default:false},
  showMoodSummary:{type:Boolean,default:true},
  showHabitProgress:{type:Boolean,default:true},
  showUpcomingReminders:{type:Boolean,default:true},
  showTimelinePreview:{type:Boolean,default:true}
 },

 journal:{
  defaultJournalType:{type:String,enum:["daily","private","reflection","gratitude","memory","dream","free-write"],default:"daily"},
  defaultPrivate:{type:Boolean,default:false},
  showPromptsByDefault:{type:Boolean,default:true},
  requireMood:{type:Boolean,default:false},
  requireEnergy:{type:Boolean,default:false}
 },

 mindfulness:{
  showPromptsByDefault:{type:Boolean,default:true},
  requireMood:{type:Boolean,default:false},
  requireEnergy:{type:Boolean,default:false},
  requireStress:{type:Boolean,default:false}
 },

 reminders:{
  defaultChannels:{
   email:{type:Boolean,default:false},
   sms:{type:Boolean,default:false},
   inApp:{type:Boolean,default:true}
  },
  defaultOffsetMinutes:{type:Number,default:30},
  allowRecurring:{type:Boolean,default:true}
 },

 calendar:{
  weekStartsOn:{type:String,enum:["sunday","monday"],default:"sunday"},
  defaultEventView:{type:String,enum:["day","week","month","agenda"],default:"month"},
  showCompletedEvents:{type:Boolean,default:true},
  slotMinutes:{type:Number,enum:[5,10,15,20,30,60],default:30},
  dayStartHour:{type:Number,min:0,max:23,default:0},
  dayEndHour:{type:Number,min:1,max:24,default:24}
 },

 privacy:{
  privateJournalLocked:{type:Boolean,default:true},
  hidePrivateEntriesFromTimeline:{type:Boolean,default:true},
  hidePrivateEntriesFromDashboard:{type:Boolean,default:true}
 },

 appearance:{
  theme:{type:String,enum:["system","light","dark"],default:"system"},
  accentColor:{type:String,default:""},
  compactMode:{type:Boolean,default:false}
 },

 timezone:{type:String,default:"America/New_York"},
 locale:{type:String,default:"en-US"}
},{timestamps:true,collection:"user_settings"});

const UserSetting=mongoose.model("UserSetting",userSettingModel);

export default UserSetting;