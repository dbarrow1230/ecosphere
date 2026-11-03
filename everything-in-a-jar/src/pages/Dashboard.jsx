import {useEffect,useMemo,useState} from "react";
import DashboardStats from "../components/dashboard/DashboardStats";
import DashboardFilters from "../components/dashboard/DashboardFilters";
import CategorySpendCharts from "../components/dashboard/CategorySpendCharts";
import LowStockPanel from "../components/dashboard/LowStockPanel";
import ExpiringItemsPanel from "../components/dashboard/ExpiringItemsPanel";
import RecentItemsPanel from "../components/dashboard/RecentItemsPanel";
import ShoppingListPanel from "../components/dashboard/ShoppingListPanel";
import QuickActionsPanel from "../components/dashboard/QuickActionsPanel";
import DashboardCalendarCard from "../components/dashboard/DashboardCalendarCard";
import YearlySpendingChart from "../components/dashboard/YearlySpendingChart";
import MonthlySpendingChart from "../components/dashboard/MonthlySpendingChart";
import BudgetInsightCards from "../components/dashboard/BudgetInsightCards";
import {months,getAvailableYears,filterCategoryCosts} from "../utils/dashboard/dashboardFilters";
import {buildCategoryChartData,buildDynamicCategoryChartGroups} from "../utils/dashboard/dashboardFormatters";
import {buildYearlySpendingData,buildMonthlySpendingData} from "../utils/dashboard/dashboardInsights";
import {getObjectId,loadCurrentBusiness} from "../utils/currentBusiness.js";
import "../styles/Dashboard.css";

const emptyDashboardData={
 stats:[],
 lowStockItems:[],
 expiringItems:[],
 recentItems:[],
 missingItems:[],
 calendarEvents:[],
 categoryCosts:[],
 budgetInsights:{yearlyByCategory:[],monthlyByCategory:[],overBudget:[]},
 operations:{}
};

