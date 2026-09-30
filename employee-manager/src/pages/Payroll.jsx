import {useEffect,useState} from "react";
import {clockHours} from "../utils/employeeManager.js";
import {apiRequest,employeeFromApi,payrollFromApi,payrollToApi,timeClockFromApi} from "../utils/employeeManagerApi.js";

function Payroll(){
 const [employees,setEmployees]=useState([]);
 const [entries,setEntries]=useState([]);
 const [payrolls,setPayrolls]=useState([]);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [draft,setDraft]=useState({name:"",from:new Date().toISOString().slice(0,10),to:new Date().toISOString().slice(0,10),status:"Draft"});
 const payrollHours=entries.reduce((sum,entry)=>sum+clockHours(entry),0);

 useEffect(()=>{
  let ignore=false;
  Promise.all([apiRequest("/api/employees"),apiRequest("/api/time-clock"),apiRequest("/api/payrolls")])
   .then(([employeeRows,timeRows,payrollRows])=>{if(!ignore){setEmployees(employeeRows.map(employeeFromApi));setEntries(timeRows.map(timeClockFromApi));setPayrolls(payrollRows.map(payrollFromApi));}})
   .catch(err=>{if(!ignore)setError(err.message||"Failed to load payroll data");})
   .finally(()=>{if(!ignore)setLoading(false);});
  return()=>{ignore=true;};
 },[]);

 const add=async()=>{
  try{
   setSaving(true);setError("");
   const saved=payrollFromApi(await apiRequest("/api/payrolls",{method:"POST",body:JSON.stringify(payrollToApi(draft))}));
   setPayrolls(current=>[saved,...current]);
  }catch(err){setError(err.message||"Failed to create pay period");}
  finally{setSaving(false);}
 };

 return(
  <section className="employee-page">
   <div className="employee-page-title"><h2>Payroll</h2></div>
   {error?<div className="alert alert-danger">{error}</div>:null}
   <div className="employee-grid">
    <section className="employee-card"><h3>Create Pay Period</h3><div className="employee-form">
     <label>Pay Period Name<input value={draft.name} onChange={event=>setDraft({...draft,name:event.target.value})}/></label>
     <label>From<input type="date" value={draft.from} onChange={event=>setDraft({...draft,from:event.target.value})}/></label>
     <label>To<input type="date" value={draft.to} onChange={event=>setDraft({...draft,to:event.target.value})}/></label>
     <label>Status<select value={draft.status} onChange={event=>setDraft({...draft,status:event.target.value})}><option>Draft</option><option>Closed</option></select></label>
    </div><button className="btn btn-primary" disabled={saving||loading} onClick={add}>{saving?"Saving…":"Create"}</button></section>
    <section className="employee-card"><h3>Employees To Be Paid Summary</h3><div className="employee-metrics employee-metrics-small"><article><span>Employees</span><strong>{employees.length}</strong></article><article><span>Entries</span><strong>{entries.length}</strong></article><article><span>Hours</span><strong>{payrollHours.toFixed(1)}</strong></article></div>{loading?<p>Loading payrolls…</p>:<table><thead><tr><th>Pay Period</th><th>From</th><th>To</th><th>Status</th></tr></thead><tbody>{payrolls.map(payroll=><tr key={payroll.id}><td>{payroll.name}</td><td>{payroll.from}</td><td>{payroll.to}</td><td>{payroll.status}</td></tr>)}</tbody></table>}</section>
   </div>
  </section>
 );
}

export default Payroll;
