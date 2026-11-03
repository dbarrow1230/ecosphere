// backend/controllers/reference/pestRefTreatmentController.js
import mongoose from "mongoose";
import PestRefTreatment from "../../models/reference/pestRefTreatmentModel.js";

export const createPestRefTreatment=async(req,res)=>{
try{
const {
name,
description,
type,
applicationMethod,
dosage,
frequency,
duration,
notes,
isActive,
createdBy
}=req.body;

const treatment=new PestRefTreatment({
name,
description,
type:type||null,
applicationMethod,
dosage,
frequency,
duration,
notes:Array.isArray(notes)?notes:[],
isActive:isActive!==undefined?isActive:true,
createdBy:createdBy||req.user?._id||req.user?.id||null
});

const saved=await treatment.save();
const populated=await PestRefTreatment.findById(saved._id)
.populate("type")
.populate("notes.createdBy","name email")
.populate("createdBy","name email");

return res.status(201).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getPestRefTreatments=async(req,res)=>{
try{
const query={};

if(req.query.type)query.type=req.query.type;
if(req.query.createdBy)query.createdBy=req.query.createdBy;
if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";

if(req.query.search){
query.$or=[
{name:{$regex:req.query.search,$options:"i"}},
{description:{$regex:req.query.search,$options:"i"}},
{applicationMethod:{$regex:req.query.search,$options:"i"}}
];
}

const treatments=await PestRefTreatment.find(query)
.populate("type")
.populate("notes.createdBy","name email")
.populate("createdBy","name email")
.sort({createdAt:-1});

return res.status(200).json(treatments);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getPestRefTreatmentById=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid treatment id"});
}

const treatment=await PestRefTreatment.findById(id)
.populate("type")
.populate("notes.createdBy","name email")
.populate("createdBy","name email");

if(!treatment){
return res.status(404).json({message:"Treatment not found"});
}

return res.status(200).json(treatment);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const updatePestRefTreatment=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid treatment id"});
}

const treatment=await PestRefTreatment.findById(id);
if(!treatment){
return res.status(404).json({message:"Treatment not found"});
}

const {
name,
description,
type,
applicationMethod,
dosage,
frequency,
duration,
notes,
isActive,
createdBy
}=req.body;

if(name!==undefined)treatment.name=name;
if(description!==undefined)treatment.description=description;
if(type!==undefined)treatment.type=type||null;
if(applicationMethod!==undefined)treatment.applicationMethod=applicationMethod;
if(dosage!==undefined)treatment.dosage=dosage;
if(frequency!==undefined)treatment.frequency=frequency;
if(duration!==undefined)treatment.duration=duration;
if(notes!==undefined)treatment.notes=Array.isArray(notes)?notes:treatment.notes;
if(isActive!==undefined)treatment.isActive=isActive;
if(createdBy!==undefined)treatment.createdBy=createdBy||null;

const updated=await treatment.save();
const populated=await PestRefTreatment.findById(updated._id)
.populate("type")
.populate("notes.createdBy","name email")
.populate("createdBy","name email");

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const addPestRefTreatmentNote=async(req,res)=>{
try{
const {id}=req.params;
const {note,date,createdBy}=req.body;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid treatment id"});
}

if(!note){
return res.status(400).json({message:"note is required"});
}

const treatment=await PestRefTreatment.findById(id);
if(!treatment){
return res.status(404).json({message:"Treatment not found"});
}

treatment.notes.push({
note,
date,
createdBy:createdBy||req.user?._id||req.user?.id||null
});

const updated=await treatment.save();
const populated=await PestRefTreatment.findById(updated._id)
.populate("type")
.populate("notes.createdBy","name email")
.populate("createdBy","name email");

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const deletePestRefTreatment=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid treatment id"});
}

const treatment=await PestRefTreatment.findByIdAndDelete(id);
if(!treatment){
return res.status(404).json({message:"Treatment not found"});
}

return res.status(200).json({message:"Treatment deleted successfully"});
}catch(error){
return res.status(500).json({message:error.message});
}
};