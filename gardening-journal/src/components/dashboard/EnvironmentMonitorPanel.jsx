// src/components/dashboard/EnvironmentMonitorPanel.jsx
import DashboardEmpty from "./DashboardEmpty";

function EnvironmentMonitorPanel({items=[],className=""}){
 const sectionClassName=className||"dashboard-section-wide";
 const groupedItems=items.reduce((groups,item)=>{
  const label=item.label||"Garden Conditions";
  groups[label]=groups[label]||[];
  groups[label].push(item);
  return groups;
 },{});

 const monitorRows=Object.entries(groupedItems).map(([label,records])=>{
  const latest=records[0]||{};

  return {
   label,
   value:latest.value||"Observation logged",
   helper:latest.helper||"Garden condition record",
   observedAt:latest.observedAt||"",
   count:records.length
  };
 });

 return(
  <section className={`dashboard-section dashboard-environment-monitor ${sectionClassName}`.trim()}>
   <div className="dashboard-monitor-copy">
    <p className="dashboard-section-kicker">Environment Monitor</p>
    <h2 className="dashboard-section-title">Environment & system monitoring</h2>
    <p>
     Recent condition observations and follow-up readings from garden logs and growing systems.
    </p>
   </div>

   {monitorRows.length?(
    <div className="dashboard-monitor-grid" tabIndex={0} role="region" aria-label="Environmental readings">
     {monitorRows.map(row=>(
     <article key={row.label} className="dashboard-monitor-card">
      <div>
       <span>{row.label}</span>
       <strong>{row.value}</strong>
       <p>{row.helper}</p>
       <small>{row.observedAt||"Date not listed"} · {row.count} record{row.count===1?"":"s"}</small>
      </div>
     </article>
     ))}
    </div>
   ):(
    <DashboardEmpty message="No environment or system monitoring readings have been logged yet."/>
   )}
  </section>
 );
}

export default EnvironmentMonitorPanel;
