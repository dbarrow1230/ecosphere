import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import Dashboard from "./Dashboard.jsx";
import {loadCurrentBusiness} from "../utils/currentBusiness.js";
import {inventoryApi,referenceId} from "../utils/inventoryApi.js";

export default function InventoryOverview({view="dashboard"}){
 const [data,setData]=useState(null),[error,setError]=useState(""),[revision,setRevision]=useState(0);
 useEffect(()=>{let active=true;(async()=>{
  try{const business=await loadCurrentBusiness();const result=await inventoryApi(`/api/dashboard?business_id=${referenceId(business)}`);if(active)setData(result);}
  catch(e){if(active)setError(e.message);}
 })();return()=>{active=false;};},[revision]);
 if(error)return <section className="container py-4"><h1>Inventory overview</h1><p role="alert" className="alert alert-danger">{error}</p><button className="btn btn-primary" onClick={()=>{setData(null);setError("");setRevision(v=>v+1);}}>Retry</button></section>;
 if(!data)return <p className="container py-4" role="status">Loading inventory…</p>;
 if(view==="dashboard")return <Dashboard {...data}/>;
 const title={reports:"Inventory report","low-stock":"Low stock",expiring:"Expiring inventory","shopping-list":"Reorder needs"}[view];
 const rows=view==="reports"?data.items:view==="expiring"?data.expiringItems:data.lowStockItems;
 return <section className="container py-4"><h1>{title}</h1><div className="d-flex gap-3 mb-3"><Link to="/dashboard">Dashboard</Link><Link to="/beverages">Beverages</Link><Link to="/purchasing">Purchasing workflow</Link></div>
  {view==="reports"&&<p>Current stock value: ${data.summary.totalStockValue.toFixed(2)}</p>}
  {view==="shopping-list"&&<p>Suggested needs based on current stock and reorder levels. These are not submitted purchase orders.</p>}
  <table className="table"><thead><tr><th>Beverage</th><th>Quantity</th><th>{view==="expiring"?"Expiry date":"Reorder point"}</th><th>{view==="reports"?"Stock value":"Location / category"}</th></tr></thead><tbody>{rows.map(row=><tr key={row._id}><td>{row.name}</td><td>{row.quantity} {row.unit}</td><td>{view==="expiring"?row.expiryDate:row.reorderPoint}</td><td>{view==="reports"?`$${row.financials.stockValue.toFixed(2)}`:row.location||row.category}</td></tr>)}</tbody></table>
  {!rows.length&&<p>No records to display.</p>}
 </section>;
}
