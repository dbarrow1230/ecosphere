// backend/services/reports/reportingService.js
import Shift from "../../models/scheduling/shiftModel.js";
import TimeEntry from "../../models/time/timeEntryModel.js";
import Payroll from "../../models/payroll/payrollModel.js";

export const getBusinessReport=async({business,startDate,endDate})=>{
 const start=new Date(startDate);
 const end=new Date(endDate);

 const [shiftCount,timeEntries,payrolls]=await Promise.all([
  Shift.countDocuments({
   business,
   shiftDate:{$gte:start,$lte:end}
  }),
  TimeEntry.find({
   business,
   workDate:{$gte:start,$lte:end}
  }),
  Payroll.find({
   business,
   payPeriodStart:{$lte:end},
   payPeriodEnd:{$gte:start}
  })
 ]);

 const totalWorkedMinutes=timeEntries.reduce((sum,item)=>sum+Number(item.totalWorkedMinutes||0),0);
 const totalOvertimeMinutes=timeEntries.reduce((sum,item)=>sum+Number(item.overtimeMinutes||0),0);
 const totalPayroll=payrolls.reduce((sum,item)=>sum+Number(item.grossPay||0),0);

 return {
  shiftCount,
  timeEntryCount:timeEntries.length,
  totalWorkedMinutes,
  totalOvertimeMinutes,
  totalPayroll
 };
};

export default {
 getBusinessReport
};