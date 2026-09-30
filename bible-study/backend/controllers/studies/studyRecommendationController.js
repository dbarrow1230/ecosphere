// backend/controllers/studies/studyRecommendationController.js
import StudyRecommendation from "../../models/studies/studyRecommendationModel.js";

export const getStudyRecommendations=async(req,res)=>{
 try{
  const {user,method,category,status}=req.query;
  const filter={};

  if(user)filter.user=user;
  if(method)filter.method=method;
  if(category)filter.category=category;
  if(status)filter.status=status;

  const items=await StudyRecommendation.find(filter)
   .populate("user")
   .populate("method")
   .populate("category")
   .populate("difficulty")
   .populate("status")
   .sort({sortOrder:1,createdAt:-1});

  return res.status(200).json({
   success:true,
   count:items.length,
   data:items
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch study recommendations",
   error:err.message
  });
 }
};

export const getStudyRecommendationById=async(req,res)=>{
 try{
  const item=await StudyRecommendation.findById(req.params.id)
   .populate("user")
   .populate("method")
   .populate("category")
   .populate("difficulty")
   .populate("status");

  if(!item){
   return res.status(404).json({
    success:false,
    message:"Study recommendation not found"
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
   message:"Failed to fetch study recommendation",
   error:err.message
  });
 }
};

export const createStudyRecommendation=async(req,res)=>{
 try{
  const item=await StudyRecommendation.create(req.body);

  return res.status(201).json({
   success:true,
   message:"Study recommendation created successfully",
   data:item
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to create study recommendation",
   error:err.message
  });
 }
};

export const updateStudyRecommendation=async(req,res)=>{
 try{
  const item=await StudyRecommendation.findByIdAndUpdate(req.params.id,req.body,{
   returnDocument:"after",
   runValidators:true
  });

  if(!item){
   return res.status(404).json({
    success:false,
    message:"Study recommendation not found"
   });
  }

  return res.status(200).json({
   success:true,
   message:"Study recommendation updated successfully",
   data:item
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to update study recommendation",
   error:err.message
  });
 }
};

export const deleteStudyRecommendation=async(req,res)=>{
 try{
  const item=await StudyRecommendation.findByIdAndDelete(req.params.id);

  if(!item){
   return res.status(404).json({
    success:false,
    message:"Study recommendation not found"
   });
  }

  return res.status(200).json({
   success:true,
   message:"Study recommendation deleted successfully"
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to delete study recommendation",
   error:err.message
  });
 }
};