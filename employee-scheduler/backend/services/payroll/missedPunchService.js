// backend/services/payroll/missedPunchService.js
import TimeEntry from "../../models/time/timeEntryModel.js";

export const markMissedClockOuts=async({business,cutoffDate=new Date()})=>{
 const entries=await TimeEntry.find({
  business,
  status:{$in:["active","on-break"]},
  clockIn:{$lt:new Date(cutoffDate)}
 });

 for(const entry of entries){
  entry.status="missed-clock-out";
  entry.notes=[
   ...(Array.isArray(entry.notes)?entry.notes:[]),
   {date:new Date(),text:"Marked as missed clock out."}
  ];
  await entry.save();
 }

 return entries;
};

export default {
 markMissedClockOuts
};