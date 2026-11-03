// backend/controllers/scheduling/scheduleController.js
import Schedule from "../../models/scheduling/scheduleModel.js";

export const createSchedule=async(req,res)=>{
 try{
  const payload={
   business:req.body.business,
   department:req.body.department||null,
   title:req.body.title||"",
   weekStart:req.body.weekStart,
   weekEnd:req.body.weekEnd,
   status:req.body.status||"draft",
   publishedAt:req.body.publishedAt||null,
   notes:req.body.notes||""
  };

  if(!payload.business||!payload.weekStart||!payload.weekEnd){
   return res.status(400).json({message:"business, weekStart, and weekEnd are required"});
  }

  const schedule=await Schedule.create(payload);

  const populatedSchedule=await Schedule.findById(schedule._id)
   .populate("business","name")
   .populate("department","name");

  res.status(201).json({
   message:"Schedule created successfully",
   data:populatedSchedule
  });
 }catch(err){
  if(err?.code===11000){
   return res.status(409).json({message:"Schedule already exists for this business and week start"});
  }
  res.status(500).json({message:"Failed to create schedule",error:err.message});
 }
};

export const getSchedules=async(req,res)=>{
 try{
  const query={};

  if(req.query.business)query.business=req.query.business;
  if(req.query.department)query.department=req.query.department;
  if(req.query.status)query.status=req.query.status;

  if(req.query.weekStartFrom||req.query.weekStartTo){
   query.weekStart={};
   if(req.query.weekStartFrom)query.weekStart.$gte=new Date(req.query.weekStartFrom);
   if(req.query.weekStartTo)query.weekStart.$lte=new Date(req.query.weekStartTo);
   if(!Object.keys(query.weekStart).length)delete query.weekStart;
  }

  if(req.query.weekEndFrom||req.query.weekEndTo){
   query.weekEnd={};
   if(req.query.weekEndFrom)query.weekEnd.$gte=new Date(req.query.weekEndFrom);
   if(req.query.weekEndTo)query.weekEnd.$lte=new Date(req.query.weekEndTo);
   if(!Object.keys(query.weekEnd).length)delete query.weekEnd;
  }

  if(req.query.search){
   const value=req.query.search.trim();
   query.$or=[
    {title:{$regex:value,$options:"i"}},
    {notes:{$regex:value,$options:"i"}}
   ];
  }

  const schedules=await Schedule.find(query)
   .populate("business","name")
   .populate("department","name")
   .sort({weekStart:-1,createdAt:-1});

  res.status(200).json({
   message:"Schedules fetched successfully",
   data:schedules
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch schedules",error:err.message});
 }
};

export const getScheduleById=async(req,res)=>{
 try{
  const schedule=await Schedule.findById(req.params.id)
   .populate("business","name")
   .populate("department","name");

  if(!schedule){
   return res.status(404).json({message:"Schedule not found"});
  }

  res.status(200).json({
   message:"Schedule fetched successfully",
   data:schedule
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch schedule",error:err.message});
 }
};

export const updateSchedule=async(req,res)=>{
 try{
  const existing=await Schedule.findById(req.params.id);

  if(!existing){
   return res.status(404).json({message:"Schedule not found"});
  }

  const schedule=await Schedule.findByIdAndUpdate(
   req.params.id,
   {
    $set:{
     business:req.body.business!==undefined?req.body.business:existing.business,
     department:req.body.department!==undefined?req.body.department:existing.department,
     title:req.body.title!==undefined?req.body.title:existing.title,
     weekStart:req.body.weekStart!==undefined?req.body.weekStart:existing.weekStart,
     weekEnd:req.body.weekEnd!==undefined?req.body.weekEnd:existing.weekEnd,
     status:req.body.status!==undefined?req.body.status:existing.status,
     publishedAt:req.body.publishedAt!==undefined?req.body.publishedAt:existing.publishedAt,
     notes:req.body.notes!==undefined?req.body.notes:existing.notes
    }
   },
   {returnDocument:"after",runValidators:true}
  )
   .populate("business","name")
   .populate("department","name");

  res.status(200).json({
   message:"Schedule updated successfully",
   data:schedule
  });
 }catch(err){
  if(err?.code===11000){
   return res.status(409).json({message:"Schedule already exists for this business and week start"});
  }
  res.status(500).json({message:"Failed to update schedule",error:err.message});
 }
};

export const deleteSchedule=async(req,res)=>{
 try{
  const schedule=await Schedule.findByIdAndDelete(req.params.id);

  if(!schedule){
   return res.status(404).json({message:"Schedule not found"});
  }

  res.status(200).json({
   message:"Schedule deleted successfully"
  });
 }catch(err){
  res.status(500).json({message:"Failed to delete schedule",error:err.message});
 }
};