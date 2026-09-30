// backend/controllers/harvest/harvestController.js
import mongoose from "mongoose";
import "../../models/plants/plantingModel.js";
import "../../models/seeds/seedModel.js";
import "../../models/plants/plantModel.js";
import "../../models/gardens/gardenModel.js";
import "../../models/gardens/gardenSectionModel.js";
import "../../models/plants/plantVarietyModel.js";
import "../../models/plants/plantStageModel.js";
import Harvest from "../../models/harvest/harvestModel.js";

const plantingPopulate={
path:"planting",
populate:[
{path:"seed",model:"Seed"},
{path:"plant",model:"Plant"},
{path:"garden",model:"Garden"},
{path:"gardenSection",model:"GardenSection"},
{path:"variety",model:"PlantVariety"},
{path:"currentStage",model:"PlantStage"}
]
};

export const createHarvest=async(req,res)=>{
try{
const {
planting,
harvestDate,
harvestAmount,
usableAmount,
wasteAmount,
pricingSnapshot,
quality,
notes,
images,
createdBy,
isActive
}=req.body;

if(!planting){
return res.status(400).json({message:"planting is required"});
}

const harvest=new Harvest({
planting,
harvestDate,
harvestAmount:{
g:harvestAmount?.g||0,
oz:harvestAmount?.oz||0,
lb:harvestAmount?.lb||0
},
usableAmount:{
g:usableAmount?.g||0,
oz:usableAmount?.oz||0,
lb:usableAmount?.lb||0
},
wasteAmount:{
g:wasteAmount?.g||0,
oz:wasteAmount?.oz||0,
lb:wasteAmount?.lb||0
},
pricingSnapshot:pricingSnapshot?{
marketPrice:pricingSnapshot.marketPrice||null,
gRate:pricingSnapshot.gRate||0,
ozRate:pricingSnapshot.ozRate||0,
lbRate:pricingSnapshot.lbRate||0,
gValue:pricingSnapshot.gValue||0,
ozValue:pricingSnapshot.ozValue||0,
lbValue:pricingSnapshot.lbValue||0,
totalValue:pricingSnapshot.totalValue||0,
capturedAt:pricingSnapshot.capturedAt
}:undefined,
quality:quality||null,
notes:Array.isArray(notes)?notes:[],
images:Array.isArray(images)?images:[],
createdBy:createdBy||req.user?._id||req.user?.id||null,
isActive:isActive!==undefined?isActive:true
});

const saved=await harvest.save();
const populated=await Harvest.findById(saved._id)
.populate(plantingPopulate)
.populate("pricingSnapshot.marketPrice")
.populate("quality")
.populate("notes.createdBy","name email")
.populate("createdBy","name email");

return res.status(201).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getHarvests=async(req,res)=>{
try{
const query={};

if(req.query.planting)query.planting=req.query.planting;
if(req.query.quality)query.quality=req.query.quality;
if(req.query.createdBy)query.createdBy=req.query.createdBy;
if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";

const harvests=await Harvest.find(query)
.populate(plantingPopulate)
.populate("pricingSnapshot.marketPrice")
.populate("quality")
.populate("notes.createdBy","name email")
.populate("createdBy","name email")
.sort({harvestDate:-1,createdAt:-1});

return res.status(200).json(harvests);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getHarvestById=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid harvest id"});
}

const harvest=await Harvest.findById(id)
.populate(plantingPopulate)
.populate("pricingSnapshot.marketPrice")
.populate("quality")
.populate("notes.createdBy","name email")
.populate("createdBy","name email");

if(!harvest){
return res.status(404).json({message:"Harvest not found"});
}

return res.status(200).json(harvest);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const updateHarvest=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid harvest id"});
}

const harvest=await Harvest.findById(id);
if(!harvest){
return res.status(404).json({message:"Harvest not found"});
}

const {
planting,
harvestDate,
lastHarvested,
daysSinceLastHarvest,
harvestAmount,
usableAmount,
wasteAmount,
pricingSnapshot,
quality,
notes,
images,
createdBy,
isActive
}=req.body;

if(planting!==undefined)harvest.planting=planting;
if(harvestDate!==undefined)harvest.harvestDate=harvestDate;
if(lastHarvested!==undefined)harvest.lastHarvested=lastHarvested;
if(daysSinceLastHarvest!==undefined)harvest.daysSinceLastHarvest=daysSinceLastHarvest;

if(harvestAmount!==undefined){
harvest.harvestAmount={
g:harvestAmount?.g||0,
oz:harvestAmount?.oz||0,
lb:harvestAmount?.lb||0
};
}

if(usableAmount!==undefined){
harvest.usableAmount={
g:usableAmount?.g||0,
oz:usableAmount?.oz||0,
lb:usableAmount?.lb||0
};
}

if(wasteAmount!==undefined){
harvest.wasteAmount={
g:wasteAmount?.g||0,
oz:wasteAmount?.oz||0,
lb:wasteAmount?.lb||0
};
}

if(pricingSnapshot!==undefined){
harvest.pricingSnapshot=pricingSnapshot?{
marketPrice:pricingSnapshot.marketPrice||null,
gRate:pricingSnapshot.gRate||0,
ozRate:pricingSnapshot.ozRate||0,
lbRate:pricingSnapshot.lbRate||0,
gValue:pricingSnapshot.gValue||0,
ozValue:pricingSnapshot.ozValue||0,
lbValue:pricingSnapshot.lbValue||0,
totalValue:pricingSnapshot.totalValue||0,
capturedAt:pricingSnapshot.capturedAt||Date.now()
}:harvest.pricingSnapshot;
}

if(quality!==undefined)harvest.quality=quality||null;
if(notes!==undefined)harvest.notes=Array.isArray(notes)?notes:harvest.notes;
if(images!==undefined)harvest.images=Array.isArray(images)?images:harvest.images;
if(createdBy!==undefined)harvest.createdBy=createdBy||null;
if(isActive!==undefined)harvest.isActive=isActive;

const updated=await harvest.save();
const populated=await Harvest.findById(updated._id)
.populate(plantingPopulate)
.populate("pricingSnapshot.marketPrice")
.populate("quality")
.populate("notes.createdBy","name email")
.populate("createdBy","name email");

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const addHarvestNote=async(req,res)=>{
try{
const {id}=req.params;
const {note,date,createdBy}=req.body;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid harvest id"});
}

if(!note){
return res.status(400).json({message:"note is required"});
}

const harvest=await Harvest.findById(id);
if(!harvest){
return res.status(404).json({message:"Harvest not found"});
}

harvest.notes.push({
note,
date,
createdBy:createdBy||req.user?._id||req.user?.id||null
});

const updated=await harvest.save();
const populated=await Harvest.findById(updated._id)
.populate(plantingPopulate)
.populate("pricingSnapshot.marketPrice")
.populate("quality")
.populate("notes.createdBy","name email")
.populate("createdBy","name email");

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const deleteHarvest=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid harvest id"});
}

const harvest=await Harvest.findByIdAndDelete(id);
if(!harvest){
return res.status(404).json({message:"Harvest not found"});
}

return res.status(200).json({message:"Harvest deleted successfully"});
}catch(error){
return res.status(500).json({message:error.message});
}
};
