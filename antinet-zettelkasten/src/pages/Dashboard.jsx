// src/pages/Dashboard.jsx
import {useCallback,useEffect,useMemo,useState} from "react";
import {Tab,Tabs} from "react-bootstrap";
import {Tags} from "lucide-react";
import DashboardHero from "../components/dashboard/DashboardHero.jsx";
import ResearchSearchPanel from "../components/dashboard/ResearchSearchPanel.jsx";
import KnowledgeStructureSummary from "../components/dashboard/KnowledgeStructureSummary.jsx";
import DomainsSummary from "../components/dashboard/DomainsSummary.jsx";
import WorkflowPrioritiesPanel from "../components/dashboard/WorkflowPrioritiesPanel.jsx";
import DashboardListPanel from "../components/dashboard/DashboardListPanel.jsx";
import DashboardSidebar from "../components/dashboard/DashboardSidebar.jsx";
import OrphanNotesPanel from "../components/dashboard/OrphanNotesPanel.jsx";
import RecentNotesPanel from "../components/dashboard/RecentNotesPanel.jsx";
import ReferencesPanel from "../components/dashboard/ReferencesPanel.jsx";
import StaleNotesPanel from "../components/dashboard/StaleNotesPanel.jsx";
import DashboardCalendarCard from "../components/dashboard/DashboardCalendarCard.jsx";
import DailyTasksPanel from "../components/dashboard/DailyTasksPanel.jsx";
import AttentionPanel from "../components/dashboard/AttentionPanel.jsx";
import ResearchQueuePanel from "../components/dashboard/ResearchQueuePanel.jsx";
import YearlyActivityChart from "../components/dashboard/YearlyActivityChart.jsx";
import MonthlyActivityChart from "../components/dashboard/MonthlyActivityChart.jsx";
import ReviewInsightCards from "../components/dashboard/ReviewInsightCards.jsx";
import DashboardError from "../components/dashboard/DashboardError.jsx";
import QuickActionsPanel from "../components/dashboard/QuickActionsPanel.jsx";
import ZettelClusterPanel from "../components/dashboard/ZettelClusterPanel.jsx";
import "../styles/Dashboard.css";

const getRows=(data,key)=>{
  if(Array.isArray(data))return data;
  if(Array.isArray(data?.data))return data.data;
  if(key&&Array.isArray(data?.[key]))return data[key];
  return [];
};

const getDateValue=item=>{
  return item?.updatedAt||item?.modifiedAt||item?.createdAt||item?.date||item?.publishedDate||item?.accessedDate||null;
};

// Calendar history belongs to the day the zettel was originally created.
// Editing metadata or regenerating an ID must not move it to the edit date.
const getCalendarDateValue=item=>item?.createdAt||null;

const getText=value=>{
  if(value===null||value===undefined)return "";
  if(typeof value==="string"||typeof value==="number")return String(value);
  if(Array.isArray(value))return value.map(item=>getText(item)).filter(Boolean).join(", ");
  if(typeof value==="object"){
   if(typeof value.name==="string")return value.name;
   if(typeof value.title==="string")return value.title;
   if(typeof value.label==="string")return value.label;
   if(typeof value.url==="string")return value.url;
   if(typeof value.author==="string")return value.author;
   if(typeof value.publisher==="string")return value.publisher;
   return "";
  }
  return "";
};

const getNoteTitle=item=>{
  return getText(item?.title)||getText(item?.name)||getText(item?.subject)||getText(item?.slug)||"Untitled note";
};

const getFleetingTitle=item=>{
  return getText(item?.topic)||getText(item?.fleetingNoteId)||"Untitled fleeting note";
};

const getNotebookName=item=>{
  return getText(item?.projectId?.title)||getText(item?.projectId?.code)||getText(item?.notebookRef?.name)||getText(item?.notebook?.name)||"Inbox";
};

const getId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 return String(value._id||value.id||value.$oid||"");
};

