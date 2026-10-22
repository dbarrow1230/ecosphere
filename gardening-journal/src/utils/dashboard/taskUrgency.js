export const localDateKey=(date=new Date())=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;

export const taskDateKey=task=>{
 const value=task.dueDate||task.taskDate||task.expirationDate||task.expiryDate;
 if(!value||Number.isNaN(new Date(value).getTime()))return "";
 return String(value).slice(0,10);
};

export const taskUrgency=(task,today=localDateKey())=>{
 const date=taskDateKey(task);
 return !date?"unscheduled":date<today?"overdue":date===today?"today":"upcoming";
};

export const sortTasksByUrgency=(tasks,today=localDateKey())=>{
 const rank={overdue:0,today:1,upcoming:2,unscheduled:3};
 return tasks.filter(task=>task.isActive!==false&&!["done","complete","completed","cancelled","canceled"].includes(String(task.status||"").toLowerCase()))
  .sort((a,b)=>rank[taskUrgency(a,today)]-rank[taskUrgency(b,today)]||(taskDateKey(a)||"9999").localeCompare(taskDateKey(b)||"9999"));
};
