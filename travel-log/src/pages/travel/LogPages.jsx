import {useEffect,useState} from "react";
import {Link,useParams} from "react-router-dom";
import {Alert,Container,Spinner,Table} from "react-bootstrap";
import {travelApi} from "../../utils/travelApi.js";
import {logFields} from "../../config/travelFields.js";

export default function LogPages({kind="travel"}) {
 const {id}=useParams();
 const [data,setData]=useState(null);
 const [error,setError]=useState("");
 const [reload,setReload]=useState(0);
 const base=kind==="hiking" ? "/hiking-logs" : "/trips";
 useEffect(()=>{
  let active=true;setData(null);setError("");
  travelApi(id ? `/${id}` : `?kind=${kind}`).then(result=>{
   if(id && result.log.kind!==kind) throw new Error("This entry belongs to a different log type.");
   if(active)setData(result);
  }).catch(err=>{if(active)setError(err.message);});
  return()=>{active=false;};
 },[id,kind,reload]);
 return <Container className="py-4">
  <h1>{id ? data?.log?.title || "Log details" : kind==="hiking" ? "Hiking logs" : "Travel notes"}</h1>
  <p><Link to={`${base}/add`}>Add {kind==="hiking" ? "hiking log" : "travel notes"}</Link></p>
  {error && <Alert variant="danger">{error} <button className="btn btn-link" onClick={()=>setReload(value=>value+1)}>Retry</button> <Link to="/login">Sign in</Link></Alert>}
  {!data && !error && <Spinner animation="border" role="status"><span className="visually-hidden">Loading logs</span></Spinner>}
  {data?.log && <><dl>{logFields[kind].map(field=><div key={field.name} className="mb-3">
   <dt>{field.label}</dt><dd style={{whiteSpace:"pre-wrap"}}>{data.log[field.name] ?? "—"}</dd>
  </div>)}</dl><Link to={`${base}/${id}/edit`}>Edit log</Link> · <Link to={base}>Back to logs</Link></>}
  {data?.logs && (data.logs.length ? <Table responsive striped><thead><tr><th>Date</th><th>Title</th><th>Location</th><th>Actions</th></tr></thead>
   <tbody>{data.logs.map(log=><tr key={log._id}><td>{log.date}</td><td><Link to={`${base}/${log._id}`}>{log.title}</Link></td><td>{log.location || "—"}</td><td><Link to={`${base}/${log._id}/edit`}>Edit</Link></td></tr>)}</tbody></Table> : <Alert variant="info">No logs yet. Add an entry to start your journal.</Alert>)}
 </Container>;
}
