// backend/controllers/staffAssignmentController.js
import StaffAssignment from "../models/staffAssignmentModel.js";

export const createStaffAssignment=async(req,res)=>{
 try{
  const {event,user,role,shiftDate,startTime,endTime,status,notes}=req.body;
  const assignment=await StaffAssignment.create({
   event,
   user,
   role,
   shiftDate,
   startTime,
   endTime,
   status,
   notes
  });
  res.status(201).json({success:true,message:"Staff assignment created successfully",assignment});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const getStaffAssignments=async(req,res)=>{
 try{
  const assignments=await StaffAssignment.find()
   .populate("event")
   .populate("user")
   .sort({shiftDate:1});
  res.status(200).json({success:true,count:assignments.length,assignments});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const getSingleStaffAssignment=async(req,res)=>{
 try{
  const assignment=await StaffAssignment.findById(req.params.id)
   .populate("event")
   .populate("user");
  if(!assignment){
   return res.status(404).json({success:false,message:"Staff assignment not found"});
  }
  res.status(200).json({success:true,assignment});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const updateStaffAssignment=async(req,res)=>{
 try{
  const assignment=await StaffAssignment.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after",runValidators:true});
  if(!assignment){
   return res.status(404).json({success:false,message:"Staff assignment not found"});
  }
  res.status(200).json({success:true,message:"Staff assignment updated successfully",assignment});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const deleteStaffAssignment=async(req,res)=>{
 try{
  const assignment=await StaffAssignment.findByIdAndDelete(req.params.id);
  if(!assignment){
   return res.status(404).json({success:false,message:"Staff assignment not found"});
  }
  res.status(200).json({success:true,message:"Staff assignment deleted successfully"});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};