// backend/services/payrollAdjustmentService.js
import Payroll from "../../models/payroll/payrollModel.js";

export const voidPayroll=async({payrollId})=>{
 const payroll=await Payroll.findById(payrollId);
 if(!payroll)throw new Error("Payroll not found.");

 payroll.status="void";
 await payroll.save();

 return payroll;
};

export default {
 voidPayroll
};