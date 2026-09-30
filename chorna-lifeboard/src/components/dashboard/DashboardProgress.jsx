// src/components/dashboard/DashboardProgress.jsx
import {useMemo,useState} from "react";

function DashboardProgress({
 categoryProgress=[],
 activeGoals=[],
 activeHabits=[],
 habitLogs=[],
 getGroupName,
 getItemDateRaw
}){

 const [yearFilter,setYearFilter]=useState("all");
 const [monthFilter,setMonthFilter]=useState("all");

 const derivedCategoryProgress=useMemo(()=>{
  if(categoryProgress.length)return categoryProgress;

  const habitLogMap=habitLogs.reduce((map,item)=>{
   const key=String(item?.habit?._id||item?.habit||"");
   if(!key)return map;
   if(!map[key])map[key]={total:0,completed:0};
   map[key].total+=1;
   if(item.completed)map[key].completed+=1;
   return map;
  },{});

  const goalRows=activeGoals.map(item=>({
   date:getItemDateRaw(item),
   type:"goal",
   category:getGroupName(item),
   progress:Number(item?.progress||0)
  }));

  const habitRows=activeHabits.map(item=>{
   const key=String(item?._id||item?.id||"");
   const log=habitLogMap[key];
   const progress=log?.total?Math.round((log.completed/log.total)*100):0;

   return{
    date:getItemDateRaw(item),
    type:"habit",
    category:getGroupName(item),
    progress
   };
  });

  return [...goalRows,...habitRows];
 },[categoryProgress,activeGoals,activeHabits,habitLogs,getGroupName,getItemDateRaw]);

 const availableYears=useMemo(()=>{
  return [...new Set(
   derivedCategoryProgress
    .map(item=>item?.date?new Date(item.date).getFullYear():null)
    .filter(Boolean)
  )].sort((a,b)=>b-a);
 },[derivedCategoryProgress]);

 const months=[
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

 const filteredCategoryProgress=useMemo(()=>{
  return derivedCategoryProgress.filter(item=>{
   if(!item?.date)return true;

   const itemDate=new Date(item.date);
   const itemYear=String(itemDate.getFullYear());
   const itemMonth=String(itemDate.getMonth());
   const matchYear=yearFilter==="all"||itemYear===yearFilter;
   const matchMonth=monthFilter==="all"||itemMonth===monthFilter;

   return matchYear&&matchMonth;
  });
 },[derivedCategoryProgress,yearFilter,monthFilter]);

 const buildChartData=type=>{
  const totals={};
  const counts={};

  filteredCategoryProgress
   .filter(item=>item?.type===type)
   .forEach(item=>{
    const key=item.category||"Uncategorized";
    totals[key]=(totals[key]||0)+Number(item.progress||item.value||0);
    counts[key]=(counts[key]||0)+1;
   });

  const rows=Object.entries(totals)
   .map(([category,progress])=>({category,progress:counts[category]?progress/counts[category]:progress}))
   .sort((a,b)=>b.progress-a.progress);

  const max=rows.length?rows[0].progress:0;

  return rows.map(row=>({
   ...row,
   width:max?`${(row.progress/max)*100}%`:"0%"
  }));
 };

 const goalChartData=useMemo(()=>buildChartData("goal"),[filteredCategoryProgress]);
 const habitChartData=useMemo(()=>buildChartData("habit"),[filteredCategoryProgress]);

 return(
  <section className="dashboard-section dashboard-section-wide dashboard-section-charts">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Life Progress</p>
     <h2 className="dashboard-section-title">Progress by Category</h2>
    </div>

    <div className="dashboard-filters">
     <label className="dashboard-filter">
      <span className="dashboard-filter-label">Year</span>
      <select value={yearFilter} onChange={(e)=>setYearFilter(e.target.value)} className="dashboard-filter-select">
       <option value="all">All</option>
       {availableYears.map(year=>(
        <option key={year} value={String(year)}>{year}</option>
       ))}
      </select>
     </label>

     <label className="dashboard-filter">
      <span className="dashboard-filter-label">Month</span>
      <select value={monthFilter} onChange={(e)=>setMonthFilter(e.target.value)} className="dashboard-filter-select">
       <option value="all">All</option>
       {months.map(month=>(
        <option key={month.value} value={month.value}>{month.label}</option>
       ))}
      </select>
     </label>
    </div>
   </div>

   <div className="dashboard-chart-grid">

    <div className="dashboard-chart-card">
     <div className="dashboard-chart-head">
      <h3 className="dashboard-chart-title">Goal Progress</h3>
     </div>

     <div className="dashboard-chart-body">
      {goalChartData.length?goalChartData.map(item=>(
       <div key={item.category} className="dashboard-bar-row">
        <div className="dashboard-bar-meta">
         <span className="dashboard-bar-label">{item.category}</span>
         <span className="dashboard-bar-value">{item.progress.toFixed(0)}%</span>
        </div>

        <div className="dashboard-bar-track">
         <div className="dashboard-bar-fill dashboard-bar-fill-pantry" style={{width:item.width}}/>
        </div>
       </div>
      )):(
       <div className="dashboard-empty">No goal progress data for this period.</div>
      )}
     </div>
    </div>

    <div className="dashboard-chart-card">
     <div className="dashboard-chart-head">
      <h3 className="dashboard-chart-title">Habit Progress</h3>
     </div>

     <div className="dashboard-chart-body">
      {habitChartData.length?habitChartData.map(item=>(
       <div key={item.category} className="dashboard-bar-row">
        <div className="dashboard-bar-meta">
         <span className="dashboard-bar-label">{item.category}</span>
         <span className="dashboard-bar-value">{item.progress.toFixed(0)}%</span>
        </div>

        <div className="dashboard-bar-track">
         <div className="dashboard-bar-fill dashboard-bar-fill-household" style={{width:item.width}}/>
        </div>
       </div>
      )):(
       <div className="dashboard-empty">No habit progress data for this period.</div>
      )}
     </div>
    </div>

   </div>
  </section>
 );
}

export default DashboardProgress;