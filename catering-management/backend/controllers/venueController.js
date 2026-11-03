import Venue from "../models/venueModel.js";
import State from "../models/locations/stateModel.js";
import Country from "../models/locations/countryModel.js";

export const createVenue=async(req,res)=>{
 try{
  const {name,contactName,email,phone,address1,address2,city,state,country,postalCode,indoorCapacity,outdoorCapacity,notes,status}=req.body;

  const venue=await Venue.create({
   name,
   contactName,
   email,
   phone,
   address1,
   address2,
   city,
   state:state||null,
   country:country||null,
   postalCode,
   indoorCapacity,
   outdoorCapacity,
   notes,
   status
  });

  const populatedVenue=await Venue.findById(venue._id)
   .populate({path:"state",model:State})
   .populate({path:"country",model:Country});

  res.status(201).json({success:true,message:"Venue created successfully",venue:populatedVenue});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const getVenues=async(req,res)=>{
 try{
  const venues=await Venue.find()
   .populate({path:"state",model:State})
   .populate({path:"country",model:Country})
   .sort({name:1});

  res.status(200).json({success:true,count:venues.length,venues});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const getSingleVenue=async(req,res)=>{
 try{
  const venue=await Venue.findById(req.params.id)
   .populate({path:"state",model:State})
   .populate({path:"country",model:Country});

  if(!venue){
   return res.status(404).json({success:false,message:"Venue not found"});
  }

  res.status(200).json({success:true,venue});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const updateVenue=async(req,res)=>{
 try{
  const payload={
   ...req.body,
   state:req.body.state||null,
   country:req.body.country||null
  };

  const updatedVenue=await Venue.findByIdAndUpdate(req.params.id,payload,{returnDocument:"after",runValidators:true});

  if(!updatedVenue){
   return res.status(404).json({success:false,message:"Venue not found"});
  }

  const venue=await Venue.findById(updatedVenue._id)
   .populate({path:"state",model:State})
   .populate({path:"country",model:Country});

  res.status(200).json({success:true,message:"Venue updated successfully",venue});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const deleteVenue=async(req,res)=>{
 try{
  const venue=await Venue.findByIdAndDelete(req.params.id);

  if(!venue){
   return res.status(404).json({success:false,message:"Venue not found"});
  }

  res.status(200).json({success:true,message:"Venue deleted successfully"});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};