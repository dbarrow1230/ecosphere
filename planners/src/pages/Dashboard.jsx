import {useMemo,useState} from "react";
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
import "../styles/Dashboard.css";

function Dashboard({stats,lowStockItems,expiringItems,recentItems,missingItems,categoryCosts=[],budgetInsights={yearlyByCategory:[],monthlyByCategory:[],overBudget:[]}}){

 const today=new Date();
 const currentYear=String(today.getFullYear());
 const currentMonth=String(today.getMonth());

 const [yearFilter,setYearFilter]=useState(currentYear);
 const [monthFilter,setMonthFilter]=useState(currentMonth);

 const availableYears=useMemo(()=>{
  const years=getAvailableYears(categoryCosts);
  return years.includes(Number(currentYear))?years:[Number(currentYear),...years].sort((a,b)=>b-a);
 },[categoryCosts,currentYear]);

 const filteredCategoryCosts=useMemo(()=>{
  return filterCategoryCosts(categoryCosts,yearFilter,monthFilter);
 },[categoryCosts,yearFilter,monthFilter]);

 const pantryChartData=useMemo(()=>{
  return buildCategoryChartData(filteredCategoryCosts,"pantry");
 },[filteredCategoryCosts]);

 const householdChartData=useMemo(()=>{
  return buildCategoryChartData(filteredCategoryCosts,"household");
 },[filteredCategoryCosts]);

 const groceryChartData=useMemo(()=>{
  return buildCategoryChartData(filteredCategoryCosts,"grocery");
 },[filteredCategoryCosts]);

 const personalChartData=useMemo(()=>{
  return buildCategoryChartData(filteredCategoryCosts,"personal");
 },[filteredCategoryCosts]);

 const clothingChartData=useMemo(()=>{
  return buildCategoryChartData(filteredCategoryCosts,"clothing");
 },[filteredCategoryCosts]);

 const furnitureChartData=useMemo(()=>{
  return buildCategoryChartData(filteredCategoryCosts,"furniture");
 },[filteredCategoryCosts]);

 const otherChartData=useMemo(()=>{
  return buildCategoryChartData(filteredCategoryCosts,"other");
 },[filteredCategoryCosts]);

 const dynamicChartGroups=useMemo(()=>{
  return buildDynamicCategoryChartGroups(filteredCategoryCosts,[
   "pantry",
   "household",
   "grocery",
   "personal",
   "clothing",
   "furniture",
   "other"
  ]);
 },[filteredCategoryCosts]);

 const yearlySpendingData=useMemo(()=>{
  return buildYearlySpendingData(categoryCosts,yearFilter);
 },[categoryCosts,yearFilter]);

 const monthlySpendingData=useMemo(()=>{
  return buildMonthlySpendingData(categoryCosts,yearFilter,monthFilter);
 },[categoryCosts,yearFilter,monthFilter]);

 return(
  <section className="dashboard">

   <header className="dashboard-header">
    <div className="dashboard-header-copy">
     <div className="dashboard-card-top">
      <span className="dashboard-card-icon">
       <span className="dashboard-header-panel-emoji">🛒</span>
      </span>
      <p className="dashboard-eyebrow">Shopping Overview</p>
     </div>

      <h1 className="dashboard-title">Shopping Manager Dashboard</h1>

     <p className="dashboard-text">
      Track groceries, pantry staples, household items, personal care, clothing, furniture, and everyday essentials in one organized shopping system.
     </p>
    </div>

    <div className="dashboard-header-panel">
     <div className="dashboard-header-panel-icon">
      <span className="dashboard-header-panel-emoji">🛒</span>
     </div>

     <div className="dashboard-header-panel-copy">
      <p className="dashboard-header-panel-label">Overview</p>
      <h3 className="dashboard-header-panel-title">Everything you need for smarter shopping management.</h3>
      <p className="dashboard-header-panel-text">Manage grocery, pantry, household, personal care, clothing, furniture, and shopping priorities from one central dashboard.</p>
     </div>
    </div>
   </header>

   <section className="dashboard-insights-row">
    <DashboardCalendarCard year={Number(yearFilter)} month={Number(monthFilter)}/>
    <YearlySpendingChart data={yearlySpendingData} yearFilter={yearFilter}/>
    <MonthlySpendingChart data={monthlySpendingData} yearFilter={yearFilter} monthFilter={monthFilter}/>
   </section>

   <BudgetInsightCards budgetInsights={budgetInsights} yearFilter={yearFilter} monthFilter={monthFilter}/>

   <div className="dashboard-grid">

    <DashboardStats stats={stats}/>

    <section className="dashboard-main">

     <section className="dashboard-section dashboard-section-wide dashboard-section-charts">
      <div className="dashboard-section-head">
       <div>
        <p className="dashboard-section-kicker">Category Costs</p>
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
       pantryChartData={pantryChartData}
       householdChartData={householdChartData}
       groceryChartData={groceryChartData}
       personalChartData={personalChartData}
       clothingChartData={clothingChartData}
       furnitureChartData={furnitureChartData}
       otherChartData={otherChartData}
       dynamicChartGroups={dynamicChartGroups}
      />
     </section>

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