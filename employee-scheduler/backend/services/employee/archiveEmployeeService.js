// backend/services/archiveEmployeeService.js
import Employee from "../../models/employee/employeeModel.js";
import Archive from "../../models/archiveModel.js";

export const archiveEmployee=async({employeeId,businessId,userId,reason=""})=>{
 const employee=await Employee.findOne({
  _id:employeeId,
  business:businessId
 });

 if(!employee)throw new Error("Employee not found.");
 if(employee.isArchived)throw new Error("Employee is already archived.");

 employee.isArchived=true;
 employee.archivedAt=new Date();
 employee.archivedBy=userId||null;
 employee.archiveReason=reason||"";
 employee.lastArchivedAt=employee.archivedAt;
 employee.unarchivedAt=null;
 employee.unarchivedBy=null;
 employee.isActive=false;
 employee.status="inactive";

 await employee.save();

 await Archive.create({
  business:employee.business,
  employee:employee._id,
  eventType:"archive",
  archivedBy:userId||null,
  reason:reason||"",
  archivedAt:employee.archivedAt
 });

 return employee;
};

export const reactivateEmployee=async({employeeId,businessId,userId})=>{
 const employee=await Employee.findOne({
  _id:employeeId,
  business:businessId
 });

 if(!employee)throw new Error("Employee not found.");
 if(!employee.isArchived)throw new Error("Employee is not archived.");

 const now=new Date();

 employee.isArchived=false;
 employee.unarchivedAt=now;
 employee.unarchivedBy=userId||null;
 employee.archivedAt=null;
 employee.archivedBy=null;
 employee.archiveReason="";
 employee.isActive=true;
 employee.status="active";
 employee.lastHireDate=now;

 await employee.save();

 await Archive.create({
  business:employee.business,
  employee:employee._id,
  eventType:"unarchive",
  unarchivedBy:userId||null,
  unarchivedAt:now
 });

 return employee;
};

export default {
 archiveEmployee,
 reactivateEmployee
};