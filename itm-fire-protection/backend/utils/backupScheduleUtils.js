import moment from "moment-timezone";

const isValidTime=value=>/^([01]\d|2[0-3]):[0-5]\d$/.test(String(value||""));
const isValidDate=value=>/^\d{4}-\d{2}-\d{2}$/.test(String(value||""));

export const getBackupScheduleValidationError=schedule=>{
 if(!["full","notes","favorites","archived","tags"].includes(schedule.backupType))return "Select a valid backup type";
 if(!["daily","weekly","monthly"].includes(schedule.frequency))return "Select a valid backup frequency";
 if(!isValidDate(schedule.startDate))return "Select a valid start date";
 if(!isValidTime(schedule.time))return "Select a valid backup time";
 if(schedule.frequency==="weekly"&&(!Number.isInteger(schedule.dayOfWeek)||schedule.dayOfWeek<0||schedule.dayOfWeek>6))return "Select a day of the week";
 if(schedule.frequency==="monthly"&&(!Number.isInteger(schedule.dayOfMonth)||schedule.dayOfMonth<1||schedule.dayOfMonth>31))return "Select a day of the month";
 if(!Number.isInteger(schedule.retentionDays)||schedule.retentionDays<1||schedule.retentionDays>3650)return "Retention must be between 1 and 3650 days";
 if(!moment.tz.zone(schedule.timeZone))return "Select a valid time zone";
 return "";
};

const createMonthlyCandidate=(year,month,day,time,timeZone)=>{
 const [hour,minute]=time.split(":").map(Number);
 const lastDay=moment.tz({year,month,date:1},timeZone).endOf("month").date();
 return moment.tz({year,month,date:Math.min(day,lastDay),hour,minute,second:0,millisecond:0},timeZone);
};

export const calculateNextBackupRun=(schedule,after=new Date())=>{
 const timeZone=moment.tz.zone(schedule.timeZone)?schedule.timeZone:"America/New_York";
 const now=moment.tz(after,timeZone);
 const start=moment.tz(`${schedule.startDate} ${schedule.time}`,"YYYY-MM-DD HH:mm",true,timeZone);
 if(!start.isValid())return null;

 if(schedule.frequency==="daily"){
  const candidate=start.clone();
  if(candidate.isSameOrBefore(now))candidate.add(Math.floor(now.diff(candidate,"days",true))+1,"day");
  return candidate.toDate();
 }

 if(schedule.frequency==="weekly"){
  const candidate=start.clone().add((schedule.dayOfWeek-start.day()+7)%7,"days");
  if(candidate.isSameOrBefore(now))candidate.add(Math.floor(now.diff(candidate,"weeks",true))+1,"week");
  return candidate.toDate();
 }

 let candidate=createMonthlyCandidate(now.year(),now.month(),schedule.dayOfMonth,schedule.time,timeZone);
 if(candidate.isBefore(start)){
  candidate=createMonthlyCandidate(start.year(),start.month(),schedule.dayOfMonth,schedule.time,timeZone);
  if(candidate.isBefore(start)){
   const followingStartMonth=start.clone().add(1,"month");
   candidate=createMonthlyCandidate(followingStartMonth.year(),followingStartMonth.month(),schedule.dayOfMonth,schedule.time,timeZone);
  }
 }
 if(candidate.isSameOrBefore(now)){
  const followingMonth=now.clone().add(1,"month");
  candidate=createMonthlyCandidate(followingMonth.year(),followingMonth.month(),schedule.dayOfMonth,schedule.time,timeZone);
 }
 return candidate.toDate();
};
