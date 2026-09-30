// src/components/dashboard/RecentItemsPanel.jsx
import {Link} from "react-router-dom";
import {ArrowRight,BookOpen} from "lucide-react";
import DashboardEmpty from "./DashboardEmpty";

function RecentItemsPanel({recentItems=[]}){

 return(
  <section className="dashboard-section">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Recently Added</p>
     <h2 className="dashboard-section-title">New Poems</h2>
    </div>

    <Link to="/poems" className="dashboard-section-link">
     Browse poems
     <ArrowRight size={16} strokeWidth={2.1}/>
    </Link>
   </div>

   <ul className="dashboard-list">
    {recentItems?.length?recentItems.map((item)=>(
     <li key={item._id||item.id||item.name} className="dashboard-list-item">
      <span className="dashboard-list-icon dashboard-list-icon-soft"><BookOpen size={17} strokeWidth={2.2}/></span>

      <div className="dashboard-list-content">
       <span className="dashboard-item-title">{item.title||item.name||"Untitled Poem"}</span>
       <span className="dashboard-item-meta">
        {item.author?.name||item.authorName||item.genre?.name||item.genre||"Poetry Entry"}
       </span>
      </div>
     </li>
    )):(
     <DashboardEmpty as="li" message="No poems have been added yet."/>
    )}
   </ul>
  </section>
 );
}

export default RecentItemsPanel;
