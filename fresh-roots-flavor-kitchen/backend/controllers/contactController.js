import {sendContactEmail} from "../services/contactEmailService.js";

export const submitContact=async(req,res,next)=>{
 try{
  const firstName=String(req.body.firstName||"").trim();
  const lastName=String(req.body.lastName||"").trim();
  const email=String(req.body.email||"").trim().toLowerCase();
  const subject=String(req.body.subject||"").trim();
  const message=String(req.body.message||"").trim();

  if(!firstName||!lastName||!email||!subject||!message){
   return res.status(400).json({message:"First name, last name, email, subject, and message are required."});
  }

  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
   return res.status(400).json({message:"Enter a valid email address."});
  }

  const result=await sendContactEmail({name:`${firstName} ${lastName}`,email,subject,message});
  if(!result.sent)return res.status(503).json({message:result.reason||"Contact email is unavailable."});
  return res.status(200).json({message:"Your message was sent successfully."});
 }catch(error){
  return next(error);
 }
};
