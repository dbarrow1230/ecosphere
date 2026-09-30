// backend/services/shift/shiftConfirmationService.js
import Shift from "../../models/scheduling/shiftModel.js";
import {applyShiftStatus} from "./shiftStatusService.js";

export const confirmShiftAssignment=async({shiftId,employeeId,notes=""})=>{
 const shift=await Shift.findById(shiftId);
 if(!shift)throw new Error("Shift not found.");

 const record=shift.assignedEmployees.find(
  (item)=>String(item.employee)===String(employeeId)&&item.status!=="removed"
 );

 if(!record)throw new Error("Employee assignment not found.");

 record.status="confirmed";
 record.notes=[
  ...(Array.isArray(record.notes)?record.notes:[]),
  ...(notes?[{date:new Date(),text:notes}]:[])
 ];

 applyShiftStatus(shift);
 await shift.save();

 return shift;
};

export const declineShiftAssignment=async({shiftId,employeeId,notes=""})=>{
 const shift=await Shift.findById(shiftId);
 if(!shift)throw new Error("Shift not found.");

 const record=shift.assignedEmployees.find(
  (item)=>String(item.employee)===String(employeeId)&&item.status!=="removed"
 );

 if(!record)throw new Error("Employee assignment not found.");

 record.status="declined";
 record.notes=[
  ...(Array.isArray(record.notes)?record.notes:[]),
  ...(notes?[{date:new Date(),text:notes}]:[])
 ];

 applyShiftStatus(shift);
 await shift.save();

 return shift;
};

export default {
 confirmShiftAssignment,
 declineShiftAssignment
};