// backend/services/timeEntryService.js
import TimeEntry from "../../models/time/timeEntryModel.js";
import Employee from "../../models/employee/employeeModel.js";
import Shift from "../../models/scheduling/shiftModel.js";

const parseTimeToMinutes=(value)=>{
 if(!value||typeof value!=="string")return null;
 const [hours,minutes]=value.split(":").map(Number);
 if(Number.isNaN(hours)||Number.isNaN(minutes))return null;
 return (hours*60)+minutes;
};

const buildShiftDateTime=(shiftDate,timeValue)=>{
 const date=new Date(shiftDate);
 const totalMinutes=parseTimeToMinutes(timeValue);
 if(totalMinutes===null)return null;
 date.setHours(Math.floor(totalMinutes/60),totalMinutes%60,0,0);
 return date;
};

const calculateBreakTotals=(breaks=[])=>{
 let totalBreakMinutes=0;
 let totalPaidBreakMinutes=0;
 let totalUnpaidBreakMinutes=0;

 breaks.forEach((item)=>{
  const start=item?.start?new Date(item.start):null;
  const end=item?.end?new Date(item.end):null;
  let minutes=Number(item?.durationMinutes||0);

  if(start&&end&&end>start){
   minutes=Math.round((end-start)/60000);
   item.durationMinutes=minutes;
  }

  totalBreakMinutes+=minutes;

  if(item?.paid){
   totalPaidBreakMinutes+=minutes;
  }else{
   totalUnpaidBreakMinutes+=minutes;
  }
 });

 return {totalBreakMinutes,totalPaidBreakMinutes,totalUnpaidBreakMinutes};
};

const calculateScheduledMinutes=(scheduledStart,scheduledEnd)=>{
 if(!scheduledStart||!scheduledEnd)return 0;
 const start=new Date(scheduledStart);
 const end=new Date(scheduledEnd);
 if(end<=start)return 0;
 return Math.round((end-start)/60000);
};

const calculateWorkedTotals=(entry)=>{
 const scheduledMinutes=calculateScheduledMinutes(entry.scheduledStart,entry.scheduledEnd);
 const rawWorkedMinutes=entry.clockIn&&entry.clockOut&&new Date(entry.clockOut)>new Date(entry.clockIn)
  ?Math.round((new Date(entry.clockOut)-new Date(entry.clockIn))/60000)
  :0;

 const {totalBreakMinutes,totalPaidBreakMinutes,totalUnpaidBreakMinutes}=calculateBreakTotals(entry.breaks||[]);

 const totalWorkedMinutes=Math.max(0,rawWorkedMinutes-totalUnpaidBreakMinutes);
 const overtimeMinutes=Math.max(0,totalWorkedMinutes-scheduledMinutes);
 const regularWorkedMinutes=Math.max(0,totalWorkedMinutes-overtimeMinutes);

 entry.scheduledMinutes=scheduledMinutes;
 entry.totalBreakMinutes=totalBreakMinutes;
 entry.totalPaidBreakMinutes=totalPaidBreakMinutes;
 entry.totalUnpaidBreakMinutes=totalUnpaidBreakMinutes;
 entry.totalWorkedMinutes=totalWorkedMinutes;
 entry.regularWorkedMinutes=regularWorkedMinutes;
 entry.overtimeMinutes=overtimeMinutes;
 entry.overtimeStatus=overtimeMinutes>0?"unapproved":"none";

 if(entry.scheduledStart&&entry.clockIn){
  const diff=Math.round((new Date(entry.clockIn)-new Date(entry.scheduledStart))/60000);
  entry.earlyInMinutes=diff<0?Math.abs(diff):0;
  entry.lateInMinutes=diff>0?diff:0;
 }

 if(entry.scheduledEnd&&entry.clockOut){
  const diff=Math.round((new Date(entry.clockOut)-new Date(entry.scheduledEnd))/60000);
  entry.earlyOutMinutes=diff<0?Math.abs(diff):0;
  entry.lateOutMinutes=diff>0?diff:0;
 }
};

