// backend/controllers/users/effectivePermissionController.js
import mongoose from "mongoose";
import User from "../../models/users/userModel.js";
import Business from "../../models/reference/businessModel.js";
import Role from "../../models/users/roleModel.js";
import BusinessDepartment from "../../models/users/businessDepartmentModel.js";
import UserRoleAssignment from "../../models/users/userRoleAssignmentModel.js";
import UserDepartmentAssignment from "../../models/users/userDepartmentAssignmentModel.js";
import RolePermission from "../../models/users/rolePermissionModel.js";
import UserPermissionOverride from "../../models/users/userPermissionOverrideModel.js";

const normalizeId=value=>{
 if(value===undefined||value===null||value==="")return null;

 if(typeof value==="string")return value.trim();

 if(typeof value==="object"){
  if(typeof value._id?.$oid==="string")return value._id.$oid.trim();
  if(typeof value._id==="string")return value._id.trim();
  if(typeof value.id?.$oid==="string")return value.id.$oid.trim();
  if(typeof value.id==="string")return value.id.trim();
  if(typeof value.$oid==="string")return value.$oid.trim();
 }

 return String(value).trim();
};

const normalizeKey=value=>{
 return String(value||"").trim().toLowerCase();
};

const emptyPermission=()=>({
 create:false,
 read:false,
 update:false,
 delete:false,
 admin:false
});

const fullPermission=()=>({
 create:true,
 read:true,
 update:true,
 delete:true,
 admin:true
});

const applyOverride=(base,override)=>{
 if(!override)return base;

 const next={...base};

 ["create","read","update","delete","admin"].forEach(field=>{
  if(override[field]!==null&&override[field]!==undefined)next[field]=!!override[field];
 });

 if(next.admin){
  next.create=true;
  next.read=true;
  next.update=true;
  next.delete=true;
 }

 return next;
};

const validateBase=async({userId,businessId,module})=>{
 if(!userId)return {status:400,message:"User is required"};
 if(!businessId)return {status:400,message:"Business is required"};
 if(!module)return {status:400,message:"Module is required"};

 if(!mongoose.Types.ObjectId.isValid(userId))return {status:400,message:"Invalid user id"};
 if(!mongoose.Types.ObjectId.isValid(businessId))return {status:400,message:"Invalid business id"};

 const [user,business]=await Promise.all([
  User.findById(userId).select("_id username email isActive").lean(),
  Business.findById(businessId).select("_id").lean()
 ]);

 if(!user)return {status:404,message:"User not found"};
 if(!business)return {status:404,message:"Business not found"};
 if(user.isActive===false)return {status:403,message:"User is inactive"};

 return {user,business};
};

const resolvePermission=async({userId,businessId,module,departmentId=null})=>{
 const validation=await validateBase({userId,businessId,module});

 if(validation.status)return {
  allowed:false,
  permissions:emptyPermission(),
  status:validation.status,
  message:validation.message
 };

 if(departmentId&&!mongoose.Types.ObjectId.isValid(departmentId))return {
  allowed:false,
  permissions:emptyPermission(),
  status:400,
  message:"Invalid department id"
 };

 const businessRoleAssignment=await UserRoleAssignment.findOne({
  user:userId,
  business:businessId,
  isActive:true
 }).populate({path:"role",model:Role}).lean();

 if(!businessRoleAssignment?.role)return {
  allowed:false,
  permissions:emptyPermission(),
  status:403,
  message:"User has no business role assignment"
 };

 const businessRoleName=normalizeKey(businessRoleAssignment.role.name);

 let effectiveRole=businessRoleAssignment.role;
 let departmentAssignment=null;
 let department=null;

 if(businessRoleName==="owner"){
  let permissions=fullPermission();

  const override=await UserPermissionOverride.findOne({
   user:userId,
   business:businessId,
   department:departmentId||null,
   module,
   isActive:true
  }).lean();

  permissions=applyOverride(permissions,override);

  return {
   allowed:true,
   permissions,
   role:effectiveRole,
   businessRoleAssignment,
   departmentAssignment:null,
   source:"owner"
  };
 }

 if(departmentId){
  department=await BusinessDepartment.findById(departmentId)
   .populate({path:"defaultRole",model:Role})
   .lean();

  if(!department)return {
   allowed:false,
   permissions:emptyPermission(),
   status:404,
   message:"Department not found"
  };

  if(String(department.business)!==String(businessId))return {
   allowed:false,
   permissions:emptyPermission(),
   status:400,
   message:"Department does not belong to the selected business"
  };

  departmentAssignment=await UserDepartmentAssignment.findOne({
   user:userId,
   business:businessId,
   department:departmentId,
   isActive:true
  }).populate({path:"roleOverride",model:Role}).lean();

  if(!departmentAssignment&&businessRoleName!=="admin")return {
   allowed:false,
   permissions:emptyPermission(),
   status:403,
   message:"User is not assigned to this department"
  };

  if(departmentAssignment?.roleOverride)effectiveRole=departmentAssignment.roleOverride;
  else if(department?.defaultRole)effectiveRole=department.defaultRole;
 }

 const rolePermission=await RolePermission.findOne({
  business:businessId,
  role:effectiveRole._id,
  module
 }).lean();

 let permissions=rolePermission?{
  create:!!rolePermission.create,
  read:!!rolePermission.read,
  update:!!rolePermission.update,
  delete:!!rolePermission.delete,
  admin:!!rolePermission.admin
 }:emptyPermission();

 if(permissions.admin){
  permissions.create=true;
  permissions.read=true;
  permissions.update=true;
  permissions.delete=true;
 }

 const [departmentOverride,businessOverride]=await Promise.all([
  departmentId?UserPermissionOverride.findOne({
   user:userId,
   business:businessId,
   department:departmentId,
   module,
   isActive:true
  }).lean():null,
  UserPermissionOverride.findOne({
   user:userId,
   business:businessId,
   department:null,
   module,
   isActive:true
  }).lean()
 ]);

 permissions=applyOverride(permissions,businessOverride);
 permissions=applyOverride(permissions,departmentOverride);

 return {
  allowed:Object.values(permissions).some(Boolean),
  permissions,
  role:effectiveRole,
  businessRoleAssignment,
  departmentAssignment,
  source:departmentId?"department":"business-role"
 };
};

