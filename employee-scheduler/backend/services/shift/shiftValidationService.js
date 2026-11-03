// backend/services/shiftValidationService.js
import mongoose from "mongoose";
import Employee from "../../models/employee/employeeModel.js";
import Shift from "../../models/scheduling/shiftModel.js";
import Availability from "../../models/scheduling/availabilityModel.js";
import TimeOffRequest from "../../models/employee/timeOffRequestModel.js";

const toObjectId=(value)=>{
 if(!value)return null;
 if(value instanceof mongoose.Types.ObjectId)return value;
 if(typeof value==="string"&&mongoose.Types.ObjectId.isValid(value))return new mongoose.Types.ObjectId(value);
 if(typeof value==="object"&&value._id)return toObjectId(value._id);
 return null;
};

const toDateOnly=(value)=>{
 const date=new Date(value);
 return new Date(date.getFullYear(),date.getMonth(),date.getDate());
};

const parseTimeToMinutes=(value)=>{
 if(!value||typeof value!=="string")return null;
 const parts=value.split(":");
 if(parts.length<2)return null;
 const hours=Number(parts[0]);
 const minutes=Number(parts[1]);
 if(Number.isNaN(hours)||Number.isNaN(minutes))return null;
 return (hours*60)+minutes;
};

const buildDateTime=(dateValue,timeValue)=>{
 const base=new Date(dateValue);
 const minutes=parseTimeToMinutes(timeValue);
 if(minutes===null)return null;
 const result=new Date(base);
 result.setHours(Math.floor(minutes/60),minutes%60,0,0);
 return result;
};

const normalizeShiftDateRange=({shiftDate,startTime,endTime})=>{
 const shiftDay=toDateOnly(shiftDate);
 const startMinutes=parseTimeToMinutes(startTime);
 const endMinutes=parseTimeToMinutes(endTime);

 if(startMinutes===null||endMinutes===null){
  return {
   shiftDay,
   startDateTime:null,
   endDateTime:null,
   startMinutes:null,
   endMinutes:null,
   crossesMidnight:false
  };
 }

 const startDateTime=buildDateTime(shiftDay,startTime);
 let endDateTime=buildDateTime(shiftDay,endTime);
 const crossesMidnight=endMinutes<=startMinutes;

 if(crossesMidnight&&endDateTime){
  endDateTime.setDate(endDateTime.getDate()+1);
 }

 return {
  shiftDay,
  startDateTime,
  endDateTime,
  startMinutes,
  endMinutes,
  crossesMidnight
 };
};

const getDayOfWeek=(dateValue)=>{
 return new Date(dateValue).getDay();
};

const dateRangesOverlap=(startA,endA,startB,endB)=>{
 if(!startA||!endA||!startB||!endB)return false;
 return startA<endB&&startB<endA;
};

const hasMatchingShiftLocation=(employeeShiftLocations,shiftLocationId)=>{
 if(!shiftLocationId)return true;
 if(!Array.isArray(employeeShiftLocations)||!employeeShiftLocations.length)return false;
 return employeeShiftLocations.some((locationId)=>String(locationId)===String(shiftLocationId));
};

const hasMatchingRole=(employeeRole,shiftRole)=>{
 if(!shiftRole)return true;
 if(!employeeRole)return false;
 return String(employeeRole)===String(shiftRole);
};

const getAvailabilityForDate=(availabilityDoc,shiftDay)=>{
 if(!availabilityDoc)return null;

 const targetDate=toDateOnly(shiftDay);
 const override=(availabilityDoc.overrides||[]).find((item)=>{
  if(!item?.date)return false;
  return toDateOnly(item.date).getTime()===targetDate.getTime();
 });

 if(override)return {source:"override",item:override};

 const dayOfWeek=getDayOfWeek(targetDate);
 const weekly=(availabilityDoc.weekly||[]).find((item)=>Number(item?.dayOfWeek)===dayOfWeek);

 if(weekly)return {source:"weekly",item:weekly};

 return null;
};

const rangeContainsShift=(ranges,startMinutes,endMinutes,crossesMidnight)=>{
 if(!Array.isArray(ranges)||!ranges.length)return false;
 if(startMinutes===null||endMinutes===null)return false;

 return ranges.some((range)=>{
  const rangeStart=parseTimeToMinutes(range?.start);
  const rangeEnd=parseTimeToMinutes(range?.end);

  if(rangeStart===null||rangeEnd===null)return false;

  if(!crossesMidnight){
   return startMinutes>=rangeStart&&endMinutes<=rangeEnd;
  }

  return false;
 });
};

