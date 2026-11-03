// backend/controllers/users/rolePermissionController.js
import mongoose from "mongoose";
import Role from "../../models/users/userRolesModel.js";
import Business from "../../models/reference/businessModel.js";
import RolePermission from "../../models/users/rolePermissionModel.js";

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

export const createRolePermission=async(req,res)=>{
 try{
  const roleId=normalizeId(req.body.role);
  const businessId=normalizeId(req.body.business);
  const module=(req.body.module||"").trim();

  if(!roleId||!businessId||!module)
   return res.status(400).json({success:false,message:"role, business, module required"});

  if(!mongoose.Types.ObjectId.isValid(roleId)||!mongoose.Types.ObjectId.isValid(businessId))
   return res.status(400).json({success:false,message:"invalid ids"});

  const [r,b]=await Promise.all([
   Role.findById(roleId).select("_id business"),
   Business.findById(businessId).select("_id")
  ]);

  if(!r)return res.status(404).json({success:false,message:"role not found"});
  if(!b)return res.status(404).json({success:false,message:"business not found"});
  if(String(r.business)!==String(businessId))
   return res.status(400).json({success:false,message:"role does not belong to the selected business"});

  const doc=await RolePermission.create({
   role:roleId,
   business:businessId,
   module,
   create:!!req.body.create,
   read:!!req.body.read,
   update:!!req.body.update,
   delete:!!req.body.delete,
   admin:!!req.body.admin
  });

  const populated=await RolePermission.findById(doc._id)
   .populate("role")
   .populate("business");

  return res.status(201).json({success:true,data:populated});
 }catch(err){
  if(err.code===11000)
   return res.status(409).json({success:false,message:"Permission already exists for this role and module."});

  return res.status(500).json({success:false,message:err.message||"create failed"});
 }
};

export const getRolePermissions=async(req,res)=>{
 try{
  const roleId=normalizeId(req.query.role);
  const businessId=normalizeId(req.query.business);
  const module=(req.query.module||"").trim();

  const q={};

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

  if(module)q.module=module;

  const data=await RolePermission.find(q)
   .populate("role")
   .populate("business")
   .sort({module:1,createdAt:-1});

  return res.status(200).json({success:true,count:data.length,data});
 }catch(err){
  return res.status(500).json({success:false,message:"fetch failed",error:err.message});
 }
};

export const getRolePermissionById=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"invalid id"});

  const doc=await RolePermission.findById(id)
   .populate("role")
   .populate("business");

  if(!doc)
   return res.status(404).json({success:false,message:"not found"});

  return res.status(200).json({success:true,data:doc});
 }catch(err){
  return res.status(500).json({success:false,message:"fetch failed",error:err.message});
 }
};

export const updateRolePermission=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"invalid id"});

  const doc=await RolePermission.findById(id);
  if(!doc)return res.status(404).json({success:false,message:"not found"});

  if(req.body.role!==undefined)
  {
   const roleId=normalizeId(req.body.role);
   if(!mongoose.Types.ObjectId.isValid(roleId))
    return res.status(400).json({success:false,message:"invalid role id"});

   const role=await Role.findById(roleId).select("_id business");
   if(!role)
    return res.status(404).json({success:false,message:"role not found"});

   const nextBusinessId=req.body.business!==undefined?normalizeId(req.body.business):String(doc.business);

   if(!mongoose.Types.ObjectId.isValid(nextBusinessId))
    return res.status(400).json({success:false,message:"invalid business id"});

   if(String(role.business)!==String(nextBusinessId))
    return res.status(400).json({success:false,message:"role does not belong to the selected business"});

   doc.role=roleId;
  }

  if(req.body.business!==undefined)
  {
   const businessId=normalizeId(req.body.business);
   if(!mongoose.Types.ObjectId.isValid(businessId))
    return res.status(400).json({success:false,message:"invalid business id"});

   const business=await Business.findById(businessId).select("_id");
   if(!business)
    return res.status(404).json({success:false,message:"business not found"});

   const roleId=req.body.role!==undefined?normalizeId(req.body.role):String(doc.role);
   const role=await Role.findById(roleId).select("_id business");
   if(!role)
    return res.status(404).json({success:false,message:"role not found"});

   if(String(role.business)!==String(businessId))
    return res.status(400).json({success:false,message:"role does not belong to the selected business"});

   doc.business=businessId;
  }

  ["create","read","update","delete","admin"].forEach(f=>{
   if(req.body[f]!==undefined)doc[f]=!!req.body[f];
  });

  if(req.body.module!==undefined)doc.module=(req.body.module||"").trim();

  await doc.save();

  const updated=await RolePermission.findById(id)
   .populate("role")
   .populate("business");

  return res.status(200).json({success:true,data:updated});
 }catch(err){
  if(err.code===11000)
   return res.status(409).json({success:false,message:"Permission already exists for this role and module."});

  return res.status(500).json({success:false,message:err.message||"update failed"});
 }
};

export const deleteRolePermission=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"invalid id"});

  const doc=await RolePermission.findByIdAndDelete(id);
  if(!doc)
   return res.status(404).json({success:false,message:"not found"});

  return res.status(200).json({success:true,message:"deleted"});
 }catch(err){
  return res.status(500).json({success:false,message:"delete failed",error:err.message});
 }
};