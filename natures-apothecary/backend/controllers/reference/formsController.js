// backend/controllers/reference/formsController.js
import mongoose from "mongoose";
import Form from "../../models/reference/formsModel.js";
import Status from "../../models/reference/statusModel.js";

const makeSlug=value=>String(value||"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)+/g,"");

const formatForm=doc=>{
 const item=doc?.toObject?doc.toObject():doc;
 if(!item)return item;
 return item;
};

const getDefaultStatusId=async()=>{
 const defaultStatus=await Status.findOne({isDefault:true}).select("_id");
 return defaultStatus?._id||null;
};

export const createForm=async(req,res)=>{
 try{
  const{name,slug,description,notes,image,status}=req.body;

  if(!name)return res.status(400).json({success:false,message:"Name is required"});

  const statusId=status||await getDefaultStatusId();
  if(!statusId)return res.status(400).json({success:false,message:"Status is required"});
  if(!mongoose.Types.ObjectId.isValid(statusId))return res.status(400).json({success:false,message:"Invalid status id"});

  const form=new Form({
   name:name.trim(),
   slug:slug&&String(slug).trim()?makeSlug(slug):makeSlug(name),
   description:description||"",
   notes:Array.isArray(notes)?notes.filter(Boolean):[],
   image:Array.isArray(image)?image.filter(Boolean):[],
   status:statusId
  });

  const saved=await form.save();
  const populated=await Form.findById(saved._id).populate("status","name code color isDefault");

  return res.status(201).json({success:true,message:"Form created successfully",form:formatForm(populated)});
 }catch(error){
  if(error.code===11000){
   const field=Object.keys(error.keyPattern||{})[0]||"field";
   return res.status(409).json({success:false,message:`${field} already exists`});
  }
  return res.status(500).json({success:false,message:"Error creating form",error:error.message});
 }
};

export const getForms=async(req,res)=>{
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

  const forms=await Form.find(query).populate("status","name code color isDefault").sort({name:1});
  return res.status(200).json({success:true,count:forms.length,forms:forms.map(formatForm)});
 }catch(error){
  return res.status(500).json({success:false,message:"Error fetching forms",error:error.message});
 }
};

export const getFormById=async(req,res)=>{
 try{
  const{id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid form id"});

  const form=await Form.findById(id).populate("status","name code color isDefault");
  if(!form)return res.status(404).json({success:false,message:"Form not found"});

  return res.status(200).json({success:true,form:formatForm(form)});
 }catch(error){
  return res.status(500).json({success:false,message:"Error fetching form",error:error.message});
 }
};

export const updateForm=async(req,res)=>{
 try{
  const{id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid form id"});

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

  const form=await Form.findByIdAndUpdate(id,updateData,{returnDocument:"after",runValidators:true}).populate("status","name code color isDefault");
  if(!form)return res.status(404).json({success:false,message:"Form not found"});

  return res.status(200).json({success:true,message:"Form updated successfully",form:formatForm(form)});
 }catch(error){
  if(error.code===11000){
   const field=Object.keys(error.keyPattern||{})[0]||"field";
   return res.status(409).json({success:false,message:`${field} already exists`});
  }
  return res.status(500).json({success:false,message:"Error updating form",error:error.message});
 }
};

export const deleteForm=async(req,res)=>{
 try{
  const{id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid form id"});

  const form=await Form.findByIdAndDelete(id);
  if(!form)return res.status(404).json({success:false,message:"Form not found"});

  return res.status(200).json({success:true,message:"Form deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Error deleting form",error:error.message});
 }
};