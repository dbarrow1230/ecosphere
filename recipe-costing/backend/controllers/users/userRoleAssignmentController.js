// backend/controllers/users/userRoleAssignmentController.js
import mongoose from "mongoose";
import User from "../../models/users/userModel.js";
import Role from "../../models/users/roleModel.js";
import Business from "../../models/reference/businessModel.js";
import UserRoleAssignment from "../../models/users/userRoleAssignmentModel.js";

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

const populateAssignment=query=>{
 return query
  .populate({
   path:"user",
   model:User,
   select:"username email isActive details lastLogin"
  })
  .populate({
   path:"business",
   model:Business
  })
  .populate({
   path:"role",
   model:Role
  });
};

const validateUserBusinessRole=async({userId,businessId,roleId})=>{
 if(!userId)return {status:400,message:"User is required"};
 if(!businessId)return {status:400,message:"Business is required"};
 if(!roleId)return {status:400,message:"Role is required"};

 if(!mongoose.Types.ObjectId.isValid(userId))return {status:400,message:"Invalid user id"};
 if(!mongoose.Types.ObjectId.isValid(businessId))return {status:400,message:"Invalid business id"};
 if(!mongoose.Types.ObjectId.isValid(roleId))return {status:400,message:"Invalid role id"};

 const [user,business,role]=await Promise.all([
  User.findById(userId).select("_id"),
  Business.findById(businessId).select("_id"),
  Role.findById(roleId).select("_id business")
 ]);

 if(!user)return {status:404,message:"User not found"};
 if(!business)return {status:404,message:"Business not found"};
 if(!role)return {status:404,message:"Role not found"};
 if(String(role.business)!==String(businessId))return {status:400,message:"Role does not belong to the selected business"};

 return {user,business,role};
};

export const createUserRoleAssignment=async(req,res)=>{
 try{
  const userId=normalizeId(req.body.user);
  const businessId=normalizeId(req.body.business);
  const roleId=normalizeId(req.body.role);
  const isPrimary=req.body.isPrimary===undefined?true:!!req.body.isPrimary;
  const isActive=req.body.isActive===undefined?true:!!req.body.isActive;

  const validation=await validateUserBusinessRole({userId,businessId,roleId});

  if(validation.status)return res.status(validation.status).json({
   success:false,
   message:validation.message
  });

  const assignment=await UserRoleAssignment.create({
   user:userId,
   business:businessId,
   role:roleId,
   isPrimary,
   isActive
  });

  const populated=await populateAssignment(UserRoleAssignment.findById(assignment._id));

  return res.status(201).json({
   success:true,
   message:"User role assignment created successfully",
   data:populated
  });
 }catch(error){
  if(error.code===11000)return res.status(409).json({
   success:false,
   message:"User already has a role assignment for this business"
  });

  console.error("createUserRoleAssignment error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to create user role assignment",
   error:error.message
  });
 }
};

export const getUserRoleAssignments=async(req,res)=>{
 try{
  const userId=normalizeId(req.query.user);
  const businessId=normalizeId(req.query.business);
  const roleId=normalizeId(req.query.role);
  const isPrimary=req.query.isPrimary;
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

  if(roleId){
   if(!mongoose.Types.ObjectId.isValid(roleId))return res.status(400).json({success:false,message:"Invalid role id"});
   query.role=roleId;
  }

  if(isPrimary!==undefined)query.isPrimary=isPrimary==="true";
  if(isActive!==undefined)query.isActive=isActive==="true";

  const assignments=await populateAssignment(
   UserRoleAssignment.find(query).sort({isPrimary:-1,createdAt:-1})
  );

  return res.status(200).json({
   success:true,
   count:assignments.length,
   data:assignments
  });
 }catch(error){
  console.error("getUserRoleAssignments error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to fetch user role assignments",
   error:error.message
  });
 }
};

export const getUserRoleAssignmentById=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({
   success:false,
   message:"Invalid assignment id"
  });

  const assignment=await populateAssignment(UserRoleAssignment.findById(id));

  if(!assignment)return res.status(404).json({
   success:false,
   message:"User role assignment not found"
  });

  return res.status(200).json({
   success:true,
   data:assignment
  });
 }catch(error){
  console.error("getUserRoleAssignmentById error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to fetch user role assignment",
   error:error.message
  });
 }
};

export const updateUserRoleAssignment=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({
   success:false,
   message:"Invalid assignment id"
  });

  const assignment=await UserRoleAssignment.findById(id);

  if(!assignment)return res.status(404).json({
   success:false,
   message:"User role assignment not found"
  });

  const nextUserId=req.body.user!==undefined?normalizeId(req.body.user):normalizeId(assignment.user);
  const nextBusinessId=req.body.business!==undefined?normalizeId(req.body.business):normalizeId(assignment.business);
  const nextRoleId=req.body.role!==undefined?normalizeId(req.body.role):normalizeId(assignment.role);

  const validation=await validateUserBusinessRole({
   userId:nextUserId,
   businessId:nextBusinessId,
   roleId:nextRoleId
  });

  if(validation.status)return res.status(validation.status).json({
   success:false,
   message:validation.message
  });

  if(req.body.user!==undefined)assignment.user=nextUserId;
  if(req.body.business!==undefined)assignment.business=nextBusinessId;
  if(req.body.role!==undefined)assignment.role=nextRoleId;
  if(req.body.isPrimary!==undefined)assignment.isPrimary=!!req.body.isPrimary;
  if(req.body.isActive!==undefined)assignment.isActive=!!req.body.isActive;

  await assignment.save();

  const updated=await populateAssignment(UserRoleAssignment.findById(id));

  return res.status(200).json({
   success:true,
   message:"User role assignment updated successfully",
   data:updated
  });
 }catch(error){
  if(error.code===11000)return res.status(409).json({
   success:false,
   message:"User already has a role assignment for this business"
  });

  console.error("updateUserRoleAssignment error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to update user role assignment",
   error:error.message
  });
 }
};

export const deleteUserRoleAssignment=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({
   success:false,
   message:"Invalid assignment id"
  });

  const assignment=await UserRoleAssignment.findByIdAndDelete(id);

  if(!assignment)return res.status(404).json({
   success:false,
   message:"User role assignment not found"
  });

  return res.status(200).json({
   success:true,
   message:"User role assignment deleted successfully"
  });
 }catch(error){
  console.error("deleteUserRoleAssignment error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to delete user role assignment",
   error:error.message
  });
 }
};