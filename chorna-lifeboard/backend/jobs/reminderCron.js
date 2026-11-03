// backend/jobs/reminderCron.js
import cron from "node-cron";
import Reminder from "../models/reminders/reminderModel.js";
import User from "../models/users/userModel.js";
import {sendReminderEmail} from "../services/reminderEmailService.js";
import {isUserOnline} from "../socket/reminderSocket.js";
import {getNextRunAt,isPastRecurrenceEnd} from "../utils/reminderUtils.js";

async function deliverReminderToUser({io,reminder,user}){
 const userId=String(user?._id||"");
 const online=isUserOnline(userId);

 if(online&&reminder.channels?.inApp){
  io.to(userId).emit("mentorReminder",{
   reminderId:String(reminder._id),
   title:reminder.title,
   message:reminder.message,
   sendAt:reminder.nextRunAt||reminder.sendAt
  });
  return {delivered:true,channel:"inApp"};
 }

 if(reminder.channels?.email&&user?.email){
  await sendReminderEmail({
   to:user.email,
   subject:reminder.title,
   message:reminder.message
  });
 }

 return {delivered:true,channel:"fallback"};
}

export function startReminderCron(io){
 cron.schedule("* * * * *",async()=>{
  const now=new Date();

  const dueReminders=await Reminder.find({
   status:{$in:["pending","failed"]},
   $or:[
    {nextRunAt:{$lte:now}},
    {nextRunAt:null,sendAt:{$lte:now}}
   ]
  }).populate("user").populate("selectedUsers");

  for(const reminder of dueReminders){
   try{
    reminder.status="processing";
    await reminder.save();

    let recipients=[];

    if(reminder.audienceType==="all"){
     recipients=await User.find({});
    }else if(Array.isArray(reminder.selectedUsers)&&reminder.selectedUsers.length){
     recipients=reminder.selectedUsers;
    }else if(reminder.user){
     recipients=[reminder.user];
    }

    for(const recipient of recipients){
     await deliverReminderToUser({io,reminder,user:recipient});
    }

    const runTime=new Date();

    if(reminder.isRecurring){
     const nextRunAt=getNextRunAt(reminder);

     reminder.lastSentAt=runTime;

     if(isPastRecurrenceEnd(reminder,nextRunAt)){
      reminder.sentAt=runTime;
      reminder.nextRunAt=null;
      reminder.status="sent";
     }else{
      reminder.nextRunAt=nextRunAt;
      reminder.status="pending";
     }
    }else{
      reminder.lastSentAt=runTime;
      reminder.sentAt=runTime;
      reminder.nextRunAt=null;
      reminder.status="sent";
    }

    await reminder.save();
   }catch(err){
    console.error("Reminder cron failed",err);
    reminder.status="failed";
    await reminder.save();
   }
  }
 });
}
