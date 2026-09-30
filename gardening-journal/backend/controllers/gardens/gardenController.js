// backend/controllers/gardens/gardenController.js
import mongoose from "mongoose";
import "../../models/gardens/gardenReferenceModels.js";
import Garden from "../../models/gardens/gardenModel.js";

const populateGarden=query=>query
.populate("gardenType")
.populate("gardenPurpose")
.populate("userReason")
.populate("sections")
.populate("notes.createdBy","name email username")
.populate("createdBy","name email username");

export const createGarden=async(req,res)=>{
try{
const {
name,
gardenType,
gardenPurpose,
userReason,
overallSize,
notes,
sections,
createdBy,
isActive
}=req.body;

const garden=new Garden({
name,
gardenType:gardenType||null,
gardenPurpose:Array.isArray(gardenPurpose)?gardenPurpose:[],
userReason:Array.isArray(userReason)?userReason:userReason||[],
overallSize:{
metric:Array.isArray(overallSize?.metric)?overallSize.metric:[],
imperial:Array.isArray(overallSize?.imperial)?overallSize.imperial:[]
},
notes:Array.isArray(notes)?notes:[],
sections:Array.isArray(sections)?sections:[],
createdBy:createdBy||req.user?._id||req.user?.id||null,
isActive:isActive!==undefined?isActive:true
});

const saved=await garden.save();
const populated=await populateGarden(Garden.findById(saved._id));

return res.status(201).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getGardens=async(req,res)=>{
try{
const query={};

if(req.query.gardenType)query.gardenType=req.query.gardenType;
if(req.query.createdBy)query.createdBy=req.query.createdBy;
if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";

if(req.query.search){
query.$or=[
{name:{$regex:req.query.search,$options:"i"}}
];
}

const gardens=await populateGarden(Garden.find(query)).sort({createdAt:-1});

return res.status(200).json(gardens);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getGardenById=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid garden id"});
}

const garden=await populateGarden(Garden.findById(id));

if(!garden){
return res.status(404).json({message:"Garden not found"});
}

return res.status(200).json(garden);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const updateGarden=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid garden id"});
}

const garden=await Garden.findById(id);
if(!garden){
return res.status(404).json({message:"Garden not found"});
}

const {
name,
gardenType,
gardenPurpose,
userReason,
overallSize,
notes,
sections,
createdBy,
isActive
}=req.body;

if(name!==undefined)garden.name=name;
if(gardenType!==undefined)garden.gardenType=gardenType||null;
if(gardenPurpose!==undefined)garden.gardenPurpose=Array.isArray(gardenPurpose)?gardenPurpose:garden.gardenPurpose;
if(userReason!==undefined)garden.userReason=Array.isArray(userReason)?userReason:garden.userReason;
if(overallSize!==undefined){
garden.overallSize={
metric:Array.isArray(overallSize?.metric)?overallSize.metric:garden.overallSize?.metric||[],
imperial:Array.isArray(overallSize?.imperial)?overallSize.imperial:garden.overallSize?.imperial||[]
};
}
if(notes!==undefined)garden.notes=Array.isArray(notes)?notes:garden.notes;
if(sections!==undefined)garden.sections=Array.isArray(sections)?sections:garden.sections;
if(createdBy!==undefined)garden.createdBy=createdBy||null;
if(isActive!==undefined)garden.isActive=isActive;

const updated=await garden.save();
const populated=await populateGarden(Garden.findById(updated._id));

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const addGardenNote=async(req,res)=>{
try{
const {id}=req.params;
const {note,date,createdBy}=req.body;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid garden id"});
}

if(!note){
return res.status(400).json({message:"note is required"});
}

const garden=await Garden.findById(id);
if(!garden){
return res.status(404).json({message:"Garden not found"});
}

garden.notes.push({
note,
date,
createdBy:createdBy||req.user?._id||req.user?.id||null
});

const updated=await garden.save();
const populated=await populateGarden(Garden.findById(updated._id));

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const deleteGarden=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid garden id"});
}

const garden=await Garden.findByIdAndDelete(id);
if(!garden){
return res.status(404).json({message:"Garden not found"});
}

return res.status(200).json({message:"Garden deleted successfully"});
}catch(error){
return res.status(500).json({message:error.message});
}
};
