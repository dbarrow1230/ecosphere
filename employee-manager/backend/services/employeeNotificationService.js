// backend/services/employeeNotificationService.js
import EmployeeAlert from "../models/employees/employeeAlertModel.js";
import User from "../models/users/userModel.js";
import {emitEmployeeAlert} from "../socket/employeeAlertSocket.js";
import {sendEmail} from "../utils/sendEmail.js";
import {sendSms} from "../utils/sendSms.js";

const compact=value=>[...new Set((value||[]).map(item=>String(item||"").trim()).filter(Boolean))];

async function getUserRecipients(userRefs=[]){
 if(!userRefs.length)return {users:[],emails:[],phones:[],userIds:[]};

 const users=await User.find({_id:{$in:userRefs}});

 return{
  users,
  emails:compact(users.map(user=>user.email)),
  phones:compact(users.map(user=>user.phone||user.phoneNumber||user.mobile)),
  userIds:compact(users.map(user=>user._id))
 };
}

export async function sendEmployeeNotification({io,setting,title,message,severity="info",eventRef=null,payrollRef=null}){
 const userRecipients=await getUserRecipients(setting.recipients?.userRefs);
 const emails=compact([...(setting.recipients?.emails||[]),...userRecipients.emails]);
 const phones=compact([...(setting.recipients?.phoneNumbers||[]),...userRecipients.phones]);
 const userIds=userRecipients.userIds;
 const delivery={
  inApp:false,
  email:false,
  sms:false,
  text:false
 };

 const alert=await EmployeeAlert.create({
  settingRef:setting._id,
  eventRef,
  payrollRef,
  title,
  message,
  severity,
  delivery
 });

 try{
  if(setting.channels?.inApp){
   emitEmployeeAlert(io,{userIds,alert});
   delivery.inApp=true;
  }

  if(setting.channels?.email&&emails.length){
   for(const to of emails){
    await sendEmail({to,subject:title,text:message});
   }
   delivery.email=true;
  }

  if((setting.channels?.sms||setting.channels?.text)&&phones.length){
   for(const to of phones){
    await sendSms({to,body:message});
   }
   delivery.sms=!!setting.channels?.sms;
   delivery.text=!!setting.channels?.text;
  }

  alert.delivery=delivery;
  alert.status="sent";
  alert.sentAt=new Date();
  await alert.save();
  return alert;
 }catch(error){
  alert.delivery=delivery;
  alert.status="failed";
  alert.error=error.message;
  await alert.save();
  throw error;
 }
}
