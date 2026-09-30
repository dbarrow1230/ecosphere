// backend/controllers/users/permissionController.js
import mongoose from "mongoose";
import Permission from "../../models/users/permissionModel.js";
import User from "../../models/users/userModel.js";

const allowedRoles=["admin","user","staff"];

const normalizeBoolean=(value)=>{
 return value===true||value==="true"||value===1||value==="1";
};

const validateTarget=async({user,role})=>{
 const hasUser=user!==undefined&&user!==null&&user!=="";
 const hasRole=role!==undefined&&role!==null&&role!=="";

 if(!hasUser&&!hasRole)
 {
  return {error:"Permission must have a user or role"};
 }

 if(hasUser&&hasRole)
 {
  return {error:"Permission cannot have both user and role"};
 }

 if(hasUser)
 {
  if(!mongoose.Types.ObjectId.isValid(user))
  {
   return {error:"Invalid user id"};
  }

  const existingUser=await User.findById(user).select("_id");

  if(!existingUser)
  {
   return {error:"User not found",status:404};
  }

  return{
   data:{
    user,
    role:null
   }
  };
 }

 if(!allowedRoles.includes(role))
 {
  return {error:"Invalid role"};
 }

 return{
  data:{
   user:null,
   role
  }
 };
};

const buildPermissionPayload=async(payload)=>{
 const target=await validateTarget(payload);

 if(target.error)
 {
  return target;
 }

 if(!payload.module||!payload.module.trim())
 {
  return {error:"Module is required"};
 }

 return{
  data:{
   ...target.data,
   module:payload.module.trim(),
   create:normalizeBoolean(payload.create),
   read:normalizeBoolean(payload.read),
   update:normalizeBoolean(payload.update),
   delete:normalizeBoolean(payload.delete),
   admin:normalizeBoolean(payload.admin)
  }
 };
};

export const createPermission=async(req,res)=>{
 try
 {
  const normalized=await buildPermissionPayload(req.body);

  if(normalized.error)
  {
   return res.status(normalized.status||400).json({
    success:false,
    message:normalized.error
   });
  }

  const permission=await Permission.create(normalized.data);

  const populatedPermission=await Permission.findById(permission._id)
   .populate("user","username email role");

  return res.status(201).json({
   success:true,
   message:"Permission created successfully",
   data:populatedPermission
  });
 }
 catch(error)
 {
  if(error.code===11000)
  {
   return res.status(409).json({
    success:false,
    message:req.body.user?"Permission already exists for this user and module":"Permission already exists for this role and module"
   });
  }

  return res.status(500).json({
   success:false,
   message:"Failed to create permission",
   error:error.message
  });
 }
};

export const getPermissions=async(req,res)=>{
 try
 {
  const {role,module,user}=req.query;
  const query={};

  if(user!==undefined&&user!=="")
  {
   if(!mongoose.Types.ObjectId.isValid(user))
   {
    return res.status(400).json({success:false,message:"Invalid user id"});
   }

   query.user=user;
  }
  else if(role!==undefined&&role!=="")
  {
   if(!allowedRoles.includes(role))
   {
    return res.status(400).json({success:false,message:"Invalid role"});
   }

   query.role=role;
   query.user=null;
  }

  if(module!==undefined&&module!=="")
  {
   query.module=module.trim();
  }

  const permissions=await Permission.find(query)
   .populate("user","username email role")
   .sort({module:1,role:1,createdAt:-1});

  return res.status(200).json({
   success:true,
   count:permissions.length,
   data:permissions
  });
 }
 catch(error)
 {
  return res.status(500).json({
   success:false,
   message:"Failed to fetch permissions",
   error:error.message
  });
 }
};

export const getPermissionById=async(req,res)=>{
 try
 {
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
  {
   return res.status(400).json({success:false,message:"Invalid permission id"});
  }

  const permission=await Permission.findById(id)
   .populate("user","username email role");

  if(!permission)
  {
   return res.status(404).json({success:false,message:"Permission not found"});
  }

  return res.status(200).json({
   success:true,
   data:permission
  });
 }
 catch(error)
 {
  return res.status(500).json({
   success:false,
   message:"Failed to fetch permission",
   error:error.message
  });
 }
};

export const updatePermission=async(req,res)=>{
 try
 {
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
  {
   return res.status(400).json({success:false,message:"Invalid permission id"});
  }

  const existingPermission=await Permission.findById(id);

  if(!existingPermission)
  {
   return res.status(404).json({success:false,message:"Permission not found"});
  }

  const mergedPayload={
   user:req.body.user!==undefined?req.body.user:(existingPermission.user?String(existingPermission.user):null),
   role:req.body.role!==undefined?req.body.role:existingPermission.role,
   module:req.body.module!==undefined?req.body.module:existingPermission.module,
   create:req.body.create!==undefined?req.body.create:existingPermission.create,
   read:req.body.read!==undefined?req.body.read:existingPermission.read,
   update:req.body.update!==undefined?req.body.update:existingPermission.update,
   delete:req.body.delete!==undefined?req.body.delete:existingPermission.delete,
   admin:req.body.admin!==undefined?req.body.admin:existingPermission.admin
  };

  const normalized=await buildPermissionPayload(mergedPayload);

  if(normalized.error)
  {
   return res.status(normalized.status||400).json({
    success:false,
    message:normalized.error
   });
  }

  const permission=await Permission.findByIdAndUpdate(
   id,
   normalized.data,
   {new:true,runValidators:true}
  ).populate("user","username email role");

  return res.status(200).json({
   success:true,
   message:"Permission updated successfully",
   data:permission
  });
 }
 catch(error)
 {
  if(error.code===11000)
  {
   return res.status(409).json({
    success:false,
    message:req.body.user?"Permission already exists for this user and module":"Permission already exists for this role and module"
   });
  }

  return res.status(500).json({
   success:false,
   message:"Failed to update permission",
   error:error.message
  });
 }
};

export const deletePermission=async(req,res)=>{
 try
 {
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
  {
   return res.status(400).json({success:false,message:"Invalid permission id"});
  }

  const permission=await Permission.findByIdAndDelete(id);

  if(!permission)
  {
   return res.status(404).json({success:false,message:"Permission not found"});
  }

  return res.status(200).json({
   success:true,
   message:"Permission deleted successfully"
  });
 }
 catch(error)
 {
  return res.status(500).json({
   success:false,
   message:"Failed to delete permission",
   error:error.message
  });
 }
};