// backend/controllers/smartGoalController.js
import mongoose from "mongoose";
import SmartGoal from "../models/smartGoalModel.js";
import Status from "../models/statusModel.js";

export const createSmartGoal=async(req,res)=>{
 try{
  const{mentee,weekNumber,specific,status,createdBy}=req.body;
  if(!mentee||!weekNumber||!specific||!createdBy){
   return res.status(400).json({success:false,message:"mentee, weekNumber, specific, and createdBy are required"});
  }

  if(status){
   if(!mongoose.Types.ObjectId.isValid(status)){
    return res.status(400).json({success:false,message:"Invalid smart goal status id"});
   }
   const statusDoc=await Status.findOne({_id:status,type:"smartGoal",isActive:true});
   if(!statusDoc){
    return res.status(400).json({success:false,message:"Invalid smart goal status"});
   }
  }

  const smartGoal=await SmartGoal.create(req.body);
  const newSmartGoal=await SmartGoal.findById(smartGoal._id)
  .populate("mentee")
  .populate("status")
  .populate("createdBy","name email");

  return res.status(201).json({success:true,smartGoal:newSmartGoal});
 }catch(error){
  return res.status(500).json({success:false,message:"Error creating smart goal",error:error.message});
 }
};

export const getSmartGoals=async(req,res)=>{
 try{
  const{mentee,weekNumber,status,createdBy}=req.query;
  let query={};
  if(mentee)query.mentee=mentee;
  if(weekNumber)query.weekNumber=Number(weekNumber);
  if(status)query.status=status;
  if(createdBy)query.createdBy=createdBy;

  const smartGoals=await SmartGoal.find(query)
  .populate("mentee")
  .populate("status")
  .populate("createdBy","name email")
  .sort({createdAt:-1});

  return res.status(200).json({success:true,count:smartGoals.length,smartGoals});
 }catch(error){
  return res.status(500).json({success:false,message:"Error fetching smart goals",error:error.message});
 }
};

export const getSmartGoalById=async(req,res)=>{
 try{
  const{id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({success:false,message:"Invalid smart goal id"});
  }

  const smartGoal=await SmartGoal.findById(id)
  .populate("mentee")
  .populate("status")
  .populate("createdBy","name email");

  if(!smartGoal){
   return res.status(404).json({success:false,message:"Smart goal not found"});
  }

  return res.status(200).json({success:true,smartGoal});
 }catch(error){
  return res.status(500).json({success:false,message:"Error fetching smart goal",error:error.message});
 }
};

export const getSmartGoalsByMentee=async(req,res)=>{
 try{
  const{menteeId}=req.params;
  if(!mongoose.Types.ObjectId.isValid(menteeId)){
   return res.status(400).json({success:false,message:"Invalid mentee id"});
  }

  const smartGoals=await SmartGoal.find({mentee:menteeId})
  .populate("status")
  .populate("createdBy","name email")
  .sort({weekNumber:1});

  return res.status(200).json({success:true,count:smartGoals.length,smartGoals});
 }catch(error){
  return res.status(500).json({success:false,message:"Error fetching smart goals",error:error.message});
 }
};

export const updateSmartGoal=async(req,res)=>{
 try{
  const{id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({success:false,message:"Invalid smart goal id"});
  }

  if(req.body.status){
   if(!mongoose.Types.ObjectId.isValid(req.body.status)){
    return res.status(400).json({success:false,message:"Invalid smart goal status id"});
   }
   const statusDoc=await Status.findOne({_id:req.body.status,type:"smartGoal",isActive:true});
   if(!statusDoc){
    return res.status(400).json({success:false,message:"Invalid smart goal status"});
   }
  }

  const smartGoal=await SmartGoal.findByIdAndUpdate(id,req.body,{returnDocument:"after",runValidators:true})
  .populate("mentee")
  .populate("status")
  .populate("createdBy","name email");

  if(!smartGoal){
   return res.status(404).json({success:false,message:"Smart goal not found"});
  }

  return res.status(200).json({success:true,smartGoal});
 }catch(error){
  return res.status(500).json({success:false,message:"Error updating smart goal",error:error.message});
 }
};

export const deleteSmartGoal=async(req,res)=>{
 try{
  const{id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({success:false,message:"Invalid smart goal id"});
  }

  const smartGoal=await SmartGoal.findByIdAndDelete(id);

  if(!smartGoal){
   return res.status(404).json({success:false,message:"Smart goal not found"});
  }

  return res.status(200).json({success:true,message:"Smart goal deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Error deleting smart goal",error:error.message});
 }
};