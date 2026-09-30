import {Link} from "react-router-dom";
import {ArrowRight,CalendarClock,ClipboardCheck,LayoutDashboard,TriangleAlert} from "lucide-react";

export default function OverviewSummary({attention,overdue,blocked,review}){
 return <header className="overview-summary"><div className="overview-summary-copy"><p className="overview-eyebrow"><LayoutDashboard size={17}/> Main dashboard</p><h1>Publishing overview</h1><p>A clear view of the operation before you open the publishing workspace.</p><Link to="/publishing/dashboard">Open Publishing Dashboard <ArrowRight size={18}/></Link></div><div className="overview-attention"><span>Needs attention</span><strong>{attention}</strong><p>{attention?"Items need a deadline, decision, or resolution.":"Your publishing work is clear right now."}</p><div><span><CalendarClock size={17}/>{overdue} overdue</span><span><TriangleAlert size={17}/>{blocked} blocked</span><span><ClipboardCheck size={17}/>{review} in review</span></div></div></header>;
}
