// src/components/dashboard/RecentItemsPanel.jsx
import DashboardSection from "./DashboardSection.jsx";

function RecentItemsPanel({recentItems=[]}){
 return(
  <DashboardSection kicker="Recent Activity" title="Recently Added Recipes">
   {recentItems.length?(
    <div className="dashboard-list">
     {recentItems.map(item=>(
      <article className="dashboard-list-item" key={item._id}>
       <strong>{item.name}</strong>
       <span>{item.category}</span>
       <small>{item.location}</small>
      </article>
     ))}
    </div>
   ):(
    <p className="dashboard-empty">No recent recipes found.</p>
   )}
  </DashboardSection>
 );
}

export default RecentItemsPanel;