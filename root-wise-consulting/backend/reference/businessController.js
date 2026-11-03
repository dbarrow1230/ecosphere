// backend/controllers/reference/businessController.js
import Business from "../../models/reference/businessModel.js";
import BusinessType from "../../models/reference/businessTypeModel.js";
import Tagline from "../../models/reference/taglineModel.js";
import Footer from "../../models/reference/footerModel.js";
import State from "../../models/locations/stateModel.js";
import County from "../../models/locations/countyModel.js";
import Country from "../../models/locations/countryModel.js";

const businessPopulate=[
 {path:"typeRef",model:"BusinessType"},
 {path:"taglineId",model:"Tagline"},
 {path:"footerId",model:"Footer"},
 {path:"stateRef",model:"State"},
 {path:"countyRef",model:"County"},
 {path:"countryRef",model:"Country"}
];

export const createBusiness=async(req,res,next)=>{
 try{
  await BusinessType;
  await Tagline;
  await Footer;
  await State;
  await County;
  await Country;

  const business=await Business.create(req.body);

  const populatedBusiness=await Business.findById(business._id)
   .populate(businessPopulate);

  res.status(201).json(populatedBusiness);
 }catch(error){
  next(error);
 }
};

export const getBusinesses=async(req,res,next)=>{
 try{
  await BusinessType;
  await Tagline;
  await Footer;
  await State;
  await County;
  await Country;

  const businesses=await Business.find()
   .populate(businessPopulate)
   .sort({createdAt:-1});

  res.status(200).json(businesses);
 }catch(error){
  next(error);
 }
};

export const getBusinessById=async(req,res,next)=>{
 try{
  await BusinessType;
  await Tagline;
  await Footer;
  await State;
  await County;
  await Country;

  const business=await Business.findById(req.params.id)
   .populate(businessPopulate);

  if(!business)return res.status(404).json({message:"Business not found"});

  res.status(200).json(business);
 }catch(error){
  next(error);
 }
};

export const updateBusiness=async(req,res,next)=>{
 try{
  await BusinessType;
  await Tagline;
  await Footer;
  await State;
  await County;
  await Country;

  const updated=await Business.findByIdAndUpdate(
   req.params.id,
   req.body,
   {returnDocument:"after",runValidators:true}
  );

  if(!updated)return res.status(404).json({message:"Business not found"});

  const populatedBusiness=await Business.findById(updated._id)
   .populate(businessPopulate);

  res.status(200).json(populatedBusiness);
 }catch(error){
  next(error);
 }
};

export const deleteBusiness=async(req,res,next)=>{
 try{
  const business=await Business.findByIdAndDelete(req.params.id);

  if(!business)return res.status(404).json({message:"Business not found"});

  res.status(200).json({message:"Business deleted successfully"});
 }catch(error){
  next(error);
 }
};