/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import {useEffect,useMemo,useState} from "react";
import {Alert,Badge,Button,Card,Col,Form,Modal,Row,Spinner} from "react-bootstrap";
import {ArrowLeft,Leaf,MapPin,Pencil,Plus,Settings,Sprout,Trash2} from "lucide-react";
import {Link,useParams} from "react-router-dom";
import SortedSelect from "../../components/SortedSelect.jsx";
import "./gardenWorkspace.css";

const getId=value=>typeof value==="string"?value:value?._id||value?.id||"";
const getSeedName=seed=>seed?.plantName||seed?.name||seed?.title||"Unnamed Seed";
const getPlantName=plant=>plant?.name||plant?.plantName||plant?.title||"Unnamed Plant";
const getSourceName=run=>run?.seed?getSeedName(run.seed):run?.plant?getPlantName(run.plant):"Source not listed";
const formatDate=value=>value?new Date(value).toLocaleDateString():"Not set";
const unitLabel=unit=>[unit?.name,unit?.symbol&&`(${unit.symbol})`].filter(Boolean).join(" ")||"Unit";
const emptyDimension=label=>({label,value:"",unit:""});
const normalizeDimensions=(items,labels=["Length","Width"])=>labels.map((label,index)=>{const item=items?.[index]||{};return {label:item.label||label,value:item.value??"",unit:getId(item.unit)};});
const formatSectionSize=(section,metricUnits,imperialUnits)=>{
 const metric=(section.size?.metric||[]).filter(item=>Number(item.value));
 const imperial=(section.size?.imperial||[]).filter(item=>Number(item.value));
 const items=metric.length?metric:imperial;
 const units=metric.length?metricUnits:imperialUnits;
 return items.length?items.map(item=>{
  const unit=typeof item.unit==="object"?item.unit:units.find(candidate=>getId(candidate)===getId(item.unit));
  return `${item.label}: ${item.value} ${unit?.symbol||unit?.name||""}`.trim();
 }).join(" • "):"Size not recorded";
};

const initialForm={sourceType:"seed",seed:"",plant:"",gardenSection:"",instanceName:"",plantedDate:new Date().toISOString().slice(0,10),quantity:1};
const initialSectionForm={name:"",type:"",size:{metric:[emptyDimension("Length"),emptyDimension("Width")],imperial:[emptyDimension("Length"),emptyDimension("Width")]},newNote:"",isActive:true};

