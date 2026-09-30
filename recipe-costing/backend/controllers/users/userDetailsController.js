// backend/controllers/users/userDetailsController.js
import mongoose from "mongoose";
import UserDetails from "../../models/users/userDetailsModel.js";
import User from "../../models/users/userModel.js";
import State from "../../models/locations/stateModel.js";
import County from "../../models/locations/countyModel.js";
import Country from "../../models/locations/countryModel.js";

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

const normalizeNotes=value=>{
 if(value===undefined||value===null)return [];
 if(!Array.isArray(value))return null;
 return value.map(item=>String(item||"").trim()).filter(Boolean);
};

const populateUserDetails=query=>{
 return query
  .populate({path:"user",select:"username email isActive"})
  .populate({path:"state",select:"name abbreviation",model:State})
  .populate({path:"county",select:"name",model:County})
  .populate({path:"country",select:"name iso2 iso3",model:Country});
};

const validateObjectId=(id,message)=>{
 if(id&&!mongoose.Types.ObjectId.isValid(id))return {status:400,message};
 return {};
};

const validateLocationRefs=async({stateId,countyId,countryId})=>{
 const stateValidation=validateObjectId(stateId,"Invalid state id");
 if(stateValidation.status)return stateValidation;

 const countyValidation=validateObjectId(countyId,"Invalid county id");
 if(countyValidation.status)return countyValidation;

 const countryValidation=validateObjectId(countryId,"Invalid country id");
 if(countryValidation.status)return countryValidation;

 const [state,county,country]=await Promise.all([
  stateId?State.findById(stateId).select("_id"):null,
  countyId?County.findById(countyId).select("_id"):null,
  countryId?Country.findById(countryId).select("_id"):null
 ]);

 if(stateId&&!state)return {status:404,message:"State not found"};
 if(countyId&&!county)return {status:404,message:"County not found"};
 if(countryId&&!country)return {status:404,message:"Country not found"};

 return {state,county,country};
};

export const createUserDetails=async(req,res)=>{
 try{
  const userId=normalizeId(req.body.user);
  const stateId=normalizeId(req.body.state);
  const countyId=normalizeId(req.body.county);
  const countryId=normalizeId(req.body.country);
  const notes=normalizeNotes(req.body.notes);

  if(!userId)return res.status(400).json({success:false,message:"User is required"});
  if(!mongoose.Types.ObjectId.isValid(userId))return res.status(400).json({success:false,message:"Invalid user id"});
  if(notes===null)return res.status(400).json({success:false,message:"Notes must be an array"});

  const locationValidation=await validateLocationRefs({stateId,countyId,countryId});
  if(locationValidation.status)return res.status(locationValidation.status).json({success:false,message:locationValidation.message});

  const user=await User.findById(userId).select("_id");

  if(!user)return res.status(404).json({success:false,message:"User not found"});

  const existingUserDetails=await UserDetails.findOne({user:userId}).select("_id");

  if(existingUserDetails)return res.status(409).json({success:false,message:"User details already exist for this user"});

  const userDetails=await UserDetails.create({
   user:userId,
   firstName:normalizeString(req.body.firstName),
   lastName:normalizeString(req.body.lastName),
   phone:normalizeString(req.body.phone),
   cell:normalizeString(req.body.cell),
   address1:normalizeString(req.body.address1),
   address2:normalizeString(req.body.address2),
   city:normalizeString(req.body.city),
   state:stateId||null,
   county:countyId||null,
   postalCode:normalizeString(req.body.postalCode),
   country:countryId||null,
   avatar:normalizeString(req.body.avatar),
   notes
  });

  await User.findByIdAndUpdate(userId,{details:userDetails._id});

  const populatedUserDetails=await populateUserDetails(UserDetails.findById(userDetails._id));

  return res.status(201).json({
   success:true,
   message:"User details created successfully",
   data:populatedUserDetails
  });
 }catch(error){
  if(error.code===11000)return res.status(409).json({success:false,message:"User details already exist for this user"});

  console.error("createUserDetails error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to create user details",
   error:error.message
  });
 }
};

