// src/components/dashboard/QuickActionsPanel.jsx
import {useState} from "react";
import {NavLink} from "react-router-dom";

function QuickActionsPanel(){
 const [open,setOpen]=useState(false);

 return(
  <div className={`dashboard-actions-drawer${open?" is-open":""}`}>
   <button type="button" className="dashboard-actions-tab" onClick={()=>setOpen(current=>!current)} aria-expanded={open} aria-controls="recipe-dashboard-actions">
    <span className="dashboard-actions-tab-icon" aria-hidden="true">+</span>
    <span className="dashboard-actions-tab-text">Quick Actions</span>
   </button>

   <section className="dashboard-actions" id="recipe-dashboard-actions" aria-hidden={!open}>
    <div className="dashboard-actions-head">
     <div>
      <p className="dashboard-section-kicker">Quick Actions</p>
      <h2 className="dashboard-section-title">Recipe Tools</h2>
     </div>

     <button type="button" className="dashboard-actions-close" onClick={()=>setOpen(false)} aria-label="Close quick actions">
      ×
     </button>
    </div>

    <div className="dashboard-actions-grid">
     <NavLink className="dashboard-action dashboard-action-primary" to="/recipes" onClick={()=>setOpen(false)}>
      <span className="dashboard-action-icon">+</span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Recipes</span>
       <span className="dashboard-action-text">Open the recipe database.</span>
      </span>
     </NavLink>

     <NavLink className="dashboard-action" to="/ingredients" onClick={()=>setOpen(false)}>
      <span className="dashboard-action-icon">•</span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Ingredients</span>
       <span className="dashboard-action-text">Manage ingredient records.</span>
      </span>
     </NavLink>

     <NavLink className="dashboard-action" to="/categories" onClick={()=>setOpen(false)}>
      <span className="dashboard-action-icon">•</span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Categories</span>
       <span className="dashboard-action-text">Manage recipe categories.</span>
      </span>
     </NavLink>

     <NavLink className="dashboard-action" to="/menus" onClick={()=>setOpen(false)}>
      <span className="dashboard-action-icon">•</span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Menus</span>
       <span className="dashboard-action-text">Build and organize menus.</span>
      </span>
     </NavLink>
    </div>
   </section>
  </div>
 );
}

export default QuickActionsPanel;
