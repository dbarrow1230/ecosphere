import mongoose from "mongoose";
import Prefix from "../models/prefixModel.js";
import {toCode} from "../utils/recordId.js";

// Helper: return the authenticated or supplied user ID
const getUserId=req=>{
 const userId=req.user?._id||req.body?.userId||req.query?.userId||"";
 return mongoose.isValidObjectId(userId)?userId:"";
};

// Helper: normalize checkbox and Boolean values
const normalizeBoolean=value=>{
 return value===true||value==="true"||value===1||value==="1"||value==="on";
};

// Helper: escape text used in MongoDB regular expressions
const escapeRegex=value=>{
 return String(value||"").replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
};

// Helper: build the Prefix model payload
const buildPrefixPayload=(body,partial=false)=>{
 const payload={};

 const hasField=field=>{
  return Object.prototype.hasOwnProperty.call(body,field);
 };

 if(!partial||hasField("name")){
  payload.name=String(body.name||"").trim();
 }

 if(!partial||hasField("code")){
  payload.code=toCode(body.code);
 }

 if(!partial||hasField("recordType")){
  payload.recordType=toCode(body.recordType);
 }

 if(!partial||hasField("description")){
  payload.description=String(body.description||"").trim();
 }

 if(!partial||hasField("isActive")){
  payload.isActive=hasField("isActive")
   ?normalizeBoolean(body.isActive)
   :true;
 }

 return payload;
};

export const getPrefixes=async(req,res)=>{
 try{
  const userId=getUserId(req);

  if(!userId){
   return res.status(400).json({
    success:false,
    message:"A valid user is required"
   });
  }

  const {
   recordType,
   isActive,
   search
  }=req.query;

  const filter={userId};

  if(recordType){
   filter.recordType=toCode(recordType);
  }

  if(isActive==="true"){
   filter.isActive=true;
  }

  if(isActive==="false"){
   filter.isActive=false;
  }

  if(search){
   const searchText=escapeRegex(search);

   filter.$or=[
    {name:{$regex:searchText,$options:"i"}},
    {code:{$regex:searchText,$options:"i"}},
    {recordType:{$regex:searchText,$options:"i"}},
    {description:{$regex:searchText,$options:"i"}}
   ];
  }

  const prefixes=await Prefix.find(filter)
   .sort({
    recordType:1,
    code:1
   });

  res.json({
   success:true,
   data:prefixes
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};

export const getPrefixById=async(req,res)=>{
 try{
  const userId=getUserId(req);

  if(!userId){
   return res.status(400).json({
    success:false,
    message:"A valid user is required"
   });
  }

  if(!mongoose.isValidObjectId(req.params.id)){
   return res.status(400).json({
    success:false,
    message:"Invalid prefix ID"
   });
  }

  const prefix=await Prefix.findOne({
   _id:req.params.id,
   userId
  });

  if(!prefix){
   return res.status(404).json({
    success:false,
    message:"Prefix not found"
   });
  }

  res.json({
   success:true,
   data:prefix
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};

export const createPrefix=async(req,res)=>{
 try{
  const userId=getUserId(req);

  if(!userId){
   return res.status(400).json({
    success:false,
    message:"A valid user is required to create a prefix"
   });
  }

  const payload=buildPrefixPayload(req.body);

  if(!payload.name){
   return res.status(400).json({
    success:false,
    message:"Prefix name is required"
   });
  }

  if(!payload.code){
   return res.status(400).json({
    success:false,
    message:"Prefix code is required"
   });
  }

  if(!payload.recordType){
   return res.status(400).json({
    success:false,
    message:"Record type is required"
   });
  }

  const prefix=await Prefix.create({
   ...payload,
   userId
  });

  res.status(201).json({
   success:true,
   data:prefix
  });
 }catch(error){
  const status=error.code===11000?409:400;

  res.status(status).json({
   success:false,
   message:error.code===11000
    ?"A prefix with that code or record type already exists"
    :error.message
  });
 }
};

export const updatePrefix=async(req,res)=>{
 try{
  const userId=getUserId(req);

  if(!userId){
   return res.status(400).json({
    success:false,
    message:"A valid user is required"
   });
  }

  if(!mongoose.isValidObjectId(req.params.id)){
   return res.status(400).json({
    success:false,
    message:"Invalid prefix ID"
   });
  }

  const updates=buildPrefixPayload(req.body,true);

  if(
   Object.prototype.hasOwnProperty.call(updates,"name")&&
   !updates.name
  ){
   return res.status(400).json({
    success:false,
    message:"Prefix name is required"
   });
  }

  if(
   Object.prototype.hasOwnProperty.call(updates,"code")&&
   !updates.code
  ){
   return res.status(400).json({
    success:false,
    message:"Prefix code is required"
   });
  }

  if(
   Object.prototype.hasOwnProperty.call(updates,"recordType")&&
   !updates.recordType
  ){
   return res.status(400).json({
    success:false,
    message:"Record type is required"
   });
  }

  const prefix=await Prefix.findOneAndUpdate(
   {
    _id:req.params.id,
    userId
   },
   updates,
   {
    returnDocument:"after",
    runValidators:true
   }
  );

  if(!prefix){
   return res.status(404).json({
    success:false,
    message:"Prefix not found"
   });
  }

  res.json({
   success:true,
   data:prefix
  });
 }catch(error){
  const status=error.code===11000?409:400;

  res.status(status).json({
   success:false,
   message:error.code===11000
    ?"A prefix with that code or record type already exists"
    :error.message
  });
 }
};

export const deletePrefix=async(req,res)=>{
 try{
  const userId=getUserId(req);

  if(!userId){
   return res.status(400).json({
    success:false,
    message:"A valid user is required"
   });
  }

  if(!mongoose.isValidObjectId(req.params.id)){
   return res.status(400).json({
    success:false,
    message:"Invalid prefix ID"
   });
  }

  const prefix=await Prefix.findOneAndDelete({
   _id:req.params.id,
   userId
  });

  if(!prefix){
   return res.status(404).json({
    success:false,
    message:"Prefix not found"
   });
  }

  res.json({
   success:true,
   message:"Prefix deleted"
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};