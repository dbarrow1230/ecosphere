/* global process */
import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import RecordSubtype from "../models/recordSubtypeModel.js";
import Zettel from "../models/zettelModel.js";

const envPath=path.resolve("backend",".env");
for(const line of fs.readFileSync(envPath,"utf8").split(/\r?\n/)){
 const match=line.match(/^\s*([^#=]+?)\s*=\s*(.*?)\s*$/);
 if(match&&!process.env[match[1]])process.env[match[1]]=match[2].replace(/^"|"$/g,"");
}

await mongoose.connect(process.env.MONGO_URI);
const templates=await RecordSubtype.find({recordType:"ZTL",code:"TEMPLATE"});
let updated=0;
for(const template of templates){
 const concept=await RecordSubtype.findOne({userId:template.userId,recordType:"ZTL",code:"CONCEPT",status:"active"});
 if(concept){
  const records=await Zettel.find({userId:template.userId,subtype:template._id});
  for(const record of records){
   record.subtype=[...new Set(record.subtype.map(id=>String(id)===String(template._id)?String(concept._id):String(id)))];
   if(record.idSubtype==="TEMPLATE")record.idSubtype="CONCEPT";
   await record.save();
   updated+=1;
  }
 }
 template.status="archived";
 await template.save();
}
console.log(`Archived Template as a Zettel subtype and corrected ${updated} record(s).`);
await mongoose.disconnect();
