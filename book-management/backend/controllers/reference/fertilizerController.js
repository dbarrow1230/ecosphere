// backend/controllers/reference/fertilizerController.js
import mongoose from "mongoose";
import Fertilizer from "../../models/reference/fertilizerModel.js";

export const createFertilizer=async(req,res)=>{
try{
const {name,type,description,isActive}=req.body;

if(!name){
return res.status(400).json({message:"name is required"});
}

const fertilizer=new Fertilizer({
name,
type:type||null,
description,
isActive:isActive!==undefined?isActive:true
});

const saved=await fertilizer.save();
const populated=await Fertilizer.findById(saved._id)
.populate("type");

return res.status(201).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getFertilizers=async(req,res)=>{
try{
const query={};

if(req.query.type)query.type=req.query.type;
if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";

if(req.query.search){
query.$or=[
{name:{$regex:req.query.search,$options:"i"}},
{description:{$regex:req.query.search,$options:"i"}}
];
}

const fertilizers=await Fertilizer.find(query)
.populate("type")
.sort({createdAt:-1});

return res.status(200).json(fertilizers);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getFertilizerById=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid fertilizer id"});
}

const fertilizer=await Fertilizer.findById(id)
.populate("type");

if(!fertilizer){
return res.status(404).json({message:"Fertilizer not found"});
}

return res.status(200).json(fertilizer);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const updateFertilizer=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid fertilizer id"});
}

const fertilizer=await Fertilizer.findById(id);
if(!fertilizer){
return res.status(404).json({message:"Fertilizer not found"});
}

const {name,type,description,isActive}=req.body;

if(name!==undefined)fertilizer.name=name;
if(type!==undefined)fertilizer.type=type||null;
if(description!==undefined)fertilizer.description=description;
if(isActive!==undefined)fertilizer.isActive=isActive;

const updated=await fertilizer.save();
const populated=await Fertilizer.findById(updated._id)
.populate("type");

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const deleteFertilizer=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid fertilizer id"});
}

const fertilizer=await Fertilizer.findByIdAndDelete(id);
if(!fertilizer){
return res.status(404).json({message:"Fertilizer not found"});
}

return res.status(200).json({message:"Fertilizer deleted successfully"});
}catch(error){
return res.status(500).json({message:error.message});
}
};