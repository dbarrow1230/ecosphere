// /backend/business/reminderBusiness.js
import reminderEmailService from "../services/reminderEmailService.js";
import {Reminder} from '../models/index.js';

const addMinutes=(date,minutes)=>{
 const next=new Date(date);
 next.setMinutes(next.getMinutes()+Number(minutes||0));
 return next;
};

const addRecurringDate=(date,rule)=>{
 const next=new Date(date);
 if(rule==='weekly') next.setDate(next.getDate()+7);
 if(rule==='bi-weekly') next.setDate(next.getDate()+14);
 return next;
};

export const createReminderLogic=async(data={})=>{
 if(!data.user) throw new Error('User is required');
 if(!data.title) throw new Error('Title is required');
 if(!data.message) throw new Error('Message is required');
 if(!data.sendAt) throw new Error('sendAt is required');
 if(data.audienceType==='selected'&&(!Array.isArray(data.selectedUsers)||!data.selectedUsers.length)) throw new Error('selectedUsers is required for selected audience');
 const reminderData={...data};
 if(reminderData.isRecurring){
  reminderData.nextRunAt=new Date(reminderData.sendAt);
 }else{
  reminderData.nextRunAt=null;
 }
 reminderData.status=reminderData.status||'pending';
 return await Reminder.create(reminderData);
};

export const updateReminderLogic=async(reminderId,data={})=>{
 const reminder=await Reminder.findById(reminderId);
 if(!reminder) throw new Error('Reminder not found');
 if(data.audienceType==='selected'&&Array.isArray(data.selectedUsers)&&!data.selectedUsers.length) throw new Error('selectedUsers is required for selected audience');
 Object.assign(reminder,data);
 if(typeof data.sendAt!=='undefined'&&!reminder.isRecurring){
  reminder.nextRunAt=null;
 }
 if(reminder.isRecurring&&data.sendAt){
  reminder.nextRunAt=new Date(data.sendAt);
 }
 await reminder.save();
 return reminder;
};

export const getReminderLogic=async(reminderId)=>{
 return await Reminder.findById(reminderId).populate('user mentee selectedUsers modalDismissedBy');
};

export const listDueRemindersLogic=async(now=new Date())=>{
 return await Reminder.find({
  status:{$in:['pending','processing']},
  $or:[
   {isRecurring:false,sendAt:{$lte:now},sentAt:null},
   {isRecurring:true,nextRunAt:{$lte:now}}
  ]
 }).populate('user mentee selectedUsers');
};

export const markReminderProcessingLogic=async(reminderId)=>{
 const reminder=await Reminder.findById(reminderId);
 if(!reminder) throw new Error('Reminder not found');
 reminder.status='processing';
 await reminder.save();
 return reminder;
};

export const markReminderSentLogic=async(reminderId,sentDate=new Date())=>{
 const reminder=await Reminder.findById(reminderId);
 if(!reminder) throw new Error('Reminder not found');
 reminder.lastSentAt=sentDate;
 reminder.sentAt=sentDate;
 if(reminder.isRecurring&&reminder.recurrenceRule){
  const nextRunAt=addRecurringDate(reminder.nextRunAt||reminder.sendAt,reminder.recurrenceRule);
  if(reminder.recurrenceEndAt&&nextRunAt>new Date(reminder.recurrenceEndAt)){
   reminder.nextRunAt=null;
   reminder.status='sent';
  }else{
   reminder.nextRunAt=nextRunAt;
   reminder.status='pending';
  }
 }else{
  reminder.status='sent';
 }
 await reminder.save();
 return reminder;
};

export const markReminderFailedLogic=async(reminderId)=>{
 const reminder=await Reminder.findById(reminderId);
 if(!reminder) throw new Error('Reminder not found');
 reminder.status='failed';
 await reminder.save();
 return reminder;
};

export const pauseReminderLogic=async(reminderId)=>{
 const reminder=await Reminder.findById(reminderId);
 if(!reminder) throw new Error('Reminder not found');
 reminder.status='paused';
 await reminder.save();
 return reminder;
};

export const resumeReminderLogic=async(reminderId)=>{
 const reminder=await Reminder.findById(reminderId);
 if(!reminder) throw new Error('Reminder not found');
 reminder.status='pending';
 if(reminder.isRecurring&&!reminder.nextRunAt){
  reminder.nextRunAt=new Date();
 }
 await reminder.save();
 return reminder;
};

export const dismissReminderModalLogic=async({reminderId,userId}={})=>{
 if(!reminderId||!userId) throw new Error('reminderId and userId are required');
 const reminder=await Reminder.findById(reminderId);
 if(!reminder) throw new Error('Reminder not found');
 const exists=reminder.modalDismissedBy.some((id)=>String(id)===String(userId));
 if(!exists){
  reminder.modalDismissedBy.push(userId);
  await reminder.save();
 }
 return reminder;
};

export const getReminderSendWindowLogic=(reminder={})=>{
 const sendAt=new Date(reminder.nextRunAt||reminder.sendAt);
 const reminderOffsetMinutes=Number(reminder.reminderOffsetMinutes)||0;
 const notifyAt=addMinutes(sendAt,-reminderOffsetMinutes);
 return{
  notifyAt,
  sendAt
 };
};

export default{
 createReminderLogic,
 updateReminderLogic,
 getReminderLogic,
 listDueRemindersLogic,
 markReminderProcessingLogic,
 markReminderSentLogic,
 markReminderFailedLogic,
 pauseReminderLogic,
 resumeReminderLogic,
 dismissReminderModalLogic,
 getReminderSendWindowLogic
};
