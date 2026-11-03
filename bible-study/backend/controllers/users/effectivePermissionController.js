// backend/controllers/users/effectivePermissionController.js
import mongoose from "mongoose";
import User from "../../models/users/userModel.js";
import Business from "../../models/reference/businessModel.js";
import UserRoleAssignment from "../../models/users/userRoleAssignmentModel.js";
import UserDepartmentAssignment from "../../models/users/userDepartmentAssignmentModel.js";
import RolePermission from "../../models/users/rolePermissionModel.js";
import UserPermissionOverride from "../../models/users/userPermissionOverrideModel.js";

const normalizeId=(v)=>{
 if(!v)return null;
 if(typeof v==="string")return v.trim();
 if(typeof v==="object")
 {
  if(v._id?.$oid)return String(v._id.$oid);
  if(v._id)return String(v._id);
  if(v.$oid)return String(v.$oid);
 }
 return String(v);
};

const resolveBusinessId=async({userId,businessId})=>{
 if(businessId)
 {
  if(!mongoose.Types.ObjectId.isValid(businessId))
  {
   return {status:400,message:"Invalid business id"};
  }

  const business=await Business.findById(businessId).select("_id").lean();

  if(!business)
  {
   return {status:404,message:"Business not found"};
  }

  return {businessId:String(business._id)};
 }

 const [roleAssignment,departmentAssignment]=await Promise.all([
  UserRoleAssignment.findOne({user:userId,isActive:true}).select("business").sort({createdAt:-1}).lean(),
  UserDepartmentAssignment.findOne({user:userId,isActive:true}).select("business").sort({isPrimary:-1,createdAt:-1}).lean()
 ]);

 const resolvedBusinessId=normalizeId(departmentAssignment?.business)||normalizeId(roleAssignment?.business);

 if(resolvedBusinessId&&mongoose.Types.ObjectId.isValid(resolvedBusinessId))
 {
  return {businessId:resolvedBusinessId};
 }

 return {businessId:null};
};

export const getEffectivePermissions=async(req,res)=>{
 try{
  const userId=normalizeId(req.query.user);
  const requestedBusinessId=normalizeId(req.query.business);

  if(!userId)
   return res.status(400).json({success:false,message:"User is required"});

  if(!mongoose.Types.ObjectId.isValid(userId))
   return res.status(400).json({success:false,message:"Invalid user id"});

  const u=await User.findById(userId).select("_id");

  if(!u)return res.status(404).json({success:false,message:"user not found"});

  const businessResolution=await resolveBusinessId({userId,businessId:requestedBusinessId});

  if(businessResolution.status)
  {
   return res.status(businessResolution.status).json({
    success:false,
    message:businessResolution.message
   });
  }

  const businessId=businessResolution.businessId;

  if(!businessId)
  {
   return res.status(200).json({
    success:true,
    business:null,
    data:[]
   });
  }

  const [assignments,departmentAssignments]=await Promise.all([
   UserRoleAssignment.find({user:userId,business:businessId,isActive:true}).select("role").lean(),
   UserDepartmentAssignment.find({user:userId,business:businessId,isActive:true})
    .populate({path:"department",select:"defaultRole"})
    .select("role department")
    .lean()
  ]);

  const roleIds=[
   ...assignments.map(a=>a.role),
   ...departmentAssignments.map(a=>a.role||a.department?.defaultRole)
  ].filter(Boolean);

  const rolePerms=roleIds.length
   ?await RolePermission.find({role:{$in:roleIds},business:businessId}).lean()
   :[];

  const overrides=await UserPermissionOverride.find({user:userId,business:businessId}).lean();

  const map={};

  rolePerms.forEach(p=>{
   if(!map[p.module])
    map[p.module]={module:p.module,create:false,read:false,update:false,delete:false,admin:false};

   ["create","read","update","delete","admin"].forEach(f=>{
    if(p[f])map[p.module][f]=true;
   });
  });

  overrides.forEach(o=>{
   if(!map[o.module])
    map[o.module]={module:o.module,create:false,read:false,update:false,delete:false,admin:false};

   ["create","read","update","delete","admin"].forEach(f=>{
    if(o[f]!==null)map[o.module][f]=o[f];
   });
  });

  return res.status(200).json({success:true,business:businessId,data:Object.values(map)});
 }catch(err){
  return res.status(500).json({success:false,message:"failed",error:err.message});
 }
};
