import mongoose from "mongoose";
import StructureNote from "../models/structureNoteModel.js";
import {generateRecordId,toCode} from "../utils/recordId.js";
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

// Helper: normalize ObjectId array fields
const normalizeObjectIdArray=value=>{
 const values=Array.isArray(value)
  ?value
  :String(value||"").split(",");

 return values
  .map(item=>{
   if(typeof item==="object"){
    return item?._id||item?.id||item?.$oid||"";
   }

   return String(item||"").trim();
  })
  .filter(item=>mongoose.isValidObjectId(item));
};

// Helper: normalize ordered structure path entries
const normalizePathEntries=value=>{
 if(!Array.isArray(value))return [];

 return value
  .map(item=>({
   zettelId:normalizeObjectId(item?.zettelId||item),
   annotation:String(item?.annotation||"").trim()
  }))
  .filter(item=>item.zettelId);
};

const normalizeOrderEntries=value=>{
 if(!Array.isArray(value))return [];
 const seen=new Set();
 return value.map(item=>({
  recordType:String(item?.recordType||"").trim().toLowerCase(),
  recordId:normalizeObjectId(item?.recordId)
 })).filter(item=>{
  const key=`${item.recordType}:${item.recordId}`;
  if(!["zettel","source","entity"].includes(item.recordType)||!item.recordId||seen.has(key))return false;
  seen.add(key);
  return true;
 });
};

const reconcileOrderEntries=(entries,zettelIds,sourceIds,entityIds)=>{
 const selected={zettel:new Set(zettelIds.map(String)),source:new Set(sourceIds.map(String)),entity:new Set(entityIds.map(String))};
 const ordered=entries.filter(entry=>selected[entry.recordType]?.has(String(entry.recordId)));
 const seen=new Set(ordered.map(entry=>`${entry.recordType}:${entry.recordId}`));
 for(const [recordType,ids] of [["zettel",zettelIds],["source",sourceIds],["entity",entityIds]]){
  for(const recordId of ids){
   const key=`${recordType}:${recordId}`;
   if(!seen.has(key)){
    ordered.push({recordType,recordId});
    seen.add(key);
   }
  }
 }
 return ordered;
};

// Helper: normalize string array fields
const normalizeStringArray=value=>{
 if(Array.isArray(value)){
  return value
   .map(item=>String(item||"").trim())
   .filter(Boolean);
 }

 return String(value||"")
  .split(",")
  .map(item=>item.trim())
  .filter(Boolean);
};

// Helper: normalize checkbox and Boolean values
const normalizeBoolean=value=>{
 return value===true||value==="true"||value===1||value==="1"||value==="on";
};

// Helper: escape text used in MongoDB regular expressions
const escapeRegex=value=>{
 return String(value||"").replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
};

// Helper: build the StructureNote model payload
const buildStructureNotePayload=(body,partial=false)=>{
 const payload={};

 const hasField=field=>{
  return Object.prototype.hasOwnProperty.call(body,field);
 };

 if(!partial||hasField("domainId"))payload.domainId=normalizeObjectId(body.domainId);

 if(!partial||hasField("projectId")||hasField("projectIds")){
  const projectIds=[...new Set(normalizeObjectIdArray(body.projectIds||body.projectId).map(String))];
  payload.projectId=normalizeObjectId(body.projectId)||projectIds[0]||null;
  payload.projectIds=[...new Set([payload.projectId,...projectIds].filter(Boolean).map(String))];
 }

 if(!partial||hasField("title")){
  payload.title=String(body.title||"").trim();
 }

 if(!partial||hasField("subtype")){
  payload.subtype=toCode(body.subtype||"STUDYMAP");
 }

 if(!partial||hasField("purpose")){
  payload.purpose=String(body.purpose||"").trim();
 }

 if(!partial||hasField("summary")){
  payload.summary=String(body.summary||"").trim();
 }

 if(!partial||hasField("outline")){
  payload.outline=String(body.outline||"");
 }

 if(!partial||hasField("zettelIds")){
  payload.zettelIds=normalizeObjectIdArray(body.zettelIds);
 }

 if(!partial||hasField("pathEntries")||hasField("zettelIds")){
  payload.pathEntries=hasField("pathEntries")
   ?normalizePathEntries(body.pathEntries)
   :normalizeObjectIdArray(body.zettelIds).map(zettelId=>({zettelId,annotation:""}));
  payload.zettelIds=payload.pathEntries.map(entry=>entry.zettelId);
 }

 if(!partial||hasField("sourceIds")){
  payload.sourceIds=normalizeObjectIdArray(body.sourceIds);
 }

 if(!partial||hasField("entityIds")){
  payload.entityIds=normalizeObjectIdArray(body.entityIds);
 }

 if(!partial||hasField("orderEntries")||hasField("zettelIds")||hasField("sourceIds")||hasField("entityIds")){
  const zettelIds=payload.zettelIds||normalizeObjectIdArray(body.zettelIds);
  const sourceIds=payload.sourceIds||normalizeObjectIdArray(body.sourceIds);
  const entityIds=payload.entityIds||normalizeObjectIdArray(body.entityIds);
  payload.orderEntries=reconcileOrderEntries(normalizeOrderEntries(body.orderEntries),zettelIds,sourceIds,entityIds);
 }

 if(!partial||hasField("tags")){
  payload.tags=normalizeStringArray(body.tags);
 }

 if(!partial||hasField("status")){
  payload.status=String(body.status||"draft").trim().toLowerCase();
 }

 if(!partial||hasField("isFavorite")){
  payload.isFavorite=normalizeBoolean(body.isFavorite);
 }

 return payload;
};

