// backend/controllers/userSetting/userSettingController.js
import mongoose from "mongoose";
import User from "../../models/users/userModel.js";
import UserSetting from "../../models/userSetting/userSettingModel.js";

const getRawUserValue=req=>{
 return req.user?._id||
  req.user?.id||
  req.user?.user||
  req.query?.user||
  req.query?.userId||
  req.query?.username||
  req.query?.email||
  req.body?.user||
  req.body?.userId||
  req.body?.username||
  req.body?.email||
  null;
};

const normalizeValue=value=>{
 if(!value)return "";
 if(typeof value==="object"&&value?.$oid)return String(value.$oid);
 if(typeof value==="object"&&value?._id)return normalizeValue(value._id);
 if(typeof value==="object"&&value?.id)return normalizeValue(value.id);
 return String(value).trim();
};

const resolveUserId=async(req)=>{
 const raw=normalizeValue(getRawUserValue(req));

 if(!raw)return null;

 if(mongoose.Types.ObjectId.isValid(raw)){
  return raw;
 }

 const user=await User.findOne({
  $or:[
   {username:raw},
   {email:raw.toLowerCase()}
  ]
 }).select("_id");

 return user?._id||null;
};

const cleanPayload=body=>{
 const payload={...(body||{})};

 delete payload._id;
 delete payload.id;
 delete payload.createdAt;
 delete payload.updatedAt;
 delete payload.__v;
 delete payload.userId;
 delete payload.username;
 delete payload.email;

 return payload;
};

const getUserSetting=async(req,res)=>{
 try{
  const user=await resolveUserId(req);

  if(!user){
   return res.status(400).json({success:false,message:"User is required"});
  }

  let userSetting=await UserSetting.findOne({user});

  if(!userSetting){
   userSetting=await UserSetting.create({
    user,
    timezone:"America/New_York",
    locale:"en-US"
   });
  }

  res.status(200).json({success:true,userSetting});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

const updateUserSetting=async(req,res)=>{
 try{
  const user=await resolveUserId(req);

  if(!user){
   return res.status(400).json({success:false,message:"User is required"});
  }

  const payload=cleanPayload(req.body);
  payload.user=user;

  const userSetting=await UserSetting.findOneAndUpdate(
   {user},
   {$set:payload},
   {returnDocument:"after",upsert:true,runValidators:true}
  );

  res.status(200).json({success:true,userSetting});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export {
 getUserSetting,
 updateUserSetting
};