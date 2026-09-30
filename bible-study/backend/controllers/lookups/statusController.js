// backend/controllers/lookups/statusController.js
import Status from "../../models/lookups/statusModel.js";

export const getStatuses=async(req,res)=>{
 try{
  const {active,category}=req.query;
  const filter={};

  if(active==="true")filter.active=true;
  if(active==="false")filter.active=false;
  if(category)filter.category=category;

  const statuses=await Status.find(filter).sort({sortOrder:1,title:1});

  return res.status(200).json({
   success:true,
   count:statuses.length,
   data:statuses
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch statuses",
   error:err.message
  });
 }
};

export const getStatusById=async(req,res)=>{
 try{
  const status=await Status.findById(req.params.id);

  if(!status){
   return res.status(404).json({
    success:false,
    message:"Status not found"
   });
  }

  return res.status(200).json({
   success:true,
   data:status
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch status",
   error:err.message
  });
 }
};

export const createStatus=async(req,res)=>{
 try{
  const status=await Status.create(req.body);

  return res.status(201).json({
   success:true,
   message:"Status created successfully",
   data:status
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to create status",
   error:err.message
  });
 }
};

export const updateStatus=async(req,res)=>{
 try{
  const status=await Status.findByIdAndUpdate(req.params.id,req.body,{
   returnDocument:"after",
   runValidators:true
  });

  if(!status){
   return res.status(404).json({
    success:false,
    message:"Status not found"
   });
  }

  return res.status(200).json({
   success:true,
   message:"Status updated successfully",
   data:status
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to update status",
   error:err.message
  });
 }
};

export const deleteStatus=async(req,res)=>{
 try{
  const status=await Status.findByIdAndDelete(req.params.id);

  if(!status){
   return res.status(404).json({
    success:false,
    message:"Status not found"
   });
  }

  return res.status(200).json({
   success:true,
   message:"Status deleted successfully"
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to delete status",
   error:err.message
  });
 }
};