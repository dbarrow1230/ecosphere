// backend/controllers/users/rolePermissionController.js
import mongoose from "mongoose";
import Business from "../../models/reference/businessModel.js";
import Role from "../../models/users/userRolesModel.js";
import RolePermission from "../../models/users/rolePermissionModel.js";
import PermissionModule from "../../models/users/permissionModuleModel.js";
import AppKey from "../../models/reference/appKeyModel.js";
import {getAppModules} from "../../utils/getAppModules.js";

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

const normalizeModule=value=>{
 return String(value||"").trim().toLowerCase();
};

const normalizePermissionBooleans=body=>{
 const payload={};

 ["create","read","update","delete","admin"].forEach(field=>{
  if(body[field]!==undefined)payload[field]=!!body[field];
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

const ensurePermissionModule=async({businessId,module})=>{
 let permissionModule=await PermissionModule.findOne({business:businessId,key:module,isActive:true}).select("_id key");

 if(permissionModule)
 {
  return permissionModule;
 }

 const appKeyRecord=await AppKey.findOne({businessRef:businessId,isActive:true}).select("appKey");

 if(!appKeyRecord?.appKey)
 {
  return null;
 }

 const appModule=getAppModules(appKeyRecord.appKey).find(item=>String(item.value||"").trim().toLowerCase()===module);

 if(!appModule)
 {
  return null;
 }

 const created=await PermissionModule.findOneAndUpdate(
  {business:businessId,key:module},
  {
   business:businessId,
   key:module,
   label:String(appModule.label||appModule.value||module).trim(),
   path:"",
   group:"App",
   description:"",
   isActive:true
  },
  {returnDocument:"after",upsert:true,setDefaultsOnInsert:true}
 ).select("_id key");

 return created;
};

const populateRolePermission=query=>{
 return query
  .populate({
   path:"business",
   model:Business
  })
  .populate({
   path:"role",
   model:Role
  });
};

const validateBusinessRoleAndModule=async({businessId,roleId,module})=>{
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

 const [business,role,permissionModule]=await Promise.all([
  Business.findById(businessId).select("_id"),
  Role.findById(roleId).select("_id business"),
  ensurePermissionModule({businessId,module})
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
  return {status:404,message:"Permission module not found or inactive"};
 }

 return {business,role,permissionModule};
};

export const createRolePermission=async(req,res)=>{
 try
 {
  const businessId=normalizeId(req.body.business);
  const roleId=normalizeId(req.body.role);
  const module=normalizeModule(req.body.module);

  const validation=await validateBusinessRoleAndModule({businessId,roleId,module});

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

  return res.status(500).json({
   success:false,
   message:error.message||"Failed to create role permission"
  });
 }
};

export const getRolePermissions=async(req,res)=>{
 try
 {
  const businessId=normalizeId(req.query.business);
  const roleId=normalizeId(req.query.role);
  const module=normalizeModule(req.query.module);
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
  return res.status(500).json({
   success:false,
   message:error.message||"Failed to fetch role permissions"
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
  return res.status(500).json({
   success:false,
   message:error.message||"Failed to fetch role permission"
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
  const nextModule=req.body.module!==undefined?normalizeModule(req.body.module):normalizeModule(doc.module);

  const validation=await validateBusinessRoleAndModule({
   businessId:nextBusinessId,
   roleId:nextRoleId,
   module:nextModule
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

  return res.status(500).json({
   success:false,
   message:error.message||"Failed to update role permission"
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
  return res.status(500).json({
   success:false,
   message:error.message||"Failed to delete role permission"
  });
 }
};
