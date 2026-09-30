import {Link} from "react-router-dom";

function ReadingPlanCard({plans}) {
 return(
  <section className="dashboard-section dashboard-reading-plan">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Reading Plan</p>
     <h2 className="dashboard-section-title">Study Schedule</h2>
    </div>
    <Link to="/reading-planner" className="dashboard-section-link">Add plan</Link>
   </div>

   {!plans.length?<div className="dashboard-empty">No active reading plan yet. Use Add plan to schedule books by subject and day.</div>:(
    <ul className="dashboard-plan-list">
     {plans.slice(0,6).map(plan=>(
      <li key={plan._id} className="dashboard-plan-item">
       <div>
        <div className="dashboard-plan-subject">{plan.subject||"General"}</div>
        <div className="dashboard-plan-title">{plan.bookTitle||plan.name}</div>
       </div>
       <div className="dashboard-plan-meta">
        <span>{plan.daysLabel||"Flexible"}</span>
        <Link to={`/books?book=${encodeURIComponent(plan.bookId)}`}>Open</Link>
       </div>
      </li>
     ))}
    </ul>
   )}
  </section>
 );
}

export default ReadingPlanCard;
