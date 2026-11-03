// backend/controllers/reference/severityScaleController.js
import mongoose from "mongoose";
import SeverityScale from "../../models/reference/severityScaleModel.js";

export const createSeverityScale=async(req,res)=>{
try{
const {name,description,level,isActive}=req.body;

const scale=new SeverityScale({
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

export const getSeverityScales=async(req,res)=>{
try{
const query={};

if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";

if(req.query.search){
query.$or=[
{name:{$regex:req.query.search,$options:"i"}},
{description:{$regex:req.query.search,$options:"i"}}
];
}

const scales=await SeverityScale.find(query)
.sort({level:1,createdAt:-1});

return res.status(200).json(scales);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getSeverityScaleById=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid severity scale id"});
}

const scale=await SeverityScale.findById(id);

if(!scale){
return res.status(404).json({message:"Severity scale not found"});
}

return res.status(200).json(scale);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const updateSeverityScale=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid severity scale id"});
}

const scale=await SeverityScale.findById(id);
if(!scale){
return res.status(404).json({message:"Severity scale not found"});
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

export const deleteSeverityScale=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid severity scale id"});
}

const scale=await SeverityScale.findByIdAndDelete(id);
if(!scale){
return res.status(404).json({message:"Severity scale not found"});
}

return res.status(200).json({message:"Severity scale deleted successfully"});
}catch(error){
return res.status(500).json({message:error.message});
}
};