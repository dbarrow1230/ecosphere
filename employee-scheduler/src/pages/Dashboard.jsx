// src/pages/Dashboard.jsx
import {useMemo,useState} from "react";
import {Link} from "react-router-dom";
import {Users,TriangleAlert,Clock3,Plus,ArrowRight,ChartColumnStacked,CalendarDays,ClipboardList,UserPlus,Settings2} from "lucide-react";
import "../styles/Dashboard.css";

function Dashboard({stats,lowStockItems,expiringItems,recentItems,missingItems,categoryCosts=[]}){

 const [yearFilter,setYearFilter]=useState("all");
 const [monthFilter,setMonthFilter]=useState("all");

 const statIcons={
  "Total Employees":<Users size={18} strokeWidth={2.2}/>,
  "Open Shifts":<TriangleAlert size={18} strokeWidth={2.2}/>,
  "Upcoming Shifts":<Clock3 size={18} strokeWidth={2.2}/>,
  "Departments":<ChartColumnStacked size={18} strokeWidth={2.2}/>
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
    const key=item.category||item.department||item.role||"General";
    totals[key]=(totals[key]||0)+Number(item.cost||item.hours||0);
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

 const scheduledHoursChartData=useMemo(()=>buildChartData("scheduled"),[filteredCategoryCosts]);
 const overtimeHoursChartData=useMemo(()=>buildChartData("overtime"),[filteredCategoryCosts]);

 return(
  <section className="dashboard">

   <header className="dashboard-header">
    <div className="dashboard-header-copy">
     <p className="dashboard-eyebrow">Employee Scheduling</p>

     <p className="dashboard-text">
      Manage employee schedules, assign shifts, track availability, and keep your team organized in one central system.
     </p>
    </div>

    <div className="dashboard-header-panel">
     <div className="dashboard-header-panel-icon">
      <CalendarDays size={26} strokeWidth={2.1}/>
     </div>

     <div className="dashboard-header-panel-copy">
      <p className="dashboard-header-panel-label">Overview</p>
      <h3 className="dashboard-header-panel-title">Your team, scheduled.</h3>
      <p className="dashboard-header-panel-text"> Manage shifts, employee assignments, coverage gaps, and schedule activity from one central dashboard. </p>
     </div>
    </div>
   </header>

   <div className="dashboard-grid">

    <section className="dashboard-cards">
     {stats?.map((item)=>(
      <article key={item.label} className="dashboard-card">
       <div className="dashboard-card-top">
        <span className="dashboard-card-icon">{statIcons[item.label]||<Users size={18} strokeWidth={2.2}/>}</span>
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
        <p className="dashboard-section-kicker">Shift Analytics</p>
        <h2 className="dashboard-section-title">Hours by Department</h2>
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
         <h3 className="dashboard-chart-title">Scheduled Hours</h3>
        </div>

        <div className="dashboard-chart-body">
         {scheduledHoursChartData.length?scheduledHoursChartData.map((item)=>(
          <div key={item.category} className="dashboard-bar-row">
           <div className="dashboard-bar-meta">
            <span className="dashboard-bar-label">{item.category}</span>
            <span className="dashboard-bar-value">{item.cost.toFixed(2)} hrs</span>
           </div>

           <div className="dashboard-bar-track">
            <div className="dashboard-bar-fill dashboard-bar-fill-pantry" style={{width:item.width}}/>
           </div>
          </div>
         )):(
          <div className="dashboard-empty">No scheduled hours data for the selected period.</div>
         )}
        </div>
       </div>

       <div className="dashboard-chart-card">
        <div className="dashboard-chart-head">
         <h3 className="dashboard-chart-title">Overtime Hours</h3>
        </div>

        <div className="dashboard-chart-body">
         {overtimeHoursChartData.length?overtimeHoursChartData.map((item)=>(
          <div key={item.category} className="dashboard-bar-row">
           <div className="dashboard-bar-meta">
            <span className="dashboard-bar-label">{item.category}</span>
            <span className="dashboard-bar-value">{item.cost.toFixed(2)} hrs</span>
           </div>

           <div className="dashboard-bar-track">
            <div className="dashboard-bar-fill dashboard-bar-fill-household" style={{width:item.width}}/>
           </div>
          </div>
         )):(
          <div className="dashboard-empty">No overtime hours data for the selected period.</div>
         )}
        </div>
       </div>

      </div>
     </section>

     <section className="dashboard-section dashboard-section-priority">
      <div className="dashboard-section-head">
       <div>
        <p className="dashboard-section-kicker">Attention Needed</p>
        <h2 className="dashboard-section-title">Open Shifts</h2>
       </div>

       <Link to="/shifts" className="dashboard-section-link">
        View all
        <ArrowRight size={16} strokeWidth={2.1}/>
       </Link>
      </div>

      <ul className="dashboard-list">
       {lowStockItems?.length?lowStockItems.map((item)=>(
        <li key={item._id||item.id||item.name} className="dashboard-list-item">
         <span className="dashboard-list-icon"><TriangleAlert size={17} strokeWidth={2.2}/></span>

         <div className="dashboard-list-content">
          <span className="dashboard-item-title">{item.name||item.shiftName||"Open Shift"}</span>
          <span className="dashboard-item-meta">
           {item.date||item.shiftDate||"Unscheduled"} · {item.location||item.department||item.role||"Coverage Needed"}
          </span>
         </div>
        </li>
       )):(
        <li className="dashboard-empty">No open shifts right now.</li>
       )}
      </ul>
     </section>

     <section className="dashboard-section">
      <div className="dashboard-section-head">
       <div>
        <p className="dashboard-section-kicker">Coming Up</p>
        <h2 className="dashboard-section-title">Upcoming Shifts</h2>
       </div>

       <Link to="/schedule" className="dashboard-section-link">
        View schedule
        <ArrowRight size={16} strokeWidth={2.1}/>
       </Link>
      </div>

      <ul className="dashboard-list">
       {expiringItems?.length?expiringItems.map((item)=>(
        <li key={item._id||item.id||item.name} className="dashboard-list-item">
         <span className="dashboard-list-icon dashboard-list-icon-accent"><Clock3 size={17} strokeWidth={2.2}/></span>

         <div className="dashboard-list-content">
          <span className="dashboard-item-title">{item.name||item.shiftName||"Scheduled Shift"}</span>
          <span className="dashboard-item-meta">
           {item.expirationDate||item.expiryDate||item.date||item.shiftDate||"Scheduled"} · {item.location||item.department||item.employee||"Team Schedule"}
          </span>
         </div>
        </li>
       )):(
        <li className="dashboard-empty">No upcoming shifts right now.</li>
       )}
      </ul>
     </section>

     <section className="dashboard-section">
      <div className="dashboard-section-head">
       <div>
        <p className="dashboard-section-kicker">Recent Activity</p>
        <h2 className="dashboard-section-title">Recent Assignments</h2>
       </div>

       <Link to="/schedule" className="dashboard-section-link">
        View schedule
        <ArrowRight size={16} strokeWidth={2.1}/>
       </Link>
      </div>

      <ul className="dashboard-list">
       {recentItems?.length?recentItems.map((item)=>(
        <li key={item._id||item.id||item.name} className="dashboard-list-item">
         <span className="dashboard-list-icon dashboard-list-icon-soft"><Users size={17} strokeWidth={2.2}/></span>

         <div className="dashboard-list-content">
          <span className="dashboard-item-title">{item.name||item.employee||item.shiftName||"Shift Assignment"}</span>
          <span className="dashboard-item-meta">
           {item.category||item.role||item.department||"General Shift"} · {item.location||item.date||item.shiftDate||"Schedule"}
          </span>
         </div>
        </li>
       )):(
        <li className="dashboard-empty">No recent scheduling activity.</li>
       )}
      </ul>
     </section>

     <section className="dashboard-section dashboard-section-wide">
      <div className="dashboard-section-head">
       <div>
        <p className="dashboard-section-kicker">Coverage</p>
        <h2 className="dashboard-section-title">Unassigned Shifts</h2>
       </div>

       <Link to="/shifts" className="dashboard-section-link">
        Manage shifts
        <ArrowRight size={16} strokeWidth={2.1}/>
       </Link>
      </div>

      <ul className="dashboard-list dashboard-list-two-column">
       {missingItems?.length?missingItems.map((item)=>(
        <li key={item._id||item.id||item.name} className="dashboard-list-item">
         <span className="dashboard-list-icon dashboard-list-icon-warning"><ClipboardList size={17} strokeWidth={2.2}/></span>

         <div className="dashboard-list-content">
          <span className="dashboard-item-title">{item.name||item.shiftName||"Unassigned Shift"}</span>
          <span className="dashboard-item-meta">
           {item.category||item.department||item.role||"General"} · {item.location||item.date||item.shiftDate||"Needs Coverage"}
          </span>
         </div>
        </li>
       )):(
        <li className="dashboard-empty dashboard-empty-wide">No unassigned shifts right now.</li>
       )}
      </ul>
     </section>

    </section>

    <aside className="dashboard-sidebar">

     <section className="dashboard-actions">
      <div className="dashboard-actions-head">
       <p className="dashboard-section-kicker">Quick Actions</p>
       <h2 className="dashboard-section-title">Scheduling</h2>
      </div>

      <div className="dashboard-actions-grid">
       <Link to="/shifts/add" className="dashboard-action dashboard-action-primary">
        <span className="dashboard-action-icon"><Plus size={18} strokeWidth={2.2}/></span>
        <span className="dashboard-action-copy">
         <span className="dashboard-action-label">Create Shift</span>
         <span className="dashboard-action-text">Add a new shift to the schedule</span>
        </span>
       </Link>

       <Link to="/schedule" className="dashboard-action">
        <span className="dashboard-action-icon"><CalendarDays size={18} strokeWidth={2.2}/></span>
        <span className="dashboard-action-copy">
         <span className="dashboard-action-label">View Schedule</span>
         <span className="dashboard-action-text">Manage team shifts</span>
        </span>
       </Link>

       <Link to="/employees" className="dashboard-action">
        <span className="dashboard-action-icon"><UserPlus size={18} strokeWidth={2.2}/></span>
        <span className="dashboard-action-copy">
         <span className="dashboard-action-label">Manage Employees</span>
         <span className="dashboard-action-text">Add or update staff</span>
        </span>
       </Link>

       <Link to="/availability" className="dashboard-action">
        <span className="dashboard-action-icon"><Settings2 size={18} strokeWidth={2.2}/></span>
        <span className="dashboard-action-copy">
         <span className="dashboard-action-label">Availability</span>
         <span className="dashboard-action-text">Track employee availability</span>
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