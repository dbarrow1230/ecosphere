// backend/services/timeEntryEditService.js
import TimeEntry from "../../models/time/timeEntryModel.js";

const recalc=(entry)=>{
 const start=new Date(entry.clockIn||0);
 const end=new Date(entry.clockOut||0);
 if(!entry.clockIn||!entry.clockOut||end<=start)return entry;

 const rawMinutes=Math.round((end-start)/60000);

 let breakMinutes=0;
 (entry.breaks||[]).forEach(b=>{
  if(b.start&&b.end){
   breakMinutes+=Math.round((new Date(b.end)-new Date(b.start))/60000);
  }
 });

 entry.totalWorkedMinutes=Math.max(0,rawMinutes-breakMinutes);
 entry.regularWorkedMinutes=entry.totalWorkedMinutes;
 entry.overtimeMinutes=0;
 return entry;
};

export const editTimeEntry=async({entryId,updates})=>{
 const entry=await TimeEntry.findById(entryId);
 if(!entry)throw new Error("Time entry not found.");

 Object.assign(entry,updates);
 recalc(entry);

 entry.status="edited";
 await entry.save();

 return entry;
};

export default {
 editTimeEntry
};