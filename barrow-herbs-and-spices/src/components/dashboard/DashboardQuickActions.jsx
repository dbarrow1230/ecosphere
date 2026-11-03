import {useState} from 'react';
import {Link} from 'react-router-dom';
import {FaBoxOpen,FaFlask,FaLeaf,FaPlus,FaTimes} from 'react-icons/fa';

export default function DashboardQuickActions(){
 const [open,setOpen]=useState(false);
 return <aside className={open?'dashboard-actions-wrap is-open':'dashboard-actions-wrap'} aria-label="Quick Actions">
  <button type="button" className="dashboard-actions-tab" onClick={()=>setOpen(value=>!value)} aria-expanded={open} aria-controls="dashboard-quick-actions">Quick Actions</button>
  {open&&<button type="button" className="dashboard-actions-scrim" onClick={()=>setOpen(false)} aria-label="Close quick actions"/>}
  <section className="dashboard-actions" id="dashboard-quick-actions">
   <div className="dashboard-actions-head"><div><p className="dashboard-section-kicker">Quick Actions</p><h2 className="dashboard-section-title">Shortcuts</h2></div><button type="button" className="dashboard-actions-close" onClick={()=>setOpen(false)} aria-label="Close quick actions"><FaTimes size={18}/></button></div>
   <div className="dashboard-actions-grid">
    <Link to="/blends/new" className="dashboard-action dashboard-action-primary"><span className="dashboard-action-icon"><FaPlus size={18}/></span><span className="dashboard-action-copy"><span className="dashboard-action-label">Create a Blend</span><span className="dashboard-action-text">Record your own formula and pack details</span></span></Link>
    <Link to="/spices" className="dashboard-action"><span className="dashboard-action-icon"><FaLeaf size={18}/></span><span className="dashboard-action-copy"><span className="dashboard-action-label">Manage Ingredients</span><span className="dashboard-action-text">Maintain your herb and spice records</span></span></Link>
    <Link to="/production" className="dashboard-action"><span className="dashboard-action-icon"><FaFlask size={18}/></span><span className="dashboard-action-copy"><span className="dashboard-action-label">Record Production</span><span className="dashboard-action-text">Make a batch and update finished stock</span></span></Link>
    <Link to="/orders" className="dashboard-action"><span className="dashboard-action-icon"><FaBoxOpen size={18}/></span><span className="dashboard-action-copy"><span className="dashboard-action-label">Review Orders</span><span className="dashboard-action-text">Confirm requests and track fulfillment</span></span></Link>
   </div>
  </section>
 </aside>;
}
