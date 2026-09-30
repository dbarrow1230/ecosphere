// backend/controllers/diseases/diseaseLogController.js
import mongoose from "mongoose";
import DiseaseLog from "../../models/diseases/diseaseLogModel.js";

export const createDiseaseLog=async(req,res)=>{
try{
const {
planting,
disease,
status,
severity,
affectedAreas,
symptomsObserved,
dateObserved,
dateResolved,
treatmentsApplied,
notes,
images,
severityHistory
}=req.body;

if(!planting||!disease){
return res.status(400).json({message:"planting and disease are required"});
}

const user=req.user?._id||req.user?.id||req.body.user;
if(!user){
return res.status(401).json({message:"Unauthorized"});
}

const log=new DiseaseLog({
user,
planting,
disease,
status,
severityHistory:Array.isArray(severityHistory)&&severityHistory.length
?severityHistory
:severity?[{severity,note:req.body.severityNote}]:[],
affectedAreas:Array.isArray(affectedAreas)?affectedAreas:[],
symptomsObserved:Array.isArray(symptomsObserved)?symptomsObserved:[],
dateObserved,
dateResolved,
treatmentsApplied:Array.isArray(treatmentsApplied)?treatmentsApplied:[],
notes,
images:Array.isArray(images)?images:[]
});

const savedLog=await log.save();
const populatedLog=await DiseaseLog.findById(savedLog._id)
.populate("user","name email")
.populate("planting")
.populate("disease")
.populate("treatmentsApplied.treatment");

return res.status(201).json(populatedLog);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getDiseaseLogs=async(req,res)=>{
try{
const query={};

if(req.user?._id||req.user?.id){
query.user=req.user._id||req.user.id;
}else if(req.query.user){
query.user=req.query.user;
}

if(req.query.planting)query.planting=req.query.planting;
if(req.query.disease)query.disease=req.query.disease;
if(req.query.status)query.status=req.query.status;

const logs=await DiseaseLog.find(query)
.populate("user","name email")
.populate("planting")
.populate("disease")
.populate("treatmentsApplied.treatment")
.sort({createdAt:-1});

return res.status(200).json(logs);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getDiseaseLogById=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid disease log id"});
}

const log=await DiseaseLog.findById(id)
.populate("user","name email")
.populate("planting")
.populate("disease")
.populate("treatmentsApplied.treatment");

if(!log){
return res.status(404).json({message:"Disease log not found"});
}

return res.status(200).json(log);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const updateDiseaseLog=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid disease log id"});
}

const {
status,
affectedAreas,
symptomsObserved,
dateObserved,
dateResolved,
notes,
images,
severity,
severityNote,
severityHistory,
treatmentsApplied
}=req.body;

const log=await DiseaseLog.findById(id);
if(!log){
return res.status(404).json({message:"Disease log not found"});
}

if(status!==undefined)log.status=status;
if(affectedAreas!==undefined)log.affectedAreas=Array.isArray(affectedAreas)?affectedAreas:log.affectedAreas;
if(symptomsObserved!==undefined)log.symptomsObserved=Array.isArray(symptomsObserved)?symptomsObserved:log.symptomsObserved;
if(dateObserved!==undefined)log.dateObserved=dateObserved;
if(dateResolved!==undefined)log.dateResolved=dateResolved;
if(notes!==undefined)log.notes=notes;
if(images!==undefined)log.images=Array.isArray(images)?images:log.images;
if(Array.isArray(treatmentsApplied))log.treatmentsApplied=treatmentsApplied;

if(Array.isArray(severityHistory)){
log.severityHistory=severityHistory;
}else if(severity){
log.severityHistory.push({severity,note:severityNote});
}

const updatedLog=await log.save();
const populatedLog=await DiseaseLog.findById(updatedLog._id)
.populate("user","name email")
.populate("planting")
.populate("disease")
.populate("treatmentsApplied.treatment");

return res.status(200).json(populatedLog);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const addSeverityHistory=async(req,res)=>{
try{
const {id}=req.params;
const {severity,note,date}=req.body;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid disease log id"});
}

if(!severity){
return res.status(400).json({message:"severity is required"});
}

const log=await DiseaseLog.findById(id);
if(!log){
return res.status(404).json({message:"Disease log not found"});
}

log.severityHistory.push({severity,note,date});
const updatedLog=await log.save();

const populatedLog=await DiseaseLog.findById(updatedLog._id)
.populate("user","name email")
.populate("planting")
.populate("disease")
.populate("treatmentsApplied.treatment");

return res.status(200).json(populatedLog);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const addTreatmentToDiseaseLog=async(req,res)=>{
try{
const {id}=req.params;
const {treatment,date,note}=req.body;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid disease log id"});
}

if(!treatment){
return res.status(400).json({message:"treatment is required"});
}

const log=await DiseaseLog.findById(id);
if(!log){
return res.status(404).json({message:"Disease log not found"});
}

log.treatmentsApplied.push({treatment,date,note});
const updatedLog=await log.save();

const populatedLog=await DiseaseLog.findById(updatedLog._id)
.populate("user","name email")
.populate("planting")
.populate("disease")
.populate("treatmentsApplied.treatment");

return res.status(200).json(populatedLog);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const deleteDiseaseLog=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid disease log id"});
}

const log=await DiseaseLog.findByIdAndDelete(id);
if(!log){
return res.status(404).json({message:"Disease log not found"});
}

return res.status(200).json({message:"Disease log deleted successfully"});
}catch(error){
return res.status(500).json({message:error.message});
}
};