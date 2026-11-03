// backend/controllers/reference/partsController.js
import mongoose from "mongoose";
import Part from "../../models/reference/partsModel.js";
import Status from "../../models/reference/statusModel.js";

const makeSlug=value=>String(value||"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)+/g,"");

const formatPart=doc=>{
 const item=doc?.toObject?doc.toObject():doc;
 if(!item)return item;
 return item;
};

const getDefaultStatusId=async()=>{
 const defaultStatus=await Status.findOne({isDefault:true}).select("_id");
 return defaultStatus?._id||null;
};

export const createPart=async(req,res)=>{
 try{
  const{name,slug,description,notes,image,status}=req.body;

  if(!name)return res.status(400).json({success:false,message:"Name is required"});

  const statusId=status||await getDefaultStatusId();
  if(!statusId)return res.status(400).json({success:false,message:"Status is required"});
  if(!mongoose.Types.ObjectId.isValid(statusId))return res.status(400).json({success:false,message:"Invalid status id"});

  const part=new Part({
   name:name.trim(),
   slug:slug&&String(slug).trim()?makeSlug(slug):makeSlug(name),
   description:description||"",
   notes:Array.isArray(notes)?notes.filter(Boolean):[],
   image:Array.isArray(image)?image.filter(Boolean):[],
   status:statusId
  });

  const saved=await part.save();
  const populated=await Part.findById(saved._id).populate("status","name code color isDefault");

  return res.status(201).json({success:true,message:"Part created successfully",part:formatPart(populated)});
 }catch(error){
  if(error.code===11000){
   const field=Object.keys(error.keyPattern||{})[0]||"field";
   return res.status(409).json({success:false,message:`${field} already exists`});
  }
  return res.status(500).json({success:false,message:"Error creating part",error:error.message});
 }
};

export const getParts=async(req,res)=>{
 try{
  const{status,search}=req.query;
  const query={};

  if(status&&mongoose.Types.ObjectId.isValid(status))query.status=status;
  if(search){
   query.$or=[
    {name:{$regex:search,$options:"i"}},
    {slug:{$regex:search,$options:"i"}},
    {description:{$regex:search,$options:"i"}}
   ];
  }

  const parts=await Part.find(query).populate("status","name code color isDefault").sort({name:1});
  return res.status(200).json({success:true,count:parts.length,parts:parts.map(formatPart)});
 }catch(error){
  return res.status(500).json({success:false,message:"Error fetching parts",error:error.message});
 }
};

export const getPartById=async(req,res)=>{
 try{
  const{id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid part id"});

  const part=await Part.findById(id).populate("status","name code color isDefault");
  if(!part)return res.status(404).json({success:false,message:"Part not found"});

  return res.status(200).json({success:true,part:formatPart(part)});
 }catch(error){
  return res.status(500).json({success:false,message:"Error fetching part",error:error.message});
 }
};

export const updatePart=async(req,res)=>{
 try{
  const{id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid part id"});

  const{name,slug,description,notes,image,status}=req.body;
  const updateData={};

  if(name!==undefined)updateData.name=String(name).trim();
  if(slug!==undefined)updateData.slug=String(slug).trim()?makeSlug(slug):undefined;
  if(name!==undefined&&slug===undefined)updateData.slug=makeSlug(name);
  if(description!==undefined)updateData.description=description;
  if(notes!==undefined)updateData.notes=Array.isArray(notes)?notes.filter(Boolean):[];
  if(image!==undefined)updateData.image=Array.isArray(image)?image.filter(Boolean):[];
  if(status!==undefined){
   if(!mongoose.Types.ObjectId.isValid(status))return res.status(400).json({success:false,message:"Invalid status id"});
   updateData.status=status;
  }

  const part=await Part.findByIdAndUpdate(id,updateData,{returnDocument:"after",runValidators:true}).populate("status","name code color isDefault");
  if(!part)return res.status(404).json({success:false,message:"Part not found"});

  return res.status(200).json({success:true,message:"Part updated successfully",part:formatPart(part)});
 }catch(error){
  if(error.code===11000){
   const field=Object.keys(error.keyPattern||{})[0]||"field";
   return res.status(409).json({success:false,message:`${field} already exists`});
  }
  return res.status(500).json({success:false,message:"Error updating part",error:error.message});
 }
};

export const deletePart=async(req,res)=>{
 try{
  const{id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid part id"});

  const part=await Part.findByIdAndDelete(id);
  if(!part)return res.status(404).json({success:false,message:"Part not found"});

  return res.status(200).json({success:true,message:"Part deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Error deleting part",error:error.message});
 }
};