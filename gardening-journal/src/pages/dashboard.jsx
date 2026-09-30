// src/pages/dashboard.jsx
import {useEffect,useMemo,useState} from "react";
import CategorySpendCharts from "../components/dashboard/CategorySpendCharts.jsx";
import DashboardDrawers from "../components/dashboard/DashboardDrawers.jsx";
import DashboardCalendarCard from "../components/dashboard/DashboardCalendarCard.jsx";
import DashboardFilters from "../components/dashboard/DashboardFilters.jsx";
import DashboardHeader from "../components/dashboard/DashboardHeader.jsx";
import DashboardPeriodSummary from "../components/dashboard/DashboardPeriodSummary.jsx";
import DashboardSection from "../components/dashboard/DashboardSection.jsx";
import DashboardStats from "../components/dashboard/DashboardStats.jsx";
import EnvironmentMonitorPanel from "../components/dashboard/EnvironmentMonitorPanel.jsx";
import ExpiringItemsPanel from "../components/dashboard/ExpiringItemsPanel.jsx";
import HarvestPanel from "../components/dashboard/HarvestPanel.jsx";
import LowStockPanel from "../components/dashboard/LowStockPanel.jsx";
import PlantHealthPanel from "../components/dashboard/PlantHealthPanel.jsx";
import PlantLifecyclePanel from "../components/dashboard/PlantLifecyclePanel.jsx";
import RecentItemsPanel from "../components/dashboard/RecentItemsPanel.jsx";
import ShoppingListPanel from "../components/dashboard/ShoppingListPanel.jsx";
import {
 buildChartData,
 buildFilteredStats,
 collectDashboardYears,
 emptyDashboardData,
 filterDashboardRows,
 getDashboardPeriodSummary,
 getObjectId,
 normalizeDashboardData
} from "../utils/dashboard/dashboardData.js";
import {months} from "../utils/dashboard/dashboardFilters.js";
import "../styles/Dashboard.css";
import dashboardBg from "../images/hero_image.png";

