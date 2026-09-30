// backend/controllers/reminderController.js
import mongoose from "mongoose";
import Reminder from "../../models/reminders/reminderModel.js";

const normalizeDate=value=>{
 if(!value)return null;
 const date=new Date(value);
 return Number.isNaN(date.getTime())?null:date;
};

const normalizeChannels=channels=>({
 inApp:channels?.inApp ?? true,
 email:channels?.email ?? false,
 sms:channels?.sms ?? false
});

export async function createReminder(req,res){
 try{
  const userId=req.user?._id||req.body.user;
  const {
   title,
   message,
   audienceType="selected",
   selectedUsers=[],
   channels={},
   sendAt,
   nextRunAt,
   status="pending",
   isRecurring=false,
   recurrenceRule="",
   recurrenceEndAt=null,
   reminderOffsetMinutes=30
  }=req.body;

  if(!userId){
   return res.status(400).json({message:"User is required."});
  }

  if(!mongoose.Types.ObjectId.isValid(userId)){
   return res.status(400).json({message:"Invalid user id."});
  }

  if(!title?.trim()||!message?.trim()){
   return res.status(400).json({message:"Title and message are required."});
  }

  const parsedSendAt=normalizeDate(sendAt)||normalizeDate(nextRunAt);
  if(!parsedSendAt){
   return res.status(400).json({message:"Send at is required."});
  }

  const reminder=await Reminder.create({
   user:userId,
   title:title.trim(),
   message:message.trim(),
   audienceType,
   selectedUsers:Array.isArray(selectedUsers)&&selectedUsers.length?selectedUsers:[userId],
   channels:normalizeChannels(channels),
   sendAt:parsedSendAt,
   nextRunAt:normalizeDate(nextRunAt)||parsedSendAt,
   status,
   isRecurring:!!isRecurring,
   recurrenceRule:isRecurring?recurrenceRule:"",
   recurrenceEndAt:normalizeDate(recurrenceEndAt),
   reminderOffsetMinutes:Number(reminderOffsetMinutes)||30
  });

  return res.status(201).json({message:"Reminder created successfully.",reminder});
 }catch(err){
  console.error("createReminder error",err);
  return res.status(500).json({message:"Failed to create reminder."});
 }
}

const weekdayMap={
 sunday:0,
 monday:1,
 tuesday:2,
 wednesday:3,
 thursday:4,
 friday:5,
 saturday:6
};

function parseTime(value){
 const raw=String(value||"").trim().toLowerCase();
 const match12=raw.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
 if(match12){
  let hours=Number(match12[1])||0;
  const minutes=Number(match12[2]||0);
  const meridiem=match12[3];
  if(meridiem==="pm"&&hours<12)hours+=12;
  if(meridiem==="am"&&hours===12)hours=0;
  return{hours,minutes};
 }
 const match24=raw.match(/^(\d{1,2})(?::(\d{2}))$/);
 if(match24){
  return{
   hours:Number(match24[1])||0,
   minutes:Number(match24[2])||0
  };
 }
 return{hours:9,minutes:0};
}

function getFirstMeetingDate(startDate,preferredDay,preferredTime){
 const base=new Date(startDate);
 base.setHours(0,0,0,0);

 const targetDay=weekdayMap[String(preferredDay||"").toLowerCase()];
 if(targetDay===undefined)return null;

 const {hours,minutes}=parseTime(preferredTime);
 const diff=(targetDay-base.getDay()+7)%7;

 const meetingDate=new Date(base);
 meetingDate.setDate(meetingDate.getDate()+diff);
 meetingDate.setHours(hours,minutes,0,0);

 return meetingDate;
}

