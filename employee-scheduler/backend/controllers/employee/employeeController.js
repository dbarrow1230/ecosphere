// backend/controllers/employee/employeeController.js
import Employee from "../../models/employee/employeeModel.js";

export const createEmployee=async(req,res)=>{
 try{
  const payload={
   business:req.body.business,
   department:req.body.department||null,
   firstName:req.body.firstName||"",
   lastName:req.body.lastName||"",
   email:req.body.email||"",
   phone:req.body.phone||"",
   employeeId:req.body.employeeId||"",
   role:req.body.role||null,
   employmentType:req.body.employmentType||"part-time",
   payType:req.body.payType||"hourly",
   overtimeEligible:req.body.overtimeEligible!==undefined?req.body.overtimeEligible:true,
   status:req.body.status||"active",
   hireDate:req.body.hireDate||null,
   originalHireDate:req.body.originalHireDate||null,
   lastHireDate:req.body.lastHireDate||null,
   lastArchivedAt:req.body.lastArchivedAt||null,
   hourlyRate:req.body.hourlyRate!==undefined?req.body.hourlyRate:0,
   salaryAmount:req.body.salaryAmount!==undefined?req.body.salaryAmount:req.body.salary!==undefined?req.body.salary:0,
   minHoursPerWeek:req.body.minHoursPerWeek!==undefined?req.body.minHoursPerWeek:0,
   maxHoursPerWeek:req.body.maxHoursPerWeek!==undefined?req.body.maxHoursPerWeek:40,
   preferredHoursPerWeek:req.body.preferredHoursPerWeek!==undefined?req.body.preferredHoursPerWeek:0,
   preferredShiftTypes:Array.isArray(req.body.preferredShiftTypes)?req.body.preferredShiftTypes:[],
   skills:Array.isArray(req.body.skills)?req.body.skills:[],
   shiftLocations:Array.isArray(req.body.shiftLocations)?req.body.shiftLocations:[],
   isManager:req.body.isManager!==undefined?req.body.isManager:false,
   employeeDetails:req.body.employeeDetails||null,
   emergencyContact:req.body.emergencyContact||null,
   notes:Array.isArray(req.body.notes)?req.body.notes:[],
   isActive:req.body.isActive!==undefined?req.body.isActive:true,
   isArchived:req.body.isArchived!==undefined?req.body.isArchived:false,
   archivedAt:req.body.archivedAt||null,
   archivedBy:req.body.archivedBy||null,
   archiveReason:req.body.archiveReason||"",
   unarchivedAt:req.body.unarchivedAt||null,
   unarchivedBy:req.body.unarchivedBy||null
  };

  if(!payload.business||!payload.firstName||!payload.lastName||!payload.email||!payload.employeeId){
   return res.status(400).json({message:"business, firstName, lastName, email, and employeeId are required"});
  }

  const employee=await Employee.create(payload);

  const populatedEmployee=await Employee.findById(employee._id)
   .populate("business","legalName")
   .populate("department","name")
   .populate("role","name")
   .populate("shiftLocations","name code")
   .populate("employeeDetails")
   .populate("emergencyContact")
   .populate("archivedBy","username name email")
   .populate("unarchivedBy","username name email");

  res.status(201).json({
   message:"Employee created successfully",
   data:populatedEmployee
  });
 }catch(err){
  if(err?.code===11000){
   return res.status(409).json({message:"Employee email or employeeId already exists for this business"});
  }
  res.status(500).json({message:"Failed to create employee",error:err.message});
 }
};

