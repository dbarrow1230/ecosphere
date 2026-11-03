// backend/services/payroll/attendanceService.js
import TimeEntry from "../../models/time/timeEntryModel.js";

export const getAttendanceSummary=async({business,employee=null,startDate,endDate})=>{
 const query={
  business,
  workDate:{
   $gte:new Date(startDate),
   $lte:new Date(endDate)
  }
 };

 if(employee)query.employee=employee;

 const entries=await TimeEntry.find(query).sort({workDate:1});

 const summary=entries.reduce((acc,item)=>{
  acc.totalEntries+=1;
  acc.totalWorkedMinutes+=Number(item.totalWorkedMinutes||0);
  acc.totalOvertimeMinutes+=Number(item.overtimeMinutes||0);
  if(item.status==="missed-clock-out")acc.missedPunches+=1;
  return acc;
 },{
  totalEntries:0,
  totalWorkedMinutes:0,
  totalOvertimeMinutes:0,
  missedPunches:0
 });

 return summary;
};

export default {
 getAttendanceSummary
};