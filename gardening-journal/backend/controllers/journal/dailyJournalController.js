// backend/controllers/journal/dailyJournalController.js
import mongoose from "mongoose";
import "../../models/seeds/seedModel.js";
import "../../models/plants/plantModel.js";
import "../../models/hydroponics/hydroSystemModel.js";
import "../../models/equipment/equipmentModel.js";
import DailyJournal from "../../models/journal/dailyJournalModel.js";

const populateDailyJournal=query=>query
.populate("garden")
.populate("gardenSection")
.populate({path:"planting",populate:[{path:"seed",model:"Seed"},{path:"plant",model:"Plant"}]})
.populate("seed")
.populate("plant")
.populate("hydroSystem")
.populate("equipment")
.populate("weatherObservation")
.populate("notes.createdBy","name email username")
.populate("entries")
.populate("observations")
.populate("activities")
.populate("createdBy","name email username");

export const createDailyJournal=async(req,res)=>{
try{
const {
journalDate,
garden,
gardenSection,
planting,
seed,
plant,
hydroSystem,
equipment,
weatherObservation,
summary,
notes,
entries,
observations,
activities,
images,
createdBy,
isActive
}=req.body;

const dailyJournal=new DailyJournal({
journalDate,
garden:garden||null,
gardenSection:gardenSection||null,
planting:planting||null,
seed:seed||null,
plant:plant||null,
hydroSystem:hydroSystem||null,
equipment:equipment||null,
weatherObservation:weatherObservation||null,
summary,
notes:Array.isArray(notes)?notes:[],
entries:Array.isArray(entries)?entries:[],
observations:Array.isArray(observations)?observations:[],
activities:Array.isArray(activities)?activities:[],
images:Array.isArray(images)?images:[],
createdBy:createdBy||req.user?._id||req.user?.id||null,
isActive:isActive!==undefined?isActive:true
});

const saved=await dailyJournal.save();
const populated=await populateDailyJournal(DailyJournal.findById(saved._id));

return res.status(201).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getDailyJournals=async(req,res)=>{
try{
const query={};

if(req.query.garden)query.garden=req.query.garden;
if(req.query.gardenSection)query.gardenSection=req.query.gardenSection;
if(req.query.planting)query.planting=req.query.planting;
if(req.query.seed)query.seed=req.query.seed;
if(req.query.plant)query.plant=req.query.plant;
if(req.query.hydroSystem)query.hydroSystem=req.query.hydroSystem;
if(req.query.equipment)query.equipment=req.query.equipment;
if(req.query.weatherObservation)query.weatherObservation=req.query.weatherObservation;
if(req.query.createdBy)query.createdBy=req.query.createdBy;
if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";

if(req.query.search){
query.$or=[
{summary:{$regex:req.query.search,$options:"i"}},
{"notes.note":{$regex:req.query.search,$options:"i"}}
];
}

const dailyJournals=await populateDailyJournal(DailyJournal.find(query))
.sort({journalDate:-1,createdAt:-1});

return res.status(200).json(dailyJournals);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getDailyJournalById=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid daily journal id"});
}

const dailyJournal=await populateDailyJournal(DailyJournal.findById(id));

if(!dailyJournal){
return res.status(404).json({message:"Daily journal not found"});
}

return res.status(200).json(dailyJournal);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const updateDailyJournal=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid daily journal id"});
}

const dailyJournal=await DailyJournal.findById(id);
if(!dailyJournal){
return res.status(404).json({message:"Daily journal not found"});
}

const {
journalDate,
garden,
gardenSection,
planting,
seed,
plant,
hydroSystem,
equipment,
weatherObservation,
summary,
notes,
entries,
observations,
activities,
images,
createdBy,
isActive
}=req.body;

if(journalDate!==undefined)dailyJournal.journalDate=journalDate;
if(garden!==undefined)dailyJournal.garden=garden||null;
if(gardenSection!==undefined)dailyJournal.gardenSection=gardenSection||null;
if(planting!==undefined)dailyJournal.planting=planting||null;
if(seed!==undefined)dailyJournal.seed=seed||null;
if(plant!==undefined)dailyJournal.plant=plant||null;
if(hydroSystem!==undefined)dailyJournal.hydroSystem=hydroSystem||null;
if(equipment!==undefined)dailyJournal.equipment=equipment||null;
if(weatherObservation!==undefined)dailyJournal.weatherObservation=weatherObservation||null;
if(summary!==undefined)dailyJournal.summary=summary;
if(notes!==undefined)dailyJournal.notes=Array.isArray(notes)?notes:dailyJournal.notes;
if(entries!==undefined)dailyJournal.entries=Array.isArray(entries)?entries:dailyJournal.entries;
if(observations!==undefined)dailyJournal.observations=Array.isArray(observations)?observations:dailyJournal.observations;
if(activities!==undefined)dailyJournal.activities=Array.isArray(activities)?activities:dailyJournal.activities;
if(images!==undefined)dailyJournal.images=Array.isArray(images)?images:dailyJournal.images;
if(createdBy!==undefined)dailyJournal.createdBy=createdBy||null;
if(isActive!==undefined)dailyJournal.isActive=isActive;

const updated=await dailyJournal.save();
const populated=await populateDailyJournal(DailyJournal.findById(updated._id));

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const addDailyJournalNote=async(req,res)=>{
try{
const {id}=req.params;
const {note,date,createdBy}=req.body;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid daily journal id"});
}

if(!note){
return res.status(400).json({message:"note is required"});
}

const dailyJournal=await DailyJournal.findById(id);
if(!dailyJournal){
return res.status(404).json({message:"Daily journal not found"});
}

dailyJournal.notes.push({
note,
date,
createdBy:createdBy||req.user?._id||req.user?.id||null
});

const updated=await dailyJournal.save();
const populated=await populateDailyJournal(DailyJournal.findById(updated._id));

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const deleteDailyJournal=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid daily journal id"});
}

const dailyJournal=await DailyJournal.findByIdAndDelete(id);
if(!dailyJournal){
return res.status(404).json({message:"Daily journal not found"});
}

return res.status(200).json({message:"Daily journal deleted successfully"});
}catch(error){
return res.status(500).json({message:error.message});
}
};
