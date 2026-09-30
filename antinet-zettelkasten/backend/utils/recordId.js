// backend/utils/recordId.js
import mongoose from "mongoose";
import IdSequence from "../models/idSequenceModel.js";
import Project from "../models/projectModel.js";
import Domain from "../models/domainModel.js";

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
 domainId=null,
 domainCode="",
 projectId=null,
 projectCode="",
 subtype="",
 subtypeCode="",
 subject="",
 subjectCode="",
 existingId="",
 recordDate=null
})=>{
 if(!mongoose.isValidObjectId(userId)){
  throw new Error("A valid user is required to generate a record ID");
 }

 const normalizedType=toCode(recordType);

 if(!normalizedType){
  throw new Error("Record type is required to generate a record ID");
 }

 let normalizedProjectCode=toCode(domainCode);

 if(domainId&&!normalizedProjectCode){
  if(!mongoose.isValidObjectId(domainId))throw new Error("Selected domain ID is invalid");
  const domain=await Domain.findOne({_id:domainId,userId}).select("code").lean();
  if(!domain)throw new Error("Selected domain was not found");
  normalizedProjectCode=toCode(domain.code);
 }

 // projectCode remains a compatibility fallback for older callers.
 if(!normalizedProjectCode)normalizedProjectCode=toCode(projectCode);

 if(projectId&&!normalizedProjectCode){
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
 if(!normalizedProjectCode)normalizedProjectCode="GENERAL";

 const normalizedSubtype=toCode(
  subtypeCode||
  subtype
 )||"GENERAL";

 const normalizedSubject=toSubjectCode(
  subjectCode||
  subject
 )||"GENERAL";

 const suppliedDate=recordDate?new Date(recordDate):null;
 const validSuppliedDate=suppliedDate&&!Number.isNaN(suppliedDate.getTime())?suppliedDate:null;
 const existingDate=String(existingId||"").match(/-(\d{8})-\d{3}$/)?.[1]||"";
 const generatedAt=validSuppliedDate||new Date();
 const generatedDate=validSuppliedDate?[
  generatedAt.getFullYear(),
  String(generatedAt.getMonth()+1).padStart(2,"0"),
  String(generatedAt.getDate()).padStart(2,"0")
 ].join(""):existingDate||[
  generatedAt.getFullYear(),
  String(generatedAt.getMonth()+1).padStart(2,"0"),
  String(generatedAt.getDate()).padStart(2,"0")
 ].join("");

 const nextNumber=await reserveNextNumber({
  userId,
  recordType:normalizedType,
  projectCode:normalizedProjectCode,
  subtypeCode:normalizedSubtype,
  subjectCode:`${normalizedSubject}-${generatedDate}`
 });

 const idParts=[normalizedType];

 idParts.push(normalizedProjectCode);

 idParts.push(normalizedSubtype);
 idParts.push(normalizedSubject);
 idParts.push(generatedDate);

 idParts.push(
  String(nextNumber).padStart(3,"0")
 );

 return idParts.join("-");
};
