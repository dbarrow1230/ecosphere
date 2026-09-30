// backend/controllers/morse/morsePracticeSessionController.js
import MorsePracticeSession from "../../models/morse/morsePracticeSessionModel.js";

export const createMorsePracticeSession=async(req,res)=>{
 try{
  const session=await MorsePracticeSession.create({...req.body,user:req.user._id});
  res.status(201).json({success:true,data:session});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const getMorsePracticeSessions=async(req,res)=>{
 try{
  const filter={isArchived:false,user:req.user._id};

  if(req.query.practiceText){
   filter.practiceText=req.query.practiceText;
  }

  if(req.query.practiceType){
   filter.practiceType=req.query.practiceType;
  }

  const sessions=await MorsePracticeSession.find(filter).sort({createdAt:-1});
  res.status(200).json({success:true,data:sessions});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const getMorsePracticeSessionById=async(req,res)=>{
 try{
  const session=await MorsePracticeSession.findOne({_id:req.params.id,user:req.user._id});

  if(!session){
   return res.status(404).json({success:false,message:"Practice session not found"});
  }

  res.status(200).json({success:true,data:session});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const updateMorsePracticeSession=async(req,res)=>{
 try{
  const session=await MorsePracticeSession.findOneAndUpdate({_id:req.params.id,user:req.user._id},{...req.body,user:req.user._id},{returnDocument:"after",runValidators:true});

  if(!session){
   return res.status(404).json({success:false,message:"Practice session not found"});
  }

  res.status(200).json({success:true,data:session});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const archiveMorsePracticeSession=async(req,res)=>{
 try{
  const session=await MorsePracticeSession.findOneAndUpdate({_id:req.params.id,user:req.user._id},{isArchived:true},{returnDocument:"after"});

  if(!session){
   return res.status(404).json({success:false,message:"Practice session not found"});
  }

  res.status(200).json({success:true,data:session});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const deleteMorsePracticeSession=async(req,res)=>{
 try{
  const session=await MorsePracticeSession.findOneAndDelete({_id:req.params.id,user:req.user._id});

  if(!session){
   return res.status(404).json({success:false,message:"Practice session not found"});
  }

  res.status(200).json({success:true,data:session});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};
