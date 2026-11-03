import {useCallback,useEffect,useMemo,useState} from "react";
import {AlertCircle,BookOpen,CalendarDays,CheckCircle2,Library,ListChecks,Loader2,Sparkles} from "lucide-react";
import DashboardCalendar from "./DashboardCalendar.jsx";
import DashboardFilters from "./DashboardFilters.jsx";
import DashboardHeader from "./DashboardHeader.jsx";
import DashboardList from "./DashboardList.jsx";
import DashboardQuickActions from "./DashboardQuickActions.jsx";
import DashboardSection from "./DashboardSection.jsx";
import DashboardStats from "./DashboardStats.jsx";
import "../../styles/Dashboard.css";

const getObjectId=value=>{
 if(!value)return "";
 if(typeof value==="string")return /^[a-f\d]{24}$/i.test(value)?value:"";
 if(typeof value._id==="string")return value._id;
 return "";
};

const getStoredUser=()=>{
 const keys=["currentUser","userInfo","authUser","user"];

 for(const key of keys){
  try{
   const raw=localStorage.getItem(key)||sessionStorage.getItem(key);
   if(!raw)continue;
   const parsed=JSON.parse(raw);
   if(getObjectId(parsed))return parsed;
  }catch(err){
   console.error(`Failed to parse stored user from ${key}`,err);
  }
 }

 return null;
};

const getTodayValue=()=>{
 const date=new Date();
 const offset=date.getTimezoneOffset();
 return new Date(date.getTime()-offset*60000).toISOString().slice(0,10);
};

const getDefaultDateFilter=()=>{
 const today=new Date();
 return {
  year:String(today.getFullYear()),
  month:String(today.getMonth()+1),
  day:"all"
 };
};

const parseDateValue=value=>{
 const text=String(value||"");
 const match=text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
 const today=new Date();

 if(match){
  return {
   year:String(Number(match[1])),
   month:String(Number(match[2])),
   day:String(Number(match[3]))
  };
 }

 return {
  year:String(today.getFullYear()),
  month:String(today.getMonth()+1),
  day:String(today.getDate())
 };
};

const buildReportDate=dateFilter=>{
 if(dateFilter.year==="all")return getTodayValue();

 const year=dateFilter.year;
 const month=dateFilter.month==="all"?"1":dateFilter.month;
 const day=dateFilter.day==="all"?"1":dateFilter.day;

 return [
  year,
  String(month).padStart(2,"0"),
  String(day).padStart(2,"0")
 ].join("-");
};

const getPeriodFromDateFilter=dateFilter=>{
 if(dateFilter.year==="all")return "all";
 if(dateFilter.month==="all")return "year";
 if(dateFilter.day==="all")return "month";
 return "today";
};

const formatDate=value=>{
 if(!value)return "No date";
 const text=String(value);
 const isoMatch=text.match(/^(\d{4})-(\d{2})-(\d{2})/);

 if(isoMatch){
  return `${Number(isoMatch[2])}/${Number(isoMatch[3])}/${isoMatch[1]}`;
 }

 const date=new Date(value);
 if(Number.isNaN(date.getTime()))return "No date";
 return date.toLocaleDateString();
};

const getName=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 return value.title||value.name||"";
};

const isObjectIdText=value=>/^[a-f\d]{24}$/i.test(String(value||"").trim());

const getDisplayName=value=>{
 const name=getName(value);
 return name&&!isObjectIdText(name)?name:"";
};

const getStatusLabel=item=>{
 const status=getName(item?.status);
 if(status)return status;
 if(item?.completed)return "Completed";
 if(item?.completedAt)return "Completed";
 if(item?.active===false)return "Inactive";
 return "Active";
};

const getReference=item=>{
 const start=item?.chapterStart||item?.chapter;
 const verseStart=item?.verseStart;
 const verseEnd=item?.verseEnd;
 const chapterEnd=item?.chapterEnd;

 if(item?.reference)return item.reference;
 if(!item?.book)return "No reference";
 if(!start)return item.book;

 const endPart=verseEnd?`-${chapterEnd&&chapterEnd!==start?`${chapterEnd}:`:""}${verseEnd}`:"";
 return `${item.book} ${start}${verseStart?`:${verseStart}`:""}${endPart}`;
};

