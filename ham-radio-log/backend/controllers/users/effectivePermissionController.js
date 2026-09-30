// backend/controllers/users/effectivePermissionController.js
import mongoose from "mongoose";
import User from "../../models/users/userModel.js";
import Business from "../../models/reference/businessModel.js";
import UserRoleAssignment from "../../models/users/userRoleAssignmentModel.js";
import UserDepartmentAssignment from "../../models/users/userDepartmentAssignmentModel.js";
import RolePermission from "../../models/users/rolePermissionModel.js";
import DepartmentPermission from "../../models/users/departmentPermissionModel.js";
import UserPermissionOverride from "../../models/users/userPermissionOverrideModel.js";

const normalizeId=(v)=>{
 if(!v)return null;
 if(typeof v==="string")return v.trim();
 if(typeof v==="object")
 {
  if(v._id)return String(v._id);
  if(v.$oid)return String(v.$oid);
  if(v._id?.$oid)return String(v._id.$oid);
 }
 return String(v);
};

export const getEffectivePermissions=async(req,res)=>{
 try{
  const userId=normalizeId(req.query.user);
  const businessId=normalizeId(req.query.business);

  if(!userId||!businessId)
   return res.status(400).json({success:false,message:"user and business required"});

  if(!mongoose.Types.ObjectId.isValid(userId)||!mongoose.Types.ObjectId.isValid(businessId))
   return res.status(400).json({success:false,message:"invalid ids"});

  const [u,b]=await Promise.all([
   User.findById(userId).select("_id"),
   Business.findById(businessId).select("_id")
  ]);

  if(!u)return res.status(404).json({success:false,message:"user not found"});
  if(!b)return res.status(404).json({success:false,message:"business not found"});

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

  const departmentIds=departmentAssignments.map(a=>a.department?._id||a.department).filter(Boolean);
  const [rolePerms,departmentPerms]=await Promise.all([
   roleIds.length
   ?await RolePermission.find({role:{$in:roleIds},business:businessId}).lean()
   :[],
   departmentIds.length
    ?DepartmentPermission.find({department:{$in:departmentIds},business:businessId}).lean()
    :[]
  ]);

  const overrides=await UserPermissionOverride.find({user:userId,business:businessId}).lean();

  const map={};

  [...rolePerms,...departmentPerms].forEach(p=>{
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

  return res.status(200).json({success:true,data:Object.values(map)});
 }catch(err){
  return res.status(500).json({success:false,message:"failed",error:err.message});
 }
};
