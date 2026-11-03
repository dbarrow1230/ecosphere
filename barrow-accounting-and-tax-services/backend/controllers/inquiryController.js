import Inquiry from "../models/Inquiry.js";

export const createInquiry=async(req,res,next)=>{
 try{
  const {name,email,message}=req.body||{};
  if(typeof name!=="string"||typeof email!=="string"||typeof message!=="string"||!name.trim()||name.length>120||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||!message.trim()||message.length>2000)return res.status(400).json({error:"Valid name, email and message are required"});
  await Inquiry.create({name:name.trim(),email:email.trim().toLowerCase(),message:message.trim()});
  res.status(201).json({received:true});
 }catch(err){next(err);}
};

export const getInquiries=async(req,res,next)=>{
 try{
  const items=await Inquiry.find().sort({createdAt:-1}).limit(100).lean();
  res.json({items});
 }catch(err){next(err);}
};
