// backend/middleware/permissionMiddleware.js
import mongoose from "mongoose";
import Role from "../models/users/roleModel.js";
import BusinessDepartment from "../models/users/businessDepartmentModel.js";
import UserRoleAssignment from "../models/users/userRoleAssignmentModel.js";
import UserDepartmentAssignment from "../models/users/userDepartmentAssignmentModel.js";
import RolePermission from "../models/users/rolePermissionModel.js";
import UserPermissionOverride from "../models/users/userPermissionOverrideModel.js";

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
  if(override[field]!==null&&override[field]!==undefined)
   next[field]=!!override[field];
 });

 if(next.admin){
  next.create=true;
  next.read=true;
  next.update=true;
  next.delete=true;
 }

 return next;
};

export const resolveEffectivePermission=async({userId,businessId,departmentId=null,module})=>{
 if(!userId)return {allowed:false,permissions:emptyPermission(),status:401,message:"User is required"};
 if(!businessId)return {allowed:false,permissions:emptyPermission(),status:400,message:"Business is required"};
 if(!module)return {allowed:false,permissions:emptyPermission(),status:400,message:"Module is required"};

 if(!mongoose.Types.ObjectId.isValid(userId))return {allowed:false,permissions:emptyPermission(),status:400,message:"Invalid user id"};
 if(!mongoose.Types.ObjectId.isValid(businessId))return {allowed:false,permissions:emptyPermission(),status:400,message:"Invalid business id"};
 if(departmentId&&!mongoose.Types.ObjectId.isValid(departmentId))return {allowed:false,permissions:emptyPermission(),status:400,message:"Invalid department id"};

 const businessRoleAssignment=await UserRoleAssignment.findOne({
  user:userId,
  business:businessId,
  isActive:true
 }).populate({path:"role",model:Role}).lean();

 if(!businessRoleAssignment?.role)
  return {allowed:false,permissions:emptyPermission(),status:403,message:"User has no business role assignment"};

 const businessRoleName=normalizeKey(businessRoleAssignment.role.name);

 let effectiveRole=businessRoleAssignment.role;
 let departmentAssignment=null;

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
  const department=await BusinessDepartment.findById(departmentId)
   .populate({path:"defaultRole",model:Role})
   .lean();

  if(!department)
   return {allowed:false,permissions:emptyPermission(),status:404,message:"Department not found"};

  if(String(department.business)!==String(businessId))
   return {allowed:false,permissions:emptyPermission(),status:400,message:"Department does not belong to the selected business"};

  departmentAssignment=await UserDepartmentAssignment.findOne({
   user:userId,
   business:businessId,
   department:departmentId,
   isActive:true
  }).populate({path:"roleOverride",model:Role}).lean();

  if(!departmentAssignment&&businessRoleName!=="admin")
   return {allowed:false,permissions:emptyPermission(),status:403,message:"User is not assigned to this department"};

  if(departmentAssignment?.roleOverride)
   effectiveRole=departmentAssignment.roleOverride;
  else if(department?.defaultRole)
   effectiveRole=department.defaultRole;
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

 const [businessOverride,departmentOverride]=await Promise.all([
  UserPermissionOverride.findOne({
   user:userId,
   business:businessId,
   department:null,
   module,
   isActive:true
  }).lean(),
  departmentId?UserPermissionOverride.findOne({
   user:userId,
   business:businessId,
   department:departmentId,
   module,
   isActive:true
  }).lean():null
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

export const authorizePermission=(module,action="read")=>{
 return async(req,res,next)=>{
  try{
   if(!req.user)
    return res.status(401).json({success:false,message:"Not authenticated"});

   const userId=String(req.user._id);
   const businessId=normalizeId(req.params.business||req.body.business||req.query.business);
   const departmentId=normalizeId(req.params.department||req.body.department||req.query.department);
   const moduleKey=normalizeKey(module);
   const actionKey=normalizeKey(action);

   const result=await resolveEffectivePermission({
    userId,
    businessId,
    departmentId,
    module:moduleKey
   });

   if(result.status)
    return res.status(result.status).json({success:false,message:result.message});

   if(!result.permissions[actionKey]&&!result.permissions.admin)
    return res.status(403).json({success:false,message:"Access denied: insufficient permissions"});

   req.permission=result;
   next();
  }catch(error){
   return res.status(500).json({
    success:false,
    message:"Failed to authorize permission",
    error:error.message
   });
  }
 };
};