// backend/controllers/poetryMeterController.js
import PoetryMeter from "../models/PoetryMeter.js";

export const getPoetryMeters=async(req,res)=>{
 try{
  const meters=await PoetryMeter.find().sort({name:1});
  res.json(meters);
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

export const getPoetryMeter=async(req,res)=>{
 try{
  const meter=await PoetryMeter.findById(req.params.id);

  if(!meter){
   return res.status(404).json({message:"Poetry meter not found"});
  }

  res.json(meter);
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

export const createPoetryMeter=async(req,res)=>{
 try{
  const meter=await PoetryMeter.create(req.body);
  res.status(201).json(meter);
 }catch(error){
  if(error.code===11000){
   return res.status(409).json({message:"Poetry meter already exists"});
  }

  res.status(400).json({message:error.message});
 }
};

export const updatePoetryMeter=async(req,res)=>{
 try{
  const meter=await PoetryMeter.findByIdAndUpdate(
   req.params.id,
   req.body,
   {returnDocument:"after",runValidators:true}
  );

  if(!meter){
   return res.status(404).json({message:"Poetry meter not found"});
  }

  res.json(meter);
 }catch(error){
  if(error.code===11000){
   return res.status(409).json({message:"Poetry meter already exists"});
  }

  res.status(400).json({message:error.message});
 }
};

export const deletePoetryMeter=async(req,res)=>{
 try{
  const meter=await PoetryMeter.findByIdAndDelete(req.params.id);

  if(!meter){
   return res.status(404).json({message:"Poetry meter not found"});
  }

  res.json({message:"Poetry meter deleted"});
 }catch(error){
  res.status(500).json({message:error.message});
 }
};