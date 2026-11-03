//backend/controllers/finance/pricingController.js
import Pricing from "../../models/finance/pricingModel.js";

export const createPricing=async(req,res)=>{
 try{
  const payload={...req.body};
  if(req.user?._id) payload.createdBy=req.user._id;

  const pricing=await Pricing.create(payload);
  return res.status(201).json(pricing);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const getPricing=async(req,res)=>{
 try{
  const query={};
  if(req.query.category) query.category=req.query.category;
  if(req.query.service) query.service=req.query.service;

  const pricing=await Pricing.find(query).sort({createdAt:-1});
  return res.status(200).json(pricing);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const getPricingById=async(req,res)=>{
 try{
  const pricing=await Pricing.findById(req.params.id);
  if(!pricing) return res.status(404).json({message:"Pricing not found"});
  return res.status(200).json(pricing);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const updatePricing=async(req,res)=>{
 try{
  const pricing=await Pricing.findByIdAndUpdate(req.params.id,{$set:req.body},{returnDocument:"after",runValidators:true});
  if(!pricing) return res.status(404).json({message:"Pricing not found"});
  return res.status(200).json(pricing);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const deletePricing=async(req,res)=>{
 try{
  const pricing=await Pricing.findById(req.params.id);
  if(!pricing) return res.status(404).json({message:"Pricing not found"});
  await pricing.deleteOne();
  return res.status(200).json({message:"Pricing removed"});
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};