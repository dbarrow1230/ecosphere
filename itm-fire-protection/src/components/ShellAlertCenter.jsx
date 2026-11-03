import {useState} from "react";
import {Link} from "react-router-dom";
const shellAlerts=[];
import "../styles/ShellAlertCenter.css";

export default function ShellAlertCenter({mode="drawer"}){
 const [open,setOpen]=useState(false);
 const total=shellAlerts.reduce((count,group)=>count+group.items.length,0);

 const content=(
  <>
   <header className="shell-alert-center-head">
    <div>
     <span>Cross-application attention</span>
     <h2>Reminders, alerts & next actions</h2>
     <p>Grouped by application so you can see where each item came from.</p>
    </div>
    <strong>{total}</strong>
   </header>

   <div className="shell-alert-groups">
    {shellAlerts.map(group=>(
     <section className="shell-alert-group" key={group.appId}>
      <header>
       <h3>{group.appTitle}</h3>
       <Link to={`/applications/${encodeURIComponent(group.appId)}`}>Open application</Link>
      </header>
      <ul>
       {group.items.map(item=>(
        <li key={item.id}>
         <span className={`shell-alert-type is-${item.type}`}>{item.type}</span>
         <div>
          <strong>{item.title}</strong>
          <p>{item.detail}</p>
          <small>{item.time}</small>
         </div>
        </li>
       ))}
      </ul>
     </section>
    ))}
   </div>
  </>
 );

 if(mode==="dashboard")return <section className="shell-alert-center is-dashboard">{content}</section>;

 return(
  <aside className={`shell-alert-center is-drawer${open?" is-open":""}`} aria-label="Shell reminders and alerts">
   <button className="shell-alert-toggle" type="button" onClick={()=>setOpen(value=>!value)} aria-expanded={open}>
    <span aria-hidden="true">!</span>
    <span>{open?"Close":"Alerts"}</span>
    <b>{total}</b>
   </button>
   {open&&content}
  </aside>
 );
}
