import mongoose from "mongoose";
import Task from "../../models/admin/taskModel.js";

const isValidObjectId=id=>mongoose.Types.ObjectId.isValid(id);
const cleanRef=value=>value||null;
const normalizePayload=body=>({...body,event:cleanRef(body.event),order:cleanRef(body.order),dueDate:body.dueDate||null});
const populateTask=query=>query.populate("event").populate("order");

export const createTask=async(req,res)=>{
 try{
  const task=await Task.create(normalizePayload(req.body));
  const populated=await populateTask(Task.findById(task._id));
  return res.status(201).json({success:true,message:"Task created successfully",task:populated,data:populated});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to create task",error:error.message});
 }
};

export const getTasks=async(req,res)=>{
 try{
  const tasks=await populateTask(Task.find({}).sort({dueDate:1,createdAt:-1}));
  return res.status(200).json({success:true,tasks,data:tasks});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch tasks",error:error.message});
 }
};

export const getTaskById=async(req,res)=>{
 try{
  if(!isValidObjectId(req.params.id))return res.status(400).json({success:false,message:"Invalid task id"});
  const task=await populateTask(Task.findById(req.params.id));
  if(!task)return res.status(404).json({success:false,message:"Task not found"});
  return res.status(200).json({success:true,task,data:task});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch task",error:error.message});
 }
};

export const updateTask=async(req,res)=>{
 try{
  if(!isValidObjectId(req.params.id))return res.status(400).json({success:false,message:"Invalid task id"});
  const task=await populateTask(Task.findByIdAndUpdate(req.params.id,normalizePayload(req.body),{new:true,runValidators:true}));
  if(!task)return res.status(404).json({success:false,message:"Task not found"});
  return res.status(200).json({success:true,message:"Task updated successfully",task,data:task});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to update task",error:error.message});
 }
};

export const deleteTask=async(req,res)=>{
 try{
  if(!isValidObjectId(req.params.id))return res.status(400).json({success:false,message:"Invalid task id"});
  const task=await Task.findByIdAndDelete(req.params.id);
  if(!task)return res.status(404).json({success:false,message:"Task not found"});
  return res.status(200).json({success:true,message:"Task deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete task",error:error.message});
 }
};
