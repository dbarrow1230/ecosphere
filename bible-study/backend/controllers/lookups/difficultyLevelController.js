// backend/controllers/lookups/difficultyLevelController.js
import DifficultyLevel from "../../models/lookups/difficultyLevelModel.js";

export const getDifficultyLevels=async(req,res)=>{
 try{
  const {active}=req.query;
  const filter={};

  if(active==="true")filter.active=true;
  if(active==="false")filter.active=false;

  const difficultyLevels=await DifficultyLevel.find(filter).sort({sortOrder:1,title:1});

  return res.status(200).json({
   success:true,
   count:difficultyLevels.length,
   data:difficultyLevels
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch difficulty levels",
   error:err.message
  });
 }
};

export const getDifficultyLevelById=async(req,res)=>{
 try{
  const difficultyLevel=await DifficultyLevel.findById(req.params.id);

  if(!difficultyLevel){
   return res.status(404).json({
    success:false,
    message:"Difficulty level not found"
   });
  }

  return res.status(200).json({
   success:true,
   data:difficultyLevel
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch difficulty level",
   error:err.message
  });
 }
};

export const createDifficultyLevel=async(req,res)=>{
 try{
  const difficultyLevel=await DifficultyLevel.create(req.body);

  return res.status(201).json({
   success:true,
   message:"Difficulty level created successfully",
   data:difficultyLevel
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to create difficulty level",
   error:err.message
  });
 }
};

export const updateDifficultyLevel=async(req,res)=>{
 try{
  const difficultyLevel=await DifficultyLevel.findByIdAndUpdate(req.params.id,req.body,{
   returnDocument:"after",
   runValidators:true
  });

  if(!difficultyLevel){
   return res.status(404).json({
    success:false,
    message:"Difficulty level not found"
   });
  }

  return res.status(200).json({
   success:true,
   message:"Difficulty level updated successfully",
   data:difficultyLevel
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to update difficulty level",
   error:err.message
  });
 }
};

export const deleteDifficultyLevel=async(req,res)=>{
 try{
  const difficultyLevel=await DifficultyLevel.findByIdAndDelete(req.params.id);

  if(!difficultyLevel){
   return res.status(404).json({
    success:false,
    message:"Difficulty level not found"
   });
  }

  return res.status(200).json({
   success:true,
   message:"Difficulty level deleted successfully"
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to delete difficulty level",
   error:err.message
  });
 }
};