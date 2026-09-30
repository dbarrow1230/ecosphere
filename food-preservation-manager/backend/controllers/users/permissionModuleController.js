// backend/controllers/users/permissionModuleController.js
import mongoose from "mongoose";
import PermissionModule from "../../models/users/permissionModuleModel.js";
import RolePermission from "../../models/users/rolePermissionModel.js";
import AppKey from "../../models/reference/appKeyModel.js";
import {getAppModules} from "../../utils/getAppModules.js";

const normalizeString=value=>{
 return String(value||"").trim();
};

const normalizeKey=value=>{
 return String(value||"").trim().toLowerCase();
};

const toModuleLabel=value=>{
 return String(value||"")
  .trim()
  .replace(/[_-]+/g," ")
  .replace(/\s+/g," ")
  .replace(/\b\w/g,char=>char.toUpperCase());
};

const normalizeId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value.trim();
 if(typeof value==="object")
 {
  if(typeof value._id?.$oid==="string")return value._id.$oid;
  if(typeof value._id==="string")return value._id;
  if(typeof value.id?.$oid==="string")return value.id.$oid;
  if(typeof value.id==="string")return value.id;
  if(typeof value.$oid==="string")return value.$oid;
 }
 return "";
};

const ensureBusinessPermissionModules=async business=>{
 const existing=await PermissionModule.find({business}).sort({group:1,label:1,key:1});
 const appKeyRecord=await AppKey.findOne({businessRef:business,isActive:true}).select("appKey");

 let appModules=[];

 if(appKeyRecord?.appKey)
 {
  try
  {
   appModules=getAppModules(appKeyRecord.appKey);
  }
  catch(error)
  {
   console.warn("Permission module auto-discovery skipped",error.message);
  }
 }

 const permissionKeys=await RolePermission.distinct("module",{business});
 const knownKeys=new Set(existing.map(module=>normalizeKey(module.key)));
 const moduleDocs=[];

 appModules.forEach(module=>{
  const key=normalizeKey(module.value);
  if(!key||knownKeys.has(key))return;

  knownKeys.add(key);
  moduleDocs.push({
   business,
   key,
   label:normalizeString(module.label)||normalizeString(module.value),
   path:"",
   group:"App",
   description:"",
   isActive:true
  });
 });

 permissionKeys.forEach(module=>{
  const key=normalizeKey(module);
  if(!key||knownKeys.has(key))return;

  knownKeys.add(key);
  moduleDocs.push({
   business,
   key,
   label:toModuleLabel(key),
   path:"",
   group:"Legacy",
   description:"Created from an existing role permission.",
   isActive:true
  });
 });

 if(moduleDocs.length)
 {
  await PermissionModule.insertMany(moduleDocs,{ordered:false}).catch(error=>{
   if(error?.code!==11000)
   {
    throw error;
   }
  });
 }

 return PermissionModule.find({business}).sort({group:1,label:1,key:1});
};

export const createPermissionModule=async(req,res)=>{
 try
 {
 const key=normalizeKey(req.body.key);
  const business=normalizeId(req.body.business);
  const label=normalizeString(req.body.label);
  const path=normalizeString(req.body.path);
  const group=normalizeString(req.body.group)||"General";
  const description=normalizeString(req.body.description);
  const isActive=req.body.isActive===undefined?true:!!req.body.isActive;

  if(!business||!key||!label)
  {
   return res.status(400).json({success:false,message:"Business, key, and label are required"});
  }

  if(!mongoose.Types.ObjectId.isValid(business))
  {
   return res.status(400).json({success:false,message:"Invalid business id"});
  }

  const doc=await PermissionModule.create({
   business,
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
  const business=normalizeId(req.query.business);
  const group=normalizeString(req.query.group);
  const isActive=req.query.isActive;
  const query={};

  if(!business)
  {
   return res.status(400).json({success:false,message:"Business is required"});
  }

  if(!mongoose.Types.ObjectId.isValid(business))
  {
   return res.status(400).json({success:false,message:"Invalid business id"});
  }

  query.business=business;

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

  if(!key&&!group&&isActive===undefined)
  {
   const ensured=await ensureBusinessPermissionModules(business);
   const data=await PermissionModule.populate(ensured,{path:"business"});

   return res.status(200).json({
    success:true,
    count:data.length,
    data
   });
  }

  if(!key&&!group&&isActive==="true")
  {
   await ensureBusinessPermissionModules(business);
  }

  const data=await PermissionModule.find(query).populate("business").sort({group:1,label:1,key:1});

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

  if(req.body.business!==undefined)
  {
   const business=normalizeId(req.body.business);

   if(!mongoose.Types.ObjectId.isValid(business))
   {
    return res.status(400).json({success:false,message:"Invalid business id"});
   }

   doc.business=business;
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

