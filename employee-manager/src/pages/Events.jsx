import {useEffect,useMemo,useState} from "react";
import {employeeName} from "../utils/employeeManager.js";
import {apiRequest,employeeFromApi,eventFromApi,eventToApi} from "../utils/employeeManagerApi.js";

function Events(){
 const [employees,setEmployees]=useState([]);
 const [events,setEvents]=useState([]);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [draft,setDraft]=useState({name:"",type:"Leave",employeeId:"",createdOn:new Date().toISOString().slice(0,10),recurring:false,reminder:true,reminderDate:"",notes:""});
 const employeeById=useMemo(()=>Object.fromEntries(employees.map(employee=>[employee.id,employee])),[employees]);

 useEffect(()=>{
  let ignore=false;
  Promise.all([apiRequest("/api/employees"),apiRequest("/api/employee-events")])
   .then(([employeeRows,eventRows])=>{if(!ignore){setEmployees(employeeRows.map(employeeFromApi));setEvents(eventRows.map(eventFromApi));}})
   .catch(err=>{if(!ignore)setError(err.message||"Failed to load events");})
   .finally(()=>{if(!ignore)setLoading(false);});
  return()=>{ignore=true;};
 },[]);

 const add=async()=>{
  if(!draft.name.trim()||!draft.type.trim()){setError("Event name and type are required.");return;}
  try{
   setSaving(true);setError("");
   const saved=eventFromApi(await apiRequest("/api/employee-events",{method:"POST",body:JSON.stringify(eventToApi(draft))}));
   setEvents(current=>[saved,...current]);
  }catch(err){setError(err.message||"Failed to create event");}
  finally{setSaving(false);}
 };

 return(
  <section className="employee-page">
   <div className="employee-page-title"><h2>Events</h2></div>
   {error?<div className="alert alert-danger">{error}</div>:null}
   <section className="employee-card"><div className="employee-form">
    <label>Event Name<input value={draft.name} onChange={event=>setDraft({...draft,name:event.target.value})}/></label>
    <label>Event Type<input value={draft.type} onChange={event=>setDraft({...draft,type:event.target.value})}/></label>
    <label>Employee<select value={draft.employeeId} onChange={event=>setDraft({...draft,employeeId:event.target.value})}><option value="">Company-wide</option>{employees.map(employee=><option key={employee.id} value={employee.id}>{employeeName(employee)}</option>)}</select></label>
    <label>Created On<input type="date" value={draft.createdOn} onChange={event=>setDraft({...draft,createdOn:event.target.value})}/></label>
    <label>Reminder Date<input type="date" value={draft.reminderDate} onChange={event=>setDraft({...draft,reminderDate:event.target.value,reminder:Boolean(event.target.value)})}/></label>
    <label>Notes<input value={draft.notes} onChange={event=>setDraft({...draft,notes:event.target.value})}/></label>
   </div><button className="btn btn-primary" disabled={saving||loading} onClick={add}>{saving?"Saving…":"New Event"}</button></section>
   <section className="employee-card">{loading?<p>Loading events…</p>:<table><thead><tr><th>Event</th><th>Type</th><th>Employee</th><th>Created</th><th>Reminder</th><th>Notes</th></tr></thead><tbody>{events.map(event=><tr key={event.id}><td>{event.name}</td><td>{event.type}</td><td>{event.employeeId?employeeName(employeeById[event.employeeId]||event.employeeRef):"Company-wide"}</td><td>{event.createdOn}</td><td>{event.reminderDate||"No"}</td><td>{event.notes}</td></tr>)}</tbody></table>}</section>
  </section>
 );
}

export default Events;
