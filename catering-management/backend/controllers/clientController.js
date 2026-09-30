import Client from "../models/clientModel.js";
import State from "../models/locations/stateModel.js";
import Country from "../models/locations/countryModel.js";

export const getClients=async(req,res)=>{
 try{
  const clients=await Client.find()
   .populate({path:"state",model:State})
   .populate({path:"country",model:Country});
  res.json({success:true,clients,data:clients});
 }catch(err){
  res.status(500).json({success:false,message:err.message});
 }
};

export const getClientById=async(req,res)=>{
 try{
  const client=await Client.findById(req.params.id)
   .populate({path:"state",model:State})
   .populate({path:"country",model:Country});
  if(!client){return res.status(404).json({success:false,message:"Client not found"});}
  res.json({success:true,client,data:client});
 }catch(err){
  res.status(500).json({success:false,message:err.message});
 }
};

export const createClient=async(req,res)=>{
 try{
  const payload={
   ...req.body,
   status:String(req.body.status||"active").trim().toLowerCase(),
   state:req.body.state||null,
   country:req.body.country||null
  };
  const client=new Client(payload);
  const saved=await client.save();
  const populated=await Client.findById(saved._id)
   .populate({path:"state",model:State})
   .populate({path:"country",model:Country});
  res.status(201).json({success:true,client:populated,data:populated});
 }catch(err){
  res.status(400).json({success:false,message:err.message});
 }
};

export const updateClient=async(req,res)=>{
 try{
  const payload={
   ...req.body,
   status:String(req.body.status||"active").trim().toLowerCase(),
   state:req.body.state||null,
   country:req.body.country||null
  };
  const updated=await Client.findByIdAndUpdate(req.params.id,payload,{returnDocument:"after",runValidators:true});
  if(!updated){return res.status(404).json({success:false,message:"Client not found"});}
  const client=await Client.findById(updated._id)
   .populate({path:"state",model:State})
   .populate({path:"country",model:Country});
  res.json({success:true,client,data:client});
 }catch(err){
  res.status(400).json({success:false,message:err.message});
 }
};

export const deleteClient=async(req,res)=>{
 try{
  const client=await Client.findByIdAndDelete(req.params.id);
  if(!client){return res.status(404).json({success:false,message:"Client not found"});}
  res.json({success:true,message:"Client deleted"});
 }catch(err){
  res.status(500).json({success:false,message:err.message});
 }
};