const isZettelRecordType=value=>{
 const normalized=String(value||"").replace(/[\s_-]/g,"").toUpperCase();
 return normalized==="ZTL"||normalized==="ZETTEL"||normalized==="ZETTELS";
};

const getNoteTypeName=item=>{
  return getText(item?.subtype)||getText(item?.noteTypeRef?.name)||getText(item?.noteType?.name)||getText(item?.type)||"Zettel";
};

const isWorkingNote=item=>{
  const typeName=getNoteTypeName(item).trim().toLowerCase();
  const workingTypes=new Set([
   "note",
   "notes",
   "concept",
   "idea",
   "zettel",
   "fleeting note",
   "literature note",
   "permanent note"
  ]);
  return workingTypes.has(typeName);
};

const getTagCount=item=>{
  if(Array.isArray(item?.tagRefs))return item.tagRefs.length;
  if(Array.isArray(item?.tags))return item.tags.length;
  return 0;
};

const getReferenceTitle=item=>{
 return getText(item?.title)||getText(item?.name)||"Untitled reference";
};

const getReferenceMeta=item=>{
 return getText(item?.author)||getText(item?.publisher)||getText(item?.source)||getText(item?.url)||"Reference";
};

const formatDate=value=>{
 if(!value)return "No date";
 const date=new Date(value);
 if(Number.isNaN(date.getTime()))return "No date";
 return date.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"});
};

const dashboardMonths=[
 {value:"0",label:"January"},
 {value:"1",label:"February"},
 {value:"2",label:"March"},
 {value:"3",label:"April"},
 {value:"4",label:"May"},
 {value:"5",label:"June"},
 {value:"6",label:"July"},
 {value:"7",label:"August"},
 {value:"8",label:"September"},
 {value:"9",label:"October"},
 {value:"10",label:"November"},
 {value:"11",label:"December"}
];
const formatLocalDate=value=>`${value.getFullYear()}-${String(value.getMonth()+1).padStart(2,"0")}-${String(value.getDate()).padStart(2,"0")}`;

