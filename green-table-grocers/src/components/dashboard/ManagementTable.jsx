import {useCallback,useEffect,useState} from "react";
import {Alert,Button,ButtonGroup,Card,Form,Spinner,Table} from "react-bootstrap";

const getRows=data=>Array.isArray(data?.data)?data.data:Array.isArray(data)?data:[];

function ManagementTable({title,endpoint,emptyRecord,fields}){
 const [records,setRecords]=useState([]);
 const [form,setForm]=useState(emptyRecord);
 const [editingId,setEditingId]=useState("");
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");

 const loadRecords=useCallback(async()=>{
  setLoading(true);
  setError("");
  try{
   const response=await fetch(endpoint);
   const data=await response.json().catch(()=>null);
   if(!response.ok)throw new Error(data?.message||`Unable to load ${title.toLowerCase()}.`);
   setRecords(getRows(data));
  }catch(requestError){
   setError(requestError.message);
  }finally{
   setLoading(false);
  }
 },[endpoint,title]);

 useEffect(()=>{
  queueMicrotask(loadRecords);
 },[loadRecords]);

 const resetForm=()=>{
  setForm(emptyRecord);
  setEditingId("");
 };

 const editRecord=record=>{
  setForm(fields.reduce((values,field)=>({...values,[field.name]:record[field.name]??""}),{}));
  setEditingId(record._id||record.id);
 };

 const saveRecord=async event=>{
  event.preventDefault();
  setSaving(true);
  setError("");
  try{
   const response=await fetch(editingId?`${endpoint}/${editingId}`:endpoint,{
    method:editingId?"PUT":"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(form)
   });
   const data=await response.json().catch(()=>null);
   if(!response.ok)throw new Error(data?.message||`Unable to save ${title.toLowerCase()}.`);
   resetForm();
   await loadRecords();
  }catch(requestError){
   setError(requestError.message);
  }finally{
   setSaving(false);
  }
 };

 const removeRecord=async record=>{
  const id=record._id||record.id;
  if(!id||!window.confirm(`Delete ${record.name||"this record"}?`))return;
  setError("");
  try{
   const response=await fetch(`${endpoint}/${id}`,{method:"DELETE"});
   const data=await response.json().catch(()=>null);
   if(!response.ok)throw new Error(data?.message||`Unable to delete ${title.toLowerCase()}.`);
   if(editingId===id)resetForm();
   await loadRecords();
  }catch(requestError){
   setError(requestError.message);
  }
 };

 return(
  <section className="container-fluid py-4">
   <h1>{title}</h1>
   {error?<Alert variant="danger" dismissible onClose={()=>setError("")}>{error}</Alert>:null}
   <Card className="mb-4"><Card.Body>
    <Form onSubmit={saveRecord}>
     <div className="row g-3 align-items-end">
      {fields.map(field=><Form.Group className="col-md" key={field.name}>
       <Form.Label>{field.label}</Form.Label>
       <Form.Control type={field.type||"text"} value={form[field.name]??""} onChange={event=>setForm(current=>({...current,[field.name]:event.target.value}))}/>
      </Form.Group>)}
      <div className="col-md-auto"><ButtonGroup><Button type="submit" disabled={saving}>{saving?"Saving…":editingId?"Save Changes":"Add"}</Button>{editingId?<Button type="button" variant="outline-secondary" onClick={resetForm}>Cancel</Button>:null}</ButtonGroup></div>
     </div>
    </Form>
   </Card.Body></Card>
   <Card><Card.Body className="p-0">
    {loading?<div className="text-center p-5"><Spinner/></div>:<Table responsive hover className="mb-0"><thead><tr>{fields.map(field=><th key={field.name}>{field.label}</th>)}<th>Actions</th></tr></thead><tbody>{records.map(record=><tr key={record._id||record.id}>{fields.map(field=><td key={field.name}>{record[field.name]??"—"}</td>)}<td><ButtonGroup size="sm"><Button variant="outline-primary" onClick={()=>editRecord(record)}>Edit</Button><Button variant="outline-danger" onClick={()=>removeRecord(record)}>Delete</Button></ButtonGroup></td></tr>)}</tbody></Table>}
   </Card.Body></Card>
  </section>
 );
}

export default ManagementTable;
