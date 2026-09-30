// backend/controllers/employee/archiveController.js
import Archive from "../models/archiveModel.js";

export const createArchiveEvent=async(req,res)=>{
 try{
  const payload={
   business:req.body.business,
   employee:req.body.employee,
   eventType:req.body.eventType,
   archivedBy:req.body.archivedBy||null,
   unarchivedBy:req.body.unarchivedBy||null,
   reason:req.body.reason||"",
   archivedAt:req.body.archivedAt||null,
   unarchivedAt:req.body.unarchivedAt||null
  };

  if(!payload.business||!payload.employee||!payload.eventType){
   return res.status(400).json({message:"business, employee, and eventType are required"});
  }

  const archiveEvent=await Archive.create(payload);

  const populatedArchiveEvent=await Archive.findById(archiveEvent._id)
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("archivedBy","username name email")
   .populate("unarchivedBy","username name email");

  res.status(201).json({
   message:"Archive event created successfully",
   data:populatedArchiveEvent
  });
 }catch(err){
  res.status(500).json({message:"Failed to create archive event",error:err.message});
 }
};

export const getArchiveEvents=async(req,res)=>{
 try{
  const query={};

  if(req.query.business)query.business=req.query.business;
  if(req.query.employee)query.employee=req.query.employee;
  if(req.query.eventType)query.eventType=req.query.eventType;
  if(req.query.archivedBy)query.archivedBy=req.query.archivedBy;
  if(req.query.unarchivedBy)query.unarchivedBy=req.query.unarchivedBy;

  if(req.query.archivedFrom||req.query.archivedTo){
   query.archivedAt={};
   if(req.query.archivedFrom)query.archivedAt.$gte=new Date(req.query.archivedFrom);
   if(req.query.archivedTo)query.archivedAt.$lte=new Date(req.query.archivedTo);
   if(!Object.keys(query.archivedAt).length)delete query.archivedAt;
  }

  if(req.query.unarchivedFrom||req.query.unarchivedTo){
   query.unarchivedAt={};
   if(req.query.unarchivedFrom)query.unarchivedAt.$gte=new Date(req.query.unarchivedFrom);
   if(req.query.unarchivedTo)query.unarchivedAt.$lte=new Date(req.query.unarchivedTo);
   if(!Object.keys(query.unarchivedAt).length)delete query.unarchivedAt;
  }

  const archiveEvents=await Archive.find(query)
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("archivedBy","username name email")
   .populate("unarchivedBy","username name email")
   .sort({createdAt:-1});

  res.status(200).json({
   message:"Archive events fetched successfully",
   data:archiveEvents
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch archive events",error:err.message});
 }
};

export const getArchiveEventById=async(req,res)=>{
 try{
  const archiveEvent=await Archive.findById(req.params.id)
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("archivedBy","username name email")
   .populate("unarchivedBy","username name email");

  if(!archiveEvent){
   return res.status(404).json({message:"Archive event not found"});
  }

  res.status(200).json({
   message:"Archive event fetched successfully",
   data:archiveEvent
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch archive event",error:err.message});
 }
};

export const updateArchiveEvent=async(req,res)=>{
 try{
  const existing=await Archive.findById(req.params.id);

  if(!existing){
   return res.status(404).json({message:"Archive event not found"});
  }

  const archiveEvent=await Archive.findByIdAndUpdate(
   req.params.id,
   {
    $set:{
     business:req.body.business!==undefined?req.body.business:existing.business,
     employee:req.body.employee!==undefined?req.body.employee:existing.employee,
     eventType:req.body.eventType!==undefined?req.body.eventType:existing.eventType,
     archivedBy:req.body.archivedBy!==undefined?req.body.archivedBy:existing.archivedBy,
     unarchivedBy:req.body.unarchivedBy!==undefined?req.body.unarchivedBy:existing.unarchivedBy,
     reason:req.body.reason!==undefined?req.body.reason:existing.reason,
     archivedAt:req.body.archivedAt!==undefined?req.body.archivedAt:existing.archivedAt,
     unarchivedAt:req.body.unarchivedAt!==undefined?req.body.unarchivedAt:existing.unarchivedAt
    }
   },
   {returnDocument:"after",runValidators:true}
  )
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("archivedBy","username name email")
   .populate("unarchivedBy","username name email");

  res.status(200).json({
   message:"Archive event updated successfully",
   data:archiveEvent
  });
 }catch(err){
  res.status(500).json({message:"Failed to update archive event",error:err.message});
 }
};

export const deleteArchiveEvent=async(req,res)=>{
 try{
  const archiveEvent=await Archive.findByIdAndDelete(req.params.id);

  if(!archiveEvent){
   return res.status(404).json({message:"Archive event not found"});
  }

  res.status(200).json({
   message:"Archive event deleted successfully"
  });
 }catch(err){
  res.status(500).json({message:"Failed to delete archive event",error:err.message});
 }
};