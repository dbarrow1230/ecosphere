// backend/controllers/taskController.js
import Task from "../models/taskModel.js";

export const createTask=async(req,res)=>{
 try{
  const {title,description,event,order,assignedTo,priority,status,dueDate,completedAt,notes}=req.body;
  const task=await Task.create({
   title,
   description,
   event,
   order,
   assignedTo,
   priority,
   status,
   dueDate,
   completedAt,
   notes
  });
  res.status(201).json({success:true,message:"Task created successfully",task});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const getTasks=async(req,res)=>{
 try{
  const tasks=await Task.find()
   .populate("event")
   .populate("order")
   .populate("assignedTo")
   .sort({createdAt:-1});
  res.status(200).json({success:true,count:tasks.length,tasks});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const getSingleTask=async(req,res)=>{
 try{
  const task=await Task.findById(req.params.id)
   .populate("event")
   .populate("order")
   .populate("assignedTo");
  if(!task){
   return res.status(404).json({success:false,message:"Task not found"});
  }
  res.status(200).json({success:true,task});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const updateTask=async(req,res)=>{
 try{
  const task=await Task.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after",runValidators:true});
  if(!task){
   return res.status(404).json({success:false,message:"Task not found"});
  }
  res.status(200).json({success:true,message:"Task updated successfully",task});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const deleteTask=async(req,res)=>{
 try{
  const task=await Task.findByIdAndDelete(req.params.id);
  if(!task){
   return res.status(404).json({success:false,message:"Task not found"});
  }
  res.status(200).json({success:true,message:"Task deleted successfully"});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};