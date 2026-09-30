// backend/controllers/pests/pestController.js
import mongoose from "mongoose";
import Pest from "../../models/pests/pestmodel.js";
import "../../models/seeds/seedModel.js";
import "../../models/plants/plantModel.js";
import "../../models/pests/pesttypemodel.js";
import "../../models/reference/pestRefTreatmentModel.js";

const cleanString=value=>{
return value===undefined||value===null?"":String(value).trim();
};

const cleanObjectIdArray=value=>{
const values=Array.isArray(value)?value:[value];
return [...new Set(values.filter(item=>mongoose.Types.ObjectId.isValid(item)))];
};

const populatePest=query=>{
return query
.populate("seed")
.populate("plant")
.populate("seeds")
.populate("plants")
.populate("type")
.populate("treatment")
.populate("createdBy","name email");
};

export const createPest=async(req,res)=>{
try{
const {name,description,type,category,treatmentText,treatment,prevention,isActive,createdBy}=req.body;
const seedIds=[
...(Array.isArray(req.body.seeds)?req.body.seeds:[]),
...(req.body.seed?[req.body.seed]:[])
];
const plantIds=[
...(Array.isArray(req.body.plants)?req.body.plants:[]),
...(req.body.plant?[req.body.plant]:[])
];

const pest=new Pest({
seeds:cleanObjectIdArray(seedIds),
plants:cleanObjectIdArray(plantIds),
name:cleanString(name),
description:cleanString(description),
type:type&&mongoose.Types.ObjectId.isValid(type)?type:null,
category:cleanString(category),
treatmentText:cleanString(treatmentText),
treatment:cleanObjectIdArray(treatment),
prevention:cleanString(prevention),
isActive:isActive!==undefined?isActive:true,
createdBy:createdBy||(req.user?._id||req.user?.id)||null
});

const saved=await pest.save();

const populated=await populatePest(Pest.findById(saved._id));

return res.status(201).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getPests=async(req,res)=>{
try{
const query={};
const andFilters=[];

if(req.query.seed){
if(!mongoose.Types.ObjectId.isValid(req.query.seed)){
return res.status(400).json({message:"Invalid seed id"});
}
andFilters.push({$or:[{seeds:req.query.seed},{seed:req.query.seed}]});
}

if(req.query.plant){
if(!mongoose.Types.ObjectId.isValid(req.query.plant)){
return res.status(400).json({message:"Invalid plant id"});
}
andFilters.push({$or:[{plants:req.query.plant},{plant:req.query.plant}]});
}

if(req.query.type)query.type=req.query.type;
if(req.query.category)query.category=req.query.category;
if(req.query.createdBy)query.createdBy=req.query.createdBy;
if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";

if(req.query.search){
query.$or=[
{name:{$regex:req.query.search,$options:"i"}},
{description:{$regex:req.query.search,$options:"i"}},
{category:{$regex:req.query.search,$options:"i"}},
{treatmentText:{$regex:req.query.search,$options:"i"}},
{prevention:{$regex:req.query.search,$options:"i"}}
];

andFilters.push({$or:query.$or});
delete query.$or;
}

if(andFilters.length)query.$and=andFilters;

const pests=await populatePest(Pest.find(query)).sort({createdAt:-1});

return res.status(200).json(pests);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getPestById=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid pest id"});
}

const pest=await populatePest(Pest.findById(id));

if(!pest){
return res.status(404).json({message:"Pest not found"});
}

return res.status(200).json(pest);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const updatePest=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid pest id"});
}

const pest=await Pest.findById(id);

if(!pest){
return res.status(404).json({message:"Pest not found"});
}

const {name,description,type,category,treatmentText,treatment,prevention,isActive,createdBy}=req.body;

if(req.body.seeds!==undefined||req.body.seed!==undefined){
const seedIds=[
...(Array.isArray(req.body.seeds)?req.body.seeds:[]),
...(req.body.seed?[req.body.seed]:[])
];
pest.seeds=cleanObjectIdArray(seedIds);
pest.seed=null;
}
if(req.body.plants!==undefined||req.body.plant!==undefined){
const plantIds=[
...(Array.isArray(req.body.plants)?req.body.plants:[]),
...(req.body.plant?[req.body.plant]:[])
];
pest.plants=cleanObjectIdArray(plantIds);
pest.plant=null;
}
if(name!==undefined)pest.name=cleanString(name);
if(description!==undefined)pest.description=cleanString(description);
if(type!==undefined)pest.type=type&&mongoose.Types.ObjectId.isValid(type)?type:null;
if(category!==undefined)pest.category=cleanString(category);
if(treatmentText!==undefined)pest.treatmentText=cleanString(treatmentText);
if(treatment!==undefined)pest.treatment=cleanObjectIdArray(treatment);
if(prevention!==undefined)pest.prevention=cleanString(prevention);
if(isActive!==undefined)pest.isActive=isActive;
if(createdBy!==undefined)pest.createdBy=createdBy||null;

const updated=await pest.save();

const populated=await populatePest(Pest.findById(updated._id));

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const deletePest=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid pest id"});
}

const pest=await Pest.findByIdAndDelete(id);

if(!pest){
return res.status(404).json({message:"Pest not found"});
}

return res.status(200).json({message:"Pest deleted successfully"});
}catch(error){
return res.status(500).json({message:error.message});
}
};
