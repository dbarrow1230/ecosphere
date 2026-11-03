// src/components/dashboard/LibraryValueCard.jsx
import {Link} from "react-router-dom";
function LibraryValueCard({totalValue,recentSpending,valueByFormat,highestCostRecentAdditions}){

 return(
  <section className="dashboard-section dashboard-section-wide dashboard-card-wide">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Acquisition / Money</p>
     <h2 className="dashboard-section-title">Library Value</h2>
    </div>
   </div>

   <ul className="dashboard-list dashboard-list-two-column">
    <li>
     <Link to="/books?sort=value" className="dashboard-list-item dashboard-list-link">
      <div className="dashboard-list-content">
       <div className="dashboard-item-title">${totalValue.toFixed(2)} total library value</div>
       <div className="dashboard-item-meta">Calculated from book cost and format prices.</div>
      </div>
     </Link>
    </li>
    <li>
     <Link to="/books?sort=purchaseDate" className="dashboard-list-item dashboard-list-link">
      <div className="dashboard-list-content">
       <div className="dashboard-item-title">${recentSpending.toFixed(2)} recent spending</div>
       <div className="dashboard-item-meta">Most recent purchase activity from books with purchase dates.</div>
      </div>
     </Link>
    </li>
   </ul>

   <div className="dashboard-chart-grid dashboard-chart-grid-compact">
    <div className="dashboard-chart-card">
     <div className="dashboard-chart-head">
      <h3 className="dashboard-chart-title">Value by Format</h3>
     </div>

     <div className="dashboard-chart-body">
      {valueByFormat.map(item=>(
       <Link key={item.label} to={item.to||"/books"} className="dashboard-bar-row dashboard-bar-link">
        <div className="dashboard-bar-meta">
         <span className="dashboard-bar-label">{item.label}</span>
         <span className="dashboard-bar-value">${item.value.toFixed(2)}</span>
        </div>
        <div className="dashboard-bar-track">
         <div className="dashboard-bar-fill dashboard-bar-fill-household" style={{width:`${item.percent}%`}}/>
        </div>
       </Link>
      ))}
     </div>
    </div>

    <div className="dashboard-chart-card">
     <div className="dashboard-chart-head">
      <h3 className="dashboard-chart-title">Highest-Cost Recent Additions</h3>
     </div>

     {!highestCostRecentAdditions.length?(
      <div className="dashboard-empty">No recent additions found.</div>
     ):(
      <ul className="dashboard-list">
       {highestCostRecentAdditions.map(item=>(
        <li key={item._id}>
         <Link to={item.to||"/books"} className="dashboard-list-item dashboard-list-link">
          <div className="dashboard-list-content">
           <div className="dashboard-item-title">{item.title}</div>
           <div className="dashboard-item-meta">{item.meta}</div>
          </div>
         </Link>
        </li>
       ))}
      </ul>
     )}
    </div>
   </div>
  </section>
 );

}

export default LibraryValueCard;
