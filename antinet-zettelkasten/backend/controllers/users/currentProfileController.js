import coreConnection from "../../db/coreConnection.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "../../models/users/userModel.js";
import UserDetails from "../../models/users/userDetailsModel.js";
import Role from "../../models/users/userRolesModel.js";
import UserRoleAssignment from "../../models/users/userRoleAssignmentModel.js";
import State from "../../models/locations/stateModel.js";
import County from "../../models/locations/countyModel.js";
import Country from "../../models/locations/countryModel.js";
export const getCurrentProfile=async(req,res)=>{
 let userId;
 try{
  let token=req.headers.authorization?.startsWith("Bearer ")?req.headers.authorization.slice(7):req.cookies?.token;
  token=String(token||"").trim().replace(/^["']|["']$/g,"");
  userId=jwt.verify(token,process.env.JWT_SECRET).id;
  if(!mongoose.isValidObjectId(userId))throw new Error("Invalid session");
 }catch{return res.status(401).json({success:false,message:"Please sign in again to view your profile."});}
 try{
  if(coreConnection!==mongoose.connection)await coreConnection.asPromise();
  const user=await User.findById(userId).populate({path:"role",model:Role}).lean();
  if(!user)return res.status(404).json({success:false,message:"Your user record was not found in the core database."});
  if(user.isActive===false)return res.status(403).json({success:false,message:"This account is inactive."});
  let details=await UserDetails.findOne({user:user._id}).lean();
  if(!details&&user.details)details=await UserDetails.findOne({_id:user.details,user:user._id}).lean();
  // Older core records can contain empty strings or plain location names.
  // Resolve only valid references rather than passing these values to populate.
  const resolveLocation=async(value,model,fields)=>{
   if(value===null||value===undefined||value==="")return null;
   if(typeof value==="object"&&value.name)return value;
   const id=value?._id||value;
   if(!mongoose.isValidObjectId(id))return typeof value==="string"?{name:value}:null;
   return await model.findById(id).select(fields).lean();
  };
  if(details){
   const [state,county,country]=await Promise.all([
    resolveLocation(details.state,State,"name abbreviation"),
    resolveLocation(details.county,County,"name"),
    resolveLocation(details.country,Country,"name iso2 iso3 phoneCode")
   ]);
   details={...details,state,county,country};
  }
  const business=String(req.query.business||"");
  if(business&&!mongoose.isValidObjectId(business))return res.status(400).json({success:false,message:"Invalid business ID"});
  const roleAssignment=business?await UserRoleAssignment.findOne({user:user._id,business,isActive:true}).populate({path:"role",model:Role}).lean():null;
  return res.json({success:true,data:{user,details,roleAssignment}});
 }catch{return res.status(500).json({success:false,message:"Unable to load your profile from the core database."});}
};
