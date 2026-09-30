import {useId,useState} from "react";
import {Link} from "react-router-dom";
import {Archive,Bug,Droplets,House,Leaf,Menu,NotebookPen,Plus,Shovel,SunMedium,Wheat} from "lucide-react";

function DashboardDrawerAction({to,icon,label,text,primary=false}){
 return(
  <Link to={to} className={`dashboard-drawer-action${primary?" dashboard-drawer-action-primary":""}`}>
   <span className="dashboard-drawer-action-icon">{icon}</span>
   <span className="dashboard-drawer-action-copy">
    <span className="dashboard-drawer-action-label">{label}</span>
    <span className="dashboard-drawer-action-text">{text}</span>
   </span>
  </Link>
 );
}

function DashboardDrawer({kicker,title,children,icon}){
 const [open,setOpen]=useState(false);
 const bodyId=useId();

 return(
  <section className={`dashboard-drawer${open?" is-open":""}`}>
   <button
    type="button"
    className="dashboard-drawer-summary"
    aria-expanded={open}
    aria-controls={bodyId}
    aria-label={`${open?"Close":"Open"} ${title}`}
    onClick={()=>setOpen(current=>!current)}
   >
    <span className="dashboard-drawer-tab-content">
     <span className="dashboard-drawer-tab-text">
      <span className="dashboard-section-kicker">
       <span className="dashboard-drawer-tab-icon">{icon}</span>
       <span>{kicker}</span>
      </span>
      <span className="dashboard-section-title">{title}</span>
     </span>
    </span>
   </button>
   {open?<div id={bodyId} className="dashboard-drawer-body">{children}</div>:null}
  </section>
 );
}

function DashboardDrawers(){
 return(
  <aside className="dashboard-drawers" aria-label="Dashboard shortcuts and care focus">
   <DashboardDrawer kicker="Quick Actions" title="Garden workflow" icon={<Menu size={18} strokeWidth={2.2}/>}>
    <div className="dashboard-drawer-actions">
     <DashboardDrawerAction to="/gardens" icon={<Plus size={18} strokeWidth={2.2}/>} label="Start Plant / Seed" text="Create a dated growing instance" primary/>
     <DashboardDrawerAction to="/gardens" icon={<House size={18} strokeWidth={2.2}/>} label="Manage Gardens" text="View garden beds and sections"/>
     <DashboardDrawerAction to="/journal" icon={<NotebookPen size={18} strokeWidth={2.2}/>} label="Write Journal Entry" text="Record observations and progress"/>
     <DashboardDrawerAction to="/tasks" icon={<Shovel size={18} strokeWidth={2.2}/>} label="Garden Tasks" text="Plan watering, feeding, and care"/>
     <DashboardDrawerAction to="/harvest" icon={<Wheat size={18} strokeWidth={2.2}/>} label="Record Harvest" text="Track yield and quality"/>
     <DashboardDrawerAction to="/pests" icon={<Bug size={18} strokeWidth={2.2}/>} label="Pests & Diseases" text="Review treatment records"/>
     <DashboardDrawerAction to="/supplies" icon={<Archive size={18} strokeWidth={2.2}/>} label="Supplies" text="Manage seeds, soil, fertilizer, and tools"/>
     <DashboardDrawerAction to="/observations" icon={<SunMedium size={18} strokeWidth={2.2}/>} label="Observations" text="Track weather and garden conditions"/>
    </div>
   </DashboardDrawer>

   <DashboardDrawer kicker="Care Focus" title="Today's priorities" icon={<Droplets size={18} strokeWidth={2.2}/>}>
    <div className="dashboard-drawer-actions">
     <DashboardDrawerAction to="/tasks" icon={<Droplets size={18} strokeWidth={2.2}/>} label="Watering" text="Check watering tasks"/>
     <DashboardDrawerAction to="/fertilizer-applications" icon={<Leaf size={18} strokeWidth={2.2}/>} label="Fertilizing" text="Review feeding records"/>
    </div>
   </DashboardDrawer>
  </aside>
 );
}

export default DashboardDrawers;
