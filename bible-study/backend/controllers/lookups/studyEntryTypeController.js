// backend/controllers/lookups/studyEntryTypeController.js
import StudyEntryType from "../../models/lookups/studyEntryTypeModel.js";

export const getStudyEntryTypes=async(req,res)=>{
 try{
  const {active}=req.query;
  const filter={};

  if(active==="true")filter.active=true;
  if(active==="false")filter.active=false;

  const types=await StudyEntryType.find(filter).sort({sortOrder:1,title:1});

  return res.status(200).json({
   success:true,
   count:types.length,
   data:types
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch study entry types",
   error:err.message
  });
 }
};

export const getStudyEntryTypeById=async(req,res)=>{
 try{
  const type=await StudyEntryType.findById(req.params.id);

  if(!type){
   return res.status(404).json({
    success:false,
    message:"Study entry type not found"
   });
  }

  return res.status(200).json({
   success:true,
   data:type
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch study entry type",
   error:err.message
  });
 }
};

export const createStudyEntryType=async(req,res)=>{
 try{
  const type=await StudyEntryType.create(req.body);

  return res.status(201).json({
   success:true,
   message:"Study entry type created successfully",
   data:type
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to create study entry type",
   error:err.message
  });
 }
};

export const updateStudyEntryType=async(req,res)=>{
 try{
  const type=await StudyEntryType.findByIdAndUpdate(req.params.id,req.body,{
   returnDocument:"after",
   runValidators:true
  });

  if(!type){
   return res.status(404).json({
    success:false,
    message:"Study entry type not found"
   });
  }

  return res.status(200).json({
   success:true,
   message:"Study entry type updated successfully",
   data:type
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to update study entry type",
   error:err.message
  });
 }
};

export const deleteStudyEntryType=async(req,res)=>{
 try{
  const type=await StudyEntryType.findByIdAndDelete(req.params.id);

  if(!type){
   return res.status(404).json({
    success:false,
    message:"Study entry type not found"
   });
  }

  return res.status(200).json({
   success:true,
   message:"Study entry type deleted successfully"
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to delete study entry type",
   error:err.message
  });
 }
};