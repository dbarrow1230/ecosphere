// backend/controllers/stationController.js
import Station from "../models/stationModel.js";

export const getStations=async(req,res)=>{
 try{
  const filter={};

  if(req.query.active==="true") filter.active=true;
  if(req.query.active==="false") filter.active=false;

  const stations=await Station.find(filter).sort({sortOrder:1,name:1});

  res.status(200).json({success:true,count:stations.length,stations});
 }catch(err){
  console.error("Error fetching stations:",err);
  res.status(500).json({success:false,message:"Failed to fetch stations."});
 }
};

export const getStationById=async(req,res)=>{
 try{
  const station=await Station.findById(req.params.id);

  if(!station){
   return res.status(404).json({success:false,message:"Station not found."});
  }

  res.status(200).json({success:true,station});
 }catch(err){
  console.error("Error fetching station:",err);
  res.status(500).json({success:false,message:"Failed to fetch station."});
 }
};

export const createStation=async(req,res)=>{
 try{
  const payload={
   name:req.body.name,
   code:req.body.code||"",
   description:req.body.description||"",
   active:typeof req.body.active==="boolean"?req.body.active:true,
   sortOrder:Number(req.body.sortOrder||0)
  };

  const station=await Station.create(payload);

  res.status(201).json({success:true,message:"Station created successfully.",station});
 }catch(err){
  console.error("Error creating station:",err);
  res.status(500).json({success:false,message:"Failed to create station."});
 }
};

export const updateStation=async(req,res)=>{
 try{
  const payload={
   name:req.body.name,
   code:req.body.code||"",
   description:req.body.description||"",
   active:typeof req.body.active==="boolean"?req.body.active:true,
   sortOrder:Number(req.body.sortOrder||0)
  };

  const station=await Station.findByIdAndUpdate(req.params.id,payload,{returnDocument:"after",runValidators:true});

  if(!station){
   return res.status(404).json({success:false,message:"Station not found."});
  }

  res.status(200).json({success:true,message:"Station updated successfully.",station});
 }catch(err){
  console.error("Error updating station:",err);
  res.status(500).json({success:false,message:"Failed to update station."});
 }
};

export const deleteStation=async(req,res)=>{
 try{
  const station=await Station.findByIdAndDelete(req.params.id);

  if(!station){
   return res.status(404).json({success:false,message:"Station not found."});
  }

  res.status(200).json({success:true,message:"Station deleted successfully."});
 }catch(err){
  console.error("Error deleting station:",err);
  res.status(500).json({success:false,message:"Failed to delete station."});
 }
};