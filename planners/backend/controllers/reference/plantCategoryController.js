// backend/controllers/reference/plantCategoryController.js
import mongoose from "mongoose";
import PlantCategory from "../../models/reference/plantCategoryModel.js";

export const createPlantCategory=async(req,res)=>{
try{
const {name,description,isActive}=req.body;

const category=new PlantCategory({
name,
description,
isActive:isActive!==undefined?isActive:true
});

const saved=await category.save();

return res.status(201).json(saved);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getPlantCategories=async(req,res)=>{
try{
const query={};

if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";

if(req.query.search){
query.$or=[
{name:{$regex:req.query.search,$options:"i"}},
{description:{$regex:req.query.search,$options:"i"}}
];
}

const categories=await PlantCategory.find(query)
.sort({createdAt:-1});

return res.status(200).json(categories);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getPlantCategoryById=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid plant category id"});
}

const category=await PlantCategory.findById(id);

if(!category){
return res.status(404).json({message:"Plant category not found"});
}

return res.status(200).json(category);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const updatePlantCategory=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid plant category id"});
}

const category=await PlantCategory.findById(id);
if(!category){
return res.status(404).json({message:"Plant category not found"});
}

const {name,description,isActive}=req.body;

if(name!==undefined)category.name=name;
if(description!==undefined)category.description=description;
if(isActive!==undefined)category.isActive=isActive;

const updated=await category.save();

return res.status(200).json(updated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const deletePlantCategory=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid plant category id"});
}

const category=await PlantCategory.findByIdAndDelete(id);
if(!category){
return res.status(404).json({message:"Plant category not found"});
}

return res.status(200).json({message:"Plant category deleted successfully"});
}catch(error){
return res.status(500).json({message:error.message});
}
};