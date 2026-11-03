// backend/controllers/payroll/payStubController.js
import PayStub from "../../models/payroll/payStubModel.js";

export const createPayStub=async(req,res)=>{
 try{
  const payload={
   business:req.body.business,
   employee:req.body.employee,
   payroll:req.body.payroll,
   payrollPeriod:req.body.payrollPeriod||null,
   payDate:req.body.payDate||null,
   earnings:Array.isArray(req.body.earnings)?req.body.earnings:[],
   deductions:Array.isArray(req.body.deductions)?req.body.deductions:[],
   taxes:Array.isArray(req.body.taxes)?req.body.taxes:[],
   grossPay:req.body.grossPay!==undefined?req.body.grossPay:0,
   totalDeductions:req.body.totalDeductions!==undefined?req.body.totalDeductions:0,
   totalTaxes:req.body.totalTaxes!==undefined?req.body.totalTaxes:0,
   netPay:req.body.netPay!==undefined?req.body.netPay:0,
   status:req.body.status||"draft",
   notes:Array.isArray(req.body.notes)?req.body.notes:[]
  };

  if(!payload.business||!payload.employee||!payload.payroll){
   return res.status(400).json({message:"business, employee, and payroll are required"});
  }

  const payStub=await PayStub.create(payload);

  const populatedPayStub=await PayStub.findById(payStub._id)
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("payroll")
   .populate("payrollPeriod","name code startDate endDate payDate");

  res.status(201).json({
   message:"Pay stub created successfully",
   data:populatedPayStub
  });
 }catch(err){
  if(err?.code===11000){
   return res.status(409).json({message:"Pay stub already exists for this employee and payroll"});
  }
  res.status(500).json({message:"Failed to create pay stub",error:err.message});
 }
};

export const getPayStubs=async(req,res)=>{
 try{
  const query={};

  if(req.query.business)query.business=req.query.business;
  if(req.query.employee)query.employee=req.query.employee;
  if(req.query.payroll)query.payroll=req.query.payroll;
  if(req.query.payrollPeriod)query.payrollPeriod=req.query.payrollPeriod;
  if(req.query.status)query.status=req.query.status;

  if(req.query.payDateFrom||req.query.payDateTo){
   query.payDate={};
   if(req.query.payDateFrom)query.payDate.$gte=new Date(req.query.payDateFrom);
   if(req.query.payDateTo)query.payDate.$lte=new Date(req.query.payDateTo);
   if(!Object.keys(query.payDate).length)delete query.payDate;
  }

  const payStubs=await PayStub.find(query)
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("payroll")
   .populate("payrollPeriod","name code startDate endDate payDate")
   .sort({payDate:-1,createdAt:-1});

  res.status(200).json({
   message:"Pay stubs fetched successfully",
   data:payStubs
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch pay stubs",error:err.message});
 }
};

export const getPayStubById=async(req,res)=>{
 try{
  const payStub=await PayStub.findById(req.params.id)
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("payroll")
   .populate("payrollPeriod","name code startDate endDate payDate");

  if(!payStub){
   return res.status(404).json({message:"Pay stub not found"});
  }

  res.status(200).json({
   message:"Pay stub fetched successfully",
   data:payStub
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch pay stub",error:err.message});
 }
};

export const updatePayStub=async(req,res)=>{
 try{
  const existing=await PayStub.findById(req.params.id);

  if(!existing){
   return res.status(404).json({message:"Pay stub not found"});
  }

  const payStub=await PayStub.findByIdAndUpdate(
   req.params.id,
   {
    $set:{
     business:req.body.business!==undefined?req.body.business:existing.business,
     employee:req.body.employee!==undefined?req.body.employee:existing.employee,
     payroll:req.body.payroll!==undefined?req.body.payroll:existing.payroll,
     payrollPeriod:req.body.payrollPeriod!==undefined?req.body.payrollPeriod:existing.payrollPeriod,
     payDate:req.body.payDate!==undefined?req.body.payDate:existing.payDate,
     earnings:req.body.earnings!==undefined?req.body.earnings:existing.earnings,
     deductions:req.body.deductions!==undefined?req.body.deductions:existing.deductions,
     taxes:req.body.taxes!==undefined?req.body.taxes:existing.taxes,
     grossPay:req.body.grossPay!==undefined?req.body.grossPay:existing.grossPay,
     totalDeductions:req.body.totalDeductions!==undefined?req.body.totalDeductions:existing.totalDeductions,
     totalTaxes:req.body.totalTaxes!==undefined?req.body.totalTaxes:existing.totalTaxes,
     netPay:req.body.netPay!==undefined?req.body.netPay:existing.netPay,
     status:req.body.status!==undefined?req.body.status:existing.status,
     notes:req.body.notes!==undefined?req.body.notes:existing.notes
    }
   },
   {returnDocument:"after",runValidators:true}
  )
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("payroll")
   .populate("payrollPeriod","name code startDate endDate payDate");

  res.status(200).json({
   message:"Pay stub updated successfully",
   data:payStub
  });
 }catch(err){
  if(err?.code===11000){
   return res.status(409).json({message:"Pay stub already exists for this employee and payroll"});
  }
  res.status(500).json({message:"Failed to update pay stub",error:err.message});
 }
};

export const deletePayStub=async(req,res)=>{
 try{
  const payStub=await PayStub.findByIdAndDelete(req.params.id);

  if(!payStub){
   return res.status(404).json({message:"Pay stub not found"});
  }

  res.status(200).json({
   message:"Pay stub deleted successfully"
  });
 }catch(err){
  res.status(500).json({message:"Failed to delete pay stub",error:err.message});
 }
};