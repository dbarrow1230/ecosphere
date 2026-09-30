import crypto from "crypto";
import User from "../../models/users/userModel.js";
import AppKey from "../../models/reference/appKeyModel.js";
import Business from "../../models/reference/businessModel.js";
import Role from "../../models/users/userRolesModel.js";
import UserRoleAssignment from "../../models/users/userRoleAssignmentModel.js";
import UserDepartmentAssignment from "../../models/users/userDepartmentAssignmentModel.js";
import generateToken from "../../utils/generateToken.js";

const resolveAppBusiness=async appKeyValue=>{
 const appKey=String(appKeyValue||"").trim().toLowerCase();
 if(!appKey)return null;

 const appKeyRow=await AppKey.findOne({appKey,isActive:true}).lean();
 if(appKeyRow?.businessRef)return Business.findById(appKeyRow.businessRef).lean();

 return Business.findOne({
  $or:[{code:appKey},{code:appKey.replace(/-/g,"")},{legalName:{$regex:`^${appKey.replace(/[.*+?^${}()|[\]\\]/g,"\\$&").replace(/[-\s]+/g,"\\s*")}$`,$options:"i"}}],
  isActive:{$ne:false}
 }).lean();
};

const loadBusinessAccess=async(userId,businessId)=>{
 const [roleAssignments,departmentAssignments]=await Promise.all([
  UserRoleAssignment.find({user:userId,business:businessId,isActive:true}).populate({path:"role",model:Role}).lean(),
  UserDepartmentAssignment.find({user:userId,business:businessId,isActive:true})
   .populate({path:"role",model:Role})
   .populate({path:"department",populate:{path:"defaultRole",model:Role}})
   .lean()
 ]);

 return {roleAssignments,departmentAssignments};
};

const ensureFirstBusinessOwner=async(userId,businessId)=>{
 const currentAccess=await loadBusinessAccess(userId,businessId);
 if(currentAccess.roleAssignments.length||currentAccess.departmentAssignments.length)return currentAccess;

 const [roleAssignmentCount,departmentAssignmentCount]=await Promise.all([
  UserRoleAssignment.countDocuments({business:businessId,isActive:true}),
  UserDepartmentAssignment.countDocuments({business:businessId,isActive:true})
 ]);

 if(roleAssignmentCount||departmentAssignmentCount)return currentAccess;

 let ownerRole=await Role.findOne({business:businessId,name:{$in:["owner","business owner","app owner","super admin"]},isActive:true});

 if(!ownerRole){
  ownerRole=await Role.create({
   business:businessId,
   name:"owner",
   description:"Initial business owner with administration access.",
   isDefault:true,
   isActive:true
  });
 }

 await UserRoleAssignment.create({user:userId,business:businessId,role:ownerRole._id,isActive:true});
 return loadBusinessAccess(userId,businessId);
};

const buildBusinessUser=({user,business,businessAccess,lastLogin=user.lastLogin})=>{
 const primaryRole=businessAccess.roleAssignments[0]?.role||
  businessAccess.departmentAssignments[0]?.role||
  businessAccess.departmentAssignments[0]?.department?.defaultRole||
  user.role||null;

 return{
  _id:user._id,
  username:user.username,
  email:user.email,
  role:primaryRole,
  details:user.details,
  isActive:user.isActive,
  lastLogin,
  roleAssignments:businessAccess.roleAssignments,
  userRoleAssignments:businessAccess.roleAssignments,
  departmentAssignments:businessAccess.departmentAssignments,
  userDepartmentAssignments:businessAccess.departmentAssignments,
  currentBusiness:business?._id||null
 };
};

export const ensureBusinessAccess=async(req,res)=>{
 try{
  const business=await resolveAppBusiness(req.body.appKey);

  if(!business){
   return res.status(404).json({success:false,message:"App business not found"});
  }

  const businessAccess=await ensureFirstBusinessOwner(req.user._id,business._id);
  const user=await User.findById(req.user._id).populate("details");

  return res.status(200).json({
   success:true,
   user:buildBusinessUser({user,business,businessAccess})
  });
 }catch(error){
  console.error("ensureBusinessAccess error:",error);
  return res.status(500).json({success:false,message:"Failed to load business access",error:error.message});
 }
};

