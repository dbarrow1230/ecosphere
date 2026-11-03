// backend/controllers/fuelSourceController.js
import mongoose from "mongoose";
import FuelSource from "../../models/finance/fuelSourceModel.js";

export const getFuelSources=async(req,res)=>{
 try{
  const query={};

  if(req.query.isActive!==""){
   if(req.query.isActive==="true")query.isActive=true;
   if(req.query.isActive==="false")query.isActive=false;
  }

  if(req.query.fuelType)query.fuelType=req.query.fuelType;

  const fuelSources=await FuelSource.find(query).sort({name:1,createdAt:-1});

  return res.status(200).json({success:true,count:fuelSources.length,fuelSources});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch fuel sources.",error:error.message});
 }
};

export const getFuelSourceById=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({success:false,message:"Invalid fuel source id."});
  }

  const fuelSource=await FuelSource.findById(id);

  if(!fuelSource){
   return res.status(404).json({success:false,message:"Fuel source not found."});
  }

  return res.status(200).json({success:true,fuelSource});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch fuel source.",error:error.message});
 }
};

export const createFuelSource=async(req,res)=>{
 try{
  const fuelSource=await FuelSource.create({
   name:req.body.name,
   fuelType:req.body.fuelType,
   unit:req.body.unit,
   defaultRatePerUnit:req.body.defaultRatePerUnit,
   isActive:req.body.isActive,
   notes:req.body.notes
  });

  return res.status(201).json({success:true,message:"Fuel source created successfully.",fuelSource});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to create fuel source.",error:error.message});
 }
};

export const updateFuelSource=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({success:false,message:"Invalid fuel source id."});
  }

  const fuelSource=await FuelSource.findByIdAndUpdate(id,{
   name:req.body.name,
   fuelType:req.body.fuelType,
   unit:req.body.unit,
   defaultRatePerUnit:req.body.defaultRatePerUnit,
   isActive:req.body.isActive,
   notes:req.body.notes
  },{returnDocument:"after",runValidators:true});

  if(!fuelSource){
   return res.status(404).json({success:false,message:"Fuel source not found."});
  }

  return res.status(200).json({success:true,message:"Fuel source updated successfully.",fuelSource});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to update fuel source.",error:error.message});
 }
};

export const deleteFuelSource=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({success:false,message:"Invalid fuel source id."});
  }

  const fuelSource=await FuelSource.findByIdAndDelete(id);

  if(!fuelSource){
   return res.status(404).json({success:false,message:"Fuel source not found."});
  }

  return res.status(200).json({success:true,message:"Fuel source deleted successfully."});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete fuel source.",error:error.message});
 }
};

