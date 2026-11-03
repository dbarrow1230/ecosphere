// backend/controllers/employee/vacationBalanceController.js
import VacationBalance from "../../models/employee/vacationBalanceModel.js";

export const createVacationBalance=async(req,res)=>{
 try{
  const payload={
   business:req.body.business,
   employee:req.body.employee,
   timeOffType:req.body.timeOffType,
   year:req.body.year,
   openingHours:req.body.openingHours!==undefined?req.body.openingHours:0,
   accruedHours:req.body.accruedHours!==undefined?req.body.accruedHours:0,
   usedHours:req.body.usedHours!==undefined?req.body.usedHours:0,
   adjustedHours:req.body.adjustedHours!==undefined?req.body.adjustedHours:0,
   carryoverHours:req.body.carryoverHours!==undefined?req.body.carryoverHours:0,
   availableHours:req.body.availableHours!==undefined?req.body.availableHours:0,
   entries:Array.isArray(req.body.entries)?req.body.entries:[],
   notes:Array.isArray(req.body.notes)?req.body.notes:[]
  };

  if(!payload.business||!payload.employee||!payload.timeOffType||payload.year===undefined||payload.year===null){
   return res.status(400).json({message:"business, employee, timeOffType, and year are required"});
  }

  const vacationBalance=await VacationBalance.create(payload);

  const populatedVacationBalance=await VacationBalance.findById(vacationBalance._id)
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("timeOffType","name code category");

  res.status(201).json({
   message:"Vacation balance created successfully",
   data:populatedVacationBalance
  });
 }catch(err){
  if(err?.code===11000){
   return res.status(409).json({message:"Vacation balance already exists for this employee, type, and year"});
  }
  res.status(500).json({message:"Failed to create vacation balance",error:err.message});
 }
};

export const getVacationBalances=async(req,res)=>{
 try{
  const query={};

  if(req.query.business)query.business=req.query.business;
  if(req.query.employee)query.employee=req.query.employee;
  if(req.query.timeOffType)query.timeOffType=req.query.timeOffType;
  if(req.query.year!==undefined)query.year=Number(req.query.year);

  const vacationBalances=await VacationBalance.find(query)
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("timeOffType","name code category")
   .sort({year:-1,createdAt:-1});

  res.status(200).json({
   message:"Vacation balances fetched successfully",
   data:vacationBalances
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch vacation balances",error:err.message});
 }
};

export const getVacationBalanceById=async(req,res)=>{
 try{
  const vacationBalance=await VacationBalance.findById(req.params.id)
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("timeOffType","name code category");

  if(!vacationBalance){
   return res.status(404).json({message:"Vacation balance not found"});
  }

  res.status(200).json({
   message:"Vacation balance fetched successfully",
   data:vacationBalance
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch vacation balance",error:err.message});
 }
};

export const updateVacationBalance=async(req,res)=>{
 try{
  const existing=await VacationBalance.findById(req.params.id);

  if(!existing){
   return res.status(404).json({message:"Vacation balance not found"});
  }

  const vacationBalance=await VacationBalance.findByIdAndUpdate(
   req.params.id,
   {
    $set:{
     business:req.body.business!==undefined?req.body.business:existing.business,
     employee:req.body.employee!==undefined?req.body.employee:existing.employee,
     timeOffType:req.body.timeOffType!==undefined?req.body.timeOffType:existing.timeOffType,
     year:req.body.year!==undefined?req.body.year:existing.year,
     openingHours:req.body.openingHours!==undefined?req.body.openingHours:existing.openingHours,
     accruedHours:req.body.accruedHours!==undefined?req.body.accruedHours:existing.accruedHours,
     usedHours:req.body.usedHours!==undefined?req.body.usedHours:existing.usedHours,
     adjustedHours:req.body.adjustedHours!==undefined?req.body.adjustedHours:existing.adjustedHours,
     carryoverHours:req.body.carryoverHours!==undefined?req.body.carryoverHours:existing.carryoverHours,
     availableHours:req.body.availableHours!==undefined?req.body.availableHours:existing.availableHours,
     entries:req.body.entries!==undefined?req.body.entries:existing.entries,
     notes:req.body.notes!==undefined?req.body.notes:existing.notes
    }
   },
   {returnDocument:"after",runValidators:true}
  )
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("timeOffType","name code category");

  res.status(200).json({
   message:"Vacation balance updated successfully",
   data:vacationBalance
  });
 }catch(err){
  if(err?.code===11000){
   return res.status(409).json({message:"Vacation balance already exists for this employee, type, and year"});
  }
  res.status(500).json({message:"Failed to update vacation balance",error:err.message});
 }
};

export const deleteVacationBalance=async(req,res)=>{
 try{
  const vacationBalance=await VacationBalance.findByIdAndDelete(req.params.id);

  if(!vacationBalance){
   return res.status(404).json({message:"Vacation balance not found"});
  }

  res.status(200).json({
   message:"Vacation balance deleted successfully"
  });
 }catch(err){
  res.status(500).json({message:"Failed to delete vacation balance",error:err.message});
 }
};