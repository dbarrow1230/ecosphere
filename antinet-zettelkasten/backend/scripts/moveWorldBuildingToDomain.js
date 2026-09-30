/* global process */
import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import Domain from "../models/domainModel.js";
import Project from "../models/projectModel.js";
import RecordSubtype from "../models/recordSubtypeModel.js";
import Zettel from "../models/zettelModel.js";

const loadEnv=()=>{
 const envPath=path.resolve("backend",".env");
 if(!fs.existsSync(envPath))return;
 for(const line of fs.readFileSync(envPath,"utf8").split(/\r?\n/)){
  const text=line.trim();
  if(!text||text.startsWith("#")||!text.includes("="))continue;
  const separator=text.indexOf("=");
  const key=text.slice(0,separator).trim();
  const value=text.slice(separator+1).trim().replace(/^"|"$/g,"");
  if(key&&!process.env[key])process.env[key]=value;
 }
};

const main=async()=>{
 loadEnv();
 if(!process.env.MONGO_URI)throw new Error("MONGO_URI is not defined");
 await mongoose.connect(process.env.MONGO_URI);
 const userIds=await Project.distinct("userId");
 let updated=0;
 for(const userId of userIds){
  const domain=await Domain.findOneAndUpdate(
   {userId,code:"WORLD-BUILDING"},
   {$setOnInsert:{userId,name:"World Building",code:"WORLD-BUILDING",description:"Worldbuilding, fictional settings, cultures, histories, and systems.",status:"active"}},
   {upsert:true,returnDocument:"after"}
  );
  const subtype=await RecordSubtype.findOne({userId,recordType:"ZTL",code:{$in:["WORLD-BUILDING","WORLDBUILDING"]}});
  if(!subtype)continue;
  const records=await Zettel.find({userId,subtype:subtype._id});
  for(const zettel of records){
   const remaining=zettel.subtype.filter(id=>String(id)!==String(subtype._id));
   if(!remaining.length){
    const fallback=await RecordSubtype.findOne({userId,recordType:"ZTL",code:"CONCEPT",status:"active"});
    if(fallback)remaining.push(fallback._id);
   }
   zettel.domainId=domain._id;
   zettel.subtype=remaining;
   if(["WORLD-BUILDING","WORLDBUILDING"].includes(zettel.idSubtype))zettel.idSubtype="CONCEPT";
   await zettel.save();
   updated+=1;
  }
  subtype.status="archived";
  await subtype.save();
 }
 console.log("Moved World Building from subtype to domain on "+updated+" zettel(s).");
 await mongoose.disconnect();
};

main().catch(async error=>{
 console.error(error.message);
 await mongoose.disconnect().catch(()=>{});
 process.exitCode=1;
});
