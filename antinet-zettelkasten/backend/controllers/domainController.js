import mongoose from "mongoose";
import Domain from "../models/domainModel.js";
import {toCode} from "../utils/recordId.js";

const userId=req=>req.user?._id||req.body?.userId||req.query?.userId;
export const getDomains=async(req,res)=>{
 try{res.json({success:true,data:await Domain.find({userId:userId(req)}).sort({name:1})});}
 catch(error){res.status(500).json({success:false,message:error.message});}
};
export const createDomain=async(req,res)=>{
 try{
  const owner=userId(req); const name=String(req.body.name||"").trim(); const code=toCode(req.body.code||name);
  if(!mongoose.isValidObjectId(owner)||!name||!code)return res.status(400).json({success:false,message:"Domain name and code are required"});
  res.status(201).json({success:true,data:await Domain.create({userId:owner,name,code,description:req.body.description,status:req.body.status||"active"})});
 }catch(error){res.status(error.code===11000?409:400).json({success:false,message:error.code===11000?"That domain code already exists":error.message});}
};
export const updateDomain=async(req,res)=>{
 try{
  const update={name:String(req.body.name||"").trim(),code:toCode(req.body.code||req.body.name),description:String(req.body.description||""),status:req.body.status||"active"};
  const domain=await Domain.findOneAndUpdate({_id:req.params.id,userId:userId(req)},update,{returnDocument:"after",runValidators:true});
  if(!domain)return res.status(404).json({success:false,message:"Domain not found"});
  res.json({success:true,data:domain});
 }catch(error){res.status(400).json({success:false,message:error.message});}
};
export const deleteDomain=async(req,res)=>{
 try{const domain=await Domain.findOneAndDelete({_id:req.params.id,userId:userId(req)});if(!domain)return res.status(404).json({success:false,message:"Domain not found"});res.json({success:true});}
 catch(error){res.status(400).json({success:false,message:error.message});}
};
