// backend/controllers/employees/leaveController.js
import Leave from "../../models/employees/leaveModel.js";

const leavePopulate=[{path:"employeeRef",model:"Employee"}];

export const createLeave=async(req,res,next)=>{
 try{
  const leave=await Leave.create(req.body);
  const result=await Leave.findById(leave._id).populate(leavePopulate);
  res.status(201).json(result);
 }catch(error){
  next(error);
 }
};

export const getLeaves=async(req,res,next)=>{
 try{
  const leaves=await Leave.find().populate(leavePopulate).sort({leaveType:1});
  res.status(200).json(leaves);
 }catch(error){
  next(error);
 }
};

export const updateLeave=async(req,res,next)=>{
 try{
  const leave=await Leave.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true}).populate(leavePopulate);
  if(!leave)return res.status(404).json({message:"Leave record not found"});
  res.status(200).json(leave);
 }catch(error){
  next(error);
 }
};
