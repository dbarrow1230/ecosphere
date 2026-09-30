import {sendContactEmail} from "../services/contactEmailService.js";

export const submitContact=async(req,res)=>{
 const limits={name:120,email:254,subject:200,message:5000};
 const payload={};
 for(const [field,max] of Object.entries(limits)){
  const value=req.body?.[field];
  if(typeof value!=="string"||!value.trim()||value.trim().length>max){
   return res.status(400).json({success:false,message:`${field} is required and must be at most ${max} characters.`});
  }
  payload[field]=value.trim();
 }
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)||/[\r\n]/.test(payload.subject)){
  return res.status(400).json({success:false,message:"Enter a valid email and a single-line subject."});
 }
 try{
  const result=await sendContactEmail(payload);
  if(!result.sent)return res.status(503).json({success:false,message:"Contact email is not configured. Please try again later."});
  return res.status(200).json({success:true,message:"Your message was sent successfully."});
 }catch{
  return res.status(502).json({success:false,message:"Unable to send your message. Please try again later."});
 }
};