const getMethodNames=study=>{
 const methods=[
  study?.method,
  ...(Array.isArray(study?.methods)?study.methods:[])
 ].filter(Boolean);
 const names=[...new Set(methods.map(getDisplayName).filter(Boolean))];
 return names.length?names.join(", "):"No method attached";
};

const getPrimaryEntry=note=>{
 const entries=Array.isArray(note?.entries)?note.entries:[];
 return entries[0]||{};
};

const dashboardLink=path=>{
 const separator=path.includes("?")?"&":"?";
 return `${path}${separator}from=dashboard`;
};

const defaultDashboardData={
 summary:{},
 studies:[],
 dailyNotes:[],
 tasks:[],
 memoryVerses:[],
 methods:[]
};

function BibleStudyDashboard(){
 const storedUser=useMemo(()=>getStoredUser(),[]);
 const storedUserId=getObjectId(storedUser);
 const [dateFilter,setDateFilter]=useState(getDefaultDateFilter);
 const [dashboardData,setDashboardData]=useState(defaultDashboardData);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const period=useMemo(()=>getPeriodFromDateFilter(dateFilter),[dateFilter]);
 const reportDate=useMemo(()=>buildReportDate(dateFilter),[dateFilter]);

 const handleCalendarPeriodChange=nextPeriod=>{
  const dateParts=parseDateValue(reportDate);

  if(nextPeriod==="year"){
   setDateFilter({year:dateParts.year,month:"all",day:"all"});
   return;
  }

  if(nextPeriod==="month"){
   setDateFilter({year:dateParts.year,month:dateParts.month,day:"all"});
   return;
  }

  setDateFilter(dateParts);
 };

 const handleCalendarDateChange=value=>{
  const dateParts=parseDateValue(value);

  setDateFilter(currentFilter=>{
   const currentPeriod=getPeriodFromDateFilter(currentFilter);

   if(currentPeriod==="year")return {year:dateParts.year,month:"all",day:"all"};
   if(currentPeriod==="month")return {year:dateParts.year,month:dateParts.month,day:"all"};
   return dateParts;
  });
 };

 const loadDashboard=useCallback(async()=>{
  setLoading(true);
  setError("");

  try{
   const query=new URLSearchParams({
    period,
    reportDate
   });

   if(storedUserId)query.set("user",storedUserId);

   const res=await fetch(`/api/dashboard?${query.toString()}`);
   const data=await res.json().catch(()=>({}));

   if(!res.ok){
    throw new Error(data?.message||"Failed to load dashboard data");
   }

   setDashboardData({
    ...defaultDashboardData,
    ...data,
    summary:data?.summary||{}
   });
  }catch(err){
   setError(err.message||"Failed to load dashboard data");
  }finally{
   setLoading(false);
  }
 },[period,reportDate,storedUserId]);

 useEffect(()=>{
  loadDashboard();
 },[loadDashboard]);

 const summary=dashboardData.summary||{};
 const stats=[
  {
   label:"Total Studies",
   value:summary.totalStudies,
   detail:Array.isArray(summary.studyTypeBreakdown)?summary.studyTypeBreakdown:[],
   icon:<BookOpen size={18} strokeWidth={2.2}/>
  },
  {label:"Active Studies",value:summary.activeStudies,icon:<Sparkles size={18} strokeWidth={2.2}/>},
  {label:"Daily Notes",value:summary.dailyNotes,icon:<CalendarDays size={18} strokeWidth={2.2}/>},
  {
   label:"Memory Verses",
   value:summary.memoryVerses,
   detail:[
    {label:"In Progress",value:summary.memoryVersesInProgress??0},
    {label:"Memorized",value:summary.memoryVersesMemorized??0}
   ],
   icon:<CheckCircle2 size={18} strokeWidth={2.2}/>
  },
  {
   label:"Study Tasks",
   value:summary.totalTasks,
   detail:[
    {label:"Pending",value:summary.pendingTasks??0},
    {label:"Completed",value:summary.completedTasks??0}
   ],
   icon:<ListChecks size={18} strokeWidth={2.2}/>
  }
 ];

 const recentStudies=dashboardData.studies||[];
 const dailyNotes=dashboardData.dailyNotes||[];
 const tasks=dashboardData.tasks||[];
 const memoryVerses=dashboardData.memoryVerses||[];
 const methods=dashboardData.methods||[];

 return(
  <section className="dashboard">
   <DashboardHeader/>

   <DashboardFilters
    dateFilter={dateFilter}
    loading={loading}
    onDateFilterChange={setDateFilter}
    onRefresh={loadDashboard}
   />

   {error?(
    <div className="dashboard-error">
     <AlertCircle size={18} strokeWidth={2.2}/>
     <span>{error}</span>
    </div>
   ):null}

   {loading?(
    <div className="dashboard-loading">
     <Loader2 size={22} strokeWidth={2.2}/>
     <span>Loading dashboard data...</span>
    </div>
   ):(
    <div className="dashboard-grid">
     <DashboardStats stats={stats}/>

     <section className="dashboard-main">
      <DashboardCalendar
       period={period}
       reportDate={reportDate}
       studies={recentStudies}
       dailyNotes={dailyNotes}
       tasks={tasks}
       memoryVerses={memoryVerses}
       onPeriodChange={handleCalendarPeriodChange}
       onReportDateChange={handleCalendarDateChange}
      />

      <DashboardSection kicker="Study Work" title="Recent Studies" linkTo={dashboardLink("/forms/studies/study")} linkText="Open studies" priority>
       <DashboardList
        items={recentStudies}
        emptyText="No Bible studies found for this user yet."
        icon={<BookOpen size={17} strokeWidth={2.2}/>}
        getTitle={item=>item.title||"Untitled study"}
        getLink={item=>dashboardLink(`/forms/studies/study/${item._id}`)}
        metaBuilder={item=>`${getReference(item)} · ${getMethodNames(item)} · ${getStatusLabel(item)}`}
       />
      </DashboardSection>

      <DashboardSection kicker="Daily Journal" title="Recent Daily Notes" linkTo={dashboardLink("/forms/studies/daily-note")} linkText="Open notes">
       <DashboardList
        items={dailyNotes}
        emptyText="No daily notes found for the selected range."
        icon={<CalendarDays size={17} strokeWidth={2.2}/>}
        getTitle={item=>item.title||`Daily Note - ${formatDate(item.journalDate)}`}
        getLink={()=>dashboardLink("/forms/studies/daily-note")}
        metaBuilder={item=>{
         const primaryEntry=getPrimaryEntry(item);
         return `${formatDate(item.journalDate)} · ${getReference(primaryEntry)} · ${(item.entries||[]).length} scripture entries`;
        }}
       />
      </DashboardSection>

      <DashboardSection kicker="Attention" title="Study Tasks" linkTo={dashboardLink("/study-tasks")} linkText="Open tasks">
       <DashboardList
        items={tasks}
        emptyText="No study tasks found for the selected range."
        icon={<ListChecks size={17} strokeWidth={2.2}/>}
        getTitle={item=>item.title||"Untitled task"}
        getLink={item=>dashboardLink(`/forms/studies/study-task/${item._id}`)}
        metaBuilder={item=>`${getName(item.study)||"No study"} · ${getName(item.priority)||"No priority"} · Due ${formatDate(item.dueDate)}`}
       />
      </DashboardSection>

      <DashboardSection kicker="Memorization" title="Memory Review Queue" linkTo={dashboardLink("/forms/studies/memory-verse")} linkText="Open memory">
       <DashboardList
        items={memoryVerses}
        emptyText="No memory verses found."
        icon={<CheckCircle2 size={17} strokeWidth={2.2}/>}
        getTitle={item=>item.reference||"Memory verse"}
        getLink={item=>dashboardLink(`/forms/studies/memory-verse/${item._id}`)}
        metaBuilder={item=>`${item.translation||"No translation"} · ${item.memorized?"Memorized":"In process"} · Review ${formatDate(item.nextReviewAt)}`}
       />
      </DashboardSection>

      <DashboardSection kicker="Methods In Use" title="Study Methods Used" linkTo={dashboardLink("/methods")} linkText="Browse methods" wide>
       <DashboardList
        items={methods}
        emptyText="No study methods are used in the selected range."
        icon={<Library size={17} strokeWidth={2.2}/>}
        getTitle={item=>item.title||"Untitled method"}
        getLink={item=>dashboardLink(item.slug?`/methods/${item.slug}`:"/methods")}
        metaBuilder={item=>`${item.count??0} studies in this range`}
       />
      </DashboardSection>
     </section>

     <DashboardQuickActions/>
    </div>
   )}
  </section>
 );
}

export default BibleStudyDashboard;
