import {useEffect,useMemo,useState} from "react";
import {Alert,Badge,Button,Card,Col,Form,InputGroup,Modal,Row,Spinner} from "react-bootstrap";
import {AlertTriangle,Bug,Filter,Search,ShieldCheck,Sprout} from "lucide-react";
import PestForm from "../forms/pest/pestform.jsx";
import {sortItems} from "../../utils/sortItems.js";
import "../../styles/diseases.css";

const getId=value=>{
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

const getText=value=>{
 if(value===undefined||value===null)return "";
 if(typeof value==="string")return value;
 if(typeof value==="number")return String(value);
 if(typeof value==="object"){
  return value.name||value.pest_type||value.title||value.label||value.description||getId(value);
 }
 return "";
};

const getCategory=item=>String(item?.category||"Uncategorized").trim()||"Uncategorized";

const getName=value=>{
 if(!value)return "";
 if(typeof value==="string")return "";
 return value.plantName||value.name||value.commonName||value.botanicalName||value.title||"";
};

const getAffectedRecordText=item=>{
 const seeds=Array.isArray(item?.seeds)&&item.seeds.length?item.seeds:[item?.seed].filter(Boolean);
 const plants=Array.isArray(item?.plants)&&item.plants.length?item.plants:[item?.plant].filter(Boolean);
 const names=[...seeds,...plants].map(getName).filter(Boolean);

 if(names.length)return names.join(", ");
 return "No affected records assigned";
};

const getLinkedSourceText=item=>{
 const seedCount=Array.isArray(item?.seeds)&&item.seeds.length?item.seeds.length:item?.seed?1:0;
 const plantCount=Array.isArray(item?.plants)&&item.plants.length?item.plants.length:item?.plant?1:0;
 const parts=[];

 if(seedCount)parts.push(`${seedCount} seed${seedCount===1?"":"s"}`);
 if(plantCount)parts.push(`${plantCount} plant${plantCount===1?"":"s"}`);

 return parts.length?parts.join(" / "):"Reference record";
};

const getTypeText=item=>{
 const typeText=getText(item?.type);
 return typeText||"No type assigned";
};

const getTreatmentText=item=>{
 const text=String(item?.treatmentText||"").trim();
 const treatmentList=Array.isArray(item?.treatment)?item.treatment:[];
 const treatmentNames=treatmentList
  .map(treatment=>{
   const name=getText(treatment);
   const details=[
    treatment?.applicationMethod&&`Method: ${treatment.applicationMethod}`,
    treatment?.dosage&&`Dosage: ${treatment.dosage}`,
    treatment?.frequency&&`Frequency: ${treatment.frequency}`,
    treatment?.duration&&`Duration: ${treatment.duration}`
   ].filter(Boolean).join("; ");

   return [name,details].filter(Boolean).join(" - ");
  })
  .filter(Boolean);

 return [text,...treatmentNames].filter(Boolean).join(" | ");
};

function PestsPage(){
 const [items,setItems]=useState([]);
 const [selected,setSelected]=useState(null);
 const [showView,setShowView]=useState(false);
 const [showForm,setShowForm]=useState(false);
 const [editPest,setEditPest]=useState(null);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [search,setSearch]=useState("");
 const [activeFilter,setActiveFilter]=useState("all");
 const [selectedCategories,setSelectedCategories]=useState([]);

 const load=async()=>{
  setLoading(true);
  setError("");

  try{
   const res=await fetch("/api/pests");
   const data=await res.json().catch(()=>[]);

   if(!res.ok)throw new Error(data?.message||"Failed to load pests");

   setItems(Array.isArray(data)?data:data?.data||[]);
  }catch(err){
   setError(err.message||"Failed to load pests");
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{
  let active=true;

  const loadInitial=async()=>{
   try{
    const res=await fetch("/api/pests");
    const data=await res.json().catch(()=>[]);

    if(!res.ok)throw new Error(data?.message||"Failed to load pests");

    if(active)setItems(Array.isArray(data)?data:data?.data||[]);
   }catch(err){
    if(active)setError(err.message||"Failed to load pests");
   }finally{
    if(active)setLoading(false);
   }
  };

  loadInitial();

  return()=>{
   active=false;
  };
 },[]);

 const categories=useMemo(()=>{
  const categoryCounts=items.reduce((acc,item)=>{
   const category=getCategory(item);
   acc[category]=(acc[category]||0)+1;
   return acc;
  },{});

  return sortItems(
   Object.entries(categoryCounts).map(([category,count])=>({category,count})),
   item=>item.category
  );
 },[items]);

 const typeCounts=useMemo(()=>{
  return items.reduce((acc,item)=>{
   const key=getTypeText(item);
   acc[key]=(acc[key]||0)+1;
   return acc;
  },{});
 },[items]);

 const filteredItems=useMemo(()=>{
  const query=search.trim().toLowerCase();

  return sortItems(items,item=>item.name||item.category||getTypeText(item))
   .filter(item=>{
    const category=getCategory(item);
    const matchesCategory=selectedCategories.length===0||selectedCategories.includes(category);
    const matchesActive=activeFilter==="all"||String(!!item?.isActive)===activeFilter;
    const searchable=[
     item?.name,
     item?.description,
     item?.category,
     item?.prevention,
     getTypeText(item),
     getTreatmentText(item),
     getAffectedRecordText(item)
    ].filter(Boolean).join(" ").toLowerCase();

    return matchesCategory&&matchesActive&&(!query||searchable.includes(query));
   });
 },[items,search,activeFilter,selectedCategories]);

 const toggleCategory=category=>{
  setSelectedCategories(prev=>(
   prev.includes(category)
    ?prev.filter(item=>item!==category)
    :[...prev,category]
  ));
 };

 const clearFilters=()=>{
  setSearch("");
  setActiveFilter("all");
  setSelectedCategories([]);
 };

 const handleView=item=>{
  setSelected(item);
  setShowView(true);
 };

 const handleAdd=()=>{
  setEditPest(null);
  setShowForm(true);
 };

 const handleEdit=item=>{
  setEditPest(item);
  setShowView(false);
  setShowForm(true);
 };

 const handleSaved=async()=>{
  setShowForm(false);
  await load();
 };

 return(
  <section className="diseases-page">
   <header className="diseases-hero">
    <div>
     <p className="diseases-kicker">Plant Health</p>
     <h1>Pests</h1>
     <p>Filter pest records by category, pest type, treatment, prevention, and active status.</p>
    </div>

    <div className="diseases-hero-side">
     <div className="diseases-hero-stats">
      <div>
       <span>{items.length}</span>
       <small>Total Records</small>
      </div>
      <div>
       <span>{categories.length}</span>
       <small>Categories</small>
      </div>
     </div>

     <Button type="button" onClick={handleAdd}>Add Pest</Button>
    </div>
   </header>

   {error&&<Alert variant="danger" className="diseases-alert">{error}</Alert>}

   <div className="diseases-layout">
    <aside className="diseases-sidebar">
     <Card className="diseases-panel">
      <Card.Header>
       <Filter size={18}/>
       Categories
      </Card.Header>

      <Card.Body>
       {categories.length?categories.map(item=>(
        <Form.Check
         key={item.category}
         type="checkbox"
         id={`pest-category-${item.category}`}
         className="diseases-category-check"
         checked={selectedCategories.includes(item.category)}
         onChange={()=>toggleCategory(item.category)}
         label={
          <span>
           <span>{item.category}</span>
           <Badge bg="light" text="dark">{item.count}</Badge>
          </span>
         }
        />
       )):<div className="diseases-empty-small">No categories loaded.</div>}

       <Button type="button" variant="outline-secondary" size="sm" className="w-100 mt-3" onClick={clearFilters}>
        Clear Filters
       </Button>
      </Card.Body>
     </Card>

     <Card className="diseases-panel">
      <Card.Header>
       <Bug size={18}/>
       Pest Types
      </Card.Header>

      <Card.Body className="diseases-severity-list">
       {sortItems(Object.entries(typeCounts).map(([type,count])=>({type,count})),item=>item.type).map(item=>(
        <button key={item.type} type="button" className="diseases-severity-pill">
         <span>{item.type}</span>
         <strong>{item.count}</strong>
        </button>
       ))}
      </Card.Body>
     </Card>
    </aside>

    <main className="diseases-main">
     <Card className="diseases-toolbar">
      <Card.Body>
       <Row className="g-3 align-items-end">
        <Col lg={7}>
         <Form.Label>Search Pests</Form.Label>
         <InputGroup>
          <InputGroup.Text><Search size={17}/></InputGroup.Text>
          <Form.Control
           value={search}
           onChange={event=>setSearch(event.target.value)}
           placeholder="Search name, category, treatment, prevention, or pest type"
          />
         </InputGroup>
        </Col>

        <Col lg={3}>
         <Form.Label>Status</Form.Label>
         <Form.Select value={activeFilter} onChange={event=>setActiveFilter(event.target.value)}>
          <option value="all">All</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
         </Form.Select>
        </Col>

        <Col lg={2}>
         <Button type="button" variant="outline-secondary" className="w-100" onClick={clearFilters}>
          Reset
         </Button>
        </Col>
       </Row>
      </Card.Body>
     </Card>

     {loading?(
      <Card className="diseases-loading">
       <Card.Body>
        <Spinner animation="border" size="sm"/>
        Loading pests...
       </Card.Body>
      </Card>
     ):(
      <div className="diseases-results">
       <div className="diseases-results-head">
        <h2>{filteredItems.length} Pest{filteredItems.length===1?"":"s"}</h2>
        <p>{selectedCategories.length?`Filtered by ${selectedCategories.join(", ")}`:"Showing all categories"}</p>
       </div>

       {filteredItems.length?(
        <div className="diseases-grid">
         {filteredItems.map(item=>(
          <article key={item._id} className="disease-card" onClick={()=>handleView(item)}>
           <div className="disease-card-top">
            <span className="disease-card-icon"><Bug size={20}/></span>
            <Badge bg={item.isActive===false?"secondary":"success"}>
             {item.isActive===false?"Inactive":"Active"}
            </Badge>
           </div>

           <h3>{item.name||"Unnamed Pest"}</h3>
           <p className="disease-scientific">{getTypeText(item)}</p>

           <div className="disease-card-meta">
            <span><Bug size={15}/>{getCategory(item)}</span>
            <span><Sprout size={15}/>{getAffectedRecordText(item)}</span>
            <span><Sprout size={15}/>{getTreatmentText(item)?"Treatment listed":"No treatment"}</span>
           </div>

           {item.description&&<p className="disease-cause">{item.description}</p>}

           <div className="disease-card-footer">
            <span>{getLinkedSourceText(item)}</span>
            <span>{item.prevention?"Prevention ready":"Needs prevention"}</span>
           </div>
          </article>
         ))}
        </div>
       ):(
        <Card className="diseases-empty">
         <Card.Body>
          <AlertTriangle size={24}/>
          <h3>No pests match these filters.</h3>
          <p>Clear filters or adjust the search to see more records.</p>
         </Card.Body>
        </Card>
       )}
      </div>
     )}
    </main>
   </div>

   <Modal show={showView} onHide={()=>setShowView(false)} size="xl" centered>
    <Modal.Header closeButton>
     <Modal.Title className="d-flex align-items-center justify-content-between gap-3 w-100">
      <span>{selected?.name||"Pest"}</span>
      <Button type="button" size="sm" variant="outline-primary" onClick={()=>handleEdit(selected)}>
       Edit Pest
      </Button>
     </Modal.Title>
    </Modal.Header>

    <Modal.Body className="disease-detail-modal">
     <Row className="g-3">
      <Col lg={4}>
       <Card className="disease-detail-card">
        <Card.Body>
         <div className="disease-detail-icon"><Bug size={24}/></div>
         <h2>{selected?.name||"Pest"}</h2>
         <p className="disease-scientific">{getTypeText(selected)}</p>

         <div className="disease-detail-badges">
          <Badge bg="info">{selected?.category||"Uncategorized"}</Badge>
          <Badge bg={selected?.isActive===false?"secondary":"success"}>
           {selected?.isActive===false?"Inactive":"Active"}
          </Badge>
         </div>

         <div className="disease-detail-list">
          <div><strong>Category:</strong> {selected?.category||"Not listed"}</div>
          <div><strong>Pest Type:</strong> {getTypeText(selected)}</div>
          <div><strong>Affected Records:</strong> {getAffectedRecordText(selected)}</div>
          <div><strong>Assigned To:</strong> {getLinkedSourceText(selected)}</div>
          <div><strong>Treatment Refs:</strong> {Array.isArray(selected?.treatment)?selected.treatment.length:0}</div>
         </div>
        </Card.Body>
       </Card>
      </Col>

      <Col lg={8}>
       <Row className="g-3">
        <Col md={12}><PestDetailSection title="Description" value={selected?.description}/></Col>
        <Col md={12}><PestDetailSection title="Treatment" value={getTreatmentText(selected)}/></Col>
        <Col md={12}><PestDetailSection title="Prevention" value={selected?.prevention} icon={<ShieldCheck size={18}/>}/></Col>

        <Col md={12}>
         <Card className="disease-detail-section">
          <Card.Body>
           <h3>Treatment References</h3>
           {selected?.treatment?.length?selected.treatment.map((treatment,index)=>(
            <div key={`${getId(treatment)}-${index}`} className="disease-treatment">
             <strong>{treatment.name||"Treatment"}</strong>
             <p>{treatment.description||"No description listed."}</p>
             <div>
              {treatment.applicationMethod&&<span>Method: {treatment.applicationMethod}</span>}
              {treatment.dosage&&<span>Dosage: {treatment.dosage}</span>}
              {treatment.frequency&&<span>Frequency: {treatment.frequency}</span>}
              {treatment.duration&&<span>Duration: {treatment.duration}</span>}
             </div>
            </div>
           )):<p>No treatment references listed.</p>}
          </Card.Body>
         </Card>
        </Col>
       </Row>
      </Col>
     </Row>
    </Modal.Body>
   </Modal>

   <PestForm
    show={showForm}
    onHide={()=>setShowForm(false)}
    onSuccess={handleSaved}
    editId={editPest?._id||null}
    initialData={editPest}
    mode={editPest?"edit":"add"}
   />
  </section>
 );
}

function PestDetailSection({title,value,icon=null}){
 return(
  <Card className="disease-detail-section">
   <Card.Body>
    <h3>{icon}{title}</h3>
    <p>{value||"Not listed."}</p>
   </Card.Body>
  </Card>
 );
}

export default PestsPage;
