// src/pages/Dashboard.jsx
import {useEffect,useMemo,useState} from "react";
import DashboardHeader from "../components/dashboard/DashboardHeader.jsx";
import DashboardStats from "../components/dashboard/DashboardStats.jsx";
import DailyDashboardView from "../components/dashboard/views/DailyDashboardView.jsx";
import WeeklyDashboardView from "../components/dashboard/views/WeeklyDashboardView.jsx";
import MonthlyDashboardView from "../components/dashboard/views/MonthlyDashboardView.jsx";
import YearlyDashboardView from "../components/dashboard/views/YearlyDashboardView.jsx";
import DashboardCalendar from "../components/dashboard/DashboardCalendar.jsx";
import DashboardQuickActions from "../components/dashboard/DashboardQuickActions.jsx";
import "../styles/Dashboard.css";
import "../components/dashboard/DashboardCalendar.css";

function Dashboard({
 user,
 dashboard=null,
 stats,
 categoryProgress=[]
}){

 const getDefaultSettings=()=>({
  dashboard:{
   defaultView:"daily",
   showPrivateJournalCount:false,
   showMoodSummary:true,
   showHabitProgress:true,
   showUpcomingReminders:true,
   showTimelinePreview:true
  },
  journal:{
   defaultJournalType:"daily",
   defaultPrivate:false,
   showPromptsByDefault:true,
   requireMood:false,
   requireEnergy:false
  },
  mindfulness:{
   showPromptsByDefault:true,
   requireMood:false,
   requireEnergy:false,
   requireStress:false
  },
  reminders:{
   defaultChannels:{
    email:false,
    sms:false,
    inApp:true
   },
   defaultOffsetMinutes:30,
   allowRecurring:true
  },
  calendar:{
   weekStartsOn:"sunday",
   defaultEventView:"month",
   showCompletedEvents:true,
   slotMinutes:30,
   dayStartHour:0,
   dayEndHour:24
  },
  privacy:{
   privateJournalLocked:true,
   hidePrivateEntriesFromTimeline:true,
   hidePrivateEntriesFromDashboard:true
  },
  appearance:{
   theme:"system",
   accentColor:"",
   compactMode:false
  },
  timezone:"America/New_York",
  locale:"en-US"
 });

 const [settings,setSettings]=useState(()=>getDefaultSettings());
 const [activeView,setActiveView]=useState("daily");
 const [viewOverridden,setViewOverridden]=useState(false);
 const [loadedDashboard,setLoadedDashboard]=useState(()=>dashboard||{});

 const normalizeView=value=>{
  return ["daily","weekly","monthly","yearly"].includes(value)?value:"daily";
 };

 const getToken=()=>{
  return localStorage.getItem("token")||sessionStorage.getItem("token")||"";
 };

 const getHeaders=()=>{
  const token=getToken();

  return {
   "Content-Type":"application/json",
   ...(token?{Authorization:`Bearer ${token}`}:{})
  };
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

 const currentUser=useMemo(()=>{
  return user||getStoredUser();
 },[user]);

 const userQueryValue=useMemo(()=>{
  const userId=normalizeId(currentUser?._id)||normalizeId(currentUser?.id);
  if(userId)return userId;

  if(currentUser?.username)return currentUser.username;
  if(currentUser?.email)return currentUser.email;

  return "";
 },[currentUser]);

 const dashboardPropKey=useMemo(()=>{
  return dashboard?JSON.stringify({
   summary:dashboard.summary||null,
   tasksCount:dashboard.tasks?.length||0,
   prioritiesCount:dashboard.priorities?.length||0,
   goalsCount:dashboard.activeGoals?.length||dashboard.goals?.length||0,
   habitsCount:dashboard.activeHabits?.length||dashboard.habits?.length||0,
   eventsCount:dashboard.calendarEvents?.length||0
  }):"";
 },[dashboard]);

 const normalizeRecords=(data,key)=>{
  if(!data)return [];

  if(Array.isArray(data?.[key])){
   return data[key];
  }

  if(Array.isArray(data?.data)){
   return data.data;
  }

  if(Array.isArray(data?.records)){
   return data.records;
  }

  if(Array.isArray(data)){
   return data;
  }

  return [];
 };

 const recordMatchesKind=(record,kind)=>{
  if(!record||typeof record!=="object")return false;

  if(kind==="tasks"){
   return !!record.title&&(
    record.taskType!==undefined||
    record.priority!==undefined||
    record.dueDate!==undefined||
    record.completedAt!==undefined||
    record.status!==undefined
   )&&record.name===undefined;
  }

  if(kind==="priorities"){
   return !!record.title&&(
    record.priorityLevel!==undefined||
    record.priorityType!==undefined||
    record.importance!==undefined||
    record.urgency!==undefined
   )&&record.name===undefined;
  }

  if(kind==="goals"){
   return !!record.title&&(
    record.goalType!==undefined||
    record.progress!==undefined||
    record.targetDate!==undefined||
    record.startDate!==undefined
   )&&record.name===undefined;
  }

  if(kind==="milestones"){
   return !!record.title&&(
    record.milestoneType!==undefined||
    record.milestoneDate!==undefined||
    record.targetDate!==undefined
   )&&record.name===undefined;
  }

  if(kind==="habits"){
   return !!record.title&&(
    record.frequency!==undefined||
    record.targetCount!==undefined||
    record.unit!==undefined
   )&&record.name===undefined;
  }

  if(kind==="routines"){
   return !!record.title&&(
    record.routineType!==undefined||
    record.frequency!==undefined||
    record.steps!==undefined
   )&&record.name===undefined;
  }

  if(kind==="journalEntries"){
   return !!(record.title||record.entry||record.content)&&(
    record.journalType!==undefined||
    record.entryDate!==undefined||
    record.promptResponses!==undefined
   )&&record.name===undefined;
  }

  if(kind==="mindfulnessEntries"){
   return !!(record.title||record.notes||record.description)&&(
    record.mindfulnessType!==undefined||
    record.mood!==undefined||
    record.energy!==undefined||
    record.stress!==undefined
   )&&record.name===undefined;
  }

  if(kind==="moodLogs"){
   return record.mood!==undefined&&(
    record.logDate!==undefined||
    record.energy!==undefined||
    record.stress!==undefined
   )&&record.name===undefined;
  }

  if(kind==="notes"){
   return !!(record.title||record.content||record.description)&&(
    record.noteType!==undefined||
    record.noteDate!==undefined
   )&&record.name===undefined;
  }

  if(kind==="calendarEvents"){
   return !!(record.title||record.name)&&(
    record.eventType!==undefined||
    record.startDate!==undefined||
    record.eventDate!==undefined||
    record.endDate!==undefined
   );
  }

  if(kind==="reminders"){
   return !!(record.title||record.name)&&(
    record.reminderType!==undefined||
    record.sendAt!==undefined||
    record.remindAt!==undefined
   );
  }

  if(kind==="reviews"){
   return !!(record.title||record.reviewType)&&(
    record.periodStart!==undefined||
    record.periodEnd!==undefined||
    record.reviewType!==undefined
   )&&record.name===undefined;
  }

  if(kind==="timelineEntries"){
   return !!(record.title||record.name)&&(
    record.timelineType!==undefined||
    record.memoryDate!==undefined||
    record.eventDate!==undefined
   );
  }

  if(kind==="visionBoards"){
   return !!(record.title||record.name)&&(
    record.visionType!==undefined||
    record.theme!==undefined||
    record.images!==undefined
   );
  }

  if(kind==="lifeThemes"){
   return !!(record.title||record.name)&&(
    record.themeType!==undefined||
    record.focus!==undefined||
    record.intentions!==undefined
   );
  }

  return true;
 };

 const readEndpoint=async(endpoint,key)=>{
  const res=await fetch(endpoint,{
   headers:getHeaders()
  });

  const data=await res.json().catch(()=>({}));

  if(!res.ok){
   console.error(`Dashboard load failed: ${endpoint}`,data);
   return [];
  }

  return normalizeRecords(data,key).filter(record=>recordMatchesKind(record,key));
 };

 useEffect(()=>{
  if(!dashboard)return;

  setLoadedDashboard(prev=>({
   ...prev,
   ...dashboard
  }));
 },[dashboardPropKey]);

 useEffect(()=>{
  let ignore=false;

  const loadDashboardRecords=async()=>{
   try{
    const [
     tasks,
     priorities,
     goals,
     milestones,
     habits,
     routines,
     journalEntries,
     mindfulnessEntries,
     moodLogs,
     notes,
     calendarEvents,
     reminders,
     reviews,
     timelineEntries,
     visionBoards,
     lifeThemes
    ]=await Promise.all([
     readEndpoint("/api/tasks","tasks"),
     readEndpoint("/api/priorities","priorities"),
     readEndpoint("/api/goals","goals"),
     readEndpoint("/api/milestones","milestones"),
     readEndpoint("/api/habits","habits"),
     readEndpoint("/api/routines","routines"),
     readEndpoint("/api/journal","journalEntries"),
     readEndpoint("/api/mindfulness","mindfulnessEntries"),
     readEndpoint("/api/mood-log","moodLogs"),
     readEndpoint("/api/notes","notes"),
     readEndpoint("/api/calendar-events","calendarEvents"),
     readEndpoint("/api/reminders","reminders"),
     readEndpoint("/api/reviews","reviews"),
     readEndpoint("/api/timeline","timelineEntries"),
     readEndpoint("/api/vision-boards","visionBoards"),
     readEndpoint("/api/life-themes","lifeThemes")
    ]);

    if(ignore)return;

    setLoadedDashboard(prev=>({
     ...prev,
     tasks,
     pendingTasks:tasks.filter(item=>item.status!=="completed"&&item.status!=="archived"),
     completedTasks:tasks.filter(item=>item.status==="completed"),
     priorities,
     goals,
     activeGoals:goals.filter(item=>item.status!=="completed"&&item.status!=="archived"),
     dueGoals:goals.filter(item=>item.status!=="completed"&&item.status!=="archived"),
     milestones,
     habits,
     activeHabits:habits.filter(item=>item.status==="active"),
     routines,
     activeRoutines:routines.filter(item=>item.status==="active"),
     journalEntries,
     mindfulnessEntries,
     moodLogs,
     notes,
     calendarEvents,
     reminders,
     reviews,
     timelineEntries,
     visionBoards,
     lifeThemes
    }));
   }catch(err){
    console.error("Dashboard record load failed",err);
   }
  };

  loadDashboardRecords();

  return()=>{
   ignore=true;
  };
 },[]);

 useEffect(()=>{
  let ignore=false;

  const loadSettings=async()=>{
   try{
    if(!userQueryValue){
     const defaultSettings=getDefaultSettings();

     if(!ignore){
      setSettings(defaultSettings);

      if(!viewOverridden){
       setActiveView(normalizeView(defaultSettings.dashboard.defaultView));
      }
     }

     return;
    }

    const res=await fetch(`/api/user-settings?user=${encodeURIComponent(userQueryValue)}`,{
     headers:getHeaders()
    });

    const data=await res.json().catch(()=>({}));

    if(!res.ok)throw new Error(data.message||"Failed to load dashboard settings");

    const loadedSettings={
     ...getDefaultSettings(),
     ...(data.userSetting||data.settings||data.data||{})
    };

    if(!ignore){
     setSettings(loadedSettings);

     if(!viewOverridden){
      setActiveView(normalizeView(loadedSettings?.dashboard?.defaultView));
     }
    }
   }catch(err){
    console.error("Dashboard settings load failed",err);

    const defaultSettings=getDefaultSettings();

    if(!ignore){
     setSettings(defaultSettings);

     if(!viewOverridden){
      setActiveView(normalizeView(defaultSettings.dashboard.defaultView));
     }
    }
   }
  };

  loadSettings();

  return()=>{
   ignore=true;
  };
 },[userQueryValue,viewOverridden]);

 const handleViewChange=view=>{
  setViewOverridden(true);
  setActiveView(normalizeView(view));
 };

 const resetToDefaultView=()=>{
  setViewOverridden(false);
  setActiveView(normalizeView(settings?.dashboard?.defaultView));
 };

 const summary=loadedDashboard?.summary||{};

 const shouldHidePrivate=settings?.privacy?.hidePrivateEntriesFromDashboard===true;
 const shouldHidePrivateFromTimeline=settings?.privacy?.hidePrivateEntriesFromTimeline===true;
 const showMoodSummary=settings?.dashboard?.showMoodSummary!==false;
 const showHabitProgress=settings?.dashboard?.showHabitProgress!==false;
 const showUpcomingReminders=settings?.dashboard?.showUpcomingReminders!==false;
 const showTimelinePreview=settings?.dashboard?.showTimelinePreview!==false;
 const showPrivateJournalCount=settings?.dashboard?.showPrivateJournalCount===true;

 const isPrivateRecord=item=>{
  return item?.isPrivate===true||
   item?.private===true||
   item?.visibility==="private"||
   item?.journalType==="private"||
   item?.entryType==="private";
 };

 const getRecordDate=item=>{
  return item?.dueDate||
   item?.targetDate||
   item?.entryDate||
   item?.noteDate||
   item?.memoryDate||
   item?.milestoneDate||
   item?.logDate||
   item?.sendAt||
   item?.periodStart||
   item?.createdAt||
   item?.date||
   null;
 };

 const getRangeStartDate=item=>{
  return item?.startDate||
   item?.createdAt||
   item?.date||
   null;
 };

 const getRangeEndDate=item=>{
  return item?.endDate||
   item?.targetDate||
   item?.dueDate||
   null;
 };

 const viewRange=useMemo(()=>{
  const now=new Date();
  const start=new Date(now);
  const end=new Date(now);

  start.setHours(0,0,0,0);
  end.setHours(23,59,59,999);

  if(activeView==="weekly"){
   const day=start.getDay();
   const weekStart=settings?.calendar?.weekStartsOn==="monday"?1:0;
   const diff=(day<weekStart?7:0)+day-weekStart;

   start.setDate(start.getDate()-diff);
   end.setTime(start.getTime());
   end.setDate(start.getDate()+6);
   end.setHours(23,59,59,999);
  }

  if(activeView==="monthly"){
   start.setDate(1);
   end.setMonth(start.getMonth()+1,0);
   end.setHours(23,59,59,999);
  }

  if(activeView==="yearly"){
   start.setMonth(0,1);
   end.setMonth(11,31);
   end.setHours(23,59,59,999);
  }

  return {start,end};
 },[activeView,settings?.calendar?.weekStartsOn]);

 const rangeLabel=useMemo(()=>{
  const formatDate=value=>{
   return new Intl.DateTimeFormat("en-US",{
    month:"short",
    day:"numeric",
    year:"numeric"
   }).format(value);
  };

  if(activeView==="daily")return formatDate(viewRange.start);

  return `${formatDate(viewRange.start)} - ${formatDate(viewRange.end)}`;
 },[activeView,viewRange.start,viewRange.end]);

 const recordOverlapsRange=item=>{
  const rawStart=getRangeStartDate(item);
  const rawEnd=getRangeEndDate(item);

  const itemStart=rawStart?new Date(rawStart):null;
  const itemEnd=rawEnd?new Date(rawEnd):null;

  if(itemStart&&Number.isNaN(itemStart.getTime()))return true;
  if(itemEnd&&Number.isNaN(itemEnd.getTime()))return true;

  if(itemStart&&!itemEnd)return itemStart<=viewRange.end;
  if(!itemStart&&itemEnd)return itemEnd>=viewRange.start;
  if(itemStart&&itemEnd)return itemStart<=viewRange.end&&itemEnd>=viewRange.start;

  return true;
 };

 const filterByView=items=>{
  if(!Array.isArray(items))return [];

  return items.filter(item=>{
   const dateValue=getRecordDate(item);

   if(!dateValue)return true;

   const itemDate=new Date(dateValue);

   if(Number.isNaN(itemDate.getTime()))return true;

   return itemDate>=viewRange.start&&itemDate<=viewRange.end;
  });
 };

 const filterActiveByView=items=>{
  if(!Array.isArray(items))return [];

  return items.filter(item=>recordOverlapsRange(item));
 };

 const visibleRecords=items=>{
  const records=filterByView(items);

  if(!shouldHidePrivate)return records;

  return records.filter(item=>!isPrivateRecord(item));
 };

 const visibleActiveRecords=items=>{
  const records=filterActiveByView(items);

  if(!shouldHidePrivate)return records;

  return records.filter(item=>!isPrivateRecord(item));
 };

 const visibleTimelineRecords=items=>{
  const records=visibleRecords(items);

  if(!shouldHidePrivateFromTimeline)return records;

  return records.filter(item=>!isPrivateRecord(item));
 };

 const visibleJournalCountRecords=items=>{
  const records=visibleRecords(items);

  if(showPrivateJournalCount)return records;

  return records.filter(item=>!isPrivateRecord(item));
 };

 const countByStatus=items=>{
  const counts={
   pending:0,
   active:0,
   inProgress:0,
   completed:0,
   blocked:0,
   paused:0,
   archived:0
  };

  (items||[]).forEach(item=>{
   const status=String(item?.status||"active").toLowerCase();

   if(status==="pending")counts.pending+=1;
   else if(status==="active")counts.active+=1;
   else if(status==="in-progress"||status==="inprogress")counts.inProgress+=1;
   else if(status==="completed"||status==="complete"||status==="done")counts.completed+=1;
   else if(status==="blocked")counts.blocked+=1;
   else if(status==="paused")counts.paused+=1;
   else if(status==="archived")counts.archived+=1;
   else counts.active+=1;
  });

  return counts;
 };

 const countCompletedHabitLogs=()=>{
  return (loadedDashboard?.habitLogs||[]).filter(item=>{
   const rawDate=item?.logDate||item?.date||item?.createdAt;
   if(!rawDate)return false;

   const logDate=new Date(rawDate);
   if(Number.isNaN(logDate.getTime()))return false;

   return logDate>=viewRange.start&&logDate<=viewRange.end&&item?.isCompleted===true;
  }).length;
 };

 const countByTitle=items=>{
  const counts={};

  (items||[]).forEach(item=>{
   const title=String(item?.title||"Untitled").trim()||"Untitled";

   counts[title]=(counts[title]||0)+1;
  });

  return Object.entries(counts).map(([label,value])=>({
   label,
   value,
   variant:"primary"
  }));
 };

 const data=useMemo(()=>({
  tasks:visibleRecords(loadedDashboard?.tasks||[]),
  pendingTasks:visibleRecords(loadedDashboard?.pendingTasks||[]),
  completedTasks:visibleRecords(loadedDashboard?.completedTasks||[]),
  priorities:visibleRecords(loadedDashboard?.priorities||[]),
  activeGoals:visibleActiveRecords(loadedDashboard?.activeGoals||loadedDashboard?.goals||[]),
  dueGoals:visibleRecords(loadedDashboard?.dueGoals||[]),
  milestones:visibleRecords(loadedDashboard?.milestones||[]),
  activeHabits:visibleActiveRecords(loadedDashboard?.activeHabits||loadedDashboard?.habits||[]),
  habitLogs:visibleRecords(loadedDashboard?.habitLogs||[]),
  completedHabitLogs:visibleRecords(loadedDashboard?.completedHabitLogs||[]),
  activeRoutines:visibleActiveRecords(loadedDashboard?.activeRoutines||loadedDashboard?.routines||[]),
  routineLogs:visibleRecords(loadedDashboard?.routineLogs||[]),
  completedRoutineLogs:visibleRecords(loadedDashboard?.completedRoutineLogs||[]),
  journalEntries:visibleRecords(loadedDashboard?.journalEntries||[]),
  journalEntriesForCount:visibleJournalCountRecords(loadedDashboard?.journalEntries||[]),
  mindfulnessEntries:visibleRecords(loadedDashboard?.mindfulnessEntries||[]),
  moodLogs:visibleRecords(loadedDashboard?.moodLogs||[]),
  notes:visibleRecords(loadedDashboard?.notes||[]),
  memories:visibleTimelineRecords(loadedDashboard?.memories||[]),
  timelineEntries:visibleTimelineRecords(loadedDashboard?.timelineEntries||[]),
  reviews:visibleRecords(loadedDashboard?.reviews||[]),
  calendarEvents:visibleRecords(loadedDashboard?.calendarEvents||[]),
  reminders:visibleRecords(loadedDashboard?.reminders||[]),
  visionBoards:visibleActiveRecords(loadedDashboard?.visionBoards||[]),
  lifeThemes:visibleActiveRecords(loadedDashboard?.lifeThemes||[])
 }),[
  loadedDashboard,
  activeView,
  viewRange.start,
  viewRange.end,
  shouldHidePrivate,
  shouldHidePrivateFromTimeline,
  showPrivateJournalCount
 ]);

 const taskStatus=countByStatus(data.tasks);
 const goalStatus=countByStatus(data.activeGoals);
 const habitStatus=countByStatus(data.activeHabits);
 const reminderStatus=countByStatus(data.reminders);

 const dashboardStats=stats||[
  {
   label:"Tasks",
   value:data.tasks.length,
   badges:[
    {label:"Pending",value:taskStatus.pending,variant:"warning"},
    {label:"Active",value:taskStatus.active,variant:"primary"},
    {label:"Done",value:taskStatus.completed,variant:"success"},
    {label:"Blocked",value:taskStatus.blocked,variant:"danger"}
   ]
  },
  {
   label:"Priorities",
   value:data.priorities.length,
   badges:countByTitle(data.priorities)
  },
  {
   label:"Goals",
   value:data.activeGoals.length,
   badges:[
    {label:"Active",value:goalStatus.active,variant:"primary"},
    {label:"Done",value:goalStatus.completed,variant:"success"},
    {label:"Paused",value:goalStatus.paused,variant:"warning"}
   ]
  },
  ...(showHabitProgress?[{
   label:"Habits",
   value:data.activeHabits.length,
   badges:[
    {label:"Active",value:habitStatus.active,variant:"primary"},
    {label:"Logged",value:data.habitLogs.length,variant:"default"},
    {label:"Done",value:countCompletedHabitLogs(),variant:"success"}
   ]
  }]:[]),
  {
   label:"Journal",
   value:data.journalEntriesForCount.length,
   badges:[
    {label:"Entries",value:data.journalEntriesForCount.length,variant:"primary"},
    {label:"Private",value:data.journalEntries.filter(item=>item.journalType==="private"||item.isPrivate===true).length,variant:"warning"}
   ]
  },
  {
   label:"Events",
   value:data.calendarEvents.length,
   badges:[
    {label:"Events",value:data.calendarEvents.length,variant:"primary"},
    {label:"Done",value:data.calendarEvents.filter(item=>item.status==="completed").length,variant:"success"}
   ]
  },
  ...(showUpcomingReminders?[{
   label:"Reminders",
   value:data.reminders.length,
   badges:[
    {label:"Due",value:data.reminders.filter(item=>item.status!=="completed"&&item.status!=="archived").length,variant:"warning"},
    {label:"Done",value:reminderStatus.completed,variant:"success"}
   ]
  }]:[]),
  ...(showTimelinePreview?[{
   label:"Timeline",
   value:data.timelineEntries.length,
   badges:[
    {label:"Entries",value:data.timelineEntries.length,variant:"primary"}
   ]
  }]:[]),
  ...(showMoodSummary?[{
   label:"Mood",
   value:data.moodLogs.length,
   badges:[
    {label:"Logs",value:data.moodLogs.length,variant:"primary"}
   ]
  }]:[])
 ];

 const viewProps={
  dashboard:loadedDashboard,
  settings,
  data,
  categoryProgress,
  activeView,
  rangeLabel,
  showMoodSummary,
  showHabitProgress,
  showUpcomingReminders,
  showTimelinePreview
 };

 const renderActiveView=()=>{
  if(activeView==="weekly")return <WeeklyDashboardView {...viewProps}/>;
  if(activeView==="monthly")return <MonthlyDashboardView {...viewProps}/>;
  if(activeView==="yearly")return <YearlyDashboardView {...viewProps}/>;
  return <DailyDashboardView {...viewProps}/>;
 };

 return(
  <section className="dashboard">

   <DashboardHeader
    summary={summary}
    dashboard={loadedDashboard}
    settings={settings}
    activeView={activeView}
    preferredView={settings?.dashboard?.defaultView||"daily"}
    viewOverridden={viewOverridden}
    rangeLabel={rangeLabel}
    onViewChange={handleViewChange}
    onResetDefault={resetToDefaultView}
   />

   <div className="dashboard-grid">

    <DashboardStats stats={dashboardStats}/>

    <DashboardCalendar
     events={data.calendarEvents}
     tasks={data.tasks}
     habits={data.activeHabits}
     goals={data.activeGoals}
     milestones={data.milestones}
     reminders={data.reminders}
     activeView={activeView}
     rangeLabel={rangeLabel}
     user={currentUser}
     settings={settings}
    />

    <section className="dashboard-main">
     {renderActiveView()}
    </section>

    <DashboardQuickActions
     showHabitProgress={showHabitProgress}
     showUpcomingReminders={showUpcomingReminders}
     showTimelinePreview={showTimelinePreview}
    />

   </div>

  </section>
 );
}

export default Dashboard;