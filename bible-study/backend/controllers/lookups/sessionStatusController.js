// backend/controllers/lookups/sessionStatusController.js
import SessionStatus from "../../models/lookups/sessionStatusModel.js";

export const getSessionStatuses=async(req,res)=>{
 try{
  const {active}=req.query;
  const filter={};

  if(active==="true")filter.active=true;
  if(active==="false")filter.active=false;

  const statuses=await SessionStatus.find(filter).sort({sortOrder:1,title:1});

  return res.status(200).json({
   success:true,
   count:statuses.length,
   data:statuses
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch session statuses",
   error:err.message
  });
 }
};

export const getSessionStatusById=async(req,res)=>{
 try{
  const status=await SessionStatus.findById(req.params.id);

  if(!status){
   return res.status(404).json({
    success:false,
    message:"Session status not found"
   });
  }

  return res.status(200).json({
   success:true,
   data:status
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch session status",
   error:err.message
  });
 }
};

export const createSessionStatus=async(req,res)=>{
 try{
  const status=await SessionStatus.create(req.body);

  return res.status(201).json({
   success:true,
   message:"Session status created successfully",
   data:status
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to create session status",
   error:err.message
  });
 }
};

export const updateSessionStatus=async(req,res)=>{
 try{
  const status=await SessionStatus.findByIdAndUpdate(req.params.id,req.body,{
   returnDocument:"after",
   runValidators:true
  });

  if(!status){
   return res.status(404).json({
    success:false,
    message:"Session status not found"
   });
  }

  return res.status(200).json({
   success:true,
   message:"Session status updated successfully",
   data:status
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to update session status",
   error:err.message
  });
 }
};

export const deleteSessionStatus=async(req,res)=>{
 try{
  const status=await SessionStatus.findByIdAndDelete(req.params.id);

  if(!status){
   return res.status(404).json({
    success:false,
    message:"Session status not found"
   });
  }

  return res.status(200).json({
   success:true,
   message:"Session status deleted successfully"
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to delete session status",
   error:err.message
  });
 }
};