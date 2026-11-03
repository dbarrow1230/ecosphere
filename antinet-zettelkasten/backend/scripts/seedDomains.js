/* global process */
import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import Domain from "../models/domainModel.js";
import Project from "../models/projectModel.js";
import {toCode} from "../utils/recordId.js";

const domainNames=["Bible Study","Blogging","Poetry","Writing","Book","Web","Music","Technology","World Building"];

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

const main=async()=>{
 loadEnv();
 if(!process.env.MONGO_URI)throw new Error("MONGO_URI is not defined");
 await mongoose.connect(process.env.MONGO_URI);
 const userIds=await Project.distinct("userId");
 if(!userIds.length)throw new Error("No Zettelkasten users were found");
 let created=0;
 for(const userId of userIds){
  for(const name of domainNames){
   const code=toCode(name);
   const result=await Domain.updateOne(
    {userId,code},
    {$setOnInsert:{userId,name,code,description:"",status:"active"}},
    {upsert:true}
   );
   if(result.upsertedCount)created+=1;
  }
 }
 console.log("Seeded "+created+" new domains for "+userIds.length+" user account(s).");
 await mongoose.disconnect();
};

main().catch(async error=>{
 console.error(error.message);
 await mongoose.disconnect().catch(()=>{});
 process.exitCode=1;
});
