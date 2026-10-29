import {useMemo,useState} from "react";
import {Link} from "react-router-dom";
import {Plus,Search} from "lucide-react";
import DashboardSection from "./DashboardSection.jsx";
import DashboardEmpty from "./DashboardEmpty.jsx";

const empty={client:"",title:"",service:"Tax",dueDate:"",notes:""};
const date=value=>value?new Intl.DateTimeFormat(undefined,{dateStyle:"medium",timeZone:"UTC"}).format(new Date(value)):"No due date";
const isOpen=item=>!["Completed","Cancelled"].includes(item.status);
export default function AccountingWorkQueue({work,clients,services,statuses,save}){
 const [filter,setFilter]=useState("Open"),[service,setService]=useState("All"),[query,setQuery]=useState(""),[adding,setAdding]=useState(false),[form,setForm]=useState(empty),[busy,setBusy]=useState(""),[error,setError]=useState("");
 const items=useMemo(()=>work.filter(item=>(filter==="All"||(filter==="Open"?isOpen(item):item.status===filter))&&(service==="All"||item.service===service)&&`${item.title} ${item.client?.name||""}`.toLowerCase().includes(query.toLowerCase())),[work,filter,service,query]);
 async function submit(event){event.preventDefault();setBusy("new");setError("");try{await save("work",form);setForm(empty);setAdding(false);}catch(cause){setError(cause.message);}finally{setBusy("");}}
 async function update(item,status){setBusy(item._id);setError("");try{await save(`work/${item._id}`,{status},"PUT");}catch(cause){setError(cause.message);}finally{setBusy("");}}
 const change=event=>setForm(current=>({...current,[event.target.name]:event.target.value}));
 return <DashboardSection id="accounting-work" title="Client work & deadlines" kicker="ACCOUNTING · BOOKKEEPING · TAX · NOTARY">
  <div className="accounting-work-toolbar"><label className="accounting-search"><Search size={17}/><span className="visually-hidden">Search client work</span><input type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Find a client or work item"/></label><label>Status<select value={filter} onChange={event=>setFilter(event.target.value)}>{["Open","All",...statuses].map(value=><option key={value}>{value}</option>)}</select></label><label>Service<select value={service} onChange={event=>setService(event.target.value)}>{["All",...services].map(value=><option key={value}>{value}</option>)}</select></label><button className="btn btn-primary" type="button" onClick={()=>setAdding(current=>!current)} aria-expanded={adding}><Plus size={17}/> Add work</button></div>
  {error&&<p role="alert">{error}</p>}
  {adding&&(clients.length?<form className="accounting-work-form" onSubmit={submit}>
   <label>Client<select required name="client" value={form.client} onChange={change}><option value="">Choose client</option>{clients.map(client=><option value={client._id} key={client._id}>{client.name}</option>)}</select></label>
   <label>Work description<input required maxLength={180} name="title" value={form.title} onChange={change} placeholder="e.g. Prepare client tax return"/></label>
   <label>Service<select name="service" value={form.service} onChange={change}>{services.map(value=><option key={value}>{value}</option>)}</select></label>
   <label>Due date<input type="date" name="dueDate" value={form.dueDate} onChange={change}/></label>
   <label className="accounting-work-notes">Notes<textarea maxLength={3000} name="notes" value={form.notes} onChange={change}/></label>
   <div className="accounting-form-actions"><button type="submit" className="btn btn-primary" disabled={busy!==""}>{busy==="new"?"Saving…":"Save work item"}</button><button type="button" className="btn btn-outline-primary" onClick={()=>setAdding(false)}>Cancel</button></div>
  </form>:<p>Add a client in <Link to="/clients">Clients</Link> before creating work.</p>)}
  {items.length?<div className="accounting-table-wrap"><table className="accounting-table"><thead><tr><th scope="col">Client / work</th><th scope="col">Service</th><th scope="col">Due</th><th scope="col">Status</th></tr></thead><tbody>{items.map(item=><tr key={item._id}><td><strong>{item.title}</strong><span>{item.client?.name||"Client unavailable"}</span>{item.notes&&<details><summary>Notes</summary><p>{item.notes}</p></details>}</td><td>{item.service}</td><td>{date(item.dueDate)}</td><td><select aria-label={`Status for ${item.title}`} value={item.status} disabled={busy!==""} onChange={event=>update(item,event.target.value)}>{statuses.map(value=><option key={value}>{value}</option>)}</select></td></tr>)}</tbody></table></div>:<DashboardEmpty message={work.length?"No work matches these filters.":"No accounting work has been recorded. Add client work to track deadlines and progress."}/>}
 </DashboardSection>;
}
