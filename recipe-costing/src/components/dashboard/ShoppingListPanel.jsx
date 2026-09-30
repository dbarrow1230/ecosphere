// src/components/dashboard/ShoppingListPanel.jsx
import DashboardSection from "./DashboardSection.jsx";

function ShoppingListPanel({missingItems=[]}){
 return(
  <DashboardSection kicker="Missing Data" title="Recipes Missing Details">
   {missingItems.length?(
    <div className="dashboard-list">
     {missingItems.map(item=>(
      <article className="dashboard-list-item" key={item._id}>
       <strong>{item.name}</strong>
       <span>{item.note}</span>
      </article>
     ))}
    </div>
   ):(
    <p className="dashboard-empty">No missing recipe details found.</p>
   )}
  </DashboardSection>
 );
}

export default ShoppingListPanel;