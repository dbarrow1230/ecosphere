// backend/controllers/users/permissionModuleController.js
import mongoose from "mongoose";
import PermissionModule from "../../models/users/permissionModuleModel.js";

const normalizeString=value=>{
 return String(value||"").trim();
};

const normalizeKey=value=>{
 return String(value||"").trim().toLowerCase();
};

const normalizeNumber=(value,defaultValue=0)=>{
 const numberValue=Number(value);
 return Number.isFinite(numberValue)?numberValue:defaultValue;
};

export const createPermissionModule=async(req,res)=>{
 try
 {
  const appKey=normalizeKey(req.body.appKey);
  const key=normalizeKey(req.body.key);
  const label=normalizeString(req.body.label);
  const path=normalizeString(req.body.path);
  const group=normalizeString(req.body.group)||"General";
  const description=normalizeString(req.body.description);
  const sortOrder=normalizeNumber(req.body.sortOrder,0);
  const isSystem=req.body.isSystem===undefined?false:!!req.body.isSystem;
  const isActive=req.body.isActive===undefined?true:!!req.body.isActive;

  if(!appKey||!key||!label)
  {
   return res.status(400).json({success:false,message:"App key, module key, and label are required"});
  }

  const module=await PermissionModule.create({
   appKey,
   key,
   label,
   path,
   group,
   description,
   sortOrder,
   isSystem,
   isActive
  });

  return res.status(201).json({
   success:true,
   message:"Permission module created successfully",
   data:module
  });
 }
 catch(error)
 {
  if(error.code===11000)
  {
   return res.status(409).json({success:false,message:"Permission module already exists for this app"});
  }

  console.error("createPermissionModule error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to create permission module",
   error:error.message
  });
 }
};

export const getPermissionModules=async(req,res)=>{
 try
 {
  const appKey=normalizeKey(req.query.appKey);
  const isActive=req.query.isActive;
  const group=normalizeString(req.query.group);
  const query={};

  if(!appKey)
  {
   return res.status(400).json({success:false,message:"App key is required"});
  }

  query.appKey=appKey;

  if(isActive!==undefined)
  {
   query.isActive=isActive==="true";
  }

  if(group)
  {
   query.group=group;
  }

  const data=await PermissionModule.find(query).sort({group:1,sortOrder:1,label:1,key:1});

  return res.status(200).json({
   success:true,
   count:data.length,
   data
  });
 }
 catch(error)
 {
  console.error("getPermissionModules error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to fetch permission modules",
   error:error.message
  });
 }
};

export const getPermissionModuleById=async(req,res)=>{
 try
 {
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
  {
   return res.status(400).json({success:false,message:"Invalid permission module id"});
  }

  const module=await PermissionModule.findById(id);

  if(!module)
  {
   return res.status(404).json({success:false,message:"Permission module not found"});
  }

  return res.status(200).json({
   success:true,
   data:module
  });
 }
 catch(error)
 {
  console.error("getPermissionModuleById error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to fetch permission module",
   error:error.message
  });
 }
};

export const updatePermissionModule=async(req,res)=>{
 try
 {
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
  {
   return res.status(400).json({success:false,message:"Invalid permission module id"});
  }

  const module=await PermissionModule.findById(id);

  if(!module)
  {
   return res.status(404).json({success:false,message:"Permission module not found"});
  }

  if(req.body.appKey!==undefined)
  {
   const appKey=normalizeKey(req.body.appKey);

   if(!appKey)
   {
    return res.status(400).json({success:false,message:"App key is required"});
   }

   module.appKey=appKey;
  }

  if(req.body.key!==undefined)
  {
   const key=normalizeKey(req.body.key);

   if(!key)
   {
    return res.status(400).json({success:false,message:"Module key is required"});
   }

   module.key=key;
  }

  if(req.body.label!==undefined)
  {
   const label=normalizeString(req.body.label);

   if(!label)
   {
    return res.status(400).json({success:false,message:"Label is required"});
   }

   module.label=label;
  }

  if(req.body.path!==undefined)
  {
   module.path=normalizeString(req.body.path);
  }

  if(req.body.group!==undefined)
  {
   module.group=normalizeString(req.body.group)||"General";
  }

  if(req.body.description!==undefined)
  {
   module.description=normalizeString(req.body.description);
  }

  if(req.body.sortOrder!==undefined)
  {
   module.sortOrder=normalizeNumber(req.body.sortOrder,0);
  }

  if(req.body.isSystem!==undefined)
  {
   module.isSystem=!!req.body.isSystem;
  }

  if(req.body.isActive!==undefined)
  {
   module.isActive=!!req.body.isActive;
  }

  await module.save();

  return res.status(200).json({
   success:true,
   message:"Permission module updated successfully",
   data:module
  });
 }
 catch(error)
 {
  if(error.code===11000)
  {
   return res.status(409).json({success:false,message:"Permission module already exists for this app"});
  }

  console.error("updatePermissionModule error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to update permission module",
   error:error.message
  });
 }
};

export const deletePermissionModule=async(req,res)=>{
 try
 {
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
  {
   return res.status(400).json({success:false,message:"Invalid permission module id"});
  }

  const module=await PermissionModule.findById(id);

  if(!module)
  {
   return res.status(404).json({success:false,message:"Permission module not found"});
  }

  if(module.isSystem)
  {
   return res.status(403).json({success:false,message:"System permission modules cannot be deleted"});
  }

  await PermissionModule.findByIdAndDelete(id);

  return res.status(200).json({
   success:true,
   message:"Permission module deleted successfully"
  });
 }
 catch(error)
 {
  console.error("deletePermissionModule error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to delete permission module",
   error:error.message
  });
 }
};