// src/pages/harvest/HarvestPage.jsx
import {useEffect,useMemo,useState} from "react";
import {Alert,Badge,Button,Card,Col,Form,InputGroup,Modal,Row,Spinner} from "react-bootstrap";
import {CalendarDays,Pencil,Plus,Save,Search,Trash2,Wheat} from "lucide-react";
import SortedList from "../../components/SortedList.jsx";
import SortedSelect from "../../components/SortedSelect.jsx";
import {sortItems} from "../../utils/sortItems.js";
import "../../styles/harvestPage.css";

const defaultHarvestForm={
 planting:"",
 harvestDate:"",
 harvestAmount:{g:"",oz:"",lb:""},
 usableAmount:{g:"",oz:"",lb:""},
 wasteAmount:{g:"",oz:"",lb:""},
 quality:"",
 note:"",
 isActive:true
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

const getText=value=>{
 if(value===undefined||value===null)return "";
 if(typeof value==="string")return value;
 if(typeof value==="number")return String(value);

 if(Array.isArray(value)){
  return value.map(item=>getText(item)).filter(Boolean).join(", ");
 }

 if(typeof value==="object"){
  return value.plantName||value.name||value.title||value.label||value.commonName||value.varietyName||getObjectId(value);
 }

 return "";
};

const getPlantingSource=planting=>{
 if(!planting)return "";
 return getText(planting.seed)||getText(planting.plant)||"Unknown source";
};

const getPlantingLabel=planting=>{
 if(!planting)return "Select growing instance";
 return planting.instanceName||getPlantingSource(planting);
};

const getHarvestLabel=item=>{
 return getPlantingLabel(item?.planting);
};

const getQualityLabel=item=>{
 return item?.name||item?.title||item?.label||item?.quality||item?.description||"Quality";
};

const numberOrZero=value=>{
 const numericValue=Number(value);
 return Number.isFinite(numericValue) ? numericValue : 0;
};

const formatWeight=weight=>{
 const parts=[];
 if(Number(weight?.lb))parts.push(`${Number(weight.lb)} lb`);
 if(Number(weight?.oz))parts.push(`${Number(weight.oz)} oz`);
 if(Number(weight?.g))parts.push(`${Number(weight.g)} g`);
 return parts.length ? parts.join(" / ") : "Not listed";
};

export default function HarvestPage({user}){
 const [harvests,setHarvests]=useState([]);
 const [plantings,setPlantings]=useState([]);
 const [qualityScales,setQualityScales]=useState([]);
 const [search,setSearch]=useState("");
 const [showModal,setShowModal]=useState(false);
 const [editingHarvest,setEditingHarvest]=useState(null);
 const [formData,setFormData]=useState(defaultHarvestForm);
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

    const [harvestsRes,plantingsRes,qualityRes]=await Promise.all([
     fetch("/api/harvests"),
     fetch("/api/plantings"),
     fetch("/api/harvest-quality-scales")
    ]);

    const harvestsData=await harvestsRes.json().catch(()=>[]);
    const plantingsData=await plantingsRes.json().catch(()=>[]);
    const qualityData=await qualityRes.json().catch(()=>[]);

    if(!harvestsRes.ok)throw new Error(harvestsData.message||"Failed to load harvest records");
    if(!plantingsRes.ok)throw new Error(plantingsData.message||"Failed to load growing instances");
    if(!qualityRes.ok)throw new Error(qualityData.message||"Failed to load quality scale");

    if(ignore)return;

    setHarvests(Array.isArray(harvestsData)?harvestsData:[]);
    setPlantings(Array.isArray(plantingsData)?plantingsData:[]);
    setQualityScales(Array.isArray(qualityData)?qualityData:[]);
   }catch(err){
    if(!ignore)setError(err.message||"Failed to load harvest records");
   }finally{
    if(!ignore)setLoading(false);
   }
  };

  loadData();

  return()=>{
   ignore=true;
  };
 },[]);

 const filteredHarvests=useMemo(()=>{
  const searchText=search.trim().toLowerCase();

  return sortItems(harvests,getHarvestLabel).filter(item=>{
   if(!searchText)return true;

   const haystack=[
    getHarvestLabel(item),
    getPlantingSource(item.planting),
    getQualityLabel(item.quality),
    formatDate(item.harvestDate),
    item.notes?.map(note=>note.note).join(" ")
   ].join(" ").toLowerCase();

   return haystack.includes(searchText);
  });
 },[harvests,search]);

 const openAddModal=()=>{
  setEditingHarvest(null);
  setFormData({
   ...defaultHarvestForm,
   harvestDate:formatDateForInput(new Date())
  });
  setShowModal(true);
 };

 const openEditModal=item=>{
  setEditingHarvest(item);
  setFormData({
   planting:getObjectId(item.planting),
   harvestDate:formatDateForInput(item.harvestDate),
   harvestAmount:{
    g:item.harvestAmount?.g ?? "",
    oz:item.harvestAmount?.oz ?? "",
    lb:item.harvestAmount?.lb ?? ""
   },
   usableAmount:{
    g:item.usableAmount?.g ?? "",
    oz:item.usableAmount?.oz ?? "",
    lb:item.usableAmount?.lb ?? ""
   },
   wasteAmount:{
    g:item.wasteAmount?.g ?? "",
    oz:item.wasteAmount?.oz ?? "",
    lb:item.wasteAmount?.lb ?? ""
   },
   quality:getObjectId(item.quality),
   note:item.notes?.[0]?.note||"",
   isActive:item.isActive!==false
  });
  setShowModal(true);
 };

 const handleChange=e=>{
  const {name,value,type,checked}=e.target;

  if(name.includes(".")){
   const [group,key]=name.split(".");
   setFormData(prev=>({
    ...prev,
    [group]:{
     ...prev[group],
     [key]:value
    }
   }));
   return;
  }

  setFormData(prev=>({
   ...prev,
   [name]:type==="checkbox" ? checked : value
  }));
 };

 const handleSubmit=async e=>{
  e.preventDefault();

  try{
   setSaving(true);
   setError("");
   setSuccess("");

   const payload={
    planting:formData.planting,
    harvestDate:formData.harvestDate||null,
    harvestAmount:{
     g:numberOrZero(formData.harvestAmount.g),
     oz:numberOrZero(formData.harvestAmount.oz),
     lb:numberOrZero(formData.harvestAmount.lb)
    },
    usableAmount:{
     g:numberOrZero(formData.usableAmount.g),
     oz:numberOrZero(formData.usableAmount.oz),
     lb:numberOrZero(formData.usableAmount.lb)
    },
    wasteAmount:{
     g:numberOrZero(formData.wasteAmount.g),
     oz:numberOrZero(formData.wasteAmount.oz),
     lb:numberOrZero(formData.wasteAmount.lb)
    },
    quality:formData.quality||null,
    notes:formData.note ? [{note:formData.note,createdBy:getObjectId(user)}] : [],
    createdBy:getObjectId(user)||null,
    isActive:!!formData.isActive
   };

   const editingId=getObjectId(editingHarvest);
   const res=await fetch(editingId?`/api/harvests/${editingId}`:"/api/harvests",{
    method:editingId?"PUT":"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });

   const data=await res.json().catch(()=>({}));

   if(!res.ok)throw new Error(data.message||"Failed to save harvest record");

   setHarvests(prev=>{
    const next=editingId ? prev.map(item=>getObjectId(item)===getObjectId(data)?data:item) : [data,...prev];
    return sortItems(next,getHarvestLabel);
   });
   setShowModal(false);
   setSuccess(`${getHarvestLabel(data)} harvest was saved.`);
  }catch(err){
   setError(err.message||"Failed to save harvest record");
  }finally{
   setSaving(false);
  }
 };

 const handleDelete=async item=>{
  const id=getObjectId(item);
  if(!id)return;

  try{
   setError("");
   setSuccess("");

   const res=await fetch(`/api/harvests/${id}`,{method:"DELETE"});
   const data=await res.json().catch(()=>({}));

   if(!res.ok)throw new Error(data.message||"Failed to delete harvest record");

   setHarvests(prev=>prev.filter(current=>getObjectId(current)!==id));
   setSuccess(`${getHarvestLabel(item)} harvest was deleted.`);
  }catch(err){
   setError(err.message||"Failed to delete harvest record");
  }
 };

 return(
  <section className="harvest-page">
   <header className="harvest-header">
    <div>
     <p className="harvest-kicker">Harvest Tracking</p>
     <h1>Harvest Records</h1>
     <p>Record each harvest against a real growing instance so yield, quality, and dates stay tied to the plant or seed start.</p>
    </div>

    <Button type="button" onClick={openAddModal}>
     <Plus size={18}/>
     Add Harvest
    </Button>
   </header>

   {error&&<Alert variant="danger" dismissible onClose={()=>setError("")}>{error}</Alert>}
   {success&&<Alert variant="success" dismissible onClose={()=>setSuccess("")}>{success}</Alert>}

   <Card className="harvest-card">
    <Card.Body>
     <InputGroup>
      <InputGroup.Text><Search size={16}/></InputGroup.Text>
      <Form.Control value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search harvests, instances, quality, notes..."/>
     </InputGroup>
    </Card.Body>
   </Card>

   {loading ? (
    <div className="harvest-loading">
     <Spinner animation="border" size="sm"/>
     Loading harvest records...
    </div>
   ) : (
    <SortedList
     items={filteredHarvests}
     getKey={item=>getObjectId(item)}
     getLabel={getHarvestLabel}
     className="harvest-list"
     renderItem={item=>(
      <article className="harvest-record-card">
       <div className="harvest-record-head">
        <div>
         <p className="harvest-kicker">Harvest</p>
         <h2>{getHarvestLabel(item)}</h2>
         <p>{getPlantingSource(item.planting)}</p>
        </div>

        <Badge bg={item.isActive===false?"secondary":"success"}>{item.isActive===false?"Archived":"Active"}</Badge>
       </div>

       <div className="harvest-record-grid">
        <span><strong>Date:</strong> {formatDate(item.harvestDate)}</span>
        <span><strong>Harvested:</strong> {formatWeight(item.harvestAmount)}</span>
        <span><strong>Usable:</strong> {formatWeight(item.usableAmount)}</span>
        <span><strong>Waste:</strong> {formatWeight(item.wasteAmount)}</span>
        <span><strong>Quality:</strong> {getQualityLabel(item.quality)}</span>
        <span><strong>Days Since Last:</strong> {item.daysSinceLastHarvest ?? "Not listed"}</span>
       </div>

       {item.notes?.[0]?.note&&(
        <p className="harvest-note">{item.notes[0].note}</p>
       )}

       <div className="harvest-actions">
        <Button type="button" size="sm" variant="outline-primary" onClick={()=>openEditModal(item)}>
         <Pencil size={15}/>
         Edit
        </Button>
        <Button type="button" size="sm" variant="outline-danger" onClick={()=>handleDelete(item)}>
         <Trash2 size={15}/>
         Delete
        </Button>
       </div>
      </article>
     )}
    >
     <div className="harvest-empty">No harvest records match those filters.</div>
    </SortedList>
   )}

   <HarvestModal
    show={showModal}
    saving={saving}
    editing={!!editingHarvest}
    formData={formData}
    plantings={plantings}
    qualityScales={qualityScales}
    onChange={handleChange}
    onSubmit={handleSubmit}
    onHide={()=>setShowModal(false)}
   />
  </section>
 );
}

function HarvestModal({show,saving,editing,formData,plantings,qualityScales,onChange,onSubmit,onHide}){
 return(
  <Modal show={show} onHide={onHide} size="lg" centered>
   <Form onSubmit={onSubmit}>
    <Modal.Header closeButton>
     <Modal.Title>{editing?"Edit Harvest":"Add Harvest"}</Modal.Title>
    </Modal.Header>

    <Modal.Body>
     <Row className="g-3">
      <Col md={8}>
       <InputGroup>
        <InputGroup.Text>Instance</InputGroup.Text>
        <SortedSelect
         name="planting"
         value={formData.planting}
         onChange={onChange}
         options={plantings}
         getValue={item=>getObjectId(item)}
         getLabel={getPlantingLabel}
         placeholder="Select growing instance"
         required
        />
       </InputGroup>
      </Col>

      <Col md={4}>
       <InputGroup>
        <InputGroup.Text>Date</InputGroup.Text>
        <Form.Control type="date" name="harvestDate" value={formData.harvestDate} onChange={onChange}/>
       </InputGroup>
      </Col>

      <WeightInputs title="Harvest Amount" group="harvestAmount" values={formData.harvestAmount} onChange={onChange}/>
      <WeightInputs title="Usable Amount" group="usableAmount" values={formData.usableAmount} onChange={onChange}/>
      <WeightInputs title="Waste Amount" group="wasteAmount" values={formData.wasteAmount} onChange={onChange}/>

      <Col md={6}>
       <InputGroup>
        <InputGroup.Text>Quality</InputGroup.Text>
        <SortedSelect
         name="quality"
         value={formData.quality}
         onChange={onChange}
         options={qualityScales}
         getValue={item=>getObjectId(item)}
         getLabel={getQualityLabel}
         placeholder="Select quality"
        />
       </InputGroup>
      </Col>

      <Col md={6}>
       <Form.Check
        type="switch"
        id="harvest-is-active"
        name="isActive"
        label="Active record"
        checked={formData.isActive}
        onChange={onChange}
       />
      </Col>

      <Col md={12}>
       <InputGroup>
        <InputGroup.Text>Note</InputGroup.Text>
        <Form.Control as="textarea" rows={3} name="note" value={formData.note} onChange={onChange} placeholder="Flavor, condition, pest damage, storage notes..."/>
       </InputGroup>
      </Col>
     </Row>
    </Modal.Body>

    <Modal.Footer>
     <Button type="button" variant="outline-secondary" onClick={onHide}>Cancel</Button>
     <Button type="submit" disabled={saving}>
      <Save size={16}/>
      {saving?"Saving...":"Save Harvest"}
     </Button>
    </Modal.Footer>
   </Form>
  </Modal>
 );
}

function WeightInputs({title,group,values,onChange}){
 return(
  <Col md={4}>
   <Card className="harvest-weight-card">
    <Card.Header>{title}</Card.Header>
    <Card.Body>
     <InputGroup className="mb-2">
      <InputGroup.Text>lb</InputGroup.Text>
      <Form.Control type="number" min="0" step="0.01" name={`${group}.lb`} value={values.lb} onChange={onChange}/>
     </InputGroup>
     <InputGroup className="mb-2">
      <InputGroup.Text>oz</InputGroup.Text>
      <Form.Control type="number" min="0" step="0.01" name={`${group}.oz`} value={values.oz} onChange={onChange}/>
     </InputGroup>
     <InputGroup>
      <InputGroup.Text>g</InputGroup.Text>
      <Form.Control type="number" min="0" step="0.01" name={`${group}.g`} value={values.g} onChange={onChange}/>
     </InputGroup>
    </Card.Body>
   </Card>
  </Col>
 );
}
