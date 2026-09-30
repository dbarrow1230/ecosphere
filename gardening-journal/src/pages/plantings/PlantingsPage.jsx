import {useEffect,useMemo,useState} from "react";
import {Alert,Badge,Button,Card,Col,Form,InputGroup,Modal,Row,Spinner} from "react-bootstrap";
import {CalendarDays,Leaf,Pencil,Plus,Save,Search,Skull,Sprout} from "lucide-react";
import {Link} from "react-router-dom";
import SortedList from "../../components/SortedList.jsx";
import SortedSelect from "../../components/SortedSelect.jsx";
import {sortItems} from "../../utils/sortItems.js";
import "../../styles/plantingsPage.css";

const statusOptions=[
 {value:"active",label:"Active"},
 {value:"germinating",label:"Germinating"},
 {value:"seedling",label:"Seedling"},
 {value:"transplanted",label:"Transplanted"},
 {value:"harvested",label:"Harvested"},
 {value:"failed",label:"Failed"},
 {value:"dead",label:"Dead"},
 {value:"archived",label:"Archived"}
];

const sourceTypeOptions=[
 {value:"seed",label:"Seed"},
 {value:"plant",label:"Plant"}
];

const datePeriodOptions=[
 {value:"day",label:"Day"},
 {value:"month",label:"Month"},
 {value:"year",label:"Year"},
 {value:"all",label:"All Dates"}
];

const defaultInstanceForm={
 instanceName:"",
 sourceType:"seed",
 seed:"",
 plant:"",
 garden:"",
 plantedDate:"",
 expectedHarvestDate:"",
 endDate:"",
 deathDate:"",
 status:"active",
 quantity:1,
 location:"",
 failureReason:"",
 outcomeNotes:""
};

const getObjectId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;

 if(typeof value==="object"){
  if(typeof value.$oid==="string")return value.$oid;
  if(typeof value._id==="string")return value._id;
  if(typeof value.id==="string")return value.id;
  if(typeof value._id?.$oid==="string")return value._id.$oid;
  if(typeof value.id?.$oid==="string")return value.id.$oid;
 }

 return "";
};

const formatDateForInput=value=>{
 if(!value)return "";
 const date=new Date(value);
 if(Number.isNaN(date.getTime()))return "";
 return date.toISOString().slice(0,10);
};

const formatDate=value=>{
 const input=formatDateForInput(value);
 if(!input)return "Not listed";
 const [year,month,day]=input.split("-");
 return `${month}/${day}/${year}`;
};

const getSeedName=seed=>{
 if(!seed)return "";
 if(typeof seed==="string")return seed;
 return seed.plantName||seed.name||seed.title||"Unnamed Seed";
};

const getPlantName=plant=>{
 if(!plant)return "";
 if(typeof plant==="string")return plant;
 return plant.name||plant.plantName||plant.title||"Unnamed Plant";
};

const getGardenName=garden=>{
 if(!garden)return "";
 if(typeof garden==="string")return garden;
 return garden.name||garden.title||"Unnamed Garden";
};

const getInstanceSource=item=>{
 if(item?.seed)return getSeedName(item.seed);
 if(item?.plant)return getPlantName(item.plant);
 return "No source linked";
};

const getInstanceName=item=>{
 return item?.instanceName||getInstanceSource(item);
};

const statusLabel=value=>statusOptions.find(item=>item.value===value)?.label||value||"Active";

const statusVariant=value=>{
 if(value==="active"||value==="seedling"||value==="transplanted")return "success";
 if(value==="germinating")return "primary";
 if(value==="harvested")return "warning";
 if(value==="failed"||value==="dead")return "danger";
 if(value==="archived")return "dark";
 return "secondary";
};

