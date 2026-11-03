import mongoose from "mongoose";
import RelationType from "../models/relationTypeModel.js";
import {toCode} from "../utils/recordId.js";

const defaultRelationTypes=[
 {name:"Supports",code:"SUPPORTS",description:"One record provides evidence or reinforcement for another."},
 {name:"Expands",code:"EXPANDS",description:"One record develops or extends another record's idea."}
];

// Helper: return the authenticated or supplied user ID
const getUserId=req=>{
 const userId=req.user?._id||req.body?.userId||req.query?.userId||"";
 return mongoose.isValidObjectId(userId)?userId:"";
};

// Helper: escape text used in MongoDB regular expressions
const escapeRegex=value=>{
 return String(value||"").replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
};

// Helper: build the RelationType model payload
const buildRelationTypePayload=(body,partial=false)=>{
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

 if(!partial||hasField("description")){
  payload.description=String(body.description||"").trim();
 }

 if(!partial||hasField("status")){
  payload.status=String(body.status||"active")
   .trim()
   .toLowerCase();
 }

 return payload;
};

export const getRelationTypes=async(req,res)=>{
 try{
  const userId=getUserId(req);

  if(!userId){
   return res.status(400).json({
    success:false,
    message:"A valid user is required"
   });
  }

  const {
   status,
   search
  }=req.query;

  await Promise.all(defaultRelationTypes.map(defaultType=>RelationType.updateOne(
   {userId,code:defaultType.code},
   {$setOnInsert:{...defaultType,userId,status:"active"}},
   {upsert:true}
  )));

  const filter={userId};

  if(status){
   filter.status=String(status).trim().toLowerCase();
  }

  if(search){
   const searchText=escapeRegex(search);

   filter.$or=[
    {name:{$regex:searchText,$options:"i"}},
    {code:{$regex:searchText,$options:"i"}},
    {description:{$regex:searchText,$options:"i"}}
   ];
  }

  const relationTypes=await RelationType.find(filter)
   .sort({name:1});

  res.json({
   success:true,
   data:relationTypes
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};

export const getRelationTypeById=async(req,res)=>{
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
    message:"Invalid relation type ID"
   });
  }

  const relationType=await RelationType.findOne({
   _id:req.params.id,
   userId
  });

  if(!relationType){
   return res.status(404).json({
    success:false,
    message:"Relation type not found"
   });
  }

  res.json({
   success:true,
   data:relationType
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};

export const createRelationType=async(req,res)=>{
 try{
  const userId=getUserId(req);

  if(!userId){
   return res.status(400).json({
    success:false,
    message:"A valid user is required to create a relation type"
   });
  }

  const payload=buildRelationTypePayload(req.body);

  if(!payload.name){
   return res.status(400).json({
    success:false,
    message:"Relation type name is required"
   });
  }

  if(!payload.code){
   return res.status(400).json({
    success:false,
    message:"Relation type code is required"
   });
  }

  const relationType=await RelationType.create({
   ...payload,
   userId
  });

  res.status(201).json({
   success:true,
   data:relationType
  });
 }catch(error){
  const status=error.code===11000?409:400;

  res.status(status).json({
   success:false,
   message:error.code===11000
    ?"A relation type with that name or code already exists"
    :error.message
  });
 }
};

export const updateRelationType=async(req,res)=>{
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
    message:"Invalid relation type ID"
   });
  }

  const updates=buildRelationTypePayload(req.body,true);

  if(
   Object.prototype.hasOwnProperty.call(updates,"name")&&
   !updates.name
  ){
   return res.status(400).json({
    success:false,
    message:"Relation type name is required"
   });
  }

  if(
   Object.prototype.hasOwnProperty.call(updates,"code")&&
   !updates.code
  ){
   return res.status(400).json({
    success:false,
    message:"Relation type code is required"
   });
  }

  const relationType=await RelationType.findOneAndUpdate(
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

  if(!relationType){
   return res.status(404).json({
    success:false,
    message:"Relation type not found"
   });
  }

  res.json({
   success:true,
   data:relationType
  });
 }catch(error){
  const status=error.code===11000?409:400;

  res.status(status).json({
   success:false,
   message:error.code===11000
    ?"A relation type with that name or code already exists"
    :error.message
  });
 }
};

export const archiveRelationType=async(req,res)=>{
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
    message:"Invalid relation type ID"
   });
  }

  const relationType=await RelationType.findOneAndUpdate(
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

  if(!relationType){
   return res.status(404).json({
    success:false,
    message:"Relation type not found"
   });
  }

  res.json({
   success:true,
   data:relationType
  });
 }catch(error){
  res.status(400).json({
   success:false,
   message:error.message
  });
 }
};

export const deleteRelationType=async(req,res)=>{
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
    message:"Invalid relation type ID"
   });
  }

  const relationType=await RelationType.findOneAndDelete({
   _id:req.params.id,
   userId
  });

  if(!relationType){
   return res.status(404).json({
    success:false,
    message:"Relation type not found"
   });
  }

  res.json({
   success:true,
   message:"Relation type deleted"
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};
