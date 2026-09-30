const jsonHeaders={"Content-Type":"application/json"};

const readJson=async response=>{
 const data=await response.json().catch(()=>null);
 if(!response.ok){
  throw new Error(data?.message||data?.error||`Request failed with status ${response.status}`);
 }
 return data;
};

export const apiRequest=async(url,options={})=>{
 const response=await fetch(url,{
  ...options,
  headers:{...jsonHeaders,...options.headers}
 });
 return readJson(response);
};

export const toDateInput=value=>{
 if(!value)return "";
 const date=new Date(value);
 return Number.isNaN(date.getTime())?String(value).slice(0,10):date.toISOString().slice(0,10);
};

export const employeeFromApi=employee=>({
 ...employee,
 id:employee._id,
 employeeNumber:employee.employeeNumber||"",
 rate:employee.payType==="Salary"?Number(employee.salaryAmount||0):Number(employee.hourlyRate||0),
 startDate:toDateInput(employee.startDate)
});

export const employeeToApi=employee=>({
 employeeNumber:employee.employeeNumber,
 firstName:employee.firstName,
 lastName:employee.lastName,
 gender:employee.gender,
 status:employee.status,
 position:employee.position,
 payType:employee.payType,
 hourlyRate:employee.payType==="Hourly"?Number(employee.rate||0):0,
 salaryAmount:employee.payType==="Salary"?Number(employee.rate||0):0,
 email:employee.email,
 phone:employee.phone,
 startDate:employee.startDate||null,
 notes:employee.notes||"",
 isActive:employee.status==="Active"
});

export const timeClockFromApi=entry=>({
 ...entry,
 id:entry._id,
 employeeId:entry.employeeRef?._id||entry.employeeRef||"",
 date:toDateInput(entry.workDate)
});

export const timeClockToApi=entry=>({
 employeeRef:entry.employeeId,
 workDate:entry.date,
 clockIn:entry.clockIn,
 breakOut:entry.breakOut,
 breakIn:entry.breakIn,
 clockOut:entry.clockOut,
 notes:entry.notes,
 method:entry.method||"Manual"
});

export const leaveFromApi=leave=>({
 ...leave,
 id:leave._id,
 employeeId:leave.employeeRef?._id||leave.employeeRef||"",
 type:leave.leaveType,
 rate:Number(leave.earningsRate||0),
 annualMax:Number(leave.annualMaxHours||0),
 used:Number(leave.usedHours||0)
});

export const leaveToApi=leave=>({
 employeeRef:leave.employeeId,
 leaveType:leave.type,
 paid:leave.paid,
 earningsRate:Number(leave.rate||0),
 annualMaxHours:Number(leave.annualMax||0),
 usedHours:Number(leave.used||0),
 notes:leave.notes||""
});

export const payrollFromApi=payroll=>({
 ...payroll,
 id:payroll._id,
 name:payroll.payrollName,
 from:toDateInput(payroll.fromDate),
 to:toDateInput(payroll.toDate)
});

export const payrollToApi=payroll=>({
 payrollName:payroll.name||`${payroll.from}_${payroll.to}`,
 fromDate:payroll.from,
 toDate:payroll.to,
 status:payroll.status,
 payFrequency:payroll.payFrequency||"Bi-Weekly",
 notes:payroll.notes||""
});

export const eventFromApi=event=>({
 ...event,
 id:event._id,
 name:event.eventName,
 type:event.eventType,
 employeeId:event.employeeRef?._id||event.employeeRef||"",
 createdOn:toDateInput(event.createdOn),
 reminderDate:toDateInput(event.reminderDate)
});

export const eventToApi=event=>({
 eventName:event.name,
 eventType:event.type,
 employeeRef:event.employeeId||null,
 createdOn:event.createdOn,
 recurring:event.recurring,
 reminder:event.reminder,
 reminderDate:event.reminderDate||null,
 notes:event.notes
});

export const attachmentFromApi=attachment=>({
 ...attachment,
 id:attachment._id,
 employeeId:attachment.employeeRef?._id||attachment.employeeRef||"",
 type:attachment.fileType,
 addedOn:toDateInput(attachment.addedOn)
});

export const attachmentToApi=attachment=>({
 employeeRef:attachment.employeeId||null,
 fileName:attachment.fileName,
 fileType:attachment.type,
 fileUrl:attachment.fileUrl||"",
 addedBy:attachment.addedBy,
 addedOn:attachment.addedOn
});

export const loadEmployeeData=async()=>{
 const [employees,timeClock,leave,payrolls,events,attachments,schedules]=await Promise.all([
  apiRequest("/api/employees"),
  apiRequest("/api/time-clock"),
  apiRequest("/api/employee-leave"),
  apiRequest("/api/payrolls"),
  apiRequest("/api/employee-events"),
  apiRequest("/api/employee-attachments"),
  apiRequest("/api/weekly-schedules")
 ]);

 return{
  employees:employees.map(employeeFromApi),
  timeClock:timeClock.map(timeClockFromApi),
  leave:leave.map(leaveFromApi),
  payrolls:payrolls.map(payrollFromApi),
  events:events.map(eventFromApi),
  attachments:attachments.map(attachmentFromApi),
  schedules
 };
};
