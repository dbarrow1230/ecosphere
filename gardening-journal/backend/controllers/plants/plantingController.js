// backend/controllers/plants/plantingController.js
import mongoose from "mongoose";
import Planting from "../../models/plants/plantingModel.js";

const statuses=["active","germinating","seedling","transplanted","harvested","failed","dead","archived"];
const sourceTypes=["seed","plant",""];

const cleanString=value=>value===undefined||value===null ? "" : String(value).trim();

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

const cleanDate=value=>{
if(!value)return null;
const date=new Date(value);
return Number.isNaN(date.getTime()) ? null : date;
};

const cleanNumber=value=>{
const number=Number(value);
return Number.isFinite(number)&&number>=0 ? number : 0;
};

const cleanNotes=value=>{
if(!Array.isArray(value))return [];
return value.map(item=>{
const current=item&&typeof item==="object"&&!Array.isArray(item)?item:{note:item};
return {
note:cleanString(current.note),
date:cleanDate(current.date)||new Date(),
createdBy:cleanObjectId(current.createdBy)
};
}).filter(item=>item.note);
};

const normalizePlantingPayload=(data={},existing={})=>{
const plant=data.plant!==undefined ? cleanObjectId(data.plant) : cleanObjectId(existing.plant);
const seed=data.seed!==undefined ? cleanObjectId(data.seed) : cleanObjectId(existing.seed);
const existingSourceType=cleanString(existing.sourceType);
const sourceType=sourceTypes.includes(cleanString(data.sourceType))
?cleanString(data.sourceType)
:(existingSourceType&&sourceTypes.includes(existingSourceType) ? existingSourceType : seed ? "seed" : plant ? "plant" : "");
const status=statuses.includes(cleanString(data.status))
?cleanString(data.status)
:statuses.includes(cleanString(existing.status)) ? cleanString(existing.status) : "active";

return {
instanceName:data.instanceName!==undefined ? cleanString(data.instanceName) : cleanString(existing.instanceName),
sourceType,
plant,
seed,
garden:data.garden!==undefined ? cleanObjectId(data.garden) : cleanObjectId(existing.garden),
gardenSection:data.gardenSection!==undefined ? cleanObjectId(data.gardenSection) : cleanObjectId(existing.gardenSection),
variety:data.variety!==undefined ? cleanObjectId(data.variety) : cleanObjectId(existing.variety),
currentStage:data.currentStage!==undefined ? cleanObjectId(data.currentStage) : cleanObjectId(existing.currentStage),
plantedDate:data.plantedDate!==undefined ? cleanDate(data.plantedDate) : cleanDate(existing.plantedDate),
expectedHarvestDate:data.expectedHarvestDate!==undefined ? cleanDate(data.expectedHarvestDate) : cleanDate(existing.expectedHarvestDate),
endDate:data.endDate!==undefined ? cleanDate(data.endDate) : cleanDate(existing.endDate),
deathDate:status==="dead" ? data.deathDate!==undefined ? cleanDate(data.deathDate) : cleanDate(existing.deathDate) : null,
status,
quantity:data.quantity!==undefined ? cleanNumber(data.quantity)||1 : cleanNumber(existing.quantity)||1,
location:data.location!==undefined ? cleanString(data.location) : cleanString(existing.location),
failureReason:data.failureReason!==undefined ? cleanString(data.failureReason) : cleanString(existing.failureReason),
outcomeNotes:data.outcomeNotes!==undefined ? cleanString(data.outcomeNotes) : cleanString(existing.outcomeNotes),
notes:data.notes!==undefined ? cleanNotes(data.notes) : existing.notes||[],
createdBy:cleanObjectId(data.createdBy)||cleanObjectId(existing.createdBy),
isActive:data.isActive!==undefined ? !!data.isActive : existing.isActive!==undefined ? !!existing.isActive : true
};
};

const populatePlanting=query=>{
return query
.populate("plant")
.populate("seed")
.populate("garden")
.populate("gardenSection")
.populate("variety")
.populate("currentStage")
.populate("notes.createdBy","name email username")
.populate("createdBy","name email username");
};

export const createPlanting=async(req,res)=>{
try{
const data=normalizePlantingPayload({
...req.body,
createdBy:req.body.createdBy||req.user?._id||req.user?.id
});

if(!data.plant&&!data.seed){
return res.status(400).json({message:"A plant or seed is required to create an instance"});
}

if(!data.garden){
return res.status(400).json({message:"A garden is required to start a growing run"});
}

const planting=new Planting(data);

const saved=await planting.save();
const populated=await populatePlanting(Planting.findById(saved._id));

return res.status(201).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getPlantings=async(req,res)=>{
try{
const query={};

if(req.query.plant)query.plant=cleanObjectId(req.query.plant);
if(req.query.seed)query.seed=cleanObjectId(req.query.seed);
if(req.query.garden)query.garden=cleanObjectId(req.query.garden);
if(req.query.gardenSection)query.gardenSection=cleanObjectId(req.query.gardenSection);
if(req.query.variety)query.variety=cleanObjectId(req.query.variety);
if(req.query.currentStage)query.currentStage=cleanObjectId(req.query.currentStage);
if(req.query.status)query.status=req.query.status;
if(req.query.createdBy)query.createdBy=cleanObjectId(req.query.createdBy);
if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";

const plantings=await populatePlanting(Planting.find(query)).sort({plantedDate:-1,createdAt:-1});

return res.status(200).json(plantings);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getPlantingById=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid planting id"});
}

const planting=await populatePlanting(Planting.findById(id));

if(!planting){
return res.status(404).json({message:"Planting not found"});
}

return res.status(200).json(planting);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const updatePlanting=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid planting id"});
}

const planting=await Planting.findById(id);
if(!planting){
return res.status(404).json({message:"Planting not found"});
}

const data=normalizePlantingPayload(req.body,planting);

Object.keys(data).forEach(key=>{
planting[key]=data[key];
});

const updated=await planting.save();
const populated=await populatePlanting(Planting.findById(updated._id));

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const addPlantingNote=async(req,res)=>{
try{
const {id}=req.params;
const {note,date,createdBy}=req.body;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid planting id"});
}

if(!note){
return res.status(400).json({message:"note is required"});
}

const planting=await Planting.findById(id);
if(!planting){
return res.status(404).json({message:"Planting not found"});
}

planting.notes.push({
note:cleanString(note),
date:cleanDate(date)||new Date(),
createdBy:cleanObjectId(createdBy||req.user?._id||req.user?.id)
});

const updated=await planting.save();
const populated=await populatePlanting(Planting.findById(updated._id));

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const deletePlanting=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid planting id"});
}

const planting=await Planting.findByIdAndDelete(id);
if(!planting){
return res.status(404).json({message:"Planting not found"});
}

return res.status(200).json({message:"Planting deleted successfully"});
}catch(error){
return res.status(500).json({message:error.message});
}
};
