import mongoose from "mongoose";
import Connection from "../models/connectionModel.js";
import FleetingNote from "../models/fleetingNoteModel.js";
import Source from "../models/sourceModel.js";
import Entity from "../models/entityModel.js";
import Zettel from "../models/zettelModel.js";
import StructureNote from "../models/structureNoteModel.js";
import Output from "../models/outputModel.js";
import Project from "../models/projectModel.js";
import {generateRecordId} from "../utils/recordId.js";
import {recordRevision} from "../utils/recordRevision.js";

// Helper: return the authenticated or supplied user ID
const getUserId=req=>{
 const userId=req.user?._id||req.body?.userId||req.query?.userId||"";
 return mongoose.isValidObjectId(userId)?userId:"";
};

// Helper: normalize record type values to application prefixes
const normalizeRecordType=value=>{
 const recordType=String(value||"")
  .trim()
  .replace(/[\s_-]/g,"")
  .toUpperCase();

 const recordTypes={
  FLT:"FLT",
  FLEETING:"FLT",
  FLEETINGNOTE:"FLT",
  SRC:"SRC",
  SOURCE:"SRC",
  ENT:"ENT",
  ENTITY:"ENT",
  ZTL:"ZTL",
  ZETTEL:"ZTL",
  LNK:"LNK",
  CONNECTION:"LNK",
  STR:"STR",
  STRUCTURE:"STR",
  STRUCTURENOTE:"STR",
  OUT:"OUT",
  OUTPUT:"OUT",
  PRJ:"PRJ",
  PROJECT:"PRJ"
 };

 return recordTypes[recordType]||recordType;
};

// Helper: normalize ObjectId values
const normalizeObjectId=value=>{
 if(!value)return null;

 const objectId=typeof value==="object"
  ?value._id||value.id||value.$oid
  :value;

 return mongoose.isValidObjectId(objectId)?objectId:null;
};

const normalizeObjectIds=value=>[
 ...new Set((Array.isArray(value)?value:[value]).map(normalizeObjectId).filter(Boolean).map(String))
];

const normalizeStringArray=value=>[
 ...new Set((Array.isArray(value)?value:String(value||"").split(",")).map(item=>String(item||"").trim()).filter(Boolean))
];

// Helper: find one connection endpoint by record type and authenticated owner
const findConnectionEndpoint=(recordType,recordId,userId)=>{
 const models={
  FLT:FleetingNote,
  SRC:Source,
  ENT:Entity,
  ZTL:Zettel,
  STR:StructureNote,
  OUT:Output,
  PRJ:Project
 };

 const Model=models[normalizeRecordType(recordType)];
 return Model?Model.findOne({_id:recordId,userId}).select("_id"):null;
};

// Helper: escape text used in MongoDB regular expressions
const escapeRegex=value=>{
 return String(value||"").replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
};

// Helper: build the Connection model payload
const buildConnectionPayload=(body,partial=false)=>{
 const payload={};
 if(!partial||Object.prototype.hasOwnProperty.call(body,"domainId"))payload.domainId=normalizeObjectId(body.domainId);

 const hasField=field=>{
  return Object.prototype.hasOwnProperty.call(body,field);
 };

 if(!partial||hasField("fromRecord")||hasField("fromRecordId")){
  payload.fromRecord=normalizeObjectId(
   hasField("fromRecord")
    ?body.fromRecord
    :body.fromRecordId
  );
 }

 if(!partial||hasField("projectId")||hasField("projectIds")){
  const projectIds=normalizeObjectIds(hasField("projectIds")?body.projectIds:body.projectId);
  const primaryProjectId=normalizeObjectId(body.projectId)||projectIds[0]||null;
  payload.projectId=primaryProjectId;
  payload.projectIds=normalizeObjectIds([primaryProjectId,...projectIds]);
 }

 if(!partial||hasField("fromRecordType")||hasField("fromModel")){
  payload.fromRecordType=normalizeRecordType(
   hasField("fromRecordType")
    ?body.fromRecordType
    :body.fromModel
  );
 }

 if(!partial||hasField("toRecord")||hasField("toRecordId")){
  payload.toRecord=normalizeObjectId(
   hasField("toRecord")
    ?body.toRecord
    :body.toRecordId
  );
 }

 if(!partial||hasField("toRecordType")||hasField("toModel")){
  payload.toRecordType=normalizeRecordType(
   hasField("toRecordType")
    ?body.toRecordType
    :body.toModel
  );
 }

 if(!partial||hasField("relation")||hasField("relationType")){
  payload.relation=String(
   hasField("relation")
    ?body.relation
    :body.relationType||""
  )
   .trim()
   .toLowerCase();
 }

 if(!partial||hasField("reason")){
  payload.reason=String(body.reason||"").trim();
 }

 if(!partial||hasField("strength")){
  payload.strength=String(body.strength||"medium")
   .trim()
   .toLowerCase();
 }

 if(!partial||hasField("status")){
  payload.status=String(body.status||"active")
   .trim()
   .toLowerCase();
 }

 if(!partial||hasField("tags")){
  payload.tags=normalizeStringArray(body.tags);
 }

 return payload;
};

