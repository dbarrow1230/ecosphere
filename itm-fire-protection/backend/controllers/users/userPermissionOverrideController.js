// backend/controllers/users/userPermissionOverrideController.js
import mongoose from "mongoose";
import User from "../../models/users/userModel.js";
import Business from "../../models/reference/businessModel.js";
import UserPermissionOverride from "../../models/users/userPermissionOverrideModel.js";

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

const n=v=>v===undefined?undefined:(v===null||v==="")?null:!!v;

export const createUserPermissionOverride=async(req,res)=>{
 try{
  const userId=normalizeId(req.body.user);
  const businessId=normalizeId(req.body.business);
  const module=(req.body.module||"").trim();

  if(!userId||!businessId||!module)
   return res.status(400).json({success:false,message:"user,business,module required"});

  if(!mongoose.Types.ObjectId.isValid(userId)||!mongoose.Types.ObjectId.isValid(businessId))
   return res.status(400).json({success:false,message:"invalid ids"});

  const [u,b]=await Promise.all([
   User.findById(userId).select("_id"),
   Business.findById(businessId).select("_id")
  ]);

  if(!u)return res.status(404).json({success:false,message:"user not found"});
  if(!b)return res.status(404).json({success:false,message:"business not found"});

  const doc=await UserPermissionOverride.create({
   user:userId,
   business:businessId,
   module,
   create:n(req.body.create),
   read:n(req.body.read),
   update:n(req.body.update),
   delete:n(req.body.delete),
   admin:n(req.body.admin)
  });

  const populated=await UserPermissionOverride.findById(doc._id)
   .populate({path:"user",model:User})
   .populate("business");

  return res.status(201).json({success:true,data:populated});
 }catch(err){
  if(err.code===11000)
   return res.status(409).json({success:false,message:"exists"});
  return res.status(500).json({success:false,message:"create failed",error:err.message});
 }
};

export const getUserPermissionOverrides=async(req,res)=>{
 try{
  const userId=normalizeId(req.query.user);
  const businessId=normalizeId(req.query.business);
  const module=(req.query.module||"").trim();

  const q={};

  if(userId)
  {
   if(!mongoose.Types.ObjectId.isValid(userId))
    return res.status(400).json({success:false,message:"invalid user id"});
   q.user=userId;
  }

  if(businessId)
  {
   if(!mongoose.Types.ObjectId.isValid(businessId))
    return res.status(400).json({success:false,message:"invalid business id"});
   q.business=businessId;
  }

  if(module)q.module=module;

  const data=await UserPermissionOverride.find(q)
   .populate({path:"user",model:User})
   .populate("business")
   .sort({module:1,createdAt:-1});

  return res.status(200).json({success:true,count:data.length,data});
 }catch(err){
  return res.status(500).json({success:false,message:"fetch failed",error:err.message});
 }
};

export const getUserPermissionOverrideById=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"invalid id"});

  const doc=await UserPermissionOverride.findById(id)
   .populate({path:"user",model:User})
   .populate("business");

  if(!doc)
   return res.status(404).json({success:false,message:"not found"});

  return res.status(200).json({success:true,data:doc});
 }catch(err){
  return res.status(500).json({success:false,message:"fetch failed",error:err.message});
 }
};

export const updateUserPermissionOverride=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"invalid id"});

  const doc=await UserPermissionOverride.findById(id);
  if(!doc)return res.status(404).json({success:false,message:"not found"});

  if(req.body.user!==undefined)
  {
   const userId=normalizeId(req.body.user);
   if(!mongoose.Types.ObjectId.isValid(userId))
    return res.status(400).json({success:false,message:"invalid user id"});

   const user=await User.findById(userId).select("_id");
   if(!user)
    return res.status(404).json({success:false,message:"user not found"});

   doc.user=userId;
  }

  if(req.body.business!==undefined)
  {
   const businessId=normalizeId(req.body.business);
   if(!mongoose.Types.ObjectId.isValid(businessId))
    return res.status(400).json({success:false,message:"invalid business id"});

   const business=await Business.findById(businessId).select("_id");
   if(!business)
    return res.status(404).json({success:false,message:"business not found"});

   doc.business=businessId;
  }

  ["create","read","update","delete","admin"].forEach(f=>{
   if(req.body[f]!==undefined)doc[f]=n(req.body[f]);
  });

  if(req.body.module!==undefined)doc.module=(req.body.module||"").trim();

  await doc.save();

  const updated=await UserPermissionOverride.findById(id)
   .populate({path:"user",model:User})
   .populate("business");

  return res.status(200).json({success:true,data:updated});
 }catch(err){
  if(err.code===11000)
   return res.status(409).json({success:false,message:"exists"});
  return res.status(500).json({success:false,message:"update failed",error:err.message});
 }
};

export const deleteUserPermissionOverride=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"invalid id"});

  const doc=await UserPermissionOverride.findByIdAndDelete(id);
  if(!doc)
   return res.status(404).json({success:false,message:"not found"});

  return res.status(200).json({success:true,message:"deleted"});
 }catch(err){
  return res.status(500).json({success:false,message:"delete failed",error:err.message});
 }
};
