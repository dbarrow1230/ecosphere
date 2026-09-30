import express from "express";
import mongoose from "mongoose";
import {protect} from "../middleware/authMiddleware.js";
import {PublishingRecord,PublishingReference} from "../models/publishingModels.js";
import {workflowFields,workflowStatuses,referenceSections,referenceStatuses} from "../../src/data/publishingSchema.js";

export function validatePublishingPayload(body,reference=false){
 if(!body||typeof body!=="object"||Array.isArray(body))throw new Error("A record is required.");
 if(typeof body.title!=="string"||!body.title.trim())throw new Error("Title is required.");
 if(body.title.length>300)throw new Error("Title must be 300 characters or less.");
 if(reference){
  if(!referenceSections.includes(body.section))throw new Error("Invalid reference section.");
  if(typeof body.content!=="string"||!body.content.trim())throw new Error("Reference content is required.");
  if(!referenceStatuses.includes(body.status))throw new Error("Invalid reference status.");
  if(body.sourceUrl&&!/^https?:\/\//i.test(body.sourceUrl))throw new Error("Source links must use HTTP or HTTPS.");
  return Object.fromEntries(["title","section","content","sourceUrl","status"].map(key=>[key,body[key]]));
 }
 const stage=`${body.module}/${body.workflow}`;
 if(!workflowFields[stage])throw new Error("Invalid workflow stage.");
 if(!workflowStatuses.includes(body.status))throw new Error("Invalid workflow status.");
 for(const field of ["genres","categories"]){
  if(!Array.isArray(body[field])||body[field].length>200)throw new Error(`Invalid ${field} selection.`);
 }
 for(const field of ["author","owner","notes"]){
  if(body[field]!==undefined&&(typeof body[field]!=="string"||body[field].length>30000))throw new Error(`Invalid ${field}.`);
 }
 if(body.details!==undefined&&(!body.details||typeof body.details!=="object"||Array.isArray(body.details)))throw new Error("Invalid stage details.");
 for(const key of ["bookId","ownerId","publisher",...(body.genres||[]).map((_,i)=>`genres.${i}`),...(body.categories||[]).map((_,i)=>`categories.${i}`)]){
  const [field,index]=key.split(".");const value=index===undefined?body[field]:body[field][index];
  if(value&&!mongoose.isObjectIdOrHexString(value))throw new Error(`Invalid ${field} selection.`);
 }
 if(body.dueDate&&Number.isNaN(Date.parse(body.dueDate)))throw new Error("Invalid due date.");
 const details={};
 for(const [key,fields] of Object.entries(workflowFields)){
  if(!body.details?.[key])continue;
  details[key]={};
  for(const field of fields){
   const value=body.details[key][field.key];
   if(value===undefined)continue;
   if(typeof value!=="string"||value.length>30000)throw new Error(`Invalid ${field.label}.`);
   if(value&&field.type==="url"&&!/^https?:\/\//i.test(value))throw new Error(`${field.label} must use HTTP or HTTPS.`);
   if(value&&field.type==="file"&&!/^https?:\/\//i.test(value)&&(!/^\/publishing\/(?:[a-z0-9_-]+\/)+[^/?#]+$/i.test(value)||/\.\.|%2f|%5c/i.test(value)))throw new Error(`${field.label} must be an uploaded file or an HTTP link.`);
   if(value&&field.type==="number"&&(!Number.isFinite(Number(value))||Number(value)<0))throw new Error(`${field.label} must be a positive number or zero.`);
   if(value&&field.type==="date"&&Number.isNaN(Date.parse(value)))throw new Error(`Invalid ${field.label}.`);
   details[key][field.key]=value;
  }
 }
 return {...Object.fromEntries(["title","author","owner","module","workflow","status","notes","genres","categories"].map(key=>[key,body[key]])),bookId:body.bookId||null,ownerId:body.ownerId||null,publisher:body.publisher||null,dueDate:body.dueDate||null,details};
}

const router=express.Router();
router.use(protect);
for(const [resource,Model,reference] of [["records",PublishingRecord,false],["references",PublishingReference,true]]){
 router.get(`/${resource}`,async(req,res)=>{
  try{res.json({records:await Model.find().sort({updatedAt:-1}).lean()});}
  catch(error){res.status(500).json({message:"Unable to load publishing records.",error:error.message});}
 });
 router.post(`/${resource}`,async(req,res)=>{
  try{
   const payload=validatePublishingPayload(req.body,reference);
   if(!reference)payload.history=[{stage:`${payload.module}/${payload.workflow}`,status:payload.status,at:new Date(),by:req.user._id}];
   const record=await Model.create({...payload,createdBy:req.user._id});
   res.status(201).json({record});
  }catch(error){res.status(400).json({message:error.message});}
 });
 router.put(`/${resource}/:id`,async(req,res)=>{
  try{
   if(!mongoose.isObjectIdOrHexString(req.params.id))return res.status(400).json({message:"Invalid record ID."});
   const payload=validatePublishingPayload(req.body,reference);
   const record=await Model.findById(req.params.id);
   if(!record)return res.status(404).json({message:"Record not found."});
   if(req.body.__v!==record.__v)return res.status(409).json({message:"This record was changed elsewhere. Reload before saving."});
   if(!reference&&(record.module!==payload.module||record.workflow!==payload.workflow||record.status!==payload.status)){
    record.history.push({stage:`${payload.module}/${payload.workflow}`,status:payload.status,at:new Date(),by:req.user._id});
   }
   Object.assign(record,payload);await record.save();res.json({record});
  }catch(error){res.status(error.name==="VersionError"?409:400).json({message:error.message});}
 });
 if(!reference)router.delete(`/${resource}/:id`,async(req,res)=>{
  try{
   if(!mongoose.isObjectIdOrHexString(req.params.id))return res.status(400).json({message:"Invalid record ID."});
   const record=await Model.findByIdAndDelete(req.params.id);
   if(!record)return res.status(404).json({message:"Record not found."});
   res.json({message:"Publishing record deleted."});
  }catch(error){res.status(500).json({message:"Unable to delete publishing record.",error:error.message});}
 });
}
export default router;
