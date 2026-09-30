// backend/utils/recordId.js
import mongoose from "mongoose";
import IdSequence from "../models/idSequenceModel.js";
import Project from "../models/projectModel.js";

// Helper: normalize text used inside generated record IDs
export const toCode=value=>String(value||"").trim().toUpperCase().replace(/[^A-Z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,24);

// Helper: create a compact subject code such as Darrell Dubquois -> DARDUB
export const toSubjectCode=value=>{
 const words=String(value||"").trim().toUpperCase().split(/[^A-Z0-9]+/).filter(Boolean);
 if(words.length>1)return words.map(word=>word.slice(0,3)).join("").slice(0,12);
 return (words[0]||"").slice(0,12);
};

// Helper: atomically reserve the next available sequence number
const reserveNextNumber=async filter=>{
 const existing=await IdSequence.findOneAndUpdate(
  filter,
  {$inc:{nextNumber:1}},
  {
   returnDocument:"before",
   runValidators:true
  }
 );

 if(existing)return existing.nextNumber;

 try{
  await IdSequence.create({
   ...filter,
   nextNumber:2
  });

  return 1;
 }catch(error){
  if(error.code!==11000)throw error;

  const retry=await IdSequence.findOneAndUpdate(
   filter,
   {$inc:{nextNumber:1}},
   {
    returnDocument:"before",
    runValidators:true
   }
  );

  if(!retry){
   throw new Error("Unable to reserve the next record ID number");
  }

  return retry.nextNumber;
 }
};

// Helper: generate the next structured record ID
export const generateRecordId=async({
 userId,
 recordType,
 projectId=null,
 projectCode="",
 includeProject=true,
 subtype="",
 subtypeCode="",
 subject="",
 subjectCode=""
})=>{
 if(!mongoose.isValidObjectId(userId)){
  throw new Error("A valid user is required to generate a record ID");
 }

 const normalizedType=toCode(recordType);

 if(!normalizedType){
  throw new Error("Record type is required to generate a record ID");
 }

 let normalizedProjectCode=includeProject?toCode(projectCode):"";

 if(includeProject&&projectId&&!normalizedProjectCode){
  if(!mongoose.isValidObjectId(projectId)){
   throw new Error("Selected project ID is invalid");
  }

  const project=await Project.findOne({
   _id:projectId,
   userId
  }).select("code").lean();

  if(!project){
   throw new Error("Selected project was not found");
  }

  normalizedProjectCode=toCode(project.code);
 }

 // Records may exist outside a project. Keep their IDs structured and
 // sequence-safe by placing them in the shared GENERAL project segment.
 if(includeProject&&!normalizedProjectCode)normalizedProjectCode="GENERAL";

 const normalizedSubtype=toCode(
  subtypeCode||
  subtype
 );

 const normalizedSubject=toSubjectCode(
  subjectCode||
  subject
 );

 const nextNumber=await reserveNextNumber({
  userId,
  recordType:normalizedType,
  projectCode:includeProject?normalizedProjectCode:"NO-PROJECT",
  subtypeCode:normalizedSubtype,
  subjectCode:normalizedSubject
 });

 const idParts=[normalizedType];

 if(includeProject)idParts.push(normalizedProjectCode);

 if(normalizedSubtype){
  idParts.push(normalizedSubtype);
 }

 if(normalizedSubject){
  idParts.push(normalizedSubject);
 }

 idParts.push(
  String(nextNumber).padStart(3,"0")
 );

 return idParts.join("-");
};
