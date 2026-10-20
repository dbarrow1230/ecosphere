import {useEffect,useState} from "react";
import {Alert,Button,Card,Modal,Table} from "react-bootstrap";
import GardenBudgetForm from "../forms/planning/GardenBudgetForm.jsx";
import "./planning.css";

const endpoint="/api/garden-budgets";

export default function GardenBudgetsPage(){
 const [rows,setRows]=useState([]);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [formError,setFormError]=useState("");
 const [notice,setNotice]=useState("");
 const [showForm,setShowForm]=useState(false);
 const [editing,setEditing]=useState(null);
 async function load(){
  setLoading(true);setError("");
  try{const response=await fetch(endpoint);const data=await response.json();if(!response.ok)throw new Error(data.message||"Unable to load garden budgets");setRows(data);}
  catch(error){setError(error.message);}finally{setLoading(false);}
 }
 useEffect(()=>{load();},[]);
 function open(record=null){setEditing(record);setFormError("");setNotice("");setShowForm(true);}
 async function save(values){
  setSaving(true);setFormError("");
  try{
   const response=await fetch(editing?`${endpoint}/${editing._id}`:endpoint,{method:editing?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(values)});
   const data=await response.json();if(!response.ok)throw new Error(data.message||"Unable to save budget item");
   setRows(previous=>editing?previous.map(row=>row._id===data._id?data:row):[data,...previous]);setShowForm(false);setNotice("Budget Item saved.");
  }catch(error){setFormError(error.message);}finally{setSaving(false);}
 }
 async function remove(record){
  if(!window.confirm(`Delete ${record.name}?`))return;
  setError("");setNotice("");
  try{const response=await fetch(`${endpoint}/${record._id}`,{method:"DELETE"});const data=await response.json();if(!response.ok)throw new Error(data.message||"Unable to delete record");setRows(previous=>previous.filter(row=>row._id!==record._id));setNotice("Budget Item deleted.");}
  catch(error){setError(error.message);}
 }
 return <section className="garden-planning-page">
  <header className="garden-planning-header"><div><h1>Garden Budgets</h1><p>Plan garden purchases and compare their estimated cost with the amount allotted.</p></div><div className="d-flex gap-2"><Button variant="outline-primary" onClick={load} disabled={loading}>Refresh</Button><Button onClick={()=>open()}>Add Budget Item</Button></div></header>
  {error&&<Alert variant="danger">{error}</Alert>}{notice&&<Alert variant="success">{notice}</Alert>}
  <Card><Card.Body><Table responsive hover><thead><tr><th scope="col">Item</th><th scope="col">Year</th><th scope="col">Quantity</th><th scope="col">Unit cost</th><th scope="col">Estimated total</th><th scope="col">Allotted budget</th><th scope="col">Remaining</th><th scope="col">Currency</th><th scope="col">Actions</th></tr></thead><tbody>{rows.map(row=><tr key={row._id}><td>{row.name??"—"}</td><td>{row.year??"—"}</td><td>{row.quantity??"—"}</td><td>{Number(row.unitCost||0).toFixed(2)}</td><td>{Number(row.totalCost||0).toFixed(2)}</td><td>{Number(row.allottedBudget||0).toFixed(2)}</td><td>{Number(row.remainingBudget||0).toFixed(2)}</td><td>{row.currency??"—"}</td><td><div className="d-flex gap-2"><Button size="sm" onClick={()=>open(row)}>Edit</Button><Button size="sm" variant="outline-danger" onClick={()=>remove(row)}>Delete</Button></div></td></tr>)}{!rows.length&&<tr><td colSpan={9}>{loading?"Loading...":"No records yet."}</td></tr>}</tbody></Table></Card.Body></Card>
  <Modal show={showForm} onHide={()=>!saving&&setShowForm(false)} size="lg" centered backdrop="static"><Modal.Header closeButton={!saving}><Modal.Title>{editing?"Edit":"Add"} Budget Item</Modal.Title></Modal.Header><Modal.Body>{showForm&&<GardenBudgetForm key={editing?._id||"new"} record={editing} onSave={save} onCancel={()=>setShowForm(false)} saving={saving} error={formError}/>}</Modal.Body></Modal>
 </section>;
}
