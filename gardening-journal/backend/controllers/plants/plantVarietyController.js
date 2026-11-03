// backend/controllers/plants/plantVarietyController.js
import mongoose from "mongoose";
import PlantVariety from "../../models/plants/plantVarietyModel.js";

export const createPlantVariety=async(req,res)=>{
try{
const {name,plant,description,isActive,createdBy}=req.body;

if(!plant){
return res.status(400).json({message:"plant is required"});
}

const variety=new PlantVariety({
name,
plant,
description,
isActive:isActive!==undefined?isActive:true,
createdBy:createdBy||req.user?._id||req.user?.id||null
});

const saved=await variety.save();
const populated=await PlantVariety.findById(saved._id)
.populate("plant")
.populate("createdBy","name email");

return res.status(201).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getPlantVarieties=async(req,res)=>{
try{
const query={};

if(req.query.plant)query.plant=req.query.plant;
if(req.query.createdBy)query.createdBy=req.query.createdBy;
if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";

if(req.query.search){
query.$or=[
{name:{$regex:req.query.search,$options:"i"}},
{description:{$regex:req.query.search,$options:"i"}}
];
}

const varieties=await PlantVariety.find(query)
.populate("plant")
.populate("createdBy","name email")
.sort({createdAt:-1});

return res.status(200).json(varieties);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getPlantVarietyById=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid plant variety id"});
}

const variety=await PlantVariety.findById(id)
.populate("plant")
.populate("createdBy","name email");

if(!variety){
return res.status(404).json({message:"Plant variety not found"});
}

return res.status(200).json(variety);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const updatePlantVariety=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid plant variety id"});
}

const variety=await PlantVariety.findById(id);
if(!variety){
return res.status(404).json({message:"Plant variety not found"});
}

const {name,plant,description,isActive,createdBy}=req.body;

if(name!==undefined)variety.name=name;
if(plant!==undefined)variety.plant=plant;
if(description!==undefined)variety.description=description;
if(isActive!==undefined)variety.isActive=isActive;
if(createdBy!==undefined)variety.createdBy=createdBy||null;

const updated=await variety.save();
const populated=await PlantVariety.findById(updated._id)
.populate("plant")
.populate("createdBy","name email");

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const deletePlantVariety=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid plant variety id"});
}

const variety=await PlantVariety.findByIdAndDelete(id);
if(!variety){
return res.status(404).json({message:"Plant variety not found"});
}

return res.status(200).json({message:"Plant variety deleted successfully"});
}catch(error){
return res.status(500).json({message:error.message});
}
};