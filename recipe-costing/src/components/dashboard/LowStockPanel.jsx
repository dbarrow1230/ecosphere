// src/components/dashboard/LowStockPanel.jsx
import DashboardSection from "./DashboardSection.jsx";

function LowStockPanel({lowStockItems=[]}){
 return(
  <DashboardSection kicker="Review Queue" title="Recipes To Review">
   {lowStockItems.length?(
    <div className="dashboard-list">
     {lowStockItems.map(item=>(
      <article className="dashboard-list-item" key={item._id}>
       <strong>{item.name}</strong>
       <span>{item.quantity} {item.unit}</span>
       <small>{item.category}</small>
      </article>
     ))}
    </div>
   ):(
    <p className="dashboard-empty">No recipes need review.</p>
   )}
  </DashboardSection>
 );
}

export default LowStockPanel;