export const getUserDetails=async(req,res)=>{
 try{
  const userId=normalizeId(req.params.userId||req.query.user);
  const stateId=normalizeId(req.query.state);
  const countyId=normalizeId(req.query.county);
  const countryId=normalizeId(req.query.country);
  const city=normalizeString(req.query.city);
  const query={};

  if(userId){
   if(!mongoose.Types.ObjectId.isValid(userId))return res.status(400).json({success:false,message:"Invalid user id"});
   query.user=userId;
  }

  if(stateId){
   if(!mongoose.Types.ObjectId.isValid(stateId))return res.status(400).json({success:false,message:"Invalid state id"});
   query.state=stateId;
  }

  if(countyId){
   if(!mongoose.Types.ObjectId.isValid(countyId))return res.status(400).json({success:false,message:"Invalid county id"});
   query.county=countyId;
  }

  if(countryId){
   if(!mongoose.Types.ObjectId.isValid(countryId))return res.status(400).json({success:false,message:"Invalid country id"});
   query.country=countryId;
  }

  if(city)query.city=city;

  const userDetails=await populateUserDetails(
   UserDetails.find(query).sort({createdAt:-1})
  );

  return res.status(200).json({
   success:true,
   count:userDetails.length,
   data:userDetails
  });
 }catch(error){
  console.error("getUserDetails error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to fetch user details",
   error:error.message
  });
 }
};

export const getUserDetailsById=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid user details id"});

  const userDetails=await populateUserDetails(UserDetails.findById(id));

  if(!userDetails)return res.status(404).json({success:false,message:"User details not found"});

  return res.status(200).json({
   success:true,
   data:userDetails
  });
 }catch(error){
  console.error("getUserDetailsById error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to fetch user details",
   error:error.message
  });
 }
};

export const updateUserDetails=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid user details id"});

  const existingUserDetails=await UserDetails.findById(id);

  if(!existingUserDetails)return res.status(404).json({success:false,message:"User details not found"});

  const updateData={};

  if(req.body.firstName!==undefined)updateData.firstName=normalizeString(req.body.firstName);
  if(req.body.lastName!==undefined)updateData.lastName=normalizeString(req.body.lastName);
  if(req.body.phone!==undefined)updateData.phone=normalizeString(req.body.phone);
  if(req.body.cell!==undefined)updateData.cell=normalizeString(req.body.cell);
  if(req.body.address1!==undefined)updateData.address1=normalizeString(req.body.address1);
  if(req.body.address2!==undefined)updateData.address2=normalizeString(req.body.address2);
  if(req.body.city!==undefined)updateData.city=normalizeString(req.body.city);
  if(req.body.postalCode!==undefined)updateData.postalCode=normalizeString(req.body.postalCode);
  if(req.body.avatar!==undefined)updateData.avatar=normalizeString(req.body.avatar);

  const stateId=req.body.state!==undefined?normalizeId(req.body.state):normalizeId(existingUserDetails.state);
  const countyId=req.body.county!==undefined?normalizeId(req.body.county):normalizeId(existingUserDetails.county);
  const countryId=req.body.country!==undefined?normalizeId(req.body.country):normalizeId(existingUserDetails.country);

  const locationValidation=await validateLocationRefs({stateId,countyId,countryId});
  if(locationValidation.status)return res.status(locationValidation.status).json({success:false,message:locationValidation.message});

  if(req.body.state!==undefined)updateData.state=stateId||null;
  if(req.body.county!==undefined)updateData.county=countyId||null;
  if(req.body.country!==undefined)updateData.country=countryId||null;

  if(req.body.notes!==undefined){
   const notes=normalizeNotes(req.body.notes);
   if(notes===null)return res.status(400).json({success:false,message:"Notes must be an array"});
   updateData.notes=notes;
  }

  const userDetails=await populateUserDetails(
   UserDetails.findByIdAndUpdate(
    id,
    updateData,
    {returnDocument:"after",runValidators:true}
   )
  );

  return res.status(200).json({
   success:true,
   message:"User details updated successfully",
   data:userDetails
  });
 }catch(error){
  console.error("updateUserDetails error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to update user details",
   error:error.message
  });
 }
};

export const deleteUserDetails=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid user details id"});

  const userDetails=await UserDetails.findByIdAndDelete(id);

  if(!userDetails)return res.status(404).json({success:false,message:"User details not found"});

  await User.updateMany({details:id},{$set:{details:null}});

  return res.status(200).json({
   success:true,
   message:"User details deleted successfully"
  });
 }catch(error){
  console.error("deleteUserDetails error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to delete user details",
   error:error.message
  });
 }
};