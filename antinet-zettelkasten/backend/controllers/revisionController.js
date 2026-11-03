import mongoose from "mongoose";
import Revision from "../models/revisionModel.js";

// Helper: return the authenticated or supplied user ID
const getUserId=req=>{
 const userId=req.user?._id||req.body?.userId||req.query?.userId||"";
 return mongoose.isValidObjectId(userId)?userId:"";
};

// Helper: normalize a positive revision version number
const normalizeVersion=value=>{
 if(value===undefined||value===null||value==="")return null;

 const version=Number(value);

 return Number.isInteger(version)&&version>0
  ?version
  :null;
};

// Helper: build a revision payload while protecting system fields
const buildRevisionPayload=(body={},partial=false)=>{
 const payload={...body};

 delete payload._id;
 delete payload.userId;
 delete payload.createdAt;
 delete payload.updatedAt;
 delete payload.__v;

 const hasField=field=>{
  return Object.prototype.hasOwnProperty.call(body,field);
 };

 if(!partial||hasField("parentModel")){
  payload.parentModel=String(body.parentModel||"").trim();
 }

 if(!partial||hasField("parentRecordId")){
  payload.parentRecordId=String(body.parentRecordId||"").trim();
 }

 if(hasField("version")){
  payload.version=normalizeVersion(body.version);
 }

 return payload;
};

export const getRevisions=async(req,res)=>{
 try{
  const userId=getUserId(req);

  if(!userId){
   return res.status(400).json({
    success:false,
    message:"A valid user is required"
   });
  }

  const {
   parentModel,
   parentRecordId,
   version
  }=req.query;

  const filter={userId};

  if(parentModel){
   filter.parentModel=String(parentModel).trim();
  }

  if(parentRecordId){
   filter.parentRecordId=String(parentRecordId).trim();
  }

  if(version!==undefined){
   const normalizedVersion=normalizeVersion(version);

   if(!normalizedVersion){
    return res.status(400).json({
     success:false,
     message:"Version must be a positive whole number"
    });
   }

   filter.version=normalizedVersion;
  }

  const revisions=await Revision.find(filter)
   .sort({
    parentModel:1,
    parentRecordId:1,
    version:-1,
    createdAt:-1
   });

  res.json({
   success:true,
   data:revisions
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};

export const getRevisionById=async(req,res)=>{
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
    message:"Invalid revision ID"
   });
  }

  const revision=await Revision.findOne({
   _id:req.params.id,
   userId
  });

  if(!revision){
   return res.status(404).json({
    success:false,
    message:"Revision not found"
   });
  }

  res.json({
   success:true,
   data:revision
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};

export const createRevision=async(req,res)=>{
 try{
  const userId=getUserId(req);

  if(!userId){
   return res.status(400).json({
    success:false,
    message:"A valid user is required to create a revision"
   });
  }

  const payload=buildRevisionPayload(req.body);

  if(!payload.parentModel){
   return res.status(400).json({
    success:false,
    message:"Parent model is required"
   });
  }

  if(!payload.parentRecordId){
   return res.status(400).json({
    success:false,
    message:"Parent record ID is required"
   });
  }

  if(
   Object.prototype.hasOwnProperty.call(req.body,"version")&&
   !payload.version
  ){
   return res.status(400).json({
    success:false,
    message:"Version must be a positive whole number"
   });
  }

  if(!payload.version){
   const latestRevision=await Revision.findOne({
    userId,
    parentModel:payload.parentModel,
    parentRecordId:payload.parentRecordId
   })
    .sort({version:-1})
    .select("version")
    .lean();

   payload.version=(latestRevision?.version||0)+1;
  }

  const revision=await Revision.create({
   ...payload,
   userId
  });

  res.status(201).json({
   success:true,
   data:revision
  });
 }catch(error){
  const status=error.code===11000?409:400;

  res.status(status).json({
   success:false,
   message:error.code===11000
    ?"That revision version already exists for this record"
    :error.message
  });
 }
};

export const updateRevision=async(req,res)=>{
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
    message:"Invalid revision ID"
   });
  }

  const updates=buildRevisionPayload(req.body,true);

  if(
   Object.prototype.hasOwnProperty.call(updates,"parentModel")&&
   !updates.parentModel
  ){
   return res.status(400).json({
    success:false,
    message:"Parent model is required"
   });
  }

  if(
   Object.prototype.hasOwnProperty.call(updates,"parentRecordId")&&
   !updates.parentRecordId
  ){
   return res.status(400).json({
    success:false,
    message:"Parent record ID is required"
   });
  }

  if(
   Object.prototype.hasOwnProperty.call(updates,"version")&&
   !updates.version
  ){
   return res.status(400).json({
    success:false,
    message:"Version must be a positive whole number"
   });
  }

  if(!Object.keys(updates).length){
   return res.status(400).json({
    success:false,
    message:"No revision fields were supplied"
   });
  }

  const revision=await Revision.findOneAndUpdate(
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

  if(!revision){
   return res.status(404).json({
    success:false,
    message:"Revision not found"
   });
  }

  res.json({
   success:true,
   data:revision
  });
 }catch(error){
  const status=error.code===11000?409:400;

  res.status(status).json({
   success:false,
   message:error.code===11000
    ?"That revision version already exists for this record"
    :error.message
  });
 }
};

export const deleteRevision=async(req,res)=>{
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
    message:"Invalid revision ID"
   });
  }

  const revision=await Revision.findOneAndDelete({
   _id:req.params.id,
   userId
  });

  if(!revision){
   return res.status(404).json({
    success:false,
    message:"Revision not found"
   });
  }

  res.json({
   success:true,
   message:"Revision deleted"
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};