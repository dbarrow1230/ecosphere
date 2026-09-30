import mongoose from "mongoose";
import RecordSubtype from "../models/recordSubtypeModel.js";
import {toCode} from "../utils/recordId.js";

// Helper: return the authenticated or supplied user ID
const getUserId=req=>{
 const userId=req.user?._id||req.body?.userId||req.query?.userId||"";
 return mongoose.isValidObjectId(userId)?userId:"";
};

// Helper: escape text used in MongoDB regular expressions
const escapeRegex=value=>{
 return String(value||"").replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
};

const normalizeTemplateFields=value=>{
 if(!Array.isArray(value))return [];
 const inputTypes=new Set(["text","richtext","number","date","select","checkbox"]);
 const seen=new Set();
 return value.map(field=>{
  const label=String(field?.label||"").trim().slice(0,100);
  const suppliedKey=String(field?.key||"").trim().replace(/[^a-zA-Z0-9]/g,"").slice(0,64);
  const labelWords=label.split(/[^a-zA-Z0-9]+/).filter(Boolean);
  const generatedKey=labelWords.map((word,index)=>index?`${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`:word.toLowerCase()).join("").slice(0,64);
  const key=suppliedKey||generatedKey;
  const inputType=inputTypes.has(field?.inputType)?field.inputType:"text";
  const legacySpans={full:12,half:6,third:4};
  const requestedSpan=Number(field?.columnSpan||legacySpans[field?.width]||12);
  const columnSpan=Math.min(12,Math.max(1,Number.isFinite(requestedSpan)?Math.round(requestedSpan):12));
  const options=(Array.isArray(field?.options)?field.options:String(field?.options||"").split(","))
   .map(option=>String(option||"").trim().slice(0,100))
   .filter(Boolean)
   .slice(0,50);
  return {key,label,inputType,columnSpan,options,placeholder:String(field?.placeholder||"").trim().slice(0,250)};
 }).filter(field=>{
  if(!field.key||!field.label||seen.has(field.key))return false;
  seen.add(field.key);
  return true;
 });
};

// Helper: build the RecordSubtype model payload
const buildRecordSubtypePayload=(body,partial=false)=>{
 const payload={};

 const hasField=field=>{
  return Object.prototype.hasOwnProperty.call(body,field);
 };

 if(!partial||hasField("recordType")){
  payload.recordType=toCode(body.recordType);
 }

 if(!partial||hasField("name")){
  payload.name=String(body.name||"").trim();
 }

 if(!partial||hasField("code")){
  payload.code=toCode(body.code);
 }

 if(!partial||hasField("description")){
  payload.description=String(body.description||"").trim();
 }

 if(!partial||hasField("templateFields")){
  payload.templateFields=normalizeTemplateFields(body.templateFields);
 }

 if(!partial||hasField("status")){
  payload.status=String(body.status||"active")
   .trim()
   .toLowerCase();
 }

 return payload;
};

export const getRecordSubtypes=async(req,res)=>{
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
   status,
   search
  }=req.query;

  const filter={userId};

  if(recordType){
   filter.recordType=toCode(recordType);
  }

  if(status){
   filter.status=String(status).trim().toLowerCase();
  }

  if(search){
   const searchText=escapeRegex(search);

   filter.$or=[
    {recordType:{$regex:searchText,$options:"i"}},
    {name:{$regex:searchText,$options:"i"}},
    {code:{$regex:searchText,$options:"i"}},
    {description:{$regex:searchText,$options:"i"}}
   ];
  }

  const recordSubtypes=await RecordSubtype.find(filter)
   .sort({
    recordType:1,
    name:1
   });

  res.json({
   success:true,
   data:recordSubtypes
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};

export const getRecordSubtypeById=async(req,res)=>{
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
    message:"Invalid record subtype ID"
   });
  }

  const recordSubtype=await RecordSubtype.findOne({
   _id:req.params.id,
   userId
  });

  if(!recordSubtype){
   return res.status(404).json({
    success:false,
    message:"Record subtype not found"
   });
  }

  res.json({
   success:true,
   data:recordSubtype
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};

export const createRecordSubtype=async(req,res)=>{
 try{
  const userId=getUserId(req);

  if(!userId){
   return res.status(400).json({
    success:false,
    message:"A valid user is required to create a record subtype"
   });
  }

  const payload=buildRecordSubtypePayload(req.body);

  if(!payload.recordType){
   return res.status(400).json({
    success:false,
    message:"Record type is required"
   });
  }

  if(!payload.name){
   return res.status(400).json({
    success:false,
    message:"Record subtype name is required"
   });
  }

  if(!payload.code){
   return res.status(400).json({
    success:false,
    message:"Record subtype code is required"
   });
  }

  const recordSubtype=await RecordSubtype.create({
   ...payload,
   userId
  });

  res.status(201).json({
   success:true,
   data:recordSubtype
  });
 }catch(error){
  const status=error.code===11000?409:400;

  res.status(status).json({
   success:false,
   message:error.code===11000
    ?"That record subtype already exists for this record type"
    :error.message
  });
 }
};

export const updateRecordSubtype=async(req,res)=>{
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
    message:"Invalid record subtype ID"
   });
  }

  const updates=buildRecordSubtypePayload(req.body,true);

  if(
   Object.prototype.hasOwnProperty.call(updates,"recordType")&&
   !updates.recordType
  ){
   return res.status(400).json({
    success:false,
    message:"Record type is required"
   });
  }

  if(
   Object.prototype.hasOwnProperty.call(updates,"name")&&
   !updates.name
  ){
   return res.status(400).json({
    success:false,
    message:"Record subtype name is required"
   });
  }

  if(
   Object.prototype.hasOwnProperty.call(updates,"code")&&
   !updates.code
  ){
   return res.status(400).json({
    success:false,
    message:"Record subtype code is required"
   });
  }

  const recordSubtype=await RecordSubtype.findOneAndUpdate(
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

  if(!recordSubtype){
   return res.status(404).json({
    success:false,
    message:"Record subtype not found"
   });
  }

  res.json({
   success:true,
   data:recordSubtype
  });
 }catch(error){
  const status=error.code===11000?409:400;

  res.status(status).json({
   success:false,
   message:error.code===11000
    ?"That record subtype already exists for this record type"
    :error.message
  });
 }
};

export const archiveRecordSubtype=async(req,res)=>{
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
    message:"Invalid record subtype ID"
   });
  }

  const recordSubtype=await RecordSubtype.findOneAndUpdate(
   {
    _id:req.params.id,
    userId
   },
   {
    status:"archived"
   },
   {
    returnDocument:"after",
    runValidators:true
   }
  );

  if(!recordSubtype){
   return res.status(404).json({
    success:false,
    message:"Record subtype not found"
   });
  }

  res.json({
   success:true,
   data:recordSubtype
  });
 }catch(error){
  res.status(400).json({
   success:false,
   message:error.message
  });
 }
};

export const deleteRecordSubtype=async(req,res)=>{
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
    message:"Invalid record subtype ID"
   });
  }

  const recordSubtype=await RecordSubtype.findOneAndDelete({
   _id:req.params.id,
   userId
  });

  if(!recordSubtype){
   return res.status(404).json({
    success:false,
    message:"Record subtype not found"
   });
  }

  res.json({
   success:true,
   message:"Record subtype deleted"
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};
