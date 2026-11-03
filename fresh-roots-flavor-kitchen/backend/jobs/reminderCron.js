import cron from "node-cron";
import Reminder from "../models/reminders/reminderModel.js";
import User from "../models/users/userModel.js";
import {sendReminderEmail} from "../services/reminderEmailService.js";
import {isUserOnline} from "../socket/reminderSocket.js";
import {getNextRunAt,isPastRecurrenceEnd} from "../utils/reminderUtils.js";

const emitInAppReminder=(io,userId,reminder)=>new Promise(resolve=>{
 if(!isUserOnline(userId)){
  resolve({sent:false,reason:"user_offline"});
  return;
 }

 const payload={
  id:String(reminder._id),
  reminderId:reminder.reminderId,
  title:reminder.title,
  message:reminder.message,
  sendAt:reminder.nextRunAt||reminder.sendAt
 };

 io.to(String(userId)).timeout(5000).emit("reminder",payload,(error,responses=[])=>{
  const received=!error&&responses.some(response=>response?.received===true);
  resolve(received?{sent:true}:{sent:false,reason:error?"ack_timeout":"not_acknowledged"});
 });
});

async function deliverReminderToUser({io,reminder,user}){
 const userId=String(user?._id||"");
 const outcomes=[];

 if(reminder.channels?.inApp){
  outcomes.push({channel:"inApp",...await emitInAppReminder(io,userId,reminder)});
 }

 if(reminder.channels?.email){
  try{
   const result=await sendReminderEmail({to:user?.email,subject:reminder.title,message:reminder.message});
   outcomes.push({channel:"email",sent:result?.sent===true,reason:result?.reason||""});
  }catch(error){
   outcomes.push({channel:"email",sent:false,reason:error.message||"email_failed"});
  }
 }

 if(!outcomes.some(outcome=>outcome.sent)){
  const reason=outcomes.length
   ?outcomes.map(outcome=>`${outcome.channel}: ${outcome.reason||"not delivered"}`).join("; ")
   :"no notification method selected";
  throw new Error(`Reminder was not delivered (${reason})`);
 }

 return outcomes;
}

export function startReminderCron(io){
 const task=cron.schedule("* * * * *",async()=>{
  try{
   const now=new Date();
   const staleProcessingBefore=new Date(now.getTime()-5*60*1000);
   const dueReminders=await Reminder.find({
    $and:[
     {$or:[
      {status:{$in:["pending","failed"]}},
      {status:"processing",updatedAt:{$lte:staleProcessingBefore}}
     ]},
     {$or:[
      {nextRunAt:{$lte:now}},
      {nextRunAt:null,sendAt:{$lte:now}}
     ]}
    ]
   })
    .populate({path:"user",populate:{path:"details"}})
    .populate({path:"selectedUsers",populate:{path:"details"}});

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

     if(!recipients.length)throw new Error("Reminder has no recipient");

     const deliveryResults=[];
     for(const recipient of recipients){
      try{
       deliveryResults.push(...await deliverReminderToUser({io,reminder,user:recipient}));
      }catch(error){
       deliveryResults.push({channel:"recipient",sent:false,reason:error.message});
      }
     }

     if(!deliveryResults.some(result=>result.sent)){
      throw new Error(deliveryResults.map(result=>result.reason).filter(Boolean).join("; ")||"Reminder delivery failed");
     }

     const runTime=new Date();
     reminder.lastSentAt=runTime;

     if(reminder.isRecurring){
      const nextRunAt=getNextRunAt(reminder);
      if(isPastRecurrenceEnd(reminder,nextRunAt)){
       reminder.sentAt=runTime;
       reminder.nextRunAt=null;
       reminder.status="sent";
      }else{
       reminder.nextRunAt=nextRunAt;
       reminder.status="pending";
      }
     }else{
      reminder.sentAt=runTime;
      reminder.nextRunAt=null;
      reminder.status="sent";
     }

     await reminder.save();
    }catch(error){
     console.error(`Reminder ${reminder.reminderId||reminder._id} failed`,error);
     reminder.status="failed";
     await reminder.save();
    }
   }
  }catch(error){
   console.error("Reminder scheduler failed",error);
  }
 });

 return task;
}
