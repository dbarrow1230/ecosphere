// src/components/dashboard/LibraryStatusCard.jsx
import {Link} from "react-router-dom";

function DashboardListItem({item}){
 const content=(
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
function LibraryStatusCard({items}){

 return(
  <section className="dashboard-section dashboard-card-col">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Summary</p>
     <h2 className="dashboard-section-title">Library Status</h2>
    </div>
   </div>

   <ul className="dashboard-list">
    {items.map(item=><DashboardListItem key={item.title} item={item}/>)}
   </ul>
  </section>
 );

}

export default LibraryStatusCard;
