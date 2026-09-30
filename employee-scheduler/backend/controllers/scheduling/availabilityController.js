// backend/controllers/scheduling/availabilityController.js
import Availability from "../../models/scheduling/availabilityModel.js";

export const createAvailability=async(req,res)=>{
 try{
  const payload={
   business:req.body.business,
   employee:req.body.employee,
   weekly:Array.isArray(req.body.weekly)?req.body.weekly:[],
   overrides:Array.isArray(req.body.overrides)?req.body.overrides:[],
   effectiveFrom:req.body.effectiveFrom||null,
   effectiveTo:req.body.effectiveTo||null,
   notes:req.body.notes||""
  };

  if(!payload.business||!payload.employee){
   return res.status(400).json({message:"business and employee are required"});
  }

  const availability=await Availability.create(payload);

  const populatedAvailability=await Availability.findById(availability._id)
   .populate("business","name")
   .populate("employee","firstName lastName employeeId");

  res.status(201).json({
   message:"Availability created successfully",
   data:populatedAvailability
  });
 }catch(err){
  if(err?.code===11000){
   return res.status(409).json({message:"Availability already exists for this employee"});
  }
  res.status(500).json({message:"Failed to create availability",error:err.message});
 }
};

export const getAvailabilities=async(req,res)=>{
 try{
  const query={};

  if(req.query.business)query.business=req.query.business;
  if(req.query.employee)query.employee=req.query.employee;

  if(req.query.effectiveDate){
   const effectiveDate=new Date(req.query.effectiveDate);
   query.$and=[
    {
     $or:[
      {effectiveFrom:null},
      {effectiveFrom:{$lte:effectiveDate}}
     ]
    },
    {
     $or:[
      {effectiveTo:null},
      {effectiveTo:{$gte:effectiveDate}}
     ]
    }
   ];
  }

  const availabilities=await Availability.find(query)
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .sort({createdAt:-1});

  res.status(200).json({
   message:"Availabilities fetched successfully",
   data:availabilities
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch availabilities",error:err.message});
 }
};

export const getAvailabilityById=async(req,res)=>{
 try{
  const availability=await Availability.findById(req.params.id)
   .populate("business","name")
   .populate("employee","firstName lastName employeeId");

  if(!availability){
   return res.status(404).json({message:"Availability not found"});
  }

  res.status(200).json({
   message:"Availability fetched successfully",
   data:availability
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch availability",error:err.message});
 }
};

export const getAvailabilityByEmployeeId=async(req,res)=>{
 try{
  const query={employee:req.params.employeeId};

  if(req.query.business)query.business=req.query.business;

  if(req.query.effectiveDate){
   const effectiveDate=new Date(req.query.effectiveDate);
   query.$and=[
    {
     $or:[
      {effectiveFrom:null},
      {effectiveFrom:{$lte:effectiveDate}}
     ]
    },
    {
     $or:[
      {effectiveTo:null},
      {effectiveTo:{$gte:effectiveDate}}
     ]
    }
   ];
  }

  const availability=await Availability.findOne(query)
   .populate("business","name")
   .populate("employee","firstName lastName employeeId");

  if(!availability){
   return res.status(404).json({message:"Availability not found"});
  }

  res.status(200).json({
   message:"Availability fetched successfully",
   data:availability
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch availability",error:err.message});
 }
};

export const updateAvailability=async(req,res)=>{
 try{
  const existing=await Availability.findById(req.params.id);

  if(!existing){
   return res.status(404).json({message:"Availability not found"});
  }

  const availability=await Availability.findByIdAndUpdate(
   req.params.id,
   {
    $set:{
     business:req.body.business!==undefined?req.body.business:existing.business,
     employee:req.body.employee!==undefined?req.body.employee:existing.employee,
     weekly:req.body.weekly!==undefined?req.body.weekly:existing.weekly,
     overrides:req.body.overrides!==undefined?req.body.overrides:existing.overrides,
     effectiveFrom:req.body.effectiveFrom!==undefined?req.body.effectiveFrom:existing.effectiveFrom,
     effectiveTo:req.body.effectiveTo!==undefined?req.body.effectiveTo:existing.effectiveTo,
     notes:req.body.notes!==undefined?req.body.notes:existing.notes
    }
   },
   {returnDocument:"after",runValidators:true}
  )
   .populate("business","name")
   .populate("employee","firstName lastName employeeId");

  res.status(200).json({
   message:"Availability updated successfully",
   data:availability
  });
 }catch(err){
  if(err?.code===11000){
   return res.status(409).json({message:"Availability already exists for this employee"});
  }
  res.status(500).json({message:"Failed to update availability",error:err.message});
 }
};

export const deleteAvailability=async(req,res)=>{
 try{
  const availability=await Availability.findByIdAndDelete(req.params.id);

  if(!availability){
   return res.status(404).json({message:"Availability not found"});
  }

  res.status(200).json({
   message:"Availability deleted successfully"
  });
 }catch(err){
  res.status(500).json({message:"Failed to delete availability",error:err.message});
 }
};