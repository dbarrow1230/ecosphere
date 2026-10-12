// Follow-ups remain actionable even when the original journal activity was completed.
export const buildJournalFollowUpTasks=entries=>entries
 .filter(entry=>entry.isActive!==false&&entry.followUpDate&&!Number.isNaN(new Date(entry.followUpDate).getTime()))
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
 const tasks=new Map((dashboard.gardenTasks||[]).map(task=>[String(task._id),task]));
 for(const task of buildJournalFollowUpTasks(entries))tasks.set(task._id,task);
 return {...dashboard,gardenTasks:[...tasks.values()].sort((a,b)=>(a.dueDate||"9999").localeCompare(b.dueDate||"9999"))};
};
