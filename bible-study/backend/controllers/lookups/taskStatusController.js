// backend/controllers/lookups/taskStatusController.js
import TaskStatus from "../../models/lookups/taskStatusModel.js";

export const getTaskStatuses=async(req,res)=>{
 try{
  const {active}=req.query;
  const filter={};

  if(active==="true")filter.active=true;
  if(active==="false")filter.active=false;

  const statuses=await TaskStatus.find(filter).sort({sortOrder:1,title:1});

  return res.status(200).json({
   success:true,
   count:statuses.length,
   data:statuses
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch task statuses",
   error:err.message
  });
 }
};

export const getTaskStatusById=async(req,res)=>{
 try{
  const status=await TaskStatus.findById(req.params.id);

  if(!status){
   return res.status(404).json({
    success:false,
    message:"Task status not found"
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
   message:"Failed to fetch task status",
   error:err.message
  });
 }
};

export const createTaskStatus=async(req,res)=>{
 try{
  const status=await TaskStatus.create(req.body);

  return res.status(201).json({
   success:true,
   message:"Task status created successfully",
   data:status
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to create task status",
   error:err.message
  });
 }
};

export const updateTaskStatus=async(req,res)=>{
 try{
  const status=await TaskStatus.findByIdAndUpdate(req.params.id,req.body,{
   returnDocument:"after",
   runValidators:true
  });

  if(!status){
   return res.status(404).json({
    success:false,
    message:"Task status not found"
   });
  }

  return res.status(200).json({
   success:true,
   message:"Task status updated successfully",
   data:status
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to update task status",
   error:err.message
  });
 }
};

export const deleteTaskStatus=async(req,res)=>{
 try{
  const status=await TaskStatus.findByIdAndDelete(req.params.id);

  if(!status){
   return res.status(404).json({
    success:false,
    message:"Task status not found"
   });
  }

  return res.status(200).json({
   success:true,
   message:"Task status deleted successfully"
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to delete task status",
   error:err.message
  });
 }
};