export const loginUser=async(req,res)=>{
 try
 {
  const {username,password,appKey}=req.body;

  if(!username||!password)
  {
   return res.status(400).json({
    success:false,
    message:"Username and password are required"
   });
  }

  const user=await User.findOne({username})
   .select("+password")
   .populate("details");

  if(!user)
  {
   return res.status(401).json({
    success:false,
    message:"Invalid username or password"
   });
  }

  const isMatch=await user.matchPassword(password);

  if(!isMatch)
  {
   return res.status(401).json({
    success:false,
    message:"Invalid username or password"
   });
  }

  if(!user.isActive)
  {
   return res.status(403).json({
    success:false,
    message:"Account is inactive"
   });
  }

  if(!process.env.JWT_SECRET)
  {
   return res.status(500).json({
    success:false,
    message:"JWT_SECRET is missing from environment"
   });
  }

  const business=await resolveAppBusiness(appKey);
  const businessAccess=business?await ensureFirstBusinessOwner(user._id,business._id):{roleAssignments:[],departmentAssignments:[]};
  const loginTime=new Date();

  await User.findByIdAndUpdate(user._id,{lastLogin:loginTime});

  return res.status(200).json({
   success:true,
   message:"Login successful",
   token:generateToken(user._id),
   user:buildBusinessUser({user,business,businessAccess,lastLogin:loginTime})
  });
 }
 catch(error)
 {
  console.error("loginUser error:",error);

  return res.status(500).json({
   success:false,
   message:"Login failed",
   error:error.message
  });
 }
};

export const forgotPassword=async(req,res)=>{
 try
 {
  const {email}=req.body;

  if(!email)
  {
   return res.status(400).json({
    success:false,
    message:"Email is required"
   });
  }

  const user=await User.findOne({email});

  if(!user)
  {
   return res.status(404).json({
    success:false,
    message:"User with this email does not exist"
   });
  }

  if(!user.isActive)
  {
   return res.status(403).json({
    success:false,
    message:"Account is inactive"
   });
  }

  const rawToken=crypto.randomBytes(32).toString("hex");

  const hashedToken=crypto
   .createHash("sha256")
   .update(rawToken)
   .digest("hex");

  user.resetPasswordToken=hashedToken;
  user.resetPasswordExpires=new Date(Date.now()+1000*60*30);

  await user.save({validateModifiedOnly:true});

  return res.status(200).json({
   success:true,
   message:"Password reset token generated",
   resetToken:rawToken
  });
 }
 catch(error)
 {
  console.error("forgotPassword error:",error);

  return res.status(500).json({
   success:false,
   message:"Password reset failed",
   error:error.message
  });
 }
};

export const resetPassword=async(req,res)=>{
 try
 {
  const {token,password}=req.body;

  if(!token||!password)
  {
   return res.status(400).json({
    success:false,
    message:"Token and new password are required"
   });
  }

  const hashedToken=crypto
   .createHash("sha256")
   .update(token)
   .digest("hex");

  const user=await User.findOne({
   resetPasswordToken:hashedToken,
   resetPasswordExpires:{$gt:new Date()}
  }).select("+password");

  if(!user)
  {
   return res.status(400).json({
    success:false,
    message:"Invalid or expired reset token"
   });
  }

  user.password=password;
  user.resetPasswordToken=undefined;
  user.resetPasswordExpires=undefined;

  await user.save();

  return res.status(200).json({
   success:true,
   message:"Password reset successfully"
  });
 }
 catch(error)
 {
  console.error("resetPassword error:",error);

  return res.status(500).json({
   success:false,
   message:"Password reset failed",
   error:error.message
  });
 }
};
