import {useState} from "react";
import DashboardSection from "./DashboardSection.jsx";
import DashboardEmpty from "./DashboardEmpty.jsx";

export default function AccountingInquiries({inquiries,save}){
 const [error,setError]=useState(""),[busy,setBusy]=useState("");
 async function review(id){setBusy(id);setError("");try{await save(`inquiries/${id}/review`,{},"PUT");}catch(cause){setError(cause.message);}finally{setBusy("");}}
 return <DashboardSection title="Website inquiries" kicker="NEW CLIENT FOLLOW-UP">
  {error&&<p role="alert">{error}</p>}
  {inquiries.length?<ul className="accounting-inquiries">{inquiries.map(item=><li key={item._id}><div><strong>{item.name}</strong><a href={`mailto:${item.email}`}>{item.email}</a><p>{item.message}</p></div><button type="button" className="btn btn-outline-primary btn-sm" disabled={busy!==""} onClick={()=>review(item._id)}>{busy===item._id?"Saving…":"Mark reviewed"}</button></li>)}</ul>:<DashboardEmpty message="No new website inquiries."/>}
 </DashboardSection>;
}
