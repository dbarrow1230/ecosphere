//backend/controllers/finance/estimateController.js
import Estimate from "../../models/finance/estimateModel.js";

export const createEstimate=async(req,res)=>{
 try{
  const payload={...req.body};
  if(req.user?._id) payload.createdBy=req.user._id;

  const estimate=await Estimate.create(payload);
  return res.status(201).json(estimate);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const getEstimates=async(req,res)=>{
 try{
  const query={};
  if(req.query.project) query.project=req.query.project;
  if(req.query.clientBusiness) query.clientBusiness=req.query.clientBusiness;
  if(req.query.status) query.status=req.query.status;

  const estimates=await Estimate.find(query).sort({createdAt:-1});
  return res.status(200).json(estimates);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const getEstimateById=async(req,res)=>{
 try{
  const estimate=await Estimate.findById(req.params.id);
  if(!estimate) return res.status(404).json({message:"Estimate not found"});
  return res.status(200).json(estimate);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const updateEstimate=async(req,res)=>{
 try{
  const estimate=await Estimate.findByIdAndUpdate(req.params.id,{$set:req.body},{returnDocument:"after",runValidators:true});
  if(!estimate) return res.status(404).json({message:"Estimate not found"});
  return res.status(200).json(estimate);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const deleteEstimate=async(req,res)=>{
 try{
  const estimate=await Estimate.findById(req.params.id);
  if(!estimate) return res.status(404).json({message:"Estimate not found"});
  await estimate.deleteOne();
  return res.status(200).json({message:"Estimate removed"});
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};