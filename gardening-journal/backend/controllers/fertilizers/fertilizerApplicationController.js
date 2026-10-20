// backend/controllers/fertilizers/fertilizerApplicationController.js
import mongoose from "mongoose";
import FertilizerApplication from "../../models/fertilizers/fertilizerApplicationModel.js";

export const createFertilizerApplication=async(req,res)=>{
try{
const {fertilizer,name,method,timing,description,isActive}=req.body;

if(!fertilizer&&!req.body.treatment){
return res.status(400).json({message:"A fertilizer or soil treatment is required"});
}

const application=new FertilizerApplication({
results:req.body.results||"",
treatment:req.body.treatment||"",
applicationDate:req.body.applicationDate||null,
problem:req.body.problem||"",
location:req.body.location||"",
plantName:req.body.plantName||"",
fertilizer:fertilizer||null,
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

if(fertilizer!==undefined)application.fertilizer=fertilizer||null;
if(name!==undefined)application.name=name;
if(method!==undefined)application.method=method;
if(timing!==undefined)application.timing=timing;
if(description!==undefined)application.description=description;
if(isActive!==undefined)application.isActive=isActive;

if(req.body.plantName!==undefined)application.plantName=req.body.plantName||"";
if(req.body.location!==undefined)application.location=req.body.location||"";
if(req.body.problem!==undefined)application.problem=req.body.problem||"";
if(req.body.applicationDate!==undefined)application.applicationDate=req.body.applicationDate||null;
if(req.body.treatment!==undefined)application.treatment=req.body.treatment||"";
if(req.body.results!==undefined)application.results=req.body.results||"";
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