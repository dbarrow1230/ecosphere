// backend/controllers/pests/pestTypeController.js
import mongoose from "mongoose";
import PestType from "../../models/pests/pesttypemodel.js";

export const createPestType=async(req,res)=>{
try{
const {pest_type,description,isActive,createdBy}=req.body;

const pestType=new PestType({
pest_type,
description,
isActive:isActive!==undefined?isActive:true,
createdBy:createdBy||(req.user?._id||req.user?.id)||null
});

const saved=await pestType.save();
const populated=await PestType.findById(saved._id)
.populate("createdBy","name email");

return res.status(201).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getPestTypes=async(req,res)=>{
try{
const query={};

if(req.query.createdBy)query.createdBy=req.query.createdBy;
if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";

if(req.query.search){
query.$or=[
{pest_type:{$regex:req.query.search,$options:"i"}},
{description:{$regex:req.query.search,$options:"i"}}
];
}

const pestTypes=await PestType.find(query)
.populate("createdBy","name email")
.sort({createdAt:-1});

return res.status(200).json(pestTypes);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getPestTypeById=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid pest type id"});
}

const pestType=await PestType.findById(id)
.populate("createdBy","name email");

if(!pestType){
return res.status(404).json({message:"Pest type not found"});
}

return res.status(200).json(pestType);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const updatePestType=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid pest type id"});
}

const pestType=await PestType.findById(id);
if(!pestType){
return res.status(404).json({message:"Pest type not found"});
}

const {pest_type,description,isActive,createdBy}=req.body;

if(pest_type!==undefined)pestType.pest_type=pest_type;
if(description!==undefined)pestType.description=description;
if(isActive!==undefined)pestType.isActive=isActive;
if(createdBy!==undefined)pestType.createdBy=createdBy||null;

const updated=await pestType.save();
const populated=await PestType.findById(updated._id)
.populate("createdBy","name email");

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const deletePestType=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid pest type id"});
}

const pestType=await PestType.findByIdAndDelete(id);
if(!pestType){
return res.status(404).json({message:"Pest type not found"});
}

return res.status(200).json({message:"Pest type deleted successfully"});
}catch(error){
return res.status(500).json({message:error.message});
}
};