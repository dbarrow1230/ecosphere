// backend/jobs/employeePayrollCron.js
import cron from "node-cron";
import Payroll from "../models/employees/payrollModel.js";
import EmployeeEvent from "../models/employees/employeeEventModel.js";
import EmployeeNotificationSetting from "../models/employees/employeeNotificationSettingModel.js";
import {sendEmployeeNotification} from "../services/employeeNotificationService.js";

async function ensureDefaultNotificationSettings(){
 const defaults=[
  {
   settingKey:"draft-payroll-review",
   name:"Draft Payroll Review",
   description:"Alerts when payroll periods are still in Draft status.",
   eventType:"draftPayroll",
   cronExpression:"0 8 * * 1",
   channels:{inApp:true,email:false,sms:false,text:false},
   recipients:{userRefs:[],emails:[],phoneNumbers:[]},
   enabled:true
  },
  {
   settingKey:"employee-event-reminder",
   name:"Employee Event Reminder",
   description:"Alerts for employee events marked for reminder.",
   eventType:"employeeEventReminder",
   cronExpression:"* * * * *",
   channels:{inApp:true,email:false,sms:false,text:false},
   recipients:{userRefs:[],emails:[],phoneNumbers:[]},
   enabled:true
  }
 ];

 for(const setting of defaults){
  await EmployeeNotificationSetting.findOneAndUpdate(
   {settingKey:setting.settingKey},
   {$setOnInsert:setting},
   {upsert:true,returnDocument:"after"}
  );
 }
}

async function processDraftPayrollNotifications(io,setting){
 const draftPayrolls=await Payroll.find({status:"Draft"}).sort({fromDate:1});

 for(const payroll of draftPayrolls){
  await sendEmployeeNotification({
   io,
   setting,
   payrollRef:payroll._id,
   title:"Draft payroll needs review",
   message:`Payroll ${payroll.payrollName} is still in Draft status.`,
   severity:"warning"
  });
 }
}

async function processEmployeeEventNotifications(io,setting){
 const now=new Date();
 const events=await EmployeeEvent.find({
  reminder:true,
  lastReminderSentAt:null,
  $or:[
   {reminderDate:{$lte:now}},
   {reminderDate:null,createdOn:{$lte:now}}
  ]
 }).sort({createdOn:1});

 for(const event of events){
  await sendEmployeeNotification({
   io,
   setting,
   eventRef:event._id,
   title:event.eventName,
   message:`${event.eventType} reminder: ${event.notes||event.eventName}`,
   severity:"info"
  });

  event.lastReminderSentAt=new Date();
  await event.save();
 }
}

async function runEmployeeNotificationSetting(io,setting){
 try{
  if(setting.eventType==="draftPayroll"){
   await processDraftPayrollNotifications(io,setting);
  }

  if(setting.eventType==="employeeEventReminder"){
   await processEmployeeEventNotifications(io,setting);
  }
 }catch(error){
  console.error(`Employee notification cron failed for ${setting.settingKey}`,error);
 }
}

export async function startEmployeePayrollCron(io){
 await ensureDefaultNotificationSettings();

 const settings=await EmployeeNotificationSetting.find({enabled:true});

 for(const setting of settings){
  const expression=setting.cronExpression||"* * * * *";

  if(!cron.validate(expression)){
   console.error(`Invalid employee notification cron expression for ${setting.settingKey}: ${expression}`);
   continue;
  }

  cron.schedule(expression,async()=>{
   const freshSetting=await EmployeeNotificationSetting.findById(setting._id);

   if(!freshSetting?.enabled)return;

   await runEmployeeNotificationSetting(io,freshSetting);
  });
 }
}