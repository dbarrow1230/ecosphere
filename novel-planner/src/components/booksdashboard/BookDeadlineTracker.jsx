function BookDeadlineTracker({deadline=null,onEdit}){
 const dateText=deadline?.deadlineDate?new Date(deadline.deadlineDate).toLocaleDateString():"No deadline set";

 return(
  <article className="book-dashboard-card book-deadline-tracker">
   <div className="book-dashboard-card-header">
    <p className="book-dashboard-card-kicker">Deadlines</p>
    <h2 className="book-dashboard-card-title">Upcoming Dates</h2>
   </div>

   <div className="book-dashboard-card-body">
    <p className="book-dashboard-main-value">{dateText}</p>
    <p className="book-dashboard-card-text">
     {deadline?.notes||"Draft deadlines, revision dates, publishing dates, and milestones will display here."}
    </p>

    {onEdit?(
     <button type="button" className="book-desk-note-action" onClick={onEdit}>
      {deadline?"Edit Deadline":"Set Deadline"}
     </button>
    ):null}
   </div>
  </article>
 );
}

export default BookDeadlineTracker;