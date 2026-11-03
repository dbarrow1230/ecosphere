// backend/controllers/morse/morsePracticeTextController.js
import MorsePracticeText from "../../models/morse/morsePracticeTextModel.js";

export const createMorsePracticeText=async(req,res)=>{
 try{
  const practiceText=await MorsePracticeText.create({...req.body,user:req.user._id});
  res.status(201).json({success:true,data:practiceText});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const getMorsePracticeTexts=async(req,res)=>{
 try{
  const filter={isArchived:false,user:req.user._id};

  if(req.query.practiceType){
   filter.practiceType=req.query.practiceType;
  }

  if(req.query.sourceType){
   filter.sourceType=req.query.sourceType;
  }

  const practiceTexts=await MorsePracticeText.find(filter).sort({createdAt:-1});
  res.status(200).json({success:true,data:practiceTexts});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const getMorsePracticeTextById=async(req,res)=>{
 try{
  const practiceText=await MorsePracticeText.findOne({_id:req.params.id,user:req.user._id});

  if(!practiceText){
   return res.status(404).json({success:false,message:"Practice text not found"});
  }

  res.status(200).json({success:true,data:practiceText});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const updateMorsePracticeText=async(req,res)=>{
 try{
  const practiceText=await MorsePracticeText.findOneAndUpdate({_id:req.params.id,user:req.user._id},{...req.body,user:req.user._id},{returnDocument:"after",runValidators:true});

  if(!practiceText){
   return res.status(404).json({success:false,message:"Practice text not found"});
  }

  res.status(200).json({success:true,data:practiceText});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const archiveMorsePracticeText=async(req,res)=>{
 try{
  const practiceText=await MorsePracticeText.findOneAndUpdate({_id:req.params.id,user:req.user._id},{isArchived:true},{returnDocument:"after"});

  if(!practiceText){
   return res.status(404).json({success:false,message:"Practice text not found"});
  }

  res.status(200).json({success:true,data:practiceText});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const deleteMorsePracticeText=async(req,res)=>{
 try{
  const practiceText=await MorsePracticeText.findOneAndDelete({_id:req.params.id,user:req.user._id});

  if(!practiceText){
   return res.status(404).json({success:false,message:"Practice text not found"});
  }

  res.status(200).json({success:true,data:practiceText});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};
