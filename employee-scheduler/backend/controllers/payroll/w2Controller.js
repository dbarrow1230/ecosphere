// backend/controllers/payroll/w2Controller.js
import W2 from "../../models/payroll/w2Model.js";

export const createW2=async(req,res)=>{
 try{
  const payload={
   business:req.body.business,
   employee:req.body.employee,
   taxYear:req.body.taxYear,
   payrolls:Array.isArray(req.body.payrolls)?req.body.payrolls:[],
   employeeSSNLast4:req.body.employeeSSNLast4||"",
   employeeAddress:req.body.employeeAddress||{},
   employerEIN:req.body.employerEIN||"",
   employerName:req.body.employerName||"",
   employerAddress:req.body.employerAddress||{},
   boxes:req.body.boxes||{},
   totalWages:req.body.totalWages!==undefined?req.body.totalWages:0,
   totalFederalTax:req.body.totalFederalTax!==undefined?req.body.totalFederalTax:0,
   totalSocialSecurityTax:req.body.totalSocialSecurityTax!==undefined?req.body.totalSocialSecurityTax:0,
   totalMedicareTax:req.body.totalMedicareTax!==undefined?req.body.totalMedicareTax:0,
   status:req.body.status||"draft",
   generatedAt:req.body.generatedAt||null,
   filedAt:req.body.filedAt||null
  };

  if(!payload.business||!payload.employee||payload.taxYear===undefined||payload.taxYear===null){
   return res.status(400).json({message:"business, employee, and taxYear are required"});
  }

  const w2=await W2.create(payload);

  const populatedW2=await W2.findById(w2._id)
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("payrolls");

  res.status(201).json({
   message:"W2 created successfully",
   data:populatedW2
  });
 }catch(err){
  if(err?.code===11000){
   return res.status(409).json({message:"W2 already exists for this employee and tax year"});
  }
  res.status(500).json({message:"Failed to create W2",error:err.message});
 }
};

export const getW2s=async(req,res)=>{
 try{
  const query={};

  if(req.query.business)query.business=req.query.business;
  if(req.query.employee)query.employee=req.query.employee;
  if(req.query.taxYear!==undefined)query.taxYear=Number(req.query.taxYear);
  if(req.query.status)query.status=req.query.status;

  const w2s=await W2.find(query)
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("payrolls")
   .sort({taxYear:-1,createdAt:-1});

  res.status(200).json({
   message:"W2s fetched successfully",
   data:w2s
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch W2s",error:err.message});
 }
};

export const getW2ById=async(req,res)=>{
 try{
  const w2=await W2.findById(req.params.id)
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("payrolls");

  if(!w2){
   return res.status(404).json({message:"W2 not found"});
  }

  res.status(200).json({
   message:"W2 fetched successfully",
   data:w2
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch W2",error:err.message});
 }
};

export const updateW2=async(req,res)=>{
 try{
  const existing=await W2.findById(req.params.id);

  if(!existing){
   return res.status(404).json({message:"W2 not found"});
  }

  const w2=await W2.findByIdAndUpdate(
   req.params.id,
   {
    $set:{
     business:req.body.business!==undefined?req.body.business:existing.business,
     employee:req.body.employee!==undefined?req.body.employee:existing.employee,
     taxYear:req.body.taxYear!==undefined?req.body.taxYear:existing.taxYear,
     payrolls:req.body.payrolls!==undefined?req.body.payrolls:existing.payrolls,
     employeeSSNLast4:req.body.employeeSSNLast4!==undefined?req.body.employeeSSNLast4:existing.employeeSSNLast4,
     employeeAddress:req.body.employeeAddress!==undefined?req.body.employeeAddress:existing.employeeAddress,
     employerEIN:req.body.employerEIN!==undefined?req.body.employerEIN:existing.employerEIN,
     employerName:req.body.employerName!==undefined?req.body.employerName:existing.employerName,
     employerAddress:req.body.employerAddress!==undefined?req.body.employerAddress:existing.employerAddress,
     boxes:req.body.boxes!==undefined?req.body.boxes:existing.boxes,
     totalWages:req.body.totalWages!==undefined?req.body.totalWages:existing.totalWages,
     totalFederalTax:req.body.totalFederalTax!==undefined?req.body.totalFederalTax:existing.totalFederalTax,
     totalSocialSecurityTax:req.body.totalSocialSecurityTax!==undefined?req.body.totalSocialSecurityTax:existing.totalSocialSecurityTax,
     totalMedicareTax:req.body.totalMedicareTax!==undefined?req.body.totalMedicareTax:existing.totalMedicareTax,
     status:req.body.status!==undefined?req.body.status:existing.status,
     generatedAt:req.body.generatedAt!==undefined?req.body.generatedAt:existing.generatedAt,
     filedAt:req.body.filedAt!==undefined?req.body.filedAt:existing.filedAt
    }
   },
   {returnDocument:"after",runValidators:true}
  )
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("payrolls");

  res.status(200).json({
   message:"W2 updated successfully",
   data:w2
  });
 }catch(err){
  if(err?.code===11000){
   return res.status(409).json({message:"W2 already exists for this employee and tax year"});
  }
  res.status(500).json({message:"Failed to update W2",error:err.message});
 }
};

export const deleteW2=async(req,res)=>{
 try{
  const w2=await W2.findByIdAndDelete(req.params.id);

  if(!w2){
   return res.status(404).json({message:"W2 not found"});
  }

  res.status(200).json({
   message:"W2 deleted successfully"
  });
 }catch(err){
  res.status(500).json({message:"Failed to delete W2",error:err.message});
 }
};