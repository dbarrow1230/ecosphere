// backend/controllers/reference/lightingController.js
import mongoose from "mongoose";
import Lighting from "../../models/reference/lightingModel.js";

export const createLighting=async(req,res)=>{
try{
const {name,description,isActive}=req.body;

const lighting=new Lighting({
name,
description,
isActive:isActive!==undefined?isActive:true
});

const saved=await lighting.save();

return res.status(201).json(saved);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getLighting=async(req,res)=>{
try{
const query={};

if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";

if(req.query.search){
query.$or=[
{name:{$regex:req.query.search,$options:"i"}},
{description:{$regex:req.query.search,$options:"i"}}
];
}

const lighting=await Lighting.find(query)
.sort({createdAt:-1});

return res.status(200).json(lighting);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getLightingById=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid lighting id"});
}

const lighting=await Lighting.findById(id);

if(!lighting){
return res.status(404).json({message:"Lighting not found"});
}

return res.status(200).json(lighting);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const updateLighting=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid lighting id"});
}

const lighting=await Lighting.findById(id);
if(!lighting){
return res.status(404).json({message:"Lighting not found"});
}

const {name,description,isActive}=req.body;

if(name!==undefined)lighting.name=name;
if(description!==undefined)lighting.description=description;
if(isActive!==undefined)lighting.isActive=isActive;

const updated=await lighting.save();

return res.status(200).json(updated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const deleteLighting=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid lighting id"});
}

const lighting=await Lighting.findByIdAndDelete(id);
if(!lighting){
return res.status(404).json({message:"Lighting not found"});
}

return res.status(200).json({message:"Lighting deleted successfully"});
}catch(error){
return res.status(500).json({message:error.message});
}
};