// backend/controllers/reference/equipmentController.js
import mongoose from "mongoose";
import Equipment from "../../models/reference/equipmentModel.js";

export const createEquipment=async(req,res)=>{
try{
const {
name,
code,
serviceType,
category,
brand,
modelName,
equipmentType,
description,
serialNumber,
assetTag,
condition,
status,
frequencyRange,
bands,
modes,
channels,
maxPowerWatts,
powerSource,
connectorType,
location,
isActive,
notes,
createdBy
}=req.body;

if(!name){
return res.status(400).json({message:"name is required"});
}

if(!category){
return res.status(400).json({message:"category is required"});
}

const equipment=new Equipment({
name,
code:code||"",
serviceType:serviceType||null,
category,
brand:brand||"",
modelName:modelName||"",
equipmentType:equipmentType||"",
description:description||"",
serialNumber:serialNumber||"",
assetTag:assetTag||"",
condition:condition||"",
status:status||"",
frequencyRange:frequencyRange||"",
bands:Array.isArray(bands)?bands:[],
modes:Array.isArray(modes)?modes:[],
channels:Array.isArray(channels)?channels:[],
maxPowerWatts:maxPowerWatts!==undefined?maxPowerWatts:0,
powerSource:powerSource||"",
connectorType:connectorType||"",
location:location||"",
isActive:isActive!==undefined?isActive:true,
notes:notes||"",
createdBy:createdBy||req.user?._id||req.user?.id||null
});

const saved=await equipment.save();
const populated=await Equipment.findById(saved._id)
.populate("serviceType")
.populate("category")
.populate("bands")
.populate("modes")
.populate("createdBy","name email");

return res.status(201).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getEquipment=async(req,res)=>{
try{
const query={};

if(req.query.serviceType)query.serviceType=req.query.serviceType;
if(req.query.category)query.category=req.query.category;
if(req.query.brand)query.brand={$regex:req.query.brand,$options:"i"};
if(req.query.modelName)query.modelName={$regex:req.query.modelName,$options:"i"};
if(req.query.equipmentType)query.equipmentType={$regex:req.query.equipmentType,$options:"i"};
if(req.query.condition)query.condition=req.query.condition;
if(req.query.status)query.status=req.query.status;
if(req.query.location)query.location={$regex:req.query.location,$options:"i"};
if(req.query.createdBy)query.createdBy=req.query.createdBy;
if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";

if(req.query.search){
query.$or=[
{name:{$regex:req.query.search,$options:"i"}},
{code:{$regex:req.query.search,$options:"i"}},
{brand:{$regex:req.query.search,$options:"i"}},
{modelName:{$regex:req.query.search,$options:"i"}},
{equipmentType:{$regex:req.query.search,$options:"i"}},
{description:{$regex:req.query.search,$options:"i"}},
{serialNumber:{$regex:req.query.search,$options:"i"}},
{assetTag:{$regex:req.query.search,$options:"i"}},
{frequencyRange:{$regex:req.query.search,$options:"i"}},
{powerSource:{$regex:req.query.search,$options:"i"}},
{connectorType:{$regex:req.query.search,$options:"i"}},
{location:{$regex:req.query.search,$options:"i"}},
{notes:{$regex:req.query.search,$options:"i"}}
];
}

const equipment=await Equipment.find(query)
.populate("serviceType")
.populate("category")
.populate("bands")
.populate("modes")
.populate("createdBy","name email")
.sort({name:1});

return res.status(200).json(equipment);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getEquipmentById=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid equipment id"});
}

const equipment=await Equipment.findById(id)
.populate("serviceType")
.populate("category")
.populate("bands")
.populate("modes")
.populate("createdBy","name email");

if(!equipment){
return res.status(404).json({message:"Equipment not found"});
}

return res.status(200).json(equipment);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const updateEquipment=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid equipment id"});
}

const equipment=await Equipment.findById(id);

if(!equipment){
return res.status(404).json({message:"Equipment not found"});
}

const {
name,
code,
serviceType,
category,
brand,
modelName,
equipmentType,
description,
serialNumber,
assetTag,
condition,
status,
frequencyRange,
bands,
modes,
channels,
maxPowerWatts,
powerSource,
connectorType,
location,
isActive,
notes,
createdBy
}=req.body;

if(name!==undefined)equipment.name=name;
if(code!==undefined)equipment.code=code;
if(serviceType!==undefined)equipment.serviceType=serviceType||null;
if(category!==undefined)equipment.category=category;
if(brand!==undefined)equipment.brand=brand;
if(modelName!==undefined)equipment.modelName=modelName;
if(equipmentType!==undefined)equipment.equipmentType=equipmentType;
if(description!==undefined)equipment.description=description;
if(serialNumber!==undefined)equipment.serialNumber=serialNumber;
if(assetTag!==undefined)equipment.assetTag=assetTag;
if(condition!==undefined)equipment.condition=condition;
if(status!==undefined)equipment.status=status;
if(frequencyRange!==undefined)equipment.frequencyRange=frequencyRange;
if(bands!==undefined)equipment.bands=Array.isArray(bands)?bands:[];
if(modes!==undefined)equipment.modes=Array.isArray(modes)?modes:[];
if(channels!==undefined)equipment.channels=Array.isArray(channels)?channels:[];
if(maxPowerWatts!==undefined)equipment.maxPowerWatts=maxPowerWatts;
if(powerSource!==undefined)equipment.powerSource=powerSource;
if(connectorType!==undefined)equipment.connectorType=connectorType;
if(location!==undefined)equipment.location=location;
if(isActive!==undefined)equipment.isActive=isActive;
if(notes!==undefined)equipment.notes=notes;
if(createdBy!==undefined)equipment.createdBy=createdBy||null;

const updated=await equipment.save();
const populated=await Equipment.findById(updated._id)
.populate("serviceType")
.populate("category")
.populate("bands")
.populate("modes")
.populate("createdBy","name email");

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const deleteEquipment=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid equipment id"});
}

const equipment=await Equipment.findByIdAndDelete(id);

if(!equipment){
return res.status(404).json({message:"Equipment not found"});
}

return res.status(200).json({message:"Equipment deleted successfully"});
}catch(error){
return res.status(500).json({message:error.message});
}
};