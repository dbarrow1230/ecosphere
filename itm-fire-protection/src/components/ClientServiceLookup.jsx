import {useEffect,useState} from "react";
import {Alert,Button,Card,Form,Table} from "react-bootstrap";
import {Link} from "react-router-dom";
import {itmApi,displayDate} from "../utils/itmApi.js";

const clientFields={name:"Name",firstName:"First name",lastName:"Last name",company:"Company",email:"Email",phone:"Phone",altPhone:"Alternate phone",propertyName:"Property",propertyType:"Property type",siteContact:"Site contact",address1:"Address",address2:"Address line 2",city:"City",state:"State",country:"Country",postalCode:"Postal code",accessInstructions:"Access instructions",status:"Client status",notes:"Notes"};
export function ClientServiceDetails({overview,systemType="",showActions=true}){
 const {client,equipment,services}=overview;
 return <div>
  <h3 className="h4">{client.company||client.name}</h3>
  <dl className="row">{Object.entries(clientFields).map(([key,label])=><div className="col-md-6 mb-2" key={key}><dt>{label}</dt><dd className="mb-0" style={{whiteSpace:"pre-wrap"}}>{typeof client[key]==="object"?client[key]?.name||"—":client[key]||"—"}</dd></div>)}</dl>
  {showActions&&<div className="d-flex flex-wrap gap-2 mb-3"><Button as={Link} to={`/service-tracking?client=${client._id}&system=${encodeURIComponent(systemType)}`}>New service / inspection</Button><Button as={Link} variant="outline-primary" to={`/admin/inventory?client=${client._id}`}>Add or manage equipment</Button><Button as={Link} variant="outline-secondary" to="/admin/clients">Manage clients</Button></div>}
  <h4>Equipment and extinguishers ({equipment.length})</h4>
  <Table responsive striped><thead><tr><th>Equipment / serial</th><th>Manufacturer / model</th><th>Agent / capacity / rating</th><th>Location</th><th>Status</th><th>Last service</th><th>Next inspection</th></tr></thead><tbody>
   {equipment.map(item=><tr key={item._id}><td><Link to={`/admin/inventory?client=${client._id}&item=${item._id}`}>{item.name}</Link><br/>{item.serialNumber||item.sku||"Bulk supply"}</td><td>{item.manufacturer||"—"}<br/>{item.modelNumber||"—"}</td><td>{[item.agentType,item.capacity,item.rating].filter(Boolean).join(" / ")||"—"}</td><td>{item.location||"—"}</td><td>{item.status}</td><td>{displayDate(item.lastServiceDate)}</td><td>{displayDate(item.nextInspectionDate)}</td></tr>)}
   {!equipment.length&&<tr><td colSpan={7}>No equipment assigned to this client yet.</td></tr>}
  </tbody></Table>
  <h4>Service history ({services.length})</h4>
  {services.length?services.map(record=><Card key={record._id} className="mb-2"><Card.Body><Link to={`/service-tracking?record=${record._id}&client=${client._id}`}>{record.serviceType} — {record.status}</Link><p className="mb-1">{record.systemType} · {displayDate(record.serviceDate||record.scheduledDate)} · {record.technician||"Technician unassigned"}</p><p className="mb-1">{record.reason||record.notes}</p><ul className="mb-0">{record.equipment.map(item=><li key={item.equipmentRef}>{item.snapshot?.name} · Serial {item.snapshot?.serialNumber||"—"} · {item.outcome}{item.deficiencies?` · ${item.deficiencies}`:""}</li>)}</ul></Card.Body></Card>):<p>No service records yet.</p>}
 </div>;
}
export default function ClientServiceLookup({systemType="",selectedId="",onSelect,showDetails=true}){
 const [search,setSearch]=useState(""),[clients,setClients]=useState([]),[clientId,setClientId]=useState(selectedId),[overview,setOverview]=useState(null),[error,setError]=useState(""),[loading,setLoading]=useState(false);
 const token=localStorage.getItem("token")||sessionStorage.getItem("token");
 useEffect(()=>{setClientId(selectedId);},[selectedId]);
 useEffect(()=>{
  if(!token)return;let ignore=false;const timer=setTimeout(()=>{setLoading(true);itmApi(`/api/clients?search=${encodeURIComponent(search)}`).then(data=>{if(!ignore){setClients(data.clients||[]);setError("");}}).catch(error=>{if(!ignore)setError(error.message);}).finally(()=>{if(!ignore)setLoading(false);});},250);
  return()=>{ignore=true;clearTimeout(timer);};
 },[search,token]);
 useEffect(()=>{
  setOverview(null);if(!clientId||!showDetails)return;let ignore=false;
  itmApi(`/api/clients/${clientId}/overview`).then(data=>{if(!ignore){setOverview(data);setError("");}}).catch(error=>{if(!ignore)setError(error.message);});return()=>{ignore=true;};
 },[clientId,showDetails]);
 return <section className="container py-4"><Card><Card.Body>
  <h2 className="h3">Client service workspace</h2>
  {!token?<p><Link to="/login">Sign in</Link> to search client information, equipment serial numbers, and service records.</p>:<>
   <Form.Label htmlFor="client-workflow-search">Find client by name, company, phone, address, or equipment serial number</Form.Label>
   <Form.Control id="client-workflow-search" type="search" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search clients or serial numbers"/>
   {loading&&<p role="status">Searching...</p>}{error&&<Alert className="mt-2" variant="danger">{error}</Alert>}
   <Form.Label htmlFor="client-workflow-select" className="mt-2">Client</Form.Label>
   <Form.Select id="client-workflow-select" value={clientId} onChange={event=>{setClientId(event.target.value);onSelect?.(event.target.value);}}><option value="">Select client</option>{clientId&&!clients.some(client=>client._id===clientId)&&<option value={clientId}>{overview?.client?.name||"Selected client"}</option>}{clients.map(client=><option key={client._id} value={client._id}>{client.company?`${client.company} — `:""}{client.name} {client.phone?`(${client.phone})`:""}</option>)}</Form.Select>
   {!loading&&!clients.length&&!error&&<p className="mt-2">No matching clients. <Link to="/admin/clients">Add a client</Link>.</p>}
   {overview&&<div className="mt-4"><ClientServiceDetails overview={overview} systemType={systemType}/></div>}
  </>}
 </Card.Body></Card></section>;
}
