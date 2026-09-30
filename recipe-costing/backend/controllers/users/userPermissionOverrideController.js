// backend/controllers/users/userPermissionOverrideController.js
import mongoose from "mongoose";
import User from "../../models/users/userModel.js";
import Business from "../../models/reference/businessModel.js";
import AppKey from "../../models/reference/appKeyModel.js";
import BusinessDepartment from "../../models/users/businessDepartmentModel.js";
import PermissionModule from "../../models/users/permissionModuleModel.js";
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

const normalizeString=value=>{
 return String(value||"").trim();
};

const normalizeOverrideBoolean=value=>{
 if(value===undefined)return undefined;
 if(value===null||value==="")return null;
 return value===true||value==="true"||value===1||value==="1";
};

const populateOverride=query=>{
 return query
  .populate({path:"user",model:User,select:"username email isActive"})
  .populate({path:"business",model:Business})
  .populate({path:"department",model:BusinessDepartment});
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

const validateOverride=async({userId,businessId,departmentId,module,appKey})=>{
 if(!userId)return {status:400,message:"User is required"};
 if(!businessId)return {status:400,message:"Business is required"};
 if(!module)return {status:400,message:"Module is required"};

 if(!mongoose.Types.ObjectId.isValid(userId))return {status:400,message:"Invalid user id"};
 if(!mongoose.Types.ObjectId.isValid(businessId))return {status:400,message:"Invalid business id"};
 if(departmentId&&!mongoose.Types.ObjectId.isValid(departmentId))return {status:400,message:"Invalid department id"};

 const resolvedAppKey=await resolveAppKey({businessId,appKey});

 if(!resolvedAppKey)return {status:400,message:"App key is required"};

 const [user,business,department,permissionModule]=await Promise.all([
  User.findById(userId).select("_id"),
  Business.findById(businessId).select("_id"),
  departmentId?BusinessDepartment.findById(departmentId).select("_id business"):null,
  PermissionModule.findOne({appKey:resolvedAppKey,key:module,isActive:true}).select("_id appKey key")
 ]);

 if(!user)return {status:404,message:"User not found"};
 if(!business)return {status:404,message:"Business not found"};
 if(departmentId&&!department)return {status:404,message:"Department not found"};
 if(department&&String(department.business)!==String(businessId))return {status:400,message:"Department does not belong to the selected business"};
 if(!permissionModule)return {status:404,message:"Permission module not found or inactive for this app"};

 return {user,business,department,permissionModule,appKey:resolvedAppKey};
};

export const createUserPermissionOverride=async(req,res)=>{
 try{
  const userId=normalizeId(req.body.user);
  const businessId=normalizeId(req.body.business);
  const departmentId=normalizeId(req.body.department);
  const module=normalizeKey(req.body.module);
  const appKey=normalizeKey(req.body.appKey);
  const reason=normalizeString(req.body.reason);
  const isActive=req.body.isActive===undefined?true:!!req.body.isActive;

  const validation=await validateOverride({
   userId,
   businessId,
   departmentId,
   module,
   appKey
  });

  if(validation.status)return res.status(validation.status).json({success:false,message:validation.message});

  const doc=await UserPermissionOverride.create({
   user:userId,
   business:businessId,
   department:departmentId||null,
   module,
   create:normalizeOverrideBoolean(req.body.create)??null,
   read:normalizeOverrideBoolean(req.body.read)??null,
   update:normalizeOverrideBoolean(req.body.update)??null,
   delete:normalizeOverrideBoolean(req.body.delete)??null,
   admin:normalizeOverrideBoolean(req.body.admin)??null,
   reason,
   isActive
  });

  const populated=await populateOverride(UserPermissionOverride.findById(doc._id));

  return res.status(201).json({
   success:true,
   message:"User permission override created successfully",
   data:populated
  });
 }catch(error){
  if(error.code===11000)return res.status(409).json({success:false,message:"Permission override already exists for this user, business, department, and module"});

  console.error("createUserPermissionOverride error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to create user permission override",
   error:error.message
  });
 }
};

export const getUserPermissionOverrides=async(req,res)=>{
 try{
  const userId=normalizeId(req.query.user);
  const businessId=normalizeId(req.query.business);
  const departmentId=normalizeId(req.query.department);
  const module=normalizeKey(req.query.module);
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

  if(module)query.module=module;
  if(isActive!==undefined)query.isActive=isActive==="true";

  const data=await populateOverride(
   UserPermissionOverride.find(query).sort({module:1,createdAt:-1})
  );

  return res.status(200).json({
   success:true,
   count:data.length,
   data
  });
 }catch(error){
  console.error("getUserPermissionOverrides error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to fetch user permission overrides",
   error:error.message
  });
 }
};

export const getUserPermissionOverrideById=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid permission override id"});

  const doc=await populateOverride(UserPermissionOverride.findById(id));

  if(!doc)return res.status(404).json({success:false,message:"User permission override not found"});

  return res.status(200).json({
   success:true,
   data:doc
  });
 }catch(error){
  console.error("getUserPermissionOverrideById error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to fetch user permission override",
   error:error.message
  });
 }
};

export const updateUserPermissionOverride=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid permission override id"});

  const doc=await UserPermissionOverride.findById(id);

  if(!doc)return res.status(404).json({success:false,message:"User permission override not found"});

  const nextUserId=req.body.user!==undefined?normalizeId(req.body.user):normalizeId(doc.user);
  const nextBusinessId=req.body.business!==undefined?normalizeId(req.body.business):normalizeId(doc.business);
  const nextDepartmentId=req.body.department!==undefined?normalizeId(req.body.department):normalizeId(doc.department);
  const nextModule=req.body.module!==undefined?normalizeKey(req.body.module):normalizeKey(doc.module);
  const appKey=normalizeKey(req.body.appKey||req.query.appKey);

  const validation=await validateOverride({
   userId:nextUserId,
   businessId:nextBusinessId,
   departmentId:nextDepartmentId,
   module:nextModule,
   appKey
  });

  if(validation.status)return res.status(validation.status).json({success:false,message:validation.message});

  if(req.body.user!==undefined)doc.user=nextUserId;
  if(req.body.business!==undefined)doc.business=nextBusinessId;
  if(req.body.department!==undefined)doc.department=nextDepartmentId||null;
  if(req.body.module!==undefined)doc.module=nextModule;
  if(req.body.reason!==undefined)doc.reason=normalizeString(req.body.reason);
  if(req.body.isActive!==undefined)doc.isActive=!!req.body.isActive;

  ["create","read","update","delete","admin"].forEach(field=>{
   if(req.body[field]!==undefined)doc[field]=normalizeOverrideBoolean(req.body[field]);
  });

  await doc.save();

  const updated=await populateOverride(UserPermissionOverride.findById(id));

  return res.status(200).json({
   success:true,
   message:"User permission override updated successfully",
   data:updated
  });
 }catch(error){
  if(error.code===11000)return res.status(409).json({success:false,message:"Permission override already exists for this user, business, department, and module"});

  console.error("updateUserPermissionOverride error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to update user permission override",
   error:error.message
  });
 }
};

export const deleteUserPermissionOverride=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid permission override id"});

  const doc=await UserPermissionOverride.findByIdAndDelete(id);

  if(!doc)return res.status(404).json({success:false,message:"User permission override not found"});

  return res.status(200).json({
   success:true,
   message:"User permission override deleted successfully"
  });
 }catch(error){
  console.error("deleteUserPermissionOverride error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to delete user permission override",
   error:error.message
  });
 }
};