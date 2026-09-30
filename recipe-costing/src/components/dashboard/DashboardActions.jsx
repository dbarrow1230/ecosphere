// src/components/dashboard/DashboardActions.jsx
import {useState} from "react";
import {Link} from "react-router-dom";

function DashboardActions({plusIcon,bookIcon,authorIcon,publisherIcon}){
 const [open,setOpen]=useState(false);

 return(
  <>
   <button type="button" className="dashboard-actions-tab" onClick={()=>setOpen(true)}>Quick Actions</button>
   {open?<button type="button" className="dashboard-actions-scrim" aria-label="Close quick actions" onClick={()=>setOpen(false)} />:null}
   <section className={`dashboard-actions${open?" is-open":""}`}>
    <div className="dashboard-actions-head">
     <div>
      <p className="dashboard-section-kicker">Quick Actions</p>
      <h2 className="dashboard-section-title">Manage Library</h2>
     </div>
     <button type="button" className="dashboard-actions-close" onClick={()=>setOpen(false)}>Close</button>
    </div>

    <div className="dashboard-actions-grid">
     <Link to="/reading-planner" className="dashboard-action dashboard-action-primary">
      <div className="dashboard-action-icon">{plusIcon}</div>
      <div className="dashboard-action-copy">
       <span className="dashboard-action-label">Reading Planner</span>
       <span className="dashboard-action-text">Set goals and schedule reading days.</span>
      </div>
     </Link>

     <Link to="/books/new" className="dashboard-action dashboard-action-primary">
     <div className="dashboard-action-icon">{plusIcon}</div>
     <div className="dashboard-action-copy">
      <span className="dashboard-action-label">Add Book</span>
      <span className="dashboard-action-text">Create a new book record.</span>
     </div>
     </Link>

     <Link to="/books" className="dashboard-action">
     <div className="dashboard-action-icon">{bookIcon}</div>
     <div className="dashboard-action-copy">
      <span className="dashboard-action-label">View Library</span>
      <span className="dashboard-action-text">Browse all saved books.</span>
     </div>
     </Link>

     <Link to="/authors" className="dashboard-action">
     <div className="dashboard-action-icon">{authorIcon}</div>
     <div className="dashboard-action-copy">
      <span className="dashboard-action-label">Manage Authors</span>
      <span className="dashboard-action-text">Update writer records.</span>
     </div>
     </Link>

     <Link to="/publishers" className="dashboard-action">
     <div className="dashboard-action-icon">{publisherIcon}</div>
     <div className="dashboard-action-copy">
      <span className="dashboard-action-label">Manage Publishers</span>
      <span className="dashboard-action-text">Review publisher information.</span>
     </div>
     </Link>
    </div>
   </section>
  </>
 );

}

export default DashboardActions;
