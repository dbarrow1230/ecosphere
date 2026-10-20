import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import {travelApi} from "../../utils/travelApi.js";

export default function TravelLogSummary({user}) {
 const [logs,setLogs]=useState([]);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState("");
 useEffect(()=>{
  let active=true;setLogs([]);setError("");
  if(!user){setLoading(false);return;}
  setLoading(true);
  travelApi().then(data=>{if(active)setLogs(data.logs);})
   .catch(err=>{if(active)setError(err.message);})
   .finally(()=>{if(active)setLoading(false);});
  return()=>{active=false;};
 },[user]);
 return <section className="dashboard-section mb-3">
  <h2>Your travel &amp; hiking logs</h2>
  <p><Link to="/trips">Travel notes</Link> · <Link to="/hiking-logs">Hiking logs</Link> · <Link to="/reference">Reference charts</Link></p>
  {!user ? <p><Link to="/login">Sign in</Link> to see your saved logs.</p> : loading ? <p role="status">Loading logs…</p> : error ? <p role="alert">{error}</p> : <>
   <p>{logs.filter(log=>log.kind==="travel").length} travel entries · {logs.filter(log=>log.kind==="hiking").length} hiking entries</p>
   {logs.length ? <ul>{logs.slice(0,5).map(log=><li key={log._id}><Link to={`${log.kind==="hiking" ? "/hiking-logs" : "/trips"}/${log._id}`}>{log.title}</Link> — {log.date}</li>)}</ul> : <p>No saved logs yet. <Link to="/trips/add">Add your first entry</Link>.</p>}
  </>}
 </section>;
}