function Dashboard({user}){

 const [loading,setLoading]=useState(true);
 const [notes,setNotes]=useState([]);
 const [domains,setDomains]=useState([]);
 const [entities,setEntities]=useState([]);
 const [projects,setProjects]=useState([]);
 const [fleetingNotes,setFleetingNotes]=useState([]);
 const [structureNotes,setStructureNotes]=useState([]);
 const [outputs,setOutputs]=useState([]);
 const [links,setLinks]=useState([]);
 const [references,setReferences]=useState([]);
 const [favorites,setFavorites]=useState([]);
 const [reviewIntervalDays,setReviewIntervalDays]=useState(14);
 const [dashboardError,setDashboardError]=useState("");
 const [actionsOpen,setActionsOpen]=useState(false);
 const [yearFilter,setYearFilter]=useState(()=>String(new Date().getFullYear()));
 const [monthFilter,setMonthFilter]=useState(()=>String(new Date().getMonth()));
 const [dayFilter,setDayFilter]=useState("all");
 const [selectedTaskDate,setSelectedTaskDate]=useState(()=>formatLocalDate(new Date()));
 const [dailyTasks,setDailyTasks]=useState([]);
 const [selectedTask,setSelectedTask]=useState(null);
 const [activeTab,setActiveTab]=useState("today");
 const [currentTime]=useState(()=>Date.now());

 const getUserId=value=>{
  if(!value)return "";
  if(typeof value==="string")return value;
  if(typeof value==="object"){
   if(typeof value._id==="string")return value._id;
   if(typeof value.id==="string")return value.id;
   if(typeof value.$oid==="string")return value.$oid;
   if(typeof value._id?.$oid==="string")return value._id.$oid;
   if(typeof value.id?.$oid==="string")return value.id.$oid;
  }
  return "";
 };

 const userId=getUserId(user);
 const selectTaskDate=date=>{
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return;
  const value=new Date(`${date}T12:00:00`);
  if(Number.isNaN(value.getTime()))return;
  setSelectedTaskDate(date);
  setYearFilter(String(value.getFullYear()));
  setMonthFilter(String(value.getMonth()));
  setDayFilter(String(value.getDate()));
 };

 const withUserQuery=useCallback(url=>{
  if(!userId)return url;
  const separator=url.includes("?")?"&":"?";
  return `${url}${separator}userId=${encodeURIComponent(userId)}`;
 },[userId]);

 const safeFetch=useCallback(async(url,key)=>{
  try{
   const res=await fetch(withUserQuery(url));
   if(!res.ok)return [];
   const data=await res.json().catch(()=>null);
   return getRows(data,key);
  }catch{
   setDashboardError("Some dashboard data could not be loaded.");
   return [];
  }
 },[withUserQuery]);

 const safeFetchObject=useCallback(async url=>{
  try{
   const res=await fetch(withUserQuery(url));
   if(!res.ok)return null;
   const data=await res.json().catch(()=>null);
   return data?.data&&typeof data.data==="object"&&!Array.isArray(data.data)?data.data:null;
  }catch{
   setDashboardError("Some dashboard data could not be loaded.");
   return null;
  }
 },[withUserQuery]);

 useEffect(()=>{
  let mounted=true;

  const loadDashboard=async()=>{
   try{
    setLoading(true);

    const [
     notesData,
     domainsData,
     entitiesData,
     projectsData,
     fleetingData,
     structureData,
     outputData,
     linksData,
     referencesData,
     favoritesData,
     settingsData
    ]=await Promise.all([
     safeFetch("/api/zettels","zettels"),
     safeFetch("/api/domains","domains"),
     safeFetch("/api/entities","entities"),
     safeFetch("/api/projects","projects"),
     safeFetch("/api/fleeting-notes?includeProcessed=true","fleetingNotes"),
     safeFetch("/api/structure-notes","structureNotes"),
     safeFetch("/api/outputs","outputs"),
     safeFetch("/api/connections","connections"),
     safeFetch("/api/sources","sources"),
     safeFetch("/api/zettels","zettels"),
     safeFetchObject("/api/settings")
    ]);

    if(!mounted)return;

    setNotes(notesData);
    setDomains(domainsData);
    setEntities(entitiesData);
    setProjects(projectsData);
    setFleetingNotes(fleetingData);
    setStructureNotes(structureData);
    setOutputs(outputData);
    setLinks(linksData);
    setReferences(referencesData);
    setFavorites(favoritesData.filter(item=>item.isFavorite));
    if(Number.isFinite(Number(settingsData?.reviewIntervalDays))){
     setReviewIntervalDays(Number(settingsData.reviewIntervalDays));
    }
   }finally{
    if(mounted)setLoading(false);
   }
  };

  loadDashboard();
  return()=>{mounted=false;};
 },[safeFetch,safeFetchObject]);

 const getLinkCount=useCallback(item=>{
  const noteId=String(item?._id||item?.id||"");
  if(!noteId)return 0;

  const noteLinkIds=Array.isArray(item?.links)
   ?item.links.map(link=>String(link?._id||link?.id||link)).filter(Boolean)
   :[];

  const externalLinkIds=links.filter(link=>{
   const fromId=String(link?.fromRecord?._id||link?.fromRecord||link?.fromRecordId||link?.fromNote?._id||link?.fromNote||"");
   const toId=String(link?.toRecord?._id||link?.toRecord||link?.toRecordId||link?.toNote?._id||link?.toNote||"");
   return fromId===noteId||toId===noteId;
  }).map(link=>String(link?._id||link?.id||"")).filter(Boolean);

  return new Set([...noteLinkIds,...externalLinkIds]).size;
 },[links]);

 const getRelatedNoteCount=useCallback(item=>{
  const noteId=String(item?._id||item?.id||"");
  if(!noteId)return 0;

  const relationIds=[
   item?.note,
   item?.noteRef,
   item?.parentNote,
   item?.parentNoteRef,
   item?.sourceNote,
   item?.sourceNoteRef,
   item?.targetNote,
   item?.targetNoteRef,
   item?.bookNote,
   item?.bookNoteRef,
   item?.itemNote,
   item?.itemNoteRef
  ].map(value=>String(value?._id||value?.id||value||"")).filter(Boolean);

  const relationArrays=[
   item?.notes,
   item?.noteRefs,
   item?.references,
   item?.referenceRefs,
   item?.children,
   item?.childNotes,
   item?.items,
   item?.itemRefs
  ].flatMap(value=>Array.isArray(value)?value:[])
   .map(value=>String(value?._id||value?.id||value?.note?._id||value?.note||""))
   .filter(Boolean);

  return new Set([...relationIds,...relationArrays]).size;
 },[]);

 const isArchived=useCallback(item=>{
  if(item?.isArchived===true)return true;
  if(item?.archived===true)return true;
  return String(item?.status||"").trim().toLowerCase()==="archived";
 },[]);

 const availableYears=useMemo(()=>{
  const years=[...new Set([
   new Date().getFullYear(),
   ...notes
    .map(item=>getCalendarDateValue(item)?new Date(getCalendarDateValue(item)).getFullYear():null)
    .filter(Boolean)
  ]
  )].sort((a,b)=>b-a);

  return years;
 },[notes]);

 const months=dashboardMonths;

 const resetToCurrentPeriod=()=>{
  const now=new Date();
  setYearFilter(String(now.getFullYear()));
  setMonthFilter(String(now.getMonth()));
  setDayFilter("all");
 };

 const getNoteDetailLink=item=>item?._id||item?.id?`/notes/${item._id||item.id}?returnTo=/dashboard`:"/notes";
 const getConnectionCreateLink=item=>item?._id||item?.id?`/links?create=1&fromType=ZTL&fromId=${encodeURIComponent(item._id||item.id)}`:"/links";

 const availableDays=useMemo(()=>{
  const days=new Set(
   notes
    .map(item=>{
     const value=getCalendarDateValue(item);
     if(!value)return null;
     const itemDate=new Date(value);
     if(Number.isNaN(itemDate.getTime()))return null;

     const itemYear=String(itemDate.getFullYear());
     const itemMonth=String(itemDate.getMonth());
     const matchYear=yearFilter==="all"||itemYear===yearFilter;
     const matchMonth=monthFilter==="all"||itemMonth===monthFilter;

     return matchYear&&matchMonth?itemDate.getDate():null;
    })
    .filter(Boolean)
  );

  if(dayFilter!=="all"){
   days.add(Number(dayFilter));
  }

  return [...days].sort((a,b)=>a-b);
 },[notes,yearFilter,monthFilter,dayFilter]);

 const filteredNotes=useMemo(()=>{
  return notes.filter(item=>{
   const value=getCalendarDateValue(item);
   if(!value)return false;

   const itemDate=new Date(value);
   if(Number.isNaN(itemDate.getTime()))return false;

   const itemYear=String(itemDate.getFullYear());
   const itemMonth=String(itemDate.getMonth());
   const itemDay=String(itemDate.getDate());
   const matchYear=yearFilter==="all"||itemYear===yearFilter;
   const matchMonth=monthFilter==="all"||itemMonth===monthFilter;
   const matchDay=dayFilter==="all"||itemDay===dayFilter;

   return matchYear&&matchMonth&&matchDay;
  });
 },[notes,yearFilter,monthFilter,dayFilter]);

 const dashboardListLimit=4;

 const noteTypeChartData=useMemo(()=>{
  const totals={};

  filteredNotes.forEach(item=>{
   const key=getNoteTypeName(item)||"Uncategorized";
   totals[key]=(totals[key]||0)+1;
  });

  const rows=Object.entries(totals)
   .map(([category,count])=>({category,count}))
   .sort((a,b)=>b.count-a.count);

  const max=rows.length?rows[0].count:0;

  return rows.map(row=>({
   ...row,
   width:max?`${(row.count/max)*100}%`:"0%"
  }));
 },[filteredNotes]);

 const domainRecordCounts=useMemo(()=>{
  const counts={};
  const domainRecords=[
   ...fleetingNotes,
   ...references,
   ...entities,
   ...notes,
   ...links,
   ...structureNotes,
   ...outputs,
   ...projects
  ];
  domainRecords.forEach(record=>{
   const domainId=getId(record?.domainId);
   if(domainId)counts[domainId]=(counts[domainId]||0)+1;
  });
  return counts;
 },[entities,fleetingNotes,links,notes,outputs,projects,references,structureNotes]);

 const selectedYearNumber=yearFilter==="all"?new Date().getFullYear():Number(yearFilter);
 const selectedMonthNumber=monthFilter==="all"?new Date().getMonth():Number(monthFilter);

 const yearlyActivityData=useMemo(()=>{
  return months.map(month=>{
   const count=notes.filter(item=>{
    const value=getCalendarDateValue(item);
    if(!value)return false;
    const itemDate=new Date(value);
    return !Number.isNaN(itemDate.getTime())
     &&itemDate.getFullYear()===selectedYearNumber
     &&itemDate.getMonth()===Number(month.value);
   }).length;

   return{label:month.label.slice(0,3),value:count};
  });
 },[months,notes,selectedYearNumber]);

 const monthlyActivityData=useMemo(()=>{
  const daysInMonth=new Date(selectedYearNumber,selectedMonthNumber+1,0).getDate();

  return Array.from({length:daysInMonth},(_,index)=>{
   const day=index+1;
   const count=notes.filter(item=>{
    const value=getCalendarDateValue(item);
    if(!value)return false;
    const itemDate=new Date(value);
    return !Number.isNaN(itemDate.getTime())
     &&itemDate.getFullYear()===selectedYearNumber
     &&itemDate.getMonth()===selectedMonthNumber
     &&itemDate.getDate()===day;
   }).length;

   return{label:String(day),value:count};
  });
 },[notes,selectedYearNumber,selectedMonthNumber]);

 const recentNotes=useMemo(()=>{
  return [...notes]
   .filter(item=>!isArchived(item))
   .sort((a,b)=>new Date(getDateValue(b)||0)-new Date(getDateValue(a)||0))
   .slice(0,dashboardListLimit);
 },[notes,isArchived]);

 const orphanNotes=useMemo(()=>{
  return filteredNotes
   .filter(item=>!isArchived(item)&&isWorkingNote(item)&&getLinkCount(item)===0)
   .filter(item=>getRelatedNoteCount(item)===0)
   .sort((a,b)=>new Date(getDateValue(b)||0)-new Date(getDateValue(a)||0))
   .slice(0,dashboardListLimit);
 },[filteredNotes,getLinkCount,getRelatedNoteCount,isArchived]);

 const untaggedNotes=useMemo(()=>{
  return filteredNotes
   .filter(item=>!isArchived(item)&&getTagCount(item)===0)
   .sort((a,b)=>new Date(getDateValue(b)||0)-new Date(getDateValue(a)||0))
   .slice(0,dashboardListLimit);
 },[filteredNotes,isArchived]);

 const recentReferences=useMemo(()=>{
  return [...references]
   .sort((a,b)=>new Date(getDateValue(b)||0)-new Date(getDateValue(a)||0))
   .slice(0,dashboardListLimit);
 },[references]);

 const staleNotes=useMemo(()=>{
  const staleAfterMs=1000*60*60*24*reviewIntervalDays;

  return fleetingNotes
   .filter(item=>{
    const status=String(item?.status||"active").trim().toLowerCase();
    if(status!=="active"||item?.hideFromInbox||item?.processedInto)return false;

    const value=item?.createdAt;
    if(!value)return false;

    const time=new Date(value).getTime();
    if(Number.isNaN(time))return false;

    return currentTime-time>=staleAfterMs;
   })
   .sort((a,b)=>new Date(a.createdAt||0)-new Date(b.createdAt||0))
   .slice(0,dashboardListLimit);
 },[fleetingNotes,currentTime,reviewIntervalDays]);

 const reviewInsights=useMemo(()=>{
  const total=Math.max(filteredNotes.length,1);
  const yearlyTotal=yearlyActivityData.reduce((sum,item)=>sum+item.value,0);
  const monthlyTotal=monthlyActivityData.reduce((sum,item)=>sum+item.value,0);
  const selectedMonthLabel=months.find(item=>item.value===String(monthFilter))?.label||"Current Month";

  return{
   monthLabel:monthFilter==="all"?"Current Month":selectedMonthLabel,
   yearlyActivity:[
    {key:"year-total",category:"Notes this year",value:yearlyTotal,percent:(yearlyTotal/total)*100,meta:yearFilter==="all"?"Current year":"Selected year"},
    {key:"year-links",category:"Links",value:links.length,percent:(links.length/Math.max(notes.length,1))*100,meta:"System links"}
   ],
   monthlyActivity:[
    {key:"month-total",category:"Notes this month",value:monthlyTotal,percent:(monthlyTotal/total)*100,meta:monthFilter==="all"?"Current month":"Selected month"},
    {key:"day-total",category:"Notes this day",value:filteredNotes.length,percent:(filteredNotes.length/total)*100,meta:dayFilter==="all"?"All days":"Selected day"}
   ],
   attentionQueue:[
    ...orphanNotes.map(item=>({key:item._id||item.id,title:getNoteTitle(item),meta:"Unlinked working note"})),
    ...staleNotes.map(item=>({key:item._id||item.id,title:getFleetingTitle(item),meta:"Overdue fleeting note",to:"/inbox"}))
   ].slice(0,8)
  };
 },[filteredNotes,yearlyActivityData,monthlyActivityData,links.length,notes.length,orphanNotes,staleNotes,months,yearFilter,monthFilter,dayFilter]);

 const favoriteNotes=useMemo(()=>{
  return [...favorites]
   .sort((a,b)=>new Date(getDateValue(b)||0)-new Date(getDateValue(a)||0))
   .slice(0,6);
 },[favorites]);

 const calendarItems=useMemo(()=>notes.map(note=>({
  id:getId(note),
  title:getNoteTitle(note),
  date:getCalendarDateValue(note)
 })).filter(item=>item.id&&item.date),[notes]);

 const connectedZettelClusters=useMemo(()=>{
  const notesById=new Map(notes.map(note=>[String(note._id||note.id),note]));
  const adjacency=new Map([...notesById.keys()].map(id=>[id,new Set()]));
  const connect=(leftId,rightId)=>{
   if(!leftId||!rightId||leftId===rightId||!notesById.has(leftId)||!notesById.has(rightId))return;
   adjacency.get(leftId).add(rightId);
   adjacency.get(rightId).add(leftId);
  };

  links.forEach(link=>{
   const fromType=link.fromRecordType||link.fromModel;
   const toType=link.toRecordType||link.toModel;
   if(!isZettelRecordType(fromType)||!isZettelRecordType(toType))return;
   connect(getId(link.fromRecord||link.fromRecordId),getId(link.toRecord||link.toRecordId));
  });

  const visited=new Set();
  const clusters=[];

  notesById.forEach((_,noteId)=>{
   if(visited.has(noteId)||(adjacency.get(noteId)?.size||0)===0)return;

   const memberIds=[];
   const pending=[noteId];
   visited.add(noteId);

   while(pending.length){
    const currentId=pending.pop();
    memberIds.push(currentId);
    (adjacency.get(currentId)||[]).forEach(relatedId=>{
     if(visited.has(relatedId))return;
     visited.add(relatedId);
     pending.push(relatedId);
    });
   }

   const members=memberIds
    .map(id=>notesById.get(id))
    .filter(Boolean)
    .sort((left,right)=>getNoteTitle(left).localeCompare(getNoteTitle(right)));
   const lead=[...members].sort((left,right)=>(adjacency.get(getId(right))?.size||0)-(adjacency.get(getId(left))?.size||0)||getNoteTitle(left).localeCompare(getNoteTitle(right)))[0];
   const edgeCount=Math.round(memberIds.reduce((total,id)=>total+(adjacency.get(id)?.size||0),0)/2);

   clusters.push({
    id:memberIds.slice().sort().join(":"),
    name:getNoteTitle(lead),
    members,
    memberCount:members.length,
    connectionCount:edgeCount
   });
  });

  return clusters.sort((left,right)=>right.memberCount-left.memberCount||right.connectionCount-left.connectionCount||getNoteTitle(left.members[0]).localeCompare(getNoteTitle(right.members[0])));
 },[notes,links]);

 return(
  <section className="dashboard">
   <DashboardHero/>
   {dashboardError?<DashboardError message={dashboardError}/>:null}
   <QuickActionsPanel open={actionsOpen} onToggle={()=>setActionsOpen(prev=>!prev)}/>
   <Tabs activeKey={activeTab} onSelect={key=>setActiveTab(key||"today")} mountOnEnter unmountOnExit={false} className="dashboard-main-tabs" id="dashboard-main-tabs">
   <Tab eventKey="today" title="Today">
    <WorkflowPrioritiesPanel
     loading={loading}
     fleetingCount={fleetingNotes.filter(item=>!item.hideFromInbox&&item.status==="active").length}
     draftStructureCount={structureNotes.filter(item=>item.status==="draft").length}
     draftOutputs={outputs.filter(item=>item.status==="draft")}
    />
    <div className="dashboard-planning-row">
     <DailyTasksPanel userId={userId} selectedDate={selectedTaskDate} onDateChange={selectTaskDate} onTasksChange={setDailyTasks} selectedTask={selectedTask} onClearSelection={()=>setSelectedTask(null)}/>
     <AttentionPanel items={reviewInsights.attentionQueue}/>
    </div>
    <div id="today-calendar">
     <DashboardCalendarCard
      year={selectedYearNumber}
      month={selectedMonthNumber}
      items={calendarItems}
      taskItems={dailyTasks}
      selectedTaskDate={selectedTaskDate}
      onTaskDateSelect={selectTaskDate}
      onTaskSelect={task=>{selectTaskDate(task.occurrenceDate||task.scheduledDate);setSelectedTask(task);}}
      onDaySelect={setDayFilter}
      onMonthSelect={date=>{
       setYearFilter(String(date.getFullYear()));
       setMonthFilter(String(date.getMonth()));
       setDayFilter("all");
       setSelectedTaskDate(formatLocalDate(date));
      }}
     />
    </div>
   </Tab>
   <Tab eventKey="research" title="Research">
    <div className="dashboard-research-row">
     <ResearchSearchPanel domains={domains} zettels={notes} structures={structureNotes} sources={references} entities={entities} fleetingNotes={fleetingNotes} outputs={outputs}/>
     <ResearchQueuePanel zettels={notes} domains={domains}/>
    </div>
   </Tab>
   <Tab eventKey="knowledge" title="Knowledge">
   <div className="dashboard-board dashboard-board-two">
    <div className="dashboard-column">
      <div className="dashboard-column-heading"><p>At a glance</p><h2>Knowledge Overview</h2></div>
      <KnowledgeStructureSummary
       loading={loading}
       noteTypeChartData={noteTypeChartData}
       yearFilter={yearFilter}
       monthFilter={monthFilter}
       dayFilter={dayFilter}
       availableYears={availableYears}
       months={months}
       availableDays={availableDays}
       onYearChange={value=>{
        setYearFilter(value);
        setDayFilter("all");
       }}
       onMonthChange={value=>{
        setMonthFilter(value);
        setDayFilter("all");
       }}
       onDayChange={setDayFilter}
       onResetCurrent={resetToCurrentPeriod}
      />
      <DomainsSummary loading={loading} domains={domains} counts={domainRecordCounts}/>
    </div>

    <div className="dashboard-column">
      <div className="dashboard-column-heading"><p>Patterns over time</p><h2>Knowledge Activity</h2></div>
      <YearlyActivityChart data={yearlyActivityData} yearFilter={yearFilter}/>
      <MonthlyActivityChart data={monthlyActivityData} yearFilter={yearFilter} monthFilter={monthFilter}/>
     <ReviewInsightCards reviewInsights={reviewInsights} yearFilter={yearFilter} monthFilter={monthFilter}/>
    </div>

   </div>
   </Tab>
   <Tab eventKey="workflow" title="Workflow">
   <div className="dashboard-board dashboard-board-two">

    <div className="dashboard-column">
      <div className="dashboard-column-heading"><p>Build and connect</p><h2>Knowledge Workflow</h2></div>
      <RecentNotesPanel loading={loading} recentNotes={recentNotes} getTitle={getNoteTitle} getMeta={item=>`${getNotebookName(item)} · ${formatDate(getDateValue(item))}`} getLink={getNoteDetailLink}/>
      <ZettelClusterPanel kicker="Connected Knowledge" title="Zettel Clusters" clusters={connectedZettelClusters} loading={loading} emptyMessage="Connect zettels to reveal knowledge clusters here."/>
      <ReferencesPanel
       loading={loading}
       references={recentReferences}
       getTitle={getReferenceTitle}
       getMeta={item=>`${getReferenceMeta(item)} · ${formatDate(getDateValue(item))}`}
       getLink={item=>item?._id||item?.id?`/references/${item._id||item.id}`:"/references"}
      />
    </div>

    <div className="dashboard-column">
      <div className="dashboard-column-heading"><p>Items needing attention</p><h2>Review & Cleanup</h2></div>
      <StaleNotesPanel loading={loading} staleNotes={staleNotes} getTitle={getFleetingTitle} getMeta={item=>`Captured ${formatDate(item.createdAt)} · ${reviewIntervalDays}-day processing window`} getLink={()=>"/inbox"}/>
      <OrphanNotesPanel loading={loading} orphanNotes={orphanNotes} getTitle={getNoteTitle} getMeta={item=>`${getNoteTypeName(item)} · ${getNotebookName(item)}`} getLink={getConnectionCreateLink}/>
      <DashboardListPanel
       kicker="Metadata Cleanup"
       title="Untagged Notes"
       linkTo="/tags"
       linkLabel="Open tags"
       loading={loading}
       loadingMessage="Loading untagged notes..."
       emptyMessage="No untagged notes right now."
       items={untaggedNotes}
       icon={<Tags size={17} strokeWidth={2.2}/>}
       iconClassName="dashboard-list-icon-accent"
       getTitle={getNoteTitle}
       getMeta={item=>`${getNoteTypeName(item)} · ${formatDate(getDateValue(item))}`}
       getLink={getNoteDetailLink}
      />
      <DashboardSidebar
       loading={loading}
       favoriteNotes={favoriteNotes}
       getNoteTitle={getNoteTitle}
       getNotebookName={getNotebookName}
       getTagCount={getTagCount}
      />
    </div>

   </div>
   </Tab>
   </Tabs>

  </section>
 );
}

export default Dashboard;
