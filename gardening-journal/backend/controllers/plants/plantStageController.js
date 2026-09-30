// backend/controllers/plants/plantStageController.js
import mongoose from "mongoose";
import PlantStage from "../../models/plants/plantStageModel.js";

export const createPlantStage=async(req,res)=>{
try{
const {name,description,order,isActive,createdBy}=req.body;

const plantStage=new PlantStage({
name,
description,
order,
isActive:isActive!==undefined?isActive:true,
createdBy:createdBy||req.user?._id||req.user?.id||null
});

const saved=await plantStage.save();
const populated=await PlantStage.findById(saved._id)
.populate("createdBy","name email");

return res.status(201).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getPlantStages=async(req,res)=>{
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

const stages=await PlantStage.find(query)
.populate("createdBy","name email")
.sort({order:1,createdAt:-1});

return res.status(200).json(stages);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getPlantStageById=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid plant stage id"});
}

const stage=await PlantStage.findById(id)
.populate("createdBy","name email");

if(!stage){
return res.status(404).json({message:"Plant stage not found"});
}

return res.status(200).json(stage);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const updatePlantStage=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid plant stage id"});
}

const stage=await PlantStage.findById(id);
if(!stage){
return res.status(404).json({message:"Plant stage not found"});
}

const {name,description,order,isActive,createdBy}=req.body;

if(name!==undefined)stage.name=name;
if(description!==undefined)stage.description=description;
if(order!==undefined)stage.order=order;
if(isActive!==undefined)stage.isActive=isActive;
if(createdBy!==undefined)stage.createdBy=createdBy||null;

const updated=await stage.save();
const populated=await PlantStage.findById(updated._id)
.populate("createdBy","name email");

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const deletePlantStage=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid plant stage id"});
}

const stage=await PlantStage.findByIdAndDelete(id);
if(!stage){
return res.status(404).json({message:"Plant stage not found"});
}

return res.status(200).json({message:"Plant stage deleted successfully"});
}catch(error){
return res.status(500).json({message:error.message});
}
};