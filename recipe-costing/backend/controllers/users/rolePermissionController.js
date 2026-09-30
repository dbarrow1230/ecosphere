// backend/controllers/users/rolePermissionController.js
import mongoose from "mongoose";
import Business from "../../models/reference/businessModel.js";
import AppKey from "../../models/reference/appKeyModel.js";
import Role from "../../models/users/roleModel.js";
import RolePermission from "../../models/users/rolePermissionModel.js";
import PermissionModule from "../../models/users/permissionModuleModel.js";

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

 return String(value).trim();
};

const normalizeKey=value=>{
 return String(value||"").trim().toLowerCase();
};

const normalizeBoolean=value=>{
 return value===true||value==="true"||value===1||value==="1";
};

const normalizePermissionBooleans=body=>{
 const payload={};

 ["create","read","update","delete","admin"].forEach(field=>{
  if(body[field]!==undefined)payload[field]=normalizeBoolean(body[field]);
 });

 if(payload.admin)
 {
  payload.create=true;
  payload.read=true;
  payload.update=true;
  payload.delete=true;
 }

 return payload;
};

const populateRolePermission=query=>{
 return query
  .populate({
   path:"business",
   model:Business,
   select:"legalName code typeRef isActive"
  })
  .populate({
   path:"role",
   model:Role,
   select:"name label description isDefault isActive"
  });
};

const resolveAppKey=async({businessId,appKey})=>{
 const cleanAppKey=normalizeKey(appKey);

 if(cleanAppKey)return cleanAppKey;

 if(!businessId)return "";

 const appKeyRecord=await AppKey.findOne({
  businessRef:businessId,
  isActive:true
 }).select("appKey");

 return normalizeKey(appKeyRecord?.appKey);
};

const validateBusinessRoleAndModule=async({businessId,roleId,module,appKey})=>{
 if(!businessId)
 {
  return {status:400,message:"Business is required"};
 }

 if(!roleId)
 {
  return {status:400,message:"Role is required"};
 }

 if(!module)
 {
  return {status:400,message:"Module is required"};
 }

 if(!mongoose.Types.ObjectId.isValid(businessId))
 {
  return {status:400,message:"Invalid business id"};
 }

 if(!mongoose.Types.ObjectId.isValid(roleId))
 {
  return {status:400,message:"Invalid role id"};
 }

 const resolvedAppKey=await resolveAppKey({businessId,appKey});

 if(!resolvedAppKey)
 {
  return {status:400,message:"App key is required"};
 }

 const [business,role,permissionModule]=await Promise.all([
  Business.findById(businessId).select("_id"),
  Role.findById(roleId).select("_id business"),
  PermissionModule.findOne({
   appKey:resolvedAppKey,
   key:module,
   isActive:true
  }).select("_id appKey key")
 ]);

 if(!business)
 {
  return {status:404,message:"Business not found"};
 }

 if(!role)
 {
  return {status:404,message:"Role not found"};
 }

 if(String(role.business)!==String(businessId))
 {
  return {status:400,message:"Role does not belong to the selected business"};
 }

 if(!permissionModule)
 {
  return {status:404,message:"Permission module not found or inactive for this app"};
 }

 return {business,role,permissionModule,appKey:resolvedAppKey};
};

export const createRolePermission=async(req,res)=>{
 try
 {
  const businessId=normalizeId(req.body.business);
  const roleId=normalizeId(req.body.role);
  const module=normalizeKey(req.body.module);
  const appKey=normalizeKey(req.body.appKey);

  const validation=await validateBusinessRoleAndModule({
   businessId,
   roleId,
   module,
   appKey
  });

  if(validation.status)
  {
   return res.status(validation.status).json({success:false,message:validation.message});
  }

  const permissionPayload=normalizePermissionBooleans(req.body);

  const doc=await RolePermission.create({
   business:businessId,
   role:roleId,
   module,
   create:permissionPayload.create||false,
   read:permissionPayload.read||false,
   update:permissionPayload.update||false,
   delete:permissionPayload.delete||false,
   admin:permissionPayload.admin||false
  });

  const populated=await populateRolePermission(RolePermission.findById(doc._id));

  return res.status(201).json({
   success:true,
   message:"Role permission created successfully",
   data:populated
  });
 }
 catch(error)
 {
  if(error.code===11000)
  {
   return res.status(409).json({success:false,message:"Permission already exists for this business, role, and module"});
  }

  console.error("createRolePermission error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to create role permission",
   error:error.message
  });
 }
};

