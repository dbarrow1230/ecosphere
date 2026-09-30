// backend/controllers/plants/plantController.js
import mongoose from "mongoose";
import Plant from "../../models/plants/plantModel.js";

const toBool=value=>value===true||value==="true";
const plantStatuses=["active","inactive","archived"];
const cleanStatus=value=>{
const status=String(value||"").trim().toLowerCase();
return plantStatuses.includes(status) ? status : "active";
};

const populatePlant=query=>query
.populate("seed")
.populate("type")
.populate("notes.createdBy","name email")
.populate("createdBy","name email");

export const createPlant=async(req,res)=>{
try{
const {
name,
scientificName,
seed,
family,
type,
description,
growingConditions,
spacing,
growthDurationDays,
notes,
images,
tags,
status,
createdBy,
isActive
}=req.body||{};

const cleanPlantStatus=status!==undefined ? cleanStatus(status) : isActive===false||isActive==="false" ? "inactive" : "active";

const plant=new Plant({
name,
scientificName,
seed:seed||null,
family,
type:type||null,
description,
growingConditions:{
sunlight:growingConditions?.sunlight||"",
water:growingConditions?.water||"",
soil:growingConditions?.soil||"",
temperature:growingConditions?.temperature||""
},
spacing:{
metric:spacing?.metric??null,
imperial:spacing?.imperial??null
},
growthDurationDays,
notes:Array.isArray(notes)?notes:[],
images:Array.isArray(images)?images:[],
tags:Array.isArray(tags)?tags:[],
status:cleanPlantStatus,
createdBy:createdBy||req.user?._id||req.user?.id||null,
isActive:isActive!==undefined?toBool(isActive):cleanPlantStatus==="active"
});

const saved=await plant.save();
const populated=await populatePlant(Plant.findById(saved._id));

return res.status(201).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getPlants=async(req,res)=>{
try{
const query={};

if(req.query.seed)query.seed=req.query.seed;
if(req.query.type)query.type=req.query.type;
if(req.query.createdBy)query.createdBy=req.query.createdBy;
if(req.query.status)query.status=req.query.status;
if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";

if(req.query.search){
query.$or=[
{name:{$regex:req.query.search,$options:"i"}},
{scientificName:{$regex:req.query.search,$options:"i"}},
{family:{$regex:req.query.search,$options:"i"}},
{description:{$regex:req.query.search,$options:"i"}},
{tags:{$regex:req.query.search,$options:"i"}}
];
}

const plants=await populatePlant(Plant.find(query)).sort({createdAt:-1});

return res.status(200).json(plants);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getPlantById=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid plant id"});
}

const plant=await populatePlant(Plant.findById(id));

if(!plant){
return res.status(404).json({message:"Plant not found"});
}

return res.status(200).json(plant);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const updatePlant=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid plant id"});
}

const plant=await Plant.findById(id);
if(!plant){
return res.status(404).json({message:"Plant not found"});
}

const {
name,
scientificName,
seed,
family,
type,
description,
growingConditions,
spacing,
growthDurationDays,
notes,
images,
tags,
status,
createdBy,
isActive
}=req.body||{};

if(name!==undefined)plant.name=name;
if(scientificName!==undefined)plant.scientificName=scientificName;
if(seed!==undefined)plant.seed=seed||null;
if(family!==undefined)plant.family=family;
if(type!==undefined)plant.type=type||null;
if(description!==undefined)plant.description=description;

if(growingConditions!==undefined){
plant.growingConditions={
sunlight:growingConditions?.sunlight??(plant.growingConditions?.sunlight||""),
water:growingConditions?.water??(plant.growingConditions?.water||""),
soil:growingConditions?.soil??(plant.growingConditions?.soil||""),
temperature:growingConditions?.temperature??(plant.growingConditions?.temperature||"")
};
}

if(spacing!==undefined){
plant.spacing={
metric:spacing?.metric??plant.spacing?.metric??null,
imperial:spacing?.imperial??plant.spacing?.imperial??null
};
}

if(growthDurationDays!==undefined)plant.growthDurationDays=growthDurationDays;
if(notes!==undefined)plant.notes=Array.isArray(notes)?notes:plant.notes;
if(images!==undefined)plant.images=Array.isArray(images)?images:plant.images;
if(tags!==undefined)plant.tags=Array.isArray(tags)?tags:plant.tags;
if(status!==undefined){
plant.status=cleanStatus(status);
if(isActive===undefined)plant.isActive=plant.status==="active";
}
if(createdBy!==undefined)plant.createdBy=createdBy||null;
if(isActive!==undefined)plant.isActive=toBool(isActive);

const updated=await plant.save();
const populated=await populatePlant(Plant.findById(updated._id));

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const addPlantNote=async(req,res)=>{
try{
const {id}=req.params;
const {note,date,createdBy}=req.body||{};

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid plant id"});
}

if(!note){
return res.status(400).json({message:"note is required"});
}

const plant=await Plant.findById(id);
if(!plant){
return res.status(404).json({message:"Plant not found"});
}

plant.notes.push({
note,
date,
createdBy:createdBy||req.user?._id||req.user?.id||null
});

const updated=await plant.save();
const populated=await populatePlant(Plant.findById(updated._id));

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const deletePlant=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid plant id"});
}

const plant=await Plant.findByIdAndDelete(id);
if(!plant){
return res.status(404).json({message:"Plant not found"});
}

return res.status(200).json({message:"Plant deleted successfully"});
}catch(error){
return res.status(500).json({message:error.message});
}
};
