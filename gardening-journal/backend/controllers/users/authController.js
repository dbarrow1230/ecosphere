import crypto from "crypto";
import User from "../../models/users/userModel.js";
import Role from "../../models/users/userRolesModel.js";
import USDAZones from "../../models/reference/usdaZonesModel.js";
import State from "../../models/locations/stateModel.js";
import County from "../../models/locations/countyModel.js";
import Country from "../../models/locations/countryModel.js";
import generateToken from "../../utils/generateToken.js";

const detailsPopulate={
 path:"details",
 populate:[
  {path:"state",select:"name abbreviation",model:State},
  {path:"county",select:"name",model:County},
  {path:"country",select:"name iso2 iso3",model:Country}
 ]
};

export const loginUser=async(req,res)=>{
 try
 {
  const {username,password}=req.body;

  if(!username||!password)
  {
   return res.status(400).json({
    success:false,
    message:"Username and password are required"
   });
  }

  const user=await User.findOne({username})
   .select("+password")
   .populate({path:"role",model:Role})
   .populate(detailsPopulate)
   .populate({path:"hardinessZone",model:USDAZones});

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

  await User.findByIdAndUpdate(user._id,{lastLogin:new Date()});

  return res.status(200).json({
   success:true,
   message:"Login successful",
   token:generateToken(user._id),
   user:{
    _id:user._id,
    username:user.username,
    email:user.email,
    role:user.role,
    details:user.details,
    hardinessZone:user.hardinessZone,
    isActive:user.isActive,
    lastLogin:new Date()
   }
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
