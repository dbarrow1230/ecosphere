// backend/controllers/users/userDepartmentAssignmentController.js
import mongoose from "mongoose";
import User from "../../models/users/userModel.js";
import Business from "../../models/reference/businessModel.js";
import BusinessDepartment from "../../models/users/businessDepartmentModel.js";
import Role from "../../models/users/userRolesModel.js";
import UserDepartmentAssignment from "../../models/users/userDepartmentAssignmentModel.js";

const normalizeId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value.trim();
 if(typeof value==="object"){
  if(typeof value._id?.$oid==="string")return value._id.$oid;
  if(typeof value._id==="string")return value._id;
  if(typeof value.$oid==="string")return value.$oid;
 }
 return String(value).trim();
};

const populateAssignment=query=>{
 return query
  .populate({path:"user",model:User,select:"username email isActive details lastLogin"})
  .populate({path:"business",model:Business})
  .populate({path:"department",model:BusinessDepartment,populate:{path:"defaultRole",model:Role}})
  .populate({path:"role",model:Role});
};

const validateAssignment=async({userId,businessId,departmentId,roleId})=>{
 if(!mongoose.Types.ObjectId.isValid(userId))return {status:400,message:"Invalid user id"};
 if(!mongoose.Types.ObjectId.isValid(businessId))return {status:400,message:"Invalid business id"};
 if(!mongoose.Types.ObjectId.isValid(departmentId))return {status:400,message:"Invalid department id"};
 if(roleId&&!mongoose.Types.ObjectId.isValid(roleId))return {status:400,message:"Invalid role id"};

 const [user,business,department,role]=await Promise.all([
  User.findById(userId).select("_id"),
  Business.findById(businessId).select("_id"),
  BusinessDepartment.findById(departmentId).select("_id business defaultRole"),
  roleId?Role.findById(roleId).select("_id business"):null
 ]);

 if(!user)return {status:404,message:"User not found"};
 if(!business)return {status:404,message:"Business not found"};
 if(!department)return {status:404,message:"Department not found"};
 if(String(department.business)!==String(businessId))return {status:400,message:"Department does not belong to the selected business"};
 if(roleId&&!role)return {status:404,message:"Role not found"};
 if(role&&String(role.business)!==String(businessId))return {status:400,message:"Role does not belong to the selected business"};

 return {user,business,department,role};
};

export const createUserDepartmentAssignment=async(req,res)=>{
 try{
  const userId=normalizeId(req.body.user);
  const businessId=normalizeId(req.body.business);
  const departmentId=normalizeId(req.body.department);
  const roleId=normalizeId(req.body.role);
  const isPrimary=req.body.isPrimary===undefined?false:!!req.body.isPrimary;
  const isActive=req.body.isActive===undefined?true:!!req.body.isActive;

  if(!userId||!businessId||!departmentId){
   return res.status(400).json({success:false,message:"User, business, and department are required"});
  }

  const validation=await validateAssignment({userId,businessId,departmentId,roleId});
  if(validation.status)return res.status(validation.status).json({success:false,message:validation.message});

  const assignment=await UserDepartmentAssignment.create({
   user:userId,
   business:businessId,
   department:departmentId,
   role:roleId||null,
   isPrimary,
   isActive
  });

  const populated=await populateAssignment(UserDepartmentAssignment.findById(assignment._id));
  return res.status(201).json({success:true,message:"User department assignment created successfully",data:populated});
 }catch(error){
  if(error.code===11000)return res.status(409).json({success:false,message:"User already has this department for this business"});
  console.error("createUserDepartmentAssignment error",{
   message:error.message,
   name:error.name,
   code:error.code,
   errors:error.errors,
   body:req.body
  });
  return res.status(500).json({success:false,message:error.message||"Failed to create user department assignment",error:error.message});
 }
};

export const getUserDepartmentAssignments=async(req,res)=>{
 try{
  const userId=normalizeId(req.query.user);
  const businessId=normalizeId(req.query.business);
  const departmentId=normalizeId(req.query.department);
  const isActive=req.query.isActive;
  const query={};

  if(userId){
   if(!mongoose.Types.ObjectId.isValid(userId))return res.status(400).json({success:false,message:"Invalid user id"});
   query.user=userId;
  }

  if(businessId){
   if(!mongoose.Types.ObjectId.isValid(businessId))return res.status(400).json({success:false,message:"Invalid business id"});
   query.business=businessId;
  }

  if(departmentId){
   if(!mongoose.Types.ObjectId.isValid(departmentId))return res.status(400).json({success:false,message:"Invalid department id"});
   query.department=departmentId;
  }

  if(isActive!==undefined)query.isActive=isActive==="true";

  const assignments=await populateAssignment(UserDepartmentAssignment.find(query).sort({isPrimary:-1,createdAt:-1}));
  return res.status(200).json({success:true,count:assignments.length,data:assignments});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch user department assignments",error:error.message});
 }
};

export const getUserDepartmentAssignmentById=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid assignment id"});
  const assignment=await populateAssignment(UserDepartmentAssignment.findById(id));
  if(!assignment)return res.status(404).json({success:false,message:"User department assignment not found"});
  return res.status(200).json({success:true,data:assignment});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch user department assignment",error:error.message});
 }
};

export const updateUserDepartmentAssignment=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid assignment id"});

  const assignment=await UserDepartmentAssignment.findById(id);
  if(!assignment)return res.status(404).json({success:false,message:"User department assignment not found"});

  const nextUserId=req.body.user!==undefined?normalizeId(req.body.user):String(assignment.user);
  const nextBusinessId=req.body.business!==undefined?normalizeId(req.body.business):String(assignment.business);
  const nextDepartmentId=req.body.department!==undefined?normalizeId(req.body.department):String(assignment.department);
  const nextRoleId=req.body.role!==undefined?normalizeId(req.body.role):normalizeId(assignment.role);

  const validation=await validateAssignment({
   userId:nextUserId,
   businessId:nextBusinessId,
   departmentId:nextDepartmentId,
   roleId:nextRoleId
  });
  if(validation.status)return res.status(validation.status).json({success:false,message:validation.message});

  if(req.body.user!==undefined)assignment.user=nextUserId;
  if(req.body.business!==undefined)assignment.business=nextBusinessId;
  if(req.body.department!==undefined)assignment.department=nextDepartmentId;
  if(req.body.role!==undefined)assignment.role=nextRoleId||null;
  if(req.body.isPrimary!==undefined)assignment.isPrimary=!!req.body.isPrimary;
  if(req.body.isActive!==undefined)assignment.isActive=!!req.body.isActive;

  await assignment.save();
  const updated=await populateAssignment(UserDepartmentAssignment.findById(id));
  return res.status(200).json({success:true,message:"User department assignment updated successfully",data:updated});
 }catch(error){
  if(error.code===11000)return res.status(409).json({success:false,message:"User already has this department for this business"});
  console.error("updateUserDepartmentAssignment error",{
   message:error.message,
   name:error.name,
   code:error.code,
   errors:error.errors,
   body:req.body,
   params:req.params
  });
  return res.status(500).json({success:false,message:error.message||"Failed to update user department assignment",error:error.message});
 }
};

export const deleteUserDepartmentAssignment=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid assignment id"});
  const assignment=await UserDepartmentAssignment.findByIdAndDelete(id);
  if(!assignment)return res.status(404).json({success:false,message:"User department assignment not found"});
  return res.status(200).json({success:true,message:"User department assignment deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete user department assignment",error:error.message});
 }
};

