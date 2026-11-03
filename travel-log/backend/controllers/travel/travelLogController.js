import mongoose from "mongoose";
import TravelLog from "../../models/travel/travelLogModel.js";
import {logFields} from "../../../src/config/travelFields.js";

const fail = (res,error) => res.status(error.name === "ValidationError" || error.name === "CastError" ? 400 : 500)
 .json({message:error.name === "ValidationError" || error.name === "CastError" ? error.message : "Unable to access travel logs."});
const validId = (req,res) => {
 if(mongoose.isObjectIdOrHexString(req.params.id)) return true;
 res.status(400).json({message:"Invalid log ID."});
 return false;
};
const payload = (body,kind) => Object.fromEntries(logFields[kind].map(field=>[
 field.name,field.type === "number" ? (body[field.name] === "" || body[field.name] == null ? null : Number(body[field.name])) : String(body[field.name] ?? "")
]));
export const list = async(req,res)=>{
 try {
  if(req.query.kind && !Object.hasOwn(logFields,req.query.kind)) return res.status(400).json({message:"Invalid log type."});
  const filter={user:req.user._id};
  if(req.query.kind) filter.kind=req.query.kind;
  res.json({logs:await TravelLog.find(filter).sort({date:-1,createdAt:-1}).lean()});
 } catch(error) {fail(res,error);}
};
export const get = async(req,res)=>{
 if(!validId(req,res)) return;
 try {
  const log=await TravelLog.findOne({_id:req.params.id,user:req.user._id}).lean();
  if(!log) return res.status(404).json({message:"Log not found."});
  res.json({log});
 } catch(error) {fail(res,error);}
};
export const create = async(req,res)=>{
 try {
  const kind=req.body.kind;
  if(!Object.hasOwn(logFields,kind)) return res.status(400).json({message:"Choose travel or hiking."});
  const log=await TravelLog.create({...payload(req.body,kind),kind,user:req.user._id});
  res.status(201).json({log});
 } catch(error) {fail(res,error);}
};
export const update = async(req,res)=>{
 if(!validId(req,res)) return;
 try {
  const log=await TravelLog.findOne({_id:req.params.id,user:req.user._id});
  if(!log) return res.status(404).json({message:"Log not found."});
  log.set(payload(req.body,log.kind));
  await log.save();
  res.json({log});
 } catch(error) {fail(res,error);}
};
