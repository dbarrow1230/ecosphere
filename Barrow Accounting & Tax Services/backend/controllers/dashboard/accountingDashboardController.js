import mongoose from "mongoose";
import Client from "../../models/clientModel.js";
import Work,{services,workStatuses} from "../../models/accountingWorkModel.js";
import Inquiry from "../../models/Inquiry.js";
import User from "../../models/users/userModel.js";
import {clientScope} from "../clientPolicy.js";
import {accountingSummary} from "../../services/dashboard/accountingSummary.js";

async function visibleClients(req){return Client.find(clientScope(req)).select("name company email status assignedTo updatedAt").populate({path:"assignedTo",model:User,select:"username email"}).sort({updatedAt:-1}).lean();}
export async function getAccountingDashboard(req,res,next){
 try{
  const clients=await visibleClients(req);
  const work=await Work.find({client:{$in:clients.map(client=>client._id)}}).populate({path:"client",model:Client,select:"name company"}).sort({dueDate:1,updatedAt:-1}).lean();
  const inquiries=req.canManageAllClients?await Inquiry.find({status:"new"}).select("name email message createdAt").sort({createdAt:-1}).limit(10).lean():[];
  res.json({canManageAllClients:req.canManageAllClients,summary:accountingSummary(clients,work,{owner:req.canManageAllClients}),clients,work,inquiries,services,statuses:workStatuses});
 }catch(error){next(error);}
}
async function accessibleClient(req,id){return mongoose.isValidObjectId(id)?Client.exists({...clientScope(req),_id:id}):null;}
function workPayload(body){
 const payload={};
 for(const key of ["title","service","status","notes"])if(Object.hasOwn(body,key))payload[key]=body[key];
 if(Object.hasOwn(body,"dueDate")){
  if(body.dueDate&&!/^\d{4}-\d{2}-\d{2}$/.test(body.dueDate))throw Error("Choose a valid due date.");
  payload.dueDate=body.dueDate?new Date(`${body.dueDate}T00:00:00.000Z`):null;
  if(payload.dueDate&&(Number.isNaN(payload.dueDate.getTime())||payload.dueDate.toISOString().slice(0,10)!==body.dueDate))throw Error("Choose a valid due date.");
 }
 return payload;
}
export async function createAccountingWork(req,res,next){
 try{
  if(!await accessibleClient(req,req.body.client))return res.status(404).json({message:"Client not found."});
  let payload;try{payload=workPayload(req.body);}catch(error){return res.status(400).json({message:error.message});}
  const item=await Work.create({...payload,client:req.body.client,createdBy:req.user._id});
  res.status(201).json({item});
 }catch(error){next(error);}
}
export async function updateAccountingWork(req,res,next){
 try{
  if(!mongoose.isValidObjectId(req.params.id))return res.status(404).json({message:"Work item not found."});
  const clientIds=await Client.find(clientScope(req)).distinct("_id");
  let payload;try{payload=workPayload(req.body);}catch(error){return res.status(400).json({message:error.message});}
  const item=await Work.findOneAndUpdate({_id:req.params.id,client:{$in:clientIds}},{$set:payload},{returnDocument:"after",runValidators:true});
  if(!item)return res.status(404).json({message:"Work item not found."});
  res.json({item});
 }catch(error){next(error);}
}
export async function reviewInquiry(req,res,next){
 if(!req.canManageAllClients)return res.status(403).json({message:"Owner access is required."});
 if(!mongoose.isValidObjectId(req.params.id))return res.status(404).json({message:"Inquiry not found."});
 try{const item=await Inquiry.findByIdAndUpdate(req.params.id,{$set:{status:"reviewed"}},{returnDocument:"after"});if(!item)return res.status(404).json({message:"Inquiry not found."});res.json({reviewed:true});}catch(error){next(error);}
}
