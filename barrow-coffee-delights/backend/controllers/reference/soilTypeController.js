// backend/controllers/reference/soilTypeController.js
import mongoose from "mongoose";
import SoilType from "../../models/reference/soilTypeModel.js";

export const createSoilType=async(req,res)=>{
try{
const {name,description,isActive}=req.body;

const soilType=new SoilType({
name,
description,
isActive:isActive!==undefined?isActive:true
});

const saved=await soilType.save();

return res.status(201).json(saved);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getSoilTypes=async(req,res)=>{
try{
const query={};

if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";

if(req.query.search){
query.$or=[
{name:{$regex:req.query.search,$options:"i"}},
{description:{$regex:req.query.search,$options:"i"}}
];
}

const types=await SoilType.find(query)
.sort({createdAt:-1});

return res.status(200).json(types);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getSoilTypeById=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid soil type id"});
}

const type=await SoilType.findById(id);

if(!type){
return res.status(404).json({message:"Soil type not found"});
}

return res.status(200).json(type);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const updateSoilType=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid soil type id"});
}

const type=await SoilType.findById(id);
if(!type){
return res.status(404).json({message:"Soil type not found"});
}

const {name,description,isActive}=req.body;

if(name!==undefined)type.name=name;
if(description!==undefined)type.description=description;
if(isActive!==undefined)type.isActive=isActive;

const updated=await type.save();

return res.status(200).json(updated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const deleteSoilType=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid soil type id"});
}

const type=await SoilType.findByIdAndDelete(id);
if(!type){
return res.status(404).json({message:"Soil type not found"});
}

return res.status(200).json({message:"Soil type deleted successfully"});
}catch(error){
return res.status(500).json({message:error.message});
}
};