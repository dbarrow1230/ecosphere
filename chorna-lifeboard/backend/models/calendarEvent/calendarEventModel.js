import mongoose from "mongoose";

const calendarEventSchema=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 title:{type:String,required:true,trim:true},
 description:{type:String,default:""},
 eventType:{type:String,enum:["appointment","birthday","reminder","deadline","personal","work","health","family","holiday","other"],default:"personal"},
 startDate:{type:Date,required:true},
 endDate:{type:Date},
 allDay:{type:Boolean,default:false},
 location:{type:String,default:""},
 status:{type:String,enum:["scheduled","completed","cancelled","missed"],default:"scheduled"},
 priority:{type:String,enum:["low","medium","high","urgent"],default:"medium"},
 isRecurring:{type:Boolean,default:false},
 recurrence:{
  frequency:{type:String,enum:["none","daily","weekly","monthly","yearly"],default:"none"},
  interval:{type:Number,default:1},
  endDate:{type:Date}
 },
 reminder:{
  enabled:{type:Boolean,default:false},
  remindAt:{type:Date},
  method:{type:String,enum:["app","email","sms","none"],default:"app"}
 },
 lifeArea:{type:mongoose.Schema.Types.ObjectId,ref:"LifeArea"},
 category:{type:mongoose.Schema.Types.ObjectId,ref:"Category"},
 linkedTask:{type:mongoose.Schema.Types.ObjectId,ref:"Task"},
 linkedGoal:{type:mongoose.Schema.Types.ObjectId,ref:"Goal"},
 linkedJournalEntry:{type:mongoose.Schema.Types.ObjectId,ref:"JournalEntry"},
 tags:[{type:mongoose.Schema.Types.ObjectId,ref:"Tag"}]
},{ timestamps:true, collection:"calendar_events"});

calendarEventSchema.index({user:1,startDate:1,endDate:1});
calendarEventSchema.index({user:1,eventType:1,status:1});
calendarEventSchema.index({user:1,lifeArea:1});

const CalendarEvent=mongoose.model("CalendarEvent",calendarEventSchema);

export default CalendarEvent;