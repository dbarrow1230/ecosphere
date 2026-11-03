// backend/controllers/media/mediaController.js
import mongoose from "mongoose";
import Media from "../../models/media/mediaModel.js";

export const createMedia=async(req,res)=>{
try{
const {
url,
fileName,
fileType,
mimeType,
size,
garden,
gardenSection,
planting,
journalEntry,
observation,
activity,
harvest,
diseaseLog,
pestLog,
tags,
description,
createdBy,
isActive
}=req.body;

const media=new Media({
url,
fileName,
fileType,
mimeType,
size,
garden:garden||null,
gardenSection:gardenSection||null,
planting:planting||null,
journalEntry:journalEntry||null,
observation:observation||null,
activity:activity||null,
harvest:harvest||null,
diseaseLog:diseaseLog||null,
pestLog:pestLog||null,
tags:Array.isArray(tags)?tags:[],
description,
createdBy:createdBy||req.user?._id||req.user?.id||null,
isActive:isActive!==undefined?isActive:true
});

const saved=await media.save();
const populated=await Media.findById(saved._id)
.populate("garden")
.populate("gardenSection")
.populate("planting")
.populate("journalEntry")
.populate("observation")
.populate("activity")
.populate("harvest")
.populate("diseaseLog")
.populate("pestLog")
.populate("createdBy","name email");

return res.status(201).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getMedia=async(req,res)=>{
try{
const query={};

if(req.query.garden)query.garden=req.query.garden;
if(req.query.gardenSection)query.gardenSection=req.query.gardenSection;
if(req.query.planting)query.planting=req.query.planting;
if(req.query.journalEntry)query.journalEntry=req.query.journalEntry;
if(req.query.observation)query.observation=req.query.observation;
if(req.query.activity)query.activity=req.query.activity;
if(req.query.harvest)query.harvest=req.query.harvest;
if(req.query.diseaseLog)query.diseaseLog=req.query.diseaseLog;
if(req.query.pestLog)query.pestLog=req.query.pestLog;
if(req.query.createdBy)query.createdBy=req.query.createdBy;
if(req.query.fileType)query.fileType=req.query.fileType;
if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";

if(req.query.search){
query.$or=[
{fileName:{$regex:req.query.search,$options:"i"}},
{description:{$regex:req.query.search,$options:"i"}},
{tags:{$regex:req.query.search,$options:"i"}}
];
}

const media=await Media.find(query)
.populate("garden")
.populate("gardenSection")
.populate("planting")
.populate("journalEntry")
.populate("observation")
.populate("activity")
.populate("harvest")
.populate("diseaseLog")
.populate("pestLog")
.populate("createdBy","name email")
.sort({createdAt:-1});

return res.status(200).json(media);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getMediaById=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid media id"});
}

const media=await Media.findById(id)
.populate("garden")
.populate("gardenSection")
.populate("planting")
.populate("journalEntry")
.populate("observation")
.populate("activity")
.populate("harvest")
.populate("diseaseLog")
.populate("pestLog")
.populate("createdBy","name email");

if(!media){
return res.status(404).json({message:"Media not found"});
}

return res.status(200).json(media);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const updateMedia=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid media id"});
}

const media=await Media.findById(id);
if(!media){
return res.status(404).json({message:"Media not found"});
}

const {
url,
fileName,
fileType,
mimeType,
size,
garden,
gardenSection,
planting,
journalEntry,
observation,
activity,
harvest,
diseaseLog,
pestLog,
tags,
description,
createdBy,
isActive
}=req.body;

if(url!==undefined)media.url=url;
if(fileName!==undefined)media.fileName=fileName;
if(fileType!==undefined)media.fileType=fileType;
if(mimeType!==undefined)media.mimeType=mimeType;
if(size!==undefined)media.size=size;

if(garden!==undefined)media.garden=garden||null;
if(gardenSection!==undefined)media.gardenSection=gardenSection||null;
if(planting!==undefined)media.planting=planting||null;
if(journalEntry!==undefined)media.journalEntry=journalEntry||null;
if(observation!==undefined)media.observation=observation||null;
if(activity!==undefined)media.activity=activity||null;
if(harvest!==undefined)media.harvest=harvest||null;
if(diseaseLog!==undefined)media.diseaseLog=diseaseLog||null;
if(pestLog!==undefined)media.pestLog=pestLog||null;

if(tags!==undefined)media.tags=Array.isArray(tags)?tags:media.tags;
if(description!==undefined)media.description=description;
if(createdBy!==undefined)media.createdBy=createdBy||null;
if(isActive!==undefined)media.isActive=isActive;

const updated=await media.save();
const populated=await Media.findById(updated._id)
.populate("garden")
.populate("gardenSection")
.populate("planting")
.populate("journalEntry")
.populate("observation")
.populate("activity")
.populate("harvest")
.populate("diseaseLog")
.populate("pestLog")
.populate("createdBy","name email");

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const deleteMedia=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid media id"});
}

const media=await Media.findByIdAndDelete(id);
if(!media){
return res.status(404).json({message:"Media not found"});
}

return res.status(200).json({message:"Media deleted successfully"});
}catch(error){
return res.status(500).json({message:error.message});
}
};