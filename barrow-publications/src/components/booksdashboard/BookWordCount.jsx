function BookWordCount({currentWords=0,targetWords=80000}){
 const safeCurrent=Number(currentWords)||0;
 const safeTarget=Number(targetWords)||0;
 const percent=safeTarget>0?Math.round((safeCurrent/safeTarget)*100):0;

 return(
  <article className="book-dashboard-card book-word-count">
   <div className="book-dashboard-card-header">
    <p className="book-dashboard-card-kicker">Word Count</p>
    <h2 className="book-dashboard-card-title">Manuscript Progress</h2>
   </div>

   <div className="book-dashboard-card-body">
    <p className="book-dashboard-main-value">{safeCurrent.toLocaleString()}</p>
    <p className="book-dashboard-card-text">
     of {safeTarget.toLocaleString()} target words
    </p>

    <div className="book-dashboard-progress">
     <div className="book-dashboard-progress-bar" style={{width:`${percent}%`}}></div>
    </div>

    <p className="book-dashboard-small">{percent}% complete</p>
   </div>
  </article>
 );
}

export default BookWordCount;