const calculateAssignedMinutesForDate=(shifts,employeeId,shiftDay)=>{
 const dayStart=new Date(shiftDay);
 dayStart.setHours(0,0,0,0);
 const dayEnd=new Date(dayStart);
 dayEnd.setDate(dayEnd.getDate()+1);

 let totalMinutes=0;

 shifts.forEach((shift)=>{
  const isAssigned=(shift.assignedEmployees||[]).some((item)=>String(item?.employee)===String(employeeId)&&item?.status!=="removed"&&item?.status!=="declined");
  if(!isAssigned)return;

  const normalized=normalizeShiftDateRange({
   shiftDate:shift.shiftDate,
   startTime:shift.startTime,
   endTime:shift.endTime
  });

  if(!normalized.startDateTime||!normalized.endDateTime)return;

  const overlapStart=normalized.startDateTime>dayStart?normalized.startDateTime:dayStart;
  const overlapEnd=normalized.endDateTime<dayEnd?normalized.endDateTime:dayEnd;

  if(overlapStart<overlapEnd){
   totalMinutes+=Math.round((overlapEnd-overlapStart)/60000);
  }
 });

 return totalMinutes;
};

export const getShiftValidationResult=async({
 business,
 employee,
 shift,
 excludeShiftId=null
})=>{
 const errors=[];
 const warnings=[];

 const businessId=toObjectId(business||shift?.business);
 const employeeId=toObjectId(employee||shift?.employee);
 const shiftId=toObjectId(excludeShiftId||shift?._id);
 const departmentId=toObjectId(shift?.department);
 const roleId=toObjectId(shift?.role);
 const shiftLocationId=toObjectId(shift?.shiftLocation);

 if(!businessId)errors.push("Business is required.");
 if(!employeeId)errors.push("Employee is required.");
 if(!shift?.shiftDate)errors.push("Shift date is required.");
 if(!shift?.startTime)errors.push("Shift start time is required.");
 if(!shift?.endTime)errors.push("Shift end time is required.");

 if(errors.length){
  return {
   ok:false,
   errors,
   warnings,
   conflicts:{
    employee:null,
    overlappingShifts:[],
    timeOffRequests:[]
   }
  };
 }

 const normalizedTargetShift=normalizeShiftDateRange({
  shiftDate:shift.shiftDate,
  startTime:shift.startTime,
  endTime:shift.endTime
 });

 if(!normalizedTargetShift.startDateTime||!normalizedTargetShift.endDateTime){
  errors.push("Shift start time or end time is invalid.");
  return {
   ok:false,
   errors,
   warnings,
   conflicts:{
    employee:null,
    overlappingShifts:[],
    timeOffRequests:[]
   }
  };
 }

 const employeeDoc=await Employee.findOne({
  _id:employeeId,
  business:businessId
 }).select("business department role status isActive isArchived maxHoursPerWeek preferredShiftTypes shiftLocations");

 if(!employeeDoc){
  errors.push("Employee not found for this business.");
  return {
   ok:false,
   errors,
   warnings,
   conflicts:{
    employee:null,
    overlappingShifts:[],
    timeOffRequests:[]
   }
  };
 }

 if(employeeDoc.isArchived)errors.push("Employee is archived.");
 if(employeeDoc.isActive===false)errors.push("Employee is inactive.");
 if(["inactive","terminated"].includes(String(employeeDoc.status||"")))errors.push("Employee status does not allow scheduling.");

 if(roleId&&!hasMatchingRole(employeeDoc.role,roleId)){
  errors.push("Employee role does not match the shift role.");
 }

 if(shiftLocationId&&!hasMatchingShiftLocation(employeeDoc.shiftLocations,shiftLocationId)){
  errors.push("Employee is not assigned to this shift location.");
 }

 if(departmentId&&employeeDoc.department&&String(employeeDoc.department)!==String(departmentId)){
  warnings.push("Employee department differs from the shift department.");
 }

 const existingShifts=await Shift.find({
  business:businessId,
  ...(shiftId?{_id:{$ne:shiftId}}:{}),
  status:{$nin:["cancelled"]},
  "assignedEmployees.employee":employeeId,
  shiftDate:{
   $gte:new Date(normalizedTargetShift.shiftDay.getFullYear(),normalizedTargetShift.shiftDay.getMonth(),normalizedTargetShift.shiftDay.getDate()-1),
   $lte:new Date(normalizedTargetShift.shiftDay.getFullYear(),normalizedTargetShift.shiftDay.getMonth(),normalizedTargetShift.shiftDay.getDate()+1)
  }
 }).select("business shiftDate startTime endTime title status assignedEmployees");

 const overlappingShifts=existingShifts.filter((existingShift)=>{
  const assigned=(existingShift.assignedEmployees||[]).some((item)=>String(item?.employee)===String(employeeId)&&item?.status!=="removed"&&item?.status!=="declined");
  if(!assigned)return false;

  const normalizedExisting=normalizeShiftDateRange({
   shiftDate:existingShift.shiftDate,
   startTime:existingShift.startTime,
   endTime:existingShift.endTime
  });

  return dateRangesOverlap(
   normalizedTargetShift.startDateTime,
   normalizedTargetShift.endDateTime,
   normalizedExisting.startDateTime,
   normalizedExisting.endDateTime
  );
 });

 if(overlappingShifts.length){
  errors.push("Employee already has an overlapping shift.");
 }

 const approvedTimeOff=await TimeOffRequest.find({
  business:businessId,
  employee:employeeId,
  status:"approved",
  startDate:{$lte:normalizedTargetShift.endDateTime},
  endDate:{$gte:normalizedTargetShift.startDateTime}
 }).select("startDate endDate isPartialDay partialDayStart partialDayEnd status timeOffType type");

 const conflictingTimeOff=approvedTimeOff.filter((request)=>{
  if(!request.isPartialDay)return true;

  const requestDayStart=toDateOnly(request.startDate);
  const shiftDay=toDateOnly(normalizedTargetShift.shiftDay);

  if(requestDayStart.getTime()!==shiftDay.getTime())return true;

  const partialStart=parseTimeToMinutes(request.partialDayStart);
  const partialEnd=parseTimeToMinutes(request.partialDayEnd);

  if(partialStart===null||partialEnd===null)return true;

  const requestStartDateTime=buildDateTime(shiftDay,request.partialDayStart);
  const requestEndDateTime=buildDateTime(shiftDay,request.partialDayEnd);

  return dateRangesOverlap(
   normalizedTargetShift.startDateTime,
   normalizedTargetShift.endDateTime,
   requestStartDateTime,
   requestEndDateTime
  );
 });

 if(conflictingTimeOff.length){
  errors.push("Employee has approved time off for this shift.");
 }

 const availabilityDoc=await Availability.findOne({
  business:businessId,
  employee:employeeId
 }).select("weekly overrides effectiveFrom effectiveTo");

 if(availabilityDoc){
  const effectiveFrom=availabilityDoc.effectiveFrom?toDateOnly(availabilityDoc.effectiveFrom):null;
  const effectiveTo=availabilityDoc.effectiveTo?toDateOnly(availabilityDoc.effectiveTo):null;

  if(effectiveFrom&&normalizedTargetShift.shiftDay<effectiveFrom){
   warnings.push("Shift date is before employee availability effective start.");
  }

  if(effectiveTo&&normalizedTargetShift.shiftDay>effectiveTo){
   warnings.push("Shift date is after employee availability effective end.");
  }

  const availabilityForDate=getAvailabilityForDate(availabilityDoc,normalizedTargetShift.shiftDay);

  if(availabilityForDate){
   if(availabilityForDate.item?.isAvailable===false){
    errors.push("Employee is marked unavailable for this shift date.");
   }else{
    const availableForShift=rangeContainsShift(
     availabilityForDate.item?.ranges,
     normalizedTargetShift.startMinutes,
     normalizedTargetShift.endMinutes,
     normalizedTargetShift.crossesMidnight
    );

    if(!availableForShift&&(availabilityForDate.item?.ranges||[]).length){
      errors.push("Shift falls outside employee availability.");
    }
   }
  }
 }

 const scheduledMinutes=Math.round((normalizedTargetShift.endDateTime-normalizedTargetShift.startDateTime)/60000);
 const sameWeekStart=new Date(normalizedTargetShift.shiftDay);
 sameWeekStart.setDate(sameWeekStart.getDate()-sameWeekStart.getDay());
 sameWeekStart.setHours(0,0,0,0);
 const sameWeekEnd=new Date(sameWeekStart);
 sameWeekEnd.setDate(sameWeekEnd.getDate()+7);

 const weeklyShifts=await Shift.find({
  business:businessId,
  ...(shiftId?{_id:{$ne:shiftId}}:{}),
  status:{$nin:["cancelled"]},
  "assignedEmployees.employee":employeeId,
  shiftDate:{$gte:sameWeekStart,$lt:sameWeekEnd}
 }).select("shiftDate startTime endTime assignedEmployees");

 const existingWeeklyMinutes=weeklyShifts.reduce((total,existingShift)=>{
  const assigned=(existingShift.assignedEmployees||[]).some((item)=>String(item?.employee)===String(employeeId)&&item?.status!=="removed"&&item?.status!=="declined");
  if(!assigned)return total;

  const normalizedExisting=normalizeShiftDateRange({
   shiftDate:existingShift.shiftDate,
   startTime:existingShift.startTime,
   endTime:existingShift.endTime
  });

  if(!normalizedExisting.startDateTime||!normalizedExisting.endDateTime)return total;

  return total+Math.round((normalizedExisting.endDateTime-normalizedExisting.startDateTime)/60000);
 },0);

 if(employeeDoc.maxHoursPerWeek&&((existingWeeklyMinutes+scheduledMinutes)>(employeeDoc.maxHoursPerWeek*60))){
  warnings.push("This assignment exceeds the employee weekly hours limit.");
 }

 if(Array.isArray(employeeDoc.preferredShiftTypes)&&employeeDoc.preferredShiftTypes.length&&shift.shiftType){
  if(!employeeDoc.preferredShiftTypes.includes(shift.shiftType)){
   warnings.push("Shift type is outside employee preferred shift types.");
  }
 }

 return {
  ok:errors.length===0,
  errors,
  warnings,
  conflicts:{
   employee:employeeDoc,
   overlappingShifts,
   timeOffRequests:conflictingTimeOff
  }
 };
};

export const validateShiftAssignmentOrThrow=async(payload)=>{
 const result=await getShiftValidationResult(payload);
 if(!result.ok){
  const error=new Error(result.errors.join(" "));
  error.validation=result;
  throw error;
 }
 return result;
};

export default {
 getShiftValidationResult,
 validateShiftAssignmentOrThrow
};