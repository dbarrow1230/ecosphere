// backend/controllers/equipment/equipmentController.js
import mongoose from "mongoose";
import Equipment from "../../models/equipment/equipmentModel.js";

export const createEquipment=async(req,res)=>{
try{
const {
name,
description,
category,
vendor,
brand,
modelNumber,
systemType,
serialNumber,
productUrl,
location,
podCount,
reservoirCapacity,
lightType,
pumpType,
purchaseDate,
purchasePrice,
condition,
maintenanceHistory,
notes,
images
}=req.body;

if(!name){
return res.status(400).json({message:"name is required"});
}

const createdBy=req.user?._id||req.user?.id||req.body.createdBy;

const equipment=new Equipment({
name,
description,
category:category||null,
vendor:vendor||null,
brand,
modelNumber,
systemType,
serialNumber,
productUrl,
location,
podCount,
reservoirCapacity,
lightType,
pumpType,
purchaseDate,
purchasePrice,
condition,
maintenanceHistory:Array.isArray(maintenanceHistory)?maintenanceHistory:[],
notes,
images:Array.isArray(images)?images:[],
createdBy
});

const saved=await equipment.save();
const populated=await Equipment.findById(saved._id)
.populate("category")
.populate("vendor")
.populate("maintenanceHistory.vendor")
.populate("createdBy","name email");

return res.status(201).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getEquipment=async(req,res)=>{
try{
const query={};

if(req.query.category)query.category=req.query.category;
if(req.query.vendor)query.vendor=req.query.vendor;
if(req.query.condition)query.condition=req.query.condition;
if(req.query.createdBy)query.createdBy=req.query.createdBy;

if(req.query.search){
query.$or=[
{name:{$regex:req.query.search,$options:"i"}},
{brand:{$regex:req.query.search,$options:"i"}},
{modelNumber:{$regex:req.query.search,$options:"i"}}
];
}

const equipment=await Equipment.find(query)
.populate("category")
.populate("vendor")
.populate("maintenanceHistory.vendor")
.populate("createdBy","name email")
.sort({createdAt:-1});

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
.populate("category")
.populate("vendor")
.populate("maintenanceHistory.vendor")
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
description,
category,
vendor,
brand,
modelNumber,
systemType,
serialNumber,
productUrl,
location,
podCount,
reservoirCapacity,
lightType,
pumpType,
purchaseDate,
purchasePrice,
condition,
maintenanceHistory,
notes,
images
}=req.body;

if(name!==undefined)equipment.name=name;
if(description!==undefined)equipment.description=description;
if(category!==undefined)equipment.category=category||null;
if(vendor!==undefined)equipment.vendor=vendor||null;
if(brand!==undefined)equipment.brand=brand;
if(modelNumber!==undefined)equipment.modelNumber=modelNumber;
if(systemType!==undefined)equipment.systemType=systemType;
if(serialNumber!==undefined)equipment.serialNumber=serialNumber;
if(productUrl!==undefined)equipment.productUrl=productUrl;
if(location!==undefined)equipment.location=location;
if(podCount!==undefined)equipment.podCount=Number(podCount)||0;
if(reservoirCapacity!==undefined)equipment.reservoirCapacity=reservoirCapacity;
if(lightType!==undefined)equipment.lightType=lightType;
if(pumpType!==undefined)equipment.pumpType=pumpType;
if(purchaseDate!==undefined)equipment.purchaseDate=purchaseDate;
if(purchasePrice!==undefined)equipment.purchasePrice=purchasePrice;
if(condition!==undefined)equipment.condition=condition;
if(maintenanceHistory!==undefined&&Array.isArray(maintenanceHistory))equipment.maintenanceHistory=maintenanceHistory;
if(notes!==undefined)equipment.notes=notes;
if(images!==undefined)equipment.images=Array.isArray(images)?images:equipment.images;

const updated=await equipment.save();
const populated=await Equipment.findById(updated._id)
.populate("category")
.populate("vendor")
.populate("maintenanceHistory.vendor")
.populate("createdBy","name email");

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const addMaintenanceRecord=async(req,res)=>{
try{
const {id}=req.params;
const {type,date,description,cost,vendor,conditionAfter,notes}=req.body;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid equipment id"});
}

if(!type){
return res.status(400).json({message:"type is required"});
}

const equipment=await Equipment.findById(id);
if(!equipment){
return res.status(404).json({message:"Equipment not found"});
}

equipment.maintenanceHistory.push({
type,
date,
description,
cost,
vendor:vendor||null,
conditionAfter,
notes
});

const updated=await equipment.save();
const populated=await Equipment.findById(updated._id)
.populate("category")
.populate("vendor")
.populate("maintenanceHistory.vendor")
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
