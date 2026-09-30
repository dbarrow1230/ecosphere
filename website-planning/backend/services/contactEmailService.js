import nodemailer from "nodemailer";

const smtpHost=String(globalThis.process.env.SMTP_HOST||"").trim();
const smtpPort=Number(globalThis.process.env.SMTP_PORT||0);
const smtpSecure=String(globalThis.process.env.SMTP_SECURE||"false").toLowerCase()==="true";
const smtpUser=String(globalThis.process.env.SMTP_USER||"").trim();
const smtpPass=String(globalThis.process.env.SMTP_PASS||"").trim();
const smtpFrom=String(globalThis.process.env.SMTP_FROM||"").trim();
const contactRecipient=String(globalThis.process.env.CONTACT_EMAIL||smtpUser).trim();

const configured=Boolean(smtpHost&&smtpPort&&smtpUser&&smtpPass&&smtpFrom&&contactRecipient);
const transporter=configured?nodemailer.createTransport({
 host:smtpHost,
 port:smtpPort,
 secure:smtpSecure,
 auth:{user:smtpUser,pass:smtpPass}
}):null;

export async function sendContactEmail({name,email,subject,message}){
 if(!configured)return {sent:false,reason:"Contact email is not configured"};

 await transporter.sendMail({
  from:smtpFrom,
  to:contactRecipient,
  replyTo:email,
  subject:`Contact: ${subject}`,
  text:[`Name: ${name}`,`Email: ${email}`,"",message].join("\n")
 });

 return {sent:true};
}
