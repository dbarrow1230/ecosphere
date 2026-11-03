// backend/controllers/users/permissionModuleController.js
import mongoose from "mongoose";
import PermissionModule from "../../models/users/permissionModuleModel.js";

const normalizeString=value=>{
 return String(value||"").trim();
};

const normalizeKey=value=>{
 return String(value||"").trim().toLowerCase();
};

export const createPermissionModule=async(req,res)=>{
 try
 {
  const key=normalizeKey(req.body.key);
  const label=normalizeString(req.body.label);
  const path=normalizeString(req.body.path);
  const group=normalizeString(req.body.group)||"General";
  const description=normalizeString(req.body.description);
  const isActive=req.body.isActive===undefined?true:!!req.body.isActive;

  if(!key||!label)
  {
   return res.status(400).json({success:false,message:"Key and label are required"});
  }

  const doc=await PermissionModule.create({
   key,
   label,
   path,
   group,
   description,
   isActive
  });

  return res.status(201).json({
   success:true,
   message:"Permission module created successfully",
   data:doc
  });
 }
 catch(error)
 {
  if(error.code===11000)
  {
   return res.status(409).json({success:false,message:"Permission module already exists"});
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
  const key=normalizeKey(req.query.key);
  const group=normalizeString(req.query.group);
  const isActive=req.query.isActive;
  const query={};

  if(key)
  {
   query.key=key;
  }

  if(group)
  {
   query.group=group;
  }

  if(isActive!==undefined)
  {
   query.isActive=isActive==="true";
  }

  const data=await PermissionModule.find(query).sort({group:1,label:1,key:1});

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

  const doc=await PermissionModule.findById(id);

  if(!doc)
  {
   return res.status(404).json({success:false,message:"Permission module not found"});
  }

  return res.status(200).json({
   success:true,
   data:doc
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

  const doc=await PermissionModule.findById(id);

  if(!doc)
  {
   return res.status(404).json({success:false,message:"Permission module not found"});
  }

  if(req.body.key!==undefined)
  {
   const key=normalizeKey(req.body.key);

   if(!key)
   {
    return res.status(400).json({success:false,message:"Key is required"});
   }

   doc.key=key;
  }

  if(req.body.label!==undefined)
  {
   const label=normalizeString(req.body.label);

   if(!label)
   {
    return res.status(400).json({success:false,message:"Label is required"});
   }

   doc.label=label;
  }

  if(req.body.path!==undefined)
  {
   doc.path=normalizeString(req.body.path);
  }

  if(req.body.group!==undefined)
  {
   doc.group=normalizeString(req.body.group)||"General";
  }

  if(req.body.description!==undefined)
  {
   doc.description=normalizeString(req.body.description);
  }

  if(req.body.isActive!==undefined)
  {
   doc.isActive=!!req.body.isActive;
  }

  await doc.save();

  return res.status(200).json({
   success:true,
   message:"Permission module updated successfully",
   data:doc
  });
 }
 catch(error)
 {
  if(error.code===11000)
  {
   return res.status(409).json({success:false,message:"Permission module already exists"});
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

  const doc=await PermissionModule.findByIdAndDelete(id);

  if(!doc)
  {
   return res.status(404).json({success:false,message:"Permission module not found"});
  }

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