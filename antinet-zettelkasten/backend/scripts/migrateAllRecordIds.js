/* global process */
import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import Project from "../models/projectModel.js";
import Source from "../models/sourceModel.js";
import Entity from "../models/entityModel.js";
import Zettel from "../models/zettelModel.js";
import FleetingNote from "../models/fleetingNoteModel.js";
import Connection from "../models/connectionModel.js";
import StructureNote from "../models/structureNoteModel.js";
import Output from "../models/outputModel.js";
import Reminder from "../models/reminderModel.js";
import Attachment from "../models/attachmentModel.js";
import RecordSubtype from "../models/recordSubtypeModel.js";
import {generateRecordId} from "../utils/recordId.js";

const currentPattern=/-\d{8}-\d{3}$/;
const apply=process.argv.includes("--apply");
const userId=process.argv.find(value=>value.startsWith("--userId="))?.slice(9)||"";

const loadEnv=()=>{
 const envPath=path.resolve("backend",".env");
 if(!fs.existsSync(envPath))return;
 for(const line of fs.readFileSync(envPath,"utf8").split(/\r?\n/)){
  const trimmed=line.trim();
  if(!trimmed||trimmed.startsWith("#")||!trimmed.includes("="))continue;
  const separator=trimmed.indexOf("=");
  const key=trimmed.slice(0,separator).trim();
  const value=trimmed.slice(separator+1).trim().replace(/^"|"$/g,"");
  if(key&&!process.env[key])process.env[key]=value;
 }
};

const getProjectId=record=>record.projectId?._id||record.projectId||record.projectIds?.[0]?._id||record.projectIds?.[0]||null;
const changes=new Map();
const recordModels={
 PRJ:[Project,"projectId"],PROJECT:[Project,"projectId"],
 SRC:[Source,"sourceId"],SOURCE:[Source,"sourceId"],
 ENT:[Entity,"entityId"],ENTITY:[Entity,"entityId"],
 ZTL:[Zettel,"zettelId"],ZETTEL:[Zettel,"zettelId"],
 FLT:[FleetingNote,"fleetingNoteId"],FLEETINGNOTE:[FleetingNote,"fleetingNoteId"],
 STR:[StructureNote,"structureNoteId"],STRUCTURENOTE:[StructureNote,"structureNoteId"],
 OUT:[Output,"outputId"],OUTPUT:[Output,"outputId"]
};

const getCurrentDisplayId=async(type,recordId)=>{
 const config=recordModels[String(type||"").replace(/[^A-Za-z]/g,"").toUpperCase()];
 if(!config||!mongoose.isValidObjectId(recordId))return "";
 const [Model,idField]=config;
 const record=await Model.findById(recordId).select(idField).lean();
 return record?.[idField]||"";
};

const migrateModel=async({Model,idField,recordType,subtype,subject,projectCode})=>{
 const filter={...(userId?{userId}:{}),[idField]:{$not:currentPattern}};
 const records=await Model.find(filter).sort({userId:1,createdAt:1,_id:1});
 for(const record of records){
  const oldId=record[idField];
  const nextId=await generateRecordId({
   userId:record.userId,
   recordType,
   projectId:getProjectId(record),
   projectCode:projectCode?.(record)||"",
   subtype:await subtype(record),
   subject:subject(record),
   subjectCode:record.subjectCode||record.code||""
  });
  changes.set(oldId,nextId);
  console.log(`${oldId} -> ${nextId}`);
  if(apply){
   await Model.updateOne({_id:record._id},{$set:{[idField]:nextId}});
  }
 }
 return records.length;
};

