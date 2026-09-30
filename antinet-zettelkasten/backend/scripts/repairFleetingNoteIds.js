/* global process */
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import FleetingNote from "../models/fleetingNoteModel.js";
import IdSequence from "../models/idSequenceModel.js";

const args=new Set(process.argv.slice(2));
const apply=args.has("--apply");
const userIdArg=process.argv.find(arg=>arg.startsWith("--userId="))?.split("=")[1]||"";
const envPath=path.resolve("backend",".env");

const loadEnv=()=>{
 if(!fs.existsSync(envPath))return;

 const lines=fs.readFileSync(envPath,"utf8").split(/\r?\n/);

 for(const line of lines){
  const trimmed=line.trim();
  if(!trimmed||trimmed.startsWith("#")||!trimmed.includes("="))continue;

  const index=trimmed.indexOf("=");
  const key=trimmed.slice(0,index).trim();
  const value=trimmed.slice(index+1).trim().replace(/^"|"$/g,"");

  if(key&&!process.env[key]){
   process.env[key]=value;
  }
 }
};

const toCode=value=>String(value||"").trim().toUpperCase().replace(/[^A-Z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,24);
const toTopicCode=value=>String(value||"").trim().toUpperCase().replace(/[^A-Z0-9]+/g,"").slice(0,24);
const getDateCode=value=>{
 const date=value?new Date(value):new Date();
 return `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,"0")}${String(date.getDate()).padStart(2,"0")}`;
};

const getTopicSource=note=>{
 if(note.topic)return note.topic;
 if(note.projectId?.code)return note.projectId.code;
 return getDateCode(note.createdAt);
};

const getSubjectSource=note=>note.subjectCode||getDateCode(note.createdAt);

const buildGroupKey=({userId,projectCode,subtypeCode,subjectCode})=>[
 String(userId),
 "FLT",
 projectCode,
 subtypeCode,
 subjectCode
].join("|");

const buildFleetingId=({projectCode,subtypeCode,subjectCode,number})=>[
 "FLT",
 subtypeCode,
 projectCode,
 subjectCode,
 String(number).padStart(3,"0")
].join("-");

const main=async()=>{
 loadEnv();

 if(!process.env.MONGO_URI){
  throw new Error("MONGO_URI is not defined. The script reads backend/.env or process.env.MONGO_URI.");
 }

 await mongoose.connect(process.env.MONGO_URI);

 const filter=userIdArg?{userId:userIdArg}:{};
 const notes=await FleetingNote.find(filter)
  .populate("projectId","code title projectId")
  .sort({userId:1,createdAt:1,_id:1});

 const groups=new Map();

 for(const note of notes){
  const projectCode=toTopicCode(getTopicSource(note));
  const subtypeCode=toCode(note.captureType||"IDEA");
  const subjectCode=toCode(getSubjectSource(note));

  if(!projectCode||!subtypeCode||!subjectCode)continue;

  const key=buildGroupKey({
   userId:note.userId,
   projectCode,
   subtypeCode,
   subjectCode
  });

  if(!groups.has(key)){
   groups.set(key,{
    userId:note.userId,
    projectCode,
    subtypeCode,
    subjectCode,
    notes:[]
   });
  }

  groups.get(key).notes.push(note);
 }

 const changes=[];
 const sequences=[];

 for(const group of groups.values()){
  group.notes.forEach((note,index)=>{
   const nextId=buildFleetingId({
    projectCode:group.projectCode,
    subtypeCode:group.subtypeCode,
    subjectCode:group.subjectCode,
    number:index+1
   });

   if(note.fleetingNoteId!==nextId){
    changes.push({
     _id:note._id,
     rawCapture:note.rawCapture,
     from:note.fleetingNoteId,
     to:nextId
    });
   }
  });

  sequences.push({
   userId:group.userId,
   recordType:"FLT",
   projectCode:group.projectCode,
   subtypeCode:group.subtypeCode,
   subjectCode:group.subjectCode,
   nextNumber:group.notes.length+1
  });
 }

 console.log(`${apply?"APPLY":"DRY RUN"} Fleeting Note ID repair`);
 console.log(`Scanned notes: ${notes.length}`);
 console.log(`ID changes: ${changes.length}`);
 console.log(`Sequence rows to reset: ${sequences.length}`);

 for(const change of changes){
  console.log(`${change.from} -> ${change.to}`);
 }

 if(!apply){
  console.log("No changes written. Run with --apply to update fleeting_notes and id_sequences.");
  await mongoose.disconnect();
  return;
 }

 for(const change of changes){
  await FleetingNote.updateOne({_id:change._id},{$set:{fleetingNoteId:`REPAIR-${change._id}`}});
 }

 for(const change of changes){
  await FleetingNote.updateOne({_id:change._id},{$set:{fleetingNoteId:change.to}});
 }

 for(const sequence of sequences){
  await IdSequence.findOneAndUpdate(
   {
    userId:sequence.userId,
    recordType:sequence.recordType,
    projectCode:sequence.projectCode,
    subtypeCode:sequence.subtypeCode,
    subjectCode:sequence.subjectCode
   },
   {$set:{nextNumber:sequence.nextNumber}},
   {upsert:true,runValidators:true}
  );
 }

 console.log("Repair complete.");
 await mongoose.disconnect();
};

main().catch(async error=>{
 console.error(error.message);
 await mongoose.disconnect().catch(()=>{});
 process.exit(1);
});
