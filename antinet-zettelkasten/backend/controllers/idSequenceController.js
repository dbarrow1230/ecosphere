import mongoose from "mongoose";
import IdSequence from "../models/idSequenceModel.js";
import {toCode} from "../utils/recordId.js";

// Helper: return the authenticated or supplied user ID
const getUserId=req=>{
 const userId=req.user?._id||req.body?.userId||req.query?.userId||"";
 return mongoose.isValidObjectId(userId)?userId:"";
};

// Helper: normalize a sequence number
const normalizeSequenceNumber=value=>{
 const number=Number(value);
 return Number.isInteger(number)&&number>=1?number:null;
};

// Helper: build the ID sequence key fields
const buildSequenceKey=body=>({
 recordType:toCode(body.recordType),
 projectCode:toCode(body.projectCode),
 subtypeCode:toCode(body.subtypeCode),
 subjectCode:toCode(body.subjectCode)
});

// Helper: build the editable ID sequence payload
const buildIdSequencePayload=(body,partial=false)=>{
 const payload={};

 const hasField=field=>{
  return Object.prototype.hasOwnProperty.call(body,field);
 };

 if(!partial||hasField("recordType")){
  payload.recordType=toCode(body.recordType);
 }

 if(!partial||hasField("projectCode")){
  payload.projectCode=toCode(body.projectCode);
 }

 if(!partial||hasField("subtypeCode")){
  payload.subtypeCode=toCode(body.subtypeCode);
 }

 if(!partial||hasField("subjectCode")){
  payload.subjectCode=toCode(body.subjectCode);
 }

 if(hasField("nextNumber")){
  payload.nextNumber=normalizeSequenceNumber(body.nextNumber);
 }else if(!partial){
  payload.nextNumber=1;
 }

 return payload;
};

// Helper: atomically reserve the next available number
const reserveNextNumber=async filter=>{
 const existing=await IdSequence.findOneAndUpdate(
  filter,
  {$inc:{nextNumber:1}},
  {
   returnDocument:"before",
   runValidators:true
  }
 );

 if(existing){
  return existing.nextNumber;
 }

 try{
  await IdSequence.create({
   ...filter,
   nextNumber:2
  });

  return 1;
 }catch(error){
  if(error.code!==11000)throw error;

  const retry=await IdSequence.findOneAndUpdate(
   filter,
   {$inc:{nextNumber:1}},
   {
    returnDocument:"before",
    runValidators:true
   }
  );

  if(!retry){
   throw new Error("Unable to reserve the next ID number");
  }

  return retry.nextNumber;
 }
};

export const getIdSequences=async(req,res)=>{
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
   projectCode,
   subtypeCode,
   subjectCode
  }=req.query;

  const filter={userId};

  if(recordType){
   filter.recordType=toCode(recordType);
  }

  if(projectCode){
   filter.projectCode=toCode(projectCode);
  }

  if(subtypeCode){
   filter.subtypeCode=toCode(subtypeCode);
  }

  if(subjectCode){
   filter.subjectCode=toCode(subjectCode);
  }

  const sequences=await IdSequence.find(filter)
   .sort({
    recordType:1,
    projectCode:1,
    subtypeCode:1,
    subjectCode:1
   });

  res.json({
   success:true,
   data:sequences
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};

export const getIdSequenceById=async(req,res)=>{
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
    message:"Invalid ID sequence ID"
   });
  }

  const sequence=await IdSequence.findOne({
   _id:req.params.id,
   userId
  });

  if(!sequence){
   return res.status(404).json({
    success:false,
    message:"ID sequence not found"
   });
  }

  res.json({
   success:true,
   data:sequence
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};

export const createIdSequence=async(req,res)=>{
 try{
  const userId=getUserId(req);

  if(!userId){
   return res.status(400).json({
    success:false,
    message:"A valid user is required to create an ID sequence"
   });
  }

  const payload=buildIdSequencePayload(req.body);

  if(!payload.recordType){
   return res.status(400).json({
    success:false,
    message:"Record type is required"
   });
  }

  if(!payload.nextNumber){
   return res.status(400).json({
    success:false,
    message:"Next number must be a positive whole number"
   });
  }

  const sequence=await IdSequence.create({
   ...payload,
   userId
  });

  res.status(201).json({
   success:true,
   data:sequence
  });
 }catch(error){
  const status=error.code===11000?409:400;

  res.status(status).json({
   success:false,
   message:error.code===11000
    ?"An ID sequence already exists for those code values"
    :error.message
  });
 }
};

export const updateIdSequence=async(req,res)=>{
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
    message:"Invalid ID sequence ID"
   });
  }

  const updates=buildIdSequencePayload(req.body,true);

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
   Object.prototype.hasOwnProperty.call(updates,"nextNumber")&&
   !updates.nextNumber
  ){
   return res.status(400).json({
    success:false,
    message:"Next number must be a positive whole number"
   });
  }

  if(!Object.keys(updates).length){
   return res.status(400).json({
    success:false,
    message:"No ID sequence fields were supplied"
   });
  }

  const sequence=await IdSequence.findOneAndUpdate(
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

  if(!sequence){
   return res.status(404).json({
    success:false,
    message:"ID sequence not found"
   });
  }

  res.json({
   success:true,
   data:sequence
  });
 }catch(error){
  const status=error.code===11000?409:400;

  res.status(status).json({
   success:false,
   message:error.code===11000
    ?"An ID sequence already exists for those code values"
    :error.message
  });
 }
};

