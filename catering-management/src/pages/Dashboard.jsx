// src/pages/Dashboard.jsx
import {useCallback,useEffect,useMemo,useState} from "react";
import {CalendarDays,ChefHat,ClipboardList,PackageCheck} from "lucide-react";
import DashboardStats from "../components/dashboard/DashboardStats.jsx";
import DashboardSection from "../components/dashboard/DashboardSection.jsx";
import DashboardFilters from "../components/dashboard/DashboardFilters.jsx";
import CategorySpendCharts from "../components/dashboard/CategorySpendCharts.jsx";
import LowStockPanel from "../components/dashboard/LowStockPanel.jsx";
import ExpiringItemsPanel from "../components/dashboard/ExpiringItemsPanel.jsx";
import RecentItemsPanel from "../components/dashboard/RecentItemsPanel.jsx";
import ShoppingListPanel from "../components/dashboard/ShoppingListPanel.jsx";
import QuickActionsPanel from "../components/dashboard/QuickActionsPanel.jsx";
import "../styles/Dashboard.css";

function Dashboard({
 stats:initialStats=[],
 lowStockItems:initialLowStockItems=[],
 expiringItems:initialExpiringItems=[],
 recentItems:initialRecentItems=[],
 missingItems:initialMissingItems=[],
 categoryCosts:initialCategoryCosts=[]
}){

 const [yearFilter,setYearFilter]=useState("all");
 const [monthFilter,setMonthFilter]=useState("all");
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState("");
 const [dashboardData,setDashboardData]=useState({
  stats:initialStats,
  summary:{},
  lowStockItems:initialLowStockItems,
  expiringItems:initialExpiringItems,
  recentItems:initialRecentItems,
  missingItems:initialMissingItems,
  categoryCosts:initialCategoryCosts
 });

 useEffect(()=>{
  let ignore=false;

  const loadDashboard=async()=>{
   setLoading(true);
   setError("");

   try{
    const res=await fetch("/api/dashboard?period=month",{headers:{"Content-Type":"application/json"}});
    const data=await res.json().catch(()=>null);

    if(!res.ok)throw new Error(data?.message||"Failed to load dashboard");
    if(ignore)return;

    setDashboardData({
     stats:Array.isArray(data?.stats)?data.stats:[],
     summary:data?.summary&&typeof data.summary==="object"?data.summary:{},
     lowStockItems:Array.isArray(data?.lowStockItems)?data.lowStockItems:[],
     expiringItems:Array.isArray(data?.expiringItems)?data.expiringItems:[],
     recentItems:Array.isArray(data?.recentItems)?data.recentItems:[],
     missingItems:Array.isArray(data?.missingItems)?data.missingItems:[],
     categoryCosts:Array.isArray(data?.categoryCosts)?data.categoryCosts:[]
    });
   }catch(err){
    console.error("Dashboard load error",err);
    if(!ignore)setError(err.message||"Dashboard failed to load");
   }finally{
    if(!ignore)setLoading(false);
   }
  };

  loadDashboard();

  return()=>{
   ignore=true;
  };
 },[]);

 const {stats,summary,lowStockItems,expiringItems,recentItems,missingItems,categoryCosts}=dashboardData;

 const availableYears=useMemo(()=>{
  const years=[...new Set(
   categoryCosts
    .map((item)=>item?.date?new Date(item.date).getFullYear():null)
    .filter(Boolean)
  )].sort((a,b)=>b-a);
  return years;
 },[categoryCosts]);

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

 const filteredCategoryCosts=useMemo(()=>{
  return categoryCosts.filter((item)=>{
   if(!item?.date)return false;
   const itemDate=new Date(item.date);
   const itemYear=String(itemDate.getFullYear());
   const itemMonth=String(itemDate.getMonth());
   const matchYear=yearFilter==="all"||itemYear===yearFilter;
   const matchMonth=monthFilter==="all"||itemMonth===monthFilter;
   return matchYear&&matchMonth;
  });
 },[categoryCosts,yearFilter,monthFilter]);

 const buildChartData=useCallback((type)=>{
  const totals={};

  filteredCategoryCosts
   .filter((item)=>item?.type===type)
   .forEach((item)=>{
    const key=item.category||"Uncategorized";
    totals[key]=(totals[key]||0)+Number(item.cost||0);
   });

  const rows=Object.entries(totals)
   .map(([category,cost])=>({category,cost}))
   .sort((a,b)=>b.cost-a.cost);

  const max=rows.length?rows[0].cost:0;

  return rows.map((row)=>({
   ...row,
   width:max?`${(row.cost/max)*100}%`:"0%"
  }));
 },[filteredCategoryCosts]);

 const inventoryChartData=useMemo(()=>buildChartData("inventory"),[buildChartData]);
 const orderChartData=useMemo(()=>buildChartData("orders"),[buildChartData]);
 const operationsStats=[
  {label:"Events",value:summary?.eventCount??0},
  {label:"Orders",value:summary?.orderCount??0},
  {label:"Menus",value:summary?.activeMenuCount??0},
  ...stats
 ];

 return(
  <section className="dashboard">

   <header className="dashboard-hero">
    <div className="dashboard-hero-copy">
     <p className="dashboard-eyebrow">Catering Command Center</p>
     <h1 className="dashboard-view-title">Production, inventory, and order flow</h1>
     <p className="dashboard-text">
      Monitor today's catering work across client orders, upcoming events, kitchen inventory, menu readiness, and restock risk.
     </p>
    </div>

    <div className="dashboard-hero-metrics" aria-label="Operational highlights">
     <div className="dashboard-hero-metric">
      <CalendarDays size={20}/>
      <span>Events</span>
      <strong>{summary?.eventCount??0}</strong>
     </div>
     <div className="dashboard-hero-metric">
      <ClipboardList size={20}/>
      <span>Orders</span>
      <strong>{summary?.orderCount??0}</strong>
     </div>
     <div className="dashboard-hero-metric">
      <PackageCheck size={20}/>
      <span>Low Stock</span>
      <strong>{summary?.lowStockCount??lowStockItems.length}</strong>
     </div>
     <div className="dashboard-hero-metric">
      <ChefHat size={20}/>
      <span>Active Menus</span>
      <strong>{summary?.activeMenuCount??0}</strong>
     </div>
    </div>
   </header>

   {error?(
    <div className="dashboard-status dashboard-status-error">{error}</div>
   ):null}

   {loading&&!operationsStats.length?(
    <div className="dashboard-status">Loading catering dashboard...</div>
   ):null}

   <DashboardStats stats={operationsStats}/>

   <div className="dashboard-grid">

    <section className="dashboard-main">

     <DashboardSection
      className="dashboard-section-wide dashboard-section-charts"
      kicker="Financial Pulse"
      title="Inventory value and order revenue"
     >
      <DashboardFilters
       months={months}
       availableYears={availableYears}
       yearFilter={yearFilter}
       monthFilter={monthFilter}
       onYearChange={setYearFilter}
       onMonthChange={setMonthFilter}
      />

      <CategorySpendCharts
       inventoryChartData={inventoryChartData}
       orderChartData={orderChartData}
      />
     </DashboardSection>

     <LowStockPanel lowStockItems={lowStockItems}/>
     <ExpiringItemsPanel expiringItems={expiringItems}/>
     <RecentItemsPanel recentItems={recentItems}/>
     <ShoppingListPanel missingItems={missingItems}/>

    </section>

    <aside className="dashboard-sidebar">
     <QuickActionsPanel/>
    </aside>

   </div>

  </section>
 );
}

export default Dashboard;