export default function GardenWorkspacePage({user}){
 const {id}=useParams();
 const [garden,setGarden]=useState(null);
 const [runs,setRuns]=useState([]);
 const [hydroRuns,setHydroRuns]=useState([]);
 const [seeds,setSeeds]=useState([]);
 const [plants,setPlants]=useState([]);
 const [sections,setSections]=useState([]);
 const [references,setReferences]=useState({locationTypes:[]});
 const [metricUnits,setMetricUnits]=useState([]);
 const [imperialUnits,setImperialUnits]=useState([]);
 const [form,setForm]=useState(initialForm);
 const [showForm,setShowForm]=useState(false);
 const [showSectionForm,setShowSectionForm]=useState(false);
 const [editingSection,setEditingSection]=useState(null);
 const [sectionForm,setSectionForm]=useState(initialSectionForm);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");

 const loadWorkspace=async()=>{
  try{
   setLoading(true);
   setError("");
   const [gardenRes,runsRes,hydroRunsRes,seedsRes,plantsRes,sectionsRes,referencesRes]=await Promise.all([
    fetch(`/api/gardens/${id}`),
    fetch(`/api/plantings?garden=${id}`),
    fetch(`/api/hydro-systems?garden=${id}`),
    fetch("/api/seeds"),
    fetch("/api/plants"),
    fetch(`/api/garden-sections?garden=${id}&isActive=true`),
    fetch("/api/garden-references")
   ]);
   const [gardenData,runsData,hydroRunsData,seedsData,plantsData,sectionsData,referencesData]=await Promise.all([
    gardenRes.json().catch(()=>({})),runsRes.json().catch(()=>[]),hydroRunsRes.json().catch(()=>[]),seedsRes.json().catch(()=>[]),plantsRes.json().catch(()=>[]),sectionsRes.json().catch(()=>[]),referencesRes.json().catch(()=>({}))
   ]);
   if(!gardenRes.ok)throw new Error(gardenData.message||"Failed to load garden");
   if(!runsRes.ok)throw new Error(runsData.message||"Failed to load garden runs");
   if(!hydroRunsRes.ok)throw new Error(hydroRunsData.message||"Failed to load hydro runs");
   if(!sectionsRes.ok)throw new Error(sectionsData.message||"Failed to load garden sections");
   setGarden(gardenData);
   setRuns(Array.isArray(runsData)?runsData:[]);
   setHydroRuns(Array.isArray(hydroRunsData)?hydroRunsData:[]);
   setSeeds(Array.isArray(seedsData)?seedsData:[]);
   setPlants(Array.isArray(plantsData)?plantsData:[]);
   setSections(Array.isArray(sectionsData)?sectionsData:[]);
   setReferences({locationTypes:referencesData.locationTypes||[]});
   setMetricUnits(referencesData.metricUnits||[]);
   setImperialUnits(referencesData.imperialUnits||[]);
  }catch(err){
   setError(err.message||"Failed to load garden workspace");
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{loadWorkspace();},[id]);

 const activeRuns=useMemo(()=>runs.filter(run=>!["harvested","failed","dead","archived"].includes(run.status)).length+hydroRuns.filter(run=>run.isActive!==false).length,[runs,hydroRuns]);
 const totalRuns=runs.length+hydroRuns.length;
 const isHydro=String(garden?.gardenType?.name||"").toLowerCase().includes("hydro");

 const openRunForm=sourceType=>{
  setForm({...initialForm,sourceType});
  setShowForm(true);
 };

 const handleChange=event=>{
  const {name,value}=event.target;
  setForm(previous=>({...previous,[name]:value,...(name==="sourceType"?{seed:"",plant:""}:{})}));
 };

 const openSectionForm=section=>{
  setEditingSection(section||null);
  setSectionForm(section?{
   name:section.name||"",
   type:getId(section.type),
   size:{metric:normalizeDimensions(section.size?.metric),imperial:normalizeDimensions(section.size?.imperial)},
   newNote:"",
   isActive:section.isActive!==false
  }:{...initialSectionForm,size:{metric:normalizeDimensions([]),imperial:normalizeDimensions([])}});
  setShowSectionForm(true);
 };

 const updateSectionDimension=(system,index,key,value)=>setSectionForm(previous=>({...previous,size:{...previous.size,[system]:previous.size[system].map((item,itemIndex)=>itemIndex===index?{...item,[key]:value}:item)}}));

 const handleSectionChange=event=>{
  const {name,value,type,checked}=event.target;
  setSectionForm(previous=>({...previous,[name]:type==="checkbox"?checked:value}));
 };

 const saveSection=async event=>{
  event.preventDefault();
  try{
   setSaving(true);
   setError("");
   const sectionId=getId(editingSection);
   const payload={
    garden:id,
    name:sectionForm.name,
    type:sectionForm.type,
    size:{metric:sectionForm.size.metric.map(item=>({label:item.label,value:Number(item.value)||0,unit:item.unit||null})),imperial:sectionForm.size.imperial.map(item=>({label:item.label,value:Number(item.value)||0,unit:item.unit||null}))},
    notes:[...(editingSection?.notes||[]),...(sectionForm.newNote.trim()?[{note:sectionForm.newNote.trim(),date:new Date(),createdBy:getId(user)||null}]:[])],
    isActive:sectionForm.isActive,
    createdBy:getId(user)
   };
   const response=await fetch(sectionId?`/api/garden-sections/${sectionId}`:"/api/garden-sections",{method:sectionId?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
   const data=await response.json().catch(()=>({}));
   if(!response.ok)throw new Error(data.message||"Failed to save garden section");
   setSections(previous=>sectionId?previous.map(section=>getId(section)===sectionId?data:section):[...previous,data]);
   setShowSectionForm(false);
   setNotice(`${data.name} was saved.`);
  }catch(err){
   setError(err.message||"Failed to save garden section");
  }finally{
   setSaving(false);
  }
 };

 const deleteSection=async section=>{
  if(!window.confirm(`Delete ${section.name}?`))return;
  try{
   const response=await fetch(`/api/garden-sections/${getId(section)}`,{method:"DELETE"});
   const data=await response.json().catch(()=>({}));
   if(!response.ok)throw new Error(data.message||"Failed to delete section");
   setSections(previous=>previous.filter(item=>getId(item)!==getId(section)));
  }catch(err){
   setError(err.message||"Failed to delete section");
  }
 };

 const saveRun=async event=>{
  event.preventDefault();
  try{
   setSaving(true);
   setError("");
   setNotice("");
   const payload={
    ...form,
    garden:id,
    seed:form.sourceType==="seed"?form.seed:null,
    plant:form.sourceType==="plant"?form.plant:null,
    quantity:Number(form.quantity)||1,
    status:"active",
    createdBy:getId(user)
   };
   const response=await fetch("/api/plantings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
   const data=await response.json().catch(()=>({}));
   if(!response.ok)throw new Error(data.message||"Failed to start growing run");
   setRuns(previous=>[data,...previous]);
   setShowForm(false);
   setNotice(`${data.instanceName||getSourceName(data)} is now growing in ${garden.name}.`);
  }catch(err){
   setError(err.message||"Failed to start growing run");
  }finally{
   setSaving(false);
  }
 };

 if(loading)return <div className="garden-workspace-loading"><Spinner animation="border" size="sm"/> Loading garden...</div>;

 return(
  <section className="garden-workspace">
   <Link to="/gardens" className="garden-back-link"><ArrowLeft size={16}/> All Gardens</Link>

   <header className="garden-workspace-hero">
    <div>
     <p className="garden-workspace-kicker">{garden?.gardenType?.name||"Garden"}</p>
     <h1>{garden?.name||"Garden"}</h1>
     <p>Add a seed or plant here to create a real growing run tied to this garden.</p>
    </div>
    <div className="garden-workspace-actions">
     <Button onClick={()=>openRunForm("seed")}><Plus size={17}/> Add Seed</Button>
     <Button variant="outline-primary" onClick={()=>openRunForm("plant")}><Plus size={17}/> Add Plant</Button>
     {isHydro&&<Button as={Link} to={`/hydroponics?garden=${id}&returnTo=${encodeURIComponent(`/gardens/${id}`)}`} variant="outline-success"><Settings size={17}/> Manage Hydro Runs</Button>}
    </div>
   </header>

   {error&&<Alert variant="danger" dismissible onClose={()=>setError("")}>{error}</Alert>}
   {notice&&<Alert variant="success" dismissible onClose={()=>setNotice("")}>{notice}</Alert>}

   <div className="garden-workspace-summary">
    <Card><Card.Body><Sprout size={20}/><span>Active Runs</span><strong>{activeRuns}</strong></Card.Body></Card>
    <Card><Card.Body><Leaf size={20}/><span>Total Runs</span><strong>{totalRuns}</strong></Card.Body></Card>
    <Card><Card.Body><Settings size={20}/><span>Garden Type</span><strong>{garden?.gardenType?.name||"Not set"}</strong></Card.Body></Card>
    <Card><Card.Body><MapPin size={20}/><span>Sections</span><strong>{sections.length}</strong></Card.Body></Card>
   </div>

   <Card className="garden-sections-card">
    <Card.Header><span>Garden sections and growing areas</span><Button size="sm" onClick={()=>openSectionForm(null)}><Plus size={15}/> Add Section</Button></Card.Header>
    <Card.Body>
     {sections.length?<div className="garden-section-grid">{sections.map(section=><article key={getId(section)} className="garden-section-item">
      <div><small>{section.type?.name||"Location type not set"}</small><h2>{section.name}</h2><p>{formatSectionSize(section,metricUnits,imperialUnits)}</p></div>
      <div className="garden-section-actions"><Button size="sm" variant="outline-primary" onClick={()=>openSectionForm(section)}><Pencil size={14}/> Edit</Button><Button size="sm" variant="outline-danger" onClick={()=>deleteSection(section)}><Trash2 size={14}/> Delete</Button></div>
     </article>)}</div>:<p className="garden-section-empty">No sections yet. Add a bed, container, row, tray, shelf, hydro device, or other growing area.</p>}
    </Card.Body>
   </Card>

   <Card className="garden-runs-card">
    <Card.Header>Growing in this garden</Card.Header>
    <Card.Body>
     {totalRuns?(
      <div className="garden-run-grid">
       {hydroRuns.map(run=><article key={getId(run)} className="garden-run-item">
        <div><small>Hydro run</small><h2>{run.name||"Hydro Run"}</h2><p>{run.devices?.length||0} device{run.devices?.length===1?"":"s"}</p></div>
        <Badge bg={run.isActive===false?"secondary":"info"}>{run.isActive===false?"inactive":"active"}</Badge>
        <span><strong>Started:</strong> {formatDate(run.startedDate)}</span>
        <Button as={Link} to={`/hydroponics?garden=${id}&run=${getId(run)}&returnTo=${encodeURIComponent(`/gardens/${id}`)}`} size="sm" variant="outline-success">Manage Run</Button>
       </article>)}
       {runs.map(run=><article key={getId(run)} className="garden-run-item">
        <div><small>{run.sourceType==="plant"?"Plant run":"Seed run"}</small><h2>{run.instanceName||getSourceName(run)}</h2><p>{getSourceName(run)}</p></div>
        <Badge bg="success">{run.status||"active"}</Badge>
        <span><strong>Started:</strong> {formatDate(run.plantedDate)}</span>
        {run.gardenSection&&<span><strong>Section:</strong> {run.gardenSection.name||"Assigned section"}</span>}
        <span><strong>Quantity:</strong> {run.quantity||1}</span>
       </article>)}
      </div>
     ):<div className="garden-workspace-empty"><Sprout size={30}/><h2>Nothing growing here yet</h2><p>Add a seed or plant to begin the first run in this garden.</p></div>}
    </Card.Body>
   </Card>

   <Modal show={showForm} onHide={()=>setShowForm(false)} centered>
    <Form onSubmit={saveRun}>
     <Modal.Header closeButton><Modal.Title>Start a Growing Run</Modal.Title></Modal.Header>
     <Modal.Body><Row className="g-3">
      <Col xs={12}><Form.Group><Form.Label>Start from</Form.Label><Form.Select name="sourceType" value={form.sourceType} onChange={handleChange}><option value="seed">Seed</option><option value="plant">Plant</option></Form.Select></Form.Group></Col>
      <Col xs={12}><Form.Group><Form.Label>{form.sourceType==="seed"?"Seed":"Plant"}</Form.Label>
       <SortedSelect name={form.sourceType} value={form[form.sourceType]} onChange={handleChange} options={form.sourceType==="seed"?seeds:plants} getValue={getId} getLabel={form.sourceType==="seed"?getSeedName:getPlantName} placeholder={`Select ${form.sourceType}`} required/>
      </Form.Group></Col>
      {sections.length>0&&<Col xs={12}><Form.Group><Form.Label>Garden section</Form.Label><SortedSelect name="gardenSection" value={form.gardenSection} onChange={handleChange} options={sections} getValue={getId} getLabel={section=>`${section.name} — ${section.type?.name||"Section"}`} placeholder="Select a section" required/></Form.Group></Col>}
      <Col xs={12}><Form.Group><Form.Label>Run name</Form.Label><Form.Control name="instanceName" value={form.instanceName} onChange={handleChange} placeholder="Spring tomatoes, basil tray 1..."/></Form.Group></Col>
      <Col md={7}><Form.Group><Form.Label>Started date</Form.Label><Form.Control type="date" name="plantedDate" value={form.plantedDate} onChange={handleChange}/></Form.Group></Col>
      <Col md={5}><Form.Group><Form.Label>Quantity</Form.Label><Form.Control type="number" min="1" name="quantity" value={form.quantity} onChange={handleChange}/></Form.Group></Col>
     </Row></Modal.Body>
     <Modal.Footer><Button variant="outline-secondary" onClick={()=>setShowForm(false)}>Cancel</Button><Button type="submit" disabled={saving}>{saving?"Starting...":"Start Run"}</Button></Modal.Footer>
    </Form>
   </Modal>

   <Modal show={showSectionForm} onHide={()=>setShowSectionForm(false)} centered size="lg">
    <Form onSubmit={saveSection}>
     <Modal.Header closeButton><Modal.Title>{editingSection?"Edit":"Add"} Garden Section</Modal.Title></Modal.Header>
     <Modal.Body><Row className="g-3">
      <Col md={6}><Form.Group><Form.Label>Section name</Form.Label><Form.Control name="name" value={sectionForm.name} onChange={handleSectionChange} required placeholder="Raised bed A, herb shelf, tower 1..."/></Form.Group></Col>
      <Col md={6}><Form.Group><Form.Label>Location type</Form.Label><SortedSelect name="type" value={sectionForm.type} onChange={handleSectionChange} options={references.locationTypes} getValue={getId} getLabel={item=>item.name} placeholder="Select location type" required/></Form.Group></Col>
      <Col xs={12}><h3 className="h6">Metric Size</h3><SectionDimensionRows items={sectionForm.size.metric} units={metricUnits} system="metric" onChange={updateSectionDimension}/></Col>
      <Col xs={12}><h3 className="h6">Imperial Size</h3><SectionDimensionRows items={sectionForm.size.imperial} units={imperialUnits} system="imperial" onChange={updateSectionDimension}/></Col>
      <Col xs={12}><Form.Group><Form.Label>Add Section Note</Form.Label><Form.Control as="textarea" rows={2} name="newNote" value={sectionForm.newNote} onChange={handleSectionChange}/></Form.Group></Col>
      <Col xs={12}><Form.Check type="switch" name="isActive" checked={sectionForm.isActive} onChange={handleSectionChange} label="Active section"/></Col>
     </Row></Modal.Body>
     <Modal.Footer><Button variant="outline-secondary" onClick={()=>setShowSectionForm(false)}>Cancel</Button><Button type="submit" disabled={saving}>{saving?"Saving...":"Save Section"}</Button></Modal.Footer>
    </Form>
   </Modal>
  </section>
 );
}

function SectionDimensionRows({items,units,system,onChange}){return <div className="d-grid gap-2">{items.map((item,index)=><Row className="g-2" key={`${system}-${index}`}><Col md={4}><Form.Control value={item.label} onChange={event=>onChange(system,index,"label",event.target.value)} placeholder="Dimension label"/></Col><Col md={4}><Form.Control type="number" min="0" step="0.01" value={item.value} onChange={event=>onChange(system,index,"value",event.target.value)} placeholder="Value"/></Col><Col md={4}><SortedSelect value={item.unit} onChange={event=>onChange(system,index,"unit",event.target.value)} options={units} getValue={getId} getLabel={unitLabel} placeholder="Select unit"/></Col></Row>)}</div>}
