// backend/services/employeeHistoryService.js
import Employee from "../../models/employee/employeeModel.js";

export const recordEmployeeChange=async({employeeId,changes})=>{
 const employee=await Employee.findById(employeeId);
 if(!employee)throw new Error("Employee not found.");

 employee.notes.push({
  text:`Change: ${JSON.stringify(changes)}`
 });

 await employee.save();
 return employee;
};

export default {
 recordEmployeeChange
};