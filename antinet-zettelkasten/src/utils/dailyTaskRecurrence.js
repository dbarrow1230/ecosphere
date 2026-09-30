const utcDay=date=>new Date(`${date}T12:00:00Z`);
const dateString=date=>date.toISOString().slice(0,10);

export const taskOccursOnDate=(task,date)=>{
 if(!task?.scheduledDate||!date||date<task.scheduledDate)return false;
 if(task.recurrenceEndDate&&date>task.recurrenceEndDate)return false;
 const rule=task.recurrenceRule||"none";
 if(rule==="none")return date===task.scheduledDate;
 if(rule==="daily")return true;
 const start=utcDay(task.scheduledDate);
 const target=utcDay(date);
 const days=Math.round((target-start)/86400000);
 if(rule==="weekly")return days%7===0;
 if(rule==="biweekly")return days%14===0;
 if(rule==="monthly"){
  const lastDay=new Date(Date.UTC(target.getUTCFullYear(),target.getUTCMonth()+1,0)).getUTCDate();
  return target.getUTCDate()===Math.min(start.getUTCDate(),lastDay);
 }
 return false;
};

export const taskCompletedOnDate=(task,date)=>task.recurrenceRule&&task.recurrenceRule!=="none"
 ?(task.completedDates||[]).includes(date)
 :!!task.completed;

export const taskOccurrenceDates=(task,from,to)=>{
 if(!task?.scheduledDate||!from||!to||from>to)return [];
 const dates=[];
 const day=utcDay(from>task.scheduledDate?from:task.scheduledDate);
 const end=utcDay(to);
 for(;day<=end;day.setUTCDate(day.getUTCDate()+1)){
  const date=dateString(day);
  if(taskOccursOnDate(task,date))dates.push(date);
 }
 return dates;
};
