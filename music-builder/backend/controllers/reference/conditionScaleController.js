// backend/controllers/reference/conditionScaleController.js
import mongoose from "mongoose";
import ConditionScale from "../../models/reference/conditionScaleModel.js";

export const createConditionScale=async(req,res)=>{
try{
const {name,description,level,isActive}=req.body;

const scale=new ConditionScale({
name,
description,
level,
isActive:isActive!==undefined?isActive:true
});

const saved=await scale.save();

return res.status(201).json(saved);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getConditionScales=async(req,res)=>{
try{
const query={};

if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";

if(req.query.search){
query.$or=[
{name:{$regex:req.query.search,$options:"i"}},
{description:{$regex:req.query.search,$options:"i"}}
];
}

const scales=await ConditionScale.find(query)
.sort({level:1,createdAt:-1});

return res.status(200).json(scales);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getConditionScaleById=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid condition scale id"});
}

const scale=await ConditionScale.findById(id);

if(!scale){
return res.status(404).json({message:"Condition scale not found"});
}

return res.status(200).json(scale);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const updateConditionScale=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid condition scale id"});
}

const scale=await ConditionScale.findById(id);
if(!scale){
return res.status(404).json({message:"Condition scale not found"});
}

const {name,description,level,isActive}=req.body;

if(name!==undefined)scale.name=name;
if(description!==undefined)scale.description=description;
if(level!==undefined)scale.level=level;
if(isActive!==undefined)scale.isActive=isActive;

const updated=await scale.save();

return res.status(200).json(updated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const deleteConditionScale=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid condition scale id"});
}

const scale=await ConditionScale.findByIdAndDelete(id);
if(!scale){
return res.status(404).json({message:"Condition scale not found"});
}

return res.status(200).json({message:"Condition scale deleted successfully"});
}catch(error){
return res.status(500).json({message:error.message});
}
};