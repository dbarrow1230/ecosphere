// src/components/dashboard/RecentlyAddedCard.jsx
import {Link} from "react-router-dom";

function RecentlyAddedCard({items,emptyText,viewIcon,itemIcon}){

 return(
  <section className="dashboard-section dashboard-card-col">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Catalog</p>
     <h2 className="dashboard-section-title">Recently Added</h2>
    </div>
    <Link to="/books" className="dashboard-section-link"><span>{viewIcon}</span><span>View library</span></Link>
   </div>

   {!items.length?(
    <div className="dashboard-empty">{emptyText}</div>
   ):(
    <ul className="dashboard-list">
     {items.map(book=>(
      <li key={book._id}>
       <Link to={book.to||"/books"} className="dashboard-list-item dashboard-list-link">
       <div className="dashboard-list-icon">{itemIcon}</div>
       <div className="dashboard-list-content">
        <div className="dashboard-item-title">{book.title}</div>
        <div className="dashboard-item-meta">{book.author||book.meta}</div>
       </div>
       </Link>
      </li>
     ))}
    </ul>
   )}
  </section>
 );

}

export default RecentlyAddedCard;
