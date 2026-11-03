// src/components/dashboard/LoanHealthCard.jsx
import {Link} from "react-router-dom";

function DashboardListItem({item,children}){
 const content=children||(
  <>
   <div className={`dashboard-list-icon ${item.iconClass}`}>{item.icon}</div>
   <div className="dashboard-list-content">
    <div className="dashboard-item-title">{item.title}</div>
    <div className="dashboard-item-meta">{item.text}</div>
   </div>
  </>
 );

 if(item.to){
  return <li><Link to={item.to} className="dashboard-list-item dashboard-list-link">{content}</Link></li>;
 }

 return <li className="dashboard-list-item">{content}</li>;
}
function LoanHealthCard({summary,longestCheckedOut,clockIcon}){

 return(
  <section className="dashboard-section dashboard-section-wide dashboard-card-wide">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Circulation</p>
     <h2 className="dashboard-section-title">Loan Health</h2>
    </div>
   </div>

   <ul className="dashboard-list dashboard-list-two-column">
    {summary.map(item=><DashboardListItem key={item.title} item={item}/>)}
   </ul>

   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Attention</p>
     <h2 className="dashboard-section-title">Checked Out Longest</h2>
    </div>
   </div>

   {!longestCheckedOut.length?(
    <div className="dashboard-empty">No active loans found.</div>
   ):(
    <ul className="dashboard-list">
     {longestCheckedOut.map(item=>(
      <DashboardListItem key={item._id} item={item}>
       <div className="dashboard-list-icon dashboard-list-icon-warning">{clockIcon}</div>
       <div className="dashboard-list-content">
        <div className="dashboard-item-title">{item.title}</div>
        <div className="dashboard-item-meta">{item.meta}</div>
       </div>
      </DashboardListItem>
     ))}
    </ul>
   )}
  </section>
 );

}

export default LoanHealthCard;