export const getNextId=async(req,res)=>{
 try{
  const userId=getUserId(req);

  if(!userId){
   return res.status(400).json({
    success:false,
    message:"A valid user is required to generate an ID"
   });
  }

  const key=buildSequenceKey(req.body);

  if(!key.recordType){
   return res.status(400).json({
    success:false,
    message:"Record type is required"
   });
  }

  if(!key.projectCode){
   return res.status(400).json({
    success:false,
    message:"Project or topic is required"
   });
  }

  if(!key.subtypeCode){
   return res.status(400).json({
    success:false,
    message:"Record subtype is required"
   });
  }

  const nextNumber=await reserveNextNumber({
   userId,
   ...key
  });

  const number=String(nextNumber).padStart(3,"0");

  const generatedId=[
   key.recordType,
   key.projectCode,
   key.subtypeCode,
   key.subjectCode,
   number
  ]
   .filter(Boolean)
   .join("-");

  res.json({
   success:true,
   data:{
    generatedId,
    number,
    nextNumber
   }
  });
 }catch(error){
  res.status(400).json({
   success:false,
   message:error.message
  });
 }
};

export const previewNextId=async(req,res)=>{
 try{
  const userId=getUserId(req);

  if(!userId){
   return res.status(400).json({
    success:false,
    message:"A valid user is required to preview an ID"
   });
  }

  const key=buildSequenceKey(req.body);

  if(!key.recordType){
   return res.status(400).json({
    success:false,
    message:"Record type is required"
   });
  }

  if(!key.projectCode){
   return res.status(400).json({
    success:false,
    message:"Project or topic is required"
   });
  }

  if(!key.subtypeCode){
   return res.status(400).json({
    success:false,
    message:"Record subtype is required"
   });
  }

  const sequence=await IdSequence.findOne({
   userId,
   ...key
  }).lean();

  const nextNumber=sequence?.nextNumber||1;
  const number=String(nextNumber).padStart(3,"0");
  const generatedId=[
   key.recordType,
   key.projectCode,
   key.subtypeCode,
   key.subjectCode,
   number
  ]
   .filter(Boolean)
   .join("-");

  res.json({
   success:true,
   data:{
    generatedId,
    number,
    nextNumber,
    reserved:false
   }
  });
 }catch(error){
  res.status(400).json({
   success:false,
   message:error.message
  });
 }
};

export const deleteIdSequence=async(req,res)=>{
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
    message:"Invalid ID sequence ID"
   });
  }

  const sequence=await IdSequence.findOneAndDelete({
   _id:req.params.id,
   userId
  });

  if(!sequence){
   return res.status(404).json({
    success:false,
    message:"ID sequence not found"
   });
  }

  res.json({
   success:true,
   message:"ID sequence deleted"
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};
