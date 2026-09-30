// backend/controllers/fertilizers/fertilizerApplicationController.js
import mongoose from "mongoose";
import FertilizerApplication from "../../models/fertilizers/fertilizerApplicationModel.js";

export const createFertilizerApplication=async(req,res)=>{
try{
const {fertilizer,name,method,timing,description,isActive}=req.body;

if(!fertilizer){
return res.status(400).json({message:"fertilizer is required"});
}

const application=new FertilizerApplication({
fertilizer,
name,
method,
timing,
description,
isActive:isActive!==undefined?isActive:true
});

const saved=await application.save();
const populated=await FertilizerApplication.findById(saved._id)
.populate("fertilizer");

return res.status(201).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getFertilizerApplications=async(req,res)=>{
try{
const query={};

if(req.query.fertilizer)query.fertilizer=req.query.fertilizer;
if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";

if(req.query.search){
query.$or=[
{name:{$regex:req.query.search,$options:"i"}},
{method:{$regex:req.query.search,$options:"i"}},
{timing:{$regex:req.query.search,$options:"i"}},
{description:{$regex:req.query.search,$options:"i"}}
];
}

const applications=await FertilizerApplication.find(query)
.populate("fertilizer")
.sort({createdAt:-1});

return res.status(200).json(applications);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getFertilizerApplicationById=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid fertilizer application id"});
}

const application=await FertilizerApplication.findById(id)
.populate("fertilizer");

if(!application){
return res.status(404).json({message:"Fertilizer application not found"});
}

return res.status(200).json(application);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const updateFertilizerApplication=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid fertilizer application id"});
}

const application=await FertilizerApplication.findById(id);
if(!application){
return res.status(404).json({message:"Fertilizer application not found"});
}

const {fertilizer,name,method,timing,description,isActive}=req.body;

if(fertilizer!==undefined)application.fertilizer=fertilizer;
if(name!==undefined)application.name=name;
if(method!==undefined)application.method=method;
if(timing!==undefined)application.timing=timing;
if(description!==undefined)application.description=description;
if(isActive!==undefined)application.isActive=isActive;

const updated=await application.save();
const populated=await FertilizerApplication.findById(updated._id)
.populate("fertilizer");

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const deleteFertilizerApplication=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid fertilizer application id"});
}

const application=await FertilizerApplication.findByIdAndDelete(id);
if(!application){
return res.status(404).json({message:"Fertilizer application not found"});
}

return res.status(200).json({message:"Fertilizer application deleted successfully"});
}catch(error){
return res.status(500).json({message:error.message});
}
};