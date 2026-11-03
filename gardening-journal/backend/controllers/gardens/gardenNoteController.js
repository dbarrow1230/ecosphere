// backend/controllers/gardens/gardenNoteController.js
import mongoose from "mongoose";
import GardenNote from "../../models/gardens/gardenNoteModel.js";

export const createGardenNote=async(req,res)=>{
try{
const {garden,section,title,note,tags,images,createdBy,isActive}=req.body;

if(!garden){
return res.status(400).json({message:"garden is required"});
}

const newNote=new GardenNote({
garden,
section:section||null,
title,
note,
tags:Array.isArray(tags)?tags:[],
images:Array.isArray(images)?images:[],
createdBy:createdBy||req.user?._id||req.user?.id||null,
isActive:isActive!==undefined?isActive:true
});

const saved=await newNote.save();
const populated=await GardenNote.findById(saved._id)
.populate("garden")
.populate("section")
.populate("createdBy","name email");

return res.status(201).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getGardenNotes=async(req,res)=>{
try{
const query={};

if(req.query.garden)query.garden=req.query.garden;
if(req.query.section)query.section=req.query.section;
if(req.query.createdBy)query.createdBy=req.query.createdBy;
if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";

if(req.query.search){
query.$or=[
{title:{$regex:req.query.search,$options:"i"}},
{note:{$regex:req.query.search,$options:"i"}},
{tags:{$regex:req.query.search,$options:"i"}}
];
}

const notes=await GardenNote.find(query)
.populate("garden")
.populate("section")
.populate("createdBy","name email")
.sort({createdAt:-1});

return res.status(200).json(notes);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getGardenNoteById=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid garden note id"});
}

const note=await GardenNote.findById(id)
.populate("garden")
.populate("section")
.populate("createdBy","name email");

if(!note){
return res.status(404).json({message:"Garden note not found"});
}

return res.status(200).json(note);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const updateGardenNote=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid garden note id"});
}

const noteDoc=await GardenNote.findById(id);
if(!noteDoc){
return res.status(404).json({message:"Garden note not found"});
}

const {garden,section,title,note,tags,images,createdBy,isActive}=req.body;

if(garden!==undefined)noteDoc.garden=garden;
if(section!==undefined)noteDoc.section=section||null;
if(title!==undefined)noteDoc.title=title;
if(note!==undefined)noteDoc.note=note;
if(tags!==undefined)noteDoc.tags=Array.isArray(tags)?tags:noteDoc.tags;
if(images!==undefined)noteDoc.images=Array.isArray(images)?images:noteDoc.images;
if(createdBy!==undefined)noteDoc.createdBy=createdBy||null;
if(isActive!==undefined)noteDoc.isActive=isActive;

const updated=await noteDoc.save();
const populated=await GardenNote.findById(updated._id)
.populate("garden")
.populate("section")
.populate("createdBy","name email");

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const deleteGardenNote=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid garden note id"});
}

const note=await GardenNote.findByIdAndDelete(id);
if(!note){
return res.status(404).json({message:"Garden note not found"});
}

return res.status(200).json({message:"Garden note deleted successfully"});
}catch(error){
return res.status(500).json({message:error.message});
}
};