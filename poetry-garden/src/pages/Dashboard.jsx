import {useCallback,useEffect,useMemo,useState} from "react";
import {Link} from "react-router-dom";
import DashboardStats from "../components/dashboard/DashboardStats";
import PoetryDraftsPanel from "../components/dashboard/LowStockPanel";
import PoetryDatesPanel from "../components/dashboard/ExpiringItemsPanel";
import NewPoemsPanel from "../components/dashboard/RecentItemsPanel";
import WritingTasksPanel from "../components/dashboard/ShoppingListPanel";
import DashboardHeader from "../components/dashboard/DashboardHeader.jsx";
import DashboardQuickActions from "../components/dashboard/DashboardQuickActions.jsx";
import DashboardCalendarCard from "../components/dashboard/DashboardCalendarCard";
import PoetryNewPoemsLineChart from "../components/dashboard/PoetryNewPoemsLineChart.jsx";
import "../styles/Dashboard.css";

const getPoemDashboardDate=poem=>{
 const rawDate=poem?.copyright||poem?.writtenAt||poem?.completedAt||poem?.publishedAt||poem?.createdAt||poem?.dateCreated||poem?.created_at||poem?.addedAt;
 const date=new Date(rawDate);
 return Number.isNaN(date.getTime())?null:date;
};

const getPoemCreatedDate=poem=>{
 const rawDate=poem?.createdAt||poem?.dateCreated||poem?.created_at||poem?.addedAt;
 const date=new Date(rawDate);
 return Number.isNaN(date.getTime())?null:date;
};

const getPoemFeaturedDate=poem=>{
 const date=new Date(poem?.featuredAt);
 return Number.isNaN(date.getTime())?null:date;
};

const getDashboardItemDate=item=>{
 const rawDate=item?.copyright||item?.writtenAt||item?.completedAt||item?.publishedAt||item?.dueDate||item?.publishDate||item?.publicationDate||item?.date||item?.scheduledFor||item?.sendAt||item?.reminderAt||item?.createdAt||item?.dateCreated||item?.created_at;
 const date=new Date(rawDate);
 return Number.isNaN(date.getTime())?null:date;
};

const getRangeLabel=(year,month)=>{
 if(year==="all"&&month==="all")return "All months, all years";
 if(year==="all")return `${new Intl.DateTimeFormat("en-US",{month:"long"}).format(new Date(2026,Number(month),1))}, all years`;
 if(month==="all")return `All months, ${year}`;

 return new Intl.DateTimeFormat("en-US",{
  month:"long",
  year:"numeric"
 }).format(new Date(Number(year),Number(month),1));
};

const startOfDay=date=>new Date(date.getFullYear(),date.getMonth(),date.getDate());

const startOfWeek=date=>{
 const start=startOfDay(date);
 start.setDate(start.getDate()-start.getDay());
 return start;
};

const endOfWeek=date=>{
 const end=startOfWeek(date);
 end.setDate(end.getDate()+6);
 end.setHours(23,59,59,999);
 return end;
};

const isDateInRange=(date,start,end)=>date>=start&&date<=end;

const formatDashboardDate=date=>new Intl.DateTimeFormat("en-US",{
 month:"long",
 day:"numeric",
 year:"numeric"
}).format(date);

const formatWeekRange=date=>{
 const start=startOfWeek(date);
 const end=endOfWeek(date);
 return `${formatDashboardDate(start)} - ${formatDashboardDate(end)}`;
};

const getViewRangeLabel=(view,year,month,selectedDate)=>{
 if(view==="daily")return formatDashboardDate(selectedDate);
 if(view==="weekly")return formatWeekRange(selectedDate);
 if(view==="yearly")return year==="all"?"All years":`${year}`;
 return getRangeLabel(year,month);
};

