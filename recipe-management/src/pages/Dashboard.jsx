import {buildRecipeDashboardData} from "../utils/dashboard/recipeDashboardData.js";
import CostingOverviewPanel from "../components/dashboard/CostingOverviewPanel.jsx";
// src/pages/Dashboard.jsx
import {useEffect,useMemo,useState} from "react";
import DashboardHeader from "../components/dashboard/DashboardHeader.jsx";
import {costingOverview} from "../components/dashboard/CostingOverviewPanel.jsx";
import DashboardStats from "../components/dashboard/DashboardStats.jsx";
import DashboardSection from "../components/dashboard/DashboardSection.jsx";
import DashboardFilters from "../components/dashboard/DashboardFilters.jsx";
import CategorySpendCharts from "../components/dashboard/CategorySpendCharts.jsx";
import RecipeReviewPanel from "../components/dashboard/RecipeReviewPanel.jsx";
import PrepPlanningPanel from "../components/dashboard/PrepPlanningPanel.jsx";
import RecentRecipesPanel from "../components/dashboard/RecentRecipesPanel.jsx";
import MissingRecipeDataPanel from "../components/dashboard/MissingRecipeDataPanel.jsx";
import QuickActionsPanel from "../components/dashboard/QuickActionsPanel.jsx";
import DashboardError from "../components/dashboard/DashboardError.jsx";
import {months,getAvailableYears,filterCategoryCosts} from "../utils/dashboard/dashboardFilters.js";
import {buildCategoryChartData} from "../utils/dashboard/dashboardFormatters.js";
import "../styles/Dashboard.css";

const emptyData={
 recipes:[],
 categories:[],
 recipeCostings:[],
 menus:[],vendorPrices:[],productCategories:[]
};

const getRows=payload=>{
 if(Array.isArray(payload))return payload;
 if(Array.isArray(payload?.data))return payload.data;
 if(Array.isArray(payload?.items))return payload.items;
 if(Array.isArray(payload?.results))return payload.results;
 if(Array.isArray(payload?.vendorIngredientPrices))return payload.vendorIngredientPrices;
 if(Array.isArray(payload?.productCategories))return payload.productCategories;
 if(Array.isArray(payload?.menus))return payload.menus;
 if(Array.isArray(payload?.recipes))return payload.recipes;
 if(Array.isArray(payload?.categories))return payload.categories;
 if(Array.isArray(payload?.recipeCostings))return payload.recipeCostings;
 return [];
};


function Dashboard(){
 const [yearFilter,setYearFilter]=useState("all");
 const [monthFilter,setMonthFilter]=useState("all");
 const [dashboardSource,setDashboardSource]=useState(emptyData);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState("");

 useEffect(()=>{
  let ignore=false;

  const fetchJson=async url=>{
   const res=await fetch(url,{headers:{"Content-Type":"application/json"}});
   const text=await res.text();
   let data=null;

   try{
    data=text?JSON.parse(text):null;
   }catch{
    data=null;
   }

   if(!res.ok)throw new Error(data?.message||text||`Failed to load ${url}`);

   return getRows(data);
  };

  const loadDashboard=async()=>{
   try{
    setLoading(true);
    setError("");

    const [recipes,categories,recipeCostings,menus,vendorPrices,productCategories]=await Promise.all([
     fetchJson("/api/recipes"),
     fetchJson("/api/categories"),
     fetchJson("/api/recipe-costings"),fetchJson("/api/menus"),fetchJson("/api/vendor-ingredient-prices?isActive=true"),fetchJson("/api/product-categories")
    ]);

    if(!ignore)setDashboardSource({recipes,categories,recipeCostings,menus,vendorPrices,productCategories});
   }catch(err){
    if(!ignore)setError(err.message||"Failed to load recipe dashboard data");
   }finally{
    if(!ignore)setLoading(false);
   }
  };

  loadDashboard();

  return()=>{
   ignore=true;
  };
 },[]);

 const dashboardData=useMemo(()=>buildRecipeDashboardData(dashboardSource),[dashboardSource]);
 const availableYears=useMemo(()=>getAvailableYears(dashboardData.categoryCosts),[dashboardData.categoryCosts]);
 const filteredCategoryCosts=useMemo(
  ()=>filterCategoryCosts(dashboardData.categoryCosts,yearFilter,monthFilter),
  [dashboardData.categoryCosts,yearFilter,monthFilter]
 );
 const recipeChartData=useMemo(()=>buildCategoryChartData(filteredCategoryCosts,"recipe"),[filteredCategoryCosts]);
 const ingredientChartData=useMemo(()=>buildCategoryChartData(filteredCategoryCosts,"ingredient"),[filteredCategoryCosts]);

 return(
  <section className="dashboard">
   <DashboardHeader loading={loading} recipeCount={dashboardSource.recipes.length} costedCount={costingOverview(dashboardSource.recipes,dashboardSource.recipeCostings).costed}/>


   {error?<DashboardError message={error}/>:null}

   <div className="dashboard-grid">
    <DashboardStats stats={dashboardData.stats}/>

    <section className="dashboard-main">
     <DashboardSection className="dashboard-section-charts" kicker="Recipe Costing" title="Cost by Recipe Category">
      <DashboardFilters
       months={months}
       availableYears={availableYears}
       yearFilter={yearFilter}
       monthFilter={monthFilter}
       onYearChange={setYearFilter}
       onMonthChange={setMonthFilter}
      />

      <CategorySpendCharts recipeChartData={recipeChartData} ingredientChartData={ingredientChartData}/>
     </DashboardSection>

     <CostingOverviewPanel recipes={dashboardSource.recipes} costings={dashboardSource.recipeCostings}/>
     <RecipeReviewPanel recipes={dashboardData.lowStockItems}/>
     <PrepPlanningPanel prepItems={dashboardData.expiringItems}/>
     <RecentRecipesPanel recipes={dashboardData.recentItems}/>
     <MissingRecipeDataPanel recipes={dashboardData.missingItems}/>
    </section>
   </div>

   <QuickActionsPanel/>
  </section>
 );
}

export default Dashboard;
