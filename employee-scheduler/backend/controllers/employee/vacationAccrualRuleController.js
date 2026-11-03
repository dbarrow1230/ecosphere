// backend/controllers/employee/vacationAccrualRuleController.js
import VacationAccrualRule from "../../models/employee/vacationAccrualRuleModel.js";

export const createVacationAccrualRule=async(req,res)=>{
 try{
  const payload={
   business:req.body.business,
   department:req.body.department||null,
   role:req.body.role||null,
   timeOffType:req.body.timeOffType,
   name:req.body.name||"",
   code:req.body.code||"",
   accrualMethod:req.body.accrualMethod||"per-pay-period",
   accrualRate:req.body.accrualRate!==undefined?req.body.accrualRate:0,
   maxHoursPerYear:req.body.maxHoursPerYear!==undefined?req.body.maxHoursPerYear:0,
   maxCarryoverHours:req.body.maxCarryoverHours!==undefined?req.body.maxCarryoverHours:0,
   waitingPeriodDays:req.body.waitingPeriodDays!==undefined?req.body.waitingPeriodDays:0,
   minimumEmploymentDays:req.body.minimumEmploymentDays!==undefined?req.body.minimumEmploymentDays:0,
   isActive:req.body.isActive!==undefined?req.body.isActive:true,
   notes:Array.isArray(req.body.notes)?req.body.notes:[]
  };

  if(!payload.business||!payload.timeOffType||!payload.name){
   return res.status(400).json({message:"business, timeOffType, and name are required"});
  }

  const vacationAccrualRule=await VacationAccrualRule.create(payload);

  const populatedVacationAccrualRule=await VacationAccrualRule.findById(vacationAccrualRule._id)
   .populate("business","name")
   .populate("department","name")
   .populate("role","name")
   .populate("timeOffType","name code category");

  res.status(201).json({
   message:"Vacation accrual rule created successfully",
   data:populatedVacationAccrualRule
  });
 }catch(err){
  if(err?.code===11000){
   return res.status(409).json({message:"Vacation accrual rule name or code already exists for this business"});
  }
  res.status(500).json({message:"Failed to create vacation accrual rule",error:err.message});
 }
};

export const getVacationAccrualRules=async(req,res)=>{
 try{
  const query={};

  if(req.query.business)query.business=req.query.business;
  if(req.query.department)query.department=req.query.department;
  if(req.query.role)query.role=req.query.role;
  if(req.query.timeOffType)query.timeOffType=req.query.timeOffType;
  if(req.query.accrualMethod)query.accrualMethod=req.query.accrualMethod;
  if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";
  if(req.query.search){
   const value=req.query.search.trim();
   query.$or=[
    {name:{$regex:value,$options:"i"}},
    {code:{$regex:value,$options:"i"}}
   ];
  }

  const vacationAccrualRules=await VacationAccrualRule.find(query)
   .populate("business","name")
   .populate("department","name")
   .populate("role","name")
   .populate("timeOffType","name code category")
   .sort({name:1});

  res.status(200).json({
   message:"Vacation accrual rules fetched successfully",
   data:vacationAccrualRules
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch vacation accrual rules",error:err.message});
 }
};

export const getVacationAccrualRuleById=async(req,res)=>{
 try{
  const vacationAccrualRule=await VacationAccrualRule.findById(req.params.id)
   .populate("business","name")
   .populate("department","name")
   .populate("role","name")
   .populate("timeOffType","name code category");

  if(!vacationAccrualRule){
   return res.status(404).json({message:"Vacation accrual rule not found"});
  }

  res.status(200).json({
   message:"Vacation accrual rule fetched successfully",
   data:vacationAccrualRule
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch vacation accrual rule",error:err.message});
 }
};

export const updateVacationAccrualRule=async(req,res)=>{
 try{
  const existing=await VacationAccrualRule.findById(req.params.id);

  if(!existing){
   return res.status(404).json({message:"Vacation accrual rule not found"});
  }

  const vacationAccrualRule=await VacationAccrualRule.findByIdAndUpdate(
   req.params.id,
   {
    $set:{
     business:req.body.business!==undefined?req.body.business:existing.business,
     department:req.body.department!==undefined?req.body.department:existing.department,
     role:req.body.role!==undefined?req.body.role:existing.role,
     timeOffType:req.body.timeOffType!==undefined?req.body.timeOffType:existing.timeOffType,
     name:req.body.name!==undefined?req.body.name:existing.name,
     code:req.body.code!==undefined?req.body.code:existing.code,
     accrualMethod:req.body.accrualMethod!==undefined?req.body.accrualMethod:existing.accrualMethod,
     accrualRate:req.body.accrualRate!==undefined?req.body.accrualRate:existing.accrualRate,
     maxHoursPerYear:req.body.maxHoursPerYear!==undefined?req.body.maxHoursPerYear:existing.maxHoursPerYear,
     maxCarryoverHours:req.body.maxCarryoverHours!==undefined?req.body.maxCarryoverHours:existing.maxCarryoverHours,
     waitingPeriodDays:req.body.waitingPeriodDays!==undefined?req.body.waitingPeriodDays:existing.waitingPeriodDays,
     minimumEmploymentDays:req.body.minimumEmploymentDays!==undefined?req.body.minimumEmploymentDays:existing.minimumEmploymentDays,
     isActive:req.body.isActive!==undefined?req.body.isActive:existing.isActive,
     notes:req.body.notes!==undefined?req.body.notes:existing.notes
    }
   },
   {returnDocument:"after",runValidators:true}
  )
   .populate("business","name")
   .populate("department","name")
   .populate("role","name")
   .populate("timeOffType","name code category");

  res.status(200).json({
   message:"Vacation accrual rule updated successfully",
   data:vacationAccrualRule
  });
 }catch(err){
  if(err?.code===11000){
   return res.status(409).json({message:"Vacation accrual rule name or code already exists for this business"});
  }
  res.status(500).json({message:"Failed to update vacation accrual rule",error:err.message});
 }
};

export const deleteVacationAccrualRule=async(req,res)=>{
 try{
  const vacationAccrualRule=await VacationAccrualRule.findByIdAndDelete(req.params.id);

  if(!vacationAccrualRule){
   return res.status(404).json({message:"Vacation accrual rule not found"});
  }

  res.status(200).json({
   message:"Vacation accrual rule deleted successfully"
  });
 }catch(err){
  res.status(500).json({message:"Failed to delete vacation accrual rule",error:err.message});
 }
};