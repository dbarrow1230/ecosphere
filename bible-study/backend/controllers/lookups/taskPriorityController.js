// backend/controllers/lookups/taskPriorityController.js
import TaskPriority from "../../models/lookups/taskPriorityModel.js";

export const getTaskPriorities=async(req,res)=>{
 try{
  const {active}=req.query;
  const filter={};

  if(active==="true")filter.active=true;
  if(active==="false")filter.active=false;

  const priorities=await TaskPriority.find(filter).sort({sortOrder:1,title:1});

  return res.status(200).json({
   success:true,
   count:priorities.length,
   data:priorities
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch task priorities",
   error:err.message
  });
 }
};

export const getTaskPriorityById=async(req,res)=>{
 try{
  const priority=await TaskPriority.findById(req.params.id);

  if(!priority){
   return res.status(404).json({
    success:false,
    message:"Task priority not found"
   });
  }

  return res.status(200).json({
   success:true,
   data:priority
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch task priority",
   error:err.message
  });
 }
};

export const createTaskPriority=async(req,res)=>{
 try{
  const priority=await TaskPriority.create(req.body);

  return res.status(201).json({
   success:true,
   message:"Task priority created successfully",
   data:priority
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to create task priority",
   error:err.message
  });
 }
};

export const updateTaskPriority=async(req,res)=>{
 try{
  const priority=await TaskPriority.findByIdAndUpdate(req.params.id,req.body,{
   returnDocument:"after",
   runValidators:true
  });

  if(!priority){
   return res.status(404).json({
    success:false,
    message:"Task priority not found"
   });
  }

  return res.status(200).json({
   success:true,
   message:"Task priority updated successfully",
   data:priority
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to update task priority",
   error:err.message
  });
 }
};

export const deleteTaskPriority=async(req,res)=>{
 try{
  const priority=await TaskPriority.findByIdAndDelete(req.params.id);

  if(!priority){
   return res.status(404).json({
    success:false,
    message:"Task priority not found"
   });
  }

  return res.status(200).json({
   success:true,
   message:"Task priority deleted successfully"
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to delete task priority",
   error:err.message
  });
 }
};