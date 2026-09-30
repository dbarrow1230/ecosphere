// backend/controllers/dehydrationProcessController.js
import "../../models/pricing/marketPriceModel.js";
import DehydrationProcess from "../../models/preservation/dehydration/dehydrationProcessModel.js";

export const getAll=async(req,res)=>{
 try{
  const processes=await DehydrationProcess.find()
  .populate("dehydrationSetup")
  .populate("electricityRate")
  .populate("itemDetails.marketPriceRef")
  .sort({createdAt:-1});

  res.json(processes);
 }catch(err){
  res.status(500).json({message:err.message});
 }
};

export const getById=async(req,res)=>{
 try{
  const process=await DehydrationProcess.findById(req.params.id)
  .populate("dehydrationSetup")
  .populate("electricityRate")
  .populate("itemDetails.marketPriceRef");

  if(!process) return res.status(404).json({message:"Not found"});
  res.json(process);
 }catch(err){
  res.status(500).json({message:err.message});
 }
};

export const create=async(req,res)=>{
 try{
  const process=new DehydrationProcess(req.body);
  const saved=await process.save();
  res.status(201).json(saved);
 }catch(err){
  res.status(400).json({message:err.message});
 }
};

export const update=async(req,res)=>{
 try{
  const process=await DehydrationProcess.findByIdAndUpdate(
   req.params.id,
   req.body,
   {returnDocument:"after",runValidators:true}
  );

  if(!process) return res.status(404).json({message:"Not found"});
  res.json(process);
 }catch(err){
  res.status(400).json({message:err.message});
 }
};

export const remove=async(req,res)=>{
 try{
  const process=await DehydrationProcess.findByIdAndDelete(req.params.id);
  if(!process) return res.status(404).json({message:"Not found"});
  res.json({message:"Deleted"});
 }catch(err){
  res.status(500).json({message:err.message});
 }
};

