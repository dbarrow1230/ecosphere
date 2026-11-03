// backend/controllers/serviceController.js
import Service from "../models/serviceModel.js";

export const createService=async(req,res)=>{
 try{
  const {name,category,description,priceType,price,unit,status,notes}=req.body;
  const service=await Service.create({
   name,
   category,
   description,
   priceType,
   price,
   unit,
   status,
   notes
  });
  res.status(201).json({success:true,message:"Service created successfully",service});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const getServices=async(req,res)=>{
 try{
  const services=await Service.find().sort({name:1});
  res.status(200).json({success:true,count:services.length,services});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const getSingleService=async(req,res)=>{
 try{
  const service=await Service.findById(req.params.id);
  if(!service){
   return res.status(404).json({success:false,message:"Service not found"});
  }
  res.status(200).json({success:true,service});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const updateService=async(req,res)=>{
 try{
  const service=await Service.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after",runValidators:true});
  if(!service){
   return res.status(404).json({success:false,message:"Service not found"});
  }
  res.status(200).json({success:true,message:"Service updated successfully",service});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const deleteService=async(req,res)=>{
 try{
  const service=await Service.findByIdAndDelete(req.params.id);
  if(!service){
   return res.status(404).json({success:false,message:"Service not found"});
  }
  res.status(200).json({success:true,message:"Service deleted successfully"});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};