import mongoose from "mongoose";
import FileLookup from "../models/fileLookupModel.js";

const validKinds=["type","category"];
const normalizeValue=value=>String(value||"").trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");

export const listFileLookups=async(req,res)=>{
 try{
  const query={};
  if(req.query.kind&&validKinds.includes(req.query.kind))query.kind=req.query.kind;
  const items=await FileLookup.find(query).sort({kind:1,name:1});
  res.json({success:true,fileLookups:items});
 }catch(error){res.status(500).json({success:false,message:"Failed to load file options",error:error.message});}
};

export const createFileLookup=async(req,res)=>{
 try{
  const kind=String(req.body.kind||"").trim();
  const name=String(req.body.name||"").trim();
  const value=normalizeValue(req.body.value||name);
  if(!validKinds.includes(kind))return res.status(400).json({success:false,message:"A valid option kind is required"});
  if(!name||!value)return res.status(400).json({success:false,message:"Name is required"});
  if(req.body.createdBy&&!mongoose.Types.ObjectId.isValid(req.body.createdBy))return res.status(400).json({success:false,message:"Invalid createdBy id"});
  const item=await FileLookup.create({
   kind,name,value,
   description:String(req.body.description||"").trim(),
   isActive:req.body.isActive!==false,
   createdBy:req.body.createdBy||null
  });
  res.status(201).json({success:true,fileLookup:item});
 }catch(error){
  const duplicate=error?.code===11000;
  res.status(duplicate?409:500).json({success:false,message:duplicate?"That file option already exists":"Failed to create file option",error:error.message});
 }
};

export const updateFileLookup=async(req,res)=>{
 try{
  if(!mongoose.Types.ObjectId.isValid(req.params.id))return res.status(400).json({success:false,message:"Invalid file option id"});
  const existing=await FileLookup.findById(req.params.id);
  if(!existing)return res.status(404).json({success:false,message:"File option not found"});
  const name=req.body.name===undefined?existing.name:String(req.body.name).trim();
  const value=req.body.value===undefined?existing.value:normalizeValue(req.body.value||name);
  if(!name||!value)return res.status(400).json({success:false,message:"Name is required"});
  existing.name=name;
  existing.value=value;
  if(req.body.description!==undefined)existing.description=String(req.body.description||"").trim();
  if(req.body.isActive!==undefined)existing.isActive=Boolean(req.body.isActive);
  await existing.save();
  res.json({success:true,fileLookup:existing});
 }catch(error){
  const duplicate=error?.code===11000;
  res.status(duplicate?409:500).json({success:false,message:duplicate?"That file option already exists":"Failed to update file option",error:error.message});
 }
};

export const deleteFileLookup=async(req,res)=>{
 try{
  if(!mongoose.Types.ObjectId.isValid(req.params.id))return res.status(400).json({success:false,message:"Invalid file option id"});
  const item=await FileLookup.findByIdAndDelete(req.params.id);
  if(!item)return res.status(404).json({success:false,message:"File option not found"});
  res.json({success:true,message:"File option deleted"});
 }catch(error){res.status(500).json({success:false,message:"Failed to delete file option",error:error.message});}
};