// Helper: validate required connection endpoints and meaning
const validateConnectionPayload=(payload,{requireProject=false}={})=>{
 if(requireProject&&!payload.projectId){
  return "A project or topic is required";
 }

 if(!payload.fromRecord){
  return "A valid source record is required";
 }

 if(!payload.fromRecordType){
  return "Source record type is required";
 }

 if(!payload.toRecord){
  return "A valid destination record is required";
 }

 if(!payload.toRecordType){
  return "Destination record type is required";
 }

 if(
  String(payload.fromRecord)===String(payload.toRecord)&&
  payload.fromRecordType===payload.toRecordType
 ){
  return "A record cannot be connected to itself";
 }

 if(!payload.relation){
  return "Connection relation is required";
 }

 if(!payload.reason){
  return "Connection reason is required";
 }

 return "";
};

export const getConnections=async(req,res)=>{
 try{
  const userId=getUserId(req);

  if(!userId){
   return res.status(400).json({
    success:false,
    message:"A valid user is required"
   });
  }

  const fromRecord=req.query.fromRecord||req.query.fromRecordId;
  const toRecord=req.query.toRecord||req.query.toRecordId;
  const fromRecordType=req.query.fromRecordType||req.query.fromModel;
  const toRecordType=req.query.toRecordType||req.query.toModel;
  const {
   recordId,
   relation,
   relationType,
   strength,
   status,
   search
  }=req.query;

  const filter={userId};

  if(fromRecord){
   if(!mongoose.isValidObjectId(fromRecord)){
    return res.status(400).json({
     success:false,
     message:"Invalid source record ID"
    });
   }

   filter.fromRecord=fromRecord;
  }

  if(toRecord){
   if(!mongoose.isValidObjectId(toRecord)){
    return res.status(400).json({
     success:false,
     message:"Invalid destination record ID"
    });
   }

   filter.toRecord=toRecord;
  }

  if(fromRecordType){
   filter.fromRecordType=normalizeRecordType(fromRecordType);
  }

  if(toRecordType){
   filter.toRecordType=normalizeRecordType(toRecordType);
  }

  if(recordId){
   if(!mongoose.isValidObjectId(recordId)){
    return res.status(400).json({
     success:false,
     message:"Invalid connected record ID"
    });
   }

   filter.$or=[
    {fromRecord:recordId},
    {toRecord:recordId}
   ];
  }

  if(relation||relationType){
   filter.relation=String(relation||relationType)
    .trim()
    .toLowerCase();
  }

  if(strength){
   filter.strength=String(strength).trim().toLowerCase();
  }

  if(status){
   filter.status=String(status).trim().toLowerCase();
  }

  if(search){
   const searchText=escapeRegex(search);
   const searchFilter=[
    {connectionId:{$regex:searchText,$options:"i"}},
    {fromRecordType:{$regex:searchText,$options:"i"}},
    {toRecordType:{$regex:searchText,$options:"i"}},
    {relation:{$regex:searchText,$options:"i"}},
    {reason:{$regex:searchText,$options:"i"}},
    {strength:{$regex:searchText,$options:"i"}}
   ];

   if(filter.$or){
    filter.$and=[
     {$or:filter.$or},
     {$or:searchFilter}
    ];

    delete filter.$or;
   }else{
    filter.$or=searchFilter;
   }
  }

  const connections=await Connection.find(filter).populate("domainId","name code status").populate("projectId","projectId title code status").populate("projectIds","projectId title code status")
   .sort({createdAt:-1});

  res.json({
   success:true,
   data:connections
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};

export const getConnectionById=async(req,res)=>{
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
    message:"Invalid connection ID"
   });
  }

  const connection=await Connection.findOne({
   _id:req.params.id,
   userId
  }).populate("domainId","name code status").populate("projectId","projectId title code status").populate("projectIds","projectId title code status");

  if(!connection){
   return res.status(404).json({
    success:false,
    message:"Connection not found"
   });
  }

  res.json({
   success:true,
   data:connection
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};

export const createConnection=async(req,res)=>{
 try{
  const userId=getUserId(req);

  if(!userId){
   return res.status(400).json({
    success:false,
    message:"A valid user is required to create a connection"
   });
  }

  const payload=buildConnectionPayload(req.body);
  const validationError=validateConnectionPayload(payload);

  if(validationError){
   return res.status(400).json({
    success:false,
    message:validationError
   });
  }

  const fromRecord=await findConnectionEndpoint(payload.fromRecordType,payload.fromRecord,userId);
  const toRecord=await findConnectionEndpoint(payload.toRecordType,payload.toRecord,userId);

  if(!fromRecord||!toRecord){
   return res.status(400).json({
    success:false,
    message:"Both connection endpoints must be existing records owned by the current user"
   });
  }

  const connectionId=await generateRecordId({
   userId,
   recordType:"LNK",
   domainId:payload.domainId,
   projectId:payload.projectId,
   subtype:payload.relation,
   subjectCode:req.body.subjectCode
  });

  const connection=await Connection.create({
   ...payload,
   userId,
   connectionId
  });

  res.status(201).json({
   success:true,
   data:connection
  });
 }catch(error){
  res.status(400).json({
   success:false,
   message:error.message
  });
 }
};

export const updateConnection=async(req,res)=>{
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
    message:"Invalid connection ID"
   });
  }

  const existingConnection=await Connection.findOne({
   _id:req.params.id,
   userId
  });

  if(!existingConnection){
   return res.status(404).json({
    success:false,
    message:"Connection not found"
   });
  }

  const updates=buildConnectionPayload(req.body,true);

  const validationPayload={
   projectId:Object.prototype.hasOwnProperty.call(updates,"projectId")
    ?updates.projectId
    :existingConnection.projectId,
   fromRecord:Object.prototype.hasOwnProperty.call(updates,"fromRecord")
    ?updates.fromRecord
    :existingConnection.fromRecord,
   fromRecordType:Object.prototype.hasOwnProperty.call(updates,"fromRecordType")
    ?updates.fromRecordType
    :existingConnection.fromRecordType,
   toRecord:Object.prototype.hasOwnProperty.call(updates,"toRecord")
    ?updates.toRecord
    :existingConnection.toRecord,
   toRecordType:Object.prototype.hasOwnProperty.call(updates,"toRecordType")
    ?updates.toRecordType
    :existingConnection.toRecordType,
   relation:Object.prototype.hasOwnProperty.call(updates,"relation")
    ?updates.relation
    :existingConnection.relation,
   reason:Object.prototype.hasOwnProperty.call(updates,"reason")
    ?updates.reason
    :existingConnection.reason
  };

  const validationError=validateConnectionPayload(validationPayload,{requireProject:false});

  if(validationError){
   return res.status(400).json({
    success:false,
    message:validationError
   });
  }

  const fromRecord=await findConnectionEndpoint(validationPayload.fromRecordType,validationPayload.fromRecord,userId);
  const toRecord=await findConnectionEndpoint(validationPayload.toRecordType,validationPayload.toRecord,userId);

  if(!fromRecord||!toRecord){
   return res.status(400).json({
    success:false,
    message:"Both connection endpoints must be existing records owned by the current user"
   });
  }

  if(Object.prototype.hasOwnProperty.call(updates,"domainId")&&String(updates.domainId||"")!==String(existingConnection.domainId||"")){
   updates.connectionId=await generateRecordId({userId,recordType:"LNK",domainId:updates.domainId,
    projectId:validationPayload.projectId,subtype:validationPayload.relation,subjectCode:req.body.subjectCode,
    existingId:existingConnection.connectionId,recordDate:existingConnection.createdAt});
  }

  const connection=await Connection.findOneAndUpdate(
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

  await recordRevision({userId,parentModel:"Connection",record:connection,displayIdFields:["connectionId"],titleFields:["relation"],contentFields:["reason"]});

  res.json({
   success:true,
   data:connection
  });
 }catch(error){
  res.status(400).json({
   success:false,
   message:error.message
  });
 }
};

export const archiveConnection=async(req,res)=>{
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
    message:"Invalid connection ID"
   });
  }

  const connection=await Connection.findOneAndUpdate(
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

  if(!connection){
   return res.status(404).json({
    success:false,
    message:"Connection not found"
   });
  }

  res.json({
   success:true,
   data:connection
  });
 }catch(error){
  res.status(400).json({
   success:false,
   message:error.message
  });
 }
};

export const deleteConnection=async(req,res)=>{
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
    message:"Invalid connection ID"
   });
  }

  const connection=await Connection.findOneAndDelete({
   _id:req.params.id,
   userId
  });

  if(!connection){
   return res.status(404).json({
    success:false,
    message:"Connection not found"
   });
  }

  res.json({
   success:true,
   message:"Connection deleted"
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};
