import {useEffect,useMemo,useState} from "react";
import {employeeName} from "../utils/employeeManager.js";
import {apiRequest,attachmentFromApi,attachmentToApi,employeeFromApi} from "../utils/employeeManagerApi.js";

function Attachments(){
 const [employees,setEmployees]=useState([]);
 const [attachments,setAttachments]=useState([]);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [draft,setDraft]=useState({employeeId:"",fileName:"",type:"Document",fileUrl:"",addedBy:"User",addedOn:new Date().toISOString().slice(0,10)});
 const employeeById=useMemo(()=>Object.fromEntries(employees.map(employee=>[employee.id,employee])),[employees]);

 useEffect(()=>{
  let ignore=false;
  Promise.all([apiRequest("/api/employees"),apiRequest("/api/employee-attachments")])
   .then(([employeeRows,attachmentRows])=>{if(!ignore){const mapped=employeeRows.map(employeeFromApi);setEmployees(mapped);setAttachments(attachmentRows.map(attachmentFromApi));setDraft(current=>({...current,employeeId:mapped[0]?.id||""}));}})
   .catch(err=>{if(!ignore)setError(err.message||"Failed to load attachments");})
   .finally(()=>{if(!ignore)setLoading(false);});
  return()=>{ignore=true;};
 },[]);

 const add=async()=>{
  if(!draft.fileName.trim()){setError("File name is required.");return;}
  try{
   setSaving(true);setError("");
   const saved=attachmentFromApi(await apiRequest("/api/employee-attachments",{method:"POST",body:JSON.stringify(attachmentToApi(draft))}));
   setAttachments(current=>[saved,...current]);
  }catch(err){setError(err.message||"Failed to add attachment");}
  finally{setSaving(false);}
 };

 return(
  <section className="employee-page">
   <div className="employee-page-title"><h2>Attachments</h2></div>
   {error?<div className="alert alert-danger">{error}</div>:null}
   <section className="employee-card"><div className="employee-form">
    <label>Employee<select value={draft.employeeId} onChange={event=>setDraft({...draft,employeeId:event.target.value})}><option value="">General document</option>{employees.map(employee=><option key={employee.id} value={employee.id}>{employeeName(employee)}</option>)}</select></label>
    <label>File Name<input value={draft.fileName} onChange={event=>setDraft({...draft,fileName:event.target.value})}/></label>
    <label>File URL<input value={draft.fileUrl} onChange={event=>setDraft({...draft,fileUrl:event.target.value})}/></label>
    <label>Type<input value={draft.type} onChange={event=>setDraft({...draft,type:event.target.value})}/></label>
    <label>Added By<input value={draft.addedBy} onChange={event=>setDraft({...draft,addedBy:event.target.value})}/></label>
   </div><button className="btn btn-primary" disabled={saving||loading} onClick={add}>{saving?"Saving…":"Add Attachment"}</button></section>
   <section className="employee-card">{loading?<p>Loading attachments…</p>:<table><thead><tr><th>Employee</th><th>File Name</th><th>Type</th><th>Added By</th><th>Added On</th></tr></thead><tbody>{attachments.map(file=><tr key={file.id}><td>{file.employeeId?employeeName(employeeById[file.employeeId]||file.employeeRef):"General"}</td><td>{file.fileUrl?<a href={file.fileUrl} target="_blank" rel="noreferrer">{file.fileName}</a>:file.fileName}</td><td>{file.type}</td><td>{file.addedBy}</td><td>{file.addedOn}</td></tr>)}</tbody></table>}</section>
  </section>
 );
}

export default Attachments;
