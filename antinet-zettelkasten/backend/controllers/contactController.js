import {sendContactEmail} from "../services/contactEmailService.js";

const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const submitContact=async(req,res)=>{
 try{
  const name=String(req.body?.name||"").trim();
  const email=String(req.body?.email||"").trim();
  const subject=String(req.body?.subject||"").trim();
  const message=String(req.body?.message||"").trim();

  if(!name||name.length>120)return res.status(400).json({success:false,message:"Enter your name"});
  if(!emailPattern.test(email)||email.length>254)return res.status(400).json({success:false,message:"Enter a valid email address"});
  if(!subject||subject.length>200)return res.status(400).json({success:false,message:"Enter a subject"});
  if(!message||message.length>5000)return res.status(400).json({success:false,message:"Enter a message of 5000 characters or fewer"});

  const result=await sendContactEmail({name,email,subject,message});
  if(!result.sent)return res.status(503).json({success:false,message:result.reason});
  return res.json({success:true,message:"Your message was sent successfully."});
 }catch(error){
  return res.status(500).json({success:false,message:error.message||"Unable to send your message"});
 }
};
