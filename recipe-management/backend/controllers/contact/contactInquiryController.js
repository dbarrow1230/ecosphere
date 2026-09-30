import ContactInquiry from "../../models/contact/contactInquiryModel.js";

export const createContactInquiry=async(req,res)=>{
 try{
  const {name,email,subject,message}=req.body;
  if(!name?.trim()||!email?.trim()||!subject?.trim()||!message?.trim())return res.status(400).json({message:"Name, email, subject, and message are required"});
  const contact=await ContactInquiry.create({name,email,subject,message});
  return res.status(201).json({message:"Your message has been received",contact});
 }catch(error){return res.status(500).json({message:"Failed to send message",error:error.message});}
};

export const getContactInquiries=async(req,res)=>{
 try{return res.json(await ContactInquiry.find().sort({createdAt:-1}));}
 catch(error){return res.status(500).json({message:"Failed to load contacts",error:error.message});}
};
