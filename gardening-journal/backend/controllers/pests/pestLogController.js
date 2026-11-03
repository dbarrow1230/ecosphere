// backend/controllers/pests/pestLogController.js
import mongoose from "mongoose";
import PestLog from "../../models/pests/pestLogModel.js";

export const createPestLog=async(req,res)=>{
try{
const {
planting,
pest,
status,
severityHistory,
dateObserved,
dateResolved,
treatmentsApplied,
notes,
images,
createdBy,
isActive
}=req.body;

if(!planting||!pest){
return res.status(400).json({message:"planting and pest are required"});
}

const pestLog=new PestLog({
planting,
pest,
status,
severityHistory:Array.isArray(severityHistory)?severityHistory:[],
dateObserved,
dateResolved,
treatmentsApplied:Array.isArray(treatmentsApplied)?treatmentsApplied:[],
notes:Array.isArray(notes)?notes:[],
images:Array.isArray(images)?images:[],
createdBy:createdBy||req.user?._id||req.user?.id||null,
isActive:isActive!==undefined?isActive:true
});

const saved=await pestLog.save();
const populated=await PestLog.findById(saved._id)
.populate("planting")
.populate("pest")
.populate("severityHistory.severity")
.populate("treatmentsApplied.treatment")
.populate("notes.createdBy","name email")
.populate("createdBy","name email");

return res.status(201).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getPestLogs=async(req,res)=>{
try{
const query={};

if(req.query.planting)query.planting=req.query.planting;
if(req.query.pest)query.pest=req.query.pest;
if(req.query.status)query.status=req.query.status;
if(req.query.createdBy)query.createdBy=req.query.createdBy;
if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";

const pestLogs=await PestLog.find(query)
.populate("planting")
.populate("pest")
.populate("severityHistory.severity")
.populate("treatmentsApplied.treatment")
.populate("notes.createdBy","name email")
.populate("createdBy","name email")
.sort({dateObserved:-1,createdAt:-1});

return res.status(200).json(pestLogs);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getPestLogById=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid pest log id"});
}

const pestLog=await PestLog.findById(id)
.populate("planting")
.populate("pest")
.populate("severityHistory.severity")
.populate("treatmentsApplied.treatment")
.populate("notes.createdBy","name email")
.populate("createdBy","name email");

if(!pestLog){
return res.status(404).json({message:"Pest log not found"});
}

return res.status(200).json(pestLog);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const updatePestLog=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid pest log id"});
}

const pestLog=await PestLog.findById(id);
if(!pestLog){
return res.status(404).json({message:"Pest log not found"});
}

const {
planting,
pest,
status,
severityHistory,
dateObserved,
dateResolved,
treatmentsApplied,
notes,
images,
createdBy,
isActive
}=req.body;

if(planting!==undefined)pestLog.planting=planting;
if(pest!==undefined)pestLog.pest=pest;
if(status!==undefined)pestLog.status=status;
if(severityHistory!==undefined)pestLog.severityHistory=Array.isArray(severityHistory)?severityHistory:pestLog.severityHistory;
if(dateObserved!==undefined)pestLog.dateObserved=dateObserved;
if(dateResolved!==undefined)pestLog.dateResolved=dateResolved;
if(treatmentsApplied!==undefined)pestLog.treatmentsApplied=Array.isArray(treatmentsApplied)?treatmentsApplied:pestLog.treatmentsApplied;
if(notes!==undefined)pestLog.notes=Array.isArray(notes)?notes:pestLog.notes;
if(images!==undefined)pestLog.images=Array.isArray(images)?images:pestLog.images;
if(createdBy!==undefined)pestLog.createdBy=createdBy||null;
if(isActive!==undefined)pestLog.isActive=isActive;

const updated=await pestLog.save();
const populated=await PestLog.findById(updated._id)
.populate("planting")
.populate("pest")
.populate("severityHistory.severity")
.populate("treatmentsApplied.treatment")
.populate("notes.createdBy","name email")
.populate("createdBy","name email");

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const addSeverityHistoryToPestLog=async(req,res)=>{
try{
const {id}=req.params;
const {severity,date,note}=req.body;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid pest log id"});
}

const pestLog=await PestLog.findById(id);
if(!pestLog){
return res.status(404).json({message:"Pest log not found"});
}

pestLog.severityHistory.push({
severity,
date,
note
});

const updated=await pestLog.save();
const populated=await PestLog.findById(updated._id)
.populate("planting")
.populate("pest")
.populate("severityHistory.severity")
.populate("treatmentsApplied.treatment")
.populate("notes.createdBy","name email")
.populate("createdBy","name email");

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const addTreatmentToPestLog=async(req,res)=>{
try{
const {id}=req.params;
const {treatment,date,note}=req.body;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid pest log id"});
}

const pestLog=await PestLog.findById(id);
if(!pestLog){
return res.status(404).json({message:"Pest log not found"});
}

pestLog.treatmentsApplied.push({
treatment,
date,
note
});

const updated=await pestLog.save();
const populated=await PestLog.findById(updated._id)
.populate("planting")
.populate("pest")
.populate("severityHistory.severity")
.populate("treatmentsApplied.treatment")
.populate("notes.createdBy","name email")
.populate("createdBy","name email");

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const addPestLogNote=async(req,res)=>{
try{
const {id}=req.params;
const {note,date,createdBy}=req.body;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid pest log id"});
}

if(!note){
return res.status(400).json({message:"note is required"});
}

const pestLog=await PestLog.findById(id);
if(!pestLog){
return res.status(404).json({message:"Pest log not found"});
}

pestLog.notes.push({
note,
date,
createdBy:createdBy||req.user?._id||req.user?.id||null
});

const updated=await pestLog.save();
const populated=await PestLog.findById(updated._id)
.populate("planting")
.populate("pest")
.populate("severityHistory.severity")
.populate("treatmentsApplied.treatment")
.populate("notes.createdBy","name email")
.populate("createdBy","name email");

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const deletePestLog=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid pest log id"});
}

const pestLog=await PestLog.findByIdAndDelete(id);
if(!pestLog){
return res.status(404).json({message:"Pest log not found"});
}

return res.status(200).json({message:"Pest log deleted successfully"});
}catch(error){
return res.status(500).json({message:error.message});
}
};