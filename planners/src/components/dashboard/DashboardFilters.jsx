// src/components/dashboard/DashboardFilters.jsx
function DashboardFilters({months=[],availableYears=[],yearFilter="all",monthFilter="all",onYearChange,onMonthChange}){

 return(
  <div className="dashboard-filters">
   <label className="dashboard-filter">
    <span className="dashboard-filter-label">Year</span>
    <select value={yearFilter} onChange={(e)=>onYearChange(e.target.value)} className="dashboard-filter-select">
     <option value="all">All</option>
     {availableYears.map((year)=>(
      <option key={year} value={String(year)}>{year}</option>
     ))}
    </select>
   </label>

   <label className="dashboard-filter">
    <span className="dashboard-filter-label">Month</span>
    <select value={monthFilter} onChange={(e)=>onMonthChange(e.target.value)} className="dashboard-filter-select">
     <option value="all">All</option>
     {months.map((month)=>(
      <option key={month.value} value={month.value}>{month.label}</option>
     ))}
    </select>
   </label>
  </div>
 );
}

export default DashboardFilters;