function BookWritingSessions({sessionCount=0}){
 const count=Number(sessionCount)||0;

 return(
  <article className="book-dashboard-card book-writing-sessions">
   <div className="book-dashboard-card-header">
    <p className="book-dashboard-card-kicker">Sessions</p>
    <h2 className="book-dashboard-card-title">Writing Sessions</h2>
   </div>

   <div className="book-dashboard-card-body">
    <p className="book-dashboard-main-value">
     {count>0?`${count} logged`:"No sessions logged"}
    </p>
    <p className="book-dashboard-card-text">
     Recent sessions, time spent, and words written will display here.
    </p>
   </div>
  </article>
 );
}

export default BookWritingSessions;