const getOpenTimeEntry=async({business,employee})=>{
 return TimeEntry.findOne({
  business,
  employee,
  status:{$in:["active","on-break"]}
 }).sort({createdAt:-1});
};

export const clockIn=async({business,clockId,shiftId=null,method="kiosk",createdBy=null,note=""})=>{
 const employee=await Employee.findOne({
  business,
  employeeId:clockId,
  isArchived:false,
  isActive:true
 });

 if(!employee)throw new Error("Employee not found.");

 const existingOpenEntry=await getOpenTimeEntry({
  business:employee.business,
  employee:employee._id
 });

 if(existingOpenEntry)throw new Error("Employee already has an active time entry.");

 let shift=null;
 if(shiftId){
  shift=await Shift.findOne({_id:shiftId,business:employee.business});
  if(!shift)throw new Error("Shift not found.");
 }

 const now=new Date();
 const entry=await TimeEntry.create({
  business:employee.business,
  employee:employee._id,
  shift:shift?._id||null,
  shiftLocation:shift?.shiftLocation||null,
  workDate:new Date(now.getFullYear(),now.getMonth(),now.getDate()),
  scheduledStart:shift?buildShiftDateTime(shift.shiftDate,shift.startTime):null,
  scheduledEnd:shift?buildShiftDateTime(shift.shiftDate,shift.endTime):null,
  clockIn:now,
  status:"active",
  actions:[{
   type:"clock-in",
   timestamp:now,
   method,
   createdBy,
   note
  }]
 });

 return entry;
};

export const startBreak=async({business,employeeId,type="break",method="kiosk",createdBy=null,note=""})=>{
 const entry=await getOpenTimeEntry({business,employee:employeeId});

 if(!entry)throw new Error("No active time entry found.");
 if(entry.status==="on-break")throw new Error("Employee is already on break.");

 const now=new Date();

 entry.breaks.push({
  start:now,
  end:null,
  type,
  durationMinutes:0,
  paid:type==="break"
 });

 entry.status="on-break";
 entry.actions.push({
  type:type==="lunch"?"lunch-start":"break-start",
  timestamp:now,
  method,
  createdBy,
  note
 });

 await entry.save();
 return entry;
};

export const endBreak=async({business,employeeId,method="kiosk",createdBy=null,note=""})=>{
 const entry=await getOpenTimeEntry({business,employee:employeeId});

 if(!entry)throw new Error("No active time entry found.");
 if(entry.status!=="on-break")throw new Error("Employee is not currently on break.");

 const activeBreak=[...(entry.breaks||[])].reverse().find((item)=>item?.start&&!item?.end);

 if(!activeBreak)throw new Error("No open break found.");

 const now=new Date();
 activeBreak.end=now;
 activeBreak.durationMinutes=Math.max(0,Math.round((new Date(activeBreak.end)-new Date(activeBreak.start))/60000));

 entry.status="active";
 entry.actions.push({
  type:activeBreak.type==="lunch"?"lunch-end":"break-end",
  timestamp:now,
  method,
  createdBy,
  note
 });

 calculateWorkedTotals(entry);
 await entry.save();

 return entry;
};

export const clockOut=async({business,employeeId,method="kiosk",createdBy=null,note=""})=>{
 const entry=await getOpenTimeEntry({business,employee:employeeId});

 if(!entry)throw new Error("No active time entry found.");
 if(entry.status==="on-break")throw new Error("Employee must end break before clocking out.");

 const now=new Date();

 entry.clockOut=now;
 entry.status="completed";
 entry.actions.push({
  type:"clock-out",
  timestamp:now,
  method,
  createdBy,
  note
 });

 calculateWorkedTotals(entry);
 await entry.save();

 return entry;
};

export default {
 clockIn,
 startBreak,
 endBreak,
 clockOut
};