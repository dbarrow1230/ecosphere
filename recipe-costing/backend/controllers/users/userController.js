// backend/controllers/users/userController.js
import mongoose from "mongoose";
import crypto from "crypto";
import User from "../../models/users/userModel.js";
import UserDetails from "../../models/users/userDetailsModel.js";
import Role from "../../models/users/roleModel.js";
import BusinessDepartment from "../../models/users/businessDepartmentModel.js";
import UserRoleAssignment from "../../models/users/userRoleAssignmentModel.js";
import UserDepartmentAssignment from "../../models/users/userDepartmentAssignmentModel.js";

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

const normalizeString=value=>{
 return String(value||"").trim();
};

const normalizeEmail=value=>{
 return String(value||"").trim().toLowerCase();
};

const populateUser=query=>{
 return query.populate("details");
};

const validateDetails=async detailsId=>{
 if(!detailsId)return {};

 if(!mongoose.Types.ObjectId.isValid(detailsId))
  return {status:400,message:"Invalid details id"};

 const details=await UserDetails.findById(detailsId).select("_id").lean();

 if(!details)return {status:404,message:"User details not found"};

 return {details};
};

const getBusinessAssignments=async businessId=>{
 const [roleAssignments,departmentAssignments]=await Promise.all([
  UserRoleAssignment.find({business:businessId,isActive:true})
   .populate({path:"role",model:Role})
   .lean(),
  UserDepartmentAssignment.find({business:businessId,isActive:true})
   .populate({path:"roleOverride",model:Role})
   .populate({
    path:"department",
    model:BusinessDepartment,
    populate:{path:"defaultRole",model:Role}
   })
   .lean()
 ]);

 const roleByUser=new Map();
 const departmentByUser=new Map();

 roleAssignments.forEach(item=>{
  roleByUser.set(String(item.user),item);
 });

 departmentAssignments.forEach(item=>{
  const userId=String(item.user);

  if(!departmentByUser.has(userId))departmentByUser.set(userId,[]);
  departmentByUser.get(userId).push(item);
 });

 const userIds=[
  ...new Set([
   ...roleAssignments.map(item=>String(item.user)),
   ...departmentAssignments.map(item=>String(item.user))
  ])
 ];

 return {userIds,roleByUser,departmentByUser};
};

export const createUser=async(req,res)=>{
 try{
  const username=normalizeString(req.body.username);
  const email=normalizeEmail(req.body.email);
  const password=String(req.body.password||"");
  const detailsId=normalizeId(req.body.details);
  const isActive=req.body.isActive===undefined?true:!!req.body.isActive;
  const lastLogin=req.body.lastLogin||null;

  if(!username||!email||!password)
   return res.status(400).json({success:false,message:"Username, email, and password are required"});

  const detailsValidation=await validateDetails(detailsId);

  if(detailsValidation.status)
   return res.status(detailsValidation.status).json({success:false,message:detailsValidation.message});

  const existing=await User.findOne({
   $or:[
    {username},
    {email}
   ]
  }).select("_id username email");

  if(existing)
   return res.status(409).json({success:false,message:"Username or email already exists"});

  const user=await User.create({
   username,
   email,
   password,
   details:detailsId||null,
   isActive,
   lastLogin
  });

  const createdUser=await populateUser(User.findById(user._id));

  return res.status(201).json({
   success:true,
   message:"User created successfully",
   data:createdUser
  });
 }catch(error){
  if(error.code===11000)
   return res.status(409).json({success:false,message:"Username or email already exists"});

  console.error("createUser error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to create user",
   error:error.message
  });
 }
};

export const getUsers=async(req,res)=>{
 try{
  const businessId=normalizeId(req.query.business);
  const isActive=req.query.isActive;
  const query={};

  if(isActive!==undefined)query.isActive=isActive==="true";

  if(businessId){
   if(!mongoose.Types.ObjectId.isValid(businessId))
    return res.status(400).json({success:false,message:"Invalid business id"});

   const {userIds,roleByUser,departmentByUser}=await getBusinessAssignments(businessId);

   query._id={$in:userIds};

   const users=await populateUser(
    User.find(query).sort({createdAt:-1})
   ).lean();

   const scopedUsers=users.map(user=>{
    const userId=String(user._id);
    const businessRoleAssignment=roleByUser.get(userId)||null;
    const businessDepartmentAssignments=departmentByUser.get(userId)||[];

    return{
     ...user,
     businessRoleAssignment,
     businessDepartmentAssignments
    };
   });

   return res.status(200).json({
    success:true,
    count:scopedUsers.length,
    data:scopedUsers
   });
  }

  const users=await populateUser(
   User.find(query).sort({createdAt:-1})
  );

  return res.status(200).json({
   success:true,
   count:users.length,
   data:users
  });
 }catch(error){
  console.error("getUsers error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to fetch users",
   error:error.message
  });
 }
};

export const getUserById=async(req,res)=>{
 try{
  const {id}=req.params;
  const businessId=normalizeId(req.query.business);

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"Invalid user id"});

  const user=await populateUser(User.findById(id)).lean();

  if(!user)
   return res.status(404).json({success:false,message:"User not found"});

  if(businessId){
   if(!mongoose.Types.ObjectId.isValid(businessId))
    return res.status(400).json({success:false,message:"Invalid business id"});

   const [businessRoleAssignment,businessDepartmentAssignments]=await Promise.all([
    UserRoleAssignment.findOne({user:id,business:businessId,isActive:true})
     .populate({path:"role",model:Role})
     .lean(),
    UserDepartmentAssignment.find({user:id,business:businessId,isActive:true})
     .populate({path:"roleOverride",model:Role})
     .populate({
      path:"department",
      model:BusinessDepartment,
      populate:{path:"defaultRole",model:Role}
     })
     .lean()
   ]);

   return res.status(200).json({
    success:true,
    data:{
     ...user,
     businessRoleAssignment:businessRoleAssignment||null,
     businessDepartmentAssignments
    }
   });
  }

  return res.status(200).json({
   success:true,
   data:user
  });
 }catch(error){
  console.error("getUserById error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to fetch user",
   error:error.message
  });
 }
};

