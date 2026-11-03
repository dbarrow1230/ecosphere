import {Link} from "react-router-dom";

function ReadingGoalCard({goal,derived}) {
 const activeGoal=goal||derived;
 const targetPages=Number(activeGoal?.targetPages||0);
 const pagesRead=Number(activeGoal?.pagesRead||0);
 const targetBooks=Number(activeGoal?.targetBooks||0);
 const booksCompleted=Number(activeGoal?.booksCompleted||0);
 const pagePercent=targetPages?Math.min(100,Math.round((pagesRead/targetPages)*100)):0;
 const bookPercent=targetBooks?Math.min(100,Math.round((booksCompleted/targetBooks)*100)):0;
 const now=new Date();
 const dayOfMonth=now.getDate();
 const daysInMonth=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();
 const expectedPages=targetPages?Math.round((targetPages/daysInMonth)*dayOfMonth):0;
 const pagesBehind=Math.max(0,expectedPages-pagesRead);

 return(
  <section className="dashboard-section dashboard-reading-goal">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Goal</p>
     <h2 className="dashboard-section-title">{activeGoal?.name||"Reading Goal"}</h2>
    </div>
    <div className="dashboard-goal-actions">
     <span className={`dashboard-goal-pill${pagesBehind?" is-behind":""}`}>{pagesBehind?`${pagesBehind} pages behind`:"On pace"}</span>
     <Link to="/reading-planner" className="dashboard-section-link">Set goal</Link>
    </div>
   </div>

   {!goal?<div className="dashboard-empty">No saved goal for this period yet. Showing live progress from finished/current books.</div>:null}

   <div className="dashboard-goal-meter">
    <div>
     <span>Pages</span>
     <strong>{pagesRead} / {targetPages||"set target"}</strong>
    </div>
    <div className="dashboard-progress-track"><div className="dashboard-progress-fill" style={{width:`${pagePercent}%`}} /></div>
   </div>

   <div className="dashboard-goal-meter">
    <div>
     <span>Books</span>
     <strong>{booksCompleted} / {targetBooks||"set target"}</strong>
    </div>
    <div className="dashboard-progress-track"><div className="dashboard-progress-fill dashboard-progress-fill-alt" style={{width:`${bookPercent}%`}} /></div>
   </div>
  </section>
 );
}

export default ReadingGoalCard;