export const getEffectivePermission=async(req,res)=>{
 try{
  const userId=normalizeId(req.query.user||req.params.userId);
  const businessId=normalizeId(req.query.business||req.params.businessId);
  const departmentId=normalizeId(req.query.department||req.params.departmentId);
  const module=normalizeKey(req.query.module||req.params.module);

  const result=await resolvePermission({
   userId,
   businessId,
   departmentId,
   module
  });

  if(result.status)return res.status(result.status).json({
   success:false,
   message:result.message,
   data:{
    allowed:false,
    permissions:result.permissions
   }
  });

  return res.status(200).json({
   success:true,
   data:result
  });
 }catch(error){
  console.error("getEffectivePermission error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to resolve effective permission",
   error:error.message
  });
 }
};

export const checkEffectivePermission=async(req,res)=>{
 try{
  const userId=normalizeId(req.body.user||req.query.user);
  const businessId=normalizeId(req.body.business||req.query.business);
  const departmentId=normalizeId(req.body.department||req.query.department);
  const module=normalizeKey(req.body.module||req.query.module);
  const action=normalizeKey(req.body.action||req.query.action||"read");

  const result=await resolvePermission({
   userId,
   businessId,
   departmentId,
   module
  });

  if(result.status)return res.status(result.status).json({
   success:false,
   message:result.message,
   data:{
    allowed:false,
    action,
    permissions:result.permissions
   }
  });

  const allowed=!!result.permissions[action];

  return res.status(200).json({
   success:true,
   data:{
    ...result,
    action,
    allowed
   }
  });
 }catch(error){
  console.error("checkEffectivePermission error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to check effective permission",
   error:error.message
  });
 }
};

export const getEffectivePermissions=async(req,res)=>{
 try{
  const userId=normalizeId(req.query.user);
  const businessId=normalizeId(req.query.business);
  const departmentId=normalizeId(req.query.department);
  const modules=String(req.query.modules||req.query.module||"")
   .split(",")
   .map(item=>normalizeKey(item))
   .filter(Boolean);

  if(!modules.length)return res.status(400).json({
   success:false,
   message:"At least one module is required"
  });

  const data=[];

  for(const module of modules){
   const result=await resolvePermission({
    userId,
    businessId,
    departmentId,
    module
   });

   data.push({
    module,
    allowed:result.allowed||false,
    permissions:result.permissions||emptyPermission(),
    role:result.role||null,
    source:result.source||null,
    message:result.message||""
   });
  }

  return res.status(200).json({
   success:true,
   count:data.length,
   data
  });
 }catch(error){
  console.error("getEffectivePermissions error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to resolve effective permissions",
   error:error.message
  });
 }
};