export default function PlantingsPage({user}){
 const today=formatDateForInput(new Date());
 const [instances,setInstances]=useState([]);
 const [seeds,setSeeds]=useState([]);
 const [plants,setPlants]=useState([]);
 const [gardens,setGardens]=useState([]);
 const [search,setSearch]=useState("");
 const [statusFilter,setStatusFilter]=useState("all");
 const [datePeriod,setDatePeriod]=useState("month");
 const [selectedDay,setSelectedDay]=useState(today);
 const [selectedMonth,setSelectedMonth]=useState(today.slice(0,7));
 const [selectedYear,setSelectedYear]=useState(today.slice(0,4));
 const [showModal,setShowModal]=useState(false);
 const [editingInstance,setEditingInstance]=useState(null);
 const [formData,setFormData]=useState(defaultInstanceForm);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");

 useEffect(()=>{
  let ignore=false;

  const loadData=async()=>{
   try{
    setLoading(true);
    setError("");

    const [plantingsRes,seedsRes,plantsRes,gardensRes]=await Promise.all([
     fetch("/api/plantings"),
     fetch("/api/seeds"),
     fetch("/api/plants"),
     fetch("/api/gardens")
    ]);

    const plantingsData=await plantingsRes.json().catch(()=>[]);
    const seedsData=await seedsRes.json().catch(()=>[]);
    const plantsData=await plantsRes.json().catch(()=>[]);
    const gardensData=await gardensRes.json().catch(()=>[]);

    if(!plantingsRes.ok)throw new Error(plantingsData.message||"Failed to load growing instances");
    if(!seedsRes.ok)throw new Error(seedsData.message||"Failed to load seeds");
    if(!plantsRes.ok)throw new Error(plantsData.message||"Failed to load plants");
    if(!gardensRes.ok)throw new Error(gardensData.message||"Failed to load gardens");

    if(ignore)return;

    setInstances(Array.isArray(plantingsData)?plantingsData:[]);
    setSeeds(Array.isArray(seedsData)?seedsData:[]);
    setPlants(Array.isArray(plantsData)?plantsData:[]);
    setGardens(Array.isArray(gardensData)?gardensData:[]);
   }catch(err){
    if(!ignore)setError(err.message||"Failed to load growing instances");
   }finally{
    if(!ignore)setLoading(false);
   }
  };

  loadData();

  return()=>{
   ignore=true;
  };
 },[]);

 const yearOptions=useMemo(()=>{
  const years=new Set([today.slice(0,4)]);
  instances.forEach(item=>{
   const date=formatDateForInput(item.plantedDate);
   if(date)years.add(date.slice(0,4));
  });
  return [...years].sort((a,b)=>b.localeCompare(a)).map(year=>({value:year,label:year}));
 },[instances,today]);

 const dateFilteredInstances=useMemo(()=>{
  return instances.filter(item=>{
   if(datePeriod==="all")return true;
   const date=formatDateForInput(item.plantedDate);
   if(!date)return false;
   if(datePeriod==="day")return date===selectedDay;
   if(datePeriod==="month")return date.startsWith(selectedMonth);
   return date.startsWith(selectedYear);
  });
 },[instances,datePeriod,selectedDay,selectedMonth,selectedYear]);

 const filteredInstances=useMemo(()=>{
  const searchText=search.trim().toLowerCase();

  return sortItems(dateFilteredInstances,getInstanceName).filter(item=>{
   const haystack=[
    getInstanceName(item),
    getInstanceSource(item),
    item.location,
   item.status,
   item.deathDate,
   item.failureReason,
    item.outcomeNotes
   ].filter(Boolean).join(" ").toLowerCase();

   return (statusFilter==="all"||item.status===statusFilter)&&(!searchText||haystack.includes(searchText));
  });
 },[dateFilteredInstances,search,statusFilter]);

 const metrics=useMemo(()=>({
  total:dateFilteredInstances.length,
  active:dateFilteredInstances.filter(item=>item.status==="active"||item.status==="germinating"||item.status==="seedling"||item.status==="transplanted").length,
  failed:dateFilteredInstances.filter(item=>item.status==="failed"||item.status==="dead").length,
  harvested:dateFilteredInstances.filter(item=>item.status==="harvested").length
 }),[dateFilteredInstances]);

 const openAddModal=(sourceType="seed")=>{
  setEditingInstance(null);
  setFormData({
   ...defaultInstanceForm,
   sourceType,
   plantedDate:formatDateForInput(new Date())
  });
  setShowModal(true);
 };

 const openEditModal=item=>{
  setEditingInstance(item);
  setFormData({
   instanceName:item.instanceName||"",
   sourceType:item.sourceType||(item.seed?"seed":"plant"),
   seed:getObjectId(item.seed),
   plant:getObjectId(item.plant),
   garden:getObjectId(item.garden),
   plantedDate:formatDateForInput(item.plantedDate),
   expectedHarvestDate:formatDateForInput(item.expectedHarvestDate),
   endDate:formatDateForInput(item.endDate),
   deathDate:formatDateForInput(item.deathDate),
   status:item.status||"active",
   quantity:item.quantity ?? 1,
   location:item.location||"",
   failureReason:item.failureReason||"",
   outcomeNotes:item.outcomeNotes||""
  });
  setShowModal(true);
 };

 const handleFormChange=e=>{
  const {name,value,type}=e.target;

  setFormData(prev=>{
   const next={
    ...prev,
    [name]:type==="number" ? value : value
   };

   if(name==="sourceType"){
    next.seed=value==="seed" ? prev.seed : "";
    next.plant=value==="plant" ? prev.plant : "";
   }

   if(name==="status"&&value!=="dead"){
    next.deathDate="";
   }

   return next;
  });
 };

 const handleSubmit=async e=>{
  e.preventDefault();

  try{
   setSaving(true);
   setError("");
   setSuccess("");

   const payload={
    ...formData,
    seed:formData.sourceType==="seed" ? formData.seed||null : null,
    plant:formData.sourceType==="plant" ? formData.plant||null : null,
    garden:formData.garden||null,
    plantedDate:formData.plantedDate||null,
    expectedHarvestDate:formData.expectedHarvestDate||null,
    endDate:formData.endDate||null,
    deathDate:formData.status==="dead" ? formData.deathDate||null : null,
    quantity:formData.quantity==="" ? 1 : Number(formData.quantity),
    createdBy:getObjectId(user)
   };

   const editingId=getObjectId(editingInstance);
   const res=await fetch(editingId?`/api/plantings/${editingId}`:"/api/plantings",{
    method:editingId?"PUT":"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });

   const data=await res.json().catch(()=>({}));

   if(!res.ok)throw new Error(data.message||"Failed to save growing instance");

   setInstances(prev=>{
    const next=editingId ? prev.map(item=>getObjectId(item)===getObjectId(data)?data:item) : [...prev,data];
    return sortItems(next,getInstanceName);
   });
   setShowModal(false);
   setSuccess(`${getInstanceName(data)} was saved.`);
  }catch(err){
   setError(err.message||"Failed to save growing instance");
  }finally{
   setSaving(false);
  }
 };

 return(
  <section className="plantings-page">
   <header className="plantings-header">
    <div>
     <p className="plantings-kicker">Growing Instances</p>
     <h1>Plant & Seed Starts</h1>
     <p>Review growing runs across all gardens. New runs belong to a named garden and start from an existing seed or plant.</p>
    </div>

    <div className="plantings-header-actions">
     <Button type="button" onClick={()=>openAddModal("seed")} disabled={!gardens.length}>
      <Plus size={18}/>
      Start From Seed
     </Button>
     <Button type="button" variant="outline-primary" onClick={()=>openAddModal("plant")} disabled={!gardens.length}>
      <Plus size={18}/>
      Start From Plant
     </Button>
    </div>
   </header>

   {!loading&&!gardens.length&&(
    <Alert variant="info">Create a <Alert.Link as={Link} to="/gardens">named garden</Alert.Link> before starting a seed or plant run.</Alert>
   )}

   <section className="plantings-reference-dashboard">
    <div>
     <p className="plantings-kicker">Plant Care Dashboard</p>
     <h2>Track each real growing instance, not just the seed record.</h2>
     <p>
      This is where started plants and seeds become living records with dates, status, location, outcomes, and death details when needed.
     </p>
    </div>

    <div className="plantings-care-summary">
     <article>
      <span>Daily Watering</span>
      <strong>{metrics.active}</strong>
      <small>active starts to review</small>
     </article>
     <article>
      <span>Lifecycle Status</span>
      <strong>{metrics.failed}</strong>
      <small>failed or dead starts</small>
     </article>
     <article>
      <span>Harvested</span>
      <strong>{metrics.harvested}</strong>
      <small>instances completed</small>
     </article>
    </div>
   </section>

   {error&&(
    <Alert variant="danger" dismissible onClose={()=>setError("")}>{error}</Alert>
   )}

   {success&&(
    <Alert variant="success" dismissible onClose={()=>setSuccess("")}>{success}</Alert>
   )}

   <section className="plantings-metrics">
    <MetricCard icon={<Sprout size={18}/>} label="Instances" value={metrics.total}/>
    <MetricCard icon={<Leaf size={18}/>} label="Growing" value={metrics.active}/>
    <MetricCard icon={<Skull size={18}/>} label="Failed / Dead" value={metrics.failed}/>
    <MetricCard icon={<CalendarDays size={18}/>} label="Harvested" value={metrics.harvested}/>
   </section>

   <Card className="plantings-card">
    <Card.Body>
     <div className="plantings-filter-grid">
      <InputGroup>
       <InputGroup.Text><Search size={16}/></InputGroup.Text>
       <Form.Control value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search starts, seeds, plants, location..."/>
      </InputGroup>

      <SortedSelect
       value={statusFilter}
       onChange={e=>setStatusFilter(e.target.value)}
       options={[{value:"all",label:"All Statuses"},...statusOptions]}
       getValue={item=>item.value}
       getLabel={item=>item.label}
       includePlaceholder={false}
      />

      <SortedSelect
       value={datePeriod}
       onChange={e=>setDatePeriod(e.target.value)}
       options={datePeriodOptions}
       getValue={item=>item.value}
       getLabel={item=>item.label}
       includePlaceholder={false}
       aria-label="Date period"
      />

      {datePeriod==="day"&&(
       <Form.Control type="date" value={selectedDay} onChange={e=>setSelectedDay(e.target.value)} aria-label="Growing instance day" />
      )}
      {datePeriod==="month"&&(
       <Form.Control type="month" value={selectedMonth} onChange={e=>setSelectedMonth(e.target.value)} aria-label="Growing instance month" />
      )}
      {datePeriod==="year"&&(
       <SortedSelect
        value={selectedYear}
        onChange={e=>setSelectedYear(e.target.value)}
        options={yearOptions}
        getValue={item=>item.value}
        getLabel={item=>item.label}
        includePlaceholder={false}
        aria-label="Growing instance year"
       />
      )}
     </div>
    </Card.Body>
   </Card>

   {loading ? (
    <div className="plantings-loading">
     <Spinner animation="border" size="sm"/>
     Loading growing instances...
    </div>
   ) : (
    <SortedList
     items={filteredInstances}
     getKey={item=>getObjectId(item)}
     getLabel={getInstanceName}
     className="plantings-list"
     renderItem={item=>(
      <article className="planting-card">
       <div className="planting-card-head">
        <div>
         <p className="plantings-kicker">{item.sourceType==="plant"?"Plant":"Seed"} Instance</p>
         <h2>{getInstanceName(item)}</h2>
         <p>{getInstanceSource(item)}</p>
        </div>

        <Badge bg={statusVariant(item.status)}>{statusLabel(item.status)}</Badge>
       </div>

       <div className="planting-card-details">
        <span><strong>Started:</strong> {formatDate(item.plantedDate)}</span>
        <span><strong>Expected Harvest:</strong> {formatDate(item.expectedHarvestDate)}</span>
        <span><strong>Ended:</strong> {formatDate(item.endDate)}</span>
        {item.status==="dead"&&(
         <span><strong>Death Date:</strong> {formatDate(item.deathDate)}</span>
        )}
        <span><strong>Quantity:</strong> {item.quantity ?? 1}</span>
        <span><strong>Garden:</strong> {getGardenName(item.garden)||"Not assigned"}</span>
        <span><strong>Location:</strong> {item.location||"Not listed"}</span>
        {(item.status==="failed"||item.status==="dead")&&(
         <span><strong>Reason:</strong> {item.failureReason||"Not listed"}</span>
        )}
       </div>

       {item.outcomeNotes&&(
        <p className="planting-outcome">{item.outcomeNotes}</p>
       )}

       <Button type="button" size="sm" variant="outline-primary" onClick={()=>openEditModal(item)}>
        <Pencil size={15}/>
        Edit Instance
       </Button>
      </article>
     )}
    >
     <div className="plantings-empty">No growing instances match those filters.</div>
    </SortedList>
   )}

   <InstanceModal
    show={showModal}
    saving={saving}
    editing={!!editingInstance}
    formData={formData}
    seeds={seeds}
    plants={plants}
    gardens={gardens}
    onChange={handleFormChange}
    onSubmit={handleSubmit}
    onHide={()=>setShowModal(false)}
   />
  </section>
 );
}

function MetricCard({icon,label,value}){
 return(
  <Card className="plantings-metric-card">
   <Card.Body>
    <span className="plantings-metric-icon">{icon}</span>
    <div>
     <p>{label}</p>
     <strong>{value}</strong>
    </div>
   </Card.Body>
  </Card>
 );
}

function InstanceModal({show,saving,editing,formData,seeds,plants,gardens,onChange,onSubmit,onHide}){
 return(
  <Modal show={show} onHide={onHide} size="lg" centered>
   <Form onSubmit={onSubmit}>
    <Modal.Header closeButton>
     <Modal.Title>{editing?"Edit Growing Instance":"Create Growing Instance"}</Modal.Title>
    </Modal.Header>

    <Modal.Body>
     <Row className="g-3">
      <Col md={12}>
       <InputGroup>
        <InputGroup.Text>Garden</InputGroup.Text>
        <SortedSelect
         name="garden"
         value={formData.garden}
         onChange={onChange}
         options={gardens}
         getValue={item=>getObjectId(item)}
         getLabel={getGardenName}
         placeholder="Select the garden for this run"
         required
        />
       </InputGroup>
      </Col>

      <Col md={6}>
       <InputGroup>
        <InputGroup.Text>Source</InputGroup.Text>
        <SortedSelect
         name="sourceType"
         value={formData.sourceType}
         onChange={onChange}
         options={sourceTypeOptions}
         getValue={item=>item.value}
         getLabel={item=>item.label}
         includePlaceholder={false}
        />
       </InputGroup>
      </Col>

      <Col md={6}>
       {formData.sourceType==="seed" ? (
        <InputGroup>
         <InputGroup.Text>Seed</InputGroup.Text>
         <SortedSelect
          name="seed"
          value={formData.seed}
          onChange={onChange}
          options={seeds}
          getValue={item=>getObjectId(item)}
          getLabel={getSeedName}
          placeholder="Select seed"
          required
         />
        </InputGroup>
       ) : (
        <InputGroup>
         <InputGroup.Text>Plant</InputGroup.Text>
         <SortedSelect
          name="plant"
          value={formData.plant}
          onChange={onChange}
          options={plants}
          getValue={item=>getObjectId(item)}
          getLabel={getPlantName}
          placeholder="Select plant"
          required
         />
        </InputGroup>
       )}
      </Col>

      <Col md={8}>
       <InputGroup>
        <InputGroup.Text>Instance Name</InputGroup.Text>
        <Form.Control name="instanceName" value={formData.instanceName} onChange={onChange} placeholder="Kitchen thyme run, tray 2 basil, spring tomato #3"/>
       </InputGroup>
      </Col>

      <Col md={4}>
       <InputGroup>
        <InputGroup.Text>Quantity</InputGroup.Text>
        <Form.Control type="number" min="0" name="quantity" value={formData.quantity} onChange={onChange}/>
       </InputGroup>
      </Col>

      <Col md={4}>
       <InputGroup>
        <InputGroup.Text>Started</InputGroup.Text>
        <Form.Control type="date" name="plantedDate" value={formData.plantedDate} onChange={onChange}/>
       </InputGroup>
      </Col>

      <Col md={4}>
       <InputGroup>
        <InputGroup.Text>Harvest</InputGroup.Text>
        <Form.Control type="date" name="expectedHarvestDate" value={formData.expectedHarvestDate} onChange={onChange}/>
       </InputGroup>
      </Col>

      <Col md={4}>
       <InputGroup>
        <InputGroup.Text>End</InputGroup.Text>
        <Form.Control type="date" name="endDate" value={formData.endDate} onChange={onChange}/>
       </InputGroup>
      </Col>

      {formData.status==="dead"&&(
       <Col md={4}>
        <InputGroup>
         <InputGroup.Text>Death</InputGroup.Text>
         <Form.Control type="date" name="deathDate" value={formData.deathDate} onChange={onChange}/>
        </InputGroup>
       </Col>
      )}

      <Col md={6}>
       <InputGroup>
        <InputGroup.Text>Status</InputGroup.Text>
        <SortedSelect
         name="status"
         value={formData.status}
         onChange={onChange}
         options={statusOptions}
         getValue={item=>item.value}
         getLabel={item=>item.label}
         includePlaceholder={false}
        />
       </InputGroup>
      </Col>

      <Col md={6}>
       <InputGroup>
        <InputGroup.Text>Location</InputGroup.Text>
        <Form.Control name="location" value={formData.location} onChange={onChange} placeholder="Hydro run, pod 4, raised bed A"/>
       </InputGroup>
      </Col>

      {(formData.status==="failed"||formData.status==="dead")&&(
       <Col md={12}>
        <InputGroup>
         <InputGroup.Text>Reason</InputGroup.Text>
         <Form.Control name="failureReason" value={formData.failureReason} onChange={onChange} placeholder="Did not germinate, root rot, dried out, pest damage"/>
        </InputGroup>
       </Col>
      )}

      <Col md={12}>
       <InputGroup>
        <InputGroup.Text>Outcome Notes</InputGroup.Text>
        <Form.Control as="textarea" rows={3} name="outcomeNotes" value={formData.outcomeNotes} onChange={onChange}/>
       </InputGroup>
      </Col>
     </Row>
    </Modal.Body>

    <Modal.Footer>
     <Button type="button" variant="outline-secondary" onClick={onHide}>Cancel</Button>
     <Button type="submit" disabled={saving}>
      <Save size={16}/>
      {saving?"Saving...":"Save Instance"}
     </Button>
    </Modal.Footer>
   </Form>
  </Modal>
 );
}
