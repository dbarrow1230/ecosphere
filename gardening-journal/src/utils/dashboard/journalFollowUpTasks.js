// Follow-ups remain actionable even when the original journal activity was completed.
const dateKey=value=>{
 if(!value)return "";
 const date=new Date(value);
 return Number.isNaN(date.getTime())?"":date.toISOString().slice(0,10);
};
export const isJournalFollowUpComplete=entry=>{
 if(!entry.followUpDate)return false;
 const due=dateKey(entry.followUpDate);
 if(!due)return false;
 return (entry.notes||[]).some(note=>{
  if(note.completedFollowUpDate)return dateKey(note.completedFollowUpDate)===due;
  // Recognize follow-ups recorded before completion tracking was introduced.
  return dateKey(note.date)>=due&&
   (!!String(note.note||"").trim()||Object.values(note.readings||{}).some(value=>value!==null&&value!==undefined&&value!==""));
 });
};

export const buildJournalFollowUpTasks=entries=>entries
 .filter(entry=>entry.isActive!==false&&entry.followUpDate&&!Number.isNaN(new Date(entry.followUpDate).getTime())&&!isJournalFollowUpComplete(entry))
 .map(entry=>({
  _id:`follow-up-${entry._id}`,
  journalEntryId:String(entry._id),
  title:`Follow up: ${entry.title||entry.entryType||"Journal entry"}`,
  dueDate:new Date(entry.followUpDate).toISOString().slice(0,10),
  garden:entry.garden?.name||"",
  category:"Journal follow-up",
  status:"pending",
  href:"/journal"
 }));

export const mergeJournalFollowUps=(dashboard,journalData)=>{
 const entries=Array.isArray(journalData)?journalData:journalData?.data||journalData?.items||journalData?.results||[];
 const tasks=new Map((dashboard.gardenTasks||[]).filter(task=>!task.journalEntryId&&!String(task._id).startsWith("follow-up-")).map(task=>[String(task._id),task]));
 for(const task of buildJournalFollowUpTasks(entries))tasks.set(task._id,task);
 return {...dashboard,gardenTasks:[...tasks.values()].sort((a,b)=>(a.dueDate||"9999").localeCompare(b.dueDate||"9999"))};
};
