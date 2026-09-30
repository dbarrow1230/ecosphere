// backend/controllers/journal/journalEntryController.js
import mongoose from "mongoose";
import "../../models/journal/dailyJournalModel.js";
import "../../models/plants/plantingModel.js";
import "../../models/seeds/seedModel.js";
import "../../models/plants/plantModel.js";
import "../../models/gardens/gardenModel.js";
import "../../models/gardens/gardenSectionModel.js";
import "../../models/hydroponics/hydroSystemModel.js";
import "../../models/equipment/equipmentModel.js";
import JournalEntry from "../../models/journal/journalEntryModel.js";

const entryTypes=["note","maintenance","observation","watering","feeding","pruning","harvest","transplant","pest","disease","hydro-refill","hydro-cleaning","equipment","other"];
const outcomes=["","planned","completed","partial","needs-follow-up","failed","resolved"];

const cleanString=value=>value===undefined||value===null ? "" : String(value).trim();
const cleanNumber=value=>{
const number=Number(value);
return Number.isFinite(number)&&number>=0 ? number : 0;
};
const cleanDate=value=>{
if(!value)return null;
const date=new Date(value);
return Number.isNaN(date.getTime()) ? null : date;
};
const cleanObjectId=value=>{
if(!value)return null;
if(typeof value==="string")return mongoose.Types.ObjectId.isValid(value) ? value : null;
if(value instanceof mongoose.Types.ObjectId)return value;
if(typeof value==="object"){
if(typeof value.$oid==="string")return mongoose.Types.ObjectId.isValid(value.$oid) ? value.$oid : null;
if(typeof value._id==="string")return mongoose.Types.ObjectId.isValid(value._id) ? value._id : null;
if(typeof value.id==="string")return mongoose.Types.ObjectId.isValid(value.id) ? value.id : null;
if(typeof value._id?.$oid==="string")return mongoose.Types.ObjectId.isValid(value._id.$oid) ? value._id.$oid : null;
if(typeof value.id?.$oid==="string")return mongoose.Types.ObjectId.isValid(value.id.$oid) ? value.id.$oid : null;
}
return null;
};
const cleanStringArray=value=>Array.isArray(value)?value.map(item=>cleanString(item)).filter(Boolean):[];
const cleanNotes=value=>Array.isArray(value)?value: [];

const normalizeEntryPayload=(data={},existing={})=>{
const entryType=entryTypes.includes(cleanString(data.entryType)) ? cleanString(data.entryType) : cleanString(existing.entryType)||"note";
const outcome=outcomes.includes(cleanString(data.outcome)) ? cleanString(data.outcome) : cleanString(existing.outcome)||"";

return {
dailyJournal:data.dailyJournal!==undefined ? cleanObjectId(data.dailyJournal) : cleanObjectId(existing.dailyJournal),
planting:data.planting!==undefined ? cleanObjectId(data.planting) : cleanObjectId(existing.planting),
seed:data.seed!==undefined ? cleanObjectId(data.seed) : cleanObjectId(existing.seed),
plant:data.plant!==undefined ? cleanObjectId(data.plant) : cleanObjectId(existing.plant),
garden:data.garden!==undefined ? cleanObjectId(data.garden) : cleanObjectId(existing.garden),
gardenSection:data.gardenSection!==undefined ? cleanObjectId(data.gardenSection) : cleanObjectId(existing.gardenSection),
hydroSystem:data.hydroSystem!==undefined ? cleanObjectId(data.hydroSystem) : cleanObjectId(existing.hydroSystem),
hydroDevice:data.hydroDevice!==undefined ? cleanObjectId(data.hydroDevice) : cleanObjectId(existing.hydroDevice),
hydroPodPosition:data.hydroPodPosition!==undefined ? cleanNumber(data.hydroPodPosition)||null : existing.hydroPodPosition??null,
equipment:data.equipment!==undefined ? cleanObjectId(data.equipment) : cleanObjectId(existing.equipment),
title:data.title!==undefined ? cleanString(data.title) : cleanString(existing.title),
entry:data.entry!==undefined ? cleanString(data.entry) : cleanString(existing.entry),
entryDate:data.entryDate!==undefined ? cleanDate(data.entryDate)||new Date() : cleanDate(existing.entryDate)||new Date(),
entryType,
maintenanceType:data.maintenanceType!==undefined ? cleanString(data.maintenanceType) : cleanString(existing.maintenanceType),
outcome,
durationMinutes:data.durationMinutes!==undefined ? cleanNumber(data.durationMinutes) : cleanNumber(existing.durationMinutes),
followUpDate:data.followUpDate!==undefined ? cleanDate(data.followUpDate) : cleanDate(existing.followUpDate),
mood:data.mood!==undefined ? cleanString(data.mood) : cleanString(existing.mood),
tags:data.tags!==undefined ? cleanStringArray(data.tags) : existing.tags||[],
notes:data.notes!==undefined ? cleanNotes(data.notes) : existing.notes||[],
images:data.images!==undefined ? cleanStringArray(data.images) : existing.images||[],
createdBy:cleanObjectId(data.createdBy)||cleanObjectId(existing.createdBy),
isActive:data.isActive!==undefined ? !!data.isActive : existing.isActive!==undefined ? !!existing.isActive : true
};
};