const isDateInDashboardView=(date,view,year,month,selectedDate)=>{
 if(!date)return false;

 if(view==="daily"){
  return startOfDay(date).getTime()===startOfDay(selectedDate).getTime();
 }

 if(view==="weekly"){
  return isDateInRange(date,startOfWeek(selectedDate),endOfWeek(selectedDate));
 }

 if(view==="yearly"){
  return year==="all"||date.getFullYear()===Number(year);
 }

 const yearMatches=year==="all"||date.getFullYear()===Number(year);
 const monthMatches=month==="all"||date.getMonth()===Number(month);
 return yearMatches&&monthMatches;
};

const isPoemInView=(poem,view,year,month,selectedDate)=>{
 return isDateInDashboardView(getPoemDashboardDate(poem),view,year,month,selectedDate);
};

const isPoemFeaturedInView=(poem,view,year,month,selectedDate)=>{
 return Boolean(poem?.isFeatured)&&isDateInDashboardView(getPoemFeaturedDate(poem),view,year,month,selectedDate);
};

const isPoemCreatedInView=(poem,view,year,month,selectedDate)=>{
 return isDateInDashboardView(getPoemCreatedDate(poem),view,year,month,selectedDate);
};

const sortPoemsByAddedDateDesc=(a,b)=>(getPoemDashboardDate(b)?.getTime()||0)-(getPoemDashboardDate(a)?.getTime()||0);
const sortPoemsByCreatedDateDesc=(a,b)=>(getPoemCreatedDate(b)?.getTime()||0)-(getPoemCreatedDate(a)?.getTime()||0);
const sortByDashboardDateDesc=(a,b)=>(getDashboardItemDate(b)?.getTime()||0)-(getDashboardItemDate(a)?.getTime()||0);

const isDraftItem=item=>{
 const status=String(item?.status||item?.stage||item?.draftStatus||item?.publicationStatus||"").trim().toLowerCase();
 return Boolean(item?.isDraft)||["draft","revision","revising","in-progress","incomplete","needs-work","needs work"].includes(status);
};

const poemStatusLabels={
 draft:"Draft",
 "in-progress":"In Progress",
 incomplete:"Incomplete",
 revision:"Revision",
 finished:"Finished",
 archived:"Archived"
};

const poemStatusOrder=["draft","in-progress","incomplete","revision","finished","archived"];

const normalizePoemStatus=status=>{
 const value=String(status||"").trim().toLowerCase();
 return value==="complete"?"finished":value||"finished";
};

const statusAllowsPublishing=status=>{
 const normalized=normalizePoemStatus(status);
 return normalized!=="draft"&&normalized!=="incomplete";
};

const getPeriodLabel=view=>{
 if(view==="daily")return "Today";
 if(view==="weekly")return "This Week";
 if(view==="yearly")return "Selected Year";
 return "Selected Month";
};

const addQuery=(path,params)=>{
 const query=new URLSearchParams(params).toString();
 return query?`${path}?${query}`:path;
};

