function BookWritingGoal({goal=null,onEdit}){
 return(
  <article className="book-dashboard-card book-writing-goal">
   <div className="book-dashboard-card-header">
    <p className="book-dashboard-card-kicker">Goal</p>
    <h2 className="book-dashboard-card-title">Writing Goal</h2>
   </div>

   <div className="book-dashboard-card-body">
    <p className="book-dashboard-main-value">
     {goal?`${Number(goal.targetValue||0).toLocaleString()} ${goal.goalType||"Goal"}`:"Set Goal"}
    </p>
    <p className="book-dashboard-card-text">
     {goal?.notes||"Daily, weekly, monthly, or full manuscript goals will display here."}
    </p>

    {onEdit?(
     <button type="button" className="book-desk-note-action" onClick={onEdit}>
      {goal?"Edit Goal":"Set Goal"}
     </button>
    ):null}
   </div>
  </article>
 );
}

export default BookWritingGoal;