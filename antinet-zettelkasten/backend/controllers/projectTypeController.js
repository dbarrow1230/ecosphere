import mongoose from "mongoose";
import ProjectType from "../models/projectTypeModel.js";
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

// Helper: build the ProjectType model payload
const buildProjectTypePayload=(body,partial=false)=>{
 const payload={};

 const hasField=field=>{
  return Object.prototype.hasOwnProperty.call(body,field);
 };

 if(!partial||hasField("name")){
  payload.name=String(body.name||"").trim();
  payload.code=toCode(payload.name);
 }

 if(!partial||hasField("description")){
  payload.description=String(body.description||"").trim();
 }

 if(!partial||hasField("status")){
  payload.status=String(body.status||"active").trim().toLowerCase();
 }

 return payload;
};

export const getProjectTypes=async(req,res)=>{
 try{
  const userId=getUserId(req);

  if(!userId){
   return res.status(400).json({
    success:false,
    message:"A valid user is required"
   });
  }

  const {status,search}=req.query;

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

  const projectTypes=await ProjectType.find(filter)
   .sort({name:1});

  res.json({
   success:true,
   data:projectTypes
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};

export const getProjectTypeById=async(req,res)=>{
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
    message:"Invalid project type ID"
   });
  }

  const projectType=await ProjectType.findOne({
   _id:req.params.id,
   userId
  });

  if(!projectType){
   return res.status(404).json({
    success:false,
    message:"Project type not found"
   });
  }

  res.json({
   success:true,
   data:projectType
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};

export const createProjectType=async(req,res)=>{
 try{
  const userId=getUserId(req);

  if(!userId){
   return res.status(400).json({
    success:false,
    message:"A valid user is required to create a project type"
   });
  }

  const payload=buildProjectTypePayload(req.body);

  if(!payload.name){
   return res.status(400).json({
    success:false,
    message:"Project type name is required"
   });
  }

  const projectType=await ProjectType.create({
   ...payload,
   userId
  });

  res.status(201).json({
   success:true,
   data:projectType
  });
 }catch(error){
  const status=error.code===11000?409:400;

  res.status(status).json({
   success:false,
   message:error.code===11000
    ?"A project type with that name or code already exists"
    :error.message
  });
 }
};

export const updateProjectType=async(req,res)=>{
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
    message:"Invalid project type ID"
   });
  }

  const updates=buildProjectTypePayload(req.body,true);

  if(
   Object.prototype.hasOwnProperty.call(updates,"name")&&
   !updates.name
  ){
   return res.status(400).json({
    success:false,
    message:"Project type name is required"
   });
  }

  const projectType=await ProjectType.findOneAndUpdate(
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

  if(!projectType){
   return res.status(404).json({
    success:false,
    message:"Project type not found"
   });
  }

  res.json({
   success:true,
   data:projectType
  });
 }catch(error){
  const status=error.code===11000?409:400;

  res.status(status).json({
   success:false,
   message:error.code===11000
    ?"A project type with that name or code already exists"
    :error.message
  });
 }
};

export const archiveProjectType=async(req,res)=>{
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
    message:"Invalid project type ID"
   });
  }

  const projectType=await ProjectType.findOneAndUpdate(
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

  if(!projectType){
   return res.status(404).json({
    success:false,
    message:"Project type not found"
   });
  }

  res.json({
   success:true,
   data:projectType
  });
 }catch(error){
  res.status(400).json({
   success:false,
   message:error.message
  });
 }
};

export const deleteProjectType=async(req,res)=>{
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
    message:"Invalid project type ID"
   });
  }

  const projectType=await ProjectType.findOneAndDelete({
   _id:req.params.id,
   userId
  });

  if(!projectType){
   return res.status(404).json({
    success:false,
    message:"Project type not found"
   });
  }

  res.json({
   success:true,
   message:"Project type deleted"
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};
