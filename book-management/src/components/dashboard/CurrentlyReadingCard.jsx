// src/components/dashboard/CurrentlyReadingCard.jsx
import {Link} from "react-router-dom";

function CurrentlyReadingCard({items,emptyText,viewIcon,bookIcon}){

 return(
  <section className="dashboard-section dashboard-card-col">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Reading Now</p>
     <h2 className="dashboard-section-title">Currently Reading</h2>
    </div>
    <Link to="/books?reading=reading" className="dashboard-section-link"><span>{viewIcon}</span><span>View books</span></Link>
   </div>

   {!items.length?(
    <div className="dashboard-empty">{emptyText}</div>
   ):(
    <ul className="dashboard-list">
     {items.map(book=>(
      <li key={book._id}>
       <Link to={book.to||"/books"} className="dashboard-list-item dashboard-list-link">
       <div className="dashboard-list-icon dashboard-list-icon-accent">{bookIcon}</div>
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

export default CurrentlyReadingCard;