function Dashboard({stats,lowStockItems,expiringItems,recentItems,missingItems}){

 const today=new Date();
 const currentYear=today.getFullYear();
 const currentMonth=today.getMonth();
 const [activeView,setActiveView]=useState("monthly");
 const [chartYear,setChartYear]=useState(currentYear);
 const [chartMonth,setChartMonth]=useState(currentMonth);
 const [selectedDate,setSelectedDate]=useState(today);
 const [poems,setPoems]=useState([]);
 const [poemsError,setPoemsError]=useState("");

 useEffect(()=>{
  let ignore=false;

  const loadPoems=async()=>{
   try{
    setPoemsError("");
    const res=await fetch("/api/poems?sort=createdAt&order=desc");
    const data=await res.json();

    if(!res.ok)throw new Error(data?.message||"Failed to load poems");
    if(!ignore)setPoems(Array.isArray(data)?data:[]);
   }catch(error){
    if(!ignore){
     setPoems([]);
     setPoemsError(error.message);
    }
   }
  };

  loadPoems();

  return()=>{
   ignore=true;
 };
 },[]);

 const setCurrentRangeForView=view=>{
  const now=new Date();
  setSelectedDate(now);
  setChartYear(now.getFullYear());
  setChartMonth(view==="yearly"?"all":now.getMonth());
 };

 const handleViewChange=view=>{
  setActiveView(view);
  setCurrentRangeForView(view);
 };

 const handleResetDefault=()=>{
  setActiveView("monthly");
  setCurrentRangeForView("monthly");
 };

 const handleCurrentRange=()=>{
  setCurrentRangeForView(activeView);
 };

 const handleCalendarDateSelect=date=>{
  const nextDate=new Date(date);
  setActiveView("daily");
  setSelectedDate(nextDate);
  setChartYear(nextDate.getFullYear());
  setChartMonth(nextDate.getMonth());
 };

 const handleCalendarMonthChange=date=>{
  const nextDate=new Date(date);
  setActiveView("monthly");
  setSelectedDate(nextDate);
  setChartYear(nextDate.getFullYear());
  setChartMonth(nextDate.getMonth());
 };

 const handleYearChange=year=>{
  setChartYear(year);
  if(year!=="all"&&chartMonth!=="all"){
   const nextDate=new Date(Number(year),Number(chartMonth),1);
   const now=new Date();
   if(nextDate.getFullYear()===now.getFullYear()&&nextDate.getMonth()===now.getMonth()){
    setSelectedDate(now);
   }else{
    setSelectedDate(nextDate);
   }
  }
 };

 const handleMonthChange=month=>{
  setChartMonth(month);
  if(chartYear!=="all"&&month!=="all"){
   const nextDate=new Date(Number(chartYear),Number(month),1);
   const now=new Date();
   if(nextDate.getFullYear()===now.getFullYear()&&nextDate.getMonth()===now.getMonth()){
    setSelectedDate(now);
   }else{
    setSelectedDate(nextDate);
   }
  }
 };

 const dashboardStats=useMemo(()=>{
  if(Array.isArray(stats)&&stats.length)return stats;

  const periodPoems=poems.filter(poem=>isPoemInView(poem,activeView,chartYear,chartMonth,selectedDate));
  const periodNewPoems=poems.filter(poem=>isPoemCreatedInView(poem,activeView,chartYear,chartMonth,selectedDate));
  const periodFeaturedPoems=poems.filter(poem=>statusAllowsPublishing(poem?.status)&&isPoemFeaturedInView(poem,activeView,chartYear,chartMonth,selectedDate));
  const periodPublishedPoems=periodPoems.filter(poem=>poem?.isPublished&&statusAllowsPublishing(poem?.status));
  const featuredPoems=poems.filter(poem=>poem?.isFeatured&&statusAllowsPublishing(poem?.status));
  const publishedPoems=poems.filter(poem=>poem?.isPublished&&statusAllowsPublishing(poem?.status));
  const periodLabel=getPeriodLabel(activeView);
  const statusBadges=poemStatusOrder
   .map(status=>({
    key:status,
    label:poemStatusLabels[status],
    value:poems.filter(poem=>normalizePoemStatus(poem?.status)===status).length,
    variant:status,
    to:addQuery("/poems",{
     status,
     view:activeView,
     year:String(chartYear),
     month:String(chartMonth),
     date:selectedDate.toISOString().split("T")[0]
    })
   }));
  const activeDraftCount=poems.filter(isDraftItem).length;

  return [
   {
    key:"new-poems",
    label:`New Poems ${periodLabel}`,
    value:periodNewPoems.length,
    summary:`${periodNewPoems.length} poem${periodNewPoems.length===1?"":"s"} added in ${periodLabel.toLowerCase()}`,
    to:addQuery("/workflow/recent-poems",{
     view:activeView,
     year:String(chartYear),
     month:String(chartMonth),
     date:selectedDate.toISOString().split("T")[0]
    })
   },
   {
    key:"poem-status",
    label:"Poem Status Archive",
    value:poems.length,
    summary:`${activeDraftCount} draft, in-progress, incomplete, or revision item${activeDraftCount===1?"":"s"} across the archive`,
    badges:statusBadges,
    showZeroBadges:true,
    to:addQuery("/workflow/drafts",{
     view:"all"
    })
   },
   {
    key:"featured",
    label:"Featured Poems",
    value:featuredPoems.length,
    summary:`${periodFeaturedPoems.length} featured in ${periodLabel.toLowerCase()}`,
    to:"/poems/featured"
   },
   {
    key:"published",
    label:"Published Poems",
    value:publishedPoems.length,
    summary:`${periodPublishedPoems.length} published in ${periodLabel.toLowerCase()}`,
    to:"/poems/published"
   }
  ];
 },[poems,stats,activeView,chartYear,chartMonth,selectedDate]);

 const selectedPeriodPoems=useMemo(()=>{
 return poems
   .filter(poem=>isPoemInView(poem,activeView,chartYear,chartMonth,selectedDate))
   .sort(sortPoemsByAddedDateDesc);
 },[poems,activeView,chartYear,chartMonth,selectedDate]);

 const filterDashboardItems=useCallback(items=>{
  if(!Array.isArray(items)||!items.length)return [];
  return items
   .filter(item=>isPoemInView(item,activeView,chartYear,chartMonth,selectedDate))
   .sort(sortByDashboardDateDesc);
 },[activeView,chartYear,chartMonth,selectedDate]);

 const dashboardDraftItems=useMemo(()=>{
  const provided=filterDashboardItems(lowStockItems);
 if(provided.length)return provided;

  return selectedPeriodPoems
   .filter(isDraftItem)
   .slice(0,6);
 },[lowStockItems,selectedPeriodPoems,filterDashboardItems]);

 const dashboardUpcomingItems=useMemo(()=>{
  const provided=filterDashboardItems(expiringItems);
  return provided.slice(0,6);
 },[expiringItems,filterDashboardItems]);

 const availableYears=useMemo(()=>{
  const years=new Set([currentYear,currentYear-1]);

  if(chartYear!=="all"){
   years.add(Number(chartYear));
   years.add(Number(chartYear)-1);
  }

  poems.forEach(poem=>{
   const date=getPoemDashboardDate(poem);
   const createdDate=getPoemCreatedDate(poem);
   const featuredDate=getPoemFeaturedDate(poem);
   [date,createdDate,featuredDate].forEach(itemDate=>{
    if(!itemDate)return;
    years.add(itemDate.getFullYear());
    years.add(itemDate.getFullYear()-1);
   });
  });

  return [...years].sort((a,b)=>b-a);
 },[poems,currentYear,chartYear]);

 const dashboardRecentItems=useMemo(()=>{
  const provided=filterDashboardItems(recentItems);
  if(provided.length)return provided.slice(0,6);

  return poems
   .filter(poem=>isPoemCreatedInView(poem,activeView,chartYear,chartMonth,selectedDate))
   .sort(sortPoemsByCreatedDateDesc)
   .slice(0,6);
 },[recentItems,poems,activeView,chartYear,chartMonth,selectedDate,filterDashboardItems]);

const dashboardTaskItems=useMemo(()=>{
  const provided=filterDashboardItems(missingItems);
  return provided.slice(0,8);
 },[missingItems,filterDashboardItems]);

 const workflowQuery=useMemo(()=>({
  view:activeView,
  year:String(chartYear),
  month:String(chartMonth),
  date:selectedDate.toISOString().split("T")[0]
 }),[activeView,chartYear,chartMonth,selectedDate]);

 const workflowActions=useMemo(()=>[
  {
   key:"publications",
   label:"Publication Planning",
   title:"Plan upcoming publications",
   detail:dashboardUpcomingItems[0]?.title||dashboardUpcomingItems[0]?.name||"Open planned publication work",
   to:addQuery("/publications/planned",workflowQuery)
  },
  {
   key:"drafts",
   label:"Draft Review",
   title:"Work the next draft",
   detail:dashboardDraftItems[0]?.title||dashboardDraftItems[0]?.name||"Open drafts needing work",
   to:addQuery("/workflow/drafts",workflowQuery)
  },
  {
   key:"recent",
   label:"Recently Added",
   title:"Review new poems",
   detail:dashboardRecentItems[0]?.title||dashboardRecentItems[0]?.name||"Open recently added poems",
   to:addQuery("/workflow/recent-poems",workflowQuery)
  },
  {
   key:"followups",
   label:"Writing Follow-Ups",
   title:"Handle open follow-ups",
   detail:dashboardTaskItems[0]?.title||dashboardTaskItems[0]?.name||"Open writing task list",
   to:addQuery("/workflow/follow-ups",workflowQuery)
  }
 ],[dashboardDraftItems,dashboardUpcomingItems,dashboardRecentItems,dashboardTaskItems,workflowQuery]);

 const rangeLabel=useMemo(()=>{
  return getViewRangeLabel(activeView,chartYear,chartMonth,selectedDate);
 },[activeView,chartYear,chartMonth,selectedDate]);

 return(
  <section className="dashboard">

   <DashboardHeader
    summary={{period:activeView}}
    dashboard={{range:{period:activeView}}}
    activeView={activeView}
    preferredView="monthly"
    viewOverridden={activeView!=="monthly"}
    rangeLabel={rangeLabel}
    onViewChange={handleViewChange}
    onResetDefault={handleResetDefault}
   />

   <section className="dashboard-insights-row">
    <DashboardCalendarCard
     year={chartYear}
     month={chartMonth}
     selectedDate={selectedDate}
     poems={poems}
     poemDateAccessor={getPoemDashboardDate}
     newPoemDateAccessor={getPoemCreatedDate}
     onDateSelect={handleCalendarDateSelect}
     onMonthChange={handleCalendarMonthChange}
     onCurrentMonth={()=>setCurrentRangeForView("monthly")}
    />
    <PoetryNewPoemsLineChart
     poems={poems}
     activeView={activeView}
     year={chartYear}
     month={chartMonth}
     selectedDate={selectedDate}
     dateAccessor={getPoemCreatedDate}
     availableYears={availableYears}
     onCurrentRange={handleCurrentRange}
     onYearChange={handleYearChange}
     onMonthChange={handleMonthChange}
    />
   </section>

   <div className="dashboard-grid">

    <DashboardStats stats={dashboardStats}/>

    <section className="dashboard-main">

     <section className="dashboard-section dashboard-section-wide dashboard-section-charts">
      <div className="dashboard-section-head">
       <div>
        <p className="dashboard-section-kicker">Writing Desk</p>
        <h2 className="dashboard-section-title">Poetry Workflow</h2>
       </div>
      </div>

      <div className="dashboard-workflow-actions" aria-label={`Poetry workflow for ${rangeLabel}`}>
       {workflowActions.map(item=>(
        <Link key={item.key} to={item.to} className="dashboard-workflow-action-card">
         <span className="dashboard-workflow-label">{item.label}</span>
         <strong className="dashboard-workflow-action-title">{item.title}</strong>
         <span className="dashboard-workflow-detail">{item.detail}</span>
        </Link>
       ))}
      </div>
     </section>

     <WritingTasksPanel missingItems={dashboardTaskItems}/>
     <PoetryDraftsPanel lowStockItems={dashboardDraftItems}/>
     <PoetryDatesPanel expiringItems={dashboardUpcomingItems}/>
     {poemsError&&(
      <section className="dashboard-section dashboard-section-wide">
       <p className="dashboard-section-kicker">Poems</p>
       <h2 className="dashboard-section-title">Poem Data Unavailable</h2>
       <p className="dashboard-text">{poemsError}</p>
      </section>
     )}

     <NewPoemsPanel recentItems={dashboardRecentItems}/>

    </section>

    <DashboardQuickActions/>

   </div>

  </section>
 );
}

export default Dashboard;
