// backend/controllers/payroll/payrollController.js
import Payroll from "../../models/payroll/payrollModel.js";

export const createPayroll=async(req,res)=>{
 try{
  const payload={
   business:req.body.business,
   employee:req.body.employee,
   payPeriodStart:req.body.payPeriodStart,
   payPeriodEnd:req.body.payPeriodEnd,
   payDate:req.body.payDate||null,
   timeEntries:Array.isArray(req.body.timeEntries)?req.body.timeEntries:[],
   totalRegularMinutes:req.body.totalRegularMinutes!==undefined?req.body.totalRegularMinutes:0,
   totalOvertimeMinutes:req.body.totalOvertimeMinutes!==undefined?req.body.totalOvertimeMinutes:0,
   totalApprovedOvertimeMinutes:req.body.totalApprovedOvertimeMinutes!==undefined?req.body.totalApprovedOvertimeMinutes:0,
   totalWorkedMinutes:req.body.totalWorkedMinutes!==undefined?req.body.totalWorkedMinutes:0,
   hourlyRate:req.body.hourlyRate!==undefined?req.body.hourlyRate:0,
   overtimeRate:req.body.overtimeRate!==undefined?req.body.overtimeRate:0,
   regularPay:req.body.regularPay!==undefined?req.body.regularPay:0,
   overtimePay:req.body.overtimePay!==undefined?req.body.overtimePay:0,
   grossPay:req.body.grossPay!==undefined?req.body.grossPay:0,
   status:req.body.status||"draft",
   processedAt:req.body.processedAt||null,
   processedBy:req.body.processedBy||null,
   notes:Array.isArray(req.body.notes)?req.body.notes:[]
  };

  if(!payload.business||!payload.employee||!payload.payPeriodStart||!payload.payPeriodEnd){
   return res.status(400).json({message:"business, employee, payPeriodStart, and payPeriodEnd are required"});
  }

  const payroll=await Payroll.create(payload);

  const populatedPayroll=await Payroll.findById(payroll._id)
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("processedBy","username name email")
   .populate("timeEntries.timeEntry");

  res.status(201).json({
   message:"Payroll created successfully",
   data:populatedPayroll
  });
 }catch(err){
  if(err?.code===11000){
   return res.status(409).json({message:"Payroll already exists for this employee and pay period"});
  }
  res.status(500).json({message:"Failed to create payroll",error:err.message});
 }
};

export const getPayrolls=async(req,res)=>{
 try{
  const query={};

  if(req.query.business)query.business=req.query.business;
  if(req.query.employee)query.employee=req.query.employee;
  if(req.query.status)query.status=req.query.status;
  if(req.query.processedBy)query.processedBy=req.query.processedBy;

  if(req.query.payPeriodStart||req.query.payPeriodEnd){
   query.$and=[];
   if(req.query.payPeriodStart){
    query.$and.push({payPeriodEnd:{$gte:new Date(req.query.payPeriodStart)}});
   }
   if(req.query.payPeriodEnd){
    query.$and.push({payPeriodStart:{$lte:new Date(req.query.payPeriodEnd)}});
   }
   if(!query.$and.length)delete query.$and;
  }

  if(req.query.payDateFrom||req.query.payDateTo){
   query.payDate={};
   if(req.query.payDateFrom)query.payDate.$gte=new Date(req.query.payDateFrom);
   if(req.query.payDateTo)query.payDate.$lte=new Date(req.query.payDateTo);
   if(!Object.keys(query.payDate).length)delete query.payDate;
  }

  const payrolls=await Payroll.find(query)
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("processedBy","username name email")
   .populate("timeEntries.timeEntry")
   .sort({payPeriodStart:-1,createdAt:-1});

  res.status(200).json({
   message:"Payrolls fetched successfully",
   data:payrolls
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch payrolls",error:err.message});
 }
};

export const getPayrollById=async(req,res)=>{
 try{
  const payroll=await Payroll.findById(req.params.id)
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("processedBy","username name email")
   .populate("timeEntries.timeEntry");

  if(!payroll){
   return res.status(404).json({message:"Payroll not found"});
  }

  res.status(200).json({
   message:"Payroll fetched successfully",
   data:payroll
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch payroll",error:err.message});
 }
};

export const updatePayroll=async(req,res)=>{
 try{
  const existing=await Payroll.findById(req.params.id);

  if(!existing){
   return res.status(404).json({message:"Payroll not found"});
  }

  const payroll=await Payroll.findByIdAndUpdate(
   req.params.id,
   {
    $set:{
     business:req.body.business!==undefined?req.body.business:existing.business,
     employee:req.body.employee!==undefined?req.body.employee:existing.employee,
     payPeriodStart:req.body.payPeriodStart!==undefined?req.body.payPeriodStart:existing.payPeriodStart,
     payPeriodEnd:req.body.payPeriodEnd!==undefined?req.body.payPeriodEnd:existing.payPeriodEnd,
     payDate:req.body.payDate!==undefined?req.body.payDate:existing.payDate,
     timeEntries:req.body.timeEntries!==undefined?req.body.timeEntries:existing.timeEntries,
     totalRegularMinutes:req.body.totalRegularMinutes!==undefined?req.body.totalRegularMinutes:existing.totalRegularMinutes,
     totalOvertimeMinutes:req.body.totalOvertimeMinutes!==undefined?req.body.totalOvertimeMinutes:existing.totalOvertimeMinutes,
     totalApprovedOvertimeMinutes:req.body.totalApprovedOvertimeMinutes!==undefined?req.body.totalApprovedOvertimeMinutes:existing.totalApprovedOvertimeMinutes,
     totalWorkedMinutes:req.body.totalWorkedMinutes!==undefined?req.body.totalWorkedMinutes:existing.totalWorkedMinutes,
     hourlyRate:req.body.hourlyRate!==undefined?req.body.hourlyRate:existing.hourlyRate,
     overtimeRate:req.body.overtimeRate!==undefined?req.body.overtimeRate:existing.overtimeRate,
     regularPay:req.body.regularPay!==undefined?req.body.regularPay:existing.regularPay,
     overtimePay:req.body.overtimePay!==undefined?req.body.overtimePay:existing.overtimePay,
     grossPay:req.body.grossPay!==undefined?req.body.grossPay:existing.grossPay,
     status:req.body.status!==undefined?req.body.status:existing.status,
     processedAt:req.body.processedAt!==undefined?req.body.processedAt:existing.processedAt,
     processedBy:req.body.processedBy!==undefined?req.body.processedBy:existing.processedBy,
     notes:req.body.notes!==undefined?req.body.notes:existing.notes
    }
   },
   {returnDocument:"after",runValidators:true}
  )
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("processedBy","username name email")
   .populate("timeEntries.timeEntry");

  res.status(200).json({
   message:"Payroll updated successfully",
   data:payroll
  });
 }catch(err){
  if(err?.code===11000){
   return res.status(409).json({message:"Payroll already exists for this employee and pay period"});
  }
  res.status(500).json({message:"Failed to update payroll",error:err.message});
 }
};

export const deletePayroll=async(req,res)=>{
 try{
  const payroll=await Payroll.findByIdAndDelete(req.params.id);

  if(!payroll){
   return res.status(404).json({message:"Payroll not found"});
  }

  res.status(200).json({
   message:"Payroll deleted successfully"
  });
 }catch(err){
  res.status(500).json({message:"Failed to delete payroll",error:err.message});
 }
};