export const getRolePermissions=async(req,res)=>{
 try
 {
  const businessId=normalizeId(req.query.business);
  const roleId=normalizeId(req.query.role);
  const module=normalizeKey(req.query.module);
  const query={};

  if(businessId)
  {
   if(!mongoose.Types.ObjectId.isValid(businessId))
   {
    return res.status(400).json({success:false,message:"Invalid business id"});
   }

   query.business=businessId;
  }

  if(roleId)
  {
   if(!mongoose.Types.ObjectId.isValid(roleId))
   {
    return res.status(400).json({success:false,message:"Invalid role id"});
   }

   query.role=roleId;
  }

  if(module)
  {
   query.module=module;
  }

  const data=await populateRolePermission(
   RolePermission.find(query).sort({business:1,role:1,module:1})
  );

  return res.status(200).json({
   success:true,
   count:data.length,
   data
  });
 }
 catch(error)
 {
  console.error("getRolePermissions error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to fetch role permissions",
   error:error.message
  });
 }
};

export const getRolePermissionById=async(req,res)=>{
 try
 {
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
  {
   return res.status(400).json({success:false,message:"Invalid role permission id"});
  }

  const doc=await populateRolePermission(RolePermission.findById(id));

  if(!doc)
  {
   return res.status(404).json({success:false,message:"Role permission not found"});
  }

  return res.status(200).json({
   success:true,
   data:doc
  });
 }
 catch(error)
 {
  console.error("getRolePermissionById error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to fetch role permission",
   error:error.message
  });
 }
};

export const updateRolePermission=async(req,res)=>{
 try
 {
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
  {
   return res.status(400).json({success:false,message:"Invalid role permission id"});
  }

  const doc=await RolePermission.findById(id);

  if(!doc)
  {
   return res.status(404).json({success:false,message:"Role permission not found"});
  }

  const nextBusinessId=req.body.business!==undefined?normalizeId(req.body.business):normalizeId(doc.business);
  const nextRoleId=req.body.role!==undefined?normalizeId(req.body.role):normalizeId(doc.role);
  const nextModule=req.body.module!==undefined?normalizeKey(req.body.module):normalizeKey(doc.module);
  const appKey=normalizeKey(req.body.appKey||req.query.appKey);

  const validation=await validateBusinessRoleAndModule({
   businessId:nextBusinessId,
   roleId:nextRoleId,
   module:nextModule,
   appKey
  });

  if(validation.status)
  {
   return res.status(validation.status).json({success:false,message:validation.message});
  }

  if(req.body.business!==undefined)
  {
   doc.business=nextBusinessId;
  }

  if(req.body.role!==undefined)
  {
   doc.role=nextRoleId;
  }

  if(req.body.module!==undefined)
  {
   doc.module=nextModule;
  }

  const permissionPayload=normalizePermissionBooleans(req.body);

  Object.entries(permissionPayload).forEach(([field,value])=>{
   doc[field]=value;
  });

  await doc.save();

  const updated=await populateRolePermission(RolePermission.findById(id));

  return res.status(200).json({
   success:true,
   message:"Role permission updated successfully",
   data:updated
  });
 }
 catch(error)
 {
  if(error.code===11000)
  {
   return res.status(409).json({success:false,message:"Permission already exists for this business, role, and module"});
  }

  console.error("updateRolePermission error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to update role permission",
   error:error.message
  });
 }
};

export const deleteRolePermission=async(req,res)=>{
 try
 {
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
  {
   return res.status(400).json({success:false,message:"Invalid role permission id"});
  }

  const doc=await RolePermission.findByIdAndDelete(id);

  if(!doc)
  {
   return res.status(404).json({success:false,message:"Role permission not found"});
  }

  return res.status(200).json({
   success:true,
   message:"Role permission deleted successfully"
  });
 }
 catch(error)
 {
  console.error("deleteRolePermission error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to delete role permission",
   error:error.message
  });
 }
};