export async function createReminderFromMentee(req,res){
 try{
  const userId=req.user?._id||req.body.user;
  const {menteeId,title,message,offsetMinutes=30,channels={inApp:true,email:true,sms:true},status="pending",isRecurring=true,recurrenceRule="",recurrenceEndAt=null,sendAt="",nextRunAt="",lastSentAt="",sentAt="",audienceType="selected",selectedUsers=[],modalDismissedBy=[]}=req.body;

  if(!userId||!menteeId){
   return res.status(400).json({message:"User and mentee are required."});
  }

  const Mentee=mongoose.models.Mentee;
  if(!Mentee){
   return res.status(501).json({message:"Mentee reminders are not available because the Mentee model is not registered."});
  }

  const mentee=await Mentee.findById(menteeId);
  if(!mentee){
   return res.status(404).json({message:"Mentee not found."});
  }

  const offset=Number(offsetMinutes)||30;
  const derivedRecurrenceRule=recurrenceRule||(
   String(mentee.meetingFrequency||"Weekly").toLowerCase()==="bi-weekly"
    ?"bi-weekly"
    :"weekly"
  );

  const fullName=`${mentee.firstName||""} ${mentee.lastName||""}`.trim();

  let computedMeetingDate=null;
  let computedSendAt=null;

  if(mentee.externshipStartDate&&mentee.preferredMeetingDay&&mentee.preferredMeetingTime){
   computedMeetingDate=getFirstMeetingDate(
    mentee.externshipStartDate,
    mentee.preferredMeetingDay,
    mentee.preferredMeetingTime
   );

   if(computedMeetingDate){
    computedSendAt=new Date(computedMeetingDate);
    computedSendAt.setMinutes(computedSendAt.getMinutes()-offset);
   }
  }

  const reminder=await Reminder.create({
   user:userId,
   mentee:mentee._id,
   title:title?.trim()||`Upcoming meeting with ${fullName}`,
   message:message?.trim()||`Reminder: meeting with ${fullName} starts in ${offset} minutes.`,
   audienceType,
   selectedUsers:Array.isArray(selectedUsers)&&selectedUsers.length?selectedUsers:[userId],
   channels:{
    inApp:!!channels.inApp,
    email:!!channels.email,
    sms:!!channels.sms
   },
   sendAt:sendAt?new Date(sendAt):(computedSendAt||new Date()),
   nextRunAt:nextRunAt?new Date(nextRunAt):(computedSendAt||new Date()),
   lastSentAt:lastSentAt?new Date(lastSentAt):null,
   sentAt:sentAt?new Date(sentAt):null,
   status,
   isRecurring:!!isRecurring,
   recurrenceRule:isRecurring?derivedRecurrenceRule:"",
   recurrenceEndAt:recurrenceEndAt?new Date(recurrenceEndAt):(mentee.externshipEndDate||null),
   reminderOffsetMinutes:offset,
   modalDismissedBy:Array.isArray(modalDismissedBy)?modalDismissedBy:[]
  });

  return res.status(201).json({message:"Reminder created successfully.",reminder});
 }catch(err){
  console.error("createReminderFromMentee error",err);
  return res.status(500).json({message:"Failed to create reminder."});
 }
}

export async function updateReminder(req,res){
 try{
  const {id}=req.params;
  const reminder=await Reminder.findById(id);
  if(!reminder){
   return res.status(404).json({message:"Reminder not found."});
  }

  const {
   title,
   message,
   audienceType="selected",
   selectedUsers=[],
   channels={},
   sendAt="",
   nextRunAt="",
   lastSentAt="",
   sentAt="",
   status="pending",
   isRecurring=true,
   recurrenceRule="",
   recurrenceEndAt=null,
   reminderOffsetMinutes=30,
   modalDismissedBy=[]
  }=req.body;

  reminder.title=title?.trim()||reminder.title;
  reminder.message=message?.trim()||reminder.message;
  reminder.audienceType=audienceType;
  reminder.selectedUsers=Array.isArray(selectedUsers)&&selectedUsers.length?selectedUsers:reminder.selectedUsers;
  reminder.channels=normalizeChannels({...reminder.channels?.toObject?.(),...channels});
  reminder.sendAt=sendAt?new Date(sendAt):reminder.sendAt;
  reminder.nextRunAt=nextRunAt?new Date(nextRunAt):null;
  reminder.lastSentAt=lastSentAt?new Date(lastSentAt):null;
  reminder.sentAt=sentAt?new Date(sentAt):null;
  reminder.status=status;
  reminder.isRecurring=!!isRecurring;
  reminder.recurrenceRule=isRecurring?recurrenceRule:"";
  reminder.recurrenceEndAt=recurrenceEndAt?new Date(recurrenceEndAt):null;
  reminder.reminderOffsetMinutes=Number(reminderOffsetMinutes)||30;
  reminder.modalDismissedBy=Array.isArray(modalDismissedBy)?modalDismissedBy:reminder.modalDismissedBy;

  await reminder.save();

  return res.json({message:"Reminder updated successfully.",reminder});
 }catch(err){
  console.error("updateReminder error",err);
  return res.status(500).json({message:"Failed to update reminder."});
 }
}

export async function listMyReminders(req,res){
 try{
  const userId=req.user?._id||req.query.user;
  if(!userId){
   return res.status(400).json({message:"User is required."});
  }

  const reminders=await Reminder.find({user:userId}).populate("user","username email name").sort({createdAt:-1});
  return res.json({reminders});
 }catch(err){
  console.error("listMyReminders error",err);
  return res.status(500).json({message:"Failed to load reminders."});
 }
}

export async function dismissReminderModal(req,res){
 try{
  const {id}=req.params;
  const userId=req.user?._id||req.body.user;

  const reminder=await Reminder.findById(id);
  if(!reminder){
   return res.status(404).json({message:"Reminder not found."});
  }

  const exists=reminder.modalDismissedBy.some(item=>String(item)===String(userId));
  if(!exists){
   reminder.modalDismissedBy.push(userId);
   await reminder.save();
  }

  return res.json({message:"Reminder dismissed.",reminder});
 }catch(err){
  console.error("dismissReminderModal error",err);
  return res.status(500).json({message:"Failed to dismiss reminder."});
 }
}

export async function deleteReminder(req,res){
 try{
  const reminder=await Reminder.findByIdAndDelete(req.params.id);
  if(!reminder){
   return res.status(404).json({message:"Reminder not found."});
  }
  return res.json({message:"Reminder deleted."});
 }catch(err){
  console.error("deleteReminder error",err);
  return res.status(500).json({message:"Failed to delete reminder."});
 }
}
