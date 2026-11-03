import {Link} from "react-router-dom";
import DashboardSection from "./DashboardSection.jsx";

function PrepPlanningPanel({prepItems=[]}){
 return(
  <DashboardSection className="dashboard-panel-prep" kicker="Kitchen Planning" title="Menu & Prep Planning">
   {prepItems.length?(
    <div className="dashboard-list">
     {prepItems.map(item=>(
      <article className="dashboard-list-item" key={item._id}>
       <div className="dashboard-list-content">
        <strong className="dashboard-item-title">{item.name}</strong>
        <span className="dashboard-item-meta">{item.recipeCount||0} assigned recipes</span>
       </div>
      </article>
     ))}
    </div>
   ):<p className="dashboard-empty">No menus available for prep planning.</p>}
   <Link className="btn btn-outline-primary" to="/menu-planning">Open Menu Planning</Link>
  </DashboardSection>
 );
}

export default PrepPlanningPanel;
