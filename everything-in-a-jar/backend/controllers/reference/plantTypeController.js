// backend/controllers/reference/plantTypeController.js
import mongoose from "mongoose";
import PlantType from "../../models/reference/plantTypeModel.js";

export const createPlantType=async(req,res)=>{
try{
const {name,description,isActive}=req.body;

const plantType=new PlantType({
name,
description,
isActive:isActive!==undefined?isActive:true
});

const saved=await plantType.save();

return res.status(201).json(saved);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getPlantTypes=async(req,res)=>{
try{
const query={};

if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";

if(req.query.search){
query.$or=[
{name:{$regex:req.query.search,$options:"i"}},
{description:{$regex:req.query.search,$options:"i"}}
];
}

const types=await PlantType.find(query)
.sort({createdAt:-1});

return res.status(200).json(types);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getPlantTypeById=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid plant type id"});
}

const type=await PlantType.findById(id);

if(!type){
return res.status(404).json({message:"Plant type not found"});
}

return res.status(200).json(type);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const updatePlantType=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid plant type id"});
}

const type=await PlantType.findById(id);
if(!type){
return res.status(404).json({message:"Plant type not found"});
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

export const deletePlantType=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid plant type id"});
}

const type=await PlantType.findByIdAndDelete(id);
if(!type){
return res.status(404).json({message:"Plant type not found"});
}

return res.status(200).json({message:"Plant type deleted successfully"});
}catch(error){
return res.status(500).json({message:error.message});
}
};