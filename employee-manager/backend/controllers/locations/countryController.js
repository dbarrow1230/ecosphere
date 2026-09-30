// backend/controllers/locations/countryController.js
import mongoose from "mongoose";
import Country from "../../models/locations/countryModel.js";

export const createCountry=async(req,res)=>{
 try{
  const{
   name,
   iso2,
   iso3,
   flag,
   phoneCode,
   currency,
   timezone,
   utcOffset
  }=req.body;

  if(!name||!iso2)
   return res.status(400).json({success:false,message:"name and iso2 are required"});

  const country=await Country.create({
   name,
   iso2,
   iso3,
   flag,
   phoneCode,
   currency,
   timezone,
   utcOffset
  });

  return res.status(201).json({success:true,message:"Country created successfully",data:country});
 }
 catch(error){
  if(error.code===11000)
   return res.status(409).json({success:false,message:"Country already exists"});
  return res.status(500).json({success:false,message:"Failed to create country",error:error.message});
 }
};

export const getCountries=async(req,res)=>{
 try{
  const{name,iso2,currency}=req.query;
  const query={};

  if(name)query.name=name;
  if(iso2)query.iso2=iso2.toUpperCase();
  if(currency)query.currency=currency.toUpperCase();

  const countries=await Country.find(query).sort({name:1});

  return res.status(200).json({success:true,count:countries.length,data:countries});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch countries",error:error.message});
 }
};

export const getCountryById=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"Invalid country id"});

  const country=await Country.findById(id);

  if(!country)
   return res.status(404).json({success:false,message:"Country not found"});

  return res.status(200).json({success:true,data:country});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch country",error:error.message});
 }
};

export const updateCountry=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"Invalid country id"});

  const country=await Country.findByIdAndUpdate(
   id,
   req.body,
   {new:true,runValidators:true}
  );

  if(!country)
   return res.status(404).json({success:false,message:"Country not found"});

  return res.status(200).json({success:true,message:"Country updated successfully",data:country});
 }
 catch(error){
  if(error.code===11000)
   return res.status(409).json({success:false,message:"Country already exists"});
  return res.status(500).json({success:false,message:"Failed to update country",error:error.message});
 }
};

export const deleteCountry=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"Invalid country id"});

  const country=await Country.findByIdAndDelete(id);

  if(!country)
   return res.status(404).json({success:false,message:"Country not found"});

  return res.status(200).json({success:true,message:"Country deleted successfully"});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to delete country",error:error.message});
 }
};