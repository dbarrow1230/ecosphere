import Location from "../models/locationHoursModel.js";

const getLocations=async(req,res)=>{
 try{
  const filter={};
  if(req.query.active==="true")filter.active=true;
  if(req.query.active==="false")filter.active=false;
  if(req.query.borough)filter.borough=req.query.borough;
  if(req.query.county)filter.county=req.query.county;
  if(req.query.state)filter.state=req.query.state;
  if(req.query.country)filter.country=req.query.country;
  const locations=await Location.find(filter)
   .populate("borough")
   .populate("county")
   .populate("state")
   .populate("country")
   .sort({name:1});
  res.status(200).json(locations);
 }catch(err){
  res.status(500).json({message:err.message||"Unable to load locations."});
 }
};

const getLocationById=async(req,res)=>{
 try{
  const location=await Location.findById(req.params.id)
   .populate("borough")
   .populate("county")
   .populate("state")
   .populate("country");
  if(!location)return res.status(404).json({message:"Location not found."});
  res.status(200).json(location);
 }catch(err){
  res.status(500).json({message:err.message||"Unable to load location."});
 }
};

const createLocation=async(req,res)=>{
 try{
  const location=await Location.create({
   name:req.body.name,
   slug:req.body.slug,
   address:req.body.address,
   phone:req.body.phone,
   overnightPhone:req.body.overnightPhone,
   onCallPerson:req.body.onCallPerson,
   onCallPhone:req.body.onCallPhone,
   email:req.body.email,
   borough:req.body.borough,
   county:req.body.county,
   state:req.body.state,
   country:req.body.country,
   hours:req.body.hours||[],
   active:req.body.active??true
  });

  const createdLocation=await Location.findById(location._id)
   .populate("borough")
   .populate("county")
   .populate("state")
   .populate("country");

  res.status(201).json(createdLocation);
 }catch(err){
  res.status(500).json({message:err.message||"Unable to create location."});
 }
};

const updateLocation=async(req,res)=>{
 try{
  const location=await Location.findById(req.params.id);
  if(!location)return res.status(404).json({message:"Location not found."});

  location.name=req.body.name??location.name;
  location.slug=req.body.slug??location.slug;
  location.address=req.body.address??location.address;
  location.phone=req.body.phone??location.phone;
  location.overnightPhone=req.body.overnightPhone??location.overnightPhone;
  location.onCallPerson=req.body.onCallPerson??location.onCallPerson;
  location.onCallPhone=req.body.onCallPhone??location.onCallPhone;
  location.email=req.body.email??location.email;
  location.borough=req.body.borough??location.borough;
  location.county=req.body.county??location.county;
  location.state=req.body.state??location.state;
  location.country=req.body.country??location.country;
  location.hours=req.body.hours??location.hours;
  location.active=req.body.active??location.active;

  await location.save();

  const updatedLocation=await Location.findById(location._id)
   .populate("borough")
   .populate("county")
   .populate("state")
   .populate("country");

  res.status(200).json(updatedLocation);
 }catch(err){
  res.status(500).json({message:err.message||"Unable to update location."});
 }
};

const deleteLocation=async(req,res)=>{
 try{
  const location=await Location.findById(req.params.id);
  if(!location)return res.status(404).json({message:"Location not found."});
  await location.deleteOne();
  res.status(200).json({message:"Location removed."});
 }catch(err){
  res.status(500).json({message:err.message||"Unable to delete location."});
 }
};

export {getLocations,getLocationById,createLocation,updateLocation,deleteLocation};