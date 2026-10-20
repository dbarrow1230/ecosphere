import {useEffect,useState} from "react";
import {Link,useNavigate,useParams} from "react-router-dom";
import {Alert,Button,Container,Form,Row,Col,Spinner} from "react-bootstrap";
import {logFields} from "../../config/travelFields.js";
import {travelApi} from "../../utils/travelApi.js";

export default function LogFormPage({kind="travel"}) {
 const {id}=useParams();
 const navigate=useNavigate();
 const [form,setForm]=useState({});
 const [loading,setLoading]=useState(!!id);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [loadFailed,setLoadFailed]=useState(false);
 const base=kind==="hiking" ? "/hiking-logs" : "/trips";
 useEffect(()=>{
  let active=true;
  setForm({});setError("");setLoadFailed(false);setLoading(!!id);
  if(id) travelApi(`/${id}`).then(({log})=>{
   if(log.kind!==kind) throw new Error("This entry belongs to a different log type.");
   if(active)setForm(log);
  }).catch(err=>{if(active){setError(err.message);setLoadFailed(true);}})
   .finally(()=>{if(active)setLoading(false);});
  return()=>{active=false;};
 },[id,kind]);
 async function save(event) {
  event.preventDefault();setSaving(true);setError("");
  try {
   const {log}=await travelApi(id ? `/${id}` : "",{method:id ? "PUT" : "POST",body:JSON.stringify({...form,kind})});
   navigate(`${base}/${log._id}`);
  } catch(err) {setError(err.message);} finally {setSaving(false);}
 }
 return <Container className="py-4">
  <h1>{id ? "Edit" : "Add"} {kind==="hiking" ? "hiking log" : "travel notes"}</h1>
  <p>Based on your {kind==="hiking" ? "hiking log" : "travel notes"} template. Sign in to save entries to your account.</p>
  {error && <Alert variant="danger">{error}</Alert>}
  {loading ? <Spinner animation="border" role="status"><span className="visually-hidden">Loading log</span></Spinner> :
   <Form onSubmit={save}><fieldset disabled={saving || loadFailed}><Row>
    {logFields[kind].map(field=><Col md={field.type==="textarea" ? 12 : 6} key={field.name}>
     <Form.Group className="mb-3" controlId={`log-${field.name}`}>
      <Form.Label>{field.label}{field.required ? " *" : ""}</Form.Label>
      <Form.Control as={field.type==="textarea" ? "textarea" : "input"} type={field.type==="textarea" ? undefined : field.type || "text"}
       rows={field.type==="textarea" ? 4 : undefined} name={field.name} required={field.required}
       min={field.min} max={field.max} step={field.type==="number" ? 1 : undefined}
       maxLength={field.type==="textarea" ? 20000 : 500} value={form[field.name] ?? ""}
       onChange={event=>setForm(prev=>({...prev,[field.name]:event.target.value}))}/>
     </Form.Group>
    </Col>)}
   </Row><Button type="submit">{saving ? "Saving…" : "Save log"}</Button></fieldset></Form>}
  <Link className="d-inline-block mt-3" to={base}>Back to logs</Link>
 </Container>;
}
