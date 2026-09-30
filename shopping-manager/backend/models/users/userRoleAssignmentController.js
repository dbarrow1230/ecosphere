// backend/controllers/users/userRoleAssignmentController.js
import mongoose from "mongoose";
import User from "../../models/users/userModel.js";
import Role from "../../models/users/userRolesModel.js";
import Business from "../../models/reference/businessModel.js";
import UserRoleAssignment from "../../models/users/userRoleAssignmentModel.js";

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

export const createUserRoleAssignment=async(req,res)=>{
 try{
  const userId=normalizeId(req.body.user);
  const roleId=normalizeId(req.body.role);
  const businessId=normalizeId(req.body.business);

  if(!userId||!roleId||!businessId)
   return res.status(400).json({success:false,message:"user, role, business required"});

  if(!mongoose.Types.ObjectId.isValid(userId)||!mongoose.Types.ObjectId.isValid(roleId)||!mongoose.Types.ObjectId.isValid(businessId))
   return res.status(400).json({success:false,message:"invalid ids"});

  const [u,r,b]=await Promise.all([
   User.findById(userId).select("_id"),
   Role.findById(roleId).select("_id business"),
   Business.findById(businessId).select("_id")
  ]);

  if(!u)return res.status(404).json({success:false,message:"user not found"});
  if(!r)return res.status(404).json({success:false,message:"role not found"});
  if(!b)return res.status(404).json({success:false,message:"business not found"});
  if(String(r.business)!==String(businessId))
   return res.status(400).json({success:false,message:"role does not belong to the selected business"});

  const doc=await UserRoleAssignment.create({
   user:userId,
   role:roleId,
   business:businessId,
   isActive:req.body.isActive===undefined?true:!!req.body.isActive
  });

  const populated=await UserRoleAssignment.findById(doc._id)
   .populate("user")
   .populate("role")
   .populate("business");

  return res.status(201).json({success:true,data:populated});
 }catch(err){
  if(err.code===11000)
   return res.status(409).json({success:false,message:"assignment exists"});
  return res.status(500).json({success:false,message:"create failed",error:err.message});
 }
};

export const getUserRoleAssignments=async(req,res)=>{
 try{
  const userId=normalizeId(req.query.user);
  const roleId=normalizeId(req.query.role);
  const businessId=normalizeId(req.query.business);
  const isActive=req.query.isActive;

  const q={};

  if(userId)
  {
   if(!mongoose.Types.ObjectId.isValid(userId))
    return res.status(400).json({success:false,message:"invalid user id"});
   q.user=userId;
  }

  if(roleId)
  {
   if(!mongoose.Types.ObjectId.isValid(roleId))
    return res.status(400).json({success:false,message:"invalid role id"});
   q.role=roleId;
  }

  if(businessId)
  {
   if(!mongoose.Types.ObjectId.isValid(businessId))
    return res.status(400).json({success:false,message:"invalid business id"});
   q.business=businessId;
  }

  if(isActive!==undefined)
   q.isActive=isActive==="true";

  const data=await UserRoleAssignment.find(q)
   .populate("user")
   .populate("role")
   .populate("business")
   .sort({createdAt:-1});

  return res.status(200).json({success:true,count:data.length,data});
 }catch(err){
  return res.status(500).json({success:false,message:"fetch failed",error:err.message});
 }
};

export const getUserRoleAssignmentById=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"invalid id"});

  const doc=await UserRoleAssignment.findById(id)
   .populate("user")
   .populate("role")
   .populate("business");

  if(!doc)return res.status(404).json({success:false,message:"not found"});

  return res.status(200).json({success:true,data:doc});
 }catch(err){
  return res.status(500).json({success:false,message:"fetch failed",error:err.message});
 }
};

export const updateUserRoleAssignment=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"invalid id"});

  const doc=await UserRoleAssignment.findById(id);
  if(!doc)return res.status(404).json({success:false,message:"not found"});

  const nextUserId=req.body.user!==undefined?normalizeId(req.body.user):String(doc.user);
  const nextRoleId=req.body.role!==undefined?normalizeId(req.body.role):String(doc.role);
  const nextBusinessId=req.body.business!==undefined?normalizeId(req.body.business):String(doc.business);

  if(!mongoose.Types.ObjectId.isValid(nextUserId)||!mongoose.Types.ObjectId.isValid(nextRoleId)||!mongoose.Types.ObjectId.isValid(nextBusinessId))
   return res.status(400).json({success:false,message:"invalid ids"});

  const [u,r,b]=await Promise.all([
   User.findById(nextUserId).select("_id"),
   Role.findById(nextRoleId).select("_id business"),
   Business.findById(nextBusinessId).select("_id")
  ]);

  if(!u)return res.status(404).json({success:false,message:"user not found"});
  if(!r)return res.status(404).json({success:false,message:"role not found"});
  if(!b)return res.status(404).json({success:false,message:"business not found"});
  if(String(r.business)!==String(nextBusinessId))
   return res.status(400).json({success:false,message:"role does not belong to the selected business"});

  doc.user=nextUserId;
  doc.role=nextRoleId;
  doc.business=nextBusinessId;

  if(req.body.isActive!==undefined)
   doc.isActive=!!req.body.isActive;

  await doc.save();

  const updated=await UserRoleAssignment.findById(id)
   .populate("user")
   .populate("role")
   .populate("business");

  return res.status(200).json({success:true,data:updated});
 }catch(err){
  if(err.code===11000)
   return res.status(409).json({success:false,message:"assignment exists"});
  return res.status(500).json({success:false,message:"update failed",error:err.message});
 }
};

export const deleteUserRoleAssignment=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"invalid id"});

  const doc=await UserRoleAssignment.findByIdAndDelete(id);
  if(!doc)return res.status(404).json({success:false,message:"not found"});

  return res.status(200).json({success:true,message:"deleted"});
 }catch(err){
  return res.status(500).json({success:false,message:"delete failed",error:err.message});
 }
};