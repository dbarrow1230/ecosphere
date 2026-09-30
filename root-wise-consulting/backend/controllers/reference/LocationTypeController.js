// backend/controllers/reference/LocationTypeController.js
import LocationType from "../../models/reference/LocationTypeModel.js";

export const createLocationType=async(req,res)=>{
 try{
  const{name,description,isActive}=req.body;
  if(!name?.trim())return res.status(400).json({message:"Name is required"});

  const existing=await LocationType.findOne({name:name.trim()});
  if(existing)return res.status(409).json({message:"Location type already exists"});

  const locationType=await LocationType.create({
   name:name.trim(),
   description:description?.trim()||"",
   isActive:isActive!==undefined?isActive:true
  });

  return res.status(201).json({message:"Location type created successfully",locationType});
 }catch(error){
  return res.status(500).json({message:"Failed to create location type",error:error.message});
 }
};

export const getLocationTypes=async(req,res)=>{
 try{
  const filter={};
  if(req.query.isActive!==undefined)filter.isActive=req.query.isActive==="true";

  const locationTypes=await LocationType.find(filter).sort({name:1});
  return res.status(200).json(locationTypes);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch location types",error:error.message});
 }
};

export const getLocationTypeById=async(req,res)=>{
 try{
  const locationType=await LocationType.findById(req.params.id);
  if(!locationType)return res.status(404).json({message:"Location type not found"});
  return res.status(200).json(locationType);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch location type",error:error.message});
 }
};

export const updateLocationType=async(req,res)=>{
 try{
  const{name,description,isActive}=req.body;
  const locationType=await LocationType.findById(req.params.id);
  if(!locationType)return res.status(404).json({message:"Location type not found"});

  if(name!==undefined){
   if(!name?.trim())return res.status(400).json({message:"Name is required"});
   const existing=await LocationType.findOne({_id:{$ne:req.params.id},name:name.trim()});
   if(existing)return res.status(409).json({message:"Location type already exists"});
   locationType.name=name.trim();
  }

  if(description!==undefined)locationType.description=description?.trim()||"";
  if(isActive!==undefined)locationType.isActive=isActive;

  await locationType.save();

  return res.status(200).json({message:"Location type updated successfully",locationType});
 }catch(error){
  return res.status(500).json({message:"Failed to update location type",error:error.message});
 }
};

export const deleteLocationType=async(req,res)=>{
 try{
  const locationType=await LocationType.findByIdAndDelete(req.params.id);
  if(!locationType)return res.status(404).json({message:"Location type not found"});
  return res.status(200).json({message:"Location type deleted successfully"});
 }catch(error){
  return res.status(500).json({message:"Failed to delete location type",error:error.message});
 }
};