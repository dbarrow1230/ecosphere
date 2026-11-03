import {Link} from "react-router-dom";

function ReadingProgressCard({items}){
 return(
  <section className="dashboard-section dashboard-reading-progress">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Reading Desk</p>
     <h2 className="dashboard-section-title">Progress by Book</h2>
    </div>
    <Link to="/books?reading=reading" className="dashboard-section-link">View reading</Link>
   </div>

   {!items.length?<div className="dashboard-empty">No books are marked as currently reading.</div>:(
    <div className="dashboard-progress-list">
     {items.map(item=>(
      <Link key={item._id} to={item.to} className="dashboard-progress-row">
       <div className="dashboard-progress-copy">
        <div className="dashboard-progress-title">{item.title}</div>
        <div className="dashboard-progress-meta">{item.author}</div>
       </div>
       <div className="dashboard-progress-pages">{item.currentPage} / {item.totalPages||"?"} pages</div>
       <div className="dashboard-progress-track">
        <div className="dashboard-progress-fill" style={{width:`${item.progressPercent}%`}} />
       </div>
       <div className="dashboard-progress-percent">{item.progressPercent}%</div>
      </Link>
     ))}
    </div>
   )}
  </section>
 );
}

export default ReadingProgressCard;