function Dashboard({user}){
 const [yearFilter,setYearFilter]=useState("all");
 const [monthFilter,setMonthFilter]=useState("all");
 const [dashboardData,setDashboardData]=useState(()=>normalizeDashboardData(emptyDashboardData));
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const periodSummary=getDashboardPeriodSummary(yearFilter,monthFilter);

 const handleYearFilterChange=value=>{
  setYearFilter(value);
  if(value==="all")setMonthFilter("all");
 };

 useEffect(()=>{
  let ignore=false;

  const loadDashboard=async()=>{
   try{
    setLoading(true);
    setError("");

    const userId=getObjectId(user);
    const query=userId?`?userId=${encodeURIComponent(userId)}`:"";
    const res=await fetch(`/api/dashboard${query}`,{headers:{"Content-Type":"application/json"}});
    const data=await res.json().catch(()=>({}));

    if(!res.ok)throw new Error(data.message||"Failed to load dashboard data");
    if(!ignore)setDashboardData(normalizeDashboardData(data));
   }catch(err){
    if(!ignore){
     setError(err.message||"Failed to load dashboard data");
     setDashboardData(normalizeDashboardData(emptyDashboardData));
    }
   }finally{
    if(!ignore)setLoading(false);
   }
  };

  loadDashboard();

  return()=>{
   ignore=true;
  };
 },[user]);

 const {
  stats,
  lowStockItems,
  expiringItems,
  missingItems,
  categoryCosts,
  gardenTasks,
  recentJournalEntries,
  plantHealthItems,
  plantLifecycleItems,
  growingInstanceItems,
  harvestItems,
  environmentItems
 }=dashboardData;

 const availableYears=useMemo(()=>collectDashboardYears(
  categoryCosts,
  gardenTasks,
  recentJournalEntries,
  plantHealthItems,
  plantLifecycleItems,
  growingInstanceItems,
  harvestItems
 ),[categoryCosts,gardenTasks,recentJournalEntries,plantHealthItems,plantLifecycleItems,growingInstanceItems,harvestItems]);

 const filteredCategoryCosts=useMemo(()=>filterDashboardRows(categoryCosts,yearFilter,monthFilter),[categoryCosts,yearFilter,monthFilter]);
 const filteredGardenTasks=useMemo(()=>filterDashboardRows(gardenTasks,yearFilter,monthFilter),[gardenTasks,yearFilter,monthFilter]);
 const filteredExpiringItems=useMemo(()=>filterDashboardRows(expiringItems,yearFilter,monthFilter),[expiringItems,yearFilter,monthFilter]);
 const filteredJournalEntries=useMemo(()=>filterDashboardRows(recentJournalEntries,yearFilter,monthFilter),[recentJournalEntries,yearFilter,monthFilter]);
 const filteredPlantHealthItems=useMemo(()=>filterDashboardRows(plantHealthItems,yearFilter,monthFilter),[plantHealthItems,yearFilter,monthFilter]);
 const filteredPlantLifecycleItems=useMemo(()=>filterDashboardRows(plantLifecycleItems,yearFilter,monthFilter),[plantLifecycleItems,yearFilter,monthFilter]);
 const filteredGrowingInstanceItems=useMemo(()=>filterDashboardRows(growingInstanceItems,yearFilter,monthFilter),[growingInstanceItems,yearFilter,monthFilter]);
 const filteredHarvestItems=useMemo(()=>filterDashboardRows(harvestItems,yearFilter,monthFilter),[harvestItems,yearFilter,monthFilter]);
 const filteredLowStockItems=useMemo(()=>filterDashboardRows(lowStockItems,yearFilter,monthFilter),[lowStockItems,yearFilter,monthFilter]);

 const isDashboardFiltered=yearFilter!=="all"||monthFilter!=="all";
 const dashboardStats=useMemo(()=>isDashboardFiltered?buildFilteredStats(stats,{
  gardenTasks:filteredGardenTasks,
  harvestItems:filteredHarvestItems,
  plantHealthItems:filteredPlantHealthItems,
  plantLifecycleItems:filteredPlantLifecycleItems,
  growingInstanceItems:filteredGrowingInstanceItems
 }):stats,[stats,isDashboardFiltered,filteredGardenTasks,filteredHarvestItems,filteredPlantHealthItems,filteredPlantLifecycleItems,filteredGrowingInstanceItems]);

 const seedChartData=useMemo(()=>buildChartData(filteredCategoryCosts,"seed"),[filteredCategoryCosts]);
 const supplyChartData=useMemo(()=>buildChartData(filteredCategoryCosts,"supply"),[filteredCategoryCosts]);
 const upcomingItems=filteredGardenTasks.length?filteredGardenTasks:filteredExpiringItems;
 const calendarEvents=useMemo(()=>{
  const toDate=value=>{
   if(!value)return null;
   const date=new Date(value);
   return Number.isNaN(date.getTime()) ? null : date;
  };

  const makeEvent=(item,type,title,dateValue)=>{
   const start=toDate(dateValue);
   if(!start)return null;

   const end=new Date(start);
   end.setHours(end.getHours()+1);

   return {
    id:`${type}-${item._id||item.id||title}-${start.toISOString()}`,
    title,
    start,
    end,
    allDay:true,
    resource:{type,item}
   };
  };

  return [
   ...filteredGardenTasks.map(item=>makeEvent(item,"task",item.title||item.name||"Garden task",item.dueDate||item.taskDate||item.date)),
   ...filteredHarvestItems.map(item=>makeEvent(item,"harvest",item.crop||item.name||"Harvest",item.harvestDate||item.date)),
   ...filteredJournalEntries.map(item=>makeEvent(item,"journal",item.title||item.name||"Journal entry",item.entryDate||item.date||item.createdAt)),
   ...filteredPlantHealthItems.map(item=>makeEvent(item,"health",item.name||item.issue||"Plant issue",item.date||item.createdAt)),
   ...filteredPlantLifecycleItems.map(item=>makeEvent(item,"lifecycle",item.name||"Ended plant",item.date||item.plantedDate||item.createdAt))
  ].filter(Boolean);
 },[filteredGardenTasks,filteredHarvestItems,filteredJournalEntries,filteredPlantHealthItems,filteredPlantLifecycleItems]);

 return(
  <section className="dashboard" style={{"--dashboard-bg":`url(${dashboardBg})`}}>
   <DashboardHeader/>

   <DashboardPeriodSummary
    summary={periodSummary}
    yearFilter={yearFilter}
    monthFilter={monthFilter}
    onClear={()=>{
     setYearFilter("all");
     setMonthFilter("all");
    }}
   />

   {(loading||error)&&(
    <div className={`dashboard-status${error?" dashboard-status-error":""}`}>
     {loading?"Loading dashboard data...":error}
    </div>
   )}

   <div className="dashboard-grid">
    <DashboardDrawers/>

   <section className="dashboard-main">
     <DashboardStats stats={dashboardStats}/>

     <section className="dashboard-workbench">
      <div className="dashboard-primary-flow">
       <DashboardCalendarCard events={calendarEvents}/>
       <EnvironmentMonitorPanel items={environmentItems}/>

       <div className="dashboard-paired-flow">
        <RecentItemsPanel journalEntries={filteredJournalEntries}/>
        <HarvestPanel items={filteredHarvestItems}/>
       </div>

       <div className="dashboard-paired-flow">
        <LowStockPanel lowStockItems={filteredLowStockItems}/>
        <ShoppingListPanel missingItems={missingItems}/>
       </div>

       <DashboardSection className="dashboard-section-charts" kicker="Garden Spending" title="Cost by Garden Category">
        <DashboardFilters
         months={months}
         availableYears={availableYears}
         yearFilter={yearFilter}
         monthFilter={monthFilter}
         onYearChange={handleYearFilterChange}
         onMonthChange={setMonthFilter}
        />
        <CategorySpendCharts seedChartData={seedChartData} supplyChartData={supplyChartData}/>
       </DashboardSection>
      </div>

      <aside className="dashboard-attention-flow" aria-label="Garden attention queue">
       <ExpiringItemsPanel expiringItems={upcomingItems}/>
       <PlantHealthPanel items={filteredPlantHealthItems}/>
       <PlantLifecyclePanel items={filteredPlantLifecycleItems}/>
      </aside>
     </section>
    </section>
   </div>
  </section>
 );
}

export default Dashboard;
