// backend/controllers/users/auditLogController.js
import AuditLog from "../../models/users/auditLogModel.js";

export const createAuditLog=async(req,res,next)=>{
 try{
  const payload={
   business:req.body.business||null,
   user:req.body.user||null,
   module:req.body.module!==undefined?String(req.body.module).trim().toLowerCase():"",
   action:String(req.body.action||"").trim().toLowerCase(),
   entityType:req.body.entityType!==undefined?String(req.body.entityType).trim():"",
   entityId:req.body.entityId||null,
   before:req.body.before!==undefined?req.body.before:null,
   after:req.body.after!==undefined?req.body.after:null,
   meta:req.body.meta!==undefined?req.body.meta:null,
   ip:req.body.ip!==undefined?String(req.body.ip).trim():String(req.ip||"").trim(),
   userAgent:req.body.userAgent!==undefined?String(req.body.userAgent).trim():String(req.get("user-agent")||"").trim(),
   status:req.body.status==="failed"?"failed":"success"
  };

  if(!payload.action)
   return res.status(400).json({message:"Action is required"});

  const auditLog=await AuditLog.create(payload);

  res.status(201).json(auditLog);
 }catch(error){
  next(error);
 }
};

export const getAuditLogs=async(req,res,next)=>{
 try{
  const query={};

  if(req.query.business)query.business=req.query.business;
  if(req.query.user)query.user=req.query.user;
  if(req.query.module)query.module=String(req.query.module).trim().toLowerCase();
  if(req.query.action)query.action=String(req.query.action).trim().toLowerCase();
  if(req.query.entityType)query.entityType=String(req.query.entityType).trim();
  if(req.query.entityId)query.entityId=req.query.entityId;
  if(req.query.status)query.status=req.query.status;

  if(req.query.startDate||req.query.endDate)
  {
   query.createdAt={};

   if(req.query.startDate)
    query.createdAt.$gte=new Date(req.query.startDate);

   if(req.query.endDate)
    query.createdAt.$lte=new Date(req.query.endDate);
  }

  const limit=Math.min(Number(req.query.limit)||100,500);
  const auditLogs=await AuditLog.find(query)
   .populate("business","legalName code")
   .populate("user","username email")
   .sort({createdAt:-1})
   .limit(limit);

  res.status(200).json(auditLogs);
 }catch(error){
  next(error);
 }
};

export const getAuditLogById=async(req,res,next)=>{
 try{
  const auditLog=await AuditLog.findById(req.params.id)
   .populate("business","legalName code")
   .populate("user","username email");

  if(!auditLog)return res.status(404).json({message:"Audit log not found"});

  res.status(200).json(auditLog);
 }catch(error){
  next(error);
 }
};

export const deleteAuditLog=async(req,res,next)=>{
 try{
  const auditLog=await AuditLog.findByIdAndDelete(req.params.id);

  if(!auditLog)return res.status(404).json({message:"Audit log not found"});

  res.status(200).json({message:"Audit log deleted successfully"});
 }catch(error){
  next(error);
 }
};