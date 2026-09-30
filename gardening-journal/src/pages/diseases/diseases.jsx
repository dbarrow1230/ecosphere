import {useEffect,useMemo,useState} from "react";
import {Alert,Badge,Button,Card,Col,Form,Image,InputGroup,Modal,Row,Spinner} from "react-bootstrap";
import {Activity,AlertTriangle,Bug,Filter,Leaf,Microscope,Search,ShieldCheck,Sprout} from "lucide-react";
import DiseaseForm from "../forms/diseases/diseaseForm.jsx";
import {sortItems} from "../../utils/sortItems.js";
import "../../styles/diseases.css";

const severityOptions=[
 {value:"all",label:"All Severities"},
 {value:"low",label:"Low"},
 {value:"moderate",label:"Moderate"},
 {value:"high",label:"High"},
 {value:"severe",label:"Severe"}
];

const formatList=value=>{
 if(!Array.isArray(value))return "";
 return value.filter(Boolean).join(", ");
};

const getName=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
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

const getCategory=item=>String(item?.category||"Uncategorized").trim()||"Uncategorized";

function DiseasesPage(){
 const [items,setItems]=useState([]);
 const [selected,setSelected]=useState(null);
 const [showView,setShowView]=useState(false);
 const [showForm,setShowForm]=useState(false);
 const [editDisease,setEditDisease]=useState(null);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [search,setSearch]=useState("");
 const [severity,setSeverity]=useState("all");
 const [selectedCategories,setSelectedCategories]=useState([]);

 const load=async()=>{
  setLoading(true);
  setError("");

  try{
   const res=await fetch("/api/diseases");
   const data=await res.json();

   if(!res.ok)throw new Error(data?.message||"Failed to load diseases");

   setItems(Array.isArray(data)?data:data?.data||[]);
  }catch(err){
   setError(err.message);
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{
  load();
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

 const severityCounts=useMemo(()=>{
  return items.reduce((acc,item)=>{
   const key=item?.severity||"moderate";
   acc[key]=(acc[key]||0)+1;
   return acc;
  },{});
 },[items]);

 const filteredItems=useMemo(()=>{
  const query=search.trim().toLowerCase();

  return sortItems(items,item=>item.diseaseName||item.scientificName||item.category||"")
   .filter(item=>{
    const category=getCategory(item);
    const matchesCategory=selectedCategories.length===0||selectedCategories.includes(category);
    const matchesSeverity=severity==="all"||item?.severity===severity;
    const searchable=[
     item?.diseaseName,
     item?.scientificName,
     item?.category,
     item?.cause,
     item?.spreadMethod,
     getAffectedRecordText(item),
     ...(Array.isArray(item?.symptoms)?item.symptoms:[]),
     ...(Array.isArray(item?.affectedParts)?item.affectedParts:[])
    ].filter(Boolean).join(" ").toLowerCase();

    return matchesCategory&&matchesSeverity&&(!query||searchable.includes(query));
   });
 },[items,search,severity,selectedCategories]);

 const toggleCategory=category=>{
  setSelectedCategories(prev=>(
   prev.includes(category)
    ? prev.filter(item=>item!==category)
    : [...prev,category]
  ));
 };

 const clearFilters=()=>{
  setSearch("");
  setSeverity("all");
  setSelectedCategories([]);
 };

 const handleView=item=>{
  setSelected(item);
  setShowView(true);
 };

 const handleAdd=()=>{
  setEditDisease(null);
  setShowForm(true);
 };

 const handleEdit=item=>{
  setEditDisease(item);
  setShowView(false);
  setShowForm(true);
 };

 const handleSaved=async()=>{
  await load();
 };

 return(
  <section className="diseases-page">
   <header className="diseases-hero">
    <div>
     <p className="diseases-kicker">Plant Health</p>
     <h1>Diseases</h1>
     <p>Filter disease records by category, severity, symptoms, plant source, and treatment details.</p>
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

     <Button type="button" onClick={handleAdd}>Add Disease</Button>
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
         id={`disease-category-${item.category}`}
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
       <Activity size={18}/>
       Severity
      </Card.Header>

      <Card.Body className="diseases-severity-list">
       {severityOptions.filter(item=>item.value!=="all").map(item=>(
        <button
         key={item.value}
         type="button"
         className={`diseases-severity-pill diseases-severity-${item.value}${severity===item.value?" active":""}`}
         onClick={()=>setSeverity(severity===item.value?"all":item.value)}
        >
         <span>{item.label}</span>
         <strong>{severityCounts[item.value]||0}</strong>
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
         <Form.Label>Search Diseases</Form.Label>
         <InputGroup>
          <InputGroup.Text><Search size={17}/></InputGroup.Text>
          <Form.Control
           value={search}
           onChange={event=>setSearch(event.target.value)}
           placeholder="Search name, category, symptom, cause, or affected plant"
          />
         </InputGroup>
        </Col>

        <Col lg={3}>
         <Form.Label>Severity</Form.Label>
         <Form.Select value={severity} onChange={event=>setSeverity(event.target.value)}>
          {severityOptions.map(item=>(
           <option key={item.value} value={item.value}>{item.label}</option>
          ))}
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
        Loading diseases...
       </Card.Body>
      </Card>
     ):(
      <div className="diseases-results">
       <div className="diseases-results-head">
        <h2>{filteredItems.length} Disease{filteredItems.length===1?"":"s"}</h2>
        <p>{selectedCategories.length?`Filtered by ${selectedCategories.join(", ")}`:"Showing all categories"}</p>
       </div>

       {filteredItems.length?(
        <div className="diseases-grid">
         {filteredItems.map(item=>(
          <article key={item._id} className="disease-card" onClick={()=>handleView(item)}>
           <div className="disease-card-top">
            <span className="disease-card-icon"><Microscope size={20}/></span>
            <Badge className={`disease-severity disease-severity-${item.severity||"moderate"}`}>
             {item.severity||"moderate"}
            </Badge>
           </div>

           <h3>{item.diseaseName||"Unnamed Disease"}</h3>
           {item.scientificName&&<p className="disease-scientific">{item.scientificName}</p>}

           <div className="disease-card-meta">
            <span><Bug size={15}/>{getCategory(item)}</span>
            <span><Sprout size={15}/>{getAffectedRecordText(item)}</span>
            <span><Leaf size={15}/>{getLinkedSourceText(item)}</span>
           </div>

           {item.cause&&<p className="disease-cause">{item.cause}</p>}

           <div className="disease-card-footer">
            <span>{Array.isArray(item.symptoms)?item.symptoms.length:0} symptoms</span>
            <span>{item.isContagious?"Contagious":"Not contagious"}</span>
           </div>
          </article>
         ))}
        </div>
       ):(
        <Card className="diseases-empty">
         <Card.Body>
          <AlertTriangle size={24}/>
          <h3>No diseases match these filters.</h3>
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
      <span>{selected?.diseaseName||"Disease"}</span>
      <Button type="button" size="sm" variant="outline-primary" onClick={()=>handleEdit(selected)}>
       Edit Disease
      </Button>
     </Modal.Title>
    </Modal.Header>

    <Modal.Body className="disease-detail-modal">
     <Row className="g-3">
      <Col lg={4}>
       <Card className="disease-detail-card">
        <Card.Body>
         <div className="disease-detail-icon"><Microscope size={24}/></div>
         <h2>{selected?.diseaseName||"Disease"}</h2>
         {selected?.scientificName&&<p className="disease-scientific">{selected.scientificName}</p>}

         <div className="disease-detail-badges">
          <Badge className={`disease-severity disease-severity-${selected?.severity||"moderate"}`}>
           {selected?.severity||"moderate"}
          </Badge>
          <Badge bg={selected?.isContagious?"danger":"success"}>
           {selected?.isContagious?"Contagious":"Not contagious"}
          </Badge>
         </div>

         <div className="disease-detail-list">
          <div><strong>Category:</strong> {selected?.category||"Not listed"}</div>
          <div><strong>Affected Records:</strong> {getAffectedRecordText(selected)}</div>
          <div><strong>Assigned To:</strong> {getLinkedSourceText(selected)}</div>
         </div>

         {selected?.image&&<Image src={selected.image} thumbnail className="disease-detail-image"/>}
        </Card.Body>
       </Card>
      </Col>

      <Col lg={8}>
       <Row className="g-3">
        <Col md={6}><DiseaseDetailSection title="Cause" value={selected?.cause}/></Col>
        <Col md={6}><DiseaseDetailSection title="Spread Method" value={selected?.spreadMethod}/></Col>
        <Col md={6}><DiseaseDetailSection title="Symptoms" value={formatList(selected?.symptoms)}/></Col>
        <Col md={6}><DiseaseDetailSection title="Affected Parts" value={formatList(selected?.affectedParts)}/></Col>
        <Col md={12}><DiseaseDetailSection title="Favorable Conditions" value={selected?.favorableConditions}/></Col>
        <Col md={12}><DiseaseDetailSection title="Prevention" value={formatList(selected?.prevention)} icon={<ShieldCheck size={18}/>}/></Col>
        <Col md={6}><DiseaseDetailSection title="Organic Treatment" value={formatList(selected?.organicTreatment)}/></Col>
        <Col md={6}><DiseaseDetailSection title="Chemical Treatment" value={formatList(selected?.chemicalTreatment)}/></Col>

        <Col md={12}>
         <Card className="disease-detail-section">
          <Card.Body>
           <h3>Treatments</h3>
           {selected?.treatments?.length?selected.treatments.map((treatment,index)=>(
            <div key={`${treatment.name}-${index}`} className="disease-treatment">
             <strong>{treatment.name||"Treatment"}</strong>
             <p>{treatment.description||"No description listed."}</p>
             <div>
              {treatment.type&&<span>Type: {treatment.type}</span>}
              {treatment.applicationMethod&&<span>Method: {treatment.applicationMethod}</span>}
              {treatment.dosage&&<span>Dosage: {treatment.dosage}</span>}
              {treatment.frequency&&<span>Frequency: {treatment.frequency}</span>}
              {treatment.duration&&<span>Duration: {treatment.duration}</span>}
              {treatment.notes&&<span>Notes: {treatment.notes}</span>}
             </div>
            </div>
           )):<p>No treatments listed.</p>}
          </Card.Body>
         </Card>
        </Col>

        <Col md={12}><DiseaseDetailSection title="References" value={formatList(selected?.references)}/></Col>
       </Row>
      </Col>
     </Row>
   </Modal.Body>
   </Modal>

   <DiseaseForm
    show={showForm}
    onHide={()=>setShowForm(false)}
    onSuccess={handleSaved}
    editId={editDisease?._id||null}
    initialData={editDisease}
    mode={editDisease?"edit":"add"}
   />
  </section>
 );
}

function DiseaseDetailSection({title,value,icon=null}){
 return(
  <Card className="disease-detail-section">
   <Card.Body>
    <h3>{icon}{title}</h3>
    <p>{value||"Not listed."}</p>
   </Card.Body>
  </Card>
 );
}

export default DiseasesPage;
