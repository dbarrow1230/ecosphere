import {useEffect,useMemo,useState} from "react";
import {employeeName} from "../utils/employeeManager.js";
import {apiRequest,employeeFromApi} from "../utils/employeeManagerApi.js";

const days=["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

function Scheduling(){
 const [employees,setEmployees]=useState([]);
 const [schedules,setSchedules]=useState([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const scheduleByEmployee=useMemo(()=>Object.fromEntries(schedules.map(schedule=>[schedule.employeeRef?._id||schedule.employeeRef,schedule])),[schedules]);

 useEffect(()=>{
  let ignore=false;
  Promise.all([apiRequest("/api/employees"),apiRequest("/api/weekly-schedules")])
   .then(([employeeRows,scheduleRows])=>{if(!ignore){setEmployees(employeeRows.map(employeeFromApi));setSchedules(scheduleRows);}})
   .catch(err=>{if(!ignore)setError(err.message||"Failed to load schedules");})
   .finally(()=>{if(!ignore)setLoading(false);});
  return()=>{ignore=true;};
 },[]);

 const formatDay=day=>day?.workday?`${day.startTime||""} - ${day.endTime||""}`:"Off";

 return(
  <section className="employee-page">
   <div className="employee-page-title"><h2>Scheduling</h2></div>
   {error?<div className="alert alert-danger">{error}</div>:null}
   <section className="employee-card">
    {loading?<p>Loading schedules…</p>:<table><thead><tr><th>Employee</th>{days.map(day=><th key={day}>{day[0].toUpperCase()+day.slice(1)}</th>)}</tr></thead><tbody>{employees.map(employee=>{const schedule=scheduleByEmployee[employee.id];return <tr key={employee.id}><td>{employeeName(employee)}</td>{days.map(day=><td key={day}>{schedule?formatDay(schedule[day]):"Not scheduled"}</td>)}</tr>;})}</tbody></table>}
   </section>
  </section>
 );
}

export default Scheduling;
