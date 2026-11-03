// backend/services/reminderSmsService.js
const accountSid=process.env.TWILIO_ACCOUNT_SID||"";
const authToken=process.env.TWILIO_AUTH_TOKEN||"";
const fromNumber=process.env.TWILIO_PHONE_NUMBER||"";

let clientPromise;

const getClient=()=>{
 if(!accountSid||!authToken)return null;

 clientPromise??=import("twilio").then(({default:twilio})=>twilio(accountSid,authToken));
 return clientPromise;
};

export async function sendReminderSms({to,message}){
 if(!to||!fromNumber)return;

 const client=await getClient();
 if(!client)return;

 await client.messages.create({
  body:message,
  from:fromNumber,
  to
 });
}
