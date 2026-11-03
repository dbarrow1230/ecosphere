// src/components/dashboard/DashboardHeader.jsx
function DashboardHeader({loading,error,totalBooks,activeLoans,authorsCount,publishersCount,dashboardIcon}){
 const stats=[
  {label:"active loans",value:activeLoans},
  {label:"authors",value:authorsCount},
  {label:"publishers",value:publishersCount}
 ];

 return(
  <header className="dashboard-header">
   <div className="dashboard-header-copy">
    <p className="dashboard-eyebrow">Library Overview</p>
    <h1 className="dashboard-title">Dashboard</h1>
    <p className="dashboard-text">
     Track your reading activity and manage your personal library.
    </p>
   </div>

   <div className="dashboard-header-panel">
    <div className="dashboard-header-panel-icon">{dashboardIcon}</div>
    <div className="dashboard-header-panel-copy">
     <p className="dashboard-header-panel-label">Snapshot</p>
     <h2 className="dashboard-header-panel-title">{loading?"Loading library...":`${totalBooks} books in your catalog`}</h2>
     {error?(
      <p className="dashboard-header-panel-text">{error}</p>
     ):(
      <div className="dashboard-header-stats">
       {stats.map((stat,index)=>(
        <span key={stat.label} className={`dashboard-header-stat dashboard-header-stat-${index+1}`}>
         <strong>{stat.value}</strong>
         <span>{stat.label}</span>
        </span>
       ))}
      </div>
     )}
    </div>
   </div>
  </header>
 );

}

export default DashboardHeader;
