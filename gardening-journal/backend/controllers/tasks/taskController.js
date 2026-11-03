// backend/controllers/tasks/taskController.js
import mongoose from "mongoose";
import Task from "../../models/tasks/taskModel.js";
import Reminder from "../../models/tasks/taskReminderModel.js";

export const createTask=async(req,res)=>{
try{
const {name,description,dueDate,status,priority,isActive,remindAt,message,createReminder}=req.body;

const task=new Task({
name,
description,
dueDate,
status,
priority,
isActive:isActive!==undefined?isActive:true
});

const saved=await task.save();

let reminder=null;

if((createReminder||remindAt)&&remindAt){
reminder=await Reminder.create({
task:saved._id,
remindAt,
message:message||"",
isSent:false,
isActive:true
});
}

return res.status(201).json({task:saved,reminder});
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getTasks=async(req,res)=>{
try{
const query={};

if(req.query.status)query.status=req.query.status;
if(req.query.priority)query.priority=req.query.priority;
if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";

if(req.query.search){
query.$or=[
{name:{$regex:req.query.search,$options:"i"}},
{description:{$regex:req.query.search,$options:"i"}}
];
}

const tasks=await Task.find(query)
.sort({dueDate:1,createdAt:-1});

return res.status(200).json(tasks);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getTaskById=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid task id"});
}

const task=await Task.findById(id);

if(!task){
return res.status(404).json({message:"Task not found"});
}

const reminders=await Reminder.find({task:id,isActive:true}).sort({remindAt:1,createdAt:-1});

return res.status(200).json({task,reminders});
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const updateTask=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid task id"});
}

const task=await Task.findById(id);
if(!task){
return res.status(404).json({message:"Task not found"});
}

const {name,description,dueDate,status,priority,isActive,remindAt,message,reminderId,createReminder}=req.body;

if(name!==undefined)task.name=name;
if(description!==undefined)task.description=description;
if(dueDate!==undefined)task.dueDate=dueDate;
if(status!==undefined)task.status=status;
if(priority!==undefined)task.priority=priority;
if(isActive!==undefined)task.isActive=isActive;

const updated=await task.save();

let reminder=null;

if(reminderId&&mongoose.Types.ObjectId.isValid(reminderId)){
const existingReminder=await Reminder.findOne({_id:reminderId,task:id});
if(existingReminder){
if(remindAt!==undefined)existingReminder.remindAt=remindAt;
if(message!==undefined)existingReminder.message=message;
reminder=await existingReminder.save();
}
}else if((createReminder||remindAt)&&remindAt){
reminder=await Reminder.create({
task:updated._id,
remindAt,
message:message||"",
isSent:false,
isActive:true
});
}

return res.status(200).json({task:updated,reminder});
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const deleteTask=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid task id"});
}

const task=await Task.findByIdAndDelete(id);
if(!task){
return res.status(404).json({message:"Task not found"});
}

await Reminder.deleteMany({task:id});

return res.status(200).json({message:"Task deleted successfully"});
}catch(error){
return res.status(500).json({message:error.message});
}
};