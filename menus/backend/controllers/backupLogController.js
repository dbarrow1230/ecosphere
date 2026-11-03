// backend/controllers/backupLogController.js
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import {randomUUID} from "crypto";
import {fileURLToPath} from "url";
import BackupLog from "../models/backupLogModel.js";

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);

const configuredBackupRoot=String(globalThis.process.env.BACKUP_ROOT||"backups").trim();

const backupRoot=path.isAbsolute(configuredBackupRoot)
 ?configuredBackupRoot
 :path.join(__dirname,"..",configuredBackupRoot);

const BACKUP_TYPES=["full","notes","favorites","archived","tags"];

const BACKUP_COLLECTIONS={
 zettels:["zettels","notes"],
 fleetingNotes:["fleetingnotes","fleeting_notes"],
 sources:["sources"],
 entities:["entities"],
 connections:["connections"],
 structureNotes:["structurenotes","structure_notes"],
 outputs:["outputs"],
 projects:["projects"],
 attachments:["attachments"],
 tags:["tags"],
 revisions:["revisions"],
 prefixes:["prefixes"],
 idSequences:["idsequences","id_sequences"],
 projectTypes:["projecttypes","project_types"],
 relationTypes:["relationtypes","relation_types"],
 recordSubtypes:["recordsubtypes","record_subtypes"],
 settings:["settings"]
};

// Helper: get and validate the requesting user ID
const getUserObjectId=req=>{
 const userId=String(
  req.user?._id||
  req.body?.userId||
  req.query?.userId||
  req.headers["x-user-id"]||
  ""
 ).trim();

 if(!mongoose.Types.ObjectId.isValid(userId))return null;

 return{
  userId,
  objectId:new mongoose.Types.ObjectId(userId)
 };
};

// Helper: normalize MongoDB collection names
const normalizeCollectionName=value=>{
 return String(value||"").toLowerCase().replace(/[^a-z0-9]/g,"");
};

// Helper: find the physical MongoDB collection for each backup group
const getExistingCollections=async()=>{
 const collections=await mongoose.connection.db
  .listCollections({},{nameOnly:true})
  .toArray();

 return new Map(
  collections.map(collection=>[
   normalizeCollectionName(collection.name),
   collection.name
  ])
 );
};

// Helper: determine which collection groups belong to the backup type
const getBackupCollectionGroups=backupType=>{
 if(backupType==="notes")return ["zettels"];
 if(backupType==="favorites")return ["zettels"];
 if(backupType==="archived")return ["zettels"];
 if(backupType==="tags")return ["tags"];

 return Object.keys(BACKUP_COLLECTIONS);
};

// Helper: build a user-scoped query for each backup collection
const getCollectionFilter=(backupType,userId,objectId)=>{
 const userValues=[objectId,userId];

 const ownerFilter={
  $or:[
   {userId:{$in:userValues}},
   {ownerId:{$in:userValues}},
   {createdBy:{$in:userValues}},
   {user:{$in:userValues}}
  ]
 };

 if(backupType==="favorites"){
  return{
   $and:[
    ownerFilter,
    {
     $or:[
      {isFavorite:true},
      {favorite:true},
      {status:"favorite"}
     ]
    }
   ]
  };
 }

 if(backupType==="archived"){
  return{
   $and:[
    ownerFilter,
    {
     $or:[
      {isArchived:true},
      {archived:true},
      {status:"archived"}
     ]
    }
   ]
  };
 }

 return ownerFilter;
};

// Helper: safely resolve a stored backup file path
const resolveBackupFilePath=(filePath,storedBackupDirectory="")=>{
 const rootPath=path.resolve(String(storedBackupDirectory||backupRoot));
 const resolvedPath=path.resolve(rootPath,String(filePath||""));
 const rootPrefix=`${rootPath}${path.sep}`;

 if(resolvedPath!==rootPath&&!resolvedPath.startsWith(rootPrefix))return "";

 return resolvedPath;
};

const objectIdFields=new Set([
 "_id",
 "projects",
 "selectedUsers",
 "modalDismissedBy",
 "linkedRecords",
 "linkedSources",
 "linkedZettels",
 "linkedOutputs",
 "fromRecord",
 "toRecord",
 "attachments",
 "tags",
 "subtype"
]);

const reviveBackupValue=(value,key="")=>{
 if(Array.isArray(value))return value.map(item=>reviveBackupValue(item,key));

 if(value&&typeof value==="object"){
  return Object.fromEntries(
   Object.entries(value).map(([entryKey,entryValue])=>[
    entryKey,
    reviveBackupValue(entryValue,entryKey)
   ])
  );
 }

 if(typeof value!=="string")return value;

 if(
  /^[a-f\d]{24}$/i.test(value)&&
  (objectIdFields.has(key)||/Ids?$/.test(key))
 ){
  return new mongoose.Types.ObjectId(value);
 }

 if(/(?:At|Date)$/.test(key)&&/^\d{4}-\d{2}-\d{2}T/.test(value)){
  const date=new Date(value);
  if(!Number.isNaN(date.getTime()))return date;
 }

 return value;
};

