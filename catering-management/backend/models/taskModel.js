// backend/models/taskModel.js
import mongoose from "mongoose";

const taskSchema=new mongoose.Schema({
 title:{type:String,required:true,trim:true},
 description:{type:String,trim:true,default:""},
 event:{type:mongoose.Schema.Types.ObjectId,ref:"Event"},
 order:{type:mongoose.Schema.Types.ObjectId,ref:"Order"},
 assignedTo:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
 priority:{type:String,enum:["low","normal","high","urgent"],default:"normal"},
 status:{type:String,enum:["pending","in-progress","completed","cancelled"],default:"pending"},
 dueDate:{type:Date},
 completedAt:{type:Date},
 notes:{type:String,trim:true,default:""}
},{ timestamps:true, collection:"tasks"});

const Task=mongoose.models.Task||mongoose.model("Task",taskSchema);

export default Task;