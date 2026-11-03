// backend/controllers/reference/resourceCategoryController.js
import mongoose from "mongoose";
import ResourceCategory from "../../models/reference/resourceCategoryModel.js";

export const createResourceCategory=async(req,res)=>{
try{
const {name,description,parentCategory,order,isActive,createdBy}=req.body;

const resourceCategory=new ResourceCategory({
name,
description,
parentCategory:parentCategory||null,
order,
isActive:isActive!==undefined?isActive:true,
createdBy:createdBy||null
});

const saved=await resourceCategory.save();
const populated=await ResourceCategory.findById(saved._id).populate("parentCategory");

return res.status(201).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getResourceCategories=async(req,res)=>{
try{
const query={};

if(req.query.parentCategory!==undefined){
query.parentCategory=req.query.parentCategory||null;
}
if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";
if(req.query.search){
query.$or=[
{name:{$regex:req.query.search,$options:"i"}},
{description:{$regex:req.query.search,$options:"i"}}
];
}

const resourceCategories=await ResourceCategory.find(query)
.populate("parentCategory")
.sort({order:1,name:1});

return res.status(200).json(resourceCategories);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getResourceCategoryById=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid resource category id"});
}

const resourceCategory=await ResourceCategory.findById(id).populate("parentCategory");

if(!resourceCategory){
return res.status(404).json({message:"Resource category not found"});
}

return res.status(200).json(resourceCategory);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const updateResourceCategory=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid resource category id"});
}

const resourceCategory=await ResourceCategory.findById(id);
if(!resourceCategory){
return res.status(404).json({message:"Resource category not found"});
}

const {name,description,parentCategory,order,isActive,createdBy}=req.body;

if(name!==undefined)resourceCategory.name=name;
if(description!==undefined)resourceCategory.description=description;
if(parentCategory!==undefined)resourceCategory.parentCategory=parentCategory||null;
if(order!==undefined)resourceCategory.order=order;
if(isActive!==undefined)resourceCategory.isActive=isActive;
if(createdBy!==undefined)resourceCategory.createdBy=createdBy||null;

const updated=await resourceCategory.save();
const populated=await ResourceCategory.findById(updated._id).populate("parentCategory");

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const deleteResourceCategory=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid resource category id"});
}

const resourceCategory=await ResourceCategory.findByIdAndDelete(id);
if(!resourceCategory){
return res.status(404).json({message:"Resource category not found"});
}

return res.status(200).json({message:"Resource category deleted successfully"});
}catch(error){
return res.status(500).json({message:error.message});
}
};