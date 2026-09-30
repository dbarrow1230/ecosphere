import mongoose from "mongoose";
import UserDetails from "../../models/users/userDetailsModel.js";
import User from "../../models/users/userModel.js";
import State from "../../models/locations/stateModel.js";
import County from "../../models/locations/countyModel.js";
import Country from "../../models/locations/countryModel.js";

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

const validateLocationSelection=async({countryId,stateId,countyId})=>{
 let country=null;

 if(countryId)
 {
  country=await Country.findById(countryId).select("_id name iso2");
  if(!country)return {status:404,message:"Country not found"};
 }

 if(stateId)
 {
  if(!country)return {status:400,message:"Country is required when a state is selected"};
  if(String(country.iso2||"").toUpperCase()!=="US")return {status:400,message:"State selection is only available for United States addresses"};

  const stateExists=await State.exists({_id:stateId});
  if(!stateExists)return {status:404,message:"State not found"};
 }

 if(countyId)
 {
  if(!countryId||!stateId)return {status:400,message:"Country and state are required when a county is selected"};
  if(String(country?.iso2||"").toUpperCase()!=="US")return {status:400,message:"County selection is only available for United States addresses"};

  const county=await County.findById(countyId).select("_id state country isActive");
  if(!county)return {status:404,message:"County not found"};
  if(county.isActive===false)return {status:400,message:"Selected county is inactive"};
  if(String(county.state)!==String(stateId)||String(county.country)!==String(countryId))return {status:400,message:"Selected county does not belong to the selected state and country"};
 }

 return null;
};

