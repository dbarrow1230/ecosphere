import mongoose from "mongoose";
import Tag from "../models/tagModel.js";

// Helper: return the authenticated or supplied user ID
const getUserId=req=>{
 const userId=req.user?._id||req.body?.userId||req.query?.userId||"";
 return mongoose.isValidObjectId(userId)?userId:"";
};

// Helper: normalize text into a URL-safe tag slug
const toSlug=value=>{
 return String(value||"")
  .trim()
  .toLowerCase()
  .replace(/['’]/g,"")
  .replace(/[^a-z0-9]+/g,"-")
  .replace(/^-+|-+$/g,"");
};

// Helper: escape text used in MongoDB regular expressions
const escapeRegex=value=>{
 return String(value||"").replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
};

// Helper: build the Tag model payload
const buildTagPayload=(body,partial=false)=>{
 const payload={};

 const hasField=field=>{
  return Object.prototype.hasOwnProperty.call(body,field);
 };

 if(!partial||hasField("name")){
  payload.name=String(body.name||"").trim();
 }

 if(!partial||hasField("slug")||hasField("name")){
  payload.slug=toSlug(body.slug||body.name);
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

export const getTags=async(req,res)=>{
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

  const filter={userId};

  if(status){
   filter.status=String(status).trim().toLowerCase();
  }

  if(search){
   const searchText=escapeRegex(search);

   filter.$or=[
    {name:{$regex:searchText,$options:"i"}},
    {slug:{$regex:searchText,$options:"i"}},
    {description:{$regex:searchText,$options:"i"}}
   ];
  }

  const tags=await Tag.find(filter)
   .sort({name:1});

  res.json({
   success:true,
   data:tags
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};

export const getTagById=async(req,res)=>{
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
    message:"Invalid tag ID"
   });
  }

  const tag=await Tag.findOne({
   _id:req.params.id,
   userId
  });

  if(!tag){
   return res.status(404).json({
    success:false,
    message:"Tag not found"
   });
  }

  res.json({
   success:true,
   data:tag
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};

export const createTag=async(req,res)=>{
 try{
  const userId=getUserId(req);

  if(!userId){
   return res.status(400).json({
    success:false,
    message:"A valid user is required to create a tag"
   });
  }

  const payload=buildTagPayload(req.body);

  if(!payload.name){
   return res.status(400).json({
    success:false,
    message:"Tag name is required"
   });
  }

  if(!payload.slug){
   return res.status(400).json({
    success:false,
    message:"Tag slug is required"
   });
  }

  const tag=await Tag.create({
   ...payload,
   userId
  });

  res.status(201).json({
   success:true,
   data:tag
  });
 }catch(error){
  const status=error.code===11000?409:400;

  res.status(status).json({
   success:false,
   message:error.code===11000
    ?"A tag with that name or slug already exists"
    :error.message
  });
 }
};

export const updateTag=async(req,res)=>{
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
    message:"Invalid tag ID"
   });
  }

  const updates=buildTagPayload(req.body,true);

  if(
   Object.prototype.hasOwnProperty.call(updates,"name")&&
   !updates.name
  ){
   return res.status(400).json({
    success:false,
    message:"Tag name is required"
   });
  }

  if(
   Object.prototype.hasOwnProperty.call(updates,"slug")&&
   !updates.slug
  ){
   return res.status(400).json({
    success:false,
    message:"Tag slug is required"
   });
  }

  const tag=await Tag.findOneAndUpdate(
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

  if(!tag){
   return res.status(404).json({
    success:false,
    message:"Tag not found"
   });
  }

  res.json({
   success:true,
   data:tag
  });
 }catch(error){
  const status=error.code===11000?409:400;

  res.status(status).json({
   success:false,
   message:error.code===11000
    ?"A tag with that name or slug already exists"
    :error.message
  });
 }
};

export const archiveTag=async(req,res)=>{
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
    message:"Invalid tag ID"
   });
  }

  const tag=await Tag.findOneAndUpdate(
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

  if(!tag){
   return res.status(404).json({
    success:false,
    message:"Tag not found"
   });
  }

  res.json({
   success:true,
   data:tag
  });
 }catch(error){
  res.status(400).json({
   success:false,
   message:error.message
  });
 }
};

export const deleteTag=async(req,res)=>{
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
    message:"Invalid tag ID"
   });
  }

  const tag=await Tag.findOneAndDelete({
   _id:req.params.id,
   userId
  });

  if(!tag){
   return res.status(404).json({
    success:false,
    message:"Tag not found"
   });
  }

  res.json({
   success:true,
   message:"Tag deleted"
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};