// backend/services/time/timeEntryCorrectionService.js
import TimeEntry from "../../models/time/timeEntryModel.js";

const recalcEntry=(entry)=>{
 if(!entry.clockIn||!entry.clockOut)return entry;

 const rawMinutes=Math.max(0,Math.round((new Date(entry.clockOut)-new Date(entry.clockIn))/60000));
 const unpaidBreakMinutes=(entry.breaks||[]).reduce((sum,item)=>{
  const duration=Number(item?.durationMinutes||0);
  return item?.paid?sum:sum+duration;
 },0);

 entry.totalWorkedMinutes=Math.max(0,rawMinutes-unpaidBreakMinutes);
 entry.regularWorkedMinutes=entry.totalWorkedMinutes;
 entry.overtimeMinutes=0;
 entry.status="edited";

 return entry;
};

export const correctTimeEntry=async({entryId,updates={},note=""})=>{
 const entry=await TimeEntry.findById(entryId);
 if(!entry)throw new Error("Time entry not found.");

 Object.assign(entry,updates);
 recalcEntry(entry);

 if(note){
  entry.notes=[
   ...(Array.isArray(entry.notes)?entry.notes:[]),
   {date:new Date(),text:note}
  ];
 }

 await entry.save();

 return entry;
};

export default {
 correctTimeEntry
};