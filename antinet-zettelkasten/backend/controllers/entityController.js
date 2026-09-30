import mongoose from "mongoose";
import Entity from "../models/entityModel.js";
import {generateRecordId,toCode,toSubjectCode} from "../utils/recordId.js";
import {recordRevision} from "../utils/recordRevision.js";

const getUserId=req=>{
 const userId=req.user?._id||req.body?.userId||req.query?.userId||"";
 return mongoose.isValidObjectId(userId)?userId:"";
};

const getObjectId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 return value._id?.$oid||value.id?.$oid||value._id||value.id||value.$oid||"";
};

const normalizeObjectId=value=>{
 const objectId=getObjectId(value);
 return mongoose.isValidObjectId(objectId)?objectId:null;
};

const normalizeStringArray=value=>{
 if(Array.isArray(value))return value.map(item=>String(item||"").trim()).filter(Boolean);
 return String(value||"").split(",").map(item=>item.trim()).filter(Boolean);
};

const normalizeObjectIdArray=value=>{
 const values=Array.isArray(value)?value:String(value||"").split(",");
 return values.map(getObjectId).filter(item=>mongoose.isValidObjectId(item));
};

const normalizeTypeData=value=>{
 if(!value||typeof value!=="object"||Array.isArray(value))return {};
 return Object.fromEntries(Object.entries(value)
  .map(([key,fieldValue])=>[
   String(key||"").trim().replace(/[^a-zA-Z0-9]/g,"").slice(0,64),
   String(fieldValue||"").trim().slice(0,20000)
  ])
  .filter(([key,fieldValue])=>key&&fieldValue));
};

const escapeRegex=value=>String(value||"").replace(/[.*+?^${}()|[\]\\]/g,"\\$&");

const buildEntityPayload=(body,partial=false)=>{
 const payload={};
 if(!partial||Object.prototype.hasOwnProperty.call(body,"domainId"))payload.domainId=normalizeObjectId(body.domainId);

 if(!partial||Object.prototype.hasOwnProperty.call(body,"projectId")||Object.prototype.hasOwnProperty.call(body,"projectIds")){
  const projectIds=[...new Set(normalizeObjectIdArray(body.projectIds||body.projectId))];
  payload.projectId=normalizeObjectId(body.projectId)||projectIds[0]||null;
  payload.projectIds=[...new Set([payload.projectId,...projectIds].filter(Boolean).map(String))];
 }
 if(!partial||Object.prototype.hasOwnProperty.call(body,"name"))payload.name=String(body.name||"").trim();
 if(!partial||Object.prototype.hasOwnProperty.call(body,"entityType"))payload.entityType=toCode(body.entityType);
 if(!partial||Object.prototype.hasOwnProperty.call(body,"code"))payload.code=toCode(body.code);
 if(!partial||Object.prototype.hasOwnProperty.call(body,"description"))payload.description=String(body.description||"").trim();
 if(!partial||Object.prototype.hasOwnProperty.call(body,"roleUse"))payload.roleUse=String(body.roleUse||"").trim();
 if(!partial||Object.prototype.hasOwnProperty.call(body,"aliases"))payload.aliases=normalizeStringArray(body.aliases);
 if(!partial||Object.prototype.hasOwnProperty.call(body,"typeData"))payload.typeData=normalizeTypeData(body.typeData);
 if(!partial||Object.prototype.hasOwnProperty.call(body,"relatedSourceIds"))payload.relatedSourceIds=normalizeObjectIdArray(body.relatedSourceIds);
 if(!partial||Object.prototype.hasOwnProperty.call(body,"linkedZettelIds"))payload.linkedZettelIds=normalizeObjectIdArray(body.linkedZettelIds);
 if(!partial||Object.prototype.hasOwnProperty.call(body,"linkedOutputIds"))payload.linkedOutputIds=normalizeObjectIdArray(body.linkedOutputIds);
 if(!partial||Object.prototype.hasOwnProperty.call(body,"linkedSources"))payload.linkedSources=normalizeObjectIdArray(body.linkedSources);
 if(!partial||Object.prototype.hasOwnProperty.call(body,"linkedZettels"))payload.linkedZettels=normalizeObjectIdArray(body.linkedZettels);
 if(!partial||Object.prototype.hasOwnProperty.call(body,"linkedOutputs"))payload.linkedOutputs=normalizeObjectIdArray(body.linkedOutputs);
 if(!partial||Object.prototype.hasOwnProperty.call(body,"tags"))payload.tags=normalizeStringArray(body.tags);
 if(!partial||Object.prototype.hasOwnProperty.call(body,"status"))payload.status=body.status||"active";

 return payload;
};

const populateEntity=query=>{
 return query
  .populate("domainId","name code status")
  .populate("projectId","projectId title code")
  .populate("projectIds","projectId title code")
  .populate("relatedSourceIds","sourceId title subtype")
  .populate("linkedZettelIds","zettelId title status")
  .populate("linkedOutputIds","outputId title outputType status")
  .populate("linkedSources","sourceId title subtype")
  .populate("linkedZettels","zettelId title status")
  .populate("linkedOutputs","outputId title outputType status");
};

