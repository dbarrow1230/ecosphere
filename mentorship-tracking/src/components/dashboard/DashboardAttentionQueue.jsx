import {Link} from "react-router-dom";
import {Flag} from "lucide-react";

function DashboardAttentionQueue({pendingTimesheets,flaggedMentees,goalsNeedingWork,flaggedNotes,agreementsInProgress}){
 return(
  <section className="mentor-lower-grid">
   <article className="mentor-queue">
    <header><Flag size={18}/><h2>Attention Queue</h2></header>
    <Link to="/timesheets" state={{fromDashboard:true}}><span>Pending timesheets</span><strong>{pendingTimesheets}</strong></Link>
    <Link to="/mentees?filter=flagged" state={{fromDashboard:true}}><span>Flagged mentees</span><strong>{flaggedMentees}</strong></Link>
    <Link to="/mentees?filter=active" state={{fromDashboard:true}}><span>Goals needing work</span><strong>{goalsNeedingWork}</strong></Link>
    <Link to="/mentees?filter=active" state={{fromDashboard:true}}><span>Notes requiring follow-up</span><strong>{flaggedNotes}</strong></Link>
    <Link to="/mentees" state={{fromDashboard:true}}><span>Agreements in progress</span><strong>{agreementsInProgress}</strong></Link>
   </article>
  </section>
 );
}

export default DashboardAttentionQueue;
