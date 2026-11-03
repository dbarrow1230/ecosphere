import {useEffect,useState} from "react";
import {Alert,Button,Card,Modal,Table} from "react-bootstrap";
import GardenExpenseForm from "../forms/planning/GardenExpenseForm.jsx";
import "./planning.css";

const endpoint="/api/garden-expenses";

export default function GardenExpensesPage(){
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
  try{const response=await fetch(endpoint);const data=await response.json();if(!response.ok)throw new Error(data.message||"Unable to load garden expenses");setRows(data);}
  catch(error){setError(error.message);}finally{setLoading(false);}
 }
 useEffect(()=>{load();},[]);
 function open(record=null){setEditing(record);setFormError("");setNotice("");setShowForm(true);}
 async function save(values){
  setSaving(true);setFormError("");
  try{
   const response=await fetch(editing?`${endpoint}/${editing._id}`:endpoint,{method:editing?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(values)});
   const data=await response.json();if(!response.ok)throw new Error(data.message||"Unable to save expense");
   setRows(previous=>editing?previous.map(row=>row._id===data._id?data:row):[data,...previous]);setShowForm(false);setNotice("Expense saved.");
  }catch(error){setFormError(error.message);}finally{setSaving(false);}
 }
 async function remove(record){
  if(!window.confirm(`Delete ${record.name}?`))return;
  setError("");setNotice("");
  try{const response=await fetch(`${endpoint}/${record._id}`,{method:"DELETE"});const data=await response.json();if(!response.ok)throw new Error(data.message||"Unable to delete record");setRows(previous=>previous.filter(row=>row._id!==record._id));setNotice("Expense deleted.");}
  catch(error){setError(error.message);}
 }
 return <section className="garden-planning-page">
  <header className="garden-planning-header"><div><h1>Garden Expenses</h1><p>Record actual purchases, vendors, warranties, and savings.</p></div><div className="d-flex gap-2"><Button variant="outline-primary" onClick={load} disabled={loading}>Refresh</Button><Button onClick={()=>open()}>Add Expense</Button></div></header>
  {error&&<Alert variant="danger">{error}</Alert>}{notice&&<Alert variant="success">{notice}</Alert>}
  <Card><Card.Body><Table responsive hover><thead><tr><th scope="col">Date</th><th scope="col">Item</th><th scope="col">Vendor</th><th scope="col">Warranty</th><th scope="col">Quantity</th><th scope="col">Unit price</th><th scope="col">Saved</th><th scope="col">Amount paid</th><th scope="col">Currency</th><th scope="col">Actions</th></tr></thead><tbody>{rows.map(row=><tr key={row._id}><td>{row.purchaseDate?.slice(0,10)||"—"}</td><td>{row.name??"—"}</td><td>{row.vendor??"—"}</td><td>{row.warranty??"—"}</td><td>{row.quantity??"—"}</td><td>{Number(row.unitCost||0).toFixed(2)}</td><td>{Number(row.savedAmount||0).toFixed(2)}</td><td>{Number(row.totalCost||0).toFixed(2)}</td><td>{row.currency??"—"}</td><td><div className="d-flex gap-2"><Button size="sm" onClick={()=>open(row)}>Edit</Button><Button size="sm" variant="outline-danger" onClick={()=>remove(row)}>Delete</Button></div></td></tr>)}{!rows.length&&<tr><td colSpan={10}>{loading?"Loading...":"No records yet."}</td></tr>}</tbody></Table></Card.Body></Card>
  <Modal show={showForm} onHide={()=>!saving&&setShowForm(false)} size="lg" centered backdrop="static"><Modal.Header closeButton={!saving}><Modal.Title>{editing?"Edit":"Add"} Expense</Modal.Title></Modal.Header><Modal.Body>{showForm&&<GardenExpenseForm key={editing?._id||"new"} record={editing} onSave={save} onCancel={()=>setShowForm(false)} saving={saving} error={formError}/>}</Modal.Body></Modal>
 </section>;
}
