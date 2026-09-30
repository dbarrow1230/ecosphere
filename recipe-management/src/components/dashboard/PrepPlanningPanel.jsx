import DashboardSection from "./DashboardSection.jsx";

function PrepPlanningPanel({prepItems=[]}){
 return(
  <DashboardSection className="dashboard-panel-prep" kicker="Kitchen Planning" title="Upcoming Prep Items">
   {prepItems.length?(
    <div className="dashboard-list">
     {prepItems.map(item=>(
      <article className="dashboard-list-item" key={item._id}>
       <div className="dashboard-list-content">
        <strong className="dashboard-item-title">{item.name}</strong>
        <span className="dashboard-item-meta">{item.date||"Date not scheduled"}</span>
       </div>
      </article>
     ))}
    </div>
   ):<p className="dashboard-empty">No upcoming prep items found.</p>}
  </DashboardSection>
 );
}

export default PrepPlanningPanel;
