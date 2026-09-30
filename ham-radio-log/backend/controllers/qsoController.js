import mongoose from "mongoose";
import Qso from "../models/qsoModel.js";
import UserDetails from "../models/users/userDetailsModel.js";
import Country from "../models/locations/countryModel.js";
import State from "../models/locations/stateModel.js";

const cleanString=value=>String(value??"").trim();
const isValidId=id=>mongoose.Types.ObjectId.isValid(id);

const getObjectId=value=>{
 if(!value)return null;
 if(typeof value==="string")return value.trim()||null;
 return cleanString(value._id||value.id||value.$oid)||null;
};

const populateQso=query=>query
 .populate({path:"countryRef",model:Country,select:"name iso2 iso3"})
 .populate({path:"stateRef",model:State,select:"name abbreviation"});

const validateLocationRefs=async body=>{
 const countryRef=getObjectId(body.countryRef);
 const stateRef=getObjectId(body.stateRef);

 if(countryRef&&!isValidId(countryRef))throw new Error("Invalid country id");
 if(stateRef&&!isValidId(stateRef))throw new Error("Invalid state id");

 const [country,state]=await Promise.all([
  countryRef?Country.findById(countryRef).select("_id").lean():null,
  stateRef?State.findById(stateRef).select("_id").lean():null
 ]);

 if(countryRef&&!country)throw new Error("Country not found");
 if(stateRef&&!state)throw new Error("State not found");

 return {countryRef:countryRef||null,stateRef:stateRef||null};
};

const isCbBand=band=>{
 const normalizedBand=cleanString(band).toLowerCase();
 return normalizedBand.includes("11m")||normalizedBand.includes("cb");
};

const getOperator=async(userId,band)=>{
 const details=await UserDetails.findOne({user:userId}).select("hamRadioCallSign cbHandle").lean();
 const useCbHandle=isCbBand(band);
 const operatorCallSign=cleanString(useCbHandle?details?.cbHandle:details?.hamRadioCallSign).toUpperCase();

 if(!operatorCallSign){
  throw new Error(useCbHandle?
   "Add a CB Handle to the user profile before logging an 11-meter CB contact.":
   "Add a Ham Radio Call Sign to the user profile before logging an amateur-radio QSO.");
 }

 return {
  operatorUserRef:userId,
  operatorCallSign,
  operatorIdentityType:useCbHandle?"cb-handle":"ham-radio-call-sign"
 };
};

const normalizeQsoPayload=async(body,userId)=>({
 contactDate:body.contactDate,
 callSign:cleanString(body.callSign).toUpperCase(),
 ...await getOperator(userId,body.band),
 frequencyMHz:body.frequencyMHz===""||body.frequencyMHz==null?null:Number(body.frequencyMHz),
 band:cleanString(body.band),
 mode:cleanString(body.mode).toUpperCase(),
 rstSent:cleanString(body.rstSent),
 rstReceived:cleanString(body.rstReceived),
 contactName:cleanString(body.contactName),
 qth:cleanString(body.qth),
 gridSquare:cleanString(body.gridSquare).toUpperCase(),
 ...await validateLocationRefs(body),
 qslStatus:cleanString(body.qslStatus)||"not-requested",
 notes:cleanString(body.notes)
});

export const getQsos=async(req,res)=>{
 try{
  const filter={operatorUserRef:req.user._id};
  if(req.query.callSign)filter.callSign={$regex:cleanString(req.query.callSign),$options:"i"};
  if(req.query.band)filter.band=cleanString(req.query.band);
  if(req.query.mode)filter.mode=cleanString(req.query.mode).toUpperCase();

  const qsos=await populateQso(Qso.find(filter).sort({contactDate:-1,createdAt:-1})).lean();
  return res.status(200).json(qsos);
 }catch(error){
  return res.status(500).json({message:"Failed to load QSO records",error:error.message});
 }
};

export const getQsoById=async(req,res)=>{
 try{
  if(!isValidId(req.params.id))return res.status(400).json({message:"Invalid QSO id"});
  const qso=await populateQso(Qso.findOne({_id:req.params.id,operatorUserRef:req.user._id})).lean();
  if(!qso)return res.status(404).json({message:"QSO record not found"});
  return res.status(200).json(qso);
 }catch(error){
  return res.status(500).json({message:"Failed to load QSO record",error:error.message});
 }
};

export const createQso=async(req,res)=>{
 try{
  const created=await Qso.create(await normalizeQsoPayload(req.body,req.user._id));
  const qso=await populateQso(Qso.findById(created._id)).lean();
  return res.status(201).json(qso);
 }catch(error){
  return res.status(400).json({message:error.message||"Failed to save QSO record"});
 }
};

export const updateQso=async(req,res)=>{
 try{
  if(!isValidId(req.params.id))return res.status(400).json({message:"Invalid QSO id"});
  const qso=await populateQso(Qso.findOneAndUpdate(
   {_id:req.params.id,operatorUserRef:req.user._id},
   await normalizeQsoPayload(req.body,req.user._id),
   {returnDocument:"after",runValidators:true}
  )).lean();
  if(!qso)return res.status(404).json({message:"QSO record not found"});
  return res.status(200).json(qso);
 }catch(error){
  return res.status(400).json({message:error.message||"Failed to update QSO record"});
 }
};

export const deleteQso=async(req,res)=>{
 try{
  if(!isValidId(req.params.id))return res.status(400).json({message:"Invalid QSO id"});
  const qso=await Qso.findOneAndDelete({_id:req.params.id,operatorUserRef:req.user._id});
  if(!qso)return res.status(404).json({message:"QSO record not found"});
  return res.status(200).json({message:"QSO record deleted"});
 }catch(error){
  return res.status(500).json({message:"Failed to delete QSO record",error:error.message});
 }
};