export const getEmployees=async(req,res)=>{
 try{
  const query={};

  if(req.query.business)query.business=req.query.business;
  if(req.query.department)query.department=req.query.department;
  if(req.query.role)query.role=req.query.role;
  if(req.query.status)query.status=req.query.status;
  if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";
  if(req.query.isArchived!==undefined)query.isArchived=req.query.isArchived==="true";
  if(req.query.isManager!==undefined)query.isManager=req.query.isManager==="true";
  if(req.query.employmentType)query.employmentType=req.query.employmentType;
  if(req.query.payType)query.payType=req.query.payType;

  if(req.query.search){
   const value=req.query.search.trim();
   query.$or=[
    {firstName:{$regex:value,$options:"i"}},
    {lastName:{$regex:value,$options:"i"}},
    {email:{$regex:value,$options:"i"}},
    {employeeId:{$regex:value,$options:"i"}}
   ];
  }

  const employees=await Employee.find(query)
   .populate("business","legalName")
   .populate("department","name")
   .populate("role","name")
   .populate("shiftLocations","name code")
   .populate("employeeDetails")
   .populate("emergencyContact")
   .populate("archivedBy","username name email")
   .populate("unarchivedBy","username name email")
   .sort({lastName:1,firstName:1});

  res.status(200).json({
   message:"Employees fetched successfully",
   data:employees
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch employees",error:err.message});
 }
};

export const getEmployeeById=async(req,res)=>{
 try{
  const employee=await Employee.findById(req.params.id)
   .populate("business","legalName")
   .populate("department","name")
   .populate("role","name")
   .populate("shiftLocations","name code")
   .populate("employeeDetails")
   .populate("emergencyContact")
   .populate("archivedBy","username name email")
   .populate("unarchivedBy","username name email");

  if(!employee){
   return res.status(404).json({message:"Employee not found"});
  }

  res.status(200).json({
   message:"Employee fetched successfully",
   data:employee
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch employee",error:err.message});
 }
};

export const getEmployeeByEmployeeId=async(req,res)=>{
 try{
  const query={employeeId:req.params.employeeId};

  if(req.query.business)query.business=req.query.business;

  const employee=await Employee.findOne(query)
   .populate("business","legalName")
   .populate("department","name")
   .populate("role","name")
   .populate("shiftLocations","name code")
   .populate("employeeDetails")
   .populate("emergencyContact")
   .populate("archivedBy","username name email")
   .populate("unarchivedBy","username name email");

  if(!employee){
   return res.status(404).json({message:"Employee not found"});
  }

  res.status(200).json({
   message:"Employee fetched successfully",
   data:employee
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch employee",error:err.message});
 }
};

export const updateEmployee=async(req,res)=>{
 try{
  const existing=await Employee.findById(req.params.id);

  if(!existing){
   return res.status(404).json({message:"Employee not found"});
  }

  const employee=await Employee.findByIdAndUpdate(
   req.params.id,
   {
    $set:{
     business:req.body.business!==undefined?req.body.business:existing.business,
     department:req.body.department!==undefined?req.body.department:existing.department,
     firstName:req.body.firstName!==undefined?req.body.firstName:existing.firstName,
     lastName:req.body.lastName!==undefined?req.body.lastName:existing.lastName,
     email:req.body.email!==undefined?req.body.email:existing.email,
     phone:req.body.phone!==undefined?req.body.phone:existing.phone,
     employeeId:req.body.employeeId!==undefined?req.body.employeeId:existing.employeeId,
     role:req.body.role!==undefined?req.body.role:existing.role,
     employmentType:req.body.employmentType!==undefined?req.body.employmentType:existing.employmentType,
     payType:req.body.payType!==undefined?req.body.payType:existing.payType,
     overtimeEligible:req.body.overtimeEligible!==undefined?req.body.overtimeEligible:existing.overtimeEligible,
     status:req.body.status!==undefined?req.body.status:existing.status,
     hireDate:req.body.hireDate!==undefined?req.body.hireDate:existing.hireDate,
     originalHireDate:req.body.originalHireDate!==undefined?req.body.originalHireDate:existing.originalHireDate,
     lastHireDate:req.body.lastHireDate!==undefined?req.body.lastHireDate:existing.lastHireDate,
     lastArchivedAt:req.body.lastArchivedAt!==undefined?req.body.lastArchivedAt:existing.lastArchivedAt,
     hourlyRate:req.body.hourlyRate!==undefined?req.body.hourlyRate:existing.hourlyRate,
     salaryAmount:req.body.salaryAmount!==undefined?req.body.salaryAmount:req.body.salary!==undefined?req.body.salary:existing.salaryAmount,
     minHoursPerWeek:req.body.minHoursPerWeek!==undefined?req.body.minHoursPerWeek:existing.minHoursPerWeek,
     maxHoursPerWeek:req.body.maxHoursPerWeek!==undefined?req.body.maxHoursPerWeek:existing.maxHoursPerWeek,
     preferredHoursPerWeek:req.body.preferredHoursPerWeek!==undefined?req.body.preferredHoursPerWeek:existing.preferredHoursPerWeek,
     preferredShiftTypes:req.body.preferredShiftTypes!==undefined?req.body.preferredShiftTypes:existing.preferredShiftTypes,
     skills:req.body.skills!==undefined?req.body.skills:existing.skills,
     shiftLocations:req.body.shiftLocations!==undefined?req.body.shiftLocations:existing.shiftLocations,
     isManager:req.body.isManager!==undefined?req.body.isManager:existing.isManager,
     employeeDetails:req.body.employeeDetails!==undefined?req.body.employeeDetails:existing.employeeDetails,
     emergencyContact:req.body.emergencyContact!==undefined?req.body.emergencyContact:existing.emergencyContact,
     notes:req.body.notes!==undefined?req.body.notes:existing.notes,
     isActive:req.body.isActive!==undefined?req.body.isActive:existing.isActive,
     isArchived:req.body.isArchived!==undefined?req.body.isArchived:existing.isArchived,
     archivedAt:req.body.archivedAt!==undefined?req.body.archivedAt:existing.archivedAt,
     archivedBy:req.body.archivedBy!==undefined?req.body.archivedBy:existing.archivedBy,
     archiveReason:req.body.archiveReason!==undefined?req.body.archiveReason:existing.archiveReason,
     unarchivedAt:req.body.unarchivedAt!==undefined?req.body.unarchivedAt:existing.unarchivedAt,
     unarchivedBy:req.body.unarchivedBy!==undefined?req.body.unarchivedBy:existing.unarchivedBy
    }
   },
   {returnDocument:"after",runValidators:true}
  )
   .populate("business","legalName")
   .populate("department","name")
   .populate("role","name")
   .populate("shiftLocations","name code")
   .populate("employeeDetails")
   .populate("emergencyContact")
   .populate("archivedBy","username name email")
   .populate("unarchivedBy","username name email");

  res.status(200).json({
   message:"Employee updated successfully",
   data:employee
  });
 }catch(err){
  if(err?.code===11000){
   return res.status(409).json({message:"Employee email or employeeId already exists for this business"});
  }
  res.status(500).json({message:"Failed to update employee",error:err.message});
 }
};

export const deleteEmployee=async(req,res)=>{
 try{
  const employee=await Employee.findByIdAndDelete(req.params.id);

  if(!employee){
   return res.status(404).json({message:"Employee not found"});
  }

  res.status(200).json({
   message:"Employee deleted successfully"
  });
 }catch(err){
  res.status(500).json({message:"Failed to delete employee",error:err.message});
 }
};