// backend/controllers/reference/supplyCategoryController.js
import mongoose from "mongoose";
import SupplyCategory from "../../models/reference/supplyCategoryModel.js";

export const createSupplyCategory=async(req,res)=>{
try{
const {name,description,parentCategory,createdBy}=req.body;

if(!name){
return res.status(400).json({message:"name is required"});
}

const category=new SupplyCategory({
name,
description,
parentCategory:parentCategory||null,
createdBy:createdBy||req.user?._id||req.user?.id||null
});

const saved=await category.save();
const populated=await SupplyCategory.findById(saved._id)
.populate("parentCategory")
.populate("createdBy","name email");

return res.status(201).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getSupplyCategories=async(req,res)=>{
try{
const query={};

if(req.query.parentCategory)query.parentCategory=req.query.parentCategory;
if(req.query.createdBy)query.createdBy=req.query.createdBy;

if(req.query.search){
query.$or=[
{name:{$regex:req.query.search,$options:"i"}},
{description:{$regex:req.query.search,$options:"i"}}
];
}

const categories=await SupplyCategory.find(query)
.populate("parentCategory")
.populate("createdBy","name email")
.sort({createdAt:-1});

return res.status(200).json(categories);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getSupplyCategoryById=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid supply category id"});
}

const category=await SupplyCategory.findById(id)
.populate("parentCategory")
.populate("createdBy","name email");

if(!category){
return res.status(404).json({message:"Supply category not found"});
}

return res.status(200).json(category);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const updateSupplyCategory=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid supply category id"});
}

const category=await SupplyCategory.findById(id);
if(!category){
return res.status(404).json({message:"Supply category not found"});
}

const {name,description,parentCategory,createdBy}=req.body;

if(name!==undefined)category.name=name;
if(description!==undefined)category.description=description;
if(parentCategory!==undefined)category.parentCategory=parentCategory||null;
if(createdBy!==undefined)category.createdBy=createdBy||null;

const updated=await category.save();
const populated=await SupplyCategory.findById(updated._id)
.populate("parentCategory")
.populate("createdBy","name email");

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const deleteSupplyCategory=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid supply category id"});
}

const category=await SupplyCategory.findByIdAndDelete(id);
if(!category){
return res.status(404).json({message:"Supply category not found"});
}

return res.status(200).json({message:"Supply category deleted successfully"});
}catch(error){
return res.status(500).json({message:error.message});
}
};