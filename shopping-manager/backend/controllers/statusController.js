// /backend/controllers/statusController.js
import Status from '../models/statusModel.js';

export const createStatus=async(req,res)=>{
try{
const{name,key,type,label,description,color,sortOrder,isActive}=req.body;
if(!name||!key||!type)return res.status(400).json({success:false,message:'Name, key, and type are required'});
const existing=await Status.findOne({type:type.trim().toLowerCase(),key:key.trim().toLowerCase()});
if(existing)return res.status(409).json({success:false,message:'Status with this type and key already exists'});
const status=await Status.create({name,key,type,label,description,color,sortOrder,isActive});
res.status(201).json({success:true,message:'Status created successfully',status});
}catch(error){
res.status(500).json({success:false,message:'Error creating status',error:error.message});
}
};

export const getStatuses=async(req,res)=>{
try{
const query={};
if(req.query.type)query.type=req.query.type.trim().toLowerCase();
if(req.query.key)query.key=req.query.key.trim().toLowerCase();
if(req.query.isActive!==undefined)query.isActive=req.query.isActive==='true';
const statuses=await Status.find(query).sort({type:1,sortOrder:1,name:1});
res.status(200).json({success:true,count:statuses.length,statuses});
}catch(error){
res.status(500).json({success:false,message:'Error fetching statuses',error:error.message});
}
};

export const getActiveStatuses=async(req,res)=>{
try{
const query={isActive:true};
if(req.query.type)query.type=req.query.type.trim().toLowerCase();
const statuses=await Status.find(query).sort({type:1,sortOrder:1,name:1});
res.status(200).json({success:true,count:statuses.length,statuses});
}catch(error){
res.status(500).json({success:false,message:'Error fetching active statuses',error:error.message});
}
};

export const getStatusById=async(req,res)=>{
try{
const status=await Status.findById(req.params.id);
if(!status)return res.status(404).json({success:false,message:'Status not found'});
res.status(200).json({success:true,status});
}catch(error){
res.status(500).json({success:false,message:'Error fetching status',error:error.message});
}
};

export const getStatusesByType=async(req,res)=>{
try{
const statuses=await Status.find({type:req.params.type.trim().toLowerCase()}).sort({sortOrder:1,name:1});
res.status(200).json({success:true,count:statuses.length,statuses});
}catch(error){
res.status(500).json({success:false,message:'Error fetching statuses by type',error:error.message});
}
};

export const getStatusByTypeAndKey=async(req,res)=>{
try{
const status=await Status.findOne({type:req.params.type.trim().toLowerCase(),key:req.params.key.trim().toLowerCase()});
if(!status)return res.status(404).json({success:false,message:'Status not found'});
res.status(200).json({success:true,status});
}catch(error){
res.status(500).json({success:false,message:'Error fetching status',error:error.message});
}
};

export const updateStatus=async(req,res)=>{
try{
const{name,key,type,label,description,color,sortOrder,isActive}=req.body;
const status=await Status.findById(req.params.id);
if(!status)return res.status(404).json({success:false,message:'Status not found'});
const nextType=type!==undefined?type.trim().toLowerCase():status.type;
const nextKey=key!==undefined?key.trim().toLowerCase():status.key;
if(nextType!==status.type||nextKey!==status.key){
const existing=await Status.findOne({type:nextType,key:nextKey,_id:{$ne:req.params.id}});
if(existing)return res.status(409).json({success:false,message:'Status with this type and key already exists'});
}
status.name=name??status.name;
status.key=key?key.trim().toLowerCase():status.key;
status.type=type?type.trim().toLowerCase():status.type;
status.label=label??status.label;
status.description=description??status.description;
status.color=color??status.color;
status.sortOrder=sortOrder??status.sortOrder;
status.isActive=isActive!==undefined?isActive:status.isActive;
await status.save();
res.status(200).json({success:true,message:'Status updated successfully',status});
}catch(error){
res.status(500).json({success:false,message:'Error updating status',error:error.message});
}
};

export const deleteStatus=async(req,res)=>{
try{
const status=await Status.findById(req.params.id);
if(!status)return res.status(404).json({success:false,message:'Status not found'});
await Status.findByIdAndDelete(req.params.id);
res.status(200).json({success:true,message:'Status deleted successfully'});
}catch(error){
res.status(500).json({success:false,message:'Error deleting status',error:error.message});
}
};