import {useCallback,useEffect,useState} from "react";
import {Alert,Badge,Button,Card,Col,Container,Form,Row,Table} from "react-bootstrap";
import {Link,useSearchParams} from "react-router-dom";
import ClientServiceLookup,{ClientServiceDetails} from "../components/ClientServiceLookup.jsx";
import {itmApi,dateInput,displayDate} from "../utils/itmApi.js";
import "../styles/ServiceTracking.css";

const newRecord=(clientRef,systemType)=>({clientRef,systemType:systemType||"Portable Fire Extinguishers",serviceType:"inspection",status:"draft",scheduledDate:"",serviceDate:"",technician:"",procedureReference:"",siteAddress:"",reason:"",notes:"",customerAcknowledgement:"",equipment:[]});
const resultOptions=["pending","pass","fail","not-applicable"];
const outcomeOptions=["pending","pass","fail","needs-service","replaced","retired"];
const itemText={workPerformed:"Work performed",deficiencies:"Deficiencies / replacement reason",correctiveAction:"Corrective action / follow-up",partsUsed:"Parts used",tagNumber:"Service tag number"};
const dueDates={nextInspectionDate:"Next inspection due",nextMaintenanceDate:"Next maintenance due",nextHydrostaticTest:"Next hydrostatic test due"};
export default function ServiceTracking(){
 const [params,setParams]=useSearchParams(),clientId=params.get("client")||"",recordId=params.get("record")||"",systemType=params.get("system")||"";
 const [records,setRecords]=useState([]),[overview,setOverview]=useState(null),[record,setRecord]=useState(newRecord(clientId,systemType)),[error,setError]=useState(""),[success,setSuccess]=useState(""),[saving,setSaving]=useState(false),[loading,setLoading]=useState(false),[filter,setFilter]=useState("all");
 const loadRecords=useCallback(async()=>{const data=await itmApi("/api/service-records");setRecords(data.records||[]);},[]);
 const loadOverview=useCallback(async()=>{if(!clientId){setOverview(null);return;}const data=await itmApi(`/api/clients/${clientId}/overview`);setOverview(data);},[clientId]);
 useEffect(()=>{loadRecords().catch(error=>setError(error.message));},[loadRecords]);
 useEffect(()=>{setOverview(null);loadOverview().catch(error=>setError(error.message));},[loadOverview]);
 useEffect(()=>{
  setError("");setSuccess("");if(!recordId){setRecord(newRecord(clientId,systemType));return;}
  let ignore=false;setLoading(true);itmApi(`/api/service-records/${recordId}`).then(data=>{if(!ignore)setRecord({...data.record,clientRef:data.record.clientRef?._id||data.record.clientRef});}).catch(error=>{if(!ignore)setError(error.message);}).finally(()=>{if(!ignore)setLoading(false);});return()=>{ignore=true;};
 },[recordId,clientId,systemType]);
 const closed=["completed","cancelled"].includes(record.status);
 const change=event=>setRecord(previous=>({...previous,[event.target.name]:event.target.value}));
 const updateItem=(index,field,value)=>setRecord(previous=>({...previous,equipment:previous.equipment.map((item,i)=>i===index?{...item,[field]:value}:item)}));
 const toggleEquipment=(equipment,checked)=>setRecord(previous=>({...previous,equipment:checked?[...previous.equipment,{equipmentRef:equipment._id,snapshot:equipment,outcome:"pending",checks:[{label:"Equipment identification",result:"pending",notes:""},{label:"Equipment condition",result:"pending",notes:""},{label:"Required procedure checks",result:"pending",notes:""}],...Object.fromEntries([...Object.keys(itemText),...Object.keys(dueDates)].map(key=>[key,""]))}]:previous.equipment.filter(item=>item.equipmentRef!==equipment._id)}));
 const save=async(status=record.status)=>{
  if(saving||closed)return;setSaving(true);setError("");setSuccess("");
  try{
   const payload={...record,status,clientRef:clientId,siteAddress:record.siteAddress||[overview?.client?.address1,overview?.client?.address2,overview?.client?.city,overview?.client?.state?.name,overview?.client?.postalCode].filter(Boolean).join(", ")};
   const data=await itmApi(record._id?`/api/service-records/${record._id}`:"/api/service-records",{method:record._id?"PUT":"POST",body:JSON.stringify(payload)});
   setRecord({...data.record,clientRef:data.record.clientRef?._id||data.record.clientRef});
   if(!recordId)setParams({client:clientId,record:data.record._id});
   await Promise.all([loadRecords(),loadOverview()]);setSuccess(status==="completed"?"Service completed. Equipment status, history, and due dates now reflect this record.":"Service record saved.");
  }catch(error){setError(error.message);}finally{setSaving(false);}
 };
 const visibleRecords=records.filter(row=>filter==="all"||row.status===filter);
 return <Container className="py-4 service-tracking-page">
  <div className="d-flex flex-wrap justify-content-between gap-2"><h1>Service & Inspection Tracking</h1><div className="d-flex gap-2"><Button as={Link} variant="outline-primary" to="/admin/clients">Clients</Button><Button as={Link} variant="outline-primary" to="/admin/inventory">Equipment</Button><Button onClick={()=>setParams(clientId?{client:clientId}:{})}>New service</Button></div></div>
  <p>Find client → select equipment → schedule or start → record inspection and service findings → complete → review history and next due dates.</p>
  <ClientServiceLookup selectedId={clientId} showDetails={false} onSelect={id=>setParams(id?{client:id,system:systemType}:{})}/>
  {error&&<Alert variant="danger">{error}</Alert>}{success&&<Alert variant="success">{success}</Alert>}{loading&&<p role="status">Loading service record...</p>}
  {overview&&!loading&&<>
   <Card className="mb-4"><Card.Body><ClientServiceDetails overview={overview} showActions={false}/><Button as={Link} variant="outline-primary" to={`/admin/inventory?client=${clientId}`}>Add / edit client equipment</Button></Card.Body></Card>
   <Card className="mb-4"><Card.Body>
    <div className="d-flex justify-content-between"><h2 className="h4">{record._id?"Service record":"New service record"}</h2><Badge bg={closed?"secondary":"primary"}>{record.status}</Badge></div>
    {record._id&&<p className="small">Reference: {record._id}</p>}
    {closed&&<Alert variant="info">This record is closed and preserved. Start a new service record for follow-up work.</Alert>}
    <Form onSubmit={event=>{event.preventDefault();save();}}><fieldset disabled={saving||closed}>
     <Row className="g-3"><Col md={4}><Form.Label htmlFor="service-type">Service type</Form.Label><Form.Select id="service-type" name="serviceType" value={record.serviceType} onChange={change}>{["inspection","maintenance","recharge","hydrostatic-test","repair","installation","replacement"].map(value=><option key={value}>{value}</option>)}</Form.Select></Col>
      <Col md={8}><Form.Label htmlFor="service-system">System / equipment category</Form.Label><Form.Control id="service-system" name="systemType" value={record.systemType} onChange={change}/></Col>
      {Object.entries({scheduledDate:"Scheduled date",serviceDate:"Actual service date"}).map(([name,label])=><Col md={6} key={name}><Form.Label htmlFor={`service-${name}`}>{label}</Form.Label><Form.Control id={`service-${name}`} name={name} type="date" value={dateInput(record[name])} onChange={change}/></Col>)}
      {Object.entries({technician:"Technician",procedureReference:"Procedure / checklist reference",siteAddress:"Service address (blank uses client address)",reason:"Reason for visit",notes:"Service notes",customerAcknowledgement:"Customer acknowledgement / recipient"}).map(([name,label])=><Col md={6} key={name}><Form.Label htmlFor={`service-${name}`}>{label}</Form.Label><Form.Control id={`service-${name}`} name={name} value={record[name]||""} onChange={change}/></Col>)}
     </Row>
     <h3 className="h5 mt-4">Select equipment for this visit</h3><p className="small">Checks below are editable record fields. Use your approved procedure for the equipment and service being performed.</p>
     {overview.equipment.filter(item=>item.kind==="equipment").map(item=><Form.Check id={`service-equipment-${item._id}`} key={item._id} type="checkbox" label={`${item.name} · Serial ${item.serialNumber} · ${item.location||"Location not set"} · ${item.status}`} checked={record.equipment.some(row=>row.equipmentRef===item._id)} onChange={event=>toggleEquipment(item,event.target.checked)}/>)}
     {!overview.equipment.some(item=>item.kind==="equipment")&&<p>Add serialized equipment to this client before completing an inspection.</p>}
     {record.equipment.map((item,index)=><Card key={item.equipmentRef} className="mt-3"><Card.Body>
      <h4 className="h5">{item.snapshot?.name} — Serial {item.snapshot?.serialNumber}</h4>
      <p>{[item.snapshot?.manufacturer,item.snapshot?.modelNumber,item.snapshot?.location].filter(Boolean).join(" · ")}</p>
      <Table responsive><thead><tr><th>Check / procedure step</th><th>Result</th><th>Notes</th><th></th></tr></thead><tbody>{item.checks.map((check,checkIndex)=><tr key={checkIndex}>
       <td><Form.Control aria-label={`Check ${index+1}.${checkIndex+1}`} value={check.label} onChange={event=>updateItem(index,"checks",item.checks.map((row,i)=>i===checkIndex?{...row,label:event.target.value}:row))}/></td>
       <td><Form.Select aria-label={`Result ${index+1}.${checkIndex+1}`} value={check.result} onChange={event=>updateItem(index,"checks",item.checks.map((row,i)=>i===checkIndex?{...row,result:event.target.value}:row))}>{resultOptions.map(value=><option key={value}>{value}</option>)}</Form.Select></td>
       <td><Form.Control aria-label={`Check notes ${index+1}.${checkIndex+1}`} value={check.notes||""} onChange={event=>updateItem(index,"checks",item.checks.map((row,i)=>i===checkIndex?{...row,notes:event.target.value}:row))}/></td>
       <td><Button variant="outline-secondary" type="button" onClick={()=>updateItem(index,"checks",item.checks.filter((_,i)=>i!==checkIndex))}>Remove</Button></td>
      </tr>)}</tbody></Table>
      <Button variant="outline-secondary" type="button" onClick={()=>updateItem(index,"checks",[...item.checks,{label:"",result:"pending",notes:""}])}>Add check</Button>
      <Row className="g-3 mt-1">{Object.entries(itemText).map(([name,label])=><Col md={6} key={name}><Form.Label htmlFor={`result-${index}-${name}`}>{label}</Form.Label><Form.Control as={name==="tagNumber"?"input":"textarea"} id={`result-${index}-${name}`} value={item[name]||""} onChange={event=>updateItem(index,name,event.target.value)}/></Col>)}
       <Col md={6}><Form.Label htmlFor={`outcome-${index}`}>Equipment outcome</Form.Label><Form.Select id={`outcome-${index}`} value={item.outcome} onChange={event=>updateItem(index,"outcome",event.target.value)}>{outcomeOptions.map(value=><option key={value}>{value}</option>)}</Form.Select></Col>
       {Object.entries(dueDates).map(([name,label])=><Col md={4} key={name}><Form.Label htmlFor={`result-${index}-${name}`}>{label}</Form.Label><Form.Control id={`result-${index}-${name}`} type="date" value={dateInput(item[name])} onChange={event=>updateItem(index,name,event.target.value)}/></Col>)}
      </Row>
     </Card.Body></Card>)}
     <div className="d-flex flex-wrap gap-2 mt-4"><Button type="submit">{saving?"Saving...":"Save progress"}</Button>{["draft","scheduled"].includes(record.status)&&<><Button type="button" variant="outline-primary" onClick={()=>save("scheduled")}>Schedule</Button><Button type="button" onClick={()=>save("in-progress")}>Start service</Button></>}{record.status==="in-progress"&&<Button type="button" variant="success" onClick={()=>save("completed")}>Complete service</Button>}<Button type="button" variant="outline-danger" onClick={()=>save("cancelled")}>Cancel service record</Button></div>
    </fieldset></Form>
   </Card.Body></Card>
   {record._id&&<><Button className="mb-3" onClick={()=>window.print()}>Print service record</Button><ServiceReport record={record} client={overview.client}/></>}
  </>}
  <Card className="mt-4"><Card.Body><h2 className="h4">Service records</h2><Form.Label htmlFor="service-status-filter">Filter by status</Form.Label><Form.Select id="service-status-filter" value={filter} onChange={event=>setFilter(event.target.value)}>{["all","draft","scheduled","in-progress","completed","cancelled"].map(value=><option key={value}>{value}</option>)}</Form.Select>
   <Table responsive className="mt-3"><thead><tr><th>Client</th><th>Service</th><th>Date</th><th>Status</th><th>Technician</th></tr></thead><tbody>{visibleRecords.map(row=><tr key={row._id}><td>{row.clientRef?.company||row.clientRef?.name||"Client"}</td><td><Link to={`/service-tracking?record=${row._id}&client=${row.clientRef?._id||row.clientRef}`}>{row.serviceType}</Link></td><td>{displayDate(row.serviceDate||row.scheduledDate)}</td><td>{row.status}</td><td>{row.technician||"Unassigned"}</td></tr>)}{!visibleRecords.length&&<tr><td colSpan={5}>No service records found.</td></tr>}</tbody></Table>
  </Card.Body></Card>
 </Container>;
}
function ServiceReport({record,client}){
 return <Card id="service-report"><Card.Body><h2>ITM Service Record</h2><p>{record._id} · {record.status}</p><h3 className="h5">{client.company||client.name}</h3><p>{client.name} · {client.phone} · {client.email}</p><p>{record.siteAddress}</p><p>{record.systemType} · {record.serviceType} · {displayDate(record.serviceDate||record.scheduledDate)}</p><p>Technician: {record.technician||"Unassigned"} · Procedure: {record.procedureReference||"Not entered"}</p><p>{record.reason}</p>
  {record.equipment.map(item=><section key={item.equipmentRef} className="mb-3"><h4 className="h6">{item.snapshot?.name} · Serial: {item.snapshot?.serialNumber} · {item.outcome}</h4><p>{Object.entries(item.snapshot||{}).filter(([key])=>!["name","serialNumber"].includes(key)).map(([key,value])=>`${key}: ${value||"—"}`).join(" · ")}</p><Table size="sm"><thead><tr><th>Check</th><th>Result</th><th>Notes</th></tr></thead><tbody>{item.checks.map((check,index)=><tr key={index}><td>{check.label}</td><td>{check.result}</td><td>{check.notes}</td></tr>)}</tbody></Table>{Object.entries(itemText).map(([key,label])=><p key={key}><strong>{label}:</strong> {item[key]||"—"}</p>)}{Object.entries(dueDates).map(([key,label])=><p key={key}>{label}: {displayDate(item[key])}</p>)}</section>)}<p>Notes: {record.notes||"—"}</p><p>Customer acknowledgement: {record.customerAcknowledgement||"Not recorded"}</p>
 </Card.Body></Card>;
}
