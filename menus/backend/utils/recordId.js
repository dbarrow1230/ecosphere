import mongoose from "mongoose";

export const toCode=value=>String(value||"").trim().toUpperCase().replace(/[^A-Z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,24);

export const toSubjectCode=value=>{
 const words=String(value||"").trim().toUpperCase().split(/[^A-Z0-9]+/).filter(Boolean);
 if(words.length>1)return words.map(word=>word.slice(0,3)).join("").slice(0,12);
 return (words[0]||"").slice(0,12);
};

export const generateRecordId=async({userId,recordType,projectCode="",subtype="",subjectCode=""})=>{
 if(!mongoose.isValidObjectId(userId))throw new Error("A valid user is required to generate a record ID");

 const normalizedType=toCode(recordType);
 if(!normalizedType)throw new Error("Record type is required to generate a record ID");

 const normalizedProject=toCode(projectCode)||"GENERAL";
 const normalizedSubtype=toCode(subtype)||"GENERAL";
 const normalizedSubject=toSubjectCode(subjectCode)||"GENERAL";
 const now=new Date();
 const date=[now.getFullYear(),String(now.getMonth()+1).padStart(2,"0"),String(now.getDate()).padStart(2,"0")].join("");
 const sequenceKey={userId:new mongoose.Types.ObjectId(userId),recordType:normalizedType,projectCode:normalizedProject,subtypeCode:normalizedSubtype,subjectCode:`${normalizedSubject}-${date}`};
 const sequence=await mongoose.connection.collection("id_sequences").findOneAndUpdate(
  sequenceKey,
  {$inc:{nextNumber:1},$setOnInsert:{createdAt:now}},
  {upsert:true,returnDocument:"after"}
 );
 const nextNumber=Number(sequence?.nextNumber||1);

 return [normalizedType,normalizedProject,normalizedSubtype,normalizedSubject,date,String(nextNumber).padStart(3,"0")].join("-");
};
