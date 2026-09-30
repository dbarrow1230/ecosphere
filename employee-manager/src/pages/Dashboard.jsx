import {useEffect,useMemo,useState} from "react";
import {clockHours,employeeName} from "../utils/employeeManager.js";
import {loadEmployeeData} from "../utils/employeeManagerApi.js";
import "../styles/employee-manager.css";

function Dashboard(){
 const [data,setData]=useState({employees:[],timeClock:[],events:[],payrolls:[]});
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const employees=useMemo(()=>Object.fromEntries(data.employees.map(employee=>[employee.id,employee])),[data.employees]);
 const totalHours=data.timeClock.reduce((sum,entry)=>sum+clockHours(entry),0);
 const draftPayroll=data.payrolls.find(payroll=>payroll.status==="Draft");

 useEffect(()=>{
  let ignore=false;
  loadEmployeeData()
   .then(result=>{if(!ignore)setData(result);})
   .catch(err=>{if(!ignore)setError(err.message||"Failed to load dashboard");})
   .finally(()=>{if(!ignore)setLoading(false);});
  return()=>{ignore=true;};
 },[]);

 if(loading)return <section className="employee-page"><div className="employee-page-title"><h2>Employee Manager Dashboard</h2></div><p>Loading dashboard…</p></section>;

 return(
  <section className="employee-page">
   <div className="employee-page-title"><h2>Employee Manager Dashboard</h2></div>
   {error?<div className="alert alert-danger">{error}</div>:null}
   <div className="employee-metrics">
    <article><span>Active Employees</span><strong>{data.employees.filter(employee=>employee.status==="Active").length}</strong></article>
    <article><span>Clocked Hours</span><strong>{totalHours.toFixed(1)}</strong></article>
    <article><span>Open Events</span><strong>{data.events.length}</strong></article>
    <article><span>Draft Payroll</span><strong>{draftPayroll?.name||"None"}</strong></article>
   </div>
   <div className="employee-grid">
    <section className="employee-card"><h3>Payroll Snapshot</h3><table><thead><tr><th>Period</th><th>Dates</th><th>Status</th></tr></thead><tbody>{data.payrolls.map(payroll=><tr key={payroll.id}><td>{payroll.name}</td><td>{payroll.from} to {payroll.to}</td><td>{payroll.status}</td></tr>)}</tbody></table></section>
    <section className="employee-card"><h3>Event Notifications</h3>{data.events.filter(event=>event.reminder).map(event=><div className="employee-list-item" key={event.id}><strong>{event.name}</strong><span>{event.type} · {event.employeeId?employeeName(employees[event.employeeId]||event.employeeRef):"Company-wide"}</span></div>)}</section>
   </div>
  </section>
 );
}

export default Dashboard;
