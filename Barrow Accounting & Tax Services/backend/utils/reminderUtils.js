// backend/utils/reminderUtils.js
export function getReminderRecipients(reminder){
 if(reminder.audienceType==="all") return [];
 return Array.isArray(reminder.selectedUsers)&&reminder.selectedUsers.length
  ?reminder.selectedUsers.map(id=>String(id))
  :[String(reminder.userId||reminder.user)];
}

export function getNextRunAt(reminder){
 const base=new Date(reminder.nextRunAt||reminder.sendAt);
 if(Number.isNaN(base.getTime())) return null;

 const next=new Date(base);

 if(reminder.recurrenceRule==="daily"){
  next.setDate(next.getDate()+1);
  return next;
 }

 if(reminder.recurrenceRule==="weekly"){
  next.setDate(next.getDate()+7);
  return next;
 }

 if(reminder.recurrenceRule==="bi-weekly"){
  next.setDate(next.getDate()+14);
  return next;
 }

 if(reminder.recurrenceRule==="monthly"){
  next.setMonth(next.getMonth()+1);
  return next;
 }

 return null;
}

export function isPastRecurrenceEnd(reminder,nextRunAt){
 if(!reminder.recurrenceEndAt) return false;
 if(!nextRunAt) return true;
 return new Date(nextRunAt)>new Date(reminder.recurrenceEndAt);
}
