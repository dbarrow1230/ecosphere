import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import {api,money} from "../utils/api.js";
import knifeSystemHero from "../images/b435fbfd-bfcd-4990-a71e-cda0cf051631.webp";

function Dashboard(){
 const [summary,setSummary]=useState({orders:0,tiers:0,totalValue:0,pipeline:[]});
 const [error,setError]=useState("");

 useEffect(()=>{api("/api/orders/dashboard-summary").then(setSummary).catch(error=>setError(error.message));},[]);

 return <section className="page-stack">
  <div className="page-hero product-hero">
   <img src={knifeSystemHero} alt="Pro Edge custom knife block with integrated sharpener"/>
   <div className="product-hero-copy">
    <p className="app-eyebrow">Product Dashboard</p>
    <h2>Pro Edge Knife Sets</h2>
    <p>Manage the three fixed collection levels and customer-built custom sets.</p>
    <div className="hero-actions"><Link className="button" to="/tiers">Compare Sets</Link><Link className="button secondary" to="/custom-builder">Build Custom</Link></div>
   </div>
  </div>
  {error&&<p className="error-banner">{error}</p>}
  <div className="stat-grid">
   <article><span>Active tiers</span><strong>{summary.tiers}</strong></article>
   <article><span>Orders</span><strong>{summary.orders}</strong></article>
   <article><span>Order value</span><strong>{money(summary.totalValue)}</strong></article>
  </div>
  <section className="panel"><h3>Order Pipeline</h3>{summary.pipeline.length?<div className="pipeline">{summary.pipeline.map(item=><div key={item._id}><span>{item._id}</span><strong>{item.count}</strong><small>{money(item.value)}</small></div>)}</div>:<p>No orders have been entered yet.</p>}</section>
 </section>;
}

export default Dashboard;
