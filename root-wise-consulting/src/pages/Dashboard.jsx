// src/pages/Dashboard.jsx
import {useMemo,useState} from "react";
import {Link} from "react-router-dom";
import {Package2,TriangleAlert,Clock3,Plus,ArrowRight,ChartColumnStacked,House,ShoppingCart,Box,Archive} from "lucide-react";
import "../styles/Dashboard.css";

function Dashboard({stats,lowStockItems,expiringItems,recentItems,missingItems,categoryCosts=[]}){

 const [yearFilter,setYearFilter]=useState("all");
 const [monthFilter,setMonthFilter]=useState("all");

 const statIcons={
  "Total Items":<Package2 size={18} strokeWidth={2.2}/>,
  "Low Stock":<TriangleAlert size={18} strokeWidth={2.2}/>,
  "Expiring Soon":<Clock3 size={18} strokeWidth={2.2}/>,
  "Categories":<ChartColumnStacked size={18} strokeWidth={2.2}/>
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

 const buildChartData=(type)=>{
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
 };

 const pantryChartData=useMemo(()=>buildChartData("pantry"),[filteredCategoryCosts]);
 const householdChartData=useMemo(()=>buildChartData("household"),[filteredCategoryCosts]);

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
      <p className="dashboard-header-panel-text"> Manage kitchen goods, bath items, laundry products, cleaning supplies, home equipment, appliances, and stored household inventory from one central dashboard. </p>
     </div>
    </div>
   </header>

   <div className="dashboard-grid">

    <section className="dashboard-cards">
     {stats?.map((item)=>(
      <article key={item.label} className="dashboard-card">
       <div className="dashboard-card-top">
        <span className="dashboard-card-icon">{statIcons[item.label]||<Package2 size={18} strokeWidth={2.2}/>}</span>
        <p className="dashboard-card-label">{item.label}</p>
       </div>
       <p className="dashboard-card-value">{item.value}</p>
      </article>
     ))}
    </section>

    <section className="dashboard-main">

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

     <section className="dashboard-section dashboard-section-priority">
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

     <section className="dashboard-section">
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

     <section className="dashboard-section">
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

     <section className="dashboard-section dashboard-section-wide">
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

      <ul className="dashboard-list dashboard-list-two-column">
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
        <li className="dashboard-empty dashboard-empty-wide">No missing, replacement, or restock items right now.</li>
       )}
      </ul>
     </section>

    </section>

    <aside className="dashboard-sidebar">

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