import mongoose from "mongoose";

const taskSchema=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 title:{type:String,required:true,trim:true},
 description:{type:String,default:""},
 taskType:{type:String,enum:["daily","weekly","monthly","yearly"],default:"daily"},
 status:{type:String,enum:["pending","in-progress","completed","cancelled","archived"],default:"pending"},
 priority:{type:String,enum:["low","medium","high","urgent"],default:"medium"},

 startDate:{type:Date},
 dueDate:{type:Date},
 endDate:{type:Date},
 completedAt:{type:Date},

 startTime:{type:String,default:""},
 endTime:{type:String,default:""},
 allDay:{type:Boolean,default:true},

 repeatDays:[{  type:String,  enum:["sunday","monday","tuesday","wednesday","thursday","friday","saturday"] }],
 repeatDayOfMonth:{type:Number,min:1,max:31},
 repeatMonth:{type:Number,min:1,max:12},
 repeatDayOfYear:{type:Number,min:1,max:31},

 lifeArea:{type:mongoose.Schema.Types.ObjectId,ref:"LifeArea"},
 category:{type:mongoose.Schema.Types.ObjectId,ref:"Category"},
 linkedGoal:{type:mongoose.Schema.Types.ObjectId,ref:"Goal"},
 linkedHabit:{type:mongoose.Schema.Types.ObjectId,ref:"Habit"},
 notes:{type:String,default:""},
 tags:[{type:mongoose.Schema.Types.ObjectId,ref:"Tag"}]
},{ timestamps:true, collection:"tasks"});

taskSchema.index({user:1,dueDate:1,status:1,taskType:1});
taskSchema.index({user:1,startDate:1,endDate:1,taskType:1});
taskSchema.index({user:1,priority:1});
taskSchema.index({user:1,lifeArea:1});
taskSchema.index({user:1,repeatDays:1});
taskSchema.index({user:1,repeatDayOfMonth:1});
taskSchema.index({user:1,repeatMonth:1,repeatDayOfYear:1});

const Task=mongoose.model("Task",taskSchema);

export default Task;