// Helper: populate all StructureNote reference fields
const populateStructureNote=query=>{
 return query
  .populate("domainId","name code status")
  .populate("projectId","projectId title code")
  .populate("projectIds","projectId title code")
  .populate("zettelIds","zettelId title mainIdea subtype status")
  .populate("pathEntries.zettelId","zettelId title mainIdea subtype status")
  .populate("sourceIds","sourceId title subtype status")
  .populate("entityIds","entityId name entityType status");
};

export const getStructureNotes=async(req,res)=>{
 try{
  const userId=getUserId(req);

  if(!userId){
   return res.status(400).json({
    success:false,
    message:"A valid user is required"
   });
  }

  const {
   projectId,
   status,
   isFavorite,
   search
  }=req.query;

  const filter={userId};

  if(projectId){
   if(!mongoose.isValidObjectId(projectId)){
    return res.status(400).json({
     success:false,
     message:"Invalid project ID"
    });
   }

   filter.$or=[{projectId},{projectIds:projectId}];
  }

  if(status){
   filter.status=String(status).trim().toLowerCase();
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
    {structureNoteId:{$regex:searchText,$options:"i"}},
    {title:{$regex:searchText,$options:"i"}},
    {purpose:{$regex:searchText,$options:"i"}},
    {summary:{$regex:searchText,$options:"i"}},
    {outline:{$regex:searchText,$options:"i"}},
    {tags:{$regex:searchText,$options:"i"}}
   ];
  }

  const structureNotes=await populateStructureNote(
   StructureNote.find(filter)
  ).sort({updatedAt:-1});

  res.json({
   success:true,
   data:structureNotes
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};

export const getStructureNoteById=async(req,res)=>{
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
    message:"Invalid structure note ID"
   });
  }

  const structureNote=await populateStructureNote(
   StructureNote.findOne({
    _id:req.params.id,
    userId
   })
  );

  if(!structureNote){
   return res.status(404).json({
    success:false,
    message:"Structure note not found"
   });
  }

  res.json({
   success:true,
   data:structureNote
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};

export const createStructureNote=async(req,res)=>{
 try{
  const userId=getUserId(req);

  if(!userId){
   return res.status(400).json({
    success:false,
    message:"A valid user is required to create a structure note"
   });
  }

  const payload=buildStructureNotePayload(req.body);

  if(!payload.title){
   return res.status(400).json({
    success:false,
    message:"Structure note title is required"
   });
  }

  if(!payload.purpose){
   return res.status(400).json({
    success:false,
    message:"Structure note purpose is required"
   });
  }

  const subtype=payload.subtype;

  const structureNoteId=await generateRecordId({
   userId,
   recordType:"STR",
   domainId:payload.domainId,
   projectId:payload.projectId,
   subtype,
   subjectCode:req.body.subjectCode,
   subject:payload.title
  });

  let structureNote=await StructureNote.create({
   ...payload,
   userId,
   structureNoteId
  });

  structureNote=await populateStructureNote(
   StructureNote.findById(structureNote._id)
  );

  res.status(201).json({
   success:true,
   data:structureNote
  });
 }catch(error){
  res.status(400).json({
   success:false,
   message:error.message
  });
 }
};

export const updateStructureNote=async(req,res)=>{
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
    message:"Invalid structure note ID"
   });
  }

  const existingStructureNote=await StructureNote.findOne({
   _id:req.params.id,
   userId
  });

  if(!existingStructureNote){
   return res.status(404).json({
    success:false,
    message:"Structure note not found"
   });
  }

  const updates=buildStructureNotePayload(req.body,true);

  if(
   Object.prototype.hasOwnProperty.call(updates,"title")&&
   !updates.title
  ){
   return res.status(400).json({
    success:false,
    message:"Structure note title is required"
   });
  }

  if(
   Object.prototype.hasOwnProperty.call(updates,"purpose")&&
   !updates.purpose
  ){
   return res.status(400).json({
    success:false,
    message:"Structure note purpose is required"
   });
  }

  const domainChanged=Object.prototype.hasOwnProperty.call(req.body,"domainId")&&String(updates.domainId||"")!==String(existingStructureNote.domainId||"");
  const projectChanged=Object.prototype.hasOwnProperty.call(req.body,"projectId")&&String(updates.projectId||"")!==String(existingStructureNote.projectId||"");
  const subtypeChanged=Object.prototype.hasOwnProperty.call(req.body,"subtype")&&String(updates.subtype||"")!==String(existingStructureNote.subtype||"");
  const assignedDomainOrProject=updates.domainId||existingStructureNote.domainId||updates.projectId||existingStructureNote.projectId;
  const stillUsesGeneralSegment=Boolean(assignedDomainOrProject)&&existingStructureNote.structureNoteId.startsWith("STR-GENERAL-");

  if(!/-\d{8}-\d{3}$/.test(existingStructureNote.structureNoteId)||domainChanged||projectChanged||subtypeChanged||stillUsesGeneralSegment){
   updates.structureNoteId=await generateRecordId({
    userId,
    recordType:"STR",
    domainId:updates.domainId??existingStructureNote.domainId,
    existingId:existingStructureNote.structureNoteId,
    recordDate:existingStructureNote.createdAt,
    projectId:updates.projectId??existingStructureNote.projectId,
    subtype:updates.subtype||existingStructureNote.subtype,
    subject:updates.title||existingStructureNote.title
   });
  }

  const structureNote=await populateStructureNote(
   StructureNote.findOneAndUpdate(
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

  if(!structureNote){
   return res.status(404).json({
    success:false,
    message:"Structure note not found"
   });
  }

  await recordRevision({userId,parentModel:"StructureNote",record:structureNote,displayIdFields:["structureNoteId"],titleFields:["title"],contentFields:["outline","summary","purpose"]});

  res.json({
   success:true,
   data:structureNote
  });
 }catch(error){
  res.status(400).json({
   success:false,
   message:error.message
  });
 }
};

