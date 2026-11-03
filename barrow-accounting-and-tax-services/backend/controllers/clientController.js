import mongoose from "mongoose";
import Client from "../models/clientModel.js";
import User from "../models/users/userModel.js";
import State from "../models/locations/stateModel.js";
import Country from "../models/locations/countryModel.js";
import {clientScope,assignmentFor} from "./clientPolicy.js";

const fields=["name","firstName","lastName","company","email","phone","altPhone","address1","address2","city","state","country","postalCode","notes","status"];
const populate=query=>query.populate({path:"assignedTo",model:User,select:"username email"}).populate({path:"state",model:State}).populate({path:"country",model:Country});
const payloadFor=body=>Object.fromEntries(fields.filter(field=>Object.hasOwn(body,field)).map(field=>[field,["state","country"].includes(field)?body[field]||null:body[field]]));

export async function getClients(req,res,next){
 try{const clients=await populate(Client.find(clientScope(req)).sort({name:1}));res.json({success:true,clients,canManageAllClients:req.canManageAllClients});}catch(error){next(error);}
}
export async function getAssignees(req,res,next){
 if(!req.canManageAllClients)return res.status(403).json({message:"Only the owner can assign clients."});
 try{res.json({users:await User.find({isActive:{$ne:false}}).select("username email").sort({username:1}).lean()});}catch(error){next(error);}
}
export async function getClient(req,res,next){
 if(!mongoose.isValidObjectId(req.params.id))return res.status(404).json({message:"Client not found."});
 try{const client=await populate(Client.findOne({...clientScope(req),_id:req.params.id}));if(!client)return res.status(404).json({message:"Client not found."});res.json({client});}catch(error){next(error);}
}
async function validateAssignment(assignedTo){
 if(assignedTo===null||assignedTo===undefined)return true;
 return mongoose.isValidObjectId(assignedTo)&&Boolean(await User.exists({_id:assignedTo,isActive:{$ne:false}}));
}
export async function createClient(req,res,next){
 try{
  const assignedTo=assignmentFor(req,true);
  if(!await validateAssignment(assignedTo))return res.status(400).json({message:"Choose an active user for the assignment."});
  const saved=await Client.create({...payloadFor(req.body),assignedTo,createdBy:req.user._id});
  res.status(201).json({client:await populate(Client.findById(saved._id))});
 }catch(error){if(error.name==="ValidationError"||error.name==="CastError")return res.status(400).json({message:error.message});next(error);}
}
export async function updateClient(req,res,next){
 if(!mongoose.isValidObjectId(req.params.id))return res.status(404).json({message:"Client not found."});
 try{
  const assignedTo=assignmentFor(req,false),payload=payloadFor(req.body);
  if(!await validateAssignment(assignedTo))return res.status(400).json({message:"Choose an active user for the assignment."});
  if(assignedTo!==undefined)payload.assignedTo=assignedTo;
  const client=await populate(Client.findOneAndUpdate({...clientScope(req),_id:req.params.id},{$set:payload},{returnDocument:"after",runValidators:true}));
  if(!client)return res.status(404).json({message:"Client not found."});
  res.json({client});
 }catch(error){if(error.name==="ValidationError"||error.name==="CastError")return res.status(400).json({message:error.message});next(error);}
}
