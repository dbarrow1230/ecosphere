// backend/services/time/timeEntryApprovalService.js
import TimeEntry from "../../models/time/timeEntryModel.js";

export const approveTimeEntryOvertime=async({entryId,userId,approvedMinutes=null})=>{
 const entry=await TimeEntry.findById(entryId);
 if(!entry)throw new Error("Time entry not found.");

 const overtimeMinutes=Number(entry.overtimeMinutes||0);
 const minutes=approvedMinutes===null?overtimeMinutes:Number(approvedMinutes||0);

 entry.approvedOvertimeMinutes=Math.min(minutes,overtimeMinutes);
 entry.overtimeApprovedBy=userId||null;
 entry.overtimeApprovedAt=new Date();
 entry.overtimeStatus=entry.approvedOvertimeMinutes>0?"approved":"none";

 await entry.save();

 return entry;
};

export const rejectTimeEntryOvertime=async({entryId,userId})=>{
 const entry=await TimeEntry.findById(entryId);
 if(!entry)throw new Error("Time entry not found.");

 entry.approvedOvertimeMinutes=0;
 entry.overtimeApprovedBy=userId||null;
 entry.overtimeApprovedAt=new Date();
 entry.overtimeStatus="rejected";

 await entry.save();

 return entry;
};

export default {
 approveTimeEntryOvertime,
 rejectTimeEntryOvertime
};