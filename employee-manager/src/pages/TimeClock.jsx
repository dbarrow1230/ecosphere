import {useEffect,useState} from "react";
import {Alert,Tab,Tabs} from "react-bootstrap";
import TimeClockEntryForm from "../components/timeclock/TimeClockEntryForm.jsx";
import TimeClockEntryTable from "../components/timeclock/TimeClockEntryTable.jsx";
import TimeClockPunchForm from "../components/timeclock/TimeClockPunchForm.jsx";
import {apiRequest,employeeFromApi,timeClockFromApi,timeClockToApi} from "../utils/employeeManagerApi.js";
import {isTimeClockOnlyUser} from "../utils/userAccess.js";

const blankEntry=employeeId=>({id:"",employeeId:employeeId||"",date:new Date().toISOString().slice(0,10),clockIn:"",breakOut:"",breakIn:"",clockOut:"",notes:"",method:"Manual"});

function TimeClock({user}){
 const kioskOnly=isTimeClockOnlyUser(user);
 const [employees,setEmployees]=useState([]);
 const [entries,setEntries]=useState([]);
 const [draft,setDraft]=useState(blankEntry(""));
 const [filters,setFilters]=useState({employee:"",dateFrom:"",dateTo:""});
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");

 useEffect(()=>{
  let ignore=false;
  apiRequest("/api/employees")
   .then(rows=>{if(!ignore){const mapped=rows.map(employeeFromApi);setEmployees(mapped);setDraft(current=>({...current,employeeId:current.employeeId||mapped[0]?.id||""}));}})
   .catch(err=>{if(!ignore)setError(err.message||"Failed to load employees");});
  return()=>{ignore=true;};
 },[]);

 useEffect(()=>{
  let ignore=false;
  const params=new URLSearchParams();
  if(filters.employee)params.set("employee",filters.employee);
  if(filters.dateFrom)params.set("dateFrom",filters.dateFrom);
  if(filters.dateTo)params.set("dateTo",filters.dateTo);
  apiRequest(`/api/time-clock${params.size?`?${params.toString()}`:""}`)
   .then(rows=>{if(!ignore)setEntries(rows.map(timeClockFromApi));})
   .catch(err=>{if(!ignore)setError(err.message||"Failed to load time entries");})
   .finally(()=>{if(!ignore)setLoading(false);});
  return()=>{ignore=true;};
 },[filters]);

 const lookup=async employeeNumber=>{
  const status=await apiRequest(`/api/time-clock/status/${encodeURIComponent(employeeNumber)}`);
  return{...status,entry:status.entry?timeClockFromApi(status.entry):null};
 };

 const punch=async(employeeNumber,action)=>{
  const saved=timeClockFromApi(await apiRequest("/api/time-clock/punch",{method:"POST",body:JSON.stringify({employeeNumber,action})}));
  setEntries(current=>[saved,...current.filter(entry=>entry.id!==saved.id)]);
  return saved;
 };

 const save=async()=>{
  if(!draft.employeeId||!draft.date||!draft.clockIn){setError("Employee, date, and clock-in time are required.");return;}
  try{
   setSaving(true);setError("");
   const saved=timeClockFromApi(await apiRequest(draft.id?`/api/time-clock/${draft.id}`:"/api/time-clock",{method:draft.id?"PUT":"POST",body:JSON.stringify({...timeClockToApi(draft),editedBy:user?.username||user?.email||"Admin"})}));
   setEntries(current=>draft.id?current.map(entry=>entry.id===saved.id?saved:entry):[saved,...current]);
   setDraft(blankEntry(employees[0]?.id||""));
  }catch(err){setError(err.message||"Failed to save time entry");}
  finally{setSaving(false);}
 };

 const remove=async entry=>{
  if(!window.confirm(`Delete the time entry for ${entry.date}?`))return;
  try{
   setError("");
   await apiRequest(`/api/time-clock/${entry.id}`,{method:"DELETE"});
   setEntries(current=>current.filter(item=>item.id!==entry.id));
  }catch(err){setError(err.message||"Failed to delete time entry");}
 };

 return(
  <section className={`employee-page${kioskOnly?" time-clock-kiosk-page":""}`}>
   {!kioskOnly?<div className="employee-page-title"><h2>Time Clock</h2></div>:null}
   {error?<Alert variant="danger" dismissible onClose={()=>setError("")}>{error}</Alert>:null}
   {kioskOnly?<TimeClockPunchForm onLookup={lookup} onPunch={punch}/>:<Tabs defaultActiveKey="punch" className="mb-3">
    <Tab eventKey="punch" title="Employee Punch Clock"><TimeClockPunchForm onLookup={lookup} onPunch={punch}/></Tab>
    <Tab eventKey="entries" title="Time Clock List"><TimeClockEntryForm employees={employees} draft={draft} setDraft={setDraft} onSave={save} onCancel={()=>setDraft(blankEntry(employees[0]?.id||""))} saving={saving}/><TimeClockEntryTable entries={entries} employees={employees} filters={filters} setFilters={setFilters} onEdit={entry=>setDraft({...entry})} onDelete={remove} loading={loading}/></Tab>
   </Tabs>}
  </section>
 );
}

export default TimeClock;
