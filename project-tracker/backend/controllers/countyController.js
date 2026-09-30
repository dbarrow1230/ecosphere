// backend/controllers/countyController.js
import mongoose from "mongoose";
import County from "../models/countyModel.js";

export const createCounty=async(req,res)=>{
 try{
  const{name,code,state,country,isActive=true}=req.body;

  if(!name||!state||!country)
   return res.status(400).json({success:false,message:"name, state and country are required"});

  if(!mongoose.Types.ObjectId.isValid(state))
   return res.status(400).json({success:false,message:"Invalid state id"});

  if(!mongoose.Types.ObjectId.isValid(country))
   return res.status(400).json({success:false,message:"Invalid country id"});

  const county=await County.create({
   name,
   code,
   state,
   country,
   isActive
  });

  return res.status(201).json({success:true,message:"County created successfully",data:county});
 }
 catch(error){
  if(error.code===11000)
   return res.status(409).json({success:false,message:"County already exists for this state"});
  return res.status(500).json({success:false,message:"Failed to create county",error:error.message});
 }
};

export const getCounties=async(req,res)=>{
 try{
  const{state,country,isActive,name}=req.query;
  const query={};

  if(state){
   if(!mongoose.Types.ObjectId.isValid(state))
    return res.status(400).json({success:false,message:"Invalid state id"});
   query.state=state;
  }

  if(country){
   if(!mongoose.Types.ObjectId.isValid(country))
    return res.status(400).json({success:false,message:"Invalid country id"});
   query.country=country;
  }

  if(isActive!==undefined)query.isActive=isActive;
  if(name)query.name=name;

  const counties=await County.find(query)
  .populate("state","name code")
  .populate("country","name iso2 iso3")
  .sort({name:1});

  return res.status(200).json({success:true,count:counties.length,data:counties});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch counties",error:error.message});
 }
};

export const getCountyById=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"Invalid county id"});

  const county=await County.findById(id)
  .populate("state","name code")
  .populate("country","name iso2 iso3");

  if(!county)
   return res.status(404).json({success:false,message:"County not found"});

  return res.status(200).json({success:true,data:county});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch county",error:error.message});
 }
};

export const updateCounty=async(req,res)=>{
 try{
  const{id}=req.params;
  const updateData={...req.body};

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"Invalid county id"});

  if(updateData.state&&!mongoose.Types.ObjectId.isValid(updateData.state))
   return res.status(400).json({success:false,message:"Invalid state id"});

  if(updateData.country&&!mongoose.Types.ObjectId.isValid(updateData.country))
   return res.status(400).json({success:false,message:"Invalid country id"});

  const county=await County.findByIdAndUpdate(
   id,
   updateData,
   {returnDocument:"after",runValidators:true}
  )
  .populate("state","name code")
  .populate("country","name iso2 iso3");

  if(!county)
   return res.status(404).json({success:false,message:"County not found"});

  return res.status(200).json({success:true,message:"County updated successfully",data:county});
 }
 catch(error){
  if(error.code===11000)
   return res.status(409).json({success:false,message:"County already exists for this state"});
  return res.status(500).json({success:false,message:"Failed to update county",error:error.message});
 }
};

export const deleteCounty=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"Invalid county id"});

  const county=await County.findByIdAndDelete(id);

  if(!county)
   return res.status(404).json({success:false,message:"County not found"});

  return res.status(200).json({success:true,message:"County deleted successfully"});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to delete county",error:error.message});
 }
};