const getOwnerValue=value=>String(value?._id||value||"");

const recordBelongsToUser=(record,userId)=>{
 const ownerFields=["userId","ownerId","createdBy","user"];
 return ownerFields.some(field=>getOwnerValue(record?.[field])===userId);
};

const getRestoreCollectionName=(collectionGroup,backupData,existingCollections)=>{
 const aliases=BACKUP_COLLECTIONS[collectionGroup]||[];
 const recordedName=String(backupData?.sourceCollections?.[collectionGroup]||"");
 const recordedNormalized=normalizeCollectionName(recordedName);
 const recordedIsAllowed=aliases.some(
  alias=>normalizeCollectionName(alias)===recordedNormalized
 );

 if(recordedIsAllowed&&existingCollections.has(recordedNormalized)){
  return existingCollections.get(recordedNormalized);
 }

 return aliases
  .map(alias=>existingCollections.get(normalizeCollectionName(alias)))
  .find(Boolean)||aliases[0]||"";
};

export const getBackupLogs=async(req,res)=>{
 try{
  const user=getUserObjectId(req);

  if(!user){
   return res.status(400).json({
    success:false,
    message:"A valid user ID is required"
   });
  }

  const {backupType,status}=req.query;

  const filter={userId:user.objectId};

  if(backupType)filter.backupType=backupType;
  if(status)filter.status=status;

  const backupLogs=await BackupLog.find(filter).sort({createdAt:-1});

  res.json({
   success:true,
   data:backupLogs
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};

export const getBackupLogById=async(req,res)=>{
 try{
  const user=getUserObjectId(req);

  if(!user){
   return res.status(400).json({
    success:false,
    message:"A valid user ID is required"
   });
  }

  if(!mongoose.Types.ObjectId.isValid(req.params.id)){
   return res.status(400).json({
    success:false,
    message:"Invalid backup log ID"
   });
  }

  const backupLog=await BackupLog.findOne({
   _id:req.params.id,
   userId:user.objectId
  });

  if(!backupLog){
   return res.status(404).json({
    success:false,
    message:"Backup log not found"
   });
  }

  res.json({
   success:true,
   data:backupLog
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};

export const runBackupForUser=async({user,backupType,backupLocation="",scheduleId=null,isAutomatic=false})=>{
 let backupLog=null;
 let absoluteFilePath="";

 try{
  if(!BACKUP_TYPES.includes(backupType)){
   throw new Error("Invalid backup type");
  }

  const backupId=randomUUID();
  const timestamp=new Date().toISOString().replace(/[:.]/g,"-");
  const fileName=`zettelkasten-${backupType}-${timestamp}.json`;
  const requestedLocation=String(backupLocation||"").trim();
  const selectedBackupRoot=requestedLocation
   ?path.isAbsolute(requestedLocation)?path.resolve(requestedLocation):path.resolve(backupRoot,requestedLocation)
   :path.resolve(backupRoot);
  const userBackupDirectory=path.join(selectedBackupRoot,user.userId);
  const relativeFilePath=path.join(user.userId,fileName).replace(/\\/g,"/");

  absoluteFilePath=path.join(userBackupDirectory,fileName);

  await fs.promises.mkdir(userBackupDirectory,{recursive:true});

  backupLog=await BackupLog.create({
   userId:user.objectId,
   backupId,
   backupType,
   fileName,
   filePath:relativeFilePath,
   backupDirectory:selectedBackupRoot,
   recordCount:0,
   status:"started",
   message:"Backup creation started",
   completedAt:null,
   isAutomatic,
   scheduleId
  });

  const existingCollections=await getExistingCollections();
  const collectionGroups=getBackupCollectionGroups(backupType);
  const collectionFilter=getCollectionFilter(
   backupType,
   user.userId,
   user.objectId
  );

  const backupCollections={};
  const sourceCollections={};
  let recordCount=0;

  for(const collectionGroup of collectionGroups){
   const aliases=BACKUP_COLLECTIONS[collectionGroup]||[];

   const collectionName=aliases
    .map(alias=>existingCollections.get(normalizeCollectionName(alias)))
    .find(Boolean);

   if(!collectionName)continue;

   const records=await mongoose.connection.db
    .collection(collectionName)
    .find(collectionFilter)
    .toArray();

   backupCollections[collectionGroup]=records;
   sourceCollections[collectionGroup]=collectionName;
   recordCount+=records.length;
  }

  const backupData={
   backupId,
   backupType,
   userId:user.userId,
   createdAt:new Date().toISOString(),
   recordCount,
   sourceCollections,
   data:backupCollections
  };

  await fs.promises.writeFile(
   absoluteFilePath,
   JSON.stringify(backupData,null,2),
   "utf8"
  );

  backupLog=await BackupLog.findByIdAndUpdate(
   backupLog._id,
   {
    recordCount,
    status:"completed",
    message:"Backup created successfully",
    completedAt:new Date()
   },
   {
    returnDocument:"after",
    runValidators:true
   }
  );

  return backupLog;
 }catch(error){
  if(absoluteFilePath){
   await fs.promises.rm(absoluteFilePath,{force:true}).catch(()=>{});
  }

  if(backupLog?._id){
   backupLog=await BackupLog.findByIdAndUpdate(
    backupLog._id,
    {
     status:"failed",
     message:error.message,
     completedAt:new Date()
    },
    {
     returnDocument:"after"
    }
   ).catch(()=>backupLog);
  }

  error.backupLog=backupLog;
  throw error;
 }
};

export const deleteExpiredAutomaticBackups=async({userId,scheduleId,retentionDays})=>{
 const cutoff=new Date(Date.now()-Number(retentionDays)*24*60*60*1000);
 const expiredLogs=await BackupLog.find({
  userId,
  scheduleId,
  isAutomatic:true,
  createdAt:{$lt:cutoff}
 });

 let deletedCount=0;
 for(const backupLog of expiredLogs){
  const filePath=resolveBackupFilePath(backupLog.filePath,backupLog.backupDirectory);
  if(filePath)await fs.promises.rm(filePath,{force:true}).catch(()=>{});
  await BackupLog.deleteOne({_id:backupLog._id,userId});
  deletedCount+=1;
 }
 return deletedCount;
};

export const getBackupConfiguration=async(req,res)=>{
 const user=getUserObjectId(req);
 if(!user)return res.status(400).json({success:false,message:"A valid user ID is required"});
 return res.json({success:true,data:{defaultBackupLocation:path.resolve(backupRoot)}});
};

export const createBackup=async(req,res)=>{
 try{
  const user=getUserObjectId(req);
  if(!user)return res.status(400).json({success:false,message:"A valid user ID is required"});

  const backupType=String(req.body?.backupType||"full").trim().toLowerCase();
  const backupLocation=String(req.body?.backupLocation||"").trim();
  const backupLog=await runBackupForUser({user,backupType,backupLocation});

  return res.status(201).json({
   success:true,
   message:"Backup created successfully",
   data:backupLog,
   backup:backupLog
  });
 }catch(error){
  return res.status(error.message==="Invalid backup type"?400:500).json({
   success:false,
   message:error.message,
   data:error.backupLog||null
  });
 }
};

export const createBackupLog=async(req,res)=>{
 try{
  const user=getUserObjectId(req);

  if(!user){
   return res.status(400).json({
    success:false,
    message:"A valid user ID is required"
   });
  }

  const backupLog=await BackupLog.create({
   ...req.body,
   userId:user.objectId,
   backupId:req.body?.backupId||randomUUID()
  });

  res.status(201).json({
   success:true,
   data:backupLog
  });
 }catch(error){
  res.status(400).json({
   success:false,
   message:error.message
  });
 }
};

export const downloadBackup=async(req,res,next)=>{
 try{
  const user=getUserObjectId(req);

  if(!user){
   return res.status(400).json({
    success:false,
    message:"A valid user ID is required"
   });
  }

  const backupLog=await BackupLog.findOne({
   userId:user.objectId,
   backupId:req.params.backupId,
   status:"completed"
  });

  if(!backupLog){
   return res.status(404).json({
    success:false,
    message:"Completed backup not found"
   });
  }

  const filePath=resolveBackupFilePath(backupLog.filePath,backupLog.backupDirectory);

  if(!filePath){
   return res.status(400).json({
    success:false,
    message:"Invalid backup file path"
   });
  }

  try{
   await fs.promises.access(filePath,fs.constants.R_OK);
  }catch{
   return res.status(404).json({
    success:false,
    message:"Backup file not found"
   });
  }

  return res.download(
   filePath,
   backupLog.fileName,
   error=>{
    if(error)next(error);
   }
  );
 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};

export const updateBackupLog=async(req,res)=>{
 try{
  const user=getUserObjectId(req);

  if(!user){
   return res.status(400).json({
    success:false,
    message:"A valid user ID is required"
   });
  }

  if(!mongoose.Types.ObjectId.isValid(req.params.id)){
   return res.status(400).json({
    success:false,
    message:"Invalid backup log ID"
   });
  }

  const {
   _id,
   userId:USER_ID,
   ...updates
  }=req.body;

  if(updates.status==="completed"&&!updates.completedAt){
   updates.completedAt=new Date();
  }

  const backupLog=await BackupLog.findOneAndUpdate(
   {
    _id:req.params.id,
    userId:user.objectId
   },
   updates,
   {
    returnDocument:"after",
    runValidators:true
   }
  );

  if(!backupLog){
   return res.status(404).json({
    success:false,
    message:"Backup log not found"
   });
  }

  res.json({
   success:true,
   data:backupLog
  });
 }catch(error){
  res.status(400).json({
   success:false,
   message:error.message
  });
 }
};

export const deleteBackupLog=async(req,res)=>{
 try{
  const user=getUserObjectId(req);

  if(!user){
   return res.status(400).json({
    success:false,
    message:"A valid user ID is required"
   });
  }

  if(!mongoose.Types.ObjectId.isValid(req.params.id)){
   return res.status(400).json({
    success:false,
    message:"Invalid backup log ID"
   });
  }

  const backupLog=await BackupLog.findOneAndDelete({
   _id:req.params.id,
   userId:user.objectId
  });

  if(!backupLog){
   return res.status(404).json({
    success:false,
    message:"Backup log not found"
   });
  }

  const filePath=resolveBackupFilePath(backupLog.filePath,backupLog.backupDirectory);

  if(filePath){
   await fs.promises.rm(filePath,{force:true}).catch(()=>{});
  }

  res.json({
   success:true,
   message:"Backup log deleted"
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};

export const restoreBackup=async(req,res)=>{
 try{
  const user=getUserObjectId(req);

  if(!user){
   return res.status(400).json({
    success:false,
    message:"A valid user ID is required"
   });
  }

  const backupLog=await BackupLog.findOne({
   userId:user.objectId,
   backupId:req.params.backupId,
   status:"completed"
  });

  if(!backupLog){
   return res.status(404).json({
    success:false,
    message:"Completed backup not found"
   });
  }

  const filePath=resolveBackupFilePath(backupLog.filePath,backupLog.backupDirectory);

  if(!filePath){
   return res.status(400).json({
    success:false,
    message:"Invalid backup file path"
   });
  }

  let backupData;

  try{
   backupData=JSON.parse(await fs.promises.readFile(filePath,"utf8"));
  }catch{
   return res.status(400).json({
    success:false,
    message:"The backup file is missing or invalid"
   });
  }

  if(
   String(backupData?.backupId||"")!==String(backupLog.backupId)||
   String(backupData?.userId||"")!==user.userId||
   !backupData?.data||
   typeof backupData.data!=="object"
  ){
   return res.status(400).json({
    success:false,
    message:"The backup file does not match this backup record"
   });
  }

  const existingCollections=await getExistingCollections();
  let restoredCount=0;
  let skippedCount=0;

  for(const [collectionGroup,records] of Object.entries(backupData.data)){
   if(!Object.hasOwn(BACKUP_COLLECTIONS,collectionGroup)||!Array.isArray(records)){
    skippedCount+=Array.isArray(records)?records.length:0;
    continue;
   }

   const collectionName=getRestoreCollectionName(
    collectionGroup,
    backupData,
    existingCollections
   );

   if(!collectionName){
    skippedCount+=records.length;
    continue;
   }

   const collection=mongoose.connection.db.collection(collectionName);

   for(const storedRecord of records){
    const restoredRecord=reviveBackupValue(storedRecord);

    if(
     !mongoose.Types.ObjectId.isValid(restoredRecord?._id)||
     !recordBelongsToUser(restoredRecord,user.userId)
    ){
     skippedCount+=1;
     continue;
    }

    const existingRecord=await collection.findOne(
     {_id:restoredRecord._id},
     {projection:{userId:1,ownerId:1,createdBy:1,user:1}}
    );

    if(existingRecord&&!recordBelongsToUser(existingRecord,user.userId)){
     skippedCount+=1;
     continue;
    }

    if(existingRecord){
     await collection.replaceOne({_id:restoredRecord._id},restoredRecord);
    }else{
     await collection.insertOne(restoredRecord);
    }

    restoredCount+=1;
   }
  }

  return res.json({
   success:true,
   message:`Backup restored: ${restoredCount} records restored${skippedCount?`, ${skippedCount} skipped`:""}.`,
   data:{restoredCount,skippedCount}
  });
 }catch(error){
  return res.status(500).json({
   success:false,
   message:error.message
  });
 }
};
