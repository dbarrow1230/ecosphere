// backend/controllers/reference/taskStatusController.js
import mongoose from "mongoose";
import TaskStatus from "../../models/reference/taskStatusModel.js";

export const createTaskStatus=async(req,res)=>{
try{
const {name,description,order,isActive}=req.body;

const taskStatus=new TaskStatus({
name,
description,
order,
isActive:isActive!==undefined?isActive:true
});

const saved=await taskStatus.save();

return res.status(201).json(saved);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getTaskStatuses=async(req,res)=>{
try{
const query={};

if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";
if(req.query.search){
query.$or=[
{name:{$regex:req.query.search,$options:"i"}},
{description:{$regex:req.query.search,$options:"i"}}
];
}

const taskStatuses=await TaskStatus.find(query).sort({order:1,name:1});

return res.status(200).json(taskStatuses);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getTaskStatusById=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid task status id"});
}

const taskStatus=await TaskStatus.findById(id);

if(!taskStatus){
return res.status(404).json({message:"Task status not found"});
}

return res.status(200).json(taskStatus);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const updateTaskStatus=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid task status id"});
}

const taskStatus=await TaskStatus.findById(id);
if(!taskStatus){
return res.status(404).json({message:"Task status not found"});
}

const {name,description,order,isActive}=req.body;

if(name!==undefined)taskStatus.name=name;
if(description!==undefined)taskStatus.description=description;
if(order!==undefined)taskStatus.order=order;
if(isActive!==undefined)taskStatus.isActive=isActive;

const updated=await taskStatus.save();

return res.status(200).json(updated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const deleteTaskStatus=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid task status id"});
}

const taskStatus=await TaskStatus.findByIdAndDelete(id);
if(!taskStatus){
return res.status(404).json({message:"Task status not found"});
}

return res.status(200).json({message:"Task status deleted successfully"});
}catch(error){
return res.status(500).json({message:error.message});
}
};
