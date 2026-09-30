// backend/services/reminderEmailService.js
import nodemailer from "nodemailer";

const smtpHost=(process.env.SMTP_HOST||"").trim();
const smtpPort=Number(process.env.SMTP_PORT||0);
const smtpSecure=String(process.env.SMTP_SECURE||"false").toLowerCase()==="true";
const smtpUser=(process.env.SMTP_USER||"").trim();
const smtpPass=(process.env.SMTP_PASS||"").trim();
const smtpFrom=(process.env.SMTP_FROM||"").trim();

const isEmailConfigured=Boolean(
 smtpHost&&smtpPort&&smtpFrom&&smtpUser&&smtpPass
);

let transporter=null;

if(isEmailConfigured){
 transporter=nodemailer.createTransport({
  host:smtpHost,
  port:smtpPort,
  secure:smtpSecure,
  auth:{
   user:smtpUser,
   pass:smtpPass
  }
 });
}

export async function sendReminderEmail({to,subject,message}){
 if(!isEmailConfigured){
  console.warn("Reminder email skipped: SMTP is not configured.");
  return {skipped:true,reason:"smtp_not_configured"};
 }

 if(!to){
  console.warn("Reminder email skipped: recipient is missing.");
  return {skipped:true,reason:"missing_recipient"};
 }

 await transporter.sendMail({
  from:smtpFrom,
  to,
  subject,
  text:message
 });

 return {sent:true};
}