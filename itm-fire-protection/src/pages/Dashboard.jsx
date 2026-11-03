// src/pages/Dashboard.jsx
import {useCallback,useEffect,useMemo,useState} from "react";
import {Link} from "react-router-dom";
import {Package2,TriangleAlert,Clock3,Plus,ArrowRight,ChartColumnStacked,House,ShoppingCart,Box,Archive} from "lucide-react";
import "../styles/Dashboard.css";

function Dashboard(){

 const [yearFilter,setYearFilter]=useState("all");
 const [monthFilter,setMonthFilter]=useState("all");
 const [dashboardData,setDashboardData]=useState({
  items:[],
  stats:[],
  lowStockItems:[],
  expiringItems:[],
  recentItems:[],
  missingItems:[],
  categoryCosts:[],
  tasks:[]
 });
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [stockLevels,setStockLevels]=useState({});
 const [savingStockLevel,setSavingStockLevel]=useState("");
 const [stockLevelMessage,setStockLevelMessage]=useState("");
 const [stockCategoryFilter,setStockCategoryFilter]=useState("all");

 useEffect(()=>{
  let ignore=false;

  const loadDashboard=async()=>{
   try{
    setLoading(true);
    setError("");
    const [dashboardRes,tasksRes]=await Promise.all([
     fetch("/api/dashboard"),
     fetch("/api/tasks")
    ]);
    const data=await dashboardRes.json();
    const taskData=await tasksRes.json().catch(()=>({tasks:[]}));
    if(!dashboardRes.ok)throw new Error(data?.message||"Failed to load dashboard");
    const loadedItems=Array.isArray(data?.items)?data.items:[];
    if(!ignore)setDashboardData({
     items:loadedItems,
     stats:Array.isArray(data?.stats)?data.stats:[],
     lowStockItems:Array.isArray(data?.lowStockItems)?data.lowStockItems:[],
     expiringItems:Array.isArray(data?.expiringItems)?data.expiringItems:[],
     recentItems:Array.isArray(data?.recentItems)?data.recentItems:[],
     missingItems:Array.isArray(data?.missingItems)?data.missingItems:[],
     categoryCosts:Array.isArray(data?.categoryCosts)?data.categoryCosts:[],
     tasks:Array.isArray(taskData?.tasks)?taskData.tasks:[]
    });
    if(!ignore)setStockLevels(loadedItems.reduce((acc,item)=>{
     acc[item._id||item.id]={
      minimumQuantity:item.minimumQuantity??0,
      parLevel:item.parLevel??0
     };
     return acc;
    },{}));
   }catch(err){
    console.error("Dashboard load failed",err);
    if(!ignore)setError("Dashboard data could not be loaded.");
   }finally{
    if(!ignore)setLoading(false);
   }
  };

  loadDashboard();

  return()=>{ignore=true;};
 },[]);

 const {items,stats,lowStockItems,expiringItems,recentItems,missingItems,categoryCosts,tasks}=dashboardData;

 const statIcons={
  "Total Items":<Package2 size={18} strokeWidth={2.2}/>,
  "Low Stock":<TriangleAlert size={18} strokeWidth={2.2}/>,
  "Expiring Soon":<Clock3 size={18} strokeWidth={2.2}/>,
  "Categories":<ChartColumnStacked size={18} strokeWidth={2.2}/>
 };

 const formatDate=value=>{
  if(!value)return "-";
  const date=new Date(value);
  if(Number.isNaN(date.getTime()))return "-";
  return date.toLocaleDateString();
 };

 const allTrackedItems=useMemo(()=>{
  const byId=new Map();
  [...lowStockItems,...expiringItems,...recentItems,...missingItems].forEach(item=>{
   const key=item._id||item.id||item.name;
   if(key&&!byId.has(key))byId.set(key,item);
  });
  return [...byId.values()];
 },[expiringItems,lowStockItems,missingItems,recentItems]);

 const getStatDetails=label=>{
  if(label==="Total Items"){
   return {
    to:"/items",
    empty:"No tracked items yet.",
    items:allTrackedItems.slice(0,5).map(item=>({
     key:item._id||item.id||item.name,
     name:item.name,
     meta:`${item.quantity??""} ${item.unit||""} · ${item.location||item.category||"Home"}`
    }))
   };
  }

  if(label==="Low Stock"){
   return {
    to:"/low-stock",
    empty:"No low stock items.",
    items:lowStockItems.slice(0,5).map(item=>({
     key:item._id||item.id||item.name,
     name:item.name,
     meta:`${item.quantity??0} ${item.unit||""} left · min ${item.minimumQuantity??item.minQuantity??0} · par ${item.parLevel??0}`
    }))
   };
  }

  if(label==="Expiring Soon"){
   return {
    to:"/expiring",
    empty:"No items expiring soon.",
    items:expiringItems.slice(0,5).map(item=>({
     key:item._id||item.id||item.name,
     name:item.name,
     meta:`Expires ${formatDate(item.expirationDate||item.expiryDate)} · ${item.location||item.category||"Home"}`
    }))
   };
  }

  return {
   to:"/categories",
   empty:"Open categories to manage groups.",
   items:[]
  };
 };

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

 const pantryChartData=useMemo(()=>buildChartData("pantry"),[buildChartData]);
 const householdChartData=useMemo(()=>buildChartData("household"),[buildChartData]);

 const stockCategories=useMemo(()=>{
  const categories=[...new Set(items.map(item=>item.category||"Uncategorized"))];
  return categories.sort((a,b)=>String(a).localeCompare(String(b),undefined,{sensitivity:"base"}));
 },[items]);

 const filteredStockItems=useMemo(()=>{
  if(stockCategoryFilter==="all")return items;
  return items.filter(item=>(item.category||"Uncategorized")===stockCategoryFilter);
 },[items,stockCategoryFilter]);

 const formatDateInput=value=>{
  if(!value)return null;
  const date=new Date(value);
  if(Number.isNaN(date.getTime()))return null;
  return date.toISOString().slice(0,10);
 };

 const handleStockLevelChange=(itemId,field,value)=>{
  setStockLevels(prev=>({
   ...prev,
   [itemId]:{
    ...(prev[itemId]||{}),
    [field]:value
   }
  }));
 };

 const saveStockLevel=async item=>{
  const itemId=item._id||item.id;
  const levels=stockLevels[itemId]||{};

  try{
   setSavingStockLevel(itemId);
   setStockLevelMessage("");

   const payload={
    name:item.name,
    brand:item.brand||"",
    barcode:item.barcode||"",
    storageType:item.storageType||"pantry",
    category:item.categoryId||null,
    location:item.locationId||null,
    quantity:Number(item.quantity||0),
    minimumQuantity:Number(levels.minimumQuantity||0),
    parLevel:Number(levels.parLevel||0),
    unit:item.unit||"each",
    cost:Number(item.cost||0),
    purchaseDate:formatDateInput(item.purchaseDate),
    expirationDate:formatDateInput(item.expirationDate),
    status:item.status||"active",
    shoppingList:Boolean(item.shoppingList),
    notes:item.notes||""
   };

   const res=await fetch(`/api/items/${itemId}`,{
    method:"PUT",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });
   const data=await res.json();
   if(!res.ok)throw new Error(data?.message||"Failed to save stock levels");

   const savedItem=data.item;
   setDashboardData(prev=>({
    ...prev,
    items:prev.items.map(current=>(current._id||current.id)===itemId?{...current,minimumQuantity:savedItem.minimumQuantity,parLevel:savedItem.parLevel}:current),
    lowStockItems:prev.lowStockItems.map(current=>(current._id||current.id)===itemId?{...current,minimumQuantity:savedItem.minimumQuantity,parLevel:savedItem.parLevel}:current),
    recentItems:prev.recentItems.map(current=>(current._id||current.id)===itemId?{...current,minimumQuantity:savedItem.minimumQuantity,parLevel:savedItem.parLevel}:current),
    missingItems:prev.missingItems.map(current=>(current._id||current.id)===itemId?{...current,minimumQuantity:savedItem.minimumQuantity,parLevel:savedItem.parLevel}:current)
   }));
   setStockLevelMessage(`Saved min/par for ${item.name}.`);
  }catch(err){
   setStockLevelMessage(err.message||"Failed to save stock levels.");
  }finally{
   setSavingStockLevel("");
  }
 };

 const removeItemFromDashboard=itemId=>{
  setDashboardData(prev=>({
   ...prev,
   items:prev.items.filter(current=>(current._id||current.id)!==itemId),
   lowStockItems:prev.lowStockItems.filter(current=>(current._id||current.id)!==itemId),
   expiringItems:prev.expiringItems.filter(current=>(current._id||current.id)!==itemId),
   recentItems:prev.recentItems.filter(current=>(current._id||current.id)!==itemId),
   missingItems:prev.missingItems.filter(current=>(current._id||current.id)!==itemId),
   stats:prev.stats.map(stat=>stat.label==="Total Items"?{...stat,value:Math.max(0,Number(stat.value||0)-1)}:stat)
  }));
  setStockLevels(prev=>{
   const next={...prev};
   delete next[itemId];
   return next;
  });
 };

 const deleteStockItem=async item=>{
  const itemId=item._id||item.id;
  if(!window.confirm(`Delete ${item.name}?`))return;

  try{
   setSavingStockLevel(itemId);
   setStockLevelMessage("");

   const res=await fetch(`/api/items/${itemId}`,{method:"DELETE"});
   const data=await res.json().catch(()=>({}));
   if(!res.ok)throw new Error(data?.message||"Failed to delete item");

   removeItemFromDashboard(itemId);
   setStockLevelMessage(`Deleted ${item.name}.`);
  }catch(err){
   setStockLevelMessage(err.message||"Failed to delete item.");
  }finally{
   setSavingStockLevel("");
  }
 };

 return(
  <section className="dashboard">

   <header className="dashboard-header">
    <div className="dashboard-header-copy">
     <p className="dashboard-eyebrow">Whole Home Inventory</p>
 
     <p className="dashboard-text">
      Track groceries, pantry stock, cleaning supplies, toiletries, appliances, tools, storage items, and everyday household essentials in one organized system.
     </p>
    </div>

    <div className="dashboard-header-panel">
     <div className="dashboard-header-panel-icon">
      <House size={26} strokeWidth={2.1}/>
     </div>

     <div className="dashboard-header-panel-copy">
      <p className="dashboard-header-panel-label">Overview</p>
      <h3 className="dashboard-header-panel-title">Everything across your home, organized.</h3>
      <p className="dashboard-header-panel-text"> Manage pantry goods, fridge and freezer items, bath supplies, laundry products, cleaning supplies, and stored household inventory from one central dashboard. </p>
     </div>
    </div>
   </header>

   <div className="dashboard-grid">

    {error&&<div className="dashboard-empty dashboard-empty-wide">{error}</div>}

    <section className="dashboard-cards">
     {loading&&stats.length===0?(
      <article className="dashboard-card">
       <p className="dashboard-card-label">Loading dashboard...</p>
      </article>
     ):stats?.map((item)=>{
      const detail=getStatDetails(item.label);

      return(
      <article key={item.label} className="dashboard-card dashboard-card-detail">
       <div className="dashboard-card-top">
        <span className="dashboard-card-icon">{statIcons[item.label]||<Package2 size={18} strokeWidth={2.2}/>}</span>
        <p className="dashboard-card-label">{item.label}</p>
       </div>
       <div className="dashboard-card-summary">
        <p className="dashboard-card-value">{item.value}</p>
        <Link to={detail.to} className="dashboard-card-link">View all</Link>
       </div>

       <ul className="dashboard-card-items">
        {detail.items.length?detail.items.map(detailItem=>(
         <li key={detailItem.key}>
          <span>{detailItem.name}</span>
          <small>{detailItem.meta}</small>
         </li>
        )):(
         <li className="dashboard-card-empty">{detail.empty}</li>
        )}
       </ul>
      </article>
     );})}
    </section>

    <section className="dashboard-main">

     <section className="dashboard-section dashboard-section-wide dashboard-stock-levels">
      <div className="dashboard-section-head">
       <div>
        <p className="dashboard-section-kicker">Stock Controls</p>
        <h2 className="dashboard-section-title">Item Min & Par List</h2>
       </div>

       <label className="dashboard-filter dashboard-stock-filter">
        <span className="dashboard-filter-label">Category</span>
        <select value={stockCategoryFilter} onChange={e=>setStockCategoryFilter(e.target.value)} className="dashboard-filter-select">
         <option value="all">All Categories</option>
         {stockCategories.map(category=>(
          <option key={category} value={category}>{category}</option>
         ))}
        </select>
       </label>
      </div>

      {stockLevelMessage&&<div className="dashboard-stock-message">{stockLevelMessage}</div>}

      <div className="dashboard-stock-table">
       <div className="dashboard-stock-row dashboard-stock-row-head">
        <span>Item</span>
        <span>On Hand</span>
        <span>Min</span>
        <span>Par</span>
        <span>Actions</span>
       </div>

       {filteredStockItems.length?filteredStockItems.map(item=>{
        const itemId=item._id||item.id;
        const levels=stockLevels[itemId]||{};

        return(
         <div key={itemId} className="dashboard-stock-row">
          <span className="dashboard-stock-item">
           <strong>{item.name}</strong>
           <small>{item.location||item.category||item.storageType||"Home"}</small>
          </span>
          <span>{item.quantity??0} {item.unit||""}</span>
          <input
           type="number"
           min="0"
           value={levels.minimumQuantity??0}
           onChange={e=>handleStockLevelChange(itemId,"minimumQuantity",e.target.value)}
           aria-label={`Minimum quantity for ${item.name}`}
          />
          <input
           type="number"
           min="0"
           value={levels.parLevel??0}
           onChange={e=>handleStockLevelChange(itemId,"parLevel",e.target.value)}
           aria-label={`Par level for ${item.name}`}
          />
          <span className="dashboard-stock-actions">
           <button type="button" onClick={()=>saveStockLevel(item)} disabled={savingStockLevel===itemId}>
            {savingStockLevel===itemId?"Saving":"Save"}
           </button>
           <button type="button" className="dashboard-stock-delete" onClick={()=>deleteStockItem(item)} disabled={savingStockLevel===itemId}>
            Delete
           </button>
          </span>
         </div>
        );
       }):(
        <div className="dashboard-empty">No items found for this category.</div>
       )}
      </div>
     </section>

     <section className="dashboard-section dashboard-section-wide dashboard-section-charts">
      <div className="dashboard-section-head">
       <div>
        <p className="dashboard-section-kicker">Category Costs</p>
        <h2 className="dashboard-section-title">Cost by Category</h2>
       </div>

       <div className="dashboard-filters">
        <label className="dashboard-filter">
         <span className="dashboard-filter-label">Year</span>
         <select value={yearFilter} onChange={(e)=>setYearFilter(e.target.value)} className="dashboard-filter-select">
          <option value="all">All</option>
          {availableYears.map((year)=>(
           <option key={year} value={String(year)}>{year}</option>
          ))}
         </select>
        </label>

        <label className="dashboard-filter">
         <span className="dashboard-filter-label">Month</span>
         <select value={monthFilter} onChange={(e)=>setMonthFilter(e.target.value)} className="dashboard-filter-select">
          <option value="all">All</option>
          {months.map((month)=>(
           <option key={month.value} value={month.value}>{month.label}</option>
          ))}
         </select>
        </label>
       </div>
      </div>

      <div className="dashboard-chart-grid">

       <div className="dashboard-chart-card">
        <div className="dashboard-chart-head">
         <h3 className="dashboard-chart-title">Pantry Categories</h3>
        </div>

        <div className="dashboard-chart-body">
         {pantryChartData.length?pantryChartData.map((item)=>(
          <div key={item.category} className="dashboard-bar-row">
           <div className="dashboard-bar-meta">
            <span className="dashboard-bar-label">{item.category}</span>
            <span className="dashboard-bar-value">${item.cost.toFixed(2)}</span>
           </div>

           <div className="dashboard-bar-track">
            <div className="dashboard-bar-fill dashboard-bar-fill-pantry" style={{width:item.width}}/>
           </div>
          </div>
         )):(
          <div className="dashboard-empty">No pantry category cost data for the selected period.</div>
         )}
        </div>
       </div>

       <div className="dashboard-chart-card">
        <div className="dashboard-chart-head">
         <h3 className="dashboard-chart-title">Household Categories</h3>
        </div>

        <div className="dashboard-chart-body">
         {householdChartData.length?householdChartData.map((item)=>(
          <div key={item.category} className="dashboard-bar-row">
           <div className="dashboard-bar-meta">
            <span className="dashboard-bar-label">{item.category}</span>
            <span className="dashboard-bar-value">${item.cost.toFixed(2)}</span>
           </div>

           <div className="dashboard-bar-track">
            <div className="dashboard-bar-fill dashboard-bar-fill-household" style={{width:item.width}}/>
           </div>
          </div>
         )):(
          <div className="dashboard-empty">No household category cost data for the selected period.</div>
         )}
        </div>
       </div>

      </div>
     </section>

     <section className="dashboard-section dashboard-section-quarter dashboard-section-priority">
      <div className="dashboard-section-head">
       <div>
        <p className="dashboard-section-kicker">Attention Needed</p>
        <h2 className="dashboard-section-title">Low Stock</h2>
       </div>

       <Link to="/low-stock" className="dashboard-section-link">
        View all
        <ArrowRight size={16} strokeWidth={2.1}/>
       </Link>
      </div>

      <ul className="dashboard-list">
       {lowStockItems?.length?lowStockItems.map((item)=>(
        <li key={item._id||item.id||item.name} className="dashboard-list-item">
         <span className="dashboard-list-icon"><TriangleAlert size={17} strokeWidth={2.2}/></span>

         <div className="dashboard-list-content">
          <span className="dashboard-item-title">{item.name}</span>
          <span className="dashboard-item-meta">
           {item.quantity} {item.unit||""} · {item.location||item.room||item.category||"Home Inventory"}
          </span>
         </div>
        </li>
       )):(
        <li className="dashboard-empty">No low stock items across the home right now.</li>
       )}
      </ul>
     </section>

     <section className="dashboard-section dashboard-section-quarter">
      <div className="dashboard-section-head">
       <div>
        <p className="dashboard-section-kicker">Time Sensitive</p>
        <h2 className="dashboard-section-title">Expiring Soon</h2>
       </div>

       <Link to="/expiring" className="dashboard-section-link">
        View all
        <ArrowRight size={16} strokeWidth={2.1}/>
       </Link>
      </div>

      <ul className="dashboard-list">
       {expiringItems?.length?expiringItems.map((item)=>(
        <li key={item._id||item.id||item.name} className="dashboard-list-item">
         <span className="dashboard-list-icon dashboard-list-icon-accent"><Clock3 size={17} strokeWidth={2.2}/></span>

         <div className="dashboard-list-content">
          <span className="dashboard-item-title">{item.name}</span>
          <span className="dashboard-item-meta">
           Expires {item.expirationDate||item.expiryDate||"Soon"} · {item.location||item.room||item.category||"Home Inventory"}
          </span>
         </div>
        </li>
       )):(
        <li className="dashboard-empty">No items nearing expiration right now.</li>
       )}
      </ul>
     </section>

     <section className="dashboard-section dashboard-section-quarter">
      <div className="dashboard-section-head">
       <div>
        <p className="dashboard-section-kicker">Recently Added</p>
        <h2 className="dashboard-section-title">New Household Items</h2>
       </div>

       <Link to="/items" className="dashboard-section-link">
        Browse inventory
        <ArrowRight size={16} strokeWidth={2.1}/>
       </Link>
      </div>

      <ul className="dashboard-list">
       {recentItems?.length?recentItems.map((item)=>(
        <li key={item._id||item.id||item.name} className="dashboard-list-item">
         <span className="dashboard-list-icon dashboard-list-icon-soft"><Package2 size={17} strokeWidth={2.2}/></span>

         <div className="dashboard-list-content">
          <span className="dashboard-item-title">{item.name}</span>
          <span className="dashboard-item-meta">
           {item.category||"General Household"} · {item.location||item.room||"Home"}
          </span>
         </div>
        </li>
       )):(
        <li className="dashboard-empty">No new household items added yet.</li>
       )}
      </ul>
     </section>

     <section className="dashboard-section dashboard-section-quarter">
      <div className="dashboard-section-head">
       <div>
        <p className="dashboard-section-kicker">Restock & Replace</p>
        <h2 className="dashboard-section-title">Missing or Needed Items</h2>
       </div>

       <Link to="/shopping-list" className="dashboard-section-link">
        Open list
        <ArrowRight size={16} strokeWidth={2.1}/>
       </Link>
      </div>

      <ul className="dashboard-list">
       {missingItems?.length?missingItems.map((item)=>(
        <li key={item._id||item.id||item.name} className="dashboard-list-item">
         <span className="dashboard-list-icon dashboard-list-icon-warning"><ShoppingCart size={17} strokeWidth={2.2}/></span>

         <div className="dashboard-list-content">
          <span className="dashboard-item-title">{item.name}</span>
          <span className="dashboard-item-meta">
           {item.category||"General Household"} · {item.location||item.room||"Home"}
          </span>
         </div>
        </li>
       )):(
        <li className="dashboard-empty">No missing, replacement, or restock items right now.</li>
       )}
      </ul>
     </section>

    </section>

    <aside className="dashboard-sidebar">

     <section className="dashboard-actions">
      <div className="dashboard-actions-head">
       <p className="dashboard-section-kicker">Task List</p>
       <h2 className="dashboard-section-title">To Do</h2>
      </div>

      <ul className="dashboard-list">
       {tasks?.length?tasks.slice(0,5).map(task=>(
        <li key={task._id} className="dashboard-list-item">
         <span className="dashboard-list-icon dashboard-list-icon-soft"><Package2 size={17} strokeWidth={2.2}/></span>
         <div className="dashboard-list-content">
          <span className="dashboard-item-title">{task.name}</span>
          <span className="dashboard-item-meta">
           {task.priority||"Normal"} · {task.dueDate?new Date(task.dueDate).toLocaleDateString():"No due date"}
          </span>
         </div>
        </li>
       )):(
        <li className="dashboard-empty">No open tasks yet.</li>
       )}
      </ul>

      <Link to="/tasks" className="dashboard-section-link">
       Open tasks
       <ArrowRight size={16} strokeWidth={2.1}/>
      </Link>
     </section>

     <section className="dashboard-actions">
      <div className="dashboard-actions-head">
       <p className="dashboard-section-kicker">Quick Actions</p>
       <h2 className="dashboard-section-title">Shortcuts</h2>
      </div>

      <div className="dashboard-actions-grid">
       <Link to="/items/add" className="dashboard-action dashboard-action-primary">
        <span className="dashboard-action-icon"><Plus size={18} strokeWidth={2.2}/></span>
        <span className="dashboard-action-copy">
         <span className="dashboard-action-label">Add Household Item</span>
         <span className="dashboard-action-text">Create a new inventory entry</span>
        </span>
       </Link>

       <Link to="/items" className="dashboard-action">
        <span className="dashboard-action-icon"><Box size={18} strokeWidth={2.2}/></span>
        <span className="dashboard-action-copy">
         <span className="dashboard-action-label">View All Items</span>
         <span className="dashboard-action-text">Browse home inventory</span>
        </span>
       </Link>

       <Link to="/shopping-list" className="dashboard-action">
        <span className="dashboard-action-icon"><ShoppingCart size={18} strokeWidth={2.2}/></span>
        <span className="dashboard-action-copy">
         <span className="dashboard-action-label">Shopping & Replacement List</span>
         <span className="dashboard-action-text">Restock or replace essentials</span>
        </span>
       </Link>

       <Link to="/categories" className="dashboard-action">
        <span className="dashboard-action-icon"><Archive size={18} strokeWidth={2.2}/></span>
        <span className="dashboard-action-copy">
         <span className="dashboard-action-label">Manage Categories</span>
         <span className="dashboard-action-text">Organize rooms and item types</span>
        </span>
       </Link>
      </div>
     </section>

    </aside>

   </div>

  </section>
 );
}

export default Dashboard;
