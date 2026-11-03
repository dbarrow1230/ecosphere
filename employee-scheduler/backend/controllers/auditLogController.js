// backend/controllers/auditLogController.js
import AuditLog from "../models/auditLogModel.js";

export const createAuditLog=async(req,res)=>{
 try{
  const payload={
   business:req.body.business,
   entityType:req.body.entityType||"",
   entityId:req.body.entityId||null,
   action:req.body.action||"",
   description:req.body.description||"",
   employee:req.body.employee||null,
   user:req.body.user||null,
   changes:Array.isArray(req.body.changes)?req.body.changes:[],
   ipAddress:req.body.ipAddress||"",
   userAgent:req.body.userAgent||"",
   notes:req.body.notes||""
  };

  if(!payload.business||!payload.entityType||!payload.entityId||!payload.action){
   return res.status(400).json({message:"business, entityType, entityId, and action are required"});
  }

  const auditLog=await AuditLog.create(payload);

  const populatedAuditLog=await AuditLog.findById(auditLog._id)
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("user","username name email");

  res.status(201).json({
   message:"Audit log created successfully",
   data:populatedAuditLog
  });
 }catch(err){
  res.status(500).json({message:"Failed to create audit log",error:err.message});
 }
};

export const getAuditLogs=async(req,res)=>{
 try{
  const query={};

  if(req.query.business)query.business=req.query.business;
  if(req.query.entityType)query.entityType=req.query.entityType;
  if(req.query.entityId)query.entityId=req.query.entityId;
  if(req.query.action)query.action=req.query.action;
  if(req.query.employee)query.employee=req.query.employee;
  if(req.query.user)query.user=req.query.user;

  if(req.query.createdFrom||req.query.createdTo){
   query.createdAt={};
   if(req.query.createdFrom)query.createdAt.$gte=new Date(req.query.createdFrom);
   if(req.query.createdTo)query.createdAt.$lte=new Date(req.query.createdTo);
   if(!Object.keys(query.createdAt).length)delete query.createdAt;
  }

  if(req.query.search){
   const value=req.query.search.trim();
   query.$or=[
    {entityType:{$regex:value,$options:"i"}},
    {action:{$regex:value,$options:"i"}},
    {description:{$regex:value,$options:"i"}},
    {notes:{$regex:value,$options:"i"}}
   ];
  }

  const auditLogs=await AuditLog.find(query)
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("user","username name email")
   .sort({createdAt:-1});

  res.status(200).json({
   message:"Audit logs fetched successfully",
   data:auditLogs
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch audit logs",error:err.message});
 }
};

export const getAuditLogById=async(req,res)=>{
 try{
  const auditLog=await AuditLog.findById(req.params.id)
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("user","username name email");

  if(!auditLog){
   return res.status(404).json({message:"Audit log not found"});
  }

  res.status(200).json({
   message:"Audit log fetched successfully",
   data:auditLog
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch audit log",error:err.message});
 }
};

export const updateAuditLog=async(req,res)=>{
 try{
  const existing=await AuditLog.findById(req.params.id);

  if(!existing){
   return res.status(404).json({message:"Audit log not found"});
  }

  const auditLog=await AuditLog.findByIdAndUpdate(
   req.params.id,
   {
    $set:{
     business:req.body.business!==undefined?req.body.business:existing.business,
     entityType:req.body.entityType!==undefined?req.body.entityType:existing.entityType,
     entityId:req.body.entityId!==undefined?req.body.entityId:existing.entityId,
     action:req.body.action!==undefined?req.body.action:existing.action,
     description:req.body.description!==undefined?req.body.description:existing.description,
     employee:req.body.employee!==undefined?req.body.employee:existing.employee,
     user:req.body.user!==undefined?req.body.user:existing.user,
     changes:req.body.changes!==undefined?req.body.changes:existing.changes,
     ipAddress:req.body.ipAddress!==undefined?req.body.ipAddress:existing.ipAddress,
     userAgent:req.body.userAgent!==undefined?req.body.userAgent:existing.userAgent,
     notes:req.body.notes!==undefined?req.body.notes:existing.notes
    }
   },
   {returnDocument:"after",runValidators:true}
  )
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("user","username name email");

  res.status(200).json({
   message:"Audit log updated successfully",
   data:auditLog
  });
 }catch(err){
  res.status(500).json({message:"Failed to update audit log",error:err.message});
 }
};

export const deleteAuditLog=async(req,res)=>{
 try{
  const auditLog=await AuditLog.findByIdAndDelete(req.params.id);

  if(!auditLog){
   return res.status(404).json({message:"Audit log not found"});
  }

  res.status(200).json({
   message:"Audit log deleted successfully"
  });
 }catch(err){
  res.status(500).json({message:"Failed to delete audit log",error:err.message});
 }
};