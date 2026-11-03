// backend/services/payrollProcessingService.js
import Payroll from "../../models/payroll/payrollModel.js";
import PayStub from "../../models/payroll/payStubModel.js";
import TimeEntry from "../../models/time/timeEntryModel.js";
import PayrollPeriod from "../../models/payroll/payrollPeriodModel.js";
import Employee from "../../models/employee/employeeModel.js";
import {getActiveOvertimeRule,calculateOvertimeMinutes} from "./overtimeRuleService.js";

const minutesToHours=(minutes)=>Number(minutes||0)/60;

export const processEmployeePayroll=async({business,employeeId,payrollPeriodId,processedBy=null})=>{
 const payrollPeriod=await PayrollPeriod.findOne({
  _id:payrollPeriodId,
  business
 });

 if(!payrollPeriod)throw new Error("Payroll period not found.");

 const employee=await Employee.findOne({
  _id:employeeId,
  business
 }).select("hourlyRate salaryAmount payType overtimeEligible department role");

 if(!employee)throw new Error("Employee not found.");

 const existingPayroll=await Payroll.findOne({
  business,
  employee:employeeId,
  payPeriodStart:payrollPeriod.startDate,
  payPeriodEnd:payrollPeriod.endDate
 });

 if(existingPayroll)throw new Error("Payroll already exists for this employee and payroll period.");

 const timeEntries=await TimeEntry.find({
  business,
  employee:employeeId,
  payrollStatus:"unprocessed",
  status:"completed",
  workDate:{
   $gte:payrollPeriod.startDate,
   $lte:payrollPeriod.endDate
  }
 }).sort({workDate:1});

 const overtimeRule=await getActiveOvertimeRule({
  business,
  department:employee.department||null,
  role:employee.role||null
 });

 const hourlyRate=employee.payType==="hourly"?Number(employee.hourlyRate||0):0;
 const overtimeMultiplier=Number(overtimeRule?.overtimeMultiplier||1.5);
 const overtimeRate=employee.payType==="hourly"&&employee.overtimeEligible!==false?hourlyRate*overtimeMultiplier:0;

 let totalRegularMinutes=0;
 let totalOvertimeMinutes=0;
 let totalApprovedOvertimeMinutes=0;
 let totalWorkedMinutes=0;
 let regularPay=0;
 let overtimePay=0;

 const payrollTimeEntries=timeEntries.map((entry)=>{
  const totalEntryWorkedMinutes=Number(entry.totalWorkedMinutes||0);

  const overtimeCalc=calculateOvertimeMinutes({
   totalWorkedMinutes:totalEntryWorkedMinutes,
   dailyWorkedMinutes:totalEntryWorkedMinutes,
   employee,
   overtimeRule
  });

  const regularWorkedMinutes=Number(overtimeCalc.regularWorkedMinutes||0);
  const overtimeMinutes=Number(overtimeCalc.overtimeMinutes||0);
  const approvedOvertimeMinutes=Number(overtimeCalc.approvedOvertimeMinutes||0);

  const entryRegularPay=employee.payType==="hourly"
   ?minutesToHours(regularWorkedMinutes)*hourlyRate
   :0;

  const entryOvertimePay=employee.payType==="hourly"&&employee.overtimeEligible!==false
   ?minutesToHours(approvedOvertimeMinutes)*overtimeRate
   :0;

  const entryGrossPay=entryRegularPay+entryOvertimePay;

  totalRegularMinutes+=regularWorkedMinutes;
  totalOvertimeMinutes+=overtimeMinutes;
  totalApprovedOvertimeMinutes+=approvedOvertimeMinutes;
  totalWorkedMinutes+=totalEntryWorkedMinutes;
  regularPay+=entryRegularPay;
  overtimePay+=entryOvertimePay;

  return {
   timeEntry:entry._id,
   workDate:entry.workDate,
   regularWorkedMinutes,
   overtimeMinutes,
   approvedOvertimeMinutes,
   totalWorkedMinutes:totalEntryWorkedMinutes,
   hourlyRate,
   overtimeRate,
   regularPay:entryRegularPay,
   overtimePay:entryOvertimePay,
   grossPay:entryGrossPay
  };
 });

 let grossPay=regularPay+overtimePay;

 if(employee.payType==="salary"){
  grossPay=Number(employee.salaryAmount||0);
  regularPay=grossPay;
  overtimePay=0;
  totalRegularMinutes=totalWorkedMinutes;
  totalOvertimeMinutes=0;
  totalApprovedOvertimeMinutes=0;
 }

 const payroll=await Payroll.create({
  business,
  employee:employeeId,
  payrollPeriod:payrollPeriod._id,
  payPeriodStart:payrollPeriod.startDate,
  payPeriodEnd:payrollPeriod.endDate,
  payDate:payrollPeriod.payDate||null,
  timeEntries:payrollTimeEntries,
  totalRegularMinutes,
  totalOvertimeMinutes,
  totalApprovedOvertimeMinutes,
  totalWorkedMinutes,
  hourlyRate,
  overtimeRate,
  regularPay,
  overtimePay,
  grossPay,
  status:"processed",
  processedAt:new Date(),
  processedBy
 });

 await PayStub.create({
  business,
  employee:employeeId,
  payroll:payroll._id,
  payrollPeriod:payrollPeriod._id,
  payDate:payroll.payDate||null,
  earnings:employee.payType==="salary"
   ?[
     {
      label:"Salary",
      hours:0,
      rate:Number(employee.salaryAmount||0),
      amount:grossPay
     }
    ]
   :[
     {
      label:"Regular",
      hours:minutesToHours(totalRegularMinutes),
      rate:hourlyRate,
      amount:regularPay
     },
     {
      label:"Overtime",
      hours:minutesToHours(totalApprovedOvertimeMinutes||totalOvertimeMinutes),
      rate:overtimeRate,
      amount:overtimePay
     }
    ],
  grossPay,
  totalDeductions:0,
  totalTaxes:0,
  netPay:grossPay,
  status:"issued"
 });

 for(const entry of timeEntries){
  const overtimeCalc=calculateOvertimeMinutes({
   totalWorkedMinutes:Number(entry.totalWorkedMinutes||0),
   dailyWorkedMinutes:Number(entry.totalWorkedMinutes||0),
   employee,
   overtimeRule
  });

  entry.payroll=payroll._id;
  entry.payrollStatus="processed";
  entry.payrollProcessedAt=new Date();
  entry.payrollProcessedBy=processedBy||null;
  entry.hourlyRateSnapshot=hourlyRate;
  entry.overtimeRateSnapshot=overtimeRate;
  entry.regularWorkedMinutes=Number(overtimeCalc.regularWorkedMinutes||entry.totalWorkedMinutes||0);
  entry.overtimeMinutes=Number(overtimeCalc.overtimeMinutes||0);
  entry.approvedOvertimeMinutes=Number(overtimeCalc.approvedOvertimeMinutes||0);
  entry.regularPayAmount=employee.payType==="hourly"
   ?minutesToHours(Number(entry.regularWorkedMinutes||0))*hourlyRate
   :0;
  entry.overtimePayAmount=employee.payType==="hourly"&&employee.overtimeEligible!==false
   ?minutesToHours(Number(entry.approvedOvertimeMinutes||0))*overtimeRate
   :0;
  entry.grossPayAmount=employee.payType==="salary"
   ?0
   :Number(entry.regularPayAmount||0)+Number(entry.overtimePayAmount||0);
  await entry.save();
 }

 return payroll;
};

export default {
 processEmployeePayroll
};