import mongoose from "mongoose";
import Output from "../models/outputModel.js";
import {generateRecordId,toCode} from "../utils/recordId.js";
import fs from "node:fs/promises";
import path from "node:path";
import {execFile} from "node:child_process";
import {promisify} from "node:util";
import {recordRevision} from "../utils/recordRevision.js";

const execFileAsync=promisify(execFile);

// Helper: return the authenticated or supplied user ID
const getUserId=req=>{
 const userId=req.user?._id||req.body?.userId||req.query?.userId||"";
 return mongoose.isValidObjectId(userId)?userId:"";
};

// Helper: normalize optional ObjectId fields
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

// Helper: build the Output model payload
const buildOutputPayload=(body,partial=false)=>{
 const payload={};

 const hasField=field=>{
  return Object.prototype.hasOwnProperty.call(body,field);
 };

 if(!partial||hasField("domainId"))payload.domainId=normalizeObjectId(body.domainId);

 if(!partial||hasField("projectId")){
  payload.projectId=normalizeObjectId(body.projectId);
 }

 if(!partial||hasField("projectIds")){
  payload.projectIds=normalizeObjectIdArray(body.projectIds);
  payload.projectId=payload.projectIds[0]||payload.projectId||null;
 }

 if(!partial||hasField("title")){
  payload.title=String(body.title||"").trim();
 }

 if(!partial||hasField("outputType")){
  payload.outputType=toCode(body.outputType);
 }

 if(!partial||hasField("outputTypes")){
  payload.outputTypes=[...new Set((Array.isArray(body.outputTypes)?body.outputTypes:[]).map(toCode).filter(Boolean))];
  payload.outputType=payload.outputTypes[0]||payload.outputType||"";
 }

 if(!partial||hasField("description")){
  payload.description=String(body.description||"").trim();
 }

 if(!partial||hasField("body")){
  payload.body=String(body.body||"");
 }

 if(!partial||hasField("documentPath")){
  payload.documentPath=String(body.documentPath||"").trim();
 }

 if(!partial||hasField("zettelIds")){
  payload.zettelIds=normalizeObjectIdArray(body.zettelIds);
 }

 if(!partial||hasField("sourceIds")){
  payload.sourceIds=normalizeObjectIdArray(body.sourceIds);
 }

 if(!partial||hasField("entityIds")){
  payload.entityIds=normalizeObjectIdArray(body.entityIds);
 }

 if(!partial||hasField("structureNoteIds")){
  payload.structureNoteIds=normalizeObjectIdArray(body.structureNoteIds);
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

// Helper: populate all Output reference fields
const populateOutput=query=>{
 return query
  .populate("domainId","name code status")
  .populate("projectId","projectId title code")
  .populate("projectIds","projectId title code")
  .populate("zettelIds","zettelId title mainIdea subtype status")
  .populate("sourceIds","sourceId title subtype status")
  .populate("entityIds","entityId name entityType status")
  .populate("structureNoteIds","structureNoteId title purpose status");
};

const addDocumentMetadata=async output=>{
 const value=output?.toObject?output.toObject():output;
 if(!value?.documentPath)return value;
 try{
  const file=await fs.stat(path.resolve(value.documentPath));
  return {...value,documentSize:file.isFile()?file.size:0};
 }catch{
  return {...value,documentSize:0};
 }
};

export const getOutputs=async(req,res)=>{
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
   outputType,
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

  if(outputType){
   filter.outputType=toCode(outputType);
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
    {outputId:{$regex:searchText,$options:"i"}},
    {title:{$regex:searchText,$options:"i"}},
    {outputType:{$regex:searchText,$options:"i"}},
    {description:{$regex:searchText,$options:"i"}},
    {body:{$regex:searchText,$options:"i"}},
    {tags:{$regex:searchText,$options:"i"}}
   ];
  }

  const outputs=await populateOutput(
   Output.find(filter)
  ).sort({updatedAt:-1});
  const outputsWithDocumentMetadata=await Promise.all(outputs.map(addDocumentMetadata));

  res.json({
   success:true,
   data:outputsWithDocumentMetadata
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};

export const getOutputById=async(req,res)=>{
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
    message:"Invalid output ID"
   });
  }

  const output=await populateOutput(
   Output.findOne({
    _id:req.params.id,
    userId
   })
  );

  if(!output){
   return res.status(404).json({
    success:false,
    message:"Output not found"
   });
  }

  res.json({
   success:true,
   data:await addDocumentMetadata(output)
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};

export const openOutputDocument=async(req,res)=>{
 try{
  const userId=getUserId(req);
  if(!userId||!mongoose.isValidObjectId(req.params.id))return res.status(400).json({success:false,message:"A valid output and user are required"});

  const output=await Output.findOne({_id:req.params.id,userId}).select("documentPath").lean();
  if(!output?.documentPath)return res.status(404).json({success:false,message:"No document path is stored for this output"});

  const absolutePath=path.resolve(output.documentPath);
  const file=await fs.stat(absolutePath);
  if(!file.isFile())return res.status(404).json({success:false,message:"Output document was not found"});

  const fileName=path.basename(absolutePath);
  res.type(path.extname(fileName));
  res.setHeader("Content-Disposition",`inline; filename*=UTF-8''${encodeURIComponent(fileName)}`);
  res.sendFile(absolutePath);
 }catch(error){
  const status=error?.code==="ENOENT"?404:500;
  res.status(status).json({success:false,message:status===404?"Output document was not found":error.message});
 }
};

export const selectOutputDocument=async(req,res)=>{
 try{
  const userId=getUserId(req);
  if(!userId)return res.status(400).json({success:false,message:"A valid user is required"});

  const script=[
   "Add-Type -AssemblyName System.Windows.Forms",
   "$dialog = New-Object System.Windows.Forms.OpenFileDialog",
   "$dialog.Title = 'Select Final Output Document'",
   "$dialog.Filter = 'Documents|*.doc;*.docx;*.wpd;*.pdf;*.odt;*.rtf;*.txt;*.md|WordPerfect documents|*.wpd|All files|*.*'",
   "if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) { [Console]::Out.Write($dialog.FileName) }"
  ].join("; ");

  const {stdout}=await execFileAsync("powershell.exe",["-NoProfile","-STA","-Command",script],{windowsHide:true});
  res.json({success:true,data:{documentPath:String(stdout||"").trim()}});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const createOutput=async(req,res)=>{
 try{
  const userId=getUserId(req);

  if(!userId){
   return res.status(400).json({
    success:false,
    message:"A valid user is required to create an output"
   });
  }

  const payload=buildOutputPayload(req.body);

  if(!payload.title){
   return res.status(400).json({
    success:false,
    message:"Output title is required"
   });
  }

  if(!payload.outputType){
   return res.status(400).json({
    success:false,
    message:"Output type is required"
   });
  }

  if(!payload.zettelIds.length&&!payload.structureNoteIds.length){
   return res.status(400).json({
    success:false,
    message:"Select at least one zettel or structure note for this output"
   });
  }

  const outputId=await generateRecordId({
   userId,
   recordType:"OUT",
   domainId:payload.domainId,
   projectId:payload.projectId,
   subtype:payload.outputType,
   subjectCode:req.body.subjectCode,
   subject:payload.title
  });

  let output=await Output.create({
   ...payload,
   userId,
   outputId
  });

  output=await populateOutput(
   Output.findById(output._id)
  );

  res.status(201).json({
   success:true,
   data:output
  });
 }catch(error){
  res.status(400).json({
   success:false,
   message:error.message
  });
 }
};

export const updateOutput=async(req,res)=>{
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
    message:"Invalid output ID"
   });
  }

  const updates=buildOutputPayload(req.body,true);

  if(
   Object.prototype.hasOwnProperty.call(updates,"title")&&
   !updates.title
  ){
   return res.status(400).json({
    success:false,
    message:"Output title is required"
   });
  }

  if(
   Object.prototype.hasOwnProperty.call(updates,"outputType")&&
   !updates.outputType
  ){
   return res.status(400).json({
    success:false,
    message:"Output type is required"
   });
  }

  if(
   Object.prototype.hasOwnProperty.call(updates,"zettelIds")&&
   Object.prototype.hasOwnProperty.call(updates,"structureNoteIds")&&
   !updates.zettelIds.length&&
   !updates.structureNoteIds.length
  ){
   return res.status(400).json({
    success:false,
    message:"Select at least one zettel or structure note for this output"
   });
  }

  const existingOutput=await Output.findOne({_id:req.params.id,userId});
  if(!existingOutput)return res.status(404).json({success:false,message:"Output not found"});
  if(Object.prototype.hasOwnProperty.call(updates,"domainId")&&String(updates.domainId||"")!==String(existingOutput.domainId||"")){
   updates.outputId=await generateRecordId({userId,recordType:"OUT",domainId:updates.domainId,
    projectId:updates.projectId??existingOutput.projectId,subtype:updates.outputType||existingOutput.outputType,
    subject:updates.title||existingOutput.title,existingId:existingOutput.outputId,recordDate:existingOutput.createdAt});
  }

  const output=await populateOutput(
   Output.findOneAndUpdate(
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

  if(!output){
   return res.status(404).json({
    success:false,
    message:"Output not found"
   });
  }

  await recordRevision({userId,parentModel:"Output",record:output,displayIdFields:["outputId"],titleFields:["title"],contentFields:["body","description"]});

  res.json({
   success:true,
   data:output
  });
 }catch(error){
  res.status(400).json({
   success:false,
   message:error.message
  });
 }
};

export const archiveOutput=async(req,res)=>{
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
    message:"Invalid output ID"
   });
  }

  const output=await populateOutput(
   Output.findOneAndUpdate(
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

  if(!output){
   return res.status(404).json({
    success:false,
    message:"Output not found"
   });
  }

  res.json({
   success:true,
   data:output
  });
 }catch(error){
  res.status(400).json({
   success:false,
   message:error.message
  });
 }
};

export const toggleFavoriteOutput=async(req,res)=>{
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
    message:"Invalid output ID"
   });
  }

  const existingOutput=await Output.findOne({
   _id:req.params.id,
   userId
  });

  if(!existingOutput){
   return res.status(404).json({
    success:false,
    message:"Output not found"
   });
  }

  const output=await populateOutput(
   Output.findOneAndUpdate(
    {
     _id:req.params.id,
     userId
    },
    {
     isFavorite:!existingOutput.isFavorite
    },
    {
     returnDocument:"after",
     runValidators:true
    }
   )
  );

  res.json({
   success:true,
   data:output
  });
 }catch(error){
  res.status(400).json({
   success:false,
   message:error.message
  });
 }
};

export const deleteOutput=async(req,res)=>{
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
    message:"Invalid output ID"
   });
  }

  const output=await Output.findOneAndDelete({
   _id:req.params.id,
   userId
  });

  if(!output){
   return res.status(404).json({
    success:false,
    message:"Output not found"
   });
  }

  res.json({
   success:true,
   message:"Output deleted"
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};
