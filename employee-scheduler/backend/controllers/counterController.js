// backend/controllers/counterController.js
import Counter from "../models/counterModel.js";

export const createCounter=async(req,res)=>{
 try{
  const payload={
   business:req.body.business,
   type:req.body.type||"",
   seq:req.body.seq!==undefined?req.body.seq:0
  };

  if(!payload.business||!payload.type){
   return res.status(400).json({message:"business and type are required"});
  }

  const counter=await Counter.create(payload);

  const populatedCounter=await Counter.findById(counter._id)
   .populate("business","name");

  res.status(201).json({
   message:"Counter created successfully",
   data:populatedCounter
  });
 }catch(err){
  if(err?.code===11000){
   return res.status(409).json({message:"Counter already exists for this business and type"});
  }
  res.status(500).json({message:"Failed to create counter",error:err.message});
 }
};

export const getCounters=async(req,res)=>{
 try{
  const query={};

  if(req.query.business)query.business=req.query.business;
  if(req.query.type)query.type=req.query.type;

  const counters=await Counter.find(query)
   .populate("business","name")
   .sort({type:1,createdAt:-1});

  res.status(200).json({
   message:"Counters fetched successfully",
   data:counters
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch counters",error:err.message});
 }
};

export const getCounterById=async(req,res)=>{
 try{
  const counter=await Counter.findById(req.params.id)
   .populate("business","name");

  if(!counter){
   return res.status(404).json({message:"Counter not found"});
  }

  res.status(200).json({
   message:"Counter fetched successfully",
   data:counter
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch counter",error:err.message});
 }
};

export const updateCounter=async(req,res)=>{
 try{
  const existing=await Counter.findById(req.params.id);

  if(!existing){
   return res.status(404).json({message:"Counter not found"});
  }

  const counter=await Counter.findByIdAndUpdate(
   req.params.id,
   {
    $set:{
     business:req.body.business!==undefined?req.body.business:existing.business,
     type:req.body.type!==undefined?req.body.type:existing.type,
     seq:req.body.seq!==undefined?req.body.seq:existing.seq
    }
   },
   {returnDocument:"after",runValidators:true}
  )
   .populate("business","name");

  res.status(200).json({
   message:"Counter updated successfully",
   data:counter
  });
 }catch(err){
  if(err?.code===11000){
   return res.status(409).json({message:"Counter already exists for this business and type"});
  }
  res.status(500).json({message:"Failed to update counter",error:err.message});
 }
};

export const deleteCounter=async(req,res)=>{
 try{
  const counter=await Counter.findByIdAndDelete(req.params.id);

  if(!counter){
   return res.status(404).json({message:"Counter not found"});
  }

  res.status(200).json({
   message:"Counter deleted successfully"
  });
 }catch(err){
  res.status(500).json({message:"Failed to delete counter",error:err.message});
 }
};

export const getNextCounterValue=async(req,res)=>{
 try{
  const {business,type}=req.body;

  if(!business||!type){
   return res.status(400).json({message:"business and type are required"});
  }

  const counter=await Counter.findOneAndUpdate(
   {business,type},
   {$inc:{seq:1}},
   {returnDocument:"after",upsert:true,setDefaultsOnInsert:true}
  ).populate("business","name");

  res.status(200).json({
   message:"Counter incremented successfully",
   data:counter
  });
 }catch(err){
  res.status(500).json({message:"Failed to increment counter",error:err.message});
 }
};