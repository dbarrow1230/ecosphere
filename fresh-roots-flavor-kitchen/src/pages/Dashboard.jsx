// src/pages/Dashboard.jsx
import {Link} from "react-router-dom";
import {useEffect,useState} from "react";
import "../styles/Dashboard.css";

function Dashboard({stats,activeOrders,inventoryAlerts,recentOrders}){

 const [liveData,setLiveData]=useState(null);

 useEffect(()=>{
  let active=true;

  fetch("/api/dashboard")
   .then(async response=>{
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(data?.message||"Dashboard data is unavailable");
    if(active)setLiveData(data);
   })
   .catch(()=>{
    if(active)setLiveData(null);
   });

  return()=>{active=false;};
 },[]);

 const liveSummary=liveData?.summary;
 const dashboardStats=stats?.length?stats:liveSummary?[
  {label:"Orders",value:liveSummary.orders??0},
  {label:"Inventory Items",value:liveSummary.inventoryItems??0},
  {label:"Users",value:liveSummary.users??0},
  {label:"Recipes",value:liveSummary.recipes??0}
 ]:[
  {label:"Orders Today",value:18},
  {label:"Revenue",value:"$420"},
  {label:"Active Orders",value:6},
  {label:"Low Stock Items",value:3}
 ];

 const dashboardActiveOrders=Array.isArray(activeOrders)?activeOrders:Array.isArray(liveData?.orders)?liveData.orders:[
  {_id:"ao1",orderNumber:"#1024",customerName:"Kitchen Service",status:"Preparing"},
  {_id:"ao2",orderNumber:"#1025",customerName:"Kitchen Service",status:"Ready"},
  {_id:"ao3",orderNumber:"#1026",customerName:"Kitchen Service",status:"Out for Delivery"}
 ];

 const dashboardInventoryAlerts=Array.isArray(inventoryAlerts)?inventoryAlerts:Array.isArray(liveData?.inventoryAlerts)?liveData.inventoryAlerts:[
  {_id:"ia1",name:"Salmon",category:"Kitchen Stock",stockStatus:"Low"},
  {_id:"ia2",name:"Breadfruit",category:"Kitchen Stock",stockStatus:"Low"},
  {_id:"ia3",name:"Coconut Milk",category:"Kitchen Stock",stockStatus:"Restock Soon"}
 ];

 const dashboardRecentOrders=Array.isArray(recentOrders)?recentOrders:Array.isArray(liveData?.recentOrders)?liveData.recentOrders:[
  {_id:"ro1",orderNumber:"#1019",status:"Completed Order",total:"$32"},
  {_id:"ro2",orderNumber:"#1020",status:"Completed Order",total:"$24"},
  {_id:"ro3",orderNumber:"#1021",status:"Completed Order",total:"$41"}
 ];

 const getStatusClass=(status="")=>{
  const s=status.toLowerCase();
  if(s.includes("prep"))return "is-preparing";
  if(s.includes("ready"))return "is-ready";
  if(s.includes("delivery"))return "is-delivery";
  if(s.includes("restock"))return "is-restock";
  if(s.includes("low"))return "is-low";
  return "";
 };

 return(
  <section className="dashboard">

   <header className="dashboard-header">
    <div className="dashboard-header-copy">
     <p className="dashboard-eyebrow">Operations Overview</p>
     <h1 className="dashboard-title">Kitchen Dashboard</h1>
     <p className="dashboard-text">
      Track orders, monitor inventory, and manage daily service with clarity and control.
     </p>
    </div>

    <div className="dashboard-header-actions">
     <Link to="/orders" className="dashboard-action dashboard-action-light">Orders</Link>
     <Link to="/inventory" className="dashboard-action dashboard-action-light">Inventory</Link>
    </div>
   </header>

   <section className="dashboard-cards">
    {dashboardStats.map((item)=>(
     <div key={item.label} className="dashboard-card">
      <p className="dashboard-card-label">{item.label}</p>
      <p className="dashboard-card-value">{item.value}</p>
     </div>
    ))}
   </section>

   <div className="dashboard-layout">

    <div className="dashboard-main">

     <section className="dashboard-section dashboard-section-primary">
      <div className="dashboard-section-head">
       <div>
        <p className="dashboard-section-kicker">Live Queue</p>
        <h2 className="dashboard-section-title">Active Orders</h2>
       </div>
       <span className="dashboard-section-count">{dashboardActiveOrders.length}</span>
      </div>

      {dashboardActiveOrders.length?(
       <ul className="dashboard-list dashboard-list-orders">
        {dashboardActiveOrders.map((order)=>(
         <li key={order._id} className="dashboard-list-item dashboard-order-row">
          <div className="dashboard-list-copy">
           <span className="dashboard-book-title">{order.orderNumber||"Order"}</span>
           <span className="dashboard-book-meta">{order.customerName||"Kitchen Service"}</span>
          </div>
          <span className={`dashboard-status ${getStatusClass(order.status)}`}>{order.status||"In Progress"}</span>
         </li>
        ))}
       </ul>
      ):(
       <p className="dashboard-list-empty">No active orders right now.</p>
      )}
     </section>

     <section className="dashboard-section">
      <div className="dashboard-section-head">
       <div>
        <p className="dashboard-section-kicker">Completed</p>
        <h2 className="dashboard-section-title">Recent Orders</h2>
       </div>
       <span className="dashboard-section-count">{dashboardRecentOrders.length}</span>
      </div>

      {dashboardRecentOrders.length?(
       <ul className="dashboard-list">
        {dashboardRecentOrders.map((order)=>(
         <li key={order._id} className="dashboard-list-item">
          <div className="dashboard-list-copy">
           <span className="dashboard-book-title">{order.orderNumber||"Order"}</span>
           <span className="dashboard-book-meta">{order.status||"Completed Order"}</span>
          </div>
          <span className="dashboard-book-author">{order.total||"$0"}</span>
         </li>
        ))}
       </ul>
      ):(
       <p className="dashboard-list-empty">No recent orders available.</p>
      )}
     </section>

    </div>

    <aside className="dashboard-side">

     <section className="dashboard-section">
      <div className="dashboard-section-head">
       <div>
        <p className="dashboard-section-kicker">Attention</p>
        <h2 className="dashboard-section-title">Inventory Alerts</h2>
       </div>
       <span className="dashboard-section-count">{dashboardInventoryAlerts.length}</span>
      </div>

      {dashboardInventoryAlerts.length?(
       <ul className="dashboard-list">
        {dashboardInventoryAlerts.map((item)=>(
         <li key={item._id} className="dashboard-list-item">
          <div className="dashboard-list-copy">
           <span className="dashboard-book-title">{item.name||"Inventory Item"}</span>
           <span className="dashboard-book-meta">{item.category||"Kitchen Stock"}</span>
          </div>
          <span className={`dashboard-status dashboard-status-soft ${getStatusClass(item.stockStatus)}`}>{item.stockStatus||item.quantity||"Low Stock"}</span>
         </li>
        ))}
       </ul>
      ):(
       <p className="dashboard-list-empty">No inventory alerts right now.</p>
      )}
     </section>

     <section className="dashboard-section">
      <div className="dashboard-section-head">
       <div>
        <p className="dashboard-section-kicker">Quick Actions</p>
        <h2 className="dashboard-section-title">Manage Operations</h2>
       </div>
      </div>

      <div className="dashboard-actions">
       <Link to="/orders" className="dashboard-action">Manage Orders</Link>
       <Link to="/inventory" className="dashboard-action">Inventory</Link>
       <Link to="/menu" className="dashboard-action">Update Menu</Link>
       <Link to="/staff" className="dashboard-action">Staff</Link>
      </div>
     </section>

    </aside>

   </div>

  </section>
 );
}

export default Dashboard;
