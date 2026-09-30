// backend/controllers/users/userRolesController.js
import mongoose from "mongoose";
import Role from "../../models/users/userRolesModel.js";
import Business from "../../models/reference/businessModel.js";

const normalizeId=(v)=>{
 if(!v)return null;
 if(typeof v==="string")return v.trim();
 if(typeof v==="object")
 {
  if(v._id)return String(v._id);
  if(v.$oid)return String(v.$oid);
  if(v._id?.$oid)return String(v._id.$oid);
 }
 return String(v);
};

export const createRole=async(req,res)=>{
 try{
  const name=(req.body.name||"").trim();
  const businessId=normalizeId(req.body.business);
  const description=(req.body.description||"").trim();
  const isActive=req.body.isActive===undefined?true:!!req.body.isActive;

  if(!name||!businessId)
   return res.status(400).json({success:false,message:"name and business are required"});

  if(!mongoose.Types.ObjectId.isValid(businessId))
   return res.status(400).json({success:false,message:"invalid business id"});

  const business=await Business.findById(businessId).select("_id");
  if(!business)
   return res.status(404).json({success:false,message:"business not found"});

  const role=await Role.create({
   name,
   business:businessId,
   description,
   isActive
  });

  const populated=await Role.findById(role._id).populate("business");

  return res.status(201).json({success:true,message:"role created successfully",data:populated});
 }
 catch(error){
  if(error.code===11000)
   return res.status(409).json({success:false,message:"role already exists for this business"});
  return res.status(500).json({success:false,message:"failed to create role",error:error.message});
 }
};

export const getRoles=async(req,res)=>{
 try{
  const businessId=normalizeId(req.query.business);
  const type=(req.query.type||"").trim();
  const isActive=req.query.isActive;
  const query={};

  if(businessId)
  {
   if(!mongoose.Types.ObjectId.isValid(businessId))
    return res.status(400).json({success:false,message:"invalid business id"});
   query.business=businessId;
  }

  if(type)query.type=type;

  if(isActive!==undefined)
   query.isActive=isActive==="true";

  const roles=await Role.find(query)
   .populate("business")
   .sort({name:1});

  return res.status(200).json({success:true,count:roles.length,data:roles});
 }
 catch(error){
  return res.status(500).json({success:false,message:"failed to fetch roles",error:error.message});
 }
};

export const getRoleById=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"invalid role id"});

  const role=await Role.findById(id).populate("business");

  if(!role)
   return res.status(404).json({success:false,message:"role not found"});

  return res.status(200).json({success:true,data:role});
 }
 catch(error){
  return res.status(500).json({success:false,message:"failed to fetch role",error:error.message});
 }
};

export const updateRole=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"invalid role id"});

  const role=await Role.findById(id);
  if(!role)
   return res.status(404).json({success:false,message:"role not found"});

  if(req.body.name!==undefined)role.name=(req.body.name||"").trim();
  if(req.body.description!==undefined)role.description=(req.body.description||"").trim();
  if(req.body.isActive!==undefined)role.isActive=!!req.body.isActive;

  if(req.body.business!==undefined)
  {
   const businessId=normalizeId(req.body.business);
   if(!mongoose.Types.ObjectId.isValid(businessId))
    return res.status(400).json({success:false,message:"invalid business id"});

   const business=await Business.findById(businessId).select("_id");
   if(!business)
    return res.status(404).json({success:false,message:"business not found"});

   role.business=businessId;
  }

  await role.save();

  const updated=await Role.findById(id).populate("business");

  return res.status(200).json({success:true,message:"role updated successfully",data:updated});
 }
 catch(error){
  if(error.code===11000)
   return res.status(409).json({success:false,message:"role already exists for this business"});
  return res.status(500).json({success:false,message:"failed to update role",error:error.message});
 }
};

export const deleteRole=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"invalid role id"});

  const role=await Role.findByIdAndDelete(id);

  if(!role)
   return res.status(404).json({success:false,message:"role not found"});

  return res.status(200).json({success:true,message:"role deleted successfully"});
 }
 catch(error){
  return res.status(500).json({success:false,message:"failed to delete role",error:error.message});
 }
};