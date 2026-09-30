// backend/controllers/studies/studyEntryController.js
import StudyEntry from "../../models/studies/studyEntryModel.js";

export const getStudyEntries=async(req,res)=>{
 try{
  const {user,study,method,entryType}=req.query;
  const filter={};

  if(user)filter.user=user;
  if(study)filter.study=study;
  if(method)filter.method=method;
  if(entryType)filter.entryType=entryType;

  const items=await StudyEntry.find(filter)
   .populate("user")
   .populate("study")
   .populate("method")
   .populate("entryType")
   .populate("status")
   .sort({createdAt:-1});

  return res.status(200).json({
   success:true,
   count:items.length,
   data:items
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch study entries",
   error:err.message
  });
 }
};

export const getStudyEntryById=async(req,res)=>{
 try{
  const item=await StudyEntry.findById(req.params.id)
   .populate("user")
   .populate("study")
   .populate("method")
   .populate("entryType")
   .populate("status");

  if(!item){
   return res.status(404).json({
    success:false,
    message:"Study entry not found"
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
   message:"Failed to fetch study entry",
   error:err.message
  });
 }
};

export const createStudyEntry=async(req,res)=>{
 try{
  const item=await StudyEntry.create(req.body);

  return res.status(201).json({
   success:true,
   message:"Study entry created successfully",
   data:item
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to create study entry",
   error:err.message
  });
 }
};

export const updateStudyEntry=async(req,res)=>{
 try{
  const item=await StudyEntry.findByIdAndUpdate(req.params.id,req.body,{
   returnDocument:"after",
   runValidators:true
  });

  if(!item){
   return res.status(404).json({
    success:false,
    message:"Study entry not found"
   });
  }

  return res.status(200).json({
   success:true,
   message:"Study entry updated successfully",
   data:item
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to update study entry",
   error:err.message
  });
 }
};

export const deleteStudyEntry=async(req,res)=>{
 try{
  const item=await StudyEntry.findByIdAndDelete(req.params.id);

  if(!item){
   return res.status(404).json({
    success:false,
    message:"Study entry not found"
   });
  }

  return res.status(200).json({
   success:true,
   message:"Study entry deleted successfully"
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to delete study entry",
   error:err.message
  });
 }
};