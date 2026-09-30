// backend/models/reference/taskPriorityModel.js
import mongoose from "mongoose";

const taskPrioritySchema=new mongoose.Schema({
 name:{type:String,trim:true,default:""},
 description:{type:String,trim:true,default:""},
 level:{type:Number,default:0},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"task_priorities"});

const TaskPriority=mongoose.models.TaskPriority||mongoose.model("TaskPriority",taskPrioritySchema);

export default TaskPriority;