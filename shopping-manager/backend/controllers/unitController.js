// /backend/controllers/unitController.js
import Unit from '../models/unitModel.js';

export const createUnit=async(req,res)=>{
try{
const{name,shortName,type,description,isActive}=req.body;
if(!name||!shortName)return res.status(400).json({success:false,message:'Name and shortName are required'});
const existing=await Unit.findOne({$or:[{name:name.trim()},{shortName:shortName.trim()}]});
if(existing)return res.status(409).json({success:false,message:'Unit with this name or shortName already exists'});
const unit=await Unit.create({name,shortName,type,description,isActive});
res.status(201).json({success:true,message:'Unit created successfully',unit});
}catch(error){
res.status(500).json({success:false,message:'Error creating unit',error:error.message});
}
};

export const getUnits=async(req,res)=>{
try{
const query={};
if(req.query.isActive!==undefined)query.isActive=req.query.isActive==='true';
if(req.query.type)query.type=req.query.type;
const units=await Unit.find(query).sort({name:1});
res.status(200).json({success:true,count:units.length,units});
}catch(error){
res.status(500).json({success:false,message:'Error fetching units',error:error.message});
}
};

export const getActiveUnits=async(req,res)=>{
try{
const units=await Unit.find({isActive:true}).sort({name:1});
res.status(200).json({success:true,count:units.length,units});
}catch(error){
res.status(500).json({success:false,message:'Error fetching active units',error:error.message});
}
};

export const getUnitById=async(req,res)=>{
try{
const unit=await Unit.findById(req.params.id);
if(!unit)return res.status(404).json({success:false,message:'Unit not found'});
res.status(200).json({success:true,unit});
}catch(error){
res.status(500).json({success:false,message:'Error fetching unit',error:error.message});
}
};

export const updateUnit=async(req,res)=>{
try{
const{name,shortName,type,description,isActive}=req.body;
const unit=await Unit.findById(req.params.id);
if(!unit)return res.status(404).json({success:false,message:'Unit not found'});
if(name&&name.trim()!==unit.name){
const existingName=await Unit.findOne({name:name.trim(),_id:{$ne:req.params.id}});
if(existingName)return res.status(409).json({success:false,message:'Unit name already exists'});
}
if(shortName&&shortName.trim()!==unit.shortName){
const existingShortName=await Unit.findOne({shortName:shortName.trim(),_id:{$ne:req.params.id}});
if(existingShortName)return res.status(409).json({success:false,message:'Unit shortName already exists'});
}
unit.name=name??unit.name;
unit.shortName=shortName??unit.shortName;
unit.type=type??unit.type;
unit.description=description??unit.description;
unit.isActive=isActive!==undefined?isActive:unit.isActive;
await unit.save();
res.status(200).json({success:true,message:'Unit updated successfully',unit});
}catch(error){
res.status(500).json({success:false,message:'Error updating unit',error:error.message});
}
};

export const deleteUnit=async(req,res)=>{
try{
const unit=await Unit.findById(req.params.id);
if(!unit)return res.status(404).json({success:false,message:'Unit not found'});
await Unit.findByIdAndDelete(req.params.id);
res.status(200).json({success:true,message:'Unit deleted successfully'});
}catch(error){
res.status(500).json({success:false,message:'Error deleting unit',error:error.message});
}
};