const main=async()=>{
 loadEnv();
 if(!process.env.MONGO_URI)throw new Error("MONGO_URI is not defined");
 await mongoose.connect(process.env.MONGO_URI);
 const subtypeCodes=new Map((await RecordSubtype.find(userId?{userId}:{}).lean()).map(item=>[String(item._id),item.code]));
 let count=0;
 count+=await migrateModel({Model:Project,idField:"projectId",recordType:"PRJ",projectCode:r=>r.code,subtype:async()=>"PROJECT",subject:r=>r.title});
 count+=await migrateModel({Model:Source,idField:"sourceId",recordType:"SRC",subtype:async r=>r.subtype||"GENERAL",subject:r=>r.title});
 count+=await migrateModel({Model:Entity,idField:"entityId",recordType:"ENT",subtype:async r=>r.entityType||"GENERAL",subject:r=>r.name});
 count+=await migrateModel({Model:Zettel,idField:"zettelId",recordType:"ZTL",subtype:async r=>subtypeCodes.get(String(r.subtype?.[0]))||"GENERAL",subject:r=>r.title});
 count+=await migrateModel({Model:FleetingNote,idField:"fleetingNoteId",recordType:"FLT",projectCode:r=>getProjectId(r)?"":r.topic||"GENERAL",subtype:async r=>r.captureType||"IDEA",subject:r=>r.topic||r.rawCapture});
 count+=await migrateModel({Model:Connection,idField:"connectionId",recordType:"LNK",subtype:async r=>r.relation||r.relationType||"LINK",subject:r=>r.reason||r.relation});
 count+=await migrateModel({Model:StructureNote,idField:"structureNoteId",recordType:"STR",subtype:async r=>r.subtype||"GENERAL",subject:r=>r.title});
 count+=await migrateModel({Model:Output,idField:"outputId",recordType:"OUT",subtype:async r=>r.outputType||"GENERAL",subject:r=>r.title});
 count+=await migrateModel({Model:Reminder,idField:"reminderId",recordType:"REM",subtype:async r=>r.reminderType||"CUSTOM",subject:r=>r.title});
 count+=await migrateModel({Model:Attachment,idField:"attachmentId",recordType:"ATT",subtype:async r=>r.parentModel||"FILE",subject:r=>r.originalName||r.fileName});

 if(apply&&changes.size){
  for(const [oldId,nextId] of changes){
   await FleetingNote.updateMany({processedInto:oldId},{$set:{processedInto:nextId}});
   await Connection.updateMany({fromDisplayId:oldId},{$set:{fromDisplayId:nextId}});
   await Connection.updateMany({toDisplayId:oldId},{$set:{toDisplayId:nextId}});
   await Reminder.updateMany({parentDisplayId:oldId},{$set:{parentDisplayId:nextId}});
   await Attachment.updateMany({parentDisplayId:oldId},{$set:{parentDisplayId:nextId}});
  }
 }
 if(apply){
  for(const connection of await Connection.find(userId?{userId}:{}).lean()){
   const fromDisplayId=await getCurrentDisplayId(connection.fromRecordType||connection.fromModel,connection.fromRecord||connection.fromRecordId);
   const toDisplayId=await getCurrentDisplayId(connection.toRecordType||connection.toModel,connection.toRecord||connection.toRecordId);
   const update={};
   if(fromDisplayId)update.fromDisplayId=fromDisplayId;
   if(toDisplayId)update.toDisplayId=toDisplayId;
   if(Object.keys(update).length)await Connection.updateOne({_id:connection._id},{$set:update});
  }
  for(const Model of [Reminder,Attachment]){
   for(const record of await Model.find(userId?{userId}:{}).lean()){
    const parentDisplayId=await getCurrentDisplayId(record.parentModel,record.parentRecordId);
    if(parentDisplayId)await Model.updateOne({_id:record._id},{$set:{parentDisplayId}});
   }
  }
 }
 console.log(`${apply?"Migrated":"Would migrate"} ${count} legacy record IDs.`);
 await mongoose.disconnect();
};

main().catch(async error=>{
 console.error(error);
 await mongoose.disconnect().catch(()=>{});
 process.exitCode=1;
});