export const getEntities=async(req,res)=>{
 try{
  const userId=getUserId(req);
  if(!userId)return res.status(400).json({success:false,message:"A valid user is required"});

  const {projectId,entityType,status,search}=req.query;
  const filter={userId};

  if(projectId){
   if(!mongoose.isValidObjectId(projectId))return res.status(400).json({success:false,message:"Invalid project ID"});
   filter.$or=[{projectId},{projectIds:projectId}];
  }

  if(entityType)filter.entityType=toCode(entityType);
  if(status)filter.status=status;

  if(search){
   const searchText=escapeRegex(search);

   filter.$or=[
    {entityId:{$regex:searchText,$options:"i"}},
    {name:{$regex:searchText,$options:"i"}},
    {entityType:{$regex:searchText,$options:"i"}},
    {code:{$regex:searchText,$options:"i"}},
    {description:{$regex:searchText,$options:"i"}},
    {roleUse:{$regex:searchText,$options:"i"}},
    {aliases:{$regex:searchText,$options:"i"}},
    {tags:{$regex:searchText,$options:"i"}}
   ];
  }

  const entities=await populateEntity(Entity.find(filter)).sort({name:1});
  res.json({success:true,data:entities});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const getEntityById=async(req,res)=>{
 try{
  const userId=getUserId(req);
  if(!userId)return res.status(400).json({success:false,message:"A valid user is required"});
  if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({success:false,message:"Invalid entity ID"});

  const entity=await populateEntity(Entity.findOne({_id:req.params.id,userId}));
  if(!entity)return res.status(404).json({success:false,message:"Entity not found"});

  res.json({success:true,data:entity});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const createEntity=async(req,res)=>{
 try{
  const userId=getUserId(req);
  if(!userId)return res.status(400).json({success:false,message:"A valid user is required to create an entity"});

  const payload=buildEntityPayload(req.body);

  if(!payload.name)return res.status(400).json({success:false,message:"Entity name is required"});
  if(!payload.entityType)return res.status(400).json({success:false,message:"Entity type is required"});

  const entityId=await generateRecordId({
   userId,
   recordType:"ENT",
   domainId:payload.domainId,
   projectId:payload.projectId,
   subtype:payload.entityType,
   subjectCode:payload.code||toSubjectCode(payload.name)
  });

  let entity=await Entity.create({...payload,userId,entityId});
  entity=await populateEntity(Entity.findById(entity._id));

  res.status(201).json({success:true,data:entity});
 }catch(error){
  res.status(error.code===11000?409:400).json({
   success:false,
   message:error.code===11000?"That entity ID already exists":error.message
  });
 }
};

export const updateEntity=async(req,res)=>{
 try{
  const userId=getUserId(req);
  if(!userId)return res.status(400).json({success:false,message:"A valid user is required"});
  if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({success:false,message:"Invalid entity ID"});

  const updates=buildEntityPayload(req.body,true);
  const existingEntity=await Entity.findOne({_id:req.params.id,userId});
  if(!existingEntity)return res.status(404).json({success:false,message:"Entity not found"});

  if(Object.prototype.hasOwnProperty.call(updates,"name")&&!updates.name){
   return res.status(400).json({success:false,message:"Entity name is required"});
  }

  if(Object.prototype.hasOwnProperty.call(updates,"entityType")&&!updates.entityType){
   return res.status(400).json({success:false,message:"Entity type is required"});
  }

  const usesCurrentIdFormat=/-\d{8}-\d{3}$/.test(existingEntity.entityId);
  const domainChanged=Object.prototype.hasOwnProperty.call(req.body,"domainId")&&String(updates.domainId||"")!==String(existingEntity.domainId||"");
  if(!usesCurrentIdFormat||domainChanged){
   updates.entityId=await generateRecordId({
    userId,
    recordType:"ENT",
    domainId:updates.domainId??existingEntity.domainId,
    existingId:existingEntity.entityId,
    recordDate:existingEntity.createdAt,
    projectId:updates.projectId??existingEntity.projectId,
    subtype:updates.entityType||existingEntity.entityType,
    subjectCode:updates.code||existingEntity.code||toSubjectCode(updates.name||existingEntity.name)
   });
  }

  const entity=await populateEntity(
   Entity.findOneAndUpdate(
    {_id:req.params.id,userId},
    updates,
    {returnDocument:"after",runValidators:true}
   )
  );

  if(!entity)return res.status(404).json({success:false,message:"Entity not found"});
  await recordRevision({userId,parentModel:"Entity",record:entity,displayIdFields:["entityId"],titleFields:["name"],contentFields:["description","roleUse"]});
  res.json({success:true,data:entity});
 }catch(error){
  res.status(400).json({success:false,message:error.message});
 }
};

export const archiveEntity=async(req,res)=>{
 try{
  const userId=getUserId(req);
  if(!userId)return res.status(400).json({success:false,message:"A valid user is required"});
  if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({success:false,message:"Invalid entity ID"});

  const entity=await populateEntity(
   Entity.findOneAndUpdate(
    {_id:req.params.id,userId},
    {status:"archived"},
    {returnDocument:"after",runValidators:true}
   )
  );

  if(!entity)return res.status(404).json({success:false,message:"Entity not found"});
  res.json({success:true,data:entity});
 }catch(error){
  res.status(400).json({success:false,message:error.message});
 }
};

export const deleteEntity=async(req,res)=>{
 try{
  const userId=getUserId(req);
  if(!userId)return res.status(400).json({success:false,message:"A valid user is required"});
  if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({success:false,message:"Invalid entity ID"});

  const entity=await Entity.findOneAndDelete({_id:req.params.id,userId});
  if(!entity)return res.status(404).json({success:false,message:"Entity not found"});

  res.json({success:true,message:"Entity deleted"});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};
