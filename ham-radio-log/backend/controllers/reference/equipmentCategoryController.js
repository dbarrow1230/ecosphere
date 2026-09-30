// backend/controllers/reference/equipmentCategoryController.js
import mongoose from "mongoose";
import EquipmentCategory from "../../models/reference/equipmentCategoryModel.js";

export const createEquipmentCategory=async(req,res)=>{
try{
const {name,code,serviceType,description,parentCategory,isActive,notes,createdBy}=req.body;

if(!name){
return res.status(400).json({message:"name is required"});
}

const category=new EquipmentCategory({
name,
code:code||"",
serviceType:serviceType||null,
description:description||"",
parentCategory:parentCategory||null,
isActive:isActive!==undefined?isActive:true,
notes:notes||"",
createdBy:createdBy||req.user?._id||req.user?.id||null
});

const saved=await category.save();
const populated=await EquipmentCategory.findById(saved._id)
.populate("serviceType")
.populate("parentCategory")
.populate("createdBy","name email");

return res.status(201).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getEquipmentCategories=async(req,res)=>{
try{
const query={};

if(req.query.serviceType)query.serviceType=req.query.serviceType;
if(req.query.parentCategory)query.parentCategory=req.query.parentCategory;
if(req.query.createdBy)query.createdBy=req.query.createdBy;
if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";

if(req.query.search){
query.$or=[
{name:{$regex:req.query.search,$options:"i"}},
{code:{$regex:req.query.search,$options:"i"}},
{description:{$regex:req.query.search,$options:"i"}},
{notes:{$regex:req.query.search,$options:"i"}}
];
}

const categories=await EquipmentCategory.find(query)
.populate("serviceType")
.populate("parentCategory")
.populate("createdBy","name email")
.sort({name:1});

return res.status(200).json(categories);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getEquipmentCategoryById=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid equipment category id"});
}

const category=await EquipmentCategory.findById(id)
.populate("serviceType")
.populate("parentCategory")
.populate("createdBy","name email");

if(!category){
return res.status(404).json({message:"Equipment category not found"});
}

return res.status(200).json(category);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const updateEquipmentCategory=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid equipment category id"});
}

const category=await EquipmentCategory.findById(id);
if(!category){
return res.status(404).json({message:"Equipment category not found"});
}

const {name,code,serviceType,description,parentCategory,isActive,notes,createdBy}=req.body;

if(name!==undefined)category.name=name;
if(code!==undefined)category.code=code;
if(serviceType!==undefined)category.serviceType=serviceType||null;
if(description!==undefined)category.description=description;
if(parentCategory!==undefined)category.parentCategory=parentCategory||null;
if(isActive!==undefined)category.isActive=isActive;
if(notes!==undefined)category.notes=notes;
if(createdBy!==undefined)category.createdBy=createdBy||null;

const updated=await category.save();
const populated=await EquipmentCategory.findById(updated._id)
.populate("serviceType")
.populate("parentCategory")
.populate("createdBy","name email");

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const deleteEquipmentCategory=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid equipment category id"});
}

const category=await EquipmentCategory.findByIdAndDelete(id);
if(!category){
return res.status(404).json({message:"Equipment category not found"});
}

return res.status(200).json({message:"Equipment category deleted successfully"});
}catch(error){
return res.status(500).json({message:error.message});
}
};