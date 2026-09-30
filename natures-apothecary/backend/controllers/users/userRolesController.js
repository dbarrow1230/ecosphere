// backend/controllers/users/userRolesController.js
import mongoose from "mongoose";
import Role from "../../models/users/userRolesModel.js";
import Business from "../../models/reference/businessModel.js";

const normalizeId=value=>{
 if(!value)return "";

 if(typeof value==="string")return value.trim();

 if(typeof value==="object")
 {
  if(typeof value._id?.$oid==="string")return value._id.$oid;
  if(typeof value._id==="string")return value._id;
  if(typeof value.$oid==="string")return value.$oid;
 }

 return String(value).trim();
};

const normalizeName=value=>{
 return String(value||"").trim().toLowerCase();
};

const normalizeDescription=value=>{
 return String(value||"").trim();
};

const validateBusiness=async businessId=>{
 if(!businessId)
 {
  return {status:400,message:"Business is required"};
 }

 if(!mongoose.Types.ObjectId.isValid(businessId))
 {
  return {status:400,message:"Invalid business id"};
 }

 const business=await Business.findById(businessId).select("_id");

 if(!business)
 {
  return {status:404,message:"Business not found"};
 }

 return {business};
};

export const createRole=async(req,res)=>{
 try
 {
  const name=normalizeName(req.body.name);
  const businessId=normalizeId(req.body.business);
  const description=normalizeDescription(req.body.description);
  const isDefault=req.body.isDefault===undefined?false:!!req.body.isDefault;
  const isActive=req.body.isActive===undefined?true:!!req.body.isActive;

  if(!name||!businessId)
  {
   return res.status(400).json({success:false,message:"Name and business are required"});
  }

  const validation=await validateBusiness(businessId);

  if(validation.status)
  {
   return res.status(validation.status).json({success:false,message:validation.message});
  }

  const role=await Role.create({
   business:businessId,
   name,
   description,
   isDefault,
   isActive
  });

  const populated=await Role.findById(role._id).populate("business");

  return res.status(201).json({
   success:true,
   message:"Role created successfully",
   data:populated
  });
 }
 catch(error)
 {
  if(error.code===11000)
  {
   return res.status(409).json({success:false,message:"Role already exists for this business"});
  }

  console.error("createRole error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to create role",
   error:error.message
  });
 }
};

export const getRoles=async(req,res)=>{
 try
 {
  const businessId=normalizeId(req.query.business);
  const name=normalizeName(req.query.name);
  const isDefault=req.query.isDefault;
  const isActive=req.query.isActive;
  const query={};

  if(businessId)
  {
   if(!mongoose.Types.ObjectId.isValid(businessId))
   {
    return res.status(400).json({success:false,message:"Invalid business id"});
   }

   query.business=businessId;
  }

  if(name)
  {
   query.name=name;
  }

  if(isDefault!==undefined)
  {
   query.isDefault=isDefault==="true";
  }

  if(isActive!==undefined)
  {
   query.isActive=isActive==="true";
  }

  const roles=await Role.find(query)
   .populate("business")
   .sort({business:1,isDefault:-1,name:1});

  return res.status(200).json({
   success:true,
   count:roles.length,
   data:roles
  });
 }
 catch(error)
 {
  console.error("getRoles error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to fetch roles",
   error:error.message
  });
 }
};

export const getRoleById=async(req,res)=>{
 try
 {
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
  {
   return res.status(400).json({success:false,message:"Invalid role id"});
  }

  const role=await Role.findById(id).populate("business");

  if(!role)
  {
   return res.status(404).json({success:false,message:"Role not found"});
  }

  return res.status(200).json({
   success:true,
   data:role
  });
 }
 catch(error)
 {
  console.error("getRoleById error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to fetch role",
   error:error.message
  });
 }
};

export const updateRole=async(req,res)=>{
 try
 {
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
  {
   return res.status(400).json({success:false,message:"Invalid role id"});
  }

  const role=await Role.findById(id);

  if(!role)
  {
   return res.status(404).json({success:false,message:"Role not found"});
  }

  if(req.body.name!==undefined)
  {
   const name=normalizeName(req.body.name);

   if(!name)
   {
    return res.status(400).json({success:false,message:"Name is required"});
   }

   role.name=name;
  }

  if(req.body.description!==undefined)
  {
   role.description=normalizeDescription(req.body.description);
  }

  if(req.body.isDefault!==undefined)
  {
   role.isDefault=!!req.body.isDefault;
  }

  if(req.body.isActive!==undefined)
  {
   role.isActive=!!req.body.isActive;
  }

  if(req.body.business!==undefined)
  {
   const businessId=normalizeId(req.body.business);
   const validation=await validateBusiness(businessId);

   if(validation.status)
   {
    return res.status(validation.status).json({success:false,message:validation.message});
   }

   role.business=businessId;
  }

  await role.save();

  const updated=await Role.findById(id).populate("business");

  return res.status(200).json({
   success:true,
   message:"Role updated successfully",
   data:updated
  });
 }
 catch(error)
 {
  if(error.code===11000)
  {
   return res.status(409).json({success:false,message:"Role already exists for this business"});
  }

  console.error("updateRole error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to update role",
   error:error.message
  });
 }
};

export const deleteRole=async(req,res)=>{
 try
 {
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
  {
   return res.status(400).json({success:false,message:"Invalid role id"});
  }

  const role=await Role.findByIdAndDelete(id);

  if(!role)
  {
   return res.status(404).json({success:false,message:"Role not found"});
  }

  return res.status(200).json({
   success:true,
   message:"Role deleted successfully"
  });
 }
 catch(error)
 {
  console.error("deleteRole error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to delete role",
   error:error.message
  });
 }
};