import mongoose from "mongoose";

const reminderModel=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},

 title:{type:String,required:true,trim:true},
 message:{type:String,required:true,trim:true},

 reminderType:{type:String,enum:["task","goal","habit","routine","journal","mindfulness","calendarEvent","review","custom"],default:"custom"},
 priority:{type:String,enum:["low","medium","high","urgent"],default:"medium"},

 audienceType:{type:String,enum:["all","selected"],default:"selected"},
 selectedUsers:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}],

 channels:{
  email:{type:Boolean,default:false},
  sms:{type:Boolean,default:false},
  inApp:{type:Boolean,default:true}
 },

 sendAt:{type:Date,required:true},
 remindAt:{type:Date},

 nextRunAt:{type:Date,default:null},
 lastSentAt:{type:Date,default:null},
 sentAt:{type:Date,default:null},

 status:{type:String,enum:["pending","processing","sent","failed","paused","dismissed","completed","cancelled"],default:"pending"},

 isRecurring:{type:Boolean,default:false},
 recurrenceRule:{type:String,enum:["","daily","weekly","bi-weekly","monthly","yearly"],default:""},
 recurrenceEndAt:{type:Date,default:null},

 repeat:{
  enabled:{type:Boolean,default:false},
  frequency:{type:String,enum:["none","daily","weekly","bi-weekly","monthly","yearly"],default:"none"},
  interval:{type:Number,default:1},
  endDate:{type:Date}
 },

 reminderOffsetMinutes:{type:Number,default:30},
 modalDismissedBy:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}],

 linkedTask:{type:mongoose.Schema.Types.ObjectId,ref:"Task"},
 linkedGoal:{type:mongoose.Schema.Types.ObjectId,ref:"Goal"},
 linkedHabit:{type:mongoose.Schema.Types.ObjectId,ref:"Habit"},
 linkedRoutine:{type:mongoose.Schema.Types.ObjectId,ref:"Routine"},
 linkedJournalEntry:{type:mongoose.Schema.Types.ObjectId,ref:"JournalEntry"},
 linkedMindfulnessEntry:{type:mongoose.Schema.Types.ObjectId,ref:"MindfulnessEntry"},
 linkedCalendarEvent:{type:mongoose.Schema.Types.ObjectId,ref:"CalendarEvent"},
 linkedReview:{type:mongoose.Schema.Types.ObjectId,ref:"Review"},

 lifeArea:{type:mongoose.Schema.Types.ObjectId,ref:"LifeArea"},
 category:{type:mongoose.Schema.Types.ObjectId,ref:"Category"},
 tags:[{type:mongoose.Schema.Types.ObjectId,ref:"Tag"}]
},{timestamps:true,collection:"reminders"});

reminderModel.index({user:1,sendAt:1,status:1});
reminderModel.index({user:1,nextRunAt:1,status:1});
reminderModel.index({user:1,reminderType:1});
reminderModel.index({user:1,priority:1});

const Reminder=mongoose.model("Reminder",reminderModel);

export default Reminder;