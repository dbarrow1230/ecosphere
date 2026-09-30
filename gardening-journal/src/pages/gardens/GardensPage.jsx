/* eslint-disable react-hooks/set-state-in-effect */
import {useEffect,useState} from "react";
import {Alert,Badge,Button,Card,Col,Form,Modal,Row,Spinner,Table} from "react-bootstrap";
import {Edit3,Eye,Plus,RefreshCw,Trash2} from "lucide-react";
import {useNavigate} from "react-router-dom";
import SortedSelect from "../../components/SortedSelect.jsx";
import "../../styles/domainCrudPage.css";

const getId=value=>typeof value==="string"?value:value?._id||value?.id||"";
const unitLabel=unit=>[unit?.name,unit?.symbol&&`(${unit.symbol})`].filter(Boolean).join(" ")||"Unit";
const emptyDimension=label=>({label,value:"",unit:""});
const defaultForm={name:"",gardenType:"",gardenPurpose:[],userReason:[],overallSize:{metric:[emptyDimension("Length"),emptyDimension("Width")],imperial:[emptyDimension("Length"),emptyDimension("Width")]},newNote:"",isActive:true};

const normalizeDimensions=(items,labels=["Length","Width"])=>labels.map((label,index)=>{
 const item=items?.[index]||{};
 return {label:item.label||label,value:item.value??"",unit:getId(item.unit)};
});

