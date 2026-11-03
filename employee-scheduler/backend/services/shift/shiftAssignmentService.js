// backend/services/shiftAssignmentService.js
import Shift from "../../models/scheduling/shiftModel.js";
import {validateShiftAssignmentOrThrow} from "../shiftValidationService.js";
import {applyShiftStatus} from "../shiftStatusService.js";

export const assignEmployeeToShift=async({shiftId,employeeId,assignedBy=null,notes=""})=>{
 const shift=await Shift.findById(shiftId);
 if(!shift)throw new Error("Shift not found.");

 await validateShiftAssignmentOrThrow({
  business:shift.business,
  employee:employeeId,
  shift
 });

 const alreadyAssigned=shift.assignedEmployees.some(
  (item)=>String(item.employee)===String(employeeId)&&item.status!=="removed"
 );

 if(alreadyAssigned)throw new Error("Employee already assigned.");

 shift.assignedEmployees.push({
  employee:employeeId,
  assignedBy,
  notes
 });

 applyShiftStatus(shift);
 await shift.save();

 return shift;
};

export const removeEmployeeFromShift=async({shiftId,employeeId})=>{
 const shift=await Shift.findById(shiftId);
 if(!shift)throw new Error("Shift not found.");

 const record=shift.assignedEmployees.find(
  (item)=>String(item.employee)===String(employeeId)&&item.status!=="removed"
 );

 if(!record)throw new Error("Employee not assigned.");

 record.status="removed";

 applyShiftStatus(shift);
 await shift.save();

 return shift;
};

export default {
 assignEmployeeToShift,
 removeEmployeeFromShift
};