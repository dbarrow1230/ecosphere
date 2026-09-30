// backend/services/payroll/payStubGenerationService.js
import PayStub from "../../models/payroll/payStubModel.js";
import Payroll from "../../models/payroll/payrollModel.js";
import {calculatePayrollTaxes} from "./payrollTaxService.js";

export const generatePayStubFromPayroll=async({payrollId,federalRate=0,stateRate=0,localRate=0})=>{
 const payroll=await Payroll.findById(payrollId);
 if(!payroll)throw new Error("Payroll not found.");

 const existing=await PayStub.findOne({payroll:payroll._id});
 if(existing)return existing;

 const taxResult=calculatePayrollTaxes({
  grossPay:payroll.grossPay,
  federalRate,
  stateRate,
  localRate
 });

 return PayStub.create({
  business:payroll.business,
  employee:payroll.employee,
  payroll:payroll._id,
  payrollPeriod:payroll.payrollPeriod||null,
  payDate:payroll.payDate||null,
  earnings:[
   {label:"Regular",hours:Number(payroll.totalRegularMinutes||0)/60,rate:Number(payroll.hourlyRate||0),amount:Number(payroll.regularPay||0)},
   {label:"Overtime",hours:Number(payroll.totalApprovedOvertimeMinutes||payroll.totalOvertimeMinutes||0)/60,rate:Number(payroll.overtimeRate||0),amount:Number(payroll.overtimePay||0)}
  ],
  taxes:[
   {label:"Federal Tax",amount:taxResult.federalTax},
   {label:"State Tax",amount:taxResult.stateTax},
   {label:"Local Tax",amount:taxResult.localTax}
  ],
  grossPay:Number(payroll.grossPay||0),
  totalDeductions:0,
  totalTaxes:taxResult.totalTaxes,
  netPay:taxResult.netPay,
  status:"issued"
 });
};

export default {
 generatePayStubFromPayroll
};