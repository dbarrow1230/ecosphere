// backend/controllers/ContactController.js
import mongoose from "mongoose";
import ContactModel from "../models/ContactModel.js";

const normalizeNotes=value=>{
 if(Array.isArray(value))return value.map(item=>String(item).trim()).filter(Boolean);
 if(typeof value==="string")return value.split(",").map(item=>item.trim()).filter(Boolean);
 return [];
};

const normalizeContactPayload=body=>{
 const payload={...body};

 if(Object.prototype.hasOwnProperty.call(payload,"name")){
  payload.name=(payload.name||"").toString().trim();
 }

 if(Object.prototype.hasOwnProperty.call(payload,"phone")){
  payload.phone=(payload.phone||"").toString().trim();
 }

 if(Object.prototype.hasOwnProperty.call(payload,"email")){
  payload.email=(payload.email||"").toString().trim().toLowerCase();
 }

 if(Object.prototype.hasOwnProperty.call(payload,"notes")){
  payload.notes=normalizeNotes(payload.notes);
 }

 if(Object.prototype.hasOwnProperty.call(payload,"isActive")){
  payload.isActive=!!payload.isActive;
 }

 return payload;
};

export const createContact=async(req,res)=>{
 try{
  const payload=normalizeContactPayload(req.body);
  const contact=await ContactModel.create(payload);
  return res.status(201).json({success:true,message:"Contact created successfully",contact});
 }catch(error){
  console.error("CREATE CONTACT ERROR:",error);

  if(error.name==="ValidationError"){
   const firstError=Object.values(error.errors||{})[0];
   return res.status(400).json({success:false,message:firstError?.message||"Validation failed",error:error.message});
  }

  if(error.name==="CastError"){
   return res.status(400).json({success:false,message:`Invalid value for ${error.path}`,error:error.message});
  }

  return res.status(500).json({success:false,message:error.message||"Failed to create contact",error:error.message});
 }
};

export const getContacts=async(req,res)=>{
 try{
  const {search="",isActive,page=1,limit,sort="name",order="asc"}=req.query;

  const query={};

  if(search){
   query.$or=[
    {name:{$regex:search,$options:"i"}},
    {phone:{$regex:search,$options:"i"}},
    {email:{$regex:search,$options:"i"}},
    {notes:{$regex:search,$options:"i"}}
   ];
  }

  if(typeof isActive!=="undefined"&&isActive!==""){
   query.isActive=isActive==="true";
  }

  const currentPage=Math.max(parseInt(page)||1,1);
  const perPage=limit?Math.max(parseInt(limit)||1,1):0;
  const skip=perPage?(currentPage-1)*perPage:0;
  const sortOrder=order==="desc"?-1:1;

  const findQuery=ContactModel.find(query).sort({[sort]:sortOrder});

  if(perPage){
   findQuery.skip(skip).limit(perPage);
  }

  const [contacts,total]=await Promise.all([
   findQuery,
   ContactModel.countDocuments(query)
  ]);

  return res.status(200).json({
   success:true,
   total,
   page:currentPage,
   pages:perPage?Math.ceil(total/perPage):1,
   limit:perPage||total,
   contacts
  });
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch contacts",error:error.message});
 }
};

export const getContactById=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid contact id"});

  const contact=await ContactModel.findById(id);

  if(!contact)return res.status(404).json({success:false,message:"Contact not found"});

  return res.status(200).json({success:true,contact});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch contact",error:error.message});
 }
};

export const updateContact=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid contact id"});

  const payload=normalizeContactPayload(req.body);

  const contact=await ContactModel.findByIdAndUpdate(id,payload,{new:true,runValidators:true});

  if(!contact)return res.status(404).json({success:false,message:"Contact not found"});

  return res.status(200).json({success:true,message:"Contact updated successfully",contact});
 }catch(error){
  console.error("UPDATE CONTACT ERROR:",error);

  if(error.name==="ValidationError"){
   const firstError=Object.values(error.errors||{})[0];
   return res.status(400).json({success:false,message:firstError?.message||"Validation failed",error:error.message});
  }

  if(error.name==="CastError"){
   return res.status(400).json({success:false,message:`Invalid value for ${error.path}`,error:error.message});
  }

  return res.status(500).json({success:false,message:error.message||"Failed to update contact",error:error.message});
 }
};

export const deleteContact=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid contact id"});

  const contact=await ContactModel.findByIdAndDelete(id);

  if(!contact)return res.status(404).json({success:false,message:"Contact not found"});

  return res.status(200).json({success:true,message:"Contact deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete contact",error:error.message});
 }
};