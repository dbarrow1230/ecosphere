// src/components/dashboard/ExpiringItemsPanel.jsx
import DashboardSection from "./DashboardSection.jsx";

function ExpiringItemsPanel({expiringItems=[]}){
 return(
  <DashboardSection kicker="Planning" title="Upcoming Prep Items">
   {expiringItems.length?(
    <div className="dashboard-list">
     {expiringItems.map(item=>(
      <article className="dashboard-list-item" key={item._id}>
       <strong>{item.name}</strong>
       <span>{item.date}</span>
      </article>
     ))}
    </div>
   ):(
    <p className="dashboard-empty">No upcoming prep items found.</p>
   )}
  </DashboardSection>
 );
}

export default ExpiringItemsPanel;