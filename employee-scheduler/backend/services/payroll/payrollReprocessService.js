// backend/services/payroll/payrollReprocessService.js
import Payroll from "../../models/payroll/payrollModel.js";
import PayStub from "../../models/payroll/payStubModel.js";
import TimeEntry from "../../models/time/timeEntryModel.js";

export const reopenPayroll=async({payrollId})=>{
 const payroll=await Payroll.findById(payrollId);
 if(!payroll)throw new Error("Payroll not found.");

 payroll.status="draft";
 await payroll.save();

 await TimeEntry.updateMany(
  {payroll:payroll._id},
  {
   $set:{
    payrollStatus:"unprocessed",
    payroll:null,
    payrollProcessedAt:null,
    payrollProcessedBy:null
   }
  }
 );

 await PayStub.updateMany(
  {payroll:payroll._id},
  {$set:{status:"void"}}
 );

 return payroll;
};

export default {
 reopenPayroll
};