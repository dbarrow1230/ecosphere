import {useEffect,useState} from "react";
import {employeeName,money} from "../utils/employeeManager.js";
import {apiRequest,employeeFromApi,employeeToApi} from "../utils/employeeManagerApi.js";

const emptyEmployee=()=>({
 id:"",
 employeeNumber:`EMP-${Date.now().toString().slice(-6)}`,
 firstName:"",
 lastName:"",
 gender:"",
 status:"Active",
 position:"Service Tech",
 payType:"Hourly",
 rate:0,
 email:"",
 phone:"",
 startDate:new Date().toISOString().slice(0,10),
 notes:""
});

function Employees(){
 const [employees,setEmployees]=useState([]);
 const [draft,setDraft]=useState(emptyEmployee);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");

 useEffect(()=>{
  let ignore=false;
  const load=async()=>{
   try{
    const rows=(await apiRequest("/api/employees")).map(employeeFromApi);
    if(ignore)return;
    setEmployees(rows);
    setDraft(rows[0]||emptyEmployee());
   }catch(err){
    if(!ignore)setError(err.message||"Failed to load employees");
   }finally{
    if(!ignore)setLoading(false);
   }
  };
  load();
  return()=>{ignore=true;};
 },[]);

 const selectEmployee=employee=>setDraft({...employee});

 const save=async()=>{
  if(!draft.employeeNumber.trim()||!draft.firstName.trim()||!draft.lastName.trim()){
   setError("Employee number, first name, and last name are required.");
   return;
  }

  try{
   setSaving(true);
   setError("");
   const saved=employeeFromApi(await apiRequest(
    draft.id?`/api/employees/${draft.id}`:"/api/employees",
    {method:draft.id?"PUT":"POST",body:JSON.stringify(employeeToApi(draft))}
   ));
   setEmployees(current=>draft.id?current.map(employee=>employee.id===saved.id?saved:employee):[saved,...current]);
   setDraft(saved);
  }catch(err){
   setError(err.message||"Failed to save employee");
  }finally{
   setSaving(false);
  }
 };

 return(
  <section className="employee-page">
   <div className="employee-page-title"><h2>Employees</h2></div>
   {error?<div className="alert alert-danger">{error}</div>:null}
   <div className="employee-actions"><button className="btn btn-primary" onClick={()=>setDraft(emptyEmployee())}>Add Employee</button></div>
   <div className="employee-grid employee-grid-wide">
    <section className="employee-card">
     <h3>Employee List</h3>
     {loading?<p>Loading employees…</p>:
      <table><thead><tr><th>Name</th><th>ID</th><th>Position</th><th>Status</th><th>Pay</th></tr></thead><tbody>{employees.map(employee=><tr key={employee.id} onClick={()=>selectEmployee(employee)}><td>{employeeName(employee)}</td><td>{employee.employeeNumber}</td><td>{employee.position}</td><td>{employee.status}</td><td>{employee.payType==="Salary"?money.format(employee.rate):`${money.format(employee.rate)}/hr`}</td></tr>)}</tbody></table>}
    </section>
    <section className="employee-card">
     <h3>{draft.id?"Employee Detail":"New Employee"}</h3>
     <div className="employee-form">
      {["employeeNumber","firstName","lastName","gender","status","position","payType","rate","email","phone","startDate","notes"].map(field=><label key={field}>{field}<input value={draft[field]??""} type={field==="rate"?"number":field==="startDate"?"date":"text"} onChange={event=>setDraft({...draft,[field]:field==="rate"?Number(event.target.value):event.target.value})}/></label>)}
     </div>
     <button className="btn btn-success" disabled={saving} onClick={save}>{saving?"Saving…":"Save Employee"}</button>
    </section>
   </div>
  </section>
 );
}

export default Employees;
