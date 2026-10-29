// backend/models/reference/taskStatusModel.js
import mongoose from "mongoose";

const taskStatusSchema=new mongoose.Schema({
 name:{type:String,trim:true,default:""},
 description:{type:String,trim:true,default:""},
 order:{type:Number,default:0},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"task_statuses"});

const TaskStatus=mongoose.models.TaskStatus||mongoose.model("TaskStatus",taskStatusSchema);

export default TaskStatus;