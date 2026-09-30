// backend/controllers/fleetingNoteController.js
import mongoose from "mongoose";
import FleetingNote from "../models/fleetingNoteModel.js";
import IdSequence from "../models/idSequenceModel.js";
import {generateRecordId,toCode,toSubjectCode} from "../utils/recordId.js";
import Zettel from "../models/zettelModel.js";
import Source from "../models/sourceModel.js";
import Entity from "../models/entityModel.js";
import StructureNote from "../models/structureNoteModel.js";
import Output from "../models/outputModel.js";
import RecordSubtype from "../models/recordSubtypeModel.js";
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

const normalizeArray=value=>{
 if(Array.isArray(value))return value.map(item=>typeof item==="object"?item?._id||item?.id||"":item).map(item=>String(item||"").trim()).filter(Boolean);
 return String(value||"").split(",").map(item=>item.trim()).filter(Boolean);
};

const normalizeNotes=value=>{
 if(Array.isArray(value))return value.map(item=>String(item||"").trim()).filter(Boolean);
 return String(value||"").split(/\r?\n/).map(item=>item.trim()).filter(Boolean);
};

const notesText=value=>normalizeNotes(value).join("\n");
const normalizeObjectIdArray=value=>normalizeArray(value).filter(item=>mongoose.isValidObjectId(item));
const normalizeObjectId=value=>{const objectId=getObjectId(value);return mongoose.isValidObjectId(objectId)?objectId:null;};
const normalizeBoolean=value=>value===true||value==="true"||value===1||value==="1"||value==="on";
const normalizeDate=value=>{const date=new Date(value);return value&&!Number.isNaN(date.getTime())?date:null;};
const escapeRegex=value=>String(value||"").replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
const richTextToPlainText=value=>String(value||"")
 .replace(/<br\s*\/?\s*>/gi,"\n")
 .replace(/<\/p>|<\/div>|<\/li>|<\/h[1-6]>/gi,"\n")
 .replace(/<[^>]*>/g,"")
 .replace(/&nbsp;/gi," ")
 .replace(/&amp;/gi,"&")
 .replace(/&lt;/gi,"<")
 .replace(/&gt;/gi,">")
 .replace(/&quot;/gi,"\"")
 .replace(/&#39;/gi,"'")
 .replace(/\s+/g," ")
 .trim();
const getDateCode=value=>{const date=value?new Date(value):new Date();return `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,"0")}${String(date.getDate()).padStart(2,"0")}`;};
const toTopicCode=value=>String(value||"").trim().toUpperCase().replace(/[^A-Z0-9]+/g,"").slice(0,24);

const generateFleetingNoteId=async({userId,domainId=null,projectId=null,projectCode,subtypeCode,subjectCode,existingId="",recordDate=null})=>generateRecordId({
 userId,
 recordType:"FLT",
 domainId,
 projectId,
 projectCode:toTopicCode(projectCode),
 subtypeCode,
 subjectCode,
 existingId,
 recordDate
});

const getFleetingBucketCode=note=>({
 projectCode:toTopicCode(note.topic||note.projectId?.code||getDateCode(note.createdAt)),
 subtypeCode:toCode(note.captureType||"IDEA"),
 subjectCode:toCode(note.subjectCode||getDateCode(note.createdAt))
});

const syncFleetingSequence=async({userId,projectCode,subtypeCode,subjectCode})=>{
 const notes=await FleetingNote.find({userId})
  .populate("projectId","code")
  .select("topic projectId captureType subjectCode createdAt")
  .lean();

 const count=notes.filter(note=>{
  const code=getFleetingBucketCode(note);

  return (
   code.projectCode===projectCode&&
   code.subtypeCode===subtypeCode&&
   code.subjectCode===subjectCode
  );
 }).length;

 await IdSequence.findOneAndUpdate(
  {
   userId,
   recordType:"FLT",
   projectCode,
   subtypeCode,
   subjectCode
  },
  {$set:{nextNumber:count+1}},
  {upsert:true,runValidators:true}
 );
};

const resolveSubtype=async(userId,recordType,value)=>{
 const objectId=getObjectId(value);
 const filter={userId,recordType,status:"active"};

 if(mongoose.isValidObjectId(objectId))filter._id=objectId;
 else if(value?.code||value)filter.code=toCode(value?.code||value);
 else return null;

 return RecordSubtype.findOne(filter);
};

export const getFleetingNotes=async(req,res)=>{
 try{
  const userId=getUserId(req);
  if(!userId)return res.status(400).json({success:false,message:"A valid user is required"});

  const {status,captureType,possibleProject,processLaterAs,search,includeProcessed}=req.query;
  const filter={userId};

  if(status)filter.status=status;
  if(captureType)filter.captureType=captureType;
  if(possibleProject)filter.possibleProject=possibleProject;
  if(processLaterAs)filter.processLaterAs=toCode(processLaterAs);
  if(!status&&includeProcessed!=="true")filter.hideFromInbox={$ne:true};

  if(search){
   const searchText=escapeRegex(search);
   filter.$or=[
    {fleetingNoteId:{$regex:searchText,$options:"i"}},
    {rawCapture:{$regex:searchText,$options:"i"}},
    {captureType:{$regex:searchText,$options:"i"}},
    {possibleProject:{$regex:searchText,$options:"i"}},
    {processLaterAs:{$regex:searchText,$options:"i"}},
    {notes:{$regex:searchText,$options:"i"}},
    {processedInto:{$regex:searchText,$options:"i"}}
   ];
  }

  const notes=await FleetingNote.find(filter).populate("domainId","name code status").populate("projectId","projectId title code status").populate("projectIds","projectId title code status").sort({createdAt:-1});
  res.json({success:true,data:notes});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const getFleetingNoteById=async(req,res)=>{
 try{
  const userId=getUserId(req);
  if(!userId)return res.status(400).json({success:false,message:"A valid user is required"});
  if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({success:false,message:"Invalid fleeting note ID"});

  const note=await FleetingNote.findOne({_id:req.params.id,userId}).populate("domainId","name code status").populate("projectId","projectId title code status").populate("projectIds","projectId title code status");
  if(!note)return res.status(404).json({success:false,message:"Fleeting note not found"});

  res.json({success:true,data:note});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const createFleetingNote=async(req,res)=>{
 try{
  const userId=getUserId(req);
  if(!userId)return res.status(400).json({success:false,message:"A valid user is required to create a fleeting note"});

  const rawCapture=String(req.body.rawCapture||"").trim();
  const captureType=toCode(req.body.captureType||"IDEA");

  if(!rawCapture)return res.status(400).json({success:false,message:"Raw capture is required"});

  const projectIds=[...new Set(normalizeObjectIdArray(req.body.projectIds||req.body.projectId))];
  const projectId=normalizeObjectId(req.body.projectId)||projectIds[0]||null;
  const topic=String(req.body.topic||"").trim();
  const subjectCode=toCode(req.body.subjectCode||getDateCode());
  const fleetingNoteId=await generateFleetingNoteId({
   userId,
   domainId:req.body.domainId,
   projectId,
   projectCode:projectId?"":req.body.projectCode||topic||"GENERAL",
   subtypeCode:captureType,
   subjectCode
  });

  const note=await FleetingNote.create({
   userId,
   domainId:normalizeObjectId(req.body.domainId),
   projectId,
   projectIds:[...new Set([projectId,...projectIds].filter(Boolean).map(String))],
   topic,
   fleetingNoteId,
   rawCapture,
   captureType,
   subjectCode,
   possibleProject:normalizeArray(req.body.possibleProject),
   processLaterAs:toCode(req.body.processLaterAs),
   notes:normalizeNotes(req.body.notes),
   status:req.body.status||"active",
   processedInto:String(req.body.processedInto||"").trim(),
   hideFromInbox:normalizeBoolean(req.body.hideFromInbox)
  });

  res.status(201).json({success:true,data:note});
 }catch(error){
  res.status(error.code===11000?409:400).json({
   success:false,
   message:error.code===11000?"That fleeting note ID already exists":error.message
  });
 }
};

export const updateFleetingNote=async(req,res)=>{
 try{
  const userId=getUserId(req);
  if(!userId)return res.status(400).json({success:false,message:"A valid user is required"});
  if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({success:false,message:"Invalid fleeting note ID"});

  const existingNote=await FleetingNote.findOne({_id:req.params.id,userId});
  if(!existingNote)return res.status(404).json({success:false,message:"Fleeting note not found"});

  const updates={};
  if(Object.prototype.hasOwnProperty.call(req.body,"domainId"))updates.domainId=normalizeObjectId(req.body.domainId);

  if(Object.prototype.hasOwnProperty.call(req.body,"rawCapture")){
   updates.rawCapture=String(req.body.rawCapture||"").trim();
   if(!updates.rawCapture)return res.status(400).json({success:false,message:"Raw capture is required"});
  }

  if(Object.prototype.hasOwnProperty.call(req.body,"captureType"))updates.captureType=toCode(req.body.captureType||"IDEA");
  if(Object.prototype.hasOwnProperty.call(req.body,"projectId")||Object.prototype.hasOwnProperty.call(req.body,"projectIds")){
   const projectIds=[...new Set(normalizeObjectIdArray(req.body.projectIds||req.body.projectId))];
   updates.projectId=normalizeObjectId(req.body.projectId)||projectIds[0]||null;
   updates.projectIds=[...new Set([updates.projectId,...projectIds].filter(Boolean).map(String))];
  }
  if(Object.prototype.hasOwnProperty.call(req.body,"topic"))updates.topic=String(req.body.topic||"").trim();
  if(Object.prototype.hasOwnProperty.call(req.body,"subjectCode"))updates.subjectCode=toCode(req.body.subjectCode);
  if(Object.prototype.hasOwnProperty.call(req.body,"possibleProject"))updates.possibleProject=normalizeArray(req.body.possibleProject);
  if(Object.prototype.hasOwnProperty.call(req.body,"processLaterAs"))updates.processLaterAs=toCode(req.body.processLaterAs);
  if(Object.prototype.hasOwnProperty.call(req.body,"notes"))updates.notes=normalizeNotes(req.body.notes);
  if(Object.prototype.hasOwnProperty.call(req.body,"status"))updates.status=req.body.status;
  if(Object.prototype.hasOwnProperty.call(req.body,"processedInto"))updates.processedInto=String(req.body.processedInto||"").trim();
  if(Object.prototype.hasOwnProperty.call(req.body,"hideFromInbox"))updates.hideFromInbox=normalizeBoolean(req.body.hideFromInbox);

  const nextProjectId=updates.projectId??existingNote.projectId;
  const nextProjectCode=toTopicCode(nextProjectId?"":req.body.projectCode||updates.topic||existingNote.topic||"GENERAL");
  const nextSubtypeCode=toCode(updates.captureType||existingNote.captureType);
  const nextSubjectCode=toCode(updates.subjectCode||existingNote.subjectCode||getDateCode());

  const idInputsChanged=["domainId","projectId","projectIds","projectCode","topic","captureType","subjectCode"]
   .some(field=>Object.prototype.hasOwnProperty.call(req.body,field));
  if(nextProjectCode&&nextSubtypeCode&&(idInputsChanged||!/-\d{8}-\d{3}$/.test(existingNote.fleetingNoteId))){
   updates.fleetingNoteId=await generateFleetingNoteId({
    userId,
    domainId:updates.domainId??existingNote.domainId,
    projectId:nextProjectId,
    projectCode:nextProjectCode,
    subtypeCode:nextSubtypeCode,
    subjectCode:nextSubjectCode,
    existingId:existingNote.fleetingNoteId,
    recordDate:existingNote.createdAt
   });
  }

  const note=await FleetingNote.findOneAndUpdate({_id:req.params.id,userId},updates,{returnDocument:"after",runValidators:true});

  if(nextProjectCode&&nextSubtypeCode){
   await syncFleetingSequence({
    userId,
    projectCode:nextProjectCode,
    subtypeCode:nextSubtypeCode,
    subjectCode:nextSubjectCode
   });
  }

  await recordRevision({userId,parentModel:"FleetingNote",record:note,displayIdFields:["fleetingNoteId"],titleFields:["topic"],contentFields:["rawCapture","notes"]});
  res.json({success:true,data:note});
 }catch(error){
  res.status(400).json({success:false,message:error.message});
 }
};

export const processFleetingNote=async(req,res)=>{
 try{
  const userId=getUserId(req);
  if(!userId)return res.status(400).json({success:false,message:"A valid user is required"});
  if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({success:false,message:"Invalid fleeting note ID"});

  const fleeting=await FleetingNote.findOne({_id:req.params.id,userId});
  if(!fleeting)return res.status(404).json({success:false,message:"Fleeting note not found"});
  const target=toCode(req.body.targetType||fleeting.processLaterAs||"ZTL");
  const title=richTextToPlainText(req.body.title||fleeting.rawCapture);
  const projectIds=[...new Set(normalizeObjectIdArray(req.body.projectIds||req.body.projectId))];
  const projectId=normalizeObjectId(req.body.projectId)||projectIds[0]||null;
  const projectCode=projectId?"":fleeting.topic||getDateCode(fleeting.createdAt);
  const tags=normalizeArray(req.body.tags);
  const captureNotes=notesText(fleeting.notes);
  let record;

  if(target==="ZTL"){
   const subtype=await resolveSubtype(userId,"ZTL",req.body.subtype);
   if(!subtype)return res.status(400).json({success:false,message:"Select a valid active Zettel subtype"});

   record=await Zettel.create({
    userId,
    projectId,
    projectIds:[...new Set([projectId,...projectIds].filter(Boolean).map(String))],
    zettelId:await generateRecordId({
     userId,
     recordType:"ZTL",
     projectId,
     subtype:subtype.code,
     subject:title
    }),
    title,
    subjectCode:toSubjectCode(title),
    mainIdea:String(req.body.mainIdea||fleeting.rawCapture).trim(),
    body:String(req.body.body||captureNotes||fleeting.rawCapture),
    subtype:[subtype._id],
    sourceIds:normalizeObjectIdArray(req.body.sourceIds),
    entityIds:normalizeObjectIdArray(req.body.entityIds),
    originFleetingNoteId:fleeting._id,
    futureUse:normalizeArray(req.body.futureUse),
    questions:normalizeArray(req.body.questions),
    tags,
    status:req.body.status||"active",
    isFavorite:normalizeBoolean(req.body.isFavorite)
   });
  }else if(target==="SRC"){
   const subtype=await resolveSubtype(userId,"SRC",req.body.subtype);
   if(!subtype)return res.status(400).json({success:false,message:"Select a valid active Source subtype"});

   record=await Source.create({
    userId,
    projectId,
    projectIds:[...new Set([projectId,...projectIds].filter(Boolean).map(String))],
    sourceId:await generateRecordId({
     userId,
     recordType:"SRC",
     projectId,
     projectCode,
     subtype:subtype.code,
     subject:title
    }),
    title,
    subtypeId:subtype._id,
    subtype:subtype.code,
    author:String(req.body.author||"").trim(),
    publisher:String(req.body.publisher||"").trim(),
    originalUrl:String(req.body.originalUrl||"").trim(),
    filePath:String(req.body.filePath||"").trim(),
    accessDate:normalizeDate(req.body.accessDate),
    archiveType:String(req.body.archiveType||"").trim(),
    archiveLocation:String(req.body.archiveLocation||"").trim(),
    copiedText:String(req.body.copiedText||req.body.body||fleeting.rawCapture),
    summary:String(req.body.summary||captureNotes||"").trim(),
    entityIds:normalizeObjectIdArray(req.body.entityIds),
    tags,
    status:req.body.status||"active"
   });
  }else if(target==="ENT"){
   const entityType=toCode(req.body.entityType);
   if(!entityType)return res.status(400).json({success:false,message:"Select an Entity type"});
   const name=String(req.body.name||title).trim();

   record=await Entity.create({
    userId,
    projectId,
    projectIds:[...new Set([projectId,...projectIds].filter(Boolean).map(String))],
    entityId:await generateRecordId({
     userId,
     recordType:"ENT",
     projectId,
     projectCode,
     subtype:entityType,
     subject:name
    }),
    name,
    entityType,
    code:String(req.body.code||"").trim(),
    description:String(req.body.description||req.body.body||captureNotes||fleeting.rawCapture).trim(),
    roleUse:String(req.body.roleUse||"").trim(),
    aliases:normalizeArray(req.body.aliases),
    relatedSourceIds:normalizeObjectIdArray(req.body.relatedSourceIds),
    linkedZettelIds:normalizeObjectIdArray(req.body.linkedZettelIds),
    linkedOutputIds:normalizeObjectIdArray(req.body.linkedOutputIds),
    linkedSources:normalizeObjectIdArray(req.body.linkedSources),
    linkedZettels:normalizeObjectIdArray(req.body.linkedZettels),
    linkedOutputs:normalizeObjectIdArray(req.body.linkedOutputs),
    tags,
    status:req.body.status||"active"
   });
  }else if(target==="STR"){
   const subtype=toCode(req.body.subtype);
   if(!subtype)return res.status(400).json({success:false,message:"Select a Structure type"});

   record=await StructureNote.create({
    userId,
    projectId,
    projectIds:[...new Set([projectId,...projectIds].filter(Boolean).map(String))],
    structureNoteId:await generateRecordId({
     userId,
     recordType:"STR",
     projectId,
     projectCode,
     subtype,
     subject:title
    }),
    subtype,
    title,
    purpose:String(req.body.purpose||captureNotes||"").trim(),
    summary:String(req.body.summary||"").trim(),
    zettelIds:normalizeObjectIdArray(req.body.zettelIds),
    sourceIds:normalizeObjectIdArray(req.body.sourceIds),
    entityIds:normalizeObjectIdArray(req.body.entityIds),
    outline:String(req.body.outline||req.body.body||fleeting.rawCapture),
    tags,
    status:req.body.status||"active",
    isFavorite:normalizeBoolean(req.body.isFavorite)
   });
  }else if(target==="OUT"){
   const outputType=toCode(req.body.outputType);
   if(!outputType)return res.status(400).json({success:false,message:"Select an Output type"});

   const outputPayload={
    userId,
    projectId,
    projectIds:[...new Set([projectId,...projectIds].filter(Boolean).map(String))],
    outputId:await generateRecordId({
     userId,
     recordType:"OUT",
     projectId,
     projectCode,
     subtype:outputType,
     subject:title
    }),
    title,
    outputType,
    description:String(req.body.description||captureNotes||"").trim(),
    body:String(req.body.body||fleeting.rawCapture),
    documentPath:String(req.body.documentPath||"").trim(),
    zettelIds:normalizeObjectIdArray(req.body.zettelIds),
    sourceIds:normalizeObjectIdArray(req.body.sourceIds),
    entityIds:normalizeObjectIdArray(req.body.entityIds),
    structureNoteIds:normalizeObjectIdArray(req.body.structureNoteIds),
    tags,
    status:req.body.status||"active",
    isFavorite:normalizeBoolean(req.body.isFavorite)
   };

   const existingOutput=
    fleeting.processLaterAs==="OUT"&&fleeting.processedInto
     ?await Output.findOne({userId,outputId:fleeting.processedInto})
     :null;

   if(existingOutput){
    Object.assign(existingOutput,outputPayload);
    record=await existingOutput.save();
   }else{
    record=await Output.create(outputPayload);
   }
  }else{
   return res.status(400).json({success:false,message:"Choose ZTL, SRC, ENT, STR, or OUT"});
  }

  const recordId=record.zettelId||record.sourceId||record.entityId||record.structureNoteId||record.outputId;

  fleeting.status="processed";
  fleeting.processLaterAs=target;
  fleeting.processedInto=recordId;
  fleeting.hideFromInbox=true;
  await fleeting.save();
  await recordRevision({userId,parentModel:"FleetingNote",record:fleeting,displayIdFields:["fleetingNoteId"],titleFields:["topic"],contentFields:["rawCapture","notes"]});

  res.json({success:true,data:{fleeting,record}});
 }catch(error){
  res.status(400).json({success:false,message:error.message});
 }
};

export const archiveFleetingNote=async(req,res)=>{
 try{
  const userId=getUserId(req);
  if(!userId)return res.status(400).json({success:false,message:"A valid user is required"});
  if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({success:false,message:"Invalid fleeting note ID"});

  const note=await FleetingNote.findOneAndUpdate(
   {_id:req.params.id,userId},
   {status:"archived",hideFromInbox:true},
   {returnDocument:"after",runValidators:true}
  );

  if(!note)return res.status(404).json({success:false,message:"Fleeting note not found"});
  res.json({success:true,data:note});
 }catch(error){
  res.status(400).json({success:false,message:error.message});
 }
};

export const deleteFleetingNote=async(req,res)=>{
 try{
  const userId=getUserId(req);
  if(!userId)return res.status(400).json({success:false,message:"A valid user is required"});
  if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({success:false,message:"Invalid fleeting note ID"});

  const note=await FleetingNote.findOneAndDelete({_id:req.params.id,userId});
  if(!note)return res.status(404).json({success:false,message:"Fleeting note not found"});

  res.json({success:true,message:"Fleeting note deleted"});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};
