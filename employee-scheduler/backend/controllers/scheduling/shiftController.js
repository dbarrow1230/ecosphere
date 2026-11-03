// backend/controllers/shift/shiftController.js
import Shift from "../../models/scheduling/shiftModel.js";

export const createShift=async(req,res)=>{
 try{
  const payload={
   business:req.body.business,
   department:req.body.department||null,
   title:req.body.title||"",
   role:req.body.role||null,
   shiftLocation:req.body.shiftLocation||null,
   shiftDate:req.body.shiftDate,
   startTime:req.body.startTime||"",
   endTime:req.body.endTime||"",
   shiftType:req.body.shiftType||"custom",
   status:req.body.status||"draft",
   requiredEmployees:req.body.requiredEmployees!==undefined?req.body.requiredEmployees:1,
   assignedEmployees:Array.isArray(req.body.assignedEmployees)?req.body.assignedEmployees:[],
   breaks:Array.isArray(req.body.breaks)?req.body.breaks:[],
   payRate:req.body.payRate!==undefined?req.body.payRate:0,
   estimatedHours:req.body.estimatedHours!==undefined?req.body.estimatedHours:0,
   actualHours:req.body.actualHours!==undefined?req.body.actualHours:0,
   notes:Array.isArray(req.body.notes)?req.body.notes:[],
   tags:Array.isArray(req.body.tags)?req.body.tags:[],
   published:req.body.published!==undefined?req.body.published:false,
   publishedAt:req.body.publishedAt||null,
   createdBy:req.body.createdBy||null,
   updatedBy:req.body.updatedBy||null
  };

  if(!payload.business||!payload.title||!payload.shiftDate||!payload.startTime||!payload.endTime){
   return res.status(400).json({message:"business, title, shiftDate, startTime, and endTime are required"});
  }

  const shift=await Shift.create(payload);

  const populatedShift=await Shift.findById(shift._id)
   .populate("business","name")
   .populate("department","name")
   .populate("role","name")
   .populate("shiftLocation","name code")
   .populate("createdBy","firstName lastName employeeId")
   .populate("updatedBy","firstName lastName employeeId")
   .populate("assignedEmployees.employee","firstName lastName employeeId")
   .populate("assignedEmployees.assignedBy","firstName lastName employeeId");

  res.status(201).json({
   message:"Shift created successfully",
   data:populatedShift
  });
 }catch(err){
  res.status(500).json({message:"Failed to create shift",error:err.message});
 }
};

