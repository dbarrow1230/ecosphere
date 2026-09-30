import mongoose from "mongoose";
import Client from "../../models/admin/clientModel.js";

const isValidObjectId=id=>mongoose.Types.ObjectId.isValid(id);
const cleanRef=value=>value||null;

export const createClient=async(req,res)=>{
 try{
  const client=await Client.create({
   ...req.body,
   state:cleanRef(req.body.state),
   country:cleanRef(req.body.country)
  });
  const populated=await Client.findById(client._id).populate("state").populate("country");
  return res.status(201).json({success:true,message:"Client created successfully",client:populated,data:populated});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to create client",error:error.message});
 }
};

export const getClients=async(req,res)=>{
 try{
  const clients=await Client.find({}).populate("state").populate("country").sort({createdAt:-1});
  return res.status(200).json({success:true,clients,data:clients});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch clients",error:error.message});
 }
};

export const getClientById=async(req,res)=>{
 try{
  if(!isValidObjectId(req.params.id))return res.status(400).json({success:false,message:"Invalid client id"});
  const client=await Client.findById(req.params.id).populate("state").populate("country");
  if(!client)return res.status(404).json({success:false,message:"Client not found"});
  return res.status(200).json({success:true,client,data:client});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch client",error:error.message});
 }
};

export const updateClient=async(req,res)=>{
 try{
  if(!isValidObjectId(req.params.id))return res.status(400).json({success:false,message:"Invalid client id"});
  const client=await Client.findByIdAndUpdate(req.params.id,{
   ...req.body,
   state:cleanRef(req.body.state),
   country:cleanRef(req.body.country)
  },{new:true,runValidators:true}).populate("state").populate("country");
  if(!client)return res.status(404).json({success:false,message:"Client not found"});
  return res.status(200).json({success:true,message:"Client updated successfully",client,data:client});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to update client",error:error.message});
 }
};

export const deleteClient=async(req,res)=>{
 try{
  if(!isValidObjectId(req.params.id))return res.status(400).json({success:false,message:"Invalid client id"});
  const client=await Client.findByIdAndDelete(req.params.id);
  if(!client)return res.status(404).json({success:false,message:"Client not found"});
  return res.status(200).json({success:true,message:"Client deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete client",error:error.message});
 }
};
