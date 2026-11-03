// backend/services/shift/shiftConflictResolutionService.js
import Shift from "../../models/scheduling/shiftModel.js";
import {validateShiftAssignmentOrThrow} from "./shiftValidationService.js";

export const findShiftConflicts=async({shiftId,employeeId})=>{
 const shift=await Shift.findById(shiftId);
 if(!shift)throw new Error("Shift not found.");

 return validateShiftAssignmentOrThrow({
  business:shift.business,
  employee:employeeId,
  shift,
  excludeShiftId:shift._id
 }).catch((error)=>error.validation||null);
};

export const resolveShiftConflictByRemovingEmployee=async({shiftId,employeeId})=>{
 const shift=await Shift.findById(shiftId);
 if(!shift)throw new Error("Shift not found.");

 const record=shift.assignedEmployees.find(
  (item)=>String(item.employee)===String(employeeId)&&item.status!=="removed"
 );

 if(!record)throw new Error("Employee assignment not found.");

 record.status="removed";
 await shift.save();

 return shift;
};

export default {
 findShiftConflicts,
 resolveShiftConflictByRemovingEmployee
};