export const archiveStructureNote=async(req,res)=>{
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
    message:"Invalid structure note ID"
   });
  }

  const structureNote=await populateStructureNote(
   StructureNote.findOneAndUpdate(
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
   )
  );

  if(!structureNote){
   return res.status(404).json({
    success:false,
    message:"Structure note not found"
   });
  }

  res.json({
   success:true,
   data:structureNote
  });
 }catch(error){
  res.status(400).json({
   success:false,
   message:error.message
  });
 }
};

export const toggleFavoriteStructureNote=async(req,res)=>{
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
    message:"Invalid structure note ID"
   });
  }

  const existingStructureNote=await StructureNote.findOne({
   _id:req.params.id,
   userId
  });

  if(!existingStructureNote){
   return res.status(404).json({
    success:false,
    message:"Structure note not found"
   });
  }

  const structureNote=await populateStructureNote(
   StructureNote.findOneAndUpdate(
    {
     _id:req.params.id,
     userId
    },
    {
     isFavorite:!existingStructureNote.isFavorite
    },
    {
     returnDocument:"after",
     runValidators:true
    }
   )
  );

  res.json({
   success:true,
   data:structureNote
  });
 }catch(error){
  res.status(400).json({
   success:false,
   message:error.message
  });
 }
};

export const deleteStructureNote=async(req,res)=>{
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
    message:"Invalid structure note ID"
   });
  }

  const structureNote=await StructureNote.findOneAndDelete({
   _id:req.params.id,
   userId
  });

  if(!structureNote){
   return res.status(404).json({
    success:false,
    message:"Structure note not found"
   });
  }

  res.json({
   success:true,
   message:"Structure note deleted"
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};

export const saveStructureWritingDraft=async(req,res)=>{
 try{
  const userId=getUserId(req);
  if(!userId||!mongoose.isValidObjectId(req.params.id))return res.status(400).json({success:false,message:"A valid user and structure note are required"});
  if(typeof req.body?.title!=="string"||typeof req.body?.body!=="string")return res.status(400).json({success:false,message:"A document title and content are required"});
  const title=req.body.title.trim();
  if(!title)return res.status(400).json({success:false,message:"Document title is required"});
  const writingDraft={title,body:req.body.body,savedAt:new Date()};
  const structureNote=await StructureNote.findOneAndUpdate({_id:req.params.id,userId},{$set:{writingDraft}},{returnDocument:"after",runValidators:true}).select("writingDraft");
  if(!structureNote)return res.status(404).json({success:false,message:"Structure note not found"});
  return res.json({success:true,data:structureNote.writingDraft});
 }catch(error){return res.status(500).json({success:false,message:error.message});}
};
