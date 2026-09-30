import {useCallback,useEffect,useState} from "react";
import {Alert,Button,Card,Container,Form} from "react-bootstrap";

const labels={company:"Company",name:"Contact",phone:"Phone",email:"Email",address:"Service address",property:"Property type",service:"Service needed",equipment:"Equipment",quantity:"Quantity",details:"Details",subject:"Subject",message:"Message"};
async function api(url,options={}){
 const token=localStorage.getItem("token")||sessionStorage.getItem("token")||"";
 const response=await fetch(url,{...options,headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`}});
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(data.message||"Request failed.");
 return data;
}
export default function Requests(){
 const [rows,setRows]=useState([]),[error,setError]=useState(""),[loading,setLoading]=useState(true),[saving,setSaving]=useState("");
 const load=useCallback(async()=>{
  setLoading(true);setError("");
  try{const data=await api("/api/requests");if(!Array.isArray(data))throw new Error("Unexpected response while loading requests.");setRows(data);}
  catch(error){setError(error.message);}finally{setLoading(false);}
 },[]);
 useEffect(()=>{load();},[load]);
 const update=async(id,status)=>{
  setSaving(id);setError("");
  try{const row=await api(`/api/requests/${id}`,{method:"PATCH",body:JSON.stringify({status})});setRows(previous=>previous.map(item=>item._id===id?row:item));}
  catch(error){setError(error.message);}finally{setSaving("");}
 };
 return <Container className="py-4">
  <div className="d-flex justify-content-between mb-3"><h1>Customer Requests</h1><Button onClick={load} disabled={loading}>Refresh</Button></div>
  <p>Latest 200 service requests, equipment quotes, and general inquiries.</p>
  {error&&<Alert variant="danger">{error}</Alert>}
  {loading?<p role="status">Loading requests...</p>:!error&&!rows.length?<p>No saved requests yet.</p>:null}
  {rows.map(row=><Card className="mb-3" key={row._id}><Card.Body>
   <h2 className="h5">{row.kind==="quote"?"Equipment quote":row.kind==="service"?"Service request":"Contact inquiry"} — {row.name}</h2>
   <p className="text-muted">{new Date(row.createdAt).toLocaleString()} · Reference: {row._id}</p>
   <dl>{Object.entries(labels).filter(([key])=>row[key]!==undefined&&row[key]!==null&&row[key]!=="").map(([key,label])=><div key={key}><dt>{label}</dt><dd style={{whiteSpace:"pre-wrap"}}>{String(row[key])}</dd></div>)}</dl>
   <Form.Label htmlFor={`status-${row._id}`}>Status</Form.Label>
   <Form.Select id={`status-${row._id}`} value={row.status} disabled={saving===row._id} onChange={event=>update(row._id,event.target.value)}>
    <option value="new">New</option><option value="reviewing">Reviewing</option><option value="closed">Closed</option>
   </Form.Select>
  </Card.Body></Card>)}
 </Container>;
}
