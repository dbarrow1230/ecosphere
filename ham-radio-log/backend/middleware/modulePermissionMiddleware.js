import mongoose from "mongoose";
import Role from "../models/users/userRolesModel.js";
import UserRoleAssignment from "../models/users/userRoleAssignmentModel.js";
import UserDepartmentAssignment from "../models/users/userDepartmentAssignmentModel.js";
import RolePermission from "../models/users/rolePermissionModel.js";
import DepartmentPermission from "../models/users/departmentPermissionModel.js";
import UserPermissionOverride from "../models/users/userPermissionOverrideModel.js";

const getId=value=>String(value?._id||value?.$oid||value||"").trim();
const privilegedNames=new Set(["owner","business owner","app owner","super admin","admin","administrator"]);

export const requireModulePermission=(module,action)=>async(req,res,next)=>{
 try{
  const businessId=getId(req.body?.business||req.query?.business);
  const userId=getId(req.user?._id);
  if(!mongoose.Types.ObjectId.isValid(businessId))return res.status(400).json({message:"Valid business is required"});

  const [roleAssignments,departmentAssignments]=await Promise.all([
   UserRoleAssignment.find({user:userId,business:businessId,isActive:true}).select("role").lean(),
   UserDepartmentAssignment.find({user:userId,business:businessId,isActive:true}).populate({path:"department",select:"defaultRole"}).select("role department").lean()
  ]);
  const roleIds=[req.user?.role,...roleAssignments.map(item=>item.role),...departmentAssignments.map(item=>item.role||item.department?.defaultRole)].filter(Boolean);
  const roles=roleIds.length?await Role.find({_id:{$in:roleIds},business:businessId}).select("name").lean():[];
  if(roles.some(role=>privilegedNames.has(String(role.name||"").trim().toLowerCase())))return next();

  const departmentIds=departmentAssignments.map(item=>item.department?._id||item.department).filter(Boolean);
  const [rolePermissions,departmentPermissions,override]=await Promise.all([
   roleIds.length?RolePermission.find({business:businessId,role:{$in:roleIds},module}).lean():[],
   departmentIds.length?DepartmentPermission.find({business:businessId,department:{$in:departmentIds},module}).lean():[],
   UserPermissionOverride.findOne({business:businessId,user:userId,module}).lean()
  ]);
  let allowed=[...rolePermissions,...departmentPermissions].some(permission=>permission.admin||permission[action]);
  if(override?.admin!==null&&override?.admin!==undefined)allowed=override.admin;
  if(override?.[action]!==null&&override?.[action]!==undefined)allowed=override[action];
  if(!allowed)return res.status(403).json({message:`You do not have ${action} permission for this page.`});
  return next();
 }catch(error){
  return res.status(500).json({message:"Failed to verify permission",error:error.message});
 }
};
