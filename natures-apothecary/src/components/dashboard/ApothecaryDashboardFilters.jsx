import {FaRedo,FaSyncAlt} from "react-icons/fa";

const monthNames=[
 "January",
 "February",
 "March",
 "April",
 "May",
 "June",
 "July",
 "August",
 "September",
 "October",
 "November",
 "December"
];

const getCurrentDateFilter=()=>{
 const today=new Date();

 return {
  year:String(today.getFullYear()),
  month:String(today.getMonth()+1),
  day:"all"
 };
};

const getDaysInMonth=(year,month)=>{
 if(year==="all"||month==="all")return 31;
 return new Date(Number(year),Number(month),0).getDate();
};

function ApothecaryDashboardFilters({
 dateFilter,
 loading=false,
 onDateFilterChange,
 onRefresh
}){
 const currentYear=new Date().getFullYear();
 const years=Array.from({length:11},(_,index)=>currentYear-5+index);
 const days=Array.from({length:getDaysInMonth(dateFilter.year,dateFilter.month)},(_,index)=>index+1);
 const dayDisabled=dateFilter.year==="all"||dateFilter.month==="all";

 const updateFilter=(field,value)=>{
  const nextFilter={
   ...dateFilter,
   [field]:value
  };

  if(field==="month"&&value==="all")nextFilter.day="all";
  if(field==="year"&&value==="all"){
   nextFilter.month="all";
   nextFilter.day="all";
  }

  if(field==="month"&&dateFilter.day!=="all"){
   const lastDay=getDaysInMonth(nextFilter.year,value);
   if(Number(dateFilter.day)>lastDay)nextFilter.day=String(lastDay);
  }

  onDateFilterChange(nextFilter);
 };

 const resetCurrentMonth=()=>{
  onDateFilterChange(getCurrentDateFilter());
 };

 return(
  <section className="dashboard-section dashboard-section-wide dashboard-control-section">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Date Range</p>
     <h2 className="dashboard-section-title">Filter Apothecary Dashboard</h2>
    </div>

    <div className="dashboard-filter-actions">
     <button type="button" className="dashboard-refresh-button" onClick={resetCurrentMonth} disabled={loading}>
      <FaRedo size={16}/>
      Current Month
     </button>

     <button type="button" className="dashboard-refresh-button" onClick={onRefresh} disabled={loading}>
      <FaSyncAlt size={16}/>
      Refresh
     </button>
    </div>
   </div>

   <div className="dashboard-filters">
    <label className="dashboard-filter">
     <span className="dashboard-filter-label">Month</span>
     <select value={dateFilter.month} onChange={event=>updateFilter("month",event.target.value)} className="dashboard-filter-select">
      <option value="all">All</option>
      {monthNames.map((month,index)=>(
       <option key={month} value={String(index+1)}>{month}</option>
      ))}
     </select>
    </label>

    <label className="dashboard-filter">
     <span className="dashboard-filter-label">Day</span>
     <select
      value={dateFilter.day}
      onChange={event=>updateFilter("day",event.target.value)}
      className="dashboard-filter-select dashboard-filter-select-narrow"
      disabled={dayDisabled}
     >
      <option value="all">All</option>
      {days.map(day=>(
       <option key={day} value={String(day)}>{day}</option>
      ))}
     </select>
    </label>

    <label className="dashboard-filter">
     <span className="dashboard-filter-label">Year</span>
     <select value={dateFilter.year} onChange={event=>updateFilter("year",event.target.value)} className="dashboard-filter-select dashboard-filter-select-narrow">
      <option value="all">All</option>
      {years.map(year=>(
       <option key={year} value={String(year)}>{year}</option>
      ))}
     </select>
    </label>
   </div>
  </section>
 );
}

export default ApothecaryDashboardFilters;
