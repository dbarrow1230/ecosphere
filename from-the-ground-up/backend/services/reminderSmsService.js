// backend/services/reminderSmsService.js
import twilio from "twilio";

const accountSid=process.env.TWILIO_ACCOUNT_SID||"";
const authToken=process.env.TWILIO_AUTH_TOKEN||"";
const fromNumber=process.env.TWILIO_PHONE_NUMBER||"";

const client=accountSid&&authToken?twilio(accountSid,authToken):null;

export async function sendReminderSms({to,message}){
 if(!client||!to||!fromNumber) return;
 await client.messages.create({
  body:message,
  from:fromNumber,
  to
 });
}