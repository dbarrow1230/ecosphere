// src/components/dashboard/MissingMetadataCard.jsx
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

function MissingMetadataCard({items=[]}){
 const extraItems=[
  {
   title:"Missing eISBN",
   text:"Review books without ebook ISBN data",
   icon:"E",
   iconClass:"is-warning",
   to:"/books?missing=eisbn"
  },
  {
   title:"Missing ASIN",
   text:"Review books without Amazon ASIN data",
   icon:"A",
   iconClass:"is-warning",
   to:"/books?missing=asin"
  },
  {
   title:"Has ISBN / eISBN / ASIN",
   text:"Review books with catalog identifier data",
   icon:"#",
   iconClass:"is-success",
   to:"/books?has=identifier"
  },
  {
   title:"Duplicate Identifier",
   text:"Review duplicate ISBN, eISBN, or ASIN values",
   icon:"!",
   iconClass:"is-danger",
   to:"/books?duplicate=identifier"
  },
  {
   title:"ASIN Only",
   text:"Review books cataloged by ASIN only",
   icon:"A",
   iconClass:"is-info",
   to:"/books?catalogStatus=ASIN%20Only"
  },
  {
   title:"No ISBN",
   text:"Review books marked as having no ISBN",
   icon:"N",
   iconClass:"is-muted",
   to:"/books?catalogStatus=No%20ISBN"
  },
  {
   title:"Digital No ISBN",
   text:"Review digital books without ISBN or eISBN",
   icon:"D",
   iconClass:"is-muted",
   to:"/books?catalogStatus=Digital%20No%20ISBN"
  },
  {
   title:"Manual Entry",
   text:"Review books entered manually",
   icon:"M",
   iconClass:"is-info",
   to:"/books?catalogStatus=Manual%20Entry"
  }
 ];

 const mergedItems=[
  ...items,
  ...extraItems.filter(extra=>!items.some(item=>item.title===extra.title||item.to===extra.to))
 ];

 return(
  <section className="dashboard-section dashboard-section-wide dashboard-card-wide">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Data Cleanup</p>
     <h2 className="dashboard-section-title">Missing Metadata Queue</h2>
    </div>
   </div>

   <ul className="dashboard-list dashboard-compact-grid">
    {mergedItems.map(item=><DashboardListItem key={item.title} item={item}/>)}
   </ul>
  </section>
 );
}

export default MissingMetadataCard;