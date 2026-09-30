import mongoose from "mongoose";
import Project from "../models/projectModel.js";
import ProjectType from "../models/projectTypeModel.js";
import Domain from "../models/domainModel.js";
import {generateRecordId,toCode,toSubjectCode} from "../utils/recordId.js";
import {recordRevision} from "../utils/recordRevision.js";

// Helper: return the authenticated or supplied user ID
const getUserId=req=>{
 const userId=req.user?._id||req.body?.userId||req.query?.userId||"";
 return mongoose.isValidObjectId(userId)?userId:"";
};

// Helper: normalize optional ObjectId values
const normalizeObjectId=value=>{
 if(!value)return null;

 const objectId=typeof value==="object"
  ?value._id||value.id||value.$oid
  :value;

 return mongoose.isValidObjectId(objectId)?objectId:null;
};

// Helper: normalize checkbox and Boolean values
const normalizeBoolean=value=>{
 return value===true||value==="true"||value===1||value==="1"||value==="on";
};

// Helper: normalize comma-separated or array string fields
const normalizeStringList=value=>{
 const items=Array.isArray(value)?value:String(value||"").split(",");
 return items.map(item=>String(item||"").trim()).filter(Boolean);
};

// Helper: escape text used in MongoDB regular expressions
const escapeRegex=value=>{
 return String(value||"").replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
};

const resolveProjectIdParts=async({userId,domainId,typeId,title})=>{
 if(!domainId)throw new Error("Domain is required");
 if(!typeId)throw new Error("Project type is required");

 const [domain,projectType]=await Promise.all([
  Domain.findOne({_id:domainId,userId}).select("name code").lean(),
  ProjectType.findOne({_id:typeId,userId}).select("name code").lean()
 ]);

 if(!domain)throw new Error("Selected domain was not found");
 if(!projectType)throw new Error("Selected project type was not found");

 return {
  domainCode:toCode(domain.code||domain.name),
  subtypeCode:toCode(projectType.code||projectType.name),
  subjectCode:toSubjectCode(title)
 };
};

// Helper: build the Project model payload
const buildProjectPayload=(body,partial=false)=>{
 const payload={};

 const hasField=field=>{
  return Object.prototype.hasOwnProperty.call(body,field);
 };
 if(!partial||hasField("domainId"))payload.domainId=normalizeObjectId(body.domainId);

 if(!partial||hasField("typeId")){
  payload.typeId=normalizeObjectId(body.typeId);
 }

 if(!partial||hasField("title")){
  payload.title=String(body.title||"").trim();
 }

 if(!partial||hasField("code")){
  payload.code=toCode(body.code);
 }

 if(!partial||hasField("description")){
  payload.description=String(body.description||"").trim();
 }

 if(!partial||hasField("tags")){
  payload.tags=normalizeStringList(body.tags);
 }

 if(!partial||hasField("status")){
  payload.status=String(body.status||"active").trim().toLowerCase();
 }

 if(!partial||hasField("isFavorite")){
  payload.isFavorite=normalizeBoolean(body.isFavorite);
 }

 if(!partial||hasField("isArchived")){
  payload.isArchived=normalizeBoolean(body.isArchived);
 }

 if(payload.status==="archived"){
  payload.isArchived=true;
 }

 if(
  Object.prototype.hasOwnProperty.call(payload,"status")&&
  payload.status!=="archived"&&
  !hasField("isArchived")
 ){
  payload.isArchived=false;
 }

 return payload;
};

// Helper: populate the Project type reference
const populateProject=query=>{
 return query
  .populate("typeId","projectTypeId name code description status")
  .populate("domainId","name code description status");
};

