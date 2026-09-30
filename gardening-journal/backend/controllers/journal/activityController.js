// backend/controllers/journal/activityController.js
import mongoose from "mongoose";
import "../../models/seeds/seedModel.js";
import "../../models/plants/plantModel.js";
import "../../models/hydroponics/hydroSystemModel.js";
import "../../models/equipment/equipmentModel.js";
import Activity from "../../models/journal/activityModel.js";

const populateActivity=query=>query
.populate("activityType")
.populate("garden")
.populate("section")
.populate({path:"planting",populate:[{path:"seed",model:"Seed"},{path:"plant",model:"Plant"}]})
.populate("seed")
.populate("plant")
.populate("hydroSystem")
.populate("equipment")
.populate("notes.createdBy","name email username")
.populate("createdBy","name email username");

export const createActivity=async(req,res)=>{
try{
const {
title,
description,
activityType,
garden,
section,
planting,
seed,
plant,
hydroSystem,
hydroDevice,
hydroPodPosition,
equipment,
outcome,
followUpDate,
activityDate,
durationMinutes,
status,
priority,
tags,
images,
notes,
createdBy,
isActive
}=req.body;

const activity=new Activity({
title,
description,
activityType:activityType||null,
garden:garden||null,
section:section||null,
planting:planting||null,
seed:seed||null,
plant:plant||null,
hydroSystem:hydroSystem||null,
hydroDevice:hydroDevice||null,
hydroPodPosition:hydroPodPosition||null,
equipment:equipment||null,
outcome:outcome||"",
followUpDate:followUpDate||null,
activityDate,
durationMinutes,
status,
priority,
tags:Array.isArray(tags)?tags:[],
images:Array.isArray(images)?images:[],
notes:Array.isArray(notes)?notes:[],
createdBy:createdBy||req.user?._id||req.user?.id||null,
isActive:isActive!==undefined?isActive:true
});

const saved=await activity.save();
const populated=await populateActivity(Activity.findById(saved._id));

return res.status(201).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getActivities=async(req,res)=>{
try{
const query={};

if(req.query.activityType)query.activityType=req.query.activityType;
if(req.query.garden)query.garden=req.query.garden;
if(req.query.section)query.section=req.query.section;
if(req.query.planting)query.planting=req.query.planting;
if(req.query.seed)query.seed=req.query.seed;
if(req.query.plant)query.plant=req.query.plant;
if(req.query.hydroSystem)query.hydroSystem=req.query.hydroSystem;
if(req.query.equipment)query.equipment=req.query.equipment;
if(req.query.status)query.status=req.query.status;
if(req.query.priority)query.priority=req.query.priority;
if(req.query.createdBy)query.createdBy=req.query.createdBy;
if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";

if(req.query.search){
query.$or=[
{title:{$regex:req.query.search,$options:"i"}},
{description:{$regex:req.query.search,$options:"i"}},
{tags:{$regex:req.query.search,$options:"i"}}
];
}

const activities=await populateActivity(Activity.find(query))
.sort({activityDate:-1,createdAt:-1});

return res.status(200).json(activities);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getActivityById=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid activity id"});
}

const activity=await populateActivity(Activity.findById(id));

if(!activity){
return res.status(404).json({message:"Activity not found"});
}

return res.status(200).json(activity);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const updateActivity=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid activity id"});
}

const activity=await Activity.findById(id);
if(!activity){
return res.status(404).json({message:"Activity not found"});
}

const {
title,
description,
activityType,
garden,
section,
planting,
seed,
plant,
hydroSystem,
hydroDevice,
hydroPodPosition,
equipment,
outcome,
followUpDate,
activityDate,
durationMinutes,
status,
priority,
tags,
images,
notes,
createdBy,
isActive
}=req.body;

if(title!==undefined)activity.title=title;
if(description!==undefined)activity.description=description;
if(activityType!==undefined)activity.activityType=activityType||null;
if(garden!==undefined)activity.garden=garden||null;
if(section!==undefined)activity.section=section||null;
if(planting!==undefined)activity.planting=planting||null;
if(seed!==undefined)activity.seed=seed||null;
if(plant!==undefined)activity.plant=plant||null;
if(hydroSystem!==undefined)activity.hydroSystem=hydroSystem||null;
if(hydroDevice!==undefined)activity.hydroDevice=hydroDevice||null;
if(hydroPodPosition!==undefined)activity.hydroPodPosition=hydroPodPosition||null;
if(equipment!==undefined)activity.equipment=equipment||null;
if(outcome!==undefined)activity.outcome=outcome||"";
if(followUpDate!==undefined)activity.followUpDate=followUpDate||null;
if(activityDate!==undefined)activity.activityDate=activityDate;
if(durationMinutes!==undefined)activity.durationMinutes=durationMinutes;
if(status!==undefined)activity.status=status;
if(priority!==undefined)activity.priority=priority;
if(tags!==undefined)activity.tags=Array.isArray(tags)?tags:activity.tags;
if(images!==undefined)activity.images=Array.isArray(images)?images:activity.images;
if(notes!==undefined)activity.notes=Array.isArray(notes)?notes:activity.notes;
if(createdBy!==undefined)activity.createdBy=createdBy||null;
if(isActive!==undefined)activity.isActive=isActive;

const updated=await activity.save();
const populated=await populateActivity(Activity.findById(updated._id));

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const addActivityNote=async(req,res)=>{
try{
const {id}=req.params;
const {note,date,createdBy}=req.body;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid activity id"});
}

if(!note){
return res.status(400).json({message:"note is required"});
}

const activity=await Activity.findById(id);
if(!activity){
return res.status(404).json({message:"Activity not found"});
}

activity.notes.push({
note,
date,
createdBy:createdBy||req.user?._id||req.user?.id||null
});

const updated=await activity.save();
const populated=await populateActivity(Activity.findById(updated._id));

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const deleteActivity=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid activity id"});
}

const activity=await Activity.findByIdAndDelete(id);
if(!activity){
return res.status(404).json({message:"Activity not found"});
}

return res.status(200).json({message:"Activity deleted successfully"});
}catch(error){
return res.status(500).json({message:error.message});
}
};
