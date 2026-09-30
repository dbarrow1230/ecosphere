import mongoose from "mongoose";
import UserDetails from "../../models/users/userDetailsModel.js";
import User from "../../models/users/userModel.js";
import State from "../../models/locations/stateModel.js";
import County from "../../models/locations/countyModel.js";

const normalizeId=(value)=>{
 if(value===undefined||value===null||value==="")
 {
  return null;
 }

 if(typeof value==="string")
 {
  return value.trim();
 }

 if(typeof value==="object")
 {
  if(typeof value._id==="string")
  {
   return value._id.trim();
  }

  if(typeof value.$oid==="string")
  {
   return value.$oid.trim();
  }

  if(typeof value._id?.$oid==="string")
  {
   return value._id.$oid.trim();
  }
 }

 return String(value).trim();
};

export const createUserDetails=async(req,res)=>{
 try{
  const{
   user,
   firstName,
   lastName,
   phone,
   cell,
   address1,
   address2,
   city,
   state,
   county,
   postalCode,
   country,
   avatar,
   notes=[]
  }=req.body;

  const userId=normalizeId(user);
  const stateId=normalizeId(state);
  const countyId=normalizeId(county);

  if(!userId)return res.status(400).json({success:false,message:"User is required"});
  if(!mongoose.Types.ObjectId.isValid(userId))return res.status(400).json({success:false,message:"Invalid user id"});
  if(stateId&&!mongoose.Types.ObjectId.isValid(stateId))return res.status(400).json({success:false,message:"Invalid state id"});
  if(countyId&&!mongoose.Types.ObjectId.isValid(countyId))return res.status(400).json({success:false,message:"Invalid county id"});
  if(notes&&!Array.isArray(notes))return res.status(400).json({success:false,message:"Notes must be an array"});

  const userExists=await User.findById(userId).select("_id");

  if(!userExists)return res.status(404).json({success:false,message:"User not found"});

  const existingUserDetails=await UserDetails.findOne({user:userId});

  if(existingUserDetails)return res.status(409).json({success:false,message:"User details already exist for this user"});

  const userDetails=await UserDetails.create({
   user:userId,
   firstName,
   lastName,
   phone,
   cell,
   address1,
   address2,
   city,
   state:stateId||null,
   county:countyId||null,
   postalCode,
   country,
   avatar,
   notes:Array.isArray(notes)?notes:[]
  });

  await User.findByIdAndUpdate(userId,{details:userDetails._id});

  const populatedUserDetails=await UserDetails.findById(userDetails._id)
   .populate({path:"state",select:"name abbreviation",model:State})
   .populate({path:"county",select:"name",model:County});

  return res.status(201).json({success:true,message:"User details created successfully",data:populatedUserDetails});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to create user details",error:error.message});
 }
};

export const getUserDetails=async(req,res)=>{
 try{
  const userId=normalizeId(req.params.userId||req.query.user);
  const city=(req.query.city||"").trim();
  const country=(req.query.country||"").trim();
  const query={};

  if(userId)
  {
   if(!mongoose.Types.ObjectId.isValid(userId))return res.status(400).json({success:false,message:"Invalid user id"});
   query.user=userId;
  }

  if(city)query.city=city;
  if(country)query.country=country;

  const userDetails=await UserDetails.find(query)
   .populate({path:"state",select:"name abbreviation",model:State})
   .populate({path:"county",select:"name",model:County})
   .sort({createdAt:-1});

  return res.status(200).json({success:true,count:userDetails.length,data:userDetails});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch user details",error:error.message});
 }
};

export const getUserDetailsById=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid user details id"});

  const userDetails=await UserDetails.findById(id)
   .populate({path:"state",select:"name abbreviation",model:State})
   .populate({path:"county",select:"name",model:County});

  if(!userDetails)return res.status(404).json({success:false,message:"User details not found"});

  return res.status(200).json({success:true,data:userDetails});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch user details",error:error.message});
 }
};

export const updateUserDetails=async(req,res)=>{
 try{
  const {id}=req.params;
  const updateData={...req.body};

  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid user details id"});
  if(updateData.state&&!mongoose.Types.ObjectId.isValid(updateData.state))return res.status(400).json({success:false,message:"Invalid state id"});
  if(updateData.county&&!mongoose.Types.ObjectId.isValid(updateData.county))return res.status(400).json({success:false,message:"Invalid county id"});
  if(updateData.notes&&!Array.isArray(updateData.notes))return res.status(400).json({success:false,message:"Notes must be an array"});

  delete updateData.user;

  if(updateData.state==="")updateData.state=null;
  if(updateData.county==="")updateData.county=null;

  const userDetails=await UserDetails.findByIdAndUpdate(
   id,
   updateData,
   {new:true,runValidators:true}
  )
   .populate({path:"state",select:"name abbreviation",model:State})
   .populate({path:"county",select:"name",model:County});

  if(!userDetails)return res.status(404).json({success:false,message:"User details not found"});

  return res.status(200).json({success:true,message:"User details updated successfully",data:userDetails});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to update user details",error:error.message});
 }
};

export const deleteUserDetails=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid user details id"});

  const userDetails=await UserDetails.findByIdAndDelete(id);

  if(!userDetails)return res.status(404).json({success:false,message:"User details not found"});

  await User.updateMany({details:id},{$set:{details:null}});

  return res.status(200).json({success:true,message:"User details deleted successfully"});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to delete user details",error:error.message});
 }
};