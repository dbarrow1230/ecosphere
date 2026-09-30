// backend/models/task/taskModel.js
import mongoose from 'mongoose';

const taskSchema=new mongoose.Schema({
	name:{type:String,trim:true,default:''},
	description:{type:String,trim:true,default:''},
	dueDate:{type:Date,default:null},
	status:{type:String,trim:true,default:'pending'},
	priority:{type:String,trim:true,default:'normal'},
	isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"tasks"});

const Task=mongoose.models.Task||mongoose.model('Task',taskSchema);

export default Task;