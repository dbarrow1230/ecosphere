// src/components/dashboard/DashboardFilters.jsx
function DashboardFilters({
 months=[],
 availableYears=[],
 yearFilter,
 monthFilter,
 onYearChange,
 onMonthChange
}){
 return(
  <div className="dashboard-filters">
   <label className="dashboard-filter">
    <span className="dashboard-filter-label">Year</span>
    <select className="dashboard-filter-select" value={yearFilter} onChange={event=>onYearChange(event.target.value)}>
     <option value="all">All Years</option>
     {availableYears.map(year=>(
      <option key={year} value={year}>{year}</option>
     ))}
    </select>
   </label>

   <label className="dashboard-filter">
    <span className="dashboard-filter-label">Month</span>
    <select className="dashboard-filter-select" value={monthFilter} onChange={event=>onMonthChange(event.target.value)}>
     <option value="all">All Months</option>
     {months.map(month=>(
      <option key={month.value} value={month.value}>{month.label}</option>
     ))}
    </select>
   </label>
  </div>
 );
}

export default DashboardFilters;