const populateJournalEntry=query=>query
.populate("dailyJournal")
.populate({path:"planting",populate:[{path:"seed",model:"Seed"},{path:"plant",model:"Plant"},{path:"garden",model:"Garden"},{path:"gardenSection",model:"GardenSection"}]})
.populate("seed")
.populate("plant")
.populate("garden")
.populate("gardenSection")
.populate("hydroSystem")
.populate("equipment")
.populate("notes.createdBy","name email username")
.populate("createdBy","name email username");

export const createJournalEntry=async(req,res)=>{
try{
const data=normalizeEntryPayload({
...req.body,
createdBy:req.body.createdBy||req.user?._id||req.user?.id
});

const journalEntry=new JournalEntry(data);

const saved=await journalEntry.save();
const populated=await populateJournalEntry(JournalEntry.findById(saved._id));

return res.status(201).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getJournalEntries=async(req,res)=>{
try{
const query={};

if(req.query.dailyJournal)query.dailyJournal=req.query.dailyJournal;
if(req.query.planting)query.planting=req.query.planting;
if(req.query.seed)query.seed=req.query.seed;
if(req.query.plant)query.plant=req.query.plant;
if(req.query.garden)query.garden=req.query.garden;
if(req.query.gardenSection)query.gardenSection=req.query.gardenSection;
if(req.query.hydroSystem)query.hydroSystem=req.query.hydroSystem;
if(req.query.equipment)query.equipment=req.query.equipment;
if(req.query.entryType)query.entryType=req.query.entryType;
if(req.query.outcome)query.outcome=req.query.outcome;
if(req.query.createdBy)query.createdBy=req.query.createdBy;
if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";

if(req.query.search){
query.$or=[
{title:{$regex:req.query.search,$options:"i"}},
{entry:{$regex:req.query.search,$options:"i"}},
{tags:{$regex:req.query.search,$options:"i"}}
];
}

const entries=await populateJournalEntry(JournalEntry.find(query))
.sort({entryDate:-1,createdAt:-1});

return res.status(200).json(entries);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getJournalEntryById=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid journal entry id"});
}

const entry=await populateJournalEntry(JournalEntry.findById(id));

if(!entry){
return res.status(404).json({message:"Journal entry not found"});
}

return res.status(200).json(entry);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const updateJournalEntry=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid journal entry id"});
}

const entryDoc=await JournalEntry.findById(id);
if(!entryDoc){
return res.status(404).json({message:"Journal entry not found"});
}

const data=normalizeEntryPayload(req.body,entryDoc);

Object.keys(data).forEach(key=>{
entryDoc[key]=data[key];
});

const updated=await entryDoc.save();
const populated=await populateJournalEntry(JournalEntry.findById(updated._id));

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const addJournalEntryNote=async(req,res)=>{
try{
const {id}=req.params;
const {note,date,createdBy}=req.body;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid journal entry id"});
}

if(!note){
return res.status(400).json({message:"note is required"});
}

const entryDoc=await JournalEntry.findById(id);
if(!entryDoc){
return res.status(404).json({message:"Journal entry not found"});
}

entryDoc.notes.push({
note,
date,
createdBy:createdBy||req.user?._id||req.user?.id||null
});

const updated=await entryDoc.save();
const populated=await populateJournalEntry(JournalEntry.findById(updated._id));

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const deleteJournalEntry=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid journal entry id"});
}

const entryDoc=await JournalEntry.findByIdAndDelete(id);
if(!entryDoc){
return res.status(404).json({message:"Journal entry not found"});
}

return res.status(200).json({message:"Journal entry deleted successfully"});
}catch(error){
return res.status(500).json({message:error.message});
}
};