export const getProjects=async(req,res)=>{
 try{
  const userId=getUserId(req);

  if(!userId){
   return res.status(400).json({
    success:false,
    message:"A valid user is required"
   });
  }

  const {
   typeId,
   status,
   isArchived,
   isFavorite,
   search,
   includeArchived
  }=req.query;

  const filter={userId};

  if(includeArchived!=="true"&&!status&&!isArchived){
   filter.status={$ne:"archived"};
   filter.isArchived={$ne:true};
  }

  if(typeId){
   if(!mongoose.isValidObjectId(typeId)){
    return res.status(400).json({
     success:false,
     message:"Invalid project type ID"
    });
   }

   filter.typeId=typeId;
  }

  if(status){
   filter.status=String(status).trim().toLowerCase();
  }

  if(isArchived==="true"){
   filter.isArchived=true;
  }

  if(isArchived==="false"){
   filter.isArchived=false;
  }

  if(isFavorite==="true"){
   filter.isFavorite=true;
  }

  if(isFavorite==="false"){
   filter.isFavorite=false;
  }

  if(search){
   const searchText=escapeRegex(search);

   filter.$or=[
    {projectId:{$regex:searchText,$options:"i"}},
    {title:{$regex:searchText,$options:"i"}},
    {code:{$regex:searchText,$options:"i"}},
    {description:{$regex:searchText,$options:"i"}}
   ];
  }

  const projects=await populateProject(
   Project.find(filter)
  ).sort({title:1});

  res.json({
   success:true,
   data:projects
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};

export const getProjectById=async(req,res)=>{
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
    message:"Invalid project ID"
   });
  }

  const project=await populateProject(
   Project.findOne({
    _id:req.params.id,
    userId
   })
  );

  if(!project){
   return res.status(404).json({
    success:false,
    message:"Project not found"
   });
  }

  res.json({
   success:true,
   data:project
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};

export const createProject=async(req,res)=>{
 try{
  const userId=getUserId(req);

  if(!userId){
   return res.status(400).json({
    success:false,
    message:"A valid user is required to create a project"
   });
  }

  const payload=buildProjectPayload(req.body);

  if(!payload.title){
   return res.status(400).json({
    success:false,
    message:"Project title is required"
   });
  }

  if(!payload.code){
   return res.status(400).json({
    success:false,
    message:"Project code is required"
   });
  }

  if(!payload.typeId){
   return res.status(400).json({
    success:false,
    message:req.body.typeId
     ?"Invalid project type ID"
     :"Project type is required"
   });
  }

  if(!payload.domainId){
   return res.status(400).json({
    success:false,
    message:req.body.domainId?"Invalid domain ID":"Domain is required"
   });
  }

  const idParts=await resolveProjectIdParts({
   userId,
   domainId:payload.domainId,
   typeId:payload.typeId,
   title:payload.title
  });

  const projectId=await generateRecordId({
   userId,
   recordType:"PRJ",
   domainId:payload.domainId,
   subtypeCode:idParts.subtypeCode,
   subjectCode:idParts.subjectCode
  });

  let project=await Project.create({
   ...payload,
   userId,
   projectId
  });

  project=await populateProject(
   Project.findById(project._id)
  );

  res.status(201).json({
   success:true,
   data:project
  });
 }catch(error){
  const status=error.code===11000?409:400;

  res.status(status).json({
   success:false,
   message:error.code===11000
    ?"A project with that ID or code already exists"
    :error.message
  });
 }
};

export const updateProject=async(req,res)=>{
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
    message:"Invalid project ID"
   });
  }

  const updates=buildProjectPayload(req.body,true);

  if(
   Object.prototype.hasOwnProperty.call(updates,"title")&&
   !updates.title
  ){
   return res.status(400).json({
    success:false,
    message:"Project title is required"
   });
  }

  if(
   Object.prototype.hasOwnProperty.call(updates,"code")&&
   !updates.code
  ){
   return res.status(400).json({
    success:false,
    message:"Project code is required"
   });
  }

  if(
   Object.prototype.hasOwnProperty.call(req.body,"typeId")&&
   !updates.typeId
  ){
   return res.status(400).json({
    success:false,
    message:req.body.typeId
     ?"Invalid project type ID"
     :"Project type is required"
   });
  }

  if(
   Object.prototype.hasOwnProperty.call(req.body,"domainId")&&
   !updates.domainId
  ){
   return res.status(400).json({
    success:false,
    message:req.body.domainId?"Invalid domain ID":"Domain is required"
   });
  }

  const existingProject=await Project.findOne({_id:req.params.id,userId});

  if(!existingProject){
   return res.status(404).json({success:false,message:"Project not found"});
  }

  const effectiveDomainId=updates.domainId||existingProject.domainId;
  const effectiveTypeId=updates.typeId||existingProject.typeId;
  const effectiveTitle=updates.title||existingProject.title;
  const idParts=await resolveProjectIdParts({
   userId,
   domainId:effectiveDomainId,
   typeId:effectiveTypeId,
   title:effectiveTitle
  });
  const expectedPrefix=[
   "PRJ",
   idParts.domainCode,
   idParts.subtypeCode,
   idParts.subjectCode
  ].join("-")+"-";

  if(!String(existingProject.projectId||"").startsWith(expectedPrefix)){
   updates.projectId=await generateRecordId({
    userId,
    recordType:"PRJ",
    domainId:effectiveDomainId,
    subtypeCode:idParts.subtypeCode,
    subjectCode:idParts.subjectCode,
    existingId:existingProject.projectId,
    recordDate:existingProject.createdAt
   });
  }

  const project=await populateProject(
   Project.findOneAndUpdate(
    {
     _id:req.params.id,
     userId
    },
    updates,
    {
     returnDocument:"after",
     runValidators:true
    }
   )
  );

  if(!project){
   return res.status(404).json({
    success:false,
    message:"Project not found"
   });
  }

  await recordRevision({userId,parentModel:"Project",record:project,displayIdFields:["projectId"],titleFields:["title"],contentFields:["description"]});

  res.json({
   success:true,
   data:project
  });
 }catch(error){
  const status=error.code===11000?409:400;

  res.status(status).json({
   success:false,
   message:error.code===11000
    ?"A project with that code already exists"
    :error.message
  });
 }
};

