// backend/controllers/gardens/gardenSectionController.js
import mongoose from "mongoose";
import "../../models/gardens/gardenReferenceModels.js";
import GardenSection from "../../models/gardens/gardenSectionModel.js";
import Garden from "../../models/gardens/gardenModel.js";

const populateSection=query=>query
.populate("garden","name gardenType")
.populate("type")
.populate("notes.createdBy","name email username")
.populate("createdBy","name email username");

export const createGardenSection=async(req,res)=>{
try{
const {garden,name,type,size,notes,createdBy,isActive}=req.body;

if(!garden||!mongoose.Types.ObjectId.isValid(garden)){
return res.status(400).json({message:"A valid garden is required"});
}

if(!name||!type){
return res.status(400).json({message:"Section name and location type are required"});
}

const section=new GardenSection({
garden,
name,
type,
size:{
metric:Array.isArray(size?.metric)?size.metric:[],
imperial:Array.isArray(size?.imperial)?size.imperial:[]
},
notes:Array.isArray(notes)?notes:[],
createdBy:createdBy||req.user?._id||req.user?.id||null,
isActive:isActive!==undefined?isActive:true
});

const saved=await section.save();
await Garden.findByIdAndUpdate(garden,{$addToSet:{sections:saved._id}});
const populated=await populateSection(GardenSection.findById(saved._id));

return res.status(201).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getGardenSections=async(req,res)=>{
try{
const query={};

if(req.query.garden)query.garden=req.query.garden;
if(req.query.type)query.type=req.query.type;
if(req.query.createdBy)query.createdBy=req.query.createdBy;
if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";

if(req.query.search){
query.$or=[
{name:{$regex:req.query.search,$options:"i"}}
];
}

const sections=await populateSection(GardenSection.find(query)).sort({createdAt:-1});

return res.status(200).json(sections);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getGardenSectionById=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid garden section id"});
}

const section=await populateSection(GardenSection.findById(id));

if(!section){
return res.status(404).json({message:"Garden section not found"});
}

return res.status(200).json(section);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const updateGardenSection=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid garden section id"});
}

const section=await GardenSection.findById(id);
if(!section){
return res.status(404).json({message:"Garden section not found"});
}

const {garden,name,type,size,notes,createdBy,isActive}=req.body;

const previousGarden=String(section.garden||"");
if(garden!==undefined)section.garden=garden;
if(name!==undefined)section.name=name;
if(type!==undefined)section.type=type;
if(size!==undefined){
section.size={
metric:Array.isArray(size?.metric)?size.metric:section.size?.metric||[],
imperial:Array.isArray(size?.imperial)?size.imperial:section.size?.imperial||[]
};
}
if(notes!==undefined)section.notes=Array.isArray(notes)?notes:section.notes;
if(createdBy!==undefined)section.createdBy=createdBy||null;
if(isActive!==undefined)section.isActive=isActive;

const updated=await section.save();
if(garden!==undefined&&String(garden)!==previousGarden){
 await Garden.findByIdAndUpdate(previousGarden,{$pull:{sections:updated._id}});
 await Garden.findByIdAndUpdate(garden,{$addToSet:{sections:updated._id}});
}
const populated=await populateSection(GardenSection.findById(updated._id));

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const addGardenSectionNote=async(req,res)=>{
try{
const {id}=req.params;
const {note,date,createdBy}=req.body;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid garden section id"});
}

if(!note){
return res.status(400).json({message:"note is required"});
}

const section=await GardenSection.findById(id);
if(!section){
return res.status(404).json({message:"Garden section not found"});
}

section.notes.push({
note,
date,
createdBy:createdBy||req.user?._id||req.user?.id||null
});

const updated=await section.save();
const populated=await populateSection(GardenSection.findById(updated._id));

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const deleteGardenSection=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid garden section id"});
}

const section=await GardenSection.findByIdAndDelete(id);
if(!section){
return res.status(404).json({message:"Garden section not found"});
}

await Garden.findByIdAndUpdate(section.garden,{$pull:{sections:section._id}});

return res.status(200).json({message:"Garden section deleted successfully"});
}catch(error){
return res.status(500).json({message:error.message});
}
};
