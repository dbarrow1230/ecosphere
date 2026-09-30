// backend/controllers/employee/employeeDetailsController.js
import EmployeeDetails from "../../models/employee/employeeDetailsModel.js";

export const createEmployeeDetails=async(req,res)=>{
 try{
  const payload={
   business:req.body.business,
   employee:req.body.employee,
   middleName:req.body.middleName||"",
   dateOfBirth:req.body.dateOfBirth||null,
   gender:req.body.gender||"",
   maritalStatus:req.body.maritalStatus||"",
   addressLine1:req.body.addressLine1||"",
   addressLine2:req.body.addressLine2||"",
   city:req.body.city||"",
   stateRef:req.body.stateRef||null,
   countyRef:req.body.countyRef||null,
   countryRef:req.body.countryRef||null,
   postalCode:req.body.postalCode||"",
   alternatePhone:req.body.alternatePhone||"",
   alternateEmail:req.body.alternateEmail||"",
   nationalIdLast4:req.body.nationalIdLast4||"",
   taxIdLast4:req.body.taxIdLast4||"",
   hireSource:req.body.hireSource||"",
   terminationDate:req.body.terminationDate||null,
   rehireEligible:req.body.rehireEligible!==undefined?req.body.rehireEligible:true,
   notes:Array.isArray(req.body.notes)?req.body.notes:[]
  };

  if(!payload.business||!payload.employee){
   return res.status(400).json({message:"business and employee are required"});
  }

  const existing=await EmployeeDetails.findOne({business:payload.business,employee:payload.employee});
  if(existing){
   return res.status(409).json({message:"Employee details already exist for this employee"});
  }

  const employeeDetails=await EmployeeDetails.create(payload);

  res.status(201).json({
   message:"Employee details created successfully",
   data:employeeDetails
  });
 }catch(err){
  res.status(500).json({message:"Failed to create employee details",error:err.message});
 }
};

export const getEmployeeDetails=async(req,res)=>{
 try{
  const query={};

  if(req.query.business)query.business=req.query.business;
  if(req.query.employee)query.employee=req.query.employee;
  if(req.query.stateRef)query.stateRef=req.query.stateRef;
  if(req.query.countyRef)query.countyRef=req.query.countyRef;
  if(req.query.countryRef)query.countryRef=req.query.countryRef;

  const employeeDetails=await EmployeeDetails.find(query)
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("stateRef","name code")
   .populate("countyRef","name")
   .populate("countryRef","name iso2 iso3")
   .sort({createdAt:-1});

  res.status(200).json({
   message:"Employee details fetched successfully",
   data:employeeDetails
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch employee details",error:err.message});
 }
};

export const getEmployeeDetailsById=async(req,res)=>{
 try{
  const employeeDetails=await EmployeeDetails.findById(req.params.id)
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("stateRef","name code")
   .populate("countyRef","name")
   .populate("countryRef","name iso2 iso3");

  if(!employeeDetails){
   return res.status(404).json({message:"Employee details not found"});
  }

  res.status(200).json({
   message:"Employee details fetched successfully",
   data:employeeDetails
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch employee details",error:err.message});
 }
};

export const getEmployeeDetailsByEmployeeId=async(req,res)=>{
 try{
  const query={employee:req.params.employeeId};

  if(req.query.business)query.business=req.query.business;

  const employeeDetails=await EmployeeDetails.findOne(query)
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("stateRef","name code")
   .populate("countyRef","name")
   .populate("countryRef","name iso2 iso3");

  if(!employeeDetails){
   return res.status(404).json({message:"Employee details not found"});
  }

  res.status(200).json({
   message:"Employee details fetched successfully",
   data:employeeDetails
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch employee details",error:err.message});
 }
};

export const updateEmployeeDetails=async(req,res)=>{
 try{
  const existing=await EmployeeDetails.findById(req.params.id);

  if(!existing){
   return res.status(404).json({message:"Employee details not found"});
  }

  const employeeDetails=await EmployeeDetails.findByIdAndUpdate(
   req.params.id,
   {
    $set:{
     business:req.body.business!==undefined?req.body.business:existing.business,
     employee:req.body.employee!==undefined?req.body.employee:existing.employee,
     middleName:req.body.middleName!==undefined?req.body.middleName:existing.middleName,
     dateOfBirth:req.body.dateOfBirth!==undefined?req.body.dateOfBirth:existing.dateOfBirth,
     gender:req.body.gender!==undefined?req.body.gender:existing.gender,
     maritalStatus:req.body.maritalStatus!==undefined?req.body.maritalStatus:existing.maritalStatus,
     addressLine1:req.body.addressLine1!==undefined?req.body.addressLine1:existing.addressLine1,
     addressLine2:req.body.addressLine2!==undefined?req.body.addressLine2:existing.addressLine2,
     city:req.body.city!==undefined?req.body.city:existing.city,
     stateRef:req.body.stateRef!==undefined?req.body.stateRef:existing.stateRef,
     countyRef:req.body.countyRef!==undefined?req.body.countyRef:existing.countyRef,
     countryRef:req.body.countryRef!==undefined?req.body.countryRef:existing.countryRef,
     postalCode:req.body.postalCode!==undefined?req.body.postalCode:existing.postalCode,
     alternatePhone:req.body.alternatePhone!==undefined?req.body.alternatePhone:existing.alternatePhone,
     alternateEmail:req.body.alternateEmail!==undefined?req.body.alternateEmail:existing.alternateEmail,
     nationalIdLast4:req.body.nationalIdLast4!==undefined?req.body.nationalIdLast4:existing.nationalIdLast4,
     taxIdLast4:req.body.taxIdLast4!==undefined?req.body.taxIdLast4:existing.taxIdLast4,
     hireSource:req.body.hireSource!==undefined?req.body.hireSource:existing.hireSource,
     terminationDate:req.body.terminationDate!==undefined?req.body.terminationDate:existing.terminationDate,
     rehireEligible:req.body.rehireEligible!==undefined?req.body.rehireEligible:existing.rehireEligible,
     notes:req.body.notes!==undefined?req.body.notes:existing.notes
    }
   },
   {returnDocument:"after",runValidators:true}
  )
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("stateRef","name code")
   .populate("countyRef","name")
   .populate("countryRef","name iso2 iso3");

  res.status(200).json({
   message:"Employee details updated successfully",
   data:employeeDetails
  });
 }catch(err){
  res.status(500).json({message:"Failed to update employee details",error:err.message});
 }
};

export const deleteEmployeeDetails=async(req,res)=>{
 try{
  const employeeDetails=await EmployeeDetails.findByIdAndDelete(req.params.id);

  if(!employeeDetails){
   return res.status(404).json({message:"Employee details not found"});
  }

  res.status(200).json({
   message:"Employee details deleted successfully"
  });
 }catch(err){
  res.status(500).json({message:"Failed to delete employee details",error:err.message});
 }
};