const normalizeEmergencyContacts=value=>{
 if(value===undefined)
 {
  return {contacts:undefined,error:null};
 }

 if(!Array.isArray(value))
 {
  return {contacts:[],error:"Emergency contacts must be an array"};
 }

 const contacts=value.map(contact=>({
  name:String(contact?.name||"").trim(),
  phone:String(contact?.phone||"").trim(),
  relationship:String(contact?.relationship||"").trim()
 })).filter(contact=>contact.name||contact.phone||contact.relationship);

 if(contacts.some(contact=>!contact.name))
 {
  return {contacts:[],error:"Each emergency contact must have a contact name"};
 }

 return {contacts,error:null};
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
   notes=[],
   emergencyContacts=[]
  }=req.body;

  const userId=normalizeId(user);
  const stateId=normalizeId(state);
  const countyId=normalizeId(county);
  const countryId=normalizeId(country);

  if(!userId)return res.status(400).json({success:false,message:"User is required"});
  if(!mongoose.Types.ObjectId.isValid(userId))return res.status(400).json({success:false,message:"Invalid user id"});
  if(stateId&&!mongoose.Types.ObjectId.isValid(stateId))return res.status(400).json({success:false,message:"Invalid state id"});
  if(countyId&&!mongoose.Types.ObjectId.isValid(countyId))return res.status(400).json({success:false,message:"Invalid county id"});
  if(countryId&&!mongoose.Types.ObjectId.isValid(countryId))return res.status(400).json({success:false,message:"Invalid country id"});
  if(notes&&!Array.isArray(notes))return res.status(400).json({success:false,message:"Notes must be an array"});
  const normalizedEmergencyContacts=normalizeEmergencyContacts(emergencyContacts);
  if(normalizedEmergencyContacts.error)return res.status(400).json({success:false,message:normalizedEmergencyContacts.error});

  const locationError=await validateLocationSelection({countryId,stateId,countyId});
  if(locationError)return res.status(locationError.status).json({success:false,message:locationError.message});

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
   country:countryId||null,
   avatar,
   notes:Array.isArray(notes)?notes:[],
   emergencyContacts:normalizedEmergencyContacts.contacts
  });

  await User.findByIdAndUpdate(userId,{details:userDetails._id});

  const populatedUserDetails=await UserDetails.findById(userDetails._id)
   .populate({path:"state",select:"name abbreviation",model:State})
   .populate({path:"county",select:"name",model:County})
   .populate({path:"country",select:"name iso2 iso3 phoneCode",model:Country});

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
  if(country)
  {
   const countryId=normalizeId(country);
   if(!mongoose.Types.ObjectId.isValid(countryId))return res.status(400).json({success:false,message:"Invalid country id"});
   query.country=countryId;
  }

  const userDetails=await UserDetails.find(query)
   .populate({path:"state",select:"name abbreviation",model:State})
   .populate({path:"county",select:"name",model:County})
   .populate({path:"country",select:"name iso2 iso3 phoneCode",model:Country})
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
   .populate({path:"county",select:"name",model:County})
   .populate({path:"country",select:"name iso2 iso3 phoneCode",model:Country});

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
  const existingUserDetails=await UserDetails.findById(id).select("user state county country");
  if(!existingUserDetails)return res.status(404).json({success:false,message:"User details not found"});

  const hasState=Object.prototype.hasOwnProperty.call(updateData,"state");
  const hasCounty=Object.prototype.hasOwnProperty.call(updateData,"county");
  const hasCountry=Object.prototype.hasOwnProperty.call(updateData,"country");
  const hasUser=Object.prototype.hasOwnProperty.call(updateData,"user");

  if(hasState)updateData.state=normalizeId(updateData.state);
  if(hasCounty)updateData.county=normalizeId(updateData.county);
  if(hasCountry)updateData.country=normalizeId(updateData.country);
  if(hasUser)updateData.user=normalizeId(updateData.user);

  if(updateData.state&&!mongoose.Types.ObjectId.isValid(updateData.state))return res.status(400).json({success:false,message:"Invalid state id"});
  if(updateData.county&&!mongoose.Types.ObjectId.isValid(updateData.county))return res.status(400).json({success:false,message:"Invalid county id"});
  if(updateData.country&&!mongoose.Types.ObjectId.isValid(updateData.country))return res.status(400).json({success:false,message:"Invalid country id"});
  if(hasUser&&!mongoose.Types.ObjectId.isValid(updateData.user))return res.status(400).json({success:false,message:"Invalid user id"});
  if(updateData.notes&&!Array.isArray(updateData.notes))return res.status(400).json({success:false,message:"Notes must be an array"});
  if(Object.prototype.hasOwnProperty.call(updateData,"emergencyContacts"))
  {
   const normalizedEmergencyContacts=normalizeEmergencyContacts(updateData.emergencyContacts);
   if(normalizedEmergencyContacts.error)return res.status(400).json({success:false,message:normalizedEmergencyContacts.error});
   updateData.emergencyContacts=normalizedEmergencyContacts.contacts;
  }

  if(hasState||hasCounty||hasCountry)
  {
   const stateId=hasState?updateData.state:normalizeId(existingUserDetails.state);
   const countyId=hasCounty?updateData.county:normalizeId(existingUserDetails.county);
   const countryId=hasCountry?updateData.country:normalizeId(existingUserDetails.country);
   const locationError=await validateLocationSelection({countryId,stateId,countyId});
   if(locationError)return res.status(locationError.status).json({success:false,message:locationError.message});
  }

  if(hasUser)
  {
   const [userExists,duplicateDetails]=await Promise.all([
    User.exists({_id:updateData.user}),
    UserDetails.exists({user:updateData.user,_id:{$ne:id}})
   ]);

   if(!userExists)return res.status(404).json({success:false,message:"User not found"});
   if(duplicateDetails)return res.status(409).json({success:false,message:"User details already exist for this user"});
  }

  if(hasState&&!updateData.state)updateData.state=null;
  if(hasCounty&&!updateData.county)updateData.county=null;
  if(hasCountry&&!updateData.country)updateData.country=null;

  const userDetails=await UserDetails.findByIdAndUpdate(
   id,
   updateData,
   {returnDocument:"after",runValidators:true}
  )
   .populate({path:"state",select:"name abbreviation",model:State})
   .populate({path:"county",select:"name",model:County})
   .populate({path:"country",select:"name iso2 iso3 phoneCode",model:Country});

  if(!userDetails)return res.status(404).json({success:false,message:"User details not found"});

  if(hasUser)
  {
   await Promise.all([
    User.updateMany({_id:existingUserDetails.user,details:id},{$set:{details:null}}),
    User.findByIdAndUpdate(updateData.user,{$set:{details:id}})
   ]);
  }

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
