// src/pages/Dashboard.jsx
import {useEffect,useMemo,useState} from "react";
import {ChefHat} from "lucide-react";
import DashboardStats from "../components/dashboard/DashboardStats.jsx";
import DashboardSection from "../components/dashboard/DashboardSection.jsx";
import DashboardFilters from "../components/dashboard/DashboardFilters.jsx";
import CategorySpendCharts from "../components/dashboard/CategorySpendCharts.jsx";
import LowStockPanel from "../components/dashboard/LowStockPanel.jsx";
import ExpiringItemsPanel from "../components/dashboard/ExpiringItemsPanel.jsx";
import RecentItemsPanel from "../components/dashboard/RecentItemsPanel.jsx";
import ShoppingListPanel from "../components/dashboard/ShoppingListPanel.jsx";
import QuickActionsPanel from "../components/dashboard/QuickActionsPanel.jsx";
import DashboardError from "../components/dashboard/DashboardError.jsx";
import {months,getAvailableYears,filterCategoryCosts} from "../utils/dashboard/dashboardFilters.js";
import {buildCategoryChartData} from "../utils/dashboard/dashboardFormatters.js";
import "../styles/Dashboard.css";

const emptyData={
 recipes:[],
 categories:[],
 recipeCostings:[]
};

const getRows=payload=>{
 if(Array.isArray(payload))return payload;
 if(Array.isArray(payload?.data))return payload.data;
 if(Array.isArray(payload?.items))return payload.items;
 if(Array.isArray(payload?.results))return payload.results;
 if(Array.isArray(payload?.recipes))return payload.recipes;
 if(Array.isArray(payload?.categories))return payload.categories;
 if(Array.isArray(payload?.recipeCostings))return payload.recipeCostings;
 return [];
};

const getId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 if(typeof value._id==="string")return value._id;
 if(typeof value.id==="string")return value.id;
 if(typeof value._id?.$oid==="string")return value._id.$oid;
 if(typeof value.id?.$oid==="string")return value.id.$oid;
 return "";
};

const getName=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 return value.name||value.title||value.label||"";
};

const getRecipeCategory=recipe=>getName(recipe?.category)||"Uncategorized";
const getIngredientCategory=line=>getName(line?.ingredient?.category)||getName(line?.ingredient?.ingredientCategory)||"";

const buildRecipeDashboardData=({recipes=[],categories=[],recipeCostings=[]})=>{
 const recipeById=new Map(recipes.map(recipe=>[getId(recipe),recipe]));
 const activeRecipes=recipes.filter(recipe=>recipe?.isActive!==false);
 const reviewRecipes=recipes.filter(recipe=>recipe?.isActive===false);
 const recentRecipes=[...recipes]
  .sort((left,right)=>new Date(right.createdAt||0)-new Date(left.createdAt||0))
  .slice(0,5);

 const recipeCategoryCosts=recipeCostings.map(costing=>{
  const recipe=recipeById.get(getId(costing.recipe))||costing.recipe;
  return{
   _id:getId(costing),
   type:"recipe",
   category:getRecipeCategory(recipe),
   cost:Number(costing?.totals?.totalCost||costing?.totals?.ingredientCost||0),
   date:costing.updatedAt||costing.createdAt||recipe?.updatedAt||recipe?.createdAt
  };
 });

 const ingredientCategoryCosts=recipeCostings.flatMap(costing=>
  (Array.isArray(costing.ingredients)?costing.ingredients:[])
   .map((line,index)=>({
    _id:`${getId(costing)}-ingredient-${index}`,
    type:"ingredient",
    category:getIngredientCategory(line),
    cost:Number(line?.totalCost||0),
    date:costing.updatedAt||costing.createdAt
   }))
   .filter(item=>item.category&&item.cost>0)
 );

 return{
  stats:[
   {label:"Total Recipes",value:recipes.length},
   {label:"Active Recipes",value:activeRecipes.length},
   {label:"Recipes To Review",value:reviewRecipes.length},
   {label:"Categories",value:categories.length}
  ],
  lowStockItems:reviewRecipes.slice(0,5).map(recipe=>({
   _id:getId(recipe),
   name:recipe.name,
   quantity:"Draft",
   unit:"",
   category:getRecipeCategory(recipe)
  })),
  expiringItems:[],
  recentItems:recentRecipes.map(recipe=>({
   _id:getId(recipe),
   name:recipe.name,
   category:getRecipeCategory(recipe),
   location:"Recipe Database"
  })),
  missingItems:[],
  categoryCosts:[...recipeCategoryCosts,...ingredientCategoryCosts]
 };
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

    const [recipes,categories,recipeCostings]=await Promise.all([
     fetchJson("/api/recipes"),
     fetchJson("/api/categories"),
     fetchJson("/api/recipe-costings")
    ]);

    if(!ignore)setDashboardSource({recipes,categories,recipeCostings});
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
   <header className="dashboard-header">
    <div className="dashboard-header-copy">
     <p className="dashboard-eyebrow">Recipe Management System</p>
     <h1 className="dashboard-title">Recipe Operations Dashboard</h1>
     <p className="dashboard-text">
      Organize recipes, ingredients, categories, costing, prep flow, and kitchen planning in one structured recipe management system.
     </p>
     {loading?<p className="dashboard-text">Loading recipe dashboard data...</p>:null}
    </div>

    <div className="dashboard-header-panel">
     <div className="dashboard-header-panel-icon">
      <ChefHat size={26} strokeWidth={2.1}/>
     </div>

     <div className="dashboard-header-panel-copy">
      <p className="dashboard-header-panel-label">Business Overview</p>
      <h3 className="dashboard-header-panel-title">Manage recipes, costing, and prep planning from one dashboard.</h3>
      <p className="dashboard-header-panel-text">Track recipe records, category coverage, costing activity, review queues, and kitchen planning workflows.</p>
     </div>
    </div>
   </header>

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

     <LowStockPanel lowStockItems={dashboardData.lowStockItems}/>
     <ExpiringItemsPanel expiringItems={dashboardData.expiringItems}/>
     <RecentItemsPanel recentItems={dashboardData.recentItems}/>
     <ShoppingListPanel missingItems={dashboardData.missingItems}/>
    </section>
   </div>

   <QuickActionsPanel/>
  </section>
 );
}

export default Dashboard;