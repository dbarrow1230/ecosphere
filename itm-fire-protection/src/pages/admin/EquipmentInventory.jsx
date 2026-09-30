import {useCallback,useEffect,useState} from "react";
import {Alert,Badge,Button,Card,Col,Container,Form,Row,Table} from "react-bootstrap";
import {Link,useSearchParams} from "react-router-dom";
import {itmApi,dateInput,displayDate} from "../../utils/itmApi.js";

const defaults={name:"",kind:"equipment",category:"Portable Fire Extinguishers",sku:"",clientRef:"",serialNumber:"",manufacturer:"",modelNumber:"",agentType:"",capacity:"",rating:"",location:"",quantityOnHand:1,unit:"each",reorderLevel:0,costPerUnit:0,supplier:"",manufactureDate:"",installDate:"",lastInspectionDate:"",lastServiceDate:"",lastHydrostaticTest:"",nextInspectionDate:"",nextMaintenanceDate:"",nextHydrostaticTest:"",status:"in-stock",notes:""};
const textFields={name:"Equipment / item name",serialNumber:"Serial number",sku:"SKU / asset code",manufacturer:"Manufacturer",modelNumber:"Model number",agentType:"Agent type",capacity:"Capacity / size",rating:"Rating",location:"Location in property",unit:"Unit",supplier:"Supplier"};
const dateFields={manufactureDate:"Manufacture date",installDate:"Installation date",lastInspectionDate:"Last inspection",lastServiceDate:"Last service",lastHydrostaticTest:"Last hydrostatic test",nextInspectionDate:"Next inspection due",nextMaintenanceDate:"Next maintenance due",nextHydrostaticTest:"Next hydrostatic test due"};
const categories=["Portable Fire Extinguishers","Standpipe Systems","Kitchen Hood Systems","Gas Station Fire Protection","Smoke / CO Detectors","Fire Cabinets","Signs & Accessories","Parts & Supplies","Other"];
export default function EquipmentInventory(){
 const [params,setParams]=useSearchParams();const clientFilter=params.get("client")||"";
 const [items,setItems]=useState([]),[clients,setClients]=useState([]),[search,setSearch]=useState(""),[error,setError]=useState(""),[success,setSuccess]=useState(""),[loading,setLoading]=useState(false),[saving,setSaving]=useState(false),[form,setForm]=useState({...defaults,clientRef:clientFilter});
 const edit=item=>{const next={...defaults,...item,clientRef:item.clientRef?._id||item.clientRef||""};for(const key of Object.keys(dateFields))next[key]=dateInput(next[key]);setForm(next);setSuccess("");};
 const load=useCallback(async()=>{setLoading(true);setError("");try{const data=await itmApi(`/api/inventory?client=${encodeURIComponent(clientFilter)}&search=${encodeURIComponent(search)}`);setItems(data.items||[]);}catch(error){setError(error.message);}finally{setLoading(false);}},[clientFilter,search]);
 useEffect(()=>{const timer=setTimeout(load,250);return()=>clearTimeout(timer);},[load]);
 useEffect(()=>{itmApi("/api/clients").then(data=>setClients(data.clients||[])).catch(error=>setError(error.message));},[]);
 const requestedItem=params.get("item")||"";
 useEffect(()=>{if(!requestedItem)return;let ignore=false;itmApi(`/api/inventory/${requestedItem}`).then(data=>{if(!ignore)edit(data.item);}).catch(error=>{if(!ignore)setError(error.message);});return()=>{ignore=true;};},[requestedItem]);
 const change=event=>{const {name,value}=event.target;setForm(previous=>({...previous,[name]:value,...(name==="kind"&&value==="equipment"?{quantityOnHand:1}:{})}));};
 const save=async event=>{
  event.preventDefault();if(saving)return;setSaving(true);setError("");setSuccess("");
  try{const payload={...form};for(const key of ["quantityOnHand","reorderLevel","costPerUnit"])payload[key]=Number(payload[key]);const data=await itmApi(form._id?`/api/inventory/${form._id}`:"/api/inventory",{method:form._id?"PUT":"POST",body:JSON.stringify(payload)});edit(data.item);await load();setSuccess("Equipment saved. Serial number and client assignment are stored.");}
  catch(error){setError(error.message);}finally{setSaving(false);}
 };
 const newItem=()=>{setForm({...defaults,clientRef:clientFilter});setParams(clientFilter?{client:clientFilter}:{});setSuccess("");};
 return <Container className="py-4">
  <div className="d-flex flex-wrap justify-content-between gap-2 mb-3"><h1>Equipment & Inventory</h1><div className="d-flex gap-2"><Button as={Link} to="/admin/clients" variant="outline-primary">Clients</Button><Button as={Link} to="/service-tracking" variant="outline-primary">Service tracking</Button><Button onClick={newItem}>Add equipment</Button></div></div>
  <p>Track each extinguisher by serial number, assigned client, location, service dates, and condition. Use supply items for bulk parts.</p>
  {error&&<Alert variant="danger">{error}</Alert>}{success&&<Alert variant="success">{success}</Alert>}
  <Row className="g-3"><Col lg={7}><Card><Card.Body>
   <Form.Label htmlFor="inventory-search">Search serial number, item, model, or location</Form.Label><Form.Control id="inventory-search" type="search" value={search} onChange={event=>setSearch(event.target.value)}/>
   <Form.Label htmlFor="inventory-client-filter" className="mt-2">Client filter</Form.Label><Form.Select id="inventory-client-filter" value={clientFilter} onChange={event=>setParams(event.target.value?{client:event.target.value}:{})}><option value="">All clients and stock</option>{clients.map(client=><option key={client._id} value={client._id}>{client.company||client.name} — {client.name}</option>)}</Form.Select>
   {loading&&<p role="status">Loading equipment...</p>}
   <Table responsive hover className="mt-3"><thead><tr><th>Equipment</th><th>Serial / SKU</th><th>Client / location</th><th>Status</th><th>Inspection due</th></tr></thead><tbody>{items.map(item=><tr key={item._id}><td><Button variant="link" onClick={()=>edit(item)}>{item.name}</Button></td><td>{item.serialNumber||item.sku||"Bulk supply"}</td><td>{item.clientRef?.company||item.clientRef?.name||"Unassigned stock"}<br/>{item.location}</td><td><Badge bg={item.status==="in-service"?"success":"secondary"}>{item.status}</Badge></td><td>{displayDate(item.nextInspectionDate)}</td></tr>)}{!loading&&!items.length&&<tr><td colSpan={5}>No equipment found.</td></tr>}</tbody></Table>
  </Card.Body></Card></Col><Col lg={5}><Card><Card.Body>
   <h2 className="h4">{form._id?"Edit equipment":"Add equipment"}</h2>
   <Form onSubmit={save}><fieldset disabled={saving}>
    <Form.Label htmlFor="equipment-kind">Tracking type</Form.Label><Form.Select id="equipment-kind" name="kind" value={form.kind} onChange={change}><option value="equipment">Serialized equipment</option><option value="supply">Bulk parts / supplies</option></Form.Select>
    <Form.Label htmlFor="equipment-client" className="mt-2">Assigned client</Form.Label><Form.Select id="equipment-client" name="clientRef" value={form.clientRef} onChange={change}><option value="">Unassigned stock</option>{clients.map(client=><option key={client._id} value={client._id}>{client.company||client.name} — {client.name}</option>)}</Form.Select>
    <Form.Label htmlFor="equipment-category" className="mt-2">Category</Form.Label><Form.Select id="equipment-category" name="category" value={form.category} onChange={change}>{categories.map(category=><option key={category}>{category}</option>)}</Form.Select>
    <Row>{Object.entries(textFields).map(([name,label])=><Col md={6} key={name}><Form.Group className="mt-2" controlId={`equipment-${name}`}><Form.Label>{label}</Form.Label><Form.Control name={name} value={form[name]||""} required={name==="name"||(name==="serialNumber"&&form.kind==="equipment")} onChange={change}/></Form.Group></Col>)}</Row>
    <Row>{Object.entries({quantityOnHand:"Quantity",reorderLevel:"Reorder level",costPerUnit:"Unit cost"}).map(([name,label])=><Col md={4} key={name}><Form.Group className="mt-2" controlId={`equipment-${name}`}><Form.Label>{label}</Form.Label><Form.Control name={name} type="number" min="0" step={name==="costPerUnit"?"0.01":"1"} value={form[name]} readOnly={name==="quantityOnHand"&&form.kind==="equipment"} onChange={change}/></Form.Group></Col>)}</Row>
    <Form.Label htmlFor="equipment-status" className="mt-2">Equipment status</Form.Label><Form.Select id="equipment-status" name="status" value={form.status} onChange={change}>{["in-stock","in-service","needs-service","out-of-service","retired"].map(value=><option key={value}>{value}</option>)}</Form.Select>
    <Row>{Object.entries(dateFields).map(([name,label])=><Col md={6} key={name}><Form.Group className="mt-2" controlId={`equipment-${name}`}><Form.Label>{label}</Form.Label><Form.Control type="date" name={name} value={dateInput(form[name])} onChange={change}/></Form.Group></Col>)}</Row>
    <Form.Label htmlFor="equipment-notes" className="mt-2">Notes</Form.Label><Form.Control as="textarea" id="equipment-notes" name="notes" value={form.notes} onChange={change}/>
    <p className="small mt-2">Completed service records supply the latest service results and due dates. Enter intervals from your approved procedure.</p>
    <Button className="mt-2" type="submit">{saving?"Saving...":"Save equipment"}</Button>
    {form.clientRef&&<Button as={Link} variant="link" to={`/service-tracking?client=${form.clientRef}`}>Open client service history</Button>}
   </fieldset></Form>
  </Card.Body></Card></Col></Row>
 </Container>;
}
