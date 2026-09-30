// backend/models/priority/priorityModel.js
import mongoose from "mongoose";

const prioritySchema=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},

 title:{type:String,required:true,trim:true},
 description:{type:String,default:""},

 priorityType:{type:String,enum:["daily","weekly","monthly","yearly"],default:"daily"},
 priorityLevel:{type:String,enum:["low","medium","high","urgent"],default:"medium"},
 status:{type:String,enum:["active","completed","paused","cancelled","archived"],default:"active"},

 startDate:{type:Date},
 dueDate:{type:Date},
 completedAt:{type:Date},

 lifeArea:{type:mongoose.Schema.Types.ObjectId,ref:"LifeArea"},
 category:{type:mongoose.Schema.Types.ObjectId,ref:"Category"},

 linkedGoal:{type:mongoose.Schema.Types.ObjectId,ref:"Goal"},
 linkedTask:{type:mongoose.Schema.Types.ObjectId,ref:"Task"},
 linkedHabit:{type:mongoose.Schema.Types.ObjectId,ref:"Habit"},
 linkedRoutine:{type:mongoose.Schema.Types.ObjectId,ref:"Routine"},
 linkedReminder:{type:mongoose.Schema.Types.ObjectId,ref:"Reminder"},
 linkedEvent:{type:mongoose.Schema.Types.ObjectId,ref:"CalendarEvent"},
 linkedMilestone:{type:mongoose.Schema.Types.ObjectId,ref:"Milestone"},
 linkedJournal:{type:mongoose.Schema.Types.ObjectId,ref:"JournalEntry"},

 notes:{type:String,default:""},
 tags:[{type:mongoose.Schema.Types.ObjectId,ref:"Tag"}]
},{timestamps:true,collection:"priorities"});

prioritySchema.index({user:1,priorityType:1,status:1});
prioritySchema.index({user:1,dueDate:1});
prioritySchema.index({user:1,priorityLevel:1});
prioritySchema.index({user:1,lifeArea:1});
prioritySchema.index({user:1,category:1});
prioritySchema.index({user:1,linkedGoal:1});
prioritySchema.index({user:1,linkedTask:1});
prioritySchema.index({user:1,linkedHabit:1});
prioritySchema.index({user:1,linkedRoutine:1});
prioritySchema.index({user:1,linkedReminder:1});
prioritySchema.index({user:1,linkedEvent:1});
prioritySchema.index({user:1,linkedMilestone:1});
prioritySchema.index({user:1,linkedJournal:1});

const Priority=mongoose.model("Priority",prioritySchema);

export default Priority;