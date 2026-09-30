// backend/controllers/reference/taskPriorityController.js
import mongoose from "mongoose";
import TaskPriority from "../../models/reference/taskPriorityModel.js";

export const createTaskPriority=async(req,res)=>{
try{
const {name,description,level,isActive}=req.body;

const taskPriority=new TaskPriority({
name,
description,
level,
isActive:isActive!==undefined?isActive:true
});

const saved=await taskPriority.save();

return res.status(201).json(saved);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getTaskPriorities=async(req,res)=>{
try{
const query={};

if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";
if(req.query.search){
query.$or=[
{name:{$regex:req.query.search,$options:"i"}},
{description:{$regex:req.query.search,$options:"i"}}
];
}

const taskPriorities=await TaskPriority.find(query).sort({level:1,name:1});

return res.status(200).json(taskPriorities);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getTaskPriorityById=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid task priority id"});
}

const taskPriority=await TaskPriority.findById(id);

if(!taskPriority){
return res.status(404).json({message:"Task priority not found"});
}

return res.status(200).json(taskPriority);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const updateTaskPriority=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid task priority id"});
}

const taskPriority=await TaskPriority.findById(id);
if(!taskPriority){
return res.status(404).json({message:"Task priority not found"});
}

const {name,description,level,isActive}=req.body;

if(name!==undefined)taskPriority.name=name;
if(description!==undefined)taskPriority.description=description;
if(level!==undefined)taskPriority.level=level;
if(isActive!==undefined)taskPriority.isActive=isActive;

const updated=await taskPriority.save();

return res.status(200).json(updated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const deleteTaskPriority=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid task priority id"});
}

const taskPriority=await TaskPriority.findByIdAndDelete(id);
if(!taskPriority){
return res.status(404).json({message:"Task priority not found"});
}

return res.status(200).json({message:"Task priority deleted successfully"});
}catch(error){
return res.status(500).json({message:error.message});
}
};
