// backend/controllers/diseases/diseaseController.js
import mongoose from "mongoose";
import Disease from "../../models/diseases/diseaseModel.js";

const cleanString=value=>{
return value===undefined||value===null?"":String(value).trim();
};

const cleanStringArray=value=>{
if(!Array.isArray(value))return [];
return value.map(item=>cleanString(item)).filter(Boolean);
};

const cleanObject=value=>{
return value&&typeof value==="object"&&!Array.isArray(value)?value:{};
};

const cleanObjectId=value=>{
if(!value)return null;

if(typeof value==="string")return mongoose.Types.ObjectId.isValid(value)?value:null;

if(typeof value==="object"){
if(typeof value.$oid==="string")return mongoose.Types.ObjectId.isValid(value.$oid)?value.$oid:null;
if(typeof value._id==="string")return mongoose.Types.ObjectId.isValid(value._id)?value._id:null;
if(typeof value.id==="string")return mongoose.Types.ObjectId.isValid(value.id)?value.id:null;
if(typeof value._id?.$oid==="string")return mongoose.Types.ObjectId.isValid(value._id.$oid)?value._id.$oid:null;
if(typeof value.id?.$oid==="string")return mongoose.Types.ObjectId.isValid(value.id.$oid)?value.id.$oid:null;
}

return null;
};

const cleanObjectIdArray=value=>{
const values=Array.isArray(value)?value:[value];

return [...new Set(
values
.map(item=>cleanObjectId(item))
.filter(Boolean)
)];
};

const cleanTreatments=value=>{
if(!Array.isArray(value))return [];

return value.map(item=>{
const current=cleanObject(item);

return {
name:cleanString(current.name),
description:cleanString(current.description),
type:cleanString(current.type),
applicationMethod:cleanString(current.applicationMethod),
dosage:cleanString(current.dosage),
frequency:cleanString(current.frequency),
duration:cleanString(current.duration),
notes:cleanString(current.notes)
};
}).filter(item=>item.name);
};

const normalizeDiseasePayload=data=>{
const seedIds=[
...(Array.isArray(data.seeds)?data.seeds:[]),
...(data.seed?[data.seed]:[])
];

const plantIds=[
...(Array.isArray(data.plants)?data.plants:[]),
...(data.plant?[data.plant]:[])
];

return {
seeds:cleanObjectIdArray(seedIds),
plants:cleanObjectIdArray(plantIds),
diseaseName:cleanString(data.diseaseName),
scientificName:cleanString(data.scientificName),
diseaseType:cleanString(data.diseaseType || data.type),
category:cleanString(data.category),
description:cleanString(data.description),
cause:cleanString(data.cause),
symptoms:cleanStringArray(data.symptoms),
affectedParts:cleanStringArray(data.affectedParts),
spreadMethod:cleanString(data.spreadMethod),
favorableConditions:cleanString(data.favorableConditions),
prevention:cleanStringArray(data.prevention),
treatment:cleanString(data.treatment || data.treatmentText),
treatments:cleanTreatments(data.treatments),
organicTreatment:cleanStringArray(data.organicTreatment),
chemicalTreatment:cleanStringArray(data.chemicalTreatment),
severity:cleanString(data.severity)||"moderate",
isContagious:!!data.isContagious,
image:cleanString(data.image),
references:cleanStringArray(data.references)
};
};

const populateDisease=query=>{
return query
.populate("seed")
.populate("plant")
.populate("seeds")
.populate("plants");
};

export const createDisease=async(req,res)=>{
try{
const data=normalizeDiseasePayload(req.body);

if(!data.diseaseName){
return res.status(400).json({message:"diseaseName is required"});
}

const disease=new Disease(data);
const savedDisease=await disease.save();
const populatedDisease=await populateDisease(Disease.findById(savedDisease._id));

return res.status(201).json(populatedDisease);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getDiseases=async(req,res)=>{
try{
const query={};
const andFilters=[];

if(req.query.seed){
const seedId=cleanObjectId(req.query.seed);
if(!seedId)return res.status(400).json({message:"Invalid seed id"});
andFilters.push({$or:[{seeds:seedId},{seed:seedId}]});
}

if(req.query.plant){
const plantId=cleanObjectId(req.query.plant);
if(!plantId)return res.status(400).json({message:"Invalid plant id"});
andFilters.push({$or:[{plants:plantId},{plant:plantId}]});
}

if(req.query.category)query.category=req.query.category;
if(req.query.diseaseType)query.diseaseType=req.query.diseaseType;
if(req.query.severity)query.severity=req.query.severity;
if(req.query.isContagious!==undefined)query.isContagious=req.query.isContagious==="true";

if(req.query.search){
 const searchFilters=[
{diseaseName:{$regex:req.query.search,$options:"i"}},
{scientificName:{$regex:req.query.search,$options:"i"}},
{diseaseType:{$regex:req.query.search,$options:"i"}},
{category:{$regex:req.query.search,$options:"i"}},
{description:{$regex:req.query.search,$options:"i"}},
{cause:{$regex:req.query.search,$options:"i"}},
{symptoms:{$regex:req.query.search,$options:"i"}},
{affectedParts:{$regex:req.query.search,$options:"i"}},
{treatment:{$regex:req.query.search,$options:"i"}},
{prevention:{$regex:req.query.search,$options:"i"}}
];

andFilters.push({$or:searchFilters});
}

if(andFilters.length)query.$and=andFilters;

const diseases=await populateDisease(Disease.find(query)).sort({createdAt:-1});

return res.status(200).json(diseases);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getDiseaseById=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid disease id"});
}

const disease=await populateDisease(Disease.findById(id));

if(!disease){
return res.status(404).json({message:"Disease not found"});
}

return res.status(200).json(disease);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const updateDisease=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid disease id"});
}

const disease=await Disease.findById(id);
if(!disease){
return res.status(404).json({message:"Disease not found"});
}

const data=normalizeDiseasePayload(req.body);

Object.keys(data).forEach(key=>{
disease[key]=data[key];
});

disease.seed=null;
disease.plant=null;

const updatedDisease=await disease.save();
const populatedDisease=await populateDisease(Disease.findById(updatedDisease._id));

return res.status(200).json(populatedDisease);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const addDiseaseTreatment=async(req,res)=>{
try{
const {id}=req.params;
const treatment=cleanObject(req.body);

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid disease id"});
}

if(!cleanString(treatment.name)){
return res.status(400).json({message:"Treatment name is required"});
}

const disease=await Disease.findById(id);
if(!disease){
return res.status(404).json({message:"Disease not found"});
}

disease.treatments.push({
name:cleanString(treatment.name),
description:cleanString(treatment.description),
type:cleanString(treatment.type),
applicationMethod:cleanString(treatment.applicationMethod),
dosage:cleanString(treatment.dosage),
frequency:cleanString(treatment.frequency),
duration:cleanString(treatment.duration),
notes:cleanString(treatment.notes)
});

const updatedDisease=await disease.save();
const populatedDisease=await populateDisease(Disease.findById(updatedDisease._id));

return res.status(200).json(populatedDisease);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const deleteDisease=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid disease id"});
}

const disease=await Disease.findByIdAndDelete(id);
if(!disease){
return res.status(404).json({message:"Disease not found"});
}

return res.status(200).json({message:"Disease deleted successfully"});
}catch(error){
return res.status(500).json({message:error.message});
}
};
