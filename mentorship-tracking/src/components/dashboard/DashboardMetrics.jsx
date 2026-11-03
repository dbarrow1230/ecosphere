import {Link} from "react-router-dom";
import {CalendarClock,ClipboardCheck,Flag,Target,UserRoundPlus,UsersRound} from "lucide-react";

const metricIcons={
 incoming:UserRoundPlus,
 active:UsersRound,
 scheduled:CalendarClock,
 pending:ClipboardCheck,
 warning:Target,
 danger:Flag
};

function DashboardMetrics({metrics}){
 return(
  <section className="mentor-dashboard-metrics" aria-label="Mentorship workflow metrics">
   {metrics.map(metric=>{
    const Icon=metricIcons[metric.tone]||Target;
    const content=(
     <>
      <Icon size={18} aria-hidden="true"/>
      <span>{metric.label}</span>
      <strong>{metric.value}</strong>
     </>
    );
    return metric.to.startsWith("#")?(
     <a className={`mentor-metric mentor-metric-${metric.tone||"primary"}`} key={metric.label} href={metric.to}>{content}</a>
    ):(
     <Link className={`mentor-metric mentor-metric-${metric.tone||"primary"}`} key={metric.label} to={metric.to} state={{fromDashboard:true}}>{content}</Link>
    );
   })}
  </section>
 );
}

export default DashboardMetrics;
