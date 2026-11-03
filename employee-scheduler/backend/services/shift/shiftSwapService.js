// backend/services/shift/shiftSwapService.js
import Shift from "../../models/scheduling/shiftModel.js";
import {applyShiftStatus} from "./shiftStatusService.js";
import {validateShiftAssignmentOrThrow} from "./shiftValidationService.js";

export const requestShiftSwap=async({shiftId,employeeId,targetEmployeeId=null,requestedBy=null,notes=""})=>{
 const shift=await Shift.findById(shiftId);
 if(!shift)throw new Error("Shift not found.");

 const assignedRecord=shift.assignedEmployees.find(
  (item)=>String(item.employee)===String(employeeId)&&item.status!=="removed"
 );

 if(!assignedRecord)throw new Error("Employee is not assigned to this shift.");

 if(targetEmployeeId){
  await validateShiftAssignmentOrThrow({
   business:shift.business,
   employee:targetEmployeeId,
   shift,
   excludeShiftId:shift._id
  });
 }

 assignedRecord.status="declined";
 assignedRecord.notes=[
  ...(Array.isArray(assignedRecord.notes)?assignedRecord.notes:[]),
  {date:new Date(),text:`Swap requested.${notes?` ${notes}`:""}`}
 ];

 if(targetEmployeeId){
  shift.assignedEmployees.push({
   employee:targetEmployeeId,
   assignedBy:requestedBy||null,
   status:"assigned",
   notes:[{date:new Date(),text:"Assigned by shift swap request."}]
  });
 }

 applyShiftStatus(shift);
 await shift.save();

 return shift;
};

export const cancelShiftSwap=async({shiftId,employeeId})=>{
 const shift=await Shift.findById(shiftId);
 if(!shift)throw new Error("Shift not found.");

 const record=shift.assignedEmployees.find(
  (item)=>String(item.employee)===String(employeeId)
 );

 if(!record)throw new Error("Shift assignment not found.");

 if(record.status==="declined"){
  record.status="assigned";
  record.notes=[
   ...(Array.isArray(record.notes)?record.notes:[]),
   {date:new Date(),text:"Shift swap request cancelled."}
  ];
 }

 applyShiftStatus(shift);
 await shift.save();

 return shift;
};

export default {
 requestShiftSwap,
 cancelShiftSwap
};