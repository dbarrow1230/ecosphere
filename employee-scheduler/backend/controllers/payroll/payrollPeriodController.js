// backend/controllers/payroll/payrollPeriodController.js
import PayrollPeriod from "../../models/payroll/payrollPeriodModel.js";

export const createPayrollPeriod=async(req,res)=>{
 try{
  const payload={
   business:req.body.business,
   name:req.body.name||"",
   code:req.body.code||"",
   startDate:req.body.startDate,
   endDate:req.body.endDate,
   payDate:req.body.payDate||null,
   frequency:req.body.frequency||"biweekly",
   status:req.body.status||"draft",
   processedAt:req.body.processedAt||null,
   processedBy:req.body.processedBy||null,
   paidAt:req.body.paidAt||null,
   paidBy:req.body.paidBy||null,
   notes:Array.isArray(req.body.notes)?req.body.notes:[]
  };

  if(!payload.business||!payload.startDate||!payload.endDate){
   return res.status(400).json({message:"business, startDate, and endDate are required"});
  }

  const payrollPeriod=await PayrollPeriod.create(payload);

  const populatedPayrollPeriod=await PayrollPeriod.findById(payrollPeriod._id)
   .populate("business","name")
   .populate("processedBy","username name email")
   .populate("paidBy","username name email");

  res.status(201).json({
   message:"Payroll period created successfully",
   data:populatedPayrollPeriod
  });
 }catch(err){
  if(err?.code===11000){
   return res.status(409).json({message:"Payroll period already exists for this business and date range"});
  }
  res.status(500).json({message:"Failed to create payroll period",error:err.message});
 }
};

export const getPayrollPeriods=async(req,res)=>{
 try{
  const query={};

  if(req.query.business)query.business=req.query.business;
  if(req.query.frequency)query.frequency=req.query.frequency;
  if(req.query.status)query.status=req.query.status;
  if(req.query.processedBy)query.processedBy=req.query.processedBy;
  if(req.query.paidBy)query.paidBy=req.query.paidBy;

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

  if(req.query.payDateFrom||req.query.payDateTo){
   query.payDate={};
   if(req.query.payDateFrom)query.payDate.$gte=new Date(req.query.payDateFrom);
   if(req.query.payDateTo)query.payDate.$lte=new Date(req.query.payDateTo);
   if(!Object.keys(query.payDate).length)delete query.payDate;
  }

  if(req.query.search){
   const value=req.query.search.trim();
   query.$or=[
    {name:{$regex:value,$options:"i"}},
    {code:{$regex:value,$options:"i"}}
   ];
  }

  const payrollPeriods=await PayrollPeriod.find(query)
   .populate("business","name")
   .populate("processedBy","username name email")
   .populate("paidBy","username name email")
   .sort({startDate:-1,createdAt:-1});

  res.status(200).json({
   message:"Payroll periods fetched successfully",
   data:payrollPeriods
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch payroll periods",error:err.message});
 }
};

export const getPayrollPeriodById=async(req,res)=>{
 try{
  const payrollPeriod=await PayrollPeriod.findById(req.params.id)
   .populate("business","name")
   .populate("processedBy","username name email")
   .populate("paidBy","username name email");

  if(!payrollPeriod){
   return res.status(404).json({message:"Payroll period not found"});
  }

  res.status(200).json({
   message:"Payroll period fetched successfully",
   data:payrollPeriod
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch payroll period",error:err.message});
 }
};

export const updatePayrollPeriod=async(req,res)=>{
 try{
  const existing=await PayrollPeriod.findById(req.params.id);

  if(!existing){
   return res.status(404).json({message:"Payroll period not found"});
  }

  const payrollPeriod=await PayrollPeriod.findByIdAndUpdate(
   req.params.id,
   {
    $set:{
     business:req.body.business!==undefined?req.body.business:existing.business,
     name:req.body.name!==undefined?req.body.name:existing.name,
     code:req.body.code!==undefined?req.body.code:existing.code,
     startDate:req.body.startDate!==undefined?req.body.startDate:existing.startDate,
     endDate:req.body.endDate!==undefined?req.body.endDate:existing.endDate,
     payDate:req.body.payDate!==undefined?req.body.payDate:existing.payDate,
     frequency:req.body.frequency!==undefined?req.body.frequency:existing.frequency,
     status:req.body.status!==undefined?req.body.status:existing.status,
     processedAt:req.body.processedAt!==undefined?req.body.processedAt:existing.processedAt,
     processedBy:req.body.processedBy!==undefined?req.body.processedBy:existing.processedBy,
     paidAt:req.body.paidAt!==undefined?req.body.paidAt:existing.paidAt,
     paidBy:req.body.paidBy!==undefined?req.body.paidBy:existing.paidBy,
     notes:req.body.notes!==undefined?req.body.notes:existing.notes
    }
   },
   {returnDocument:"after",runValidators:true}
  )
   .populate("business","name")
   .populate("processedBy","username name email")
   .populate("paidBy","username name email");

  res.status(200).json({
   message:"Payroll period updated successfully",
   data:payrollPeriod
  });
 }catch(err){
  if(err?.code===11000){
   return res.status(409).json({message:"Payroll period already exists for this business and date range"});
  }
  res.status(500).json({message:"Failed to update payroll period",error:err.message});
 }
};

export const deletePayrollPeriod=async(req,res)=>{
 try{
  const payrollPeriod=await PayrollPeriod.findByIdAndDelete(req.params.id);

  if(!payrollPeriod){
   return res.status(404).json({message:"Payroll period not found"});
  }

  res.status(200).json({
   message:"Payroll period deleted successfully"
  });
 }catch(err){
  res.status(500).json({message:"Failed to delete payroll period",error:err.message});
 }
};