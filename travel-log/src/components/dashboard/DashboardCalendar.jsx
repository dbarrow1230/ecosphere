// src/components/dashboard/DashboardCalendar.jsx
import {useEffect,useMemo,useState} from "react";
import {Calendar,dateFnsLocalizer} from "react-big-calendar";
import {format,parse,startOfWeek,getDay,startOfDay,endOfDay,startOfMonth,endOfMonth,startOfYear,endOfYear} from "date-fns";
import enUS from "date-fns/locale/en-US";
import {CalendarDays} from "lucide-react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./DashboardCalendar.css";

const locales={
 "en-US":enUS
};

const localizer=dateFnsLocalizer({
 format,
 parse,
 startOfWeek,
 getDay,
 locales
});

const EMPTY_RECORDS=[];

function DashboardCalendar({
 events=EMPTY_RECORDS,
 tasks:passedTasks=EMPTY_RECORDS,
 habits:passedHabits=EMPTY_RECORDS,
 goals:passedGoals=EMPTY_RECORDS,
 milestones:passedMilestones=EMPTY_RECORDS,
 reminders:passedReminders=EMPTY_RECORDS,
 activeView="daily",
 rangeLabel="",
 user=null,
 settings=null
}){

 const [tasks,setTasks]=useState(Array.isArray(passedTasks)?passedTasks:[]);
 const [habits,setHabits]=useState(Array.isArray(passedHabits)?passedHabits:[]);
 const [goals,setGoals]=useState(Array.isArray(passedGoals)?passedGoals:[]);
 const [milestones,setMilestones]=useState(Array.isArray(passedMilestones)?passedMilestones:[]);
 const [reminders,setReminders]=useState(Array.isArray(passedReminders)?passedReminders:[]);
 const [calendarEvents,setCalendarEvents]=useState(events);
 const [calendarSettings,setCalendarSettings]=useState({
  weekStartsOn:"sunday",
  slotMinutes:30,
  dayStartHour:0,
  dayEndHour:24
 });

 const getDashboardCalendarView=view=>{
  if(view==="daily")return "day";
  if(view==="weekly")return "week";
  if(view==="monthly")return "month";
  if(view==="yearly")return "agenda";
  return "day";
 };

 const [calendarDate,setCalendarDate]=useState(()=>new Date());
 const [calendarView,setCalendarView]=useState(()=>getDashboardCalendarView(activeView));

 useEffect(()=>{
  setCalendarDate(new Date());
  setCalendarView(getDashboardCalendarView(activeView));
 },[activeView]);

 useEffect(()=>{
  setCalendarEvents(Array.isArray(events)?events:[]);
 },[events]);

 useEffect(()=>{
  setTasks(Array.isArray(passedTasks)?passedTasks:[]);
 },[passedTasks]);

 useEffect(()=>{
  setHabits(Array.isArray(passedHabits)?passedHabits:[]);
 },[passedHabits]);

 useEffect(()=>{
  setGoals(Array.isArray(passedGoals)?passedGoals:[]);
 },[passedGoals]);

 useEffect(()=>{
  setMilestones(Array.isArray(passedMilestones)?passedMilestones:[]);
 },[passedMilestones]);

 useEffect(()=>{
  setReminders(Array.isArray(passedReminders)?passedReminders:[]);
 },[passedReminders]);

 const getToken=()=>{
  return localStorage.getItem("token")||sessionStorage.getItem("token")||"";
 };

 const normalizeId=value=>{
  if(!value)return "";
  if(typeof value==="object"&&value?.$oid)return String(value.$oid);
  if(typeof value==="object"&&value?._id)return normalizeId(value._id);
  if(typeof value==="object"&&value?.id)return normalizeId(value.id);
  return String(value).trim();
 };

 const getStoredUser=()=>{
  const keys=["userInfo","user","authUser","currentUser"];

  for(const key of keys){
   try{
    const raw=localStorage.getItem(key)||sessionStorage.getItem(key);
    if(!raw)continue;

    const parsed=JSON.parse(raw);

    if(parsed?._id||parsed?.id||parsed?.username||parsed?.email)return parsed;
    if(parsed?.user?._id||parsed?.user?.id||parsed?.user?.username||parsed?.user?.email)return parsed.user;
    if(parsed?.data?._id||parsed?.data?.id||parsed?.data?.username||parsed?.data?.email)return parsed.data;
   }catch(err){
    console.error(`Failed to parse stored user from ${key}`,err);
   }
  }

  return null;
 };

 const getCurrentUser=()=>{
  return user||getStoredUser();
 };

 const getUserQueryValue=()=>{
  const currentUser=getCurrentUser();

  const userId=normalizeId(currentUser?._id)||normalizeId(currentUser?.id);
  if(userId)return userId;

  if(currentUser?.username)return currentUser.username;
  if(currentUser?.email)return currentUser.email;

  return "";
 };

 const getHeaders=()=>{
  const token=getToken();

  return {
   "Content-Type":"application/json",
   ...(token?{Authorization:`Bearer ${token}`}:{})
  };
 };

 const normalizeRecords=(data,key)=>{
  if(!data)return [];
  if(Array.isArray(data))return data;
  if(Array.isArray(data?.[key]))return data[key];
  if(Array.isArray(data?.data))return data.data;
  if(Array.isArray(data?.records))return data.records;
  return [];
 };

 const normalizeUserSetting=data=>{
  if(!data)return null;
  if(data?.calendar)return data;
  if(data?.userSetting?.calendar)return data.userSetting;
  if(data?.settings?.calendar)return data.settings;
  if(data?.data?.calendar)return data.data;
  if(data?.record?.calendar)return data.record;
  if(Array.isArray(data)&&data[0]?.calendar)return data[0];
  if(Array.isArray(data?.data)&&data.data[0]?.calendar)return data.data[0];
  if(Array.isArray(data?.records)&&data.records[0]?.calendar)return data.records[0];
  if(Array.isArray(data?.userSettings)&&data.userSettings[0]?.calendar)return data.userSettings[0];
  return null;
 };

 const normalizeSlotMinutes=value=>{
  const numberValue=Number(value);

  if([5,10,15,20,30,60].includes(numberValue))return numberValue;

  return 30;
 };

 const normalizeHour=(value,fallback,min,max)=>{
  const numberValue=Number(value);

  if(Number.isNaN(numberValue))return fallback;
  if(numberValue<min)return min;
  if(numberValue>max)return max;

  return numberValue;
 };

 const normalizeEndHour=value=>{
  if(value===0||value==="0")return 24;

  return normalizeHour(value,24,1,24);
 };

 useEffect(()=>{
  const calendar=settings?.calendar;

  if(!calendar)return;

  setCalendarSettings(prev=>({
   ...prev,
   weekStartsOn:calendar.weekStartsOn||prev.weekStartsOn,
   slotMinutes:normalizeSlotMinutes(calendar.slotMinutes??prev.slotMinutes),
   dayStartHour:normalizeHour(calendar.dayStartHour,prev.dayStartHour,0,23),
   dayEndHour:normalizeEndHour(calendar.dayEndHour??prev.dayEndHour)
  }));
 },[
  settings?.calendar?.weekStartsOn,
  settings?.calendar?.slotMinutes,
  settings?.calendar?.dayStartHour,
  settings?.calendar?.dayEndHour
 ]);

 const readEndpoint=async(endpoint,key)=>{
  try{
   const res=await fetch(endpoint,{
    headers:getHeaders()
   });

   const data=await res.json().catch(()=>({}));

   if(!res.ok){
    console.error(`Calendar load failed: ${endpoint}`,data);
    return [];
   }

   return normalizeRecords(data,key);
  }catch(err){
   console.error(`Calendar load failed: ${endpoint}`,err);
   return [];
  }
 };

 const loadUserSettings=async()=>{
  try{
   if(settings?.calendar)return;

   const userQueryValue=getUserQueryValue();

   if(!userQueryValue){
    console.error("Calendar settings load failed: user is required");
    return;
   }

   const res=await fetch(`/api/user-settings?user=${encodeURIComponent(userQueryValue)}`,{
    headers:getHeaders()
   });

   const data=await res.json().catch(()=>({}));

   if(!res.ok){
    console.error("Calendar settings load failed",data);
    return;
   }

   const setting=normalizeUserSetting(data);
   const calendar=setting?.calendar||{};

   setCalendarSettings(prev=>({
    ...prev,
    weekStartsOn:calendar.weekStartsOn||prev.weekStartsOn,
    slotMinutes:normalizeSlotMinutes(calendar.slotMinutes??prev.slotMinutes),
    dayStartHour:normalizeHour(calendar.dayStartHour,prev.dayStartHour,0,23),
    dayEndHour:normalizeEndHour(calendar.dayEndHour??prev.dayEndHour)
   }));
  }catch(err){
   console.error("Calendar settings load failed",err);
  }
 };

 useEffect(()=>{
  let ignore=false;

  const loadCalendarItems=async()=>{
   await loadUserSettings();

   const [
    loadedTasks,
    loadedHabits,
    loadedGoals,
    loadedMilestones,
    loadedReminders,
    loadedEvents
   ]=await Promise.all([
    readEndpoint("/api/tasks","tasks"),
    readEndpoint("/api/habits","habits"),
    readEndpoint("/api/goals","goals"),
    readEndpoint("/api/milestones","milestones"),
    readEndpoint("/api/reminders","reminders"),
    readEndpoint("/api/calendar-events","calendarEvents")
   ]);

   if(ignore)return;

   if(!Array.isArray(passedTasks)||!passedTasks.length){
    setTasks(loadedTasks.filter(item=>item?.title&&String(item.title).trim()&&String(item.title).trim()!=="-"));
   }

   if(!Array.isArray(passedHabits)||!passedHabits.length){
    setHabits(loadedHabits.filter(item=>item?.title&&String(item.title).trim()&&String(item.title).trim()!=="-"));
   }

   if(!Array.isArray(passedGoals)||!passedGoals.length){
    setGoals(loadedGoals.filter(item=>item?.title&&String(item.title).trim()&&String(item.title).trim()!=="-"));
   }

   if(!Array.isArray(passedMilestones)||!passedMilestones.length){
    setMilestones(loadedMilestones.filter(item=>item?.title&&String(item.title).trim()&&String(item.title).trim()!=="-"));
   }

   if(!Array.isArray(passedReminders)||!passedReminders.length){
    setReminders(loadedReminders.filter(item=>(item?.title||item?.name)&&String(item.title||item.name).trim()&&String(item.title||item.name).trim()!=="-"));
   }

   if(!Array.isArray(events)||!events.length){
    setCalendarEvents(loadedEvents.filter(item=>(item?.title||item?.name)&&String(item.title||item.name).trim()&&String(item.title||item.name).trim()!=="-"));
   }
  };

  loadCalendarItems();

  return()=>{
   ignore=true;
  };
 },[
  user?._id,
  user?.id,
  user?.username,
  user?.email,
  passedTasks,
  passedHabits,
  passedGoals,
  passedMilestones,
  passedReminders,
  events
 ]);

 const calendarSlotMinutes=normalizeSlotMinutes(calendarSettings.slotMinutes);
 const calendarTimeslots=1;
 const calendarWeekStartsOn=calendarSettings.weekStartsOn==="monday"?1:0;

 const calendarMinTime=useMemo(()=>{
  const date=new Date();

  date.setHours(normalizeHour(calendarSettings.dayStartHour,0,0,23),0,0,0);

  return date;
 },[calendarSettings.dayStartHour]);

 const calendarMaxTime=useMemo(()=>{
  const date=new Date();
  const endHour=normalizeEndHour(calendarSettings.dayEndHour);

  if(endHour===24){
   date.setHours(23,59,59,999);
   return date;
  }

  date.setHours(endHour,0,0,0);

  return date;
 },[calendarSettings.dayEndHour]);

 const calendarScrollTime=useMemo(()=>{
  const date=new Date();

  date.setHours(normalizeHour(calendarSettings.dayStartHour,0,0,23),0,0,0);

  return date;
 },[calendarSettings.dayStartHour]);

 const dateRange=useMemo(()=>{
  const selectedDate=new Date(calendarDate);

  if(calendarView==="day"){
   return {
    start:startOfDay(selectedDate),
    end:endOfDay(selectedDate)
   };
  }

  if(calendarView==="week"){
   const start=startOfWeek(selectedDate,{weekStartsOn:calendarWeekStartsOn});
   const end=new Date(start);

   end.setDate(start.getDate()+6);
   end.setHours(23,59,59,999);

   return {start,end};
  }

  if(calendarView==="month"){
   return {
    start:startOfMonth(selectedDate),
    end:endOfMonth(selectedDate)
   };
  }

  if(calendarView==="agenda"){
   return {
    start:startOfYear(selectedDate),
    end:endOfYear(selectedDate)
   };
  }

  return {
   start:startOfDay(selectedDate),
   end:endOfDay(selectedDate)
  };
 },[calendarDate,calendarView,calendarWeekStartsOn]);

 const getSafeDate=value=>{
  if(!value)return null;

  if(value?.$date){
   const mongoDate=new Date(value.$date);

   if(Number.isNaN(mongoDate.getTime()))return null;

   return mongoDate;
  }

  const date=new Date(value);

  if(Number.isNaN(date.getTime()))return null;

  return date;
 };

 const normalizeDateOnly=value=>{
  const date=getSafeDate(value);

  if(!date)return null;

  date.setHours(0,0,0,0);

  return date;
 };

 const getTimeParts=value=>{
  const raw=String(value||"").trim();

  if(!raw)return null;

  const normalized=raw
   .replace(/\./g,"")
   .replace(/\s+/g," ")
   .trim()
   .toUpperCase();

  const match=normalized.match(/^(\d{1,2})(?::(\d{1,2}))?\s*(AM|PM)?$/);

  if(!match)return null;

  let hours=Number(match[1]);
  const minutes=Number(match[2]||0);
  const meridian=match[3]||"";

  if(Number.isNaN(hours)||Number.isNaN(minutes))return null;
  if(minutes<0||minutes>59)return null;

  if(meridian==="AM"){
   if(hours===12)hours=0;
  }

  if(meridian==="PM"){
   if(hours<12)hours+=12;
  }

  if(hours<0||hours>23)return null;

  return {hours,minutes};
 };

 const hasTimeValue=item=>{
  return !!(getTimeParts(item?.startTime)||getTimeParts(item?.endTime));
 };

 const getDayName=date=>{
  return ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][date.getDay()];
 };

 const getDateSlotKey=date=>{
  const year=date.getFullYear();
  const month=String(date.getMonth()+1).padStart(2,"0");
  const day=String(date.getDate()).padStart(2,"0");

  return `${year}-${month}-${day}`;
 };

 const getSlotStart=(date,slotCounts)=>{
  const slotKey=getDateSlotKey(date);
  const slotIndex=slotCounts[slotKey]||0;
  const startHour=normalizeHour(calendarSettings.dayStartHour,0,0,23);
  const endHour=normalizeEndHour(calendarSettings.dayEndHour);
  const availableMinutes=Math.max(calendarSlotMinutes,(endHour-startHour)*60);
  const maxSlots=Math.max(1,Math.floor(availableMinutes/calendarSlotMinutes));
  const normalizedSlot=slotIndex%maxSlots;
  const start=new Date(date);

  start.setHours(startHour,0,0,0);
  start.setMinutes(start.getMinutes()+normalizedSlot*calendarSlotMinutes);
  slotCounts[slotKey]=slotIndex+1;

  return start;
 };

 const applyTime=(date,timeValue,slotCounts=null)=>{
  const next=new Date(date);
  const time=getTimeParts(timeValue);

  if(time){
   next.setHours(time.hours,time.minutes,0,0);
   return next;
  }

  if(slotCounts){
   return getSlotStart(next,slotCounts);
  }

  next.setHours(normalizeHour(calendarSettings.dayStartHour,0,0,23),0,0,0);

  return next;
 };

 const getTimedEnd=(startDate,endTime)=>{
  const endParts=getTimeParts(endTime);
  const end=new Date(startDate);

  if(endParts){
   end.setHours(endParts.hours,endParts.minutes,0,0);

   if(end<=startDate){
    end.setTime(startDate.getTime()+calendarSlotMinutes*60*1000);
   }

   return end;
  }

  end.setTime(startDate.getTime()+calendarSlotMinutes*60*1000);

  return end;
 };

 const getAllDayEnd=startDate=>{
  const end=new Date(startDate);

  end.setHours(23,59,59,999);

  return end;
 };

 const normalizeTimeSlotsForItem=item=>{
  const slots=Array.isArray(item?.timeSlots)?item.timeSlots:[];

  const cleanSlots=slots
   .map(slot=>({
    startTime:String(slot?.startTime||"").trim(),
    endTime:String(slot?.endTime||"").trim()
   }))
   .filter(slot=>getTimeParts(slot.startTime)||getTimeParts(slot.endTime));

  if(cleanSlots.length){
   return cleanSlots;
  }

  if(getTimeParts(item?.startTime)||getTimeParts(item?.endTime)){
   return [{
    startTime:item.startTime||"",
    endTime:item.endTime||""
   }];
  }

  return [];
 };

 const getEventTimeLabel=event=>{
  if(event.allDay)return "";

  return `${format(event.start,"h:mm a")} - ${format(event.end,"h:mm a")}`;
 };

 const buildCalendarEvent=({
  id,
  title,
  date,
  startTime="",
  endTime="",
  allDay=false,
  itemType="event",
  resource={},
  slotCounts=null,
  occurrenceIndex=null
 })=>{
  const baseDate=normalizeDateOnly(date);

  if(!baseDate)return null;

  const hasRealTime=getTimeParts(startTime)||getTimeParts(endTime);
  const shouldBeAllDay=allDay===true||!hasRealTime;
  const start=shouldBeAllDay?startOfDay(baseDate):applyTime(baseDate,startTime,null);
  const end=shouldBeAllDay?getAllDayEnd(start):getTimedEnd(start,endTime);

  return {
   id:occurrenceIndex===null?id:`${id}-slot-${occurrenceIndex}`,
   title,
   start,
   end,
   allDay:shouldBeAllDay,
   itemType,
   typeLabel:itemType.charAt(0).toUpperCase()+itemType.slice(1),
   resource,
   occurrenceIndex
  };
 };

 const buildCalendarEventsFromItem=({
  id,
  title,
  date,
  allDay=false,
  itemType="event",
  resource={},
  slotCounts=null
 })=>{
  const itemAllDay=allDay===true;
  const timeSlots=normalizeTimeSlotsForItem(resource);

  if(itemAllDay||!timeSlots.length){
   const event=buildCalendarEvent({
    id,
    title,
    date,
    allDay:true,
    itemType,
    resource,
    slotCounts
   });

   return event?[event]:[];
  }

  return timeSlots.map((slot,index)=>buildCalendarEvent({
   id,
   title,
   date,
   startTime:slot.startTime,
   endTime:slot.endTime,
   allDay:false,
   itemType,
   resource:{
    ...resource,
    startTime:slot.startTime,
    endTime:slot.endTime
   },
   slotCounts,
   occurrenceIndex:index
  })).filter(Boolean);
 };

 const getTaskBaseDate=task=>{
  return normalizeDateOnly(task.startDate)||normalizeDateOnly(task.dueDate)||normalizeDateOnly(task.createdAt)||startOfDay(new Date());
 };

 const getTaskRepeatEnd=task=>{
  return endOfDay(getSafeDate(task.endDate)||getSafeDate(task.dueDate)||dateRange.end);
 };

 const isTaskInactive=task=>{
  return ["completed","cancelled","archived"].includes(task?.status);
 };

 const buildTaskOccurrence=(task,date,slotCounts)=>{
  const allDay=task.allDay===true||task.isAllDay===true;

  return buildCalendarEventsFromItem({
   id:`task-${task._id||task.id||task.title}-${date.toISOString()}`,
   title:task.title,
   date,
   allDay,
   itemType:"task",
   resource:task,
   slotCounts
  });
 };

 const buildDailyTaskEvents=(task,slotCounts)=>{
  const output=[];
  const taskStart=getTaskBaseDate(task);
  const taskEnd=getTaskRepeatEnd(task);
  let current=new Date(taskStart);
  let guard=0;

  if(current<dateRange.start){
   current=startOfDay(dateRange.start);
  }

  while(current<=dateRange.end&&current<=taskEnd&&guard<500){
   if(current>=taskStart){
    output.push(...buildTaskOccurrence(task,current,slotCounts));
   }

   current.setDate(current.getDate()+1);
   guard+=1;
  }

  return output;
 };

 const buildWeeklyTaskEvents=(task,slotCounts)=>{
  const output=[];
  const taskStart=getTaskBaseDate(task);
  const taskEnd=getTaskRepeatEnd(task);
  const selectedDays=Array.isArray(task.repeatDays)&&task.repeatDays.length?task.repeatDays:[getDayName(taskStart)];
  let current=startOfDay(dateRange.start);
  let guard=0;

  while(current<=dateRange.end&&current<=taskEnd&&guard<500){
   const dayName=getDayName(current);

   if(current>=taskStart&&selectedDays.includes(dayName)){
    output.push(...buildTaskOccurrence(task,current,slotCounts));
   }

   current.setDate(current.getDate()+1);
   guard+=1;
  }

  return output;
 };

 const buildMonthlyTaskEvents=(task,slotCounts)=>{
  const output=[];
  const taskStart=getTaskBaseDate(task);
  const taskEnd=getTaskRepeatEnd(task);
  const repeatDay=Number(task.repeatDayOfMonth||taskStart.getDate());
  let year=dateRange.start.getFullYear();
  let month=dateRange.start.getMonth();
  let guard=0;

  while(guard<36){
   const daysInMonth=new Date(year,month+1,0).getDate();
   const day=Math.min(Math.max(repeatDay,1),daysInMonth);
   const occurrence=startOfDay(new Date(year,month,day));

   if(occurrence>dateRange.end||occurrence>taskEnd){
    break;
   }

   if(occurrence>=dateRange.start&&occurrence>=taskStart){
    output.push(...buildTaskOccurrence(task,occurrence,slotCounts));
   }

   month+=1;

   if(month>11){
    month=0;
    year+=1;
   }

   guard+=1;
  }

  return output;
 };

 const buildYearlyTaskEvents=(task,slotCounts)=>{
  const output=[];
  const taskStart=getTaskBaseDate(task);
  const taskEnd=getTaskRepeatEnd(task);
  const repeatMonth=Number(task.repeatMonth||taskStart.getMonth()+1);
  const repeatDay=Number(task.repeatDayOfYear||taskStart.getDate());
  let year=dateRange.start.getFullYear();
  let guard=0;

  while(guard<10){
   const monthIndex=Math.min(Math.max(repeatMonth,1),12)-1;
   const daysInMonth=new Date(year,monthIndex+1,0).getDate();
   const day=Math.min(Math.max(repeatDay,1),daysInMonth);
   const occurrence=startOfDay(new Date(year,monthIndex,day));

   if(occurrence>dateRange.end||occurrence>taskEnd){
    break;
   }

   if(occurrence>=dateRange.start&&occurrence>=taskStart){
    output.push(...buildTaskOccurrence(task,occurrence,slotCounts));
   }

   year+=1;
   guard+=1;
  }

  return output;
 };

 const buildTaskEvents=slotCounts=>{
  const output=[];

  tasks.forEach(task=>{
   if(!task?.title)return;
   if(isTaskInactive(task))return;

   if(task.taskType==="weekly"){
    output.push(...buildWeeklyTaskEvents(task,slotCounts));
    return;
   }

   if(task.taskType==="monthly"){
    output.push(...buildMonthlyTaskEvents(task,slotCounts));
    return;
   }

   if(task.taskType==="yearly"){
    output.push(...buildYearlyTaskEvents(task,slotCounts));
    return;
   }

   output.push(...buildDailyTaskEvents(task,slotCounts));
  });

  return output.filter(Boolean);
 };

 const getHabitBaseDate=habit=>{
  return normalizeDateOnly(habit.startDate)||normalizeDateOnly(habit.createdAt)||startOfDay(new Date());
 };

 const getHabitRepeatEnd=habit=>{
  return endOfDay(getSafeDate(habit.endDate)||dateRange.end);
 };

 const buildHabitOccurrence=(habit,date,slotCounts)=>{
  const allDay=habit.allDay===true||habit.isAllDay===true;

  return buildCalendarEventsFromItem({
   id:`habit-${habit._id||habit.id||habit.title}-${date.toISOString()}`,
   title:habit.title,
   date,
   allDay,
   itemType:"habit",
   resource:habit,
   slotCounts
  });
 };

 const buildDailyHabitEvents=(habit,slotCounts)=>{
  const output=[];
  const habitStart=getHabitBaseDate(habit);
  const habitEnd=getHabitRepeatEnd(habit);
  let current=new Date(habitStart);
  let guard=0;

  if(current<dateRange.start){
   current=startOfDay(dateRange.start);
  }

  while(current<=dateRange.end&&current<=habitEnd&&guard<500){
   if(current>=habitStart){
    output.push(...buildHabitOccurrence(habit,current,slotCounts));
   }

   current.setDate(current.getDate()+1);
   guard+=1;
  }

  return output;
 };

 const buildWeeklyHabitEvents=(habit,slotCounts)=>{
  const output=[];
  const habitStart=getHabitBaseDate(habit);
  const habitEnd=getHabitRepeatEnd(habit);
  const selectedDays=Array.isArray(habit.repeatDays)&&habit.repeatDays.length?habit.repeatDays:[getDayName(habitStart)];
  let current=startOfDay(dateRange.start);
  let guard=0;

  while(current<=dateRange.end&&current<=habitEnd&&guard<500){
   const dayName=getDayName(current);

   if(current>=habitStart&&selectedDays.includes(dayName)){
    output.push(...buildHabitOccurrence(habit,current,slotCounts));
   }

   current.setDate(current.getDate()+1);
   guard+=1;
  }

  return output;
 };

 const buildMonthlyHabitEvents=(habit,slotCounts)=>{
  const output=[];
  const habitStart=getHabitBaseDate(habit);
  const habitEnd=getHabitRepeatEnd(habit);
  const repeatDay=Number(habit.repeatDayOfMonth||habitStart.getDate());
  let year=dateRange.start.getFullYear();
  let month=dateRange.start.getMonth();
  let guard=0;

  while(guard<36){
   const daysInMonth=new Date(year,month+1,0).getDate();
   const day=Math.min(Math.max(repeatDay,1),daysInMonth);
   const occurrence=startOfDay(new Date(year,month,day));

   if(occurrence>dateRange.end||occurrence>habitEnd){
    break;
   }

   if(occurrence>=dateRange.start&&occurrence>=habitStart){
    output.push(...buildHabitOccurrence(habit,occurrence,slotCounts));
   }

   month+=1;

   if(month>11){
    month=0;
    year+=1;
   }

   guard+=1;
  }

  return output;
 };

 const buildYearlyHabitEvents=(habit,slotCounts)=>{
  const output=[];
  const habitStart=getHabitBaseDate(habit);
  const habitEnd=getHabitRepeatEnd(habit);
  const repeatMonth=Number(habit.repeatMonth||habitStart.getMonth()+1);
  const repeatDay=Number(habit.repeatDayOfYear||habitStart.getDate());
  let year=dateRange.start.getFullYear();
  let guard=0;

  while(guard<10){
   const monthIndex=Math.min(Math.max(repeatMonth,1),12)-1;
   const daysInMonth=new Date(year,monthIndex+1,0).getDate();
   const day=Math.min(Math.max(repeatDay,1),daysInMonth);
   const occurrence=startOfDay(new Date(year,monthIndex,day));

   if(occurrence>dateRange.end||occurrence>habitEnd){
    break;
   }

   if(occurrence>=dateRange.start&&occurrence>=habitStart){
    output.push(...buildHabitOccurrence(habit,occurrence,slotCounts));
   }

   year+=1;
   guard+=1;
  }

  return output;
 };

 const buildHabitEvents=slotCounts=>{
  const output=[];

  habits.forEach(habit=>{
   if(!habit?.title)return;
   if(habit.status&&habit.status!=="active")return;

   if(habit.frequency==="weekly"){
    output.push(...buildWeeklyHabitEvents(habit,slotCounts));
    return;
   }

   if(habit.frequency==="monthly"){
    output.push(...buildMonthlyHabitEvents(habit,slotCounts));
    return;
   }

   if(habit.frequency==="yearly"){
    output.push(...buildYearlyHabitEvents(habit,slotCounts));
    return;
   }

   output.push(...buildDailyHabitEvents(habit,slotCounts));
  });

  return output.filter(Boolean);
 };

 const buildGoalEvents=()=>{
  return goals.map(goal=>{
   const date=goal.targetDate||goal.dueDate||goal.startDate;

   return buildCalendarEvent({
    id:`goal-${goal._id||goal.id||goal.title}`,
    title:goal.title,
    date,
    allDay:true,
    itemType:"goal",
    resource:goal
   });
  }).filter(Boolean);
 };

 const buildMilestoneEvents=()=>{
  return milestones.map(milestone=>{
   const date=milestone.milestoneDate||milestone.targetDate||milestone.dueDate||milestone.createdAt;

   return buildCalendarEvent({
    id:`milestone-${milestone._id||milestone.id||milestone.title}`,
    title:milestone.title,
    date,
    allDay:true,
    itemType:"milestone",
    resource:milestone
   });
  }).filter(Boolean);
 };

 const buildReminderEvents=slotCounts=>{
  return reminders.flatMap(reminder=>{
   const date=reminder.sendAt||reminder.remindAt||reminder.dueDate||reminder.createdAt;
   const dateValue=getSafeDate(date);
   const allDay=reminder.allDay===true||reminder.isAllDay===true;
   const resource={
    ...reminder,
    startTime:reminder.startTime||reminder.time||(dateValue?format(dateValue,"HH:mm"):""),
    endTime:reminder.endTime||""
   };

   return buildCalendarEventsFromItem({
    id:`reminder-${reminder._id||reminder.id||reminder.title||reminder.name}`,
    title:reminder.title||reminder.name,
    date,
    allDay,
    itemType:"reminder",
    resource,
    slotCounts
   });
  }).filter(Boolean);
 };

 const buildBaseCalendarEvents=slotCounts=>{
  return calendarEvents.flatMap(event=>{
   const date=event?.startDate||
    event?.eventDate||
    event?.date||
    event?.sendAt||
    event?.createdAt||
    null;

   const dateValue=getSafeDate(date);
   const allDay=event.allDay===true||event.isAllDay===true;
   const resource={
    ...event,
    startTime:event.startTime||event.time||(dateValue?format(dateValue,"HH:mm"):""),
    endTime:event.endTime||""
   };

   return buildCalendarEventsFromItem({
    id:`event-${event._id||event.id||event.title||event.name}`,
    title:event.title||event.name||"Untitled event",
    date,
    allDay,
    itemType:"event",
    resource,
    slotCounts
   });
  }).filter(Boolean);
 };

 const dashboardCalendarItems=useMemo(()=>{
  const slotCounts={};

  return [
   ...buildBaseCalendarEvents(slotCounts),
   ...buildTaskEvents(slotCounts),
   ...buildHabitEvents(slotCounts),
   ...buildGoalEvents(),
   ...buildMilestoneEvents(),
   ...buildReminderEvents(slotCounts)
  ].filter(event=>event.start>=dateRange.start&&event.start<=dateRange.end);
 },[
  calendarEvents,
  tasks,
  habits,
  goals,
  milestones,
  reminders,
  dateRange.start,
  dateRange.end,
  calendarSlotMinutes,
  calendarSettings.dayStartHour,
  calendarSettings.dayEndHour
 ]);