export default function GardensPage({user}){
 const navigate=useNavigate();
 const [gardens,setGardens]=useState([]);
 const [references,setReferences]=useState({types:[],purposes:[],reasons:[]});
 const [metricUnits,setMetricUnits]=useState([]);
 const [imperialUnits,setImperialUnits]=useState([]);
 const [form,setForm]=useState(defaultForm);
 const [editing,setEditing]=useState(null);
 const [showForm,setShowForm]=useState(false);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");

 const loadData=async()=>{
  try{
   setLoading(true);
   setError("");
   const [gardensRes,referencesRes]=await Promise.all([
    fetch("/api/gardens"),fetch("/api/garden-references")
   ]);
   const [gardenData,referenceData]=await Promise.all([
    gardensRes.json().catch(()=>[]),referencesRes.json().catch(()=>({}))
   ]);
   if(!gardensRes.ok)throw new Error(gardenData.message||"Failed to load gardens");
   if(!referencesRes.ok)throw new Error(referenceData.message||"Failed to load garden reference lists");
   setGardens(Array.isArray(gardenData)?gardenData:[]);
   setReferences({types:referenceData.types||[],purposes:referenceData.purposes||[],reasons:referenceData.reasons||[]});
   setMetricUnits(referenceData.metricUnits||[]);
   setImperialUnits(referenceData.imperialUnits||[]);
  }catch(err){setError(err.message||"Failed to load gardens");}
  finally{setLoading(false);}
 };

 useEffect(()=>{loadData();},[]);

 const openAdd=()=>{
  setEditing(null);
  setForm({...defaultForm,overallSize:{metric:normalizeDimensions([]),imperial:normalizeDimensions([])}});
  setShowForm(true);
 };

 const openEdit=garden=>{
  setEditing(garden);
  setForm({
   name:garden.name||"",
   gardenType:getId(garden.gardenType),
   gardenPurpose:(garden.gardenPurpose||[]).map(getId).filter(Boolean),
   userReason:(garden.userReason||[]).map(getId).filter(Boolean),
   overallSize:{metric:normalizeDimensions(garden.overallSize?.metric),imperial:normalizeDimensions(garden.overallSize?.imperial)},
   newNote:"",
   isActive:garden.isActive!==false
  });
  setShowForm(true);
 };

 const toggleArray=(name,id)=>setForm(previous=>({...previous,[name]:previous[name].includes(id)?previous[name].filter(value=>value!==id):[...previous[name],id]}));
 const updateDimension=(system,index,key,value)=>setForm(previous=>({...previous,overallSize:{...previous.overallSize,[system]:previous.overallSize[system].map((item,itemIndex)=>itemIndex===index?{...item,[key]:value}:item)}}));

 const saveGarden=async event=>{
  event.preventDefault();
  try{
   setSaving(true);setError("");setNotice("");
   const notes=[...(editing?.notes||[])];
   if(form.newNote.trim())notes.push({note:form.newNote.trim(),date:new Date(),createdBy:getId(user)||null});
   const dimensions=system=>form.overallSize[system].filter(item=>item.label||item.value||item.unit).map(item=>({label:item.label,value:Number(item.value)||0,unit:item.unit||null}));
   const payload={name:form.name,gardenType:form.gardenType||null,gardenPurpose:form.gardenPurpose,userReason:form.userReason,overallSize:{metric:dimensions("metric"),imperial:dimensions("imperial")},notes,createdBy:getId(user)||getId(editing?.createdBy)||null,isActive:form.isActive};
   const id=getId(editing);
   const response=await fetch(id?`/api/gardens/${id}`:"/api/gardens",{method:id?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
   const data=await response.json().catch(()=>({}));
   if(!response.ok)throw new Error(data.message||"Failed to save garden");
   setShowForm(false);setNotice(`${data.name} was saved.`);await loadData();
  }catch(err){setError(err.message||"Failed to save garden");}
  finally{setSaving(false);}
 };

 const deleteGarden=async garden=>{
  if(!window.confirm(`Delete ${garden.name}?`))return;
  try{const response=await fetch(`/api/gardens/${getId(garden)}`,{method:"DELETE"});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.message||"Failed to delete garden");await loadData();}
  catch(err){setError(err.message||"Failed to delete garden");}
 };

 return <section className="domain-crud-page">
  <header className="domain-crud-hero"><div><p className="domain-crud-kicker">Growing Spaces</p><h1>Gardens</h1><p>Create the parent garden record here. Sections are managed separately after opening a garden.</p></div><div className="domain-crud-actions"><Button variant="outline-primary" onClick={loadData}><RefreshCw size={16}/> Refresh</Button><Button onClick={openAdd}><Plus size={18}/> Add Garden</Button></div></header>
  {error&&<Alert variant="danger" dismissible onClose={()=>setError("")}>{error}</Alert>}{notice&&<Alert variant="success" dismissible onClose={()=>setNotice("")}>{notice}</Alert>}
  <Card className="domain-crud-card"><Card.Body>{loading?<div className="text-center py-5"><Spinner animation="border"/></div>:<Table responsive hover className="domain-crud-table align-middle"><thead><tr><th>Garden</th><th>Type</th><th>Purposes</th><th>Sections</th><th>Active</th><th className="text-end">Actions</th></tr></thead><tbody>{gardens.length?gardens.map(garden=><tr key={getId(garden)}><td>{garden.name||"Unnamed Garden"}</td><td>{garden.gardenType?.name||"Not set"}</td><td>{(garden.gardenPurpose||[]).map(item=>item.name).filter(Boolean).join(", ")||"-"}</td><td>{(garden.sections||[]).map(item=>item.name).filter(Boolean).join(", ")||"-"}</td><td><Badge bg={garden.isActive===false?"secondary":"success"}>{garden.isActive===false?"No":"Yes"}</Badge></td><td className="text-end domain-crud-row-actions"><Button size="sm" onClick={()=>navigate(`/gardens/${getId(garden)}`)}><Eye size={15}/> Open Garden</Button><Button size="sm" variant="outline-primary" onClick={()=>openEdit(garden)}><Edit3 size={15}/> Edit</Button><Button size="sm" variant="outline-danger" onClick={()=>deleteGarden(garden)}><Trash2 size={15}/> Delete</Button></td></tr>):<tr><td colSpan="6" className="domain-crud-empty">No gardens found.</td></tr>}</tbody></Table>}</Card.Body></Card>
  <Modal show={showForm} onHide={()=>setShowForm(false)} size="xl" centered backdrop="static"><Form onSubmit={saveGarden}><Modal.Header closeButton><Modal.Title>{editing?"Edit":"Add"} Garden</Modal.Title></Modal.Header><Modal.Body><Row className="g-4">
   <Col md={6}><Form.Group><Form.Label>Garden Name</Form.Label><Form.Control value={form.name} onChange={event=>setForm(previous=>({...previous,name:event.target.value}))} required/></Form.Group></Col>
   <Col md={6}><Form.Group><Form.Label>Garden Type</Form.Label><SortedSelect value={form.gardenType} onChange={event=>setForm(previous=>({...previous,gardenType:event.target.value}))} options={references.types} getValue={getId} getLabel={item=>item.name} placeholder="Select garden type" required/></Form.Group></Col>
   <ReferenceChecks title="Garden Purposes" options={references.purposes} selected={form.gardenPurpose} onToggle={id=>toggleArray("gardenPurpose",id)}/>
   <ReferenceChecks title="Reasons for This Garden" options={references.reasons} selected={form.userReason} onToggle={id=>toggleArray("userReason",id)}/>
   <Col xs={12}><h3 className="h6 mb-2">Overall Size — Metric</h3><DimensionRows items={form.overallSize.metric} units={metricUnits} system="metric" onChange={updateDimension}/></Col>
   <Col xs={12}><h3 className="h6 mb-2">Overall Size — Imperial</h3><DimensionRows items={form.overallSize.imperial} units={imperialUnits} system="imperial" onChange={updateDimension}/></Col>
   <Col xs={12}><Form.Group><Form.Label>Add Garden Note</Form.Label><Form.Control as="textarea" rows={3} value={form.newNote} onChange={event=>setForm(previous=>({...previous,newNote:event.target.value}))} placeholder="Add a note without replacing existing notes"/></Form.Group></Col>
   <Col xs={12}><Form.Check type="switch" checked={form.isActive} onChange={event=>setForm(previous=>({...previous,isActive:event.target.checked}))} label="Active garden"/></Col>
  </Row></Modal.Body><Modal.Footer><Button variant="outline-secondary" onClick={()=>setShowForm(false)}>Cancel</Button><Button type="submit" disabled={saving}>{saving?"Saving...":"Save Garden"}</Button></Modal.Footer></Form></Modal>
 </section>;
}

function ReferenceChecks({title,options,selected,onToggle}){return <Col md={6}><Form.Label>{title}</Form.Label><div className="border rounded p-3 d-flex flex-wrap gap-3">{options.map(option=><Form.Check key={getId(option)} id={`${title}-${getId(option)}`} label={option.name} checked={selected.includes(getId(option))} onChange={()=>onToggle(getId(option))}/>)}</div></Col>}
function DimensionRows({items,units,system,onChange}){return <div className="d-grid gap-2">{items.map((item,index)=><Row className="g-2" key={`${system}-${index}`}><Col md={4}><Form.Control value={item.label} onChange={event=>onChange(system,index,"label",event.target.value)} placeholder="Dimension label"/></Col><Col md={4}><Form.Control type="number" min="0" step="0.01" value={item.value} onChange={event=>onChange(system,index,"value",event.target.value)} placeholder="Value"/></Col><Col md={4}><SortedSelect value={item.unit} onChange={event=>onChange(system,index,"unit",event.target.value)} options={units} getValue={getId} getLabel={unitLabel} placeholder="Select unit"/></Col></Row>)}</div>}
