import {useCallback,useEffect,useState} from "react";
import {Alert,Button,Card,Col,Form,Row,Spinner,Table} from "react-bootstrap";

export default function ManagementTable({title,endpoint,emptyRecord,fields}){
 const [records,setRecords]=useState([]);
 const [record,setRecord]=useState(emptyRecord);
 const [editingId,setEditingId]=useState("");
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const load=useCallback(async()=>{try{setLoading(true);const response=await fetch(endpoint);if(!response.ok)throw new Error("Unable to load records");setRecords(await response.json());setError("");}catch(err){setError(err.message);}finally{setLoading(false);}},[endpoint]);
 useEffect(()=>{queueMicrotask(load);},[load]);
 const save=async event=>{event.preventDefault();try{const response=await fetch(editingId?`${endpoint}/${editingId}`:endpoint,{method:editingId?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(record)});if(!response.ok)throw new Error((await response.json().catch(()=>null))?.message||"Unable to save record");setRecord(emptyRecord);setEditingId("");await load();}catch(err){setError(err.message);}};
 const remove=async id=>{if(!window.confirm("Delete this record?"))return;const response=await fetch(`${endpoint}/${id}`,{method:"DELETE"});if(response.ok)await load();else setError("Unable to delete record");};
 return <section className="app-page"><Row className="g-4"><Col lg={4}><Card><Card.Body><h1>{title}</h1>{error&&<Alert variant="danger">{error}</Alert>}<Form onSubmit={save}>{fields.map(({name,label,type="text"})=><Form.Group className="mb-3" key={name}><Form.Label>{label}</Form.Label><Form.Control type={type} step={type==="number"?"0.01":undefined} value={record[name]??""} onChange={event=>setRecord(current=>({...current,[name]:type==="number"?Number(event.target.value):event.target.value}))} required={name==="name"}/></Form.Group>)}<Button type="submit">{editingId?"Update":"Add"}</Button>{editingId&&<Button className="ms-2" variant="outline-secondary" onClick={()=>{setEditingId("");setRecord(emptyRecord);}}>Cancel</Button>}</Form></Card.Body></Card></Col><Col lg={8}><Card><Card.Body>{loading?<Spinner/>:<Table responsive hover><thead><tr>{fields.map(field=><th key={field.name}>{field.label}</th>)}<th>Actions</th></tr></thead><tbody>{records.map(item=><tr key={item._id}>{fields.map(field=><td key={field.name}>{item[field.name]}</td>)}<td><Button size="sm" onClick={()=>{setEditingId(item._id);setRecord({...emptyRecord,...item});}}>Edit</Button><Button size="sm" className="ms-2" variant="outline-danger" onClick={()=>remove(item._id)}>Delete</Button></td></tr>)}{records.length===0&&<tr><td colSpan={fields.length+1}>No records yet.</td></tr>}</tbody></Table>}</Card.Body></Card></Col></Row></section>;
}