const CalendarEventContent=({event})=>{
 const timeLabel=getEventTimeLabel(event);

 return(
  <span className={`dashboard-calendar-event-copy dashboard-calendar-event-copy-${event.itemType||"event"}`}>
   <span className="dashboard-calendar-event-prefix">{event.typeLabel||"Event"}:</span>
   <span className="dashboard-calendar-event-name">{event.title}</span>

  </span>
 );
};

 const viewLabel=useMemo(()=>{
  if(calendarView==="day")return "Daily Calendar";
  if(calendarView==="week")return "Weekly Calendar";
  if(calendarView==="month")return "Monthly Calendar";
  if(calendarView==="agenda")return "Agenda Calendar";
  return "Calendar";
 },[calendarView]);

 const calendarRangeLabel=useMemo(()=>{
  const formatDate=value=>{
   return new Intl.DateTimeFormat("en-US",{
    month:"short",
    day:"numeric",
    year:"numeric"
   }).format(value);
  };

  if(calendarView==="day")return formatDate(dateRange.start);

  return `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`;
 },[calendarView,dateRange]);

 const isSameDay=(a,b)=>{
  return a.getFullYear()===b.getFullYear()&&
   a.getMonth()===b.getMonth()&&
   a.getDate()===b.getDate();
 };

 const dayPropGetter=date=>{
  const today=new Date();

  if(isSameDay(date,today)){
   return {
    className:"dashboard-calendar-current-day"
   };
  }

  return {};
 };

 const slotPropGetter=date=>{
  const today=new Date();

  if(isSameDay(date,today)){
   return {
    className:"dashboard-calendar-current-slot"
   };
  }

  return {};
 };

 const eventPropGetter=event=>{
  return {
   className:[
    "dashboard-calendar-event",
    `dashboard-calendar-event-${event.itemType||"event"}`,
    event?.resource?.status==="completed"?"dashboard-calendar-event-completed":""
   ].filter(Boolean).join(" ")
  };
 };

 const handleNavigate=date=>{
  setCalendarDate(date);
 };

 const handleView=view=>{
  setCalendarView(view);
 };

 const handleRangeChange=range=>{
  return range;
 };

 const formats={
  agendaDateFormat:"MMM d, yyyy",
  agendaTimeFormat:"h:mm a",
  agendaTimeRangeFormat:({start,end},culture,localizer)=>{
   return `${localizer.format(start,"h:mm a",culture)} - ${localizer.format(end,"h:mm a",culture)}`;
  },
  dayHeaderFormat:"EEEE, MMMM d, yyyy",
  dayRangeHeaderFormat:({start,end},culture,localizer)=>{
   return `${localizer.format(start,"MMM d",culture)} - ${localizer.format(end,"MMM d, yyyy",culture)}`;
  },
  monthHeaderFormat:"MMMM yyyy",
  weekdayFormat:"EEE",
  dateFormat:"dd",
  dayFormat:"dd EEE"
 };

 const messages={
  today:"Today",
  previous:"Back",
  next:"Next",
  month:"Month",
  week:"Week",
  day:"Day",
  agenda:"Agenda",
  date:"Date",
  time:"Time",
  event:"Event",
  noEventsInRange:"No calendar items for this period."
 };

 return(
  <section className="dashboard-calendar-panel">
   <div className="dashboard-calendar-panel-head">
    <div>
     <p className="dashboard-section-kicker">{activeView} travel calendar</p>
     <h2 className="dashboard-section-title">{viewLabel}</h2>
    </div>

    <div className="dashboard-calendar-heading">
     <CalendarDays size={18} strokeWidth={2.2}/>
     <span>{calendarRangeLabel||rangeLabel}</span>
    </div>
   </div>

   <div className="dashboard-calendar-legend">
    <span className="dashboard-calendar-legend-item dashboard-calendar-legend-event">Trips</span>
    <span className="dashboard-calendar-legend-item dashboard-calendar-legend-task">Itinerary</span>
    <span className="dashboard-calendar-legend-item dashboard-calendar-legend-habit">Routines</span>
    <span className="dashboard-calendar-legend-item dashboard-calendar-legend-goal">Destinations</span>
    <span className="dashboard-calendar-legend-item dashboard-calendar-legend-milestone">Milestones</span>
    <span className="dashboard-calendar-legend-item dashboard-calendar-legend-reminder">Reminders</span>
   </div>

   <div className="dashboard-big-calendar-wrap">
    <Calendar
     localizer={localizer}
     events={dashboardCalendarItems}
     startAccessor="start"
     endAccessor="end"
     allDayAccessor="allDay"
     date={calendarDate}
     view={calendarView}
     views={["day","week","month","agenda"]}
     toolbar={true}
     popup={true}
     selectable={false}
     step={calendarSlotMinutes}
     timeslots={calendarTimeslots}
     min={calendarMinTime}
     max={calendarMaxTime}
     scrollToTime={calendarScrollTime}
     showMultiDayTimes={true}
     dayLayoutAlgorithm="no-overlap"
     formats={formats}
     messages={{
      today:"Today",
      previous:"Back",
      next:"Next",
      month:"Month",
      week:"Week",
      day:"Day",
      agenda:"Agenda",
      date:"Date",
      time:"Time",
      event:"Trip",
      noEventsInRange:"No travel activity for this period."
     }}
     length={calendarView==="agenda"?365:30}
     dayPropGetter={dayPropGetter}
     slotPropGetter={slotPropGetter}
     eventPropGetter={eventPropGetter}
     components={{event:CalendarEventContent}}
     onNavigate={handleNavigate}
     onView={handleView}
     onRangeChange={handleRangeChange}
     className={`dashboard-big-calendar dashboard-big-calendar-${activeView} dashboard-big-calendar-${calendarView}`}
    />
   </div>
  </section>
 );
}

export default DashboardCalendar;