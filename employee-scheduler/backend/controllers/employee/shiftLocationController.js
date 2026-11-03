// backend/controllers/employee/shiftLocationController.js
import ShiftLocation from "../../models/employee/shiftLocationModel.js";

export const createShiftLocation=async(req,res)=>{
 try{
  const payload={
   business:req.body.business,
   name:req.body.name||"",
   code:req.body.code||"",
   description:req.body.description||"",
   isActive:req.body.isActive!==undefined?req.body.isActive:true,
   notes:Array.isArray(req.body.notes)?req.body.notes:[]
  };

  if(!payload.business||!payload.name){
   return res.status(400).json({message:"business and name are required"});
  }

  const shiftLocation=await ShiftLocation.create(payload);

  res.status(201).json({
   message:"Shift location created successfully",
   data:shiftLocation
  });
 }catch(err){
  if(err?.code===11000){
   return res.status(409).json({message:"Shift location name or code already exists for this business"});
  }
  res.status(500).json({message:"Failed to create shift location",error:err.message});
 }
};

export const getShiftLocations=async(req,res)=>{
 try{
  const query={};

  if(req.query.business)query.business=req.query.business;
  if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";
  if(req.query.search){
   const value=req.query.search.trim();
   query.$or=[
    {name:{$regex:value,$options:"i"}},
    {code:{$regex:value,$options:"i"}},
    {description:{$regex:value,$options:"i"}}
   ];
  }

  const shiftLocations=await ShiftLocation.find(query)
   .populate("business","name")
   .sort({name:1});

  res.status(200).json({
   message:"Shift locations fetched successfully",
   data:shiftLocations
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch shift locations",error:err.message});
 }
};

export const getShiftLocationById=async(req,res)=>{
 try{
  const shiftLocation=await ShiftLocation.findById(req.params.id)
   .populate("business","name");

  if(!shiftLocation){
   return res.status(404).json({message:"Shift location not found"});
  }

  res.status(200).json({
   message:"Shift location fetched successfully",
   data:shiftLocation
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch shift location",error:err.message});
 }
};

export const updateShiftLocation=async(req,res)=>{
 try{
  const existing=await ShiftLocation.findById(req.params.id);

  if(!existing){
   return res.status(404).json({message:"Shift location not found"});
  }

  const shiftLocation=await ShiftLocation.findByIdAndUpdate(
   req.params.id,
   {
    $set:{
     business:req.body.business!==undefined?req.body.business:existing.business,
     name:req.body.name!==undefined?req.body.name:existing.name,
     code:req.body.code!==undefined?req.body.code:existing.code,
     description:req.body.description!==undefined?req.body.description:existing.description,
     isActive:req.body.isActive!==undefined?req.body.isActive:existing.isActive,
     notes:req.body.notes!==undefined?req.body.notes:existing.notes
    }
   },
   {returnDocument:"after",runValidators:true}
  )
   .populate("business","name");

  res.status(200).json({
   message:"Shift location updated successfully",
   data:shiftLocation
  });
 }catch(err){
  if(err?.code===11000){
   return res.status(409).json({message:"Shift location name or code already exists for this business"});
  }
  res.status(500).json({message:"Failed to update shift location",error:err.message});
 }
};

export const deleteShiftLocation=async(req,res)=>{
 try{
  const shiftLocation=await ShiftLocation.findByIdAndDelete(req.params.id);

  if(!shiftLocation){
   return res.status(404).json({message:"Shift location not found"});
  }

  res.status(200).json({
   message:"Shift location deleted successfully"
  });
 }catch(err){
  res.status(500).json({message:"Failed to delete shift location",error:err.message});
 }
};