// backend/controllers/reference/harvestQualityScaleController.js
import mongoose from "mongoose";
import HarvestQualityScale from "../../models/reference/harvestQualityScaleModel.js";

export const createHarvestQualityScale=async(req,res)=>{
try{
const {name,description,level,isActive,createdBy}=req.body;

if(level===undefined){
return res.status(400).json({message:"level is required"});
}

const scale=new HarvestQualityScale({
name,
description,
level,
isActive:isActive!==undefined?isActive:true,
createdBy:createdBy||req.user?._id||req.user?.id||null
});

const saved=await scale.save();
const populated=await HarvestQualityScale.findById(saved._id)
.populate("createdBy","name email");

return res.status(201).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getHarvestQualityScales=async(req,res)=>{
try{
const query={};

if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";
if(req.query.createdBy)query.createdBy=req.query.createdBy;

if(req.query.search){
query.$or=[
{name:{$regex:req.query.search,$options:"i"}},
{description:{$regex:req.query.search,$options:"i"}}
];
}

const scales=await HarvestQualityScale.find(query)
.populate("createdBy","name email")
.sort({level:1,createdAt:-1});

return res.status(200).json(scales);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getHarvestQualityScaleById=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid harvest quality scale id"});
}

const scale=await HarvestQualityScale.findById(id)
.populate("createdBy","name email");

if(!scale){
return res.status(404).json({message:"Harvest quality scale not found"});
}

return res.status(200).json(scale);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const updateHarvestQualityScale=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid harvest quality scale id"});
}

const scale=await HarvestQualityScale.findById(id);
if(!scale){
return res.status(404).json({message:"Harvest quality scale not found"});
}

const {name,description,level,isActive,createdBy}=req.body;

if(name!==undefined)scale.name=name;
if(description!==undefined)scale.description=description;
if(level!==undefined)scale.level=level;
if(isActive!==undefined)scale.isActive=isActive;
if(createdBy!==undefined)scale.createdBy=createdBy||null;

const updated=await scale.save();
const populated=await HarvestQualityScale.findById(updated._id)
.populate("createdBy","name email");

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const deleteHarvestQualityScale=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid harvest quality scale id"});
}

const scale=await HarvestQualityScale.findByIdAndDelete(id);
if(!scale){
return res.status(404).json({message:"Harvest quality scale not found"});
}

return res.status(200).json({message:"Harvest quality scale deleted successfully"});
}catch(error){
return res.status(500).json({message:error.message});
}
};