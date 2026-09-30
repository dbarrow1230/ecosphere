// backend/controllers/supplies/supplyController.js
import mongoose from "mongoose";
import Supply from "../../models/supplies/supplyModel.js";

export const createSupply=async(req,res)=>{
try{
const {
name,
description,
category,
vendor,
brand,
type,
quantity,
unit,
purchaseDate,
purchasePrice,
notes,
images,
createdBy
}=req.body;

if(!name){
return res.status(400).json({message:"name is required"});
}

const supply=new Supply({
name,
description,
category:category||null,
vendor:vendor||null,
brand,
type,
quantity,
unit,
purchaseDate,
purchasePrice,
notes,
images:Array.isArray(images)?images:[],
createdBy:createdBy||req.user?._id||req.user?.id||null
});

const saved=await supply.save();
const populated=await Supply.findById(saved._id)
.populate("category")
.populate("vendor")
.populate("createdBy","name email");

return res.status(201).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getSupplies=async(req,res)=>{
try{
const query={};

if(req.query.category)query.category=req.query.category;
if(req.query.vendor)query.vendor=req.query.vendor;
if(req.query.createdBy)query.createdBy=req.query.createdBy;

if(req.query.search){
query.$or=[
{name:{$regex:req.query.search,$options:"i"}},
{description:{$regex:req.query.search,$options:"i"}},
{brand:{$regex:req.query.search,$options:"i"}},
{type:{$regex:req.query.search,$options:"i"}}
];
}

const supplies=await Supply.find(query)
.populate("category")
.populate("vendor")
.populate("createdBy","name email")
.sort({createdAt:-1});

return res.status(200).json(supplies);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getSupplyById=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid supply id"});
}

const supply=await Supply.findById(id)
.populate("category")
.populate("vendor")
.populate("createdBy","name email");

if(!supply){
return res.status(404).json({message:"Supply not found"});
}

return res.status(200).json(supply);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const updateSupply=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid supply id"});
}

const supply=await Supply.findById(id);
if(!supply){
return res.status(404).json({message:"Supply not found"});
}

const {
name,
description,
category,
vendor,
brand,
type,
quantity,
unit,
purchaseDate,
purchasePrice,
notes,
images,
createdBy
}=req.body;

if(name!==undefined)supply.name=name;
if(description!==undefined)supply.description=description;
if(category!==undefined)supply.category=category||null;
if(vendor!==undefined)supply.vendor=vendor||null;
if(brand!==undefined)supply.brand=brand;
if(type!==undefined)supply.type=type;
if(quantity!==undefined)supply.quantity=quantity;
if(unit!==undefined)supply.unit=unit;
if(purchaseDate!==undefined)supply.purchaseDate=purchaseDate;
if(purchasePrice!==undefined)supply.purchasePrice=purchasePrice;
if(notes!==undefined)supply.notes=notes;
if(images!==undefined)supply.images=Array.isArray(images)?images:supply.images;
if(createdBy!==undefined)supply.createdBy=createdBy||null;

const updated=await supply.save();
const populated=await Supply.findById(updated._id)
.populate("category")
.populate("vendor")
.populate("createdBy","name email");

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const deleteSupply=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid supply id"});
}

const supply=await Supply.findByIdAndDelete(id);
if(!supply){
return res.status(404).json({message:"Supply not found"});
}

return res.status(200).json({message:"Supply deleted successfully"});
}catch(error){
return res.status(500).json({message:error.message});
}
};