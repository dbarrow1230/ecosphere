// backend/controllers/reference/fertilizerTypeController.js
import mongoose from "mongoose";
import FertilizerType from "../../models/reference/fertilizerTypeModel.js";

export const createFertilizerType=async(req,res)=>{
try{
const {name,description,isActive}=req.body;

const fertilizerType=new FertilizerType({
name,
description,
isActive:isActive!==undefined?isActive:true
});

const saved=await fertilizerType.save();

return res.status(201).json(saved);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getFertilizerTypes=async(req,res)=>{
try{
const query={};

if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";

if(req.query.search){
query.$or=[
{name:{$regex:req.query.search,$options:"i"}},
{description:{$regex:req.query.search,$options:"i"}}
];
}

const types=await FertilizerType.find(query)
.sort({createdAt:-1});

return res.status(200).json(types);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getFertilizerTypeById=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid fertilizer type id"});
}

const type=await FertilizerType.findById(id);

if(!type){
return res.status(404).json({message:"Fertilizer type not found"});
}

return res.status(200).json(type);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const updateFertilizerType=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid fertilizer type id"});
}

const type=await FertilizerType.findById(id);
if(!type){
return res.status(404).json({message:"Fertilizer type not found"});
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

export const deleteFertilizerType=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid fertilizer type id"});
}

const type=await FertilizerType.findByIdAndDelete(id);
if(!type){
return res.status(404).json({message:"Fertilizer type not found"});
}

return res.status(200).json({message:"Fertilizer type deleted successfully"});
}catch(error){
return res.status(500).json({message:error.message});
}
};