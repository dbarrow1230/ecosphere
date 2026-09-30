// backend/controllers/time/overtimeRuleController.js
import OvertimeRule from "../../models/time/overtimeRuleModel.js";

export const createOvertimeRule=async(req,res)=>{
 try{
  const payload={
   business:req.body.business,
   department:req.body.department||null,
   role:req.body.role||null,
   name:req.body.name||"",
   code:req.body.code||"",
   dailyOvertimeAfterMinutes:req.body.dailyOvertimeAfterMinutes!==undefined?req.body.dailyOvertimeAfterMinutes:480,
   weeklyOvertimeAfterMinutes:req.body.weeklyOvertimeAfterMinutes!==undefined?req.body.weeklyOvertimeAfterMinutes:2400,
   doubleTimeAfterMinutes:req.body.doubleTimeAfterMinutes!==undefined?req.body.doubleTimeAfterMinutes:0,
   overtimeMultiplier:req.body.overtimeMultiplier!==undefined?req.body.overtimeMultiplier:1.5,
   doubleTimeMultiplier:req.body.doubleTimeMultiplier!==undefined?req.body.doubleTimeMultiplier:2,
   requiresApproval:req.body.requiresApproval!==undefined?req.body.requiresApproval:true,
   isActive:req.body.isActive!==undefined?req.body.isActive:true,
   notes:Array.isArray(req.body.notes)?req.body.notes:[]
  };

  if(!payload.business||!payload.name){
   return res.status(400).json({message:"business and name are required"});
  }

  const overtimeRule=await OvertimeRule.create(payload);

  const populatedOvertimeRule=await OvertimeRule.findById(overtimeRule._id)
   .populate("business","name")
   .populate("department","name")
   .populate("role","name");

  res.status(201).json({
   message:"Overtime rule created successfully",
   data:populatedOvertimeRule
  });
 }catch(err){
  if(err?.code===11000){
   return res.status(409).json({message:"Overtime rule name or code already exists for this business"});
  }
  res.status(500).json({message:"Failed to create overtime rule",error:err.message});
 }
};

export const getOvertimeRules=async(req,res)=>{
 try{
  const query={};

  if(req.query.business)query.business=req.query.business;
  if(req.query.department)query.department=req.query.department;
  if(req.query.role)query.role=req.query.role;
  if(req.query.requiresApproval!==undefined)query.requiresApproval=req.query.requiresApproval==="true";
  if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";
  if(req.query.search){
   const value=req.query.search.trim();
   query.$or=[
    {name:{$regex:value,$options:"i"}},
    {code:{$regex:value,$options:"i"}}
   ];
  }

  const overtimeRules=await OvertimeRule.find(query)
   .populate("business","name")
   .populate("department","name")
   .populate("role","name")
   .sort({name:1});

  res.status(200).json({
   message:"Overtime rules fetched successfully",
   data:overtimeRules
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch overtime rules",error:err.message});
 }
};

export const getOvertimeRuleById=async(req,res)=>{
 try{
  const overtimeRule=await OvertimeRule.findById(req.params.id)
   .populate("business","name")
   .populate("department","name")
   .populate("role","name");

  if(!overtimeRule){
   return res.status(404).json({message:"Overtime rule not found"});
  }

  res.status(200).json({
   message:"Overtime rule fetched successfully",
   data:overtimeRule
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch overtime rule",error:err.message});
 }
};

export const updateOvertimeRule=async(req,res)=>{
 try{
  const existing=await OvertimeRule.findById(req.params.id);

  if(!existing){
   return res.status(404).json({message:"Overtime rule not found"});
  }

  const overtimeRule=await OvertimeRule.findByIdAndUpdate(
   req.params.id,
   {
    $set:{
     business:req.body.business!==undefined?req.body.business:existing.business,
     department:req.body.department!==undefined?req.body.department:existing.department,
     role:req.body.role!==undefined?req.body.role:existing.role,
     name:req.body.name!==undefined?req.body.name:existing.name,
     code:req.body.code!==undefined?req.body.code:existing.code,
     dailyOvertimeAfterMinutes:req.body.dailyOvertimeAfterMinutes!==undefined?req.body.dailyOvertimeAfterMinutes:existing.dailyOvertimeAfterMinutes,
     weeklyOvertimeAfterMinutes:req.body.weeklyOvertimeAfterMinutes!==undefined?req.body.weeklyOvertimeAfterMinutes:existing.weeklyOvertimeAfterMinutes,
     doubleTimeAfterMinutes:req.body.doubleTimeAfterMinutes!==undefined?req.body.doubleTimeAfterMinutes:existing.doubleTimeAfterMinutes,
     overtimeMultiplier:req.body.overtimeMultiplier!==undefined?req.body.overtimeMultiplier:existing.overtimeMultiplier,
     doubleTimeMultiplier:req.body.doubleTimeMultiplier!==undefined?req.body.doubleTimeMultiplier:existing.doubleTimeMultiplier,
     requiresApproval:req.body.requiresApproval!==undefined?req.body.requiresApproval:existing.requiresApproval,
     isActive:req.body.isActive!==undefined?req.body.isActive:existing.isActive,
     notes:req.body.notes!==undefined?req.body.notes:existing.notes
    }
   },
   {returnDocument:"after",runValidators:true}
  )
   .populate("business","name")
   .populate("department","name")
   .populate("role","name");

  res.status(200).json({
   message:"Overtime rule updated successfully",
   data:overtimeRule
  });
 }catch(err){
  if(err?.code===11000){
   return res.status(409).json({message:"Overtime rule name or code already exists for this business"});
  }
  res.status(500).json({message:"Failed to update overtime rule",error:err.message});
 }
};

export const deleteOvertimeRule=async(req,res)=>{
 try{
  const overtimeRule=await OvertimeRule.findByIdAndDelete(req.params.id);

  if(!overtimeRule){
   return res.status(404).json({message:"Overtime rule not found"});
  }

  res.status(200).json({
   message:"Overtime rule deleted successfully"
  });
 }catch(err){
  res.status(500).json({message:"Failed to delete overtime rule",error:err.message});
 }
};