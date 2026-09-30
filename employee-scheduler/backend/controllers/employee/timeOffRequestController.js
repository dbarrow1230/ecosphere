// backend/controllers/employee/timeOffRequestController.js
import TimeOffRequest from "../../models/employee/timeOffRequestModel.js";

export const createTimeOffRequest=async(req,res)=>{
 try{
  const payload={
   business:req.body.business,
   employee:req.body.employee,
   department:req.body.department||null,
   timeOffType:req.body.timeOffType||null,
   type:req.body.type||"other",
   startDate:req.body.startDate,
   endDate:req.body.endDate,
   isPartialDay:req.body.isPartialDay!==undefined?req.body.isPartialDay:false,
   partialDayStart:req.body.partialDayStart||"",
   partialDayEnd:req.body.partialDayEnd||"",
   reason:req.body.reason||"",
   status:req.body.status||"pending",
   reviewedBy:req.body.reviewedBy||null,
   reviewedAt:req.body.reviewedAt||null,
   reviewNote:req.body.reviewNote||"",
   notes:Array.isArray(req.body.notes)?req.body.notes:[]
  };

  if(!payload.business||!payload.employee||!payload.startDate||!payload.endDate){
   return res.status(400).json({message:"business, employee, startDate, and endDate are required"});
  }

  const timeOffRequest=await TimeOffRequest.create(payload);

  const populatedTimeOffRequest=await TimeOffRequest.findById(timeOffRequest._id)
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("department","name")
   .populate("timeOffType","name code")
   .populate("reviewedBy","firstName lastName employeeId");

  res.status(201).json({
   message:"Time off request created successfully",
   data:populatedTimeOffRequest
  });
 }catch(err){
  res.status(500).json({message:"Failed to create time off request",error:err.message});
 }
};

export const getTimeOffRequests=async(req,res)=>{
 try{
  const query={};

  if(req.query.business)query.business=req.query.business;
  if(req.query.employee)query.employee=req.query.employee;
  if(req.query.department)query.department=req.query.department;
  if(req.query.timeOffType)query.timeOffType=req.query.timeOffType;
  if(req.query.type)query.type=req.query.type;
  if(req.query.status)query.status=req.query.status;
  if(req.query.reviewedBy)query.reviewedBy=req.query.reviewedBy;

  if(req.query.startDate||req.query.endDate){
   query.$and=[];
   if(req.query.startDate){
    query.$and.push({endDate:{$gte:new Date(req.query.startDate)}});
   }
   if(req.query.endDate){
    query.$and.push({startDate:{$lte:new Date(req.query.endDate)}});
   }
   if(!query.$and.length)delete query.$and;
  }

  const timeOffRequests=await TimeOffRequest.find(query)
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("department","name")
   .populate("timeOffType","name code")
   .populate("reviewedBy","firstName lastName employeeId")
   .sort({createdAt:-1});

  res.status(200).json({
   message:"Time off requests fetched successfully",
   data:timeOffRequests
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch time off requests",error:err.message});
 }
};

export const getTimeOffRequestById=async(req,res)=>{
 try{
  const timeOffRequest=await TimeOffRequest.findById(req.params.id)
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("department","name")
   .populate("timeOffType","name code")
   .populate("reviewedBy","firstName lastName employeeId");

  if(!timeOffRequest){
   return res.status(404).json({message:"Time off request not found"});
  }

  res.status(200).json({
   message:"Time off request fetched successfully",
   data:timeOffRequest
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch time off request",error:err.message});
 }
};

export const updateTimeOffRequest=async(req,res)=>{
 try{
  const existing=await TimeOffRequest.findById(req.params.id);

  if(!existing){
   return res.status(404).json({message:"Time off request not found"});
  }

  const timeOffRequest=await TimeOffRequest.findByIdAndUpdate(
   req.params.id,
   {
    $set:{
     business:req.body.business!==undefined?req.body.business:existing.business,
     employee:req.body.employee!==undefined?req.body.employee:existing.employee,
     department:req.body.department!==undefined?req.body.department:existing.department,
     timeOffType:req.body.timeOffType!==undefined?req.body.timeOffType:existing.timeOffType,
     type:req.body.type!==undefined?req.body.type:existing.type,
     startDate:req.body.startDate!==undefined?req.body.startDate:existing.startDate,
     endDate:req.body.endDate!==undefined?req.body.endDate:existing.endDate,
     isPartialDay:req.body.isPartialDay!==undefined?req.body.isPartialDay:existing.isPartialDay,
     partialDayStart:req.body.partialDayStart!==undefined?req.body.partialDayStart:existing.partialDayStart,
     partialDayEnd:req.body.partialDayEnd!==undefined?req.body.partialDayEnd:existing.partialDayEnd,
     reason:req.body.reason!==undefined?req.body.reason:existing.reason,
     status:req.body.status!==undefined?req.body.status:existing.status,
     reviewedBy:req.body.reviewedBy!==undefined?req.body.reviewedBy:existing.reviewedBy,
     reviewedAt:req.body.reviewedAt!==undefined?req.body.reviewedAt:existing.reviewedAt,
     reviewNote:req.body.reviewNote!==undefined?req.body.reviewNote:existing.reviewNote,
     notes:req.body.notes!==undefined?req.body.notes:existing.notes
    }
   },
   {returnDocument:"after",runValidators:true}
  )
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("department","name")
   .populate("timeOffType","name code")
   .populate("reviewedBy","firstName lastName employeeId");

  res.status(200).json({
   message:"Time off request updated successfully",
   data:timeOffRequest
  });
 }catch(err){
  res.status(500).json({message:"Failed to update time off request",error:err.message});
 }
};

export const deleteTimeOffRequest=async(req,res)=>{
 try{
  const timeOffRequest=await TimeOffRequest.findByIdAndDelete(req.params.id);

  if(!timeOffRequest){
   return res.status(404).json({message:"Time off request not found"});
  }

  res.status(200).json({
   message:"Time off request deleted successfully"
  });
 }catch(err){
  res.status(500).json({message:"Failed to delete time off request",error:err.message});
 }
};