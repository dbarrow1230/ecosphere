// /backend/controllers/reminderController.js
import Reminder from '../models/reminderModel.js';

export const createReminder=async(req,res)=>{
try{
const{user,title,message,audienceType,selectedUsers,channels,sendAt,nextRunAt,lastSentAt,sentAt,status,isRecurring,recurrenceRule,recurrenceEndAt,reminderOffsetMinutes,modalDismissedBy}=req.body;
if(!user||!title||!message||!sendAt)return res.status(400).json({success:false,message:'User, title, message, and sendAt are required'});
const reminder=await Reminder.create({user,title,message,audienceType,selectedUsers,channels,sendAt,nextRunAt,lastSentAt,sentAt,status,isRecurring,recurrenceRule,recurrenceEndAt,reminderOffsetMinutes,modalDismissedBy});
res.status(201).json({success:true,message:'Reminder created successfully',reminder});
}catch(error){
res.status(500).json({success:false,message:'Error creating reminder',error:error.message});
}
};

export const getReminders=async(req,res)=>{
try{
const query={};
if(req.query.user)query.user=req.query.user;
if(req.query.status)query.status=req.query.status;
if(req.query.isRecurring!==undefined)query.isRecurring=req.query.isRecurring==='true';
if(req.query.audienceType)query.audienceType=req.query.audienceType;
const reminders=await Reminder.find(query)
.populate('user')
.populate('selectedUsers')
.populate('modalDismissedBy')
.sort({createdAt:-1});
res.status(200).json({success:true,count:reminders.length,reminders});
}catch(error){
res.status(500).json({success:false,message:'Error fetching reminders',error:error.message});
}
};

export const getPendingReminders=async(req,res)=>{
try{
const query={status:'pending'};
if(req.query.user)query.user=req.query.user;
const reminders=await Reminder.find(query)
.populate('user')
.populate('selectedUsers')
.populate('modalDismissedBy')
.sort({sendAt:1});
res.status(200).json({success:true,count:reminders.length,reminders});
}catch(error){
res.status(500).json({success:false,message:'Error fetching pending reminders',error:error.message});
}
};

export const getReminderById=async(req,res)=>{
try{
const reminder=await Reminder.findById(req.params.id)
.populate('user')
.populate('selectedUsers')
.populate('modalDismissedBy');
if(!reminder)return res.status(404).json({success:false,message:'Reminder not found'});
res.status(200).json({success:true,reminder});
}catch(error){
res.status(500).json({success:false,message:'Error fetching reminder',error:error.message});
}
};

export const getRemindersByUser=async(req,res)=>{
try{
const reminders=await Reminder.find({user:req.params.userId})
.populate('user')
.populate('selectedUsers')
.populate('modalDismissedBy')
.sort({createdAt:-1});
res.status(200).json({success:true,count:reminders.length,reminders});
}catch(error){
res.status(500).json({success:false,message:'Error fetching user reminders',error:error.message});
}
};

export const updateReminder=async(req,res)=>{
try{
const{user,title,message,audienceType,selectedUsers,channels,sendAt,nextRunAt,lastSentAt,sentAt,status,isRecurring,recurrenceRule,recurrenceEndAt,reminderOffsetMinutes,modalDismissedBy}=req.body;
const reminder=await Reminder.findById(req.params.id);
if(!reminder)return res.status(404).json({success:false,message:'Reminder not found'});
reminder.user=user??reminder.user;
reminder.title=title??reminder.title;
reminder.message=message??reminder.message;
reminder.audienceType=audienceType??reminder.audienceType;
reminder.selectedUsers=selectedUsers??reminder.selectedUsers;
reminder.channels=channels??reminder.channels;
reminder.sendAt=sendAt??reminder.sendAt;
reminder.nextRunAt=nextRunAt!==undefined?nextRunAt:reminder.nextRunAt;
reminder.lastSentAt=lastSentAt!==undefined?lastSentAt:reminder.lastSentAt;
reminder.sentAt=sentAt!==undefined?sentAt:reminder.sentAt;
reminder.status=status??reminder.status;
reminder.isRecurring=isRecurring!==undefined?isRecurring:reminder.isRecurring;
reminder.recurrenceRule=recurrenceRule!==undefined?recurrenceRule:reminder.recurrenceRule;
reminder.recurrenceEndAt=recurrenceEndAt!==undefined?recurrenceEndAt:reminder.recurrenceEndAt;
reminder.reminderOffsetMinutes=reminderOffsetMinutes??reminder.reminderOffsetMinutes;
reminder.modalDismissedBy=modalDismissedBy??reminder.modalDismissedBy;
await reminder.save();
const updatedReminder=await Reminder.findById(reminder._id)
.populate('user')
.populate('selectedUsers')
.populate('modalDismissedBy');
res.status(200).json({success:true,message:'Reminder updated successfully',reminder:updatedReminder});
}catch(error){
res.status(500).json({success:false,message:'Error updating reminder',error:error.message});
}
};

export const deleteReminder=async(req,res)=>{
try{
const reminder=await Reminder.findById(req.params.id);
if(!reminder)return res.status(404).json({success:false,message:'Reminder not found'});
await Reminder.findByIdAndDelete(req.params.id);
res.status(200).json({success:true,message:'Reminder deleted successfully'});
}catch(error){
res.status(500).json({success:false,message:'Error deleting reminder',error:error.message});
}
};