export const updateUser=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"Invalid user id"});

  const user=await User.findById(id).select("+password");

  if(!user)
   return res.status(404).json({success:false,message:"User not found"});

  if(req.body.username!==undefined){
   const username=normalizeString(req.body.username);

   if(!username)
    return res.status(400).json({success:false,message:"Username is required"});

   if(username!==user.username){
    const existingUsername=await User.findOne({_id:{$ne:id},username}).select("_id");

    if(existingUsername)
     return res.status(409).json({success:false,message:"Username already exists"});

    user.username=username;
   }
  }

  if(req.body.email!==undefined){
   const email=normalizeEmail(req.body.email);

   if(!email)
    return res.status(400).json({success:false,message:"Email is required"});

   if(email!==user.email){
    const existingEmail=await User.findOne({_id:{$ne:id},email}).select("_id");

    if(existingEmail)
     return res.status(409).json({success:false,message:"Email already exists"});

    user.email=email;
   }
  }

  if(req.body.password!==undefined){
   const password=String(req.body.password||"");

   if(password.trim())user.password=password;
  }

  if(req.body.details!==undefined){
   const detailsId=normalizeId(req.body.details);
   const detailsValidation=await validateDetails(detailsId);

   if(detailsValidation.status)
    return res.status(detailsValidation.status).json({success:false,message:detailsValidation.message});

   user.details=detailsId||null;
  }

  if(req.body.isActive!==undefined)
   user.isActive=!!req.body.isActive;

  if(req.body.lastLogin!==undefined)
   user.lastLogin=req.body.lastLogin||null;

  await user.save({validateModifiedOnly:true});

  const updatedUser=await populateUser(User.findById(id));

  return res.status(200).json({
   success:true,
   message:"User updated successfully",
   data:updatedUser
  });
 }catch(error){
  if(error.code===11000)
   return res.status(409).json({success:false,message:"Username or email already exists"});

  console.error("updateUser error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to update user",
   error:error.message
  });
 }
};

export const deleteUser=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"Invalid user id"});

  const user=await User.findByIdAndDelete(id);

  if(!user)
   return res.status(404).json({success:false,message:"User not found"});

  await Promise.all([
   UserRoleAssignment.deleteMany({user:id}),
   UserDepartmentAssignment.deleteMany({user:id}),
   UserDetails.deleteMany({user:id})
  ]);

  return res.status(200).json({
   success:true,
   message:"User deleted successfully"
  });
 }catch(error){
  console.error("deleteUser error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to delete user",
   error:error.message
  });
 }
};

export const forgotPassword=async(req,res)=>{
 try{
  const email=normalizeEmail(req.body.email);

  if(!email)
   return res.status(400).json({success:false,message:"Email is required"});

  const user=await User.findOne({email});

  if(!user)
   return res.status(404).json({success:false,message:"User not found"});

  const resetToken=crypto.randomBytes(32).toString("hex");
  const hashedToken=crypto.createHash("sha256").update(resetToken).digest("hex");

  user.resetPasswordToken=hashedToken;
  user.resetPasswordExpires=new Date(Date.now()+1000*60*30);

  await user.save({validateModifiedOnly:true});

  const frontendUrl=String(process.env.FRONTEND_URL||"http://localhost:5173").replace(/\/$/,"");
  const resetUrl=`${frontendUrl}/reset-password/${resetToken}`;

  return res.status(200).json({
   success:true,
   message:"Password reset link generated.",
   resetUrl
  });
 }catch(error){
  console.error("forgotPassword error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to generate reset link",
   error:error.message
  });
 }
};

export const validateResetToken=async(req,res)=>{
 try{
  const token=normalizeString(req.params.token);

  if(!token)
   return res.status(400).json({success:false,message:"Reset token is required"});

  const hashedToken=crypto.createHash("sha256").update(token).digest("hex");

  const user=await User.findOne({
   resetPasswordToken:hashedToken,
   resetPasswordExpires:{$gt:new Date()}
  }).select("_id");

  if(!user)
   return res.status(400).json({success:false,message:"Reset token is invalid or expired"});

  return res.status(200).json({
   success:true,
   message:"Reset token is valid"
  });
 }catch(error){
  console.error("validateResetToken error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to validate reset token",
   error:error.message
  });
 }
};

export const resetPassword=async(req,res)=>{
 try{
  const token=normalizeString(req.params.token);
  const password=String(req.body.password||"");

  if(!token)
   return res.status(400).json({success:false,message:"Reset token is required"});

  if(!password.trim())
   return res.status(400).json({success:false,message:"Password is required"});

  const hashedToken=crypto.createHash("sha256").update(token).digest("hex");

  const user=await User.findOne({
   resetPasswordToken:hashedToken,
   resetPasswordExpires:{$gt:new Date()}
  }).select("+password +resetPasswordToken +resetPasswordExpires");

  if(!user)
   return res.status(400).json({success:false,message:"Reset token is invalid or expired"});

  user.password=password;
  user.resetPasswordToken=null;
  user.resetPasswordExpires=null;

  await user.save();

  return res.status(200).json({
   success:true,
   message:"Password has been reset successfully"
  });
 }catch(error){
  console.error("resetPassword error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to reset password",
   error:error.message
  });
 }
};