export const archiveProject=async(req,res)=>{
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
    message:"Invalid project ID"
   });
  }

  const project=await populateProject(
   Project.findOneAndUpdate(
    {
     _id:req.params.id,
     userId
    },
    {
     status:"archived",
     isArchived:true
    },
    {
     returnDocument:"after",
     runValidators:true
    }
   )
  );

  if(!project){
   return res.status(404).json({
    success:false,
    message:"Project not found"
   });
  }

  res.json({
   success:true,
   data:project
  });
 }catch(error){
  res.status(400).json({
   success:false,
   message:error.message
  });
 }
};

export const toggleFavoriteProject=async(req,res)=>{
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
    message:"Invalid project ID"
   });
  }

  const existingProject=await Project.findOne({
   _id:req.params.id,
   userId
  });

  if(!existingProject){
   return res.status(404).json({
    success:false,
    message:"Project not found"
   });
  }

  const project=await populateProject(
   Project.findOneAndUpdate(
    {
     _id:req.params.id,
     userId
    },
    {
     isFavorite:!existingProject.isFavorite
    },
    {
     returnDocument:"after",
     runValidators:true
    }
   )
  );

  res.json({
   success:true,
   data:project
  });
 }catch(error){
  res.status(400).json({
   success:false,
   message:error.message
  });
 }
};

export const deleteProject=async(req,res)=>{
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
    message:"Invalid project ID"
   });
  }

  const project=await Project.findOneAndDelete({
   _id:req.params.id,
   userId
  });

  if(!project){
   return res.status(404).json({
    success:false,
    message:"Project not found"
   });
  }

  res.json({
   success:true,
   message:"Project deleted"
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};

export const restoreProject=async(req,res)=>{
 try{
  const userId=getUserId(req);
  if(!userId)return res.status(400).json({success:false,message:"A valid user is required"});
  if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({success:false,message:"Invalid project ID"});
  const project=await populateProject(Project.findOneAndUpdate(
   {_id:req.params.id,userId},
   {status:"active",isArchived:false},
   {returnDocument:"after",runValidators:true}
  ));
  if(!project)return res.status(404).json({success:false,message:"Project not found"});
  return res.json({success:true,data:project});
 }catch(error){
  return res.status(400).json({success:false,message:error.message});
 }
};
