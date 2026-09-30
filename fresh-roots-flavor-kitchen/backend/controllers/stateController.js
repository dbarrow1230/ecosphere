// backend/controllers/stateController.js
import mongoose from "mongoose";
import State from "../models/stateModel.js";

export const createState=async(req,res)=>{
 try{
  const{name,abbreviation}=req.body;

  if(!name||!abbreviation)
   return res.status(400).json({success:false,message:"name and abbreviation are required"});

  const state=await State.create({
   name,
   abbreviation
  });

  return res.status(201).json({success:true,data:state});
 }
 catch(error){
  if(error.code===11000)
   return res.status(409).json({success:false,message:"State already exists"});
  return res.status(500).json({success:false,message:error.message});
 }
};

export const getStates=async(req,res)=>{
 try{
  const states=await State.find().sort({name:1});

  return res.status(200).json({success:true,count:states.length,data:states});
 }
 catch(error){
  return res.status(500).json({success:false,message:error.message});
 }
};

export const getStateById=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"Invalid state id"});

  const state=await State.findById(id);

  if(!state)
   return res.status(404).json({success:false,message:"State not found"});

  return res.status(200).json({success:true,data:state});
 }
 catch(error){
  return res.status(500).json({success:false,message:error.message});
 }
};