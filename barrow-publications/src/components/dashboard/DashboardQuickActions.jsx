import {Link} from "react-router-dom";
import {useState} from "react";
import {BookOpen,CalendarDays,ClipboardList,Megaphone,PenLine,Search,Store,X} from "lucide-react";

const actions=[
 {
  to:"/publishing/acquisitions/submissions",
  label:"New Submission",
  text:"Open acquisitions intake for queries, packets, and manuscript submissions.",
  icon:Search,
  primary:true
 },
 {
  to:"/publishing/editorial/developmental-editing",
  label:"Editorial Review",
  text:"Open developmental editing and manuscript review workflow.",
  icon:PenLine
 },
 {
  to:"/publishing/production/cover-design",
  label:"Cover Design",
  text:"Open production tracking for cover briefs, drafts, and approvals.",
  icon:BookOpen
 },
 {
  to:"/publishing/release/isbn-metadata",
  label:"ISBN & Metadata",
  text:"Open release metadata, ISBN, category, and contributor workflow.",
  icon:ClipboardList
 },
 {
  to:"/publishing/release/schedule",
  label:"Release Schedule",
  text:"Open publication dates, dependencies, and launch milestones.",
  icon:CalendarDays
 },
 {
  to:"/publishing/marketing/campaigns",
  label:"Campaigns",
  text:"Open marketing campaign planning and launch assets.",
  icon:Megaphone
 },
 {
  to:"/publishing/sales-rights/royalties",
  label:"Royalties",
  text:"Open royalty terms, statements, balances, and payment tracking.",
  icon:Store
 }
];

function DashboardQuickActions(){
 const [open,setOpen]=useState(false);

 return(
  <aside className={open?"dashboard-actions-wrap is-open":"dashboard-actions-wrap"} aria-label="Quick Actions">
   <button
    type="button"
    className="dashboard-actions-tab"
    onClick={()=>setOpen(prev=>!prev)}
    aria-expanded={open}
    aria-controls="dashboard-quick-actions"
   >
    Quick Actions
   </button>

   {open&&(
    <button
     type="button"
     className="dashboard-actions-scrim"
     onClick={()=>setOpen(false)}
     aria-label="Close quick actions"
    />
   )}

   <section className="dashboard-actions" id="dashboard-quick-actions">
    <div className="dashboard-actions-head">
     <div>
      <p className="dashboard-section-kicker">Quick Actions</p>
      <h2 className="dashboard-section-title">Publishing Shortcuts</h2>
     </div>

     <button type="button" className="dashboard-actions-close" onClick={()=>setOpen(false)} aria-label="Close quick actions">
      <X size={18} strokeWidth={2.2}/>
     </button>
    </div>

    <div className="dashboard-actions-grid">
     {actions.map(action=>{
      const Icon=action.icon;

      return(
       <Link
        to={action.to}
        className={action.primary?"dashboard-action dashboard-action-primary":"dashboard-action"}
        key={action.to}
       >
        <span className="dashboard-action-icon"><Icon size={18} strokeWidth={2.2}/></span>
        <span className="dashboard-action-copy">
         <span className="dashboard-action-label">{action.label}</span>
         <span className="dashboard-action-text">{action.text}</span>
        </span>
       </Link>
      );
     })}
    </div>
   </section>
  </aside>
 );
}

export default DashboardQuickActions;
