// backend/controllers/studies/studySessionController.js
import StudySession from "../../models/studies/studySessionModel.js";

export const getStudySessions=async(req,res)=>{
 try{
  const {user,study,method,status}=req.query;
  const filter={};

  if(user)filter.user=user;
  if(study)filter.study=study;
  if(method)filter.method=method;
  if(status)filter.status=status;

  const items=await StudySession.find(filter)
   .populate("user")
   .populate("study")
   .populate("method")
   .populate("status")
   .sort({scheduledFor:-1,createdAt:-1});

  return res.status(200).json({
   success:true,
   count:items.length,
   data:items
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch study sessions",
   error:err.message
  });
 }
};

export const getStudySessionById=async(req,res)=>{
 try{
  const item=await StudySession.findById(req.params.id)
   .populate("user")
   .populate("study")
   .populate("method")
   .populate("status");

  if(!item){
   return res.status(404).json({
    success:false,
    message:"Study session not found"
   });
  }

  return res.status(200).json({
   success:true,
   data:item
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch study session",
   error:err.message
  });
 }
};

export const createStudySession=async(req,res)=>{
 try{
  const item=await StudySession.create(req.body);

  return res.status(201).json({
   success:true,
   message:"Study session created successfully",
   data:item
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to create study session",
   error:err.message
  });
 }
};

export const updateStudySession=async(req,res)=>{
 try{
  const item=await StudySession.findByIdAndUpdate(req.params.id,req.body,{
   returnDocument:"after",
   runValidators:true
  });

  if(!item){
   return res.status(404).json({
    success:false,
    message:"Study session not found"
   });
  }

  return res.status(200).json({
   success:true,
   message:"Study session updated successfully",
   data:item
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to update study session",
   error:err.message
  });
 }
};

export const deleteStudySession=async(req,res)=>{
 try{
  const item=await StudySession.findByIdAndDelete(req.params.id);

  if(!item){
   return res.status(404).json({
    success:false,
    message:"Study session not found"
   });
  }

  return res.status(200).json({
   success:true,
   message:"Study session deleted successfully"
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to delete study session",
   error:err.message
  });
 }
};