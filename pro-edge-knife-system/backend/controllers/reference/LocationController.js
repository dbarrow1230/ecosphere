// backend/controllers/reference/LocationController.js
import Location from "../../models/reference/LocationModel.js";

export const createLocation=async(req,res)=>{
 try{
  const{business,name,code,type,description,parentLocation,isActive}=req.body;

  if(!business)return res.status(400).json({message:"Business is required"});
  if(!name?.trim())return res.status(400).json({message:"Name is required"});
  if(!type)return res.status(400).json({message:"Location type is required"});

  const trimmedName=name.trim();
  const finalCode=code?.trim()?code.trim().toUpperCase():null;

  const existingName=await Location.findOne({business,name:trimmedName});
  if(existingName)return res.status(409).json({message:"Location name already exists for this business"});

  if(finalCode){
   const existingCode=await Location.findOne({business,code:finalCode});
   if(existingCode)return res.status(409).json({message:"Location code already exists for this business"});
  }

  const location=await Location.create({
   business,
   name:trimmedName,
   code:finalCode,
   type,
   description:description?.trim()||"",
   parentLocation:parentLocation||null,
   isActive:isActive!==undefined?isActive:true
  });

  const populatedLocation=await Location.findById(location._id)
   .populate("type")
   .populate("parentLocation")
   .populate("business");

  return res.status(201).json({message:"Location created successfully",location:populatedLocation});
 }catch(error){
  if(error.code===11000)return res.status(409).json({message:"Location already exists"});
  return res.status(500).json({message:"Failed to create location",error:error.message});
 }
};

export const getLocations=async(req,res)=>{
 try{
  const filter={};
  if(req.query.business)filter.business=req.query.business;
  if(req.query.type)filter.type=req.query.type;
  if(req.query.parentLocation)filter.parentLocation=req.query.parentLocation;
  if(req.query.isActive!==undefined)filter.isActive=req.query.isActive==="true";

  const locations=await Location.find(filter)
   .populate("type")
   .populate("parentLocation")
   .populate("business")
   .sort({name:1});

  return res.status(200).json(locations);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch locations",error:error.message});
 }
};

export const getLocationById=async(req,res)=>{
 try{
  const location=await Location.findById(req.params.id)
   .populate("type")
   .populate("parentLocation")
   .populate("business");

  if(!location)return res.status(404).json({message:"Location not found"});
  return res.status(200).json(location);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch location",error:error.message});
 }
};

export const updateLocation=async(req,res)=>{
 try{
  const{business,name,code,type,description,parentLocation,isActive}=req.body;

  const location=await Location.findById(req.params.id);
  if(!location)return res.status(404).json({message:"Location not found"});

  const nextBusiness=business||location.business;

  if(name!==undefined){
   if(!name?.trim())return res.status(400).json({message:"Name is required"});
   const trimmedName=name.trim();
   const existingName=await Location.findOne({_id:{$ne:req.params.id},business:nextBusiness,name:trimmedName});
   if(existingName)return res.status(409).json({message:"Location name already exists for this business"});
   location.name=trimmedName;
  }

  if(code!==undefined){
   const finalCode=code?.trim()?code.trim().toUpperCase():null;
   if(finalCode){
    const existingCode=await Location.findOne({_id:{$ne:req.params.id},business:nextBusiness,code:finalCode});
    if(existingCode)return res.status(409).json({message:"Location code already exists for this business"});
   }
   location.code=finalCode;
  }

  if(business!==undefined)location.business=business;
  if(type!==undefined)location.type=type;
  if(description!==undefined)location.description=description?.trim()||"";
  if(parentLocation!==undefined)location.parentLocation=parentLocation||null;
  if(isActive!==undefined)location.isActive=isActive;

  await location.save();

  const populatedLocation=await Location.findById(location._id)
   .populate("type")
   .populate("parentLocation")
   .populate("business");

  return res.status(200).json({message:"Location updated successfully",location:populatedLocation});
 }catch(error){
  if(error.code===11000)return res.status(409).json({message:"Location already exists"});
  return res.status(500).json({message:"Failed to update location",error:error.message});
 }
};

export const deleteLocation=async(req,res)=>{
 try{
  const location=await Location.findByIdAndDelete(req.params.id);
  if(!location)return res.status(404).json({message:"Location not found"});
  return res.status(200).json({message:"Location deleted successfully"});
 }catch(error){
  return res.status(500).json({message:"Failed to delete location",error:error.message});
 }
};