import {useEffect,useMemo,useState} from "react";
import {clockHours,employeeName} from "../utils/employeeManager.js";
import {apiRequest,loadEmployeeData} from "../utils/employeeManagerApi.js";

function Reports(){
 const [data,setData]=useState({employees:[],timeClock:[],leave:[],payrolls:[],attachments:[]});
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const employees=useMemo(()=>Object.fromEntries(data.employees.map(employee=>[employee.id,employee])),[data.employees]);
 const [dailyOvertimeAfter,setDailyOvertimeAfter]=useState(8);
 const rows=data.timeClock.map(entry=>({...entry,employee:employeeName(employees[entry.employeeId]||entry.employeeRef),hours:clockHours(entry)}));

 useEffect(()=>{
  let ignore=false;
  Promise.all([loadEmployeeData(),apiRequest("/api/employee-settings")])
   .then(([result,settings])=>{if(!ignore){setData(result);setDailyOvertimeAfter(Number(settings.dailyOvertimeAfter||8));}})
   .catch(err=>{if(!ignore)setError(err.message||"Failed to load reports");})
   .finally(()=>{if(!ignore)setLoading(false);});
  return()=>{ignore=true;};
 },[]);

 return(
  <section className="employee-page">
   <div className="employee-page-title"><h2>Reports</h2></div>
   {error?<div className="alert alert-danger">{error}</div>:null}
   <div className="employee-metrics"><article><span>Timeclock Rows</span><strong>{rows.length}</strong></article><article><span>Leave Records</span><strong>{data.leave.length}</strong></article><article><span>Payroll Periods</span><strong>{data.payrolls.length}</strong></article><article><span>Attachments</span><strong>{data.attachments.length}</strong></article></div>
   <section className="employee-card"><h3>Timeclock Report</h3>{loading?<p>Loading report…</p>:<table><thead><tr><th>Employee</th><th>Date</th><th>Reg. Hrs.</th><th>OT Hours</th><th>Notes</th></tr></thead><tbody>{rows.map(row=><tr key={row.id}><td>{row.employee}</td><td>{row.date}</td><td>{Math.min(row.hours,dailyOvertimeAfter).toFixed(2)}</td><td>{Math.max(0,row.hours-dailyOvertimeAfter).toFixed(2)}</td><td>{row.notes}</td></tr>)}</tbody></table>}</section>
  </section>
 );
}

export default Reports;
