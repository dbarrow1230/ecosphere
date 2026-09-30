import mongoose from "mongoose";
import Reminder from "../../models/tasks/taskReminderModel.js";

export const createReminder=async(req,res)=>{
try{
const {task,remindAt,message,deliveryType,email,phone,isSent,sentAt,isActive}=req.body;

if(!task||!remindAt){
return res.status(400).json({message:"task and remindAt are required"});
}

const reminder=new Reminder({
task,
remindAt,
message,
deliveryType,
email,
phone,
isSent:isSent!==undefined?isSent:false,
sentAt:sentAt||null,
isActive:isActive!==undefined?isActive:true
});

const saved=await reminder.save();
const populated=await Reminder.findById(saved._id)
.populate("task");

return res.status(201).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getReminders=async(req,res)=>{
try{
const query={};

if(req.query.task)query.task=req.query.task;
if(req.query.deliveryType)query.deliveryType=req.query.deliveryType;
if(req.query.email)query.email={$regex:req.query.email,$options:"i"};
if(req.query.phone)query.phone={$regex:req.query.phone,$options:"i"};
if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";
if(req.query.isSent!==undefined)query.isSent=req.query.isSent==="true";

const reminders=await Reminder.find(query)
.populate("task")
.sort({remindAt:1});

return res.status(200).json(reminders);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getDueReminders=async(req,res)=>{
try{
const now=new Date();

const query={
isActive:true,
isSent:false,
remindAt:{$lte:now}
};

if(req.query.deliveryType){
query.deliveryType=req.query.deliveryType;
}

const reminders=await Reminder.find(query)
.populate("task")
.sort({remindAt:1});

return res.status(200).json(reminders);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getReminderById=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid reminder id"});
}

const reminder=await Reminder.findById(id)
.populate("task");

if(!reminder){
return res.status(404).json({message:"Reminder not found"});
}

return res.status(200).json(reminder);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const updateReminder=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid reminder id"});
}

const reminder=await Reminder.findById(id);
if(!reminder){
return res.status(404).json({message:"Reminder not found"});
}

const {task,remindAt,message,deliveryType,email,phone,isSent,sentAt,isActive}=req.body;

if(task!==undefined)reminder.task=task;
if(remindAt!==undefined)reminder.remindAt=remindAt;
if(message!==undefined)reminder.message=message;
if(deliveryType!==undefined)reminder.deliveryType=deliveryType;
if(email!==undefined)reminder.email=email;
if(phone!==undefined)reminder.phone=phone;
if(isSent!==undefined)reminder.isSent=isSent;
if(sentAt!==undefined)reminder.sentAt=sentAt;
if(isActive!==undefined)reminder.isActive=isActive;

const updated=await reminder.save();
const populated=await Reminder.findById(updated._id)
.populate("task");

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const deleteReminder=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid reminder id"});
}

const reminder=await Reminder.findByIdAndDelete(id);
if(!reminder){
return res.status(404).json({message:"Reminder not found"});
}

return res.status(200).json({message:"Reminder deleted successfully"});
}catch(error){
return res.status(500).json({message:error.message});
}
};