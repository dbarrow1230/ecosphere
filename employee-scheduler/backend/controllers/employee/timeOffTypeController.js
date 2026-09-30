// backend/controllers/employee/timeOffTypeController.js
import TimeOffType from "../../models/employee/timeOffTypeModel.js";

export const createTimeOffType=async(req,res)=>{
 try{
  const payload={
   business:req.body.business,
   name:req.body.name||"",
   code:req.body.code||"",
   description:req.body.description||"",
   category:req.body.category||"other",
   isPaid:req.body.isPaid!==undefined?req.body.isPaid:false,
   requiresApproval:req.body.requiresApproval!==undefined?req.body.requiresApproval:true,
   color:req.body.color||"",
   isActive:req.body.isActive!==undefined?req.body.isActive:true,
   notes:Array.isArray(req.body.notes)?req.body.notes:[]
  };

  if(!payload.business||!payload.name){
   return res.status(400).json({message:"business and name are required"});
  }

  const timeOffType=await TimeOffType.create(payload);

  res.status(201).json({
   message:"Time off type created successfully",
   data:timeOffType
  });
 }catch(err){
  if(err?.code===11000){
   return res.status(409).json({message:"Time off type name or code already exists for this business"});
  }
  res.status(500).json({message:"Failed to create time off type",error:err.message});
 }
};

export const getTimeOffTypes=async(req,res)=>{
 try{
  const query={};

  if(req.query.business)query.business=req.query.business;
  if(req.query.category)query.category=req.query.category;
  if(req.query.isPaid!==undefined)query.isPaid=req.query.isPaid==="true";
  if(req.query.requiresApproval!==undefined)query.requiresApproval=req.query.requiresApproval==="true";
  if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";
  if(req.query.search){
   const value=req.query.search.trim();
   query.$or=[
    {name:{$regex:value,$options:"i"}},
    {code:{$regex:value,$options:"i"}},
    {description:{$regex:value,$options:"i"}},
    {category:{$regex:value,$options:"i"}}
   ];
  }

  const timeOffTypes=await TimeOffType.find(query)
   .populate("business","name")
   .sort({name:1});

  res.status(200).json({
   message:"Time off types fetched successfully",
   data:timeOffTypes
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch time off types",error:err.message});
 }
};

export const getTimeOffTypeById=async(req,res)=>{
 try{
  const timeOffType=await TimeOffType.findById(req.params.id)
   .populate("business","name");

  if(!timeOffType){
   return res.status(404).json({message:"Time off type not found"});
  }

  res.status(200).json({
   message:"Time off type fetched successfully",
   data:timeOffType
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch time off type",error:err.message});
 }
};

export const updateTimeOffType=async(req,res)=>{
 try{
  const existing=await TimeOffType.findById(req.params.id);

  if(!existing){
   return res.status(404).json({message:"Time off type not found"});
  }

  const timeOffType=await TimeOffType.findByIdAndUpdate(
   req.params.id,
   {
    $set:{
     business:req.body.business!==undefined?req.body.business:existing.business,
     name:req.body.name!==undefined?req.body.name:existing.name,
     code:req.body.code!==undefined?req.body.code:existing.code,
     description:req.body.description!==undefined?req.body.description:existing.description,
     category:req.body.category!==undefined?req.body.category:existing.category,
     isPaid:req.body.isPaid!==undefined?req.body.isPaid:existing.isPaid,
     requiresApproval:req.body.requiresApproval!==undefined?req.body.requiresApproval:existing.requiresApproval,
     color:req.body.color!==undefined?req.body.color:existing.color,
     isActive:req.body.isActive!==undefined?req.body.isActive:existing.isActive,
     notes:req.body.notes!==undefined?req.body.notes:existing.notes
    }
   },
   {returnDocument:"after",runValidators:true}
  )
   .populate("business","name");

  res.status(200).json({
   message:"Time off type updated successfully",
   data:timeOffType
  });
 }catch(err){
  if(err?.code===11000){
   return res.status(409).json({message:"Time off type name or code already exists for this business"});
  }
  res.status(500).json({message:"Failed to update time off type",error:err.message});
 }
};

export const deleteTimeOffType=async(req,res)=>{
 try{
  const timeOffType=await TimeOffType.findByIdAndDelete(req.params.id);

  if(!timeOffType){
   return res.status(404).json({message:"Time off type not found"});
  }

  res.status(200).json({
   message:"Time off type deleted successfully"
  });
 }catch(err){
  res.status(500).json({message:"Failed to delete time off type",error:err.message});
 }
};