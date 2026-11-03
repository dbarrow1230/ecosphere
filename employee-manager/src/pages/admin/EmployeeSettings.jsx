import {useEffect,useState} from "react";
import {apiRequest,toDateInput} from "../../utils/employeeManagerApi.js";

const defaults={
 companyName:"",
 address:"",
 city:"",
 region:"",
 country:"",
 payFrequency:"Bi-Weekly",
 payrollStart:"",
 workweekStartsOn:"Monday",
 startTime:"07:00",
 endTime:"18:00",
 dailyOvertimeAfter:8,
 weeklyOvertimeAfter:40,
 timeFormat:"Time Format (2:30)"
};

function EmployeeSettings(){
 const [draft,setDraft]=useState(defaults);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [message,setMessage]=useState({type:"",text:""});

 useEffect(()=>{
  let ignore=false;
  apiRequest("/api/employee-settings")
   .then(settings=>{if(!ignore)setDraft({...defaults,...settings,payrollStart:toDateInput(settings.payrollStart)});})
   .catch(err=>{if(!ignore)setMessage({type:"danger",text:err.message||"Failed to load employee settings"});})
   .finally(()=>{if(!ignore)setLoading(false);});
  return()=>{ignore=true;};
 },[]);

 const save=async()=>{
  try{
   setSaving(true);
   setMessage({type:"",text:""});
   const saved=await apiRequest("/api/employee-settings",{method:"PUT",body:JSON.stringify({...draft,payrollStart:draft.payrollStart||null})});
   setDraft({...defaults,...saved,payrollStart:toDateInput(saved.payrollStart)});
   setMessage({type:"success",text:"Employee settings saved."});
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to save employee settings"});
  }finally{
   setSaving(false);
  }
 };

 return(
  <section className="employee-page">
   <div className="employee-page-title"><h2>Employee Settings</h2></div>
   {message.text?<div className={`alert alert-${message.type}`}>{message.text}</div>:null}
   <section className="employee-card">
    {loading?<p>Loading settings…</p>:<div className="employee-form">{Object.keys(defaults).map(field=><label key={field}>{field}<input value={draft[field]??""} type={field.includes("Time")&&field!=="timeFormat"?"time":field.includes("Overtime")?"number":field==="payrollStart"?"date":"text"} onChange={event=>setDraft({...draft,[field]:event.target.type==="number"?Number(event.target.value):event.target.value})}/></label>)}</div>}
    <button className="btn btn-success" disabled={loading||saving} onClick={save}>{saving?"Saving…":"Save Settings"}</button>
   </section>
  </section>
 );
}

export default EmployeeSettings;