function Dashboard(){
 const [dashboardData,setDashboardData]=useState(emptyDashboardData);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");

 const today=new Date();
 const currentYear=String(today.getFullYear());
 const currentMonth=String(today.getMonth());

 const [yearFilter,setYearFilter]=useState(currentYear);
 const [monthFilter,setMonthFilter]=useState(currentMonth);

 useEffect(()=>{
  let ignore=false;

  const loadDashboard=async()=>{
   try{
    setLoading(true);
    setError("");
    const business=await loadCurrentBusiness();
    const businessId=getObjectId(business);
    const query=businessId?`?business_id=${encodeURIComponent(businessId)}`:"";
    const res=await fetch(`/api/dashboard${query}`,{headers:{"Content-Type":"application/json"}});
    const data=await res.json().catch(()=>null);

    if(!res.ok)throw new Error(data?.message||data?.error||"Dashboard data could not load.");
    if(!ignore)setDashboardData({...emptyDashboardData,...data});
   }catch(err){
    if(!ignore){
     setDashboardData(emptyDashboardData);
     setError(err.message||"Dashboard data could not load.");
    }
   }finally{
    if(!ignore)setLoading(false);
   }
  };

  loadDashboard();

  return()=>{
   ignore=true;
  };
 },[]);

 const displayStats=dashboardData.stats||[];
 const displayLowStockItems=dashboardData.lowStockItems||[];
 const displayExpiringItems=dashboardData.expiringItems||[];
 const displayRecentItems=dashboardData.recentItems||[];
 const displayMissingItems=dashboardData.missingItems||[];
 const displayCalendarEvents=dashboardData.calendarEvents||[];
 const displayCategoryCosts=useMemo(()=>dashboardData.categoryCosts||[],[dashboardData.categoryCosts]);
 const displayBudgetInsights=dashboardData.budgetInsights||emptyDashboardData.budgetInsights;
 const operations=dashboardData.operations||{};

 const availableYears=useMemo(()=>{
  const years=getAvailableYears(displayCategoryCosts);
  return years.includes(Number(currentYear))?years:[Number(currentYear),...years].sort((a,b)=>b-a);
 },[displayCategoryCosts,currentYear]);

 const filteredCategoryCosts=useMemo(()=>{
  return filterCategoryCosts(displayCategoryCosts,yearFilter,monthFilter);
 },[displayCategoryCosts,yearFilter,monthFilter]);

 const preservesChartData=useMemo(()=>{
  return buildCategoryChartData(filteredCategoryCosts,"preserves");
 },[filteredCategoryCosts]);

 const fermentedChartData=useMemo(()=>{
  return buildCategoryChartData(filteredCategoryCosts,"fermented");
 },[filteredCategoryCosts]);

 const ingredientsChartData=useMemo(()=>{
  return buildCategoryChartData(filteredCategoryCosts,"ingredients");
 },[filteredCategoryCosts]);

 const packagingChartData=useMemo(()=>{
  return buildCategoryChartData(filteredCategoryCosts,"packaging");
 },[filteredCategoryCosts]);

 const equipmentChartData=useMemo(()=>{
  return buildCategoryChartData(filteredCategoryCosts,"equipment");
 },[filteredCategoryCosts]);

 const marketChartData=useMemo(()=>{
  return buildCategoryChartData(filteredCategoryCosts,"market");
 },[filteredCategoryCosts]);

 const otherChartData=useMemo(()=>{
  return buildCategoryChartData(filteredCategoryCosts,"other");
 },[filteredCategoryCosts]);

 const dynamicChartGroups=useMemo(()=>{
  return buildDynamicCategoryChartGroups(filteredCategoryCosts,[
   "preserves",
   "fermented",
   "ingredients",
   "packaging",
   "equipment",
   "market",
   "other"
  ]);
 },[filteredCategoryCosts]);

 const yearlySpendingData=useMemo(()=>{
  return buildYearlySpendingData(displayCategoryCosts,yearFilter);
 },[displayCategoryCosts,yearFilter]);

 const monthlySpendingData=useMemo(()=>{
  return buildMonthlySpendingData(displayCategoryCosts,yearFilter,monthFilter);
 },[displayCategoryCosts,yearFilter,monthFilter]);

 return(
  <section className="dashboard">

   <header className="dashboard-header">
    <div className="dashboard-header-copy">
     <div className="dashboard-card-top">
      <span className="dashboard-card-icon">
       <span className="dashboard-header-panel-emoji">🫙</span>
      </span>
      <p className="dashboard-eyebrow">Business Overview</p>
     </div>

     <h1 className="dashboard-title">Everything in a Jar Dashboard</h1>

     <p className="dashboard-text">
      Live operations from recipes, costings, vendors, roles, and app modules. Empty sections mean records need to be created, not that the business is being filled with sample data.
     </p>

     <div className="dashboard-ops-strip">
      <span><strong>{operations.recipes||0}</strong> recipes</span>
      <span><strong>{operations.costedRecipes||0}</strong> costed</span>
      <span><strong>{operations.activeVendors||0}</strong> active vendors</span>
      <span><strong>{operations.permissionModules||0}</strong> app modules</span>
     </div>
    </div>

    <div className="dashboard-header-panel">
     <div className="dashboard-header-panel-copy">
      <div className="dashboard-header-panel-top">
       <span className="dashboard-header-panel-icon" aria-hidden="true">
        <span className="dashboard-header-panel-emoji">🍓</span>
       </span>

       <div className="dashboard-header-panel-heading">
        <p className="dashboard-header-panel-label">Live Command Center</p>
        <h3 className="dashboard-header-panel-title">{loading?"Loading business records":"Recipes, vendors, costs, and controls"}</h3>
       </div>
      </div>

      <p className="dashboard-header-panel-text">{error||"Use this view to see what is ready, what needs costing, what vendors need review, and what compliance items need attention."}</p>
     </div>
    </div>
   </header>

   {error&&<div className="dashboard-status dashboard-status-error">{error}</div>}

   <DashboardStats stats={displayStats}/>

   <section className="dashboard-insights-row">
    <DashboardCalendarCard key={`${yearFilter}-${monthFilter}`} year={Number(yearFilter)} month={Number(monthFilter)} events={displayCalendarEvents}/>
    <YearlySpendingChart data={yearlySpendingData} yearFilter={yearFilter}/>
    <MonthlySpendingChart data={monthlySpendingData} yearFilter={yearFilter} monthFilter={monthFilter}/>
   </section>

   <BudgetInsightCards budgetInsights={displayBudgetInsights} yearFilter={yearFilter} monthFilter={monthFilter}/>

   <div className="dashboard-grid">

    <section className="dashboard-main">

     <LowStockPanel lowStockItems={displayLowStockItems}/>
     <ExpiringItemsPanel expiringItems={displayExpiringItems}/>
     <RecentItemsPanel recentItems={displayRecentItems}/>
     <ShoppingListPanel missingItems={displayMissingItems}/>

     <section className="dashboard-section dashboard-section-wide dashboard-section-charts">
      <div className="dashboard-section-head">
       <div>
        <p className="dashboard-section-kicker">Business Costs</p>
        <h2 className="dashboard-section-title">Spend by Category</h2>
       </div>

       <DashboardFilters
        months={months}
        availableYears={availableYears}
        yearFilter={yearFilter}
        monthFilter={monthFilter}
        onYearChange={setYearFilter}
        onMonthChange={setMonthFilter}
       />
      </div>

      <CategorySpendCharts
       pantryChartData={preservesChartData}
       householdChartData={fermentedChartData}
       groceryChartData={ingredientsChartData}
       personalChartData={packagingChartData}
       clothingChartData={equipmentChartData}
       furnitureChartData={marketChartData}
       otherChartData={otherChartData}
       dynamicChartGroups={dynamicChartGroups}
      />
     </section>

    </section>

   </div>

   <QuickActionsPanel/>

  </section>
 );
}

export default Dashboard;
