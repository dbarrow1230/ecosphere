// backend/controllers/journal/observationController.js
import mongoose from "mongoose";
import Observation from "../../models/journal/observationModel.js";

export const createObservation=async(req,res)=>{
try{
const {
dailyJournal,
journalEntry,
planting,
garden,
gardenSection,
name,
observationType,
observedAt,
details,
tags,
notes,
images,
createdBy,
isActive
}=req.body;

const observation=new Observation({
dailyJournal:dailyJournal||null,
journalEntry:journalEntry||null,
planting:planting||null,
garden:garden||null,
gardenSection:gardenSection||null,
name,
observationType,
observedAt,
details,
tags:Array.isArray(tags)?tags:[],
notes:Array.isArray(notes)?notes:[],
images:Array.isArray(images)?images:[],
createdBy:createdBy||req.user?._id||req.user?.id||null,
isActive:isActive!==undefined?isActive:true
});

const saved=await observation.save();
const populated=await Observation.findById(saved._id)
.populate("dailyJournal")
.populate("journalEntry")
.populate("planting")
.populate("garden")
.populate("gardenSection")
.populate("notes.createdBy","name email")
.populate("createdBy","name email");

return res.status(201).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getObservations=async(req,res)=>{
try{
const query={};

if(req.query.dailyJournal)query.dailyJournal=req.query.dailyJournal;
if(req.query.journalEntry)query.journalEntry=req.query.journalEntry;
if(req.query.planting)query.planting=req.query.planting;
if(req.query.garden)query.garden=req.query.garden;
if(req.query.gardenSection)query.gardenSection=req.query.gardenSection;
if(req.query.createdBy)query.createdBy=req.query.createdBy;
if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";

if(req.query.search){
query.$or=[
{name:{$regex:req.query.search,$options:"i"}},
{details:{$regex:req.query.search,$options:"i"}},
{tags:{$regex:req.query.search,$options:"i"}}
];
}

const observations=await Observation.find(query)
.populate("dailyJournal")
.populate("journalEntry")
.populate("planting")
.populate("garden")
.populate("gardenSection")
.populate("notes.createdBy","name email")
.populate("createdBy","name email")
.sort({observedAt:-1,createdAt:-1});

return res.status(200).json(observations);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getObservationById=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid observation id"});
}

const observation=await Observation.findById(id)
.populate("dailyJournal")
.populate("journalEntry")
.populate("planting")
.populate("garden")
.populate("gardenSection")
.populate("notes.createdBy","name email")
.populate("createdBy","name email");

if(!observation){
return res.status(404).json({message:"Observation not found"});
}

return res.status(200).json(observation);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const updateObservation=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid observation id"});
}

const observation=await Observation.findById(id);
if(!observation){
return res.status(404).json({message:"Observation not found"});
}

const {
dailyJournal,
journalEntry,
planting,
garden,
gardenSection,
name,
observationType,
observedAt,
details,
tags,
notes,
images,
createdBy,
isActive
}=req.body;

if(dailyJournal!==undefined)observation.dailyJournal=dailyJournal||null;
if(journalEntry!==undefined)observation.journalEntry=journalEntry||null;
if(planting!==undefined)observation.planting=planting||null;
if(garden!==undefined)observation.garden=garden||null;
if(gardenSection!==undefined)observation.gardenSection=gardenSection||null;
if(name!==undefined)observation.name=name;
if(observationType!==undefined)observation.observationType=observationType;
if(observedAt!==undefined)observation.observedAt=observedAt;
if(details!==undefined)observation.details=details;
if(tags!==undefined)observation.tags=Array.isArray(tags)?tags:observation.tags;
if(notes!==undefined)observation.notes=Array.isArray(notes)?notes:observation.notes;
if(images!==undefined)observation.images=Array.isArray(images)?images:observation.images;
if(createdBy!==undefined)observation.createdBy=createdBy||null;
if(isActive!==undefined)observation.isActive=isActive;

const updated=await observation.save();
const populated=await Observation.findById(updated._id)
.populate("dailyJournal")
.populate("journalEntry")
.populate("planting")
.populate("garden")
.populate("gardenSection")
.populate("notes.createdBy","name email")
.populate("createdBy","name email");

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const addObservationNote=async(req,res)=>{
try{
const {id}=req.params;
const {note,date,createdBy}=req.body;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid observation id"});
}

if(!note){
return res.status(400).json({message:"note is required"});
}

const observation=await Observation.findById(id);
if(!observation){
return res.status(404).json({message:"Observation not found"});
}

observation.notes.push({
note,
date,
createdBy:createdBy||req.user?._id||req.user?.id||null
});

const updated=await observation.save();
const populated=await Observation.findById(updated._id)
.populate("dailyJournal")
.populate("journalEntry")
.populate("planting")
.populate("garden")
.populate("gardenSection")
.populate("notes.createdBy","name email")
.populate("createdBy","name email");

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const deleteObservation=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid observation id"});
}

const observation=await Observation.findByIdAndDelete(id);
if(!observation){
return res.status(404).json({message:"Observation not found"});
}

return res.status(200).json({message:"Observation deleted successfully"});
}catch(error){
return res.status(500).json({message:error.message});
}
};