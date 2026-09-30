// backend/services/timeOffRequestService.js
import TimeOffRequest from "../../models/employee/timeOffRequestModel.js";
import VacationBalance from "../../models/employee/vacationBalanceModel.js";

const toDateOnly=(value)=>{
 const date=new Date(value);
 return new Date(date.getFullYear(),date.getMonth(),date.getDate());
};

const millisecondsPerDay=24*60*60*1000;

const calculateTotalDays=(startDate,endDate)=>{
 const start=toDateOnly(startDate);
 const end=toDateOnly(endDate);
 return Math.floor((end-start)/millisecondsPerDay)+1;
};

const getBalanceYear=(startDate)=>{
 return new Date(startDate).getFullYear();
};

const subtractHoursFromBalance=async({business,employee,timeOffType,startDate,hours,requestId})=>{
 if(!timeOffType||!hours||hours<=0)return null;

 const year=getBalanceYear(startDate);

 const balance=await VacationBalance.findOne({
  business,
  employee,
  timeOffType,
  year
 });

 if(!balance)return null;

 balance.usedHours=Number(balance.usedHours||0)+Number(hours||0);
 balance.availableHours=
  Number(balance.openingHours||0)+
  Number(balance.accruedHours||0)+
  Number(balance.adjustedHours||0)+
  Number(balance.carryoverHours||0)-
  Number(balance.usedHours||0);

 balance.entries.push({
  date:new Date(),
  type:"used",
  hours:Number(hours||0),
  referenceType:"timeOffRequest",
  referenceId:requestId,
  note:"Approved time off request"
 });

 await balance.save();
 return balance;
};

const restoreHoursToBalance=async({business,employee,timeOffType,startDate,hours,requestId})=>{
 if(!timeOffType||!hours||hours<=0)return null;

 const year=getBalanceYear(startDate);

 const balance=await VacationBalance.findOne({
  business,
  employee,
  timeOffType,
  year
 });

 if(!balance)return null;

 balance.usedHours=Math.max(0,Number(balance.usedHours||0)-Number(hours||0));
 balance.availableHours=
  Number(balance.openingHours||0)+
  Number(balance.accruedHours||0)+
  Number(balance.adjustedHours||0)+
  Number(balance.carryoverHours||0)-
  Number(balance.usedHours||0);

 balance.entries.push({
  date:new Date(),
  type:"adjustment",
  hours:Number(hours||0),
  referenceType:"timeOffRequest",
  referenceId:requestId,
  note:"Restored hours from cancelled or denied time off request"
 });

 await balance.save();
 return balance;
};

export const createTimeOffRequest=async(payload)=>{
 const totalDays=payload.isPartialDay?1:calculateTotalDays(payload.startDate,payload.endDate);

 const request=await TimeOffRequest.create({
  ...payload,
  totalDays,
  totalHours:Number(payload.totalHours||0)
 });

 return request;
};

export const approveTimeOffRequest=async({requestId,reviewedBy,reviewNote=""})=>{
 const request=await TimeOffRequest.findById(requestId);

 if(!request)throw new Error("Time off request not found.");
 if(request.status!=="pending")throw new Error("Only pending requests can be approved.");

 request.status="approved";
 request.reviewedBy=reviewedBy||null;
 request.reviewedAt=new Date();
 request.reviewNote=reviewNote;

 await request.save();

 await subtractHoursFromBalance({
  business:request.business,
  employee:request.employee,
  timeOffType:request.timeOffType,
  startDate:request.startDate,
  hours:Number(request.totalHours||0),
  requestId:request._id
 });

 return request;
};

export const denyTimeOffRequest=async({requestId,reviewedBy,reviewNote=""})=>{
 const request=await TimeOffRequest.findById(requestId);

 if(!request)throw new Error("Time off request not found.");
 if(request.status!=="pending")throw new Error("Only pending requests can be denied.");

 request.status="denied";
 request.reviewedBy=reviewedBy||null;
 request.reviewedAt=new Date();
 request.reviewNote=reviewNote;

 await request.save();

 return request;
};

export const cancelTimeOffRequest=async({requestId,reviewedBy=null,reviewNote=""})=>{
 const request=await TimeOffRequest.findById(requestId);

 if(!request)throw new Error("Time off request not found.");
 if(request.status==="cancelled")throw new Error("Time off request is already cancelled.");

 const previousStatus=request.status;

 request.status="cancelled";
 request.reviewedBy=reviewedBy||request.reviewedBy||null;
 request.reviewedAt=new Date();
 request.reviewNote=reviewNote||request.reviewNote||"";

 await request.save();

 if(previousStatus==="approved"){
  await restoreHoursToBalance({
   business:request.business,
   employee:request.employee,
   timeOffType:request.timeOffType,
   startDate:request.startDate,
   hours:Number(request.totalHours||0),
   requestId:request._id
  });
 }

 return request;
};

export default {
 createTimeOffRequest,
 approveTimeOffRequest,
 denyTimeOffRequest,
 cancelTimeOffRequest
};