export const getShifts=async(req,res)=>{
 try{
  const query={};

  if(req.query.business)query.business=req.query.business;
  if(req.query.department)query.department=req.query.department;
  if(req.query.role)query.role=req.query.role;
  if(req.query.shiftLocation)query.shiftLocation=req.query.shiftLocation;
  if(req.query.shiftType)query.shiftType=req.query.shiftType;
  if(req.query.status)query.status=req.query.status;
  if(req.query.published!==undefined)query.published=req.query.published==="true";
  if(req.query.createdBy)query.createdBy=req.query.createdBy;
  if(req.query.updatedBy)query.updatedBy=req.query.updatedBy;
  if(req.query.employee)query["assignedEmployees.employee"]=req.query.employee;

  if(req.query.shiftDateFrom||req.query.shiftDateTo){
   query.shiftDate={};
   if(req.query.shiftDateFrom)query.shiftDate.$gte=new Date(req.query.shiftDateFrom);
   if(req.query.shiftDateTo)query.shiftDate.$lte=new Date(req.query.shiftDateTo);
   if(!Object.keys(query.shiftDate).length)delete query.shiftDate;
  }

  if(req.query.search){
   const value=req.query.search.trim();
   query.$or=[
    {title:{$regex:value,$options:"i"}},
    {startTime:{$regex:value,$options:"i"}},
    {endTime:{$regex:value,$options:"i"}},
    {tags:{$regex:value,$options:"i"}}
   ];
  }

  const shifts=await Shift.find(query)
   .populate("business","name")
   .populate("department","name")
   .populate("role","name")
   .populate("shiftLocation","name code")
   .populate("createdBy","firstName lastName employeeId")
   .populate("updatedBy","firstName lastName employeeId")
   .populate("assignedEmployees.employee","firstName lastName employeeId")
   .populate("assignedEmployees.assignedBy","firstName lastName employeeId")
   .sort({shiftDate:1,startTime:1,createdAt:-1});

  res.status(200).json({
   message:"Shifts fetched successfully",
   data:shifts
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch shifts",error:err.message});
 }
};

export const getShiftById=async(req,res)=>{
 try{
  const shift=await Shift.findById(req.params.id)
   .populate("business","name")
   .populate("department","name")
   .populate("role","name")
   .populate("shiftLocation","name code")
   .populate("createdBy","firstName lastName employeeId")
   .populate("updatedBy","firstName lastName employeeId")
   .populate("assignedEmployees.employee","firstName lastName employeeId")
   .populate("assignedEmployees.assignedBy","firstName lastName employeeId");

  if(!shift){
   return res.status(404).json({message:"Shift not found"});
  }

  res.status(200).json({
   message:"Shift fetched successfully",
   data:shift
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch shift",error:err.message});
 }
};

export const updateShift=async(req,res)=>{
 try{
  const existing=await Shift.findById(req.params.id);

  if(!existing){
   return res.status(404).json({message:"Shift not found"});
  }

  const shift=await Shift.findByIdAndUpdate(
   req.params.id,
   {
    $set:{
     business:req.body.business!==undefined?req.body.business:existing.business,
     department:req.body.department!==undefined?req.body.department:existing.department,
     title:req.body.title!==undefined?req.body.title:existing.title,
     role:req.body.role!==undefined?req.body.role:existing.role,
     shiftLocation:req.body.shiftLocation!==undefined?req.body.shiftLocation:existing.shiftLocation,
     shiftDate:req.body.shiftDate!==undefined?req.body.shiftDate:existing.shiftDate,
     startTime:req.body.startTime!==undefined?req.body.startTime:existing.startTime,
     endTime:req.body.endTime!==undefined?req.body.endTime:existing.endTime,
     shiftType:req.body.shiftType!==undefined?req.body.shiftType:existing.shiftType,
     status:req.body.status!==undefined?req.body.status:existing.status,
     requiredEmployees:req.body.requiredEmployees!==undefined?req.body.requiredEmployees:existing.requiredEmployees,
     assignedEmployees:req.body.assignedEmployees!==undefined?req.body.assignedEmployees:existing.assignedEmployees,
     breaks:req.body.breaks!==undefined?req.body.breaks:existing.breaks,
     payRate:req.body.payRate!==undefined?req.body.payRate:existing.payRate,
     estimatedHours:req.body.estimatedHours!==undefined?req.body.estimatedHours:existing.estimatedHours,
     actualHours:req.body.actualHours!==undefined?req.body.actualHours:existing.actualHours,
     notes:req.body.notes!==undefined?req.body.notes:existing.notes,
     tags:req.body.tags!==undefined?req.body.tags:existing.tags,
     published:req.body.published!==undefined?req.body.published:existing.published,
     publishedAt:req.body.publishedAt!==undefined?req.body.publishedAt:existing.publishedAt,
     createdBy:req.body.createdBy!==undefined?req.body.createdBy:existing.createdBy,
     updatedBy:req.body.updatedBy!==undefined?req.body.updatedBy:existing.updatedBy
    }
   },
   {returnDocument:"after",runValidators:true}
  )
   .populate("business","name")
   .populate("department","name")
   .populate("role","name")
   .populate("shiftLocation","name code")
   .populate("createdBy","firstName lastName employeeId")
   .populate("updatedBy","firstName lastName employeeId")
   .populate("assignedEmployees.employee","firstName lastName employeeId")
   .populate("assignedEmployees.assignedBy","firstName lastName employeeId");

  res.status(200).json({
   message:"Shift updated successfully",
   data:shift
  });
 }catch(err){
  res.status(500).json({message:"Failed to update shift",error:err.message});
 }
};

export const deleteShift=async(req,res)=>{
 try{
  const shift=await Shift.findByIdAndDelete(req.params.id);

  if(!shift){
   return res.status(404).json({message:"Shift not found"});
  }

  res.status(200).json({
   message:"Shift deleted successfully"
  });
 }catch(err){
  res.status(500).json({message:"Failed to delete shift",error:err.message});
 }
};