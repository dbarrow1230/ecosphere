// backend/models/habit/habitModel.js
import mongoose from "mongoose";

const habitSchema=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 title:{type:String,required:true,trim:true},
 description:{type:String,default:""},
 frequency:{type:String,enum:["daily","weekly","monthly","yearly"],default:"daily"},
 targetCount:{type:Number,default:1},
 unit:{type:String,default:"times"},

 startDate:{type:Date},
 endDate:{type:Date},

 timeSlots:[{
  startTime:{type:String,default:""},
  endTime:{type:String,default:""}
 }],

 allDay:{type:Boolean,default:true},

 repeatDays:[{
  type:String,
  enum:["sunday","monday","tuesday","wednesday","thursday","friday","saturday"]
 }],
 repeatDayOfMonth:{type:Number,min:1,max:31},
 repeatMonth:{type:Number,min:1,max:12},
 repeatDayOfYear:{type:Number,min:1,max:31},

 status:{type:String,enum:["active","paused","completed","archived"],default:"active"},
 lifeArea:{type:mongoose.Schema.Types.ObjectId,ref:"LifeArea"},
 category:{type:mongoose.Schema.Types.ObjectId,ref:"Category"},
 tags:[{type:mongoose.Schema.Types.ObjectId,ref:"Tag"}]
},{ timestamps:true, collection:"habits"});

habitSchema.index({user:1,status:1,frequency:1});
habitSchema.index({user:1,startDate:1,endDate:1,frequency:1});
habitSchema.index({user:1,lifeArea:1});
habitSchema.index({user:1,repeatDays:1});
habitSchema.index({user:1,repeatDayOfMonth:1});
habitSchema.index({user:1,repeatMonth:1,repeatDayOfYear:1});

const Habit=mongoose.model("Habit",habitSchema);

export default Habit;