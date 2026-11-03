import {useEffect,useMemo,useState} from "react";
import {Button,Card,Col,Form,Row,Table} from "react-bootstrap";
import {employeeName,money} from "../utils/employeeManager.js";
import {apiRequest,employeeFromApi,leaveFromApi,leaveToApi} from "../utils/employeeManagerApi.js";

function Leave(){
 const [employees,setEmployees]=useState([]);
 const [leaves,setLeaves]=useState([]);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [draft,setDraft]=useState({employeeId:"",type:"Vacation",paid:true,rate:0,annualMax:40,used:0,notes:""});
 const employeeById=useMemo(()=>Object.fromEntries(employees.map(employee=>[employee.id,employee])),[employees]);

 useEffect(()=>{
  let ignore=false;
  Promise.all([apiRequest("/api/employees"),apiRequest("/api/employee-leave")])
   .then(([employeeRows,leaveRows])=>{
    if(ignore)return;
    const mappedEmployees=employeeRows.map(employeeFromApi);
    setEmployees(mappedEmployees);
    setLeaves(leaveRows.map(leaveFromApi));
    setDraft(current=>({...current,employeeId:mappedEmployees[0]?.id||""}));
   })
   .catch(err=>{if(!ignore)setError(err.message||"Failed to load leave data");})
   .finally(()=>{if(!ignore)setLoading(false);});
  return()=>{ignore=true;};
 },[]);

 const add=async()=>{
  if(!draft.employeeId||!draft.type.trim()){setError("Employee and leave type are required.");return;}
  try{
   setSaving(true);
   setError("");
   const saved=leaveFromApi(await apiRequest("/api/employee-leave",{method:"POST",body:JSON.stringify(leaveToApi(draft))}));
   setLeaves(current=>[saved,...current]);
  }catch(err){setError(err.message||"Failed to add leave");}
  finally{setSaving(false);}
 };

 return(
  <section className="employee-page leave-page">
   <div className="employee-page-title"><h2>Leave</h2></div>
   {error?<div className="alert alert-danger">{error}</div>:null}
   <Card className="employee-card"><Card.Body><Form className="employee-form"><Row className="g-3">
    <Col md={6}><Form.Group controlId="leaveEmployee"><Form.Label>Employee</Form.Label><Form.Select value={draft.employeeId} onChange={event=>setDraft({...draft,employeeId:event.target.value})}><option value="">Select employee</option>{employees.map(employee=><option key={employee.id} value={employee.id}>{employeeName(employee)}</option>)}</Form.Select></Form.Group></Col>
    <Col md={6}><Form.Group controlId="leaveType"><Form.Label>Leave Type</Form.Label><Form.Control value={draft.type} onChange={event=>setDraft({...draft,type:event.target.value})}/></Form.Group></Col>
    <Col md={6}><Form.Group controlId="leavePaid"><Form.Label>Paid</Form.Label><Form.Select value={String(draft.paid)} onChange={event=>setDraft({...draft,paid:event.target.value==="true"})}><option value="true">Paid</option><option value="false">Non-Paid</option></Form.Select></Form.Group></Col>
    <Col md={6}><Form.Group controlId="leaveRate"><Form.Label>Rate/Hr</Form.Label><Form.Control type="number" value={draft.rate} onChange={event=>setDraft({...draft,rate:Number(event.target.value)})}/></Form.Group></Col>
    <Col md={6}><Form.Group controlId="leaveAnnualMax"><Form.Label>Annual Max</Form.Label><Form.Control type="number" value={draft.annualMax} onChange={event=>setDraft({...draft,annualMax:Number(event.target.value)})}/></Form.Group></Col>
    <Col md={6}><Form.Group controlId="leaveUsed"><Form.Label>Used Hours</Form.Label><Form.Control type="number" value={draft.used} onChange={event=>setDraft({...draft,used:Number(event.target.value)})}/></Form.Group></Col>
    <Col xs={12}><Button type="button" variant="primary" disabled={saving||loading} onClick={add}>{saving?"Saving…":"Add Leave"}</Button></Col>
   </Row></Form></Card.Body></Card>
   <Card className="employee-card"><Card.Body>{loading?<p>Loading leave records…</p>:<Table responsive bordered hover className="employee-table"><thead><tr><th>Employee</th><th>Leave Type</th><th>Paid</th><th>Rate/Hr</th><th>Annual Max</th><th>Used</th><th>Remaining</th></tr></thead><tbody>{leaves.map(leave=><tr key={leave.id}><td>{employeeName(employeeById[leave.employeeId]||leave.employeeRef)}</td><td>{leave.type}</td><td>{leave.paid?"Paid":"Non-Paid"}</td><td>{money.format(leave.rate)}</td><td>{leave.annualMax}</td><td>{leave.used}</td><td>{leave.annualMax-leave.used}</td></tr>)}</tbody></Table>}</Card.Body></Card>
  </section>
 );
}

export default Leave;
