import {useEffect,useMemo,useState} from "react";
import {Alert,Badge,Button,Card,Col,Form,InputGroup,Modal,Row,Spinner} from "react-bootstrap";
import {Archive,CalendarDays,DollarSign,Filter,Info,Pencil,Plus,Save,Search,Tag,Wrench} from "lucide-react";
import SortedList from "../../components/SortedList.jsx";
import SortedSelect from "../../components/SortedSelect.jsx";
import {sortItems} from "../../utils/sortItems.js";
import "../../styles/equipmentPage.css";

const conditionOptions=[
 {value:"all",label:"All Conditions"},
 {value:"new",label:"New"},
 {value:"good",label:"Good"},
 {value:"used",label:"Used"},
 {value:"needs_repair",label:"Needs Repair"},
 {value:"replaced",label:"Replaced"}
];

const defaultEquipmentForm={
 name:"",
 description:"",
 category:"",
 vendor:"",
 brand:"",
 modelNumber:"",
 purchaseDate:"",
 purchasePrice:"",
 condition:"good",
 notes:""
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

const getText=value=>{
 if(value===undefined||value===null)return "";
 if(typeof value==="string")return value;
 if(typeof value==="number")return String(value);
 if(typeof value==="object")return value.name||value.companyName||value.title||value.label||value.modelNumber||"";
 return "";
};

const getCategoryName=item=>getText(item?.category)||"Uncategorized";
const getVendorName=item=>getText(item?.vendor)||"No vendor";

const formatMoney=value=>{
 const number=Number(value||0);
 if(!Number.isFinite(number))return "$0.00";
 return number.toLocaleString(undefined,{style:"currency",currency:"USD"});
};

const formatDate=value=>{
 if(!value)return "Not listed";
 const date=new Date(value);
 if(Number.isNaN(date.getTime()))return "Not listed";
 return date.toLocaleDateString();
};

const conditionLabel=value=>{
 return conditionOptions.find(item=>item.value===value)?.label||"Not listed";
};

const conditionVariant=value=>{
 if(value==="new")return "success";
 if(value==="good")return "primary";
 if(value==="used")return "secondary";
 if(value==="needs_repair")return "warning";
 if(value==="replaced")return "dark";
 return "light";
};

const buildSummaryRows=(items,getLabel)=>{
 const totals=items.reduce((rows,item)=>{
  const label=getLabel(item);
  const key=label||"Not listed";

  if(!rows[key]){
   rows[key]={
    label:key,
    count:0,
    value:0,
    equipment:[]
   };
  }

  rows[key].count+=1;
  rows[key].value+=Number(item.purchasePrice||0);
  rows[key].equipment.push(item.name||"Unnamed Equipment");

  return rows;
 },{});

 return Object.values(totals).sort((a,b)=>b.count-a.count||a.label.localeCompare(b.label));
};

export default function EquipmentPage(){
 const [equipment,setEquipment]=useState([]);
 const [categories,setCategories]=useState([]);
 const [vendors,setVendors]=useState([]);
 const [selectedCategory,setSelectedCategory]=useState("all");
 const [selectedVendor,setSelectedVendor]=useState("all");
 const [selectedCondition,setSelectedCondition]=useState("all");
 const [search,setSearch]=useState("");
 const [selectedItem,setSelectedItem]=useState(null);
 const [editingItem,setEditingItem]=useState(null);
 const [showEditModal,setShowEditModal]=useState(false);
 const [equipmentForm,setEquipmentForm]=useState(defaultEquipmentForm);
 const [saving,setSaving]=useState(false);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");

 const loadEquipment=async()=>{
  const [equipmentRes,categoriesRes,vendorsRes]=await Promise.all([
   fetch("/api/equipment"),
   fetch("/api/equipment-categories"),
   fetch("/api/equipment-vendors")
  ]);

  const equipmentData=await equipmentRes.json().catch(()=>[]);
  const categoriesData=await categoriesRes.json().catch(()=>[]);
  const vendorsData=await vendorsRes.json().catch(()=>[]);

  if(!equipmentRes.ok)throw new Error(equipmentData.message||"Failed to load equipment");
  if(!categoriesRes.ok)throw new Error(categoriesData.message||"Failed to load equipment categories");
  if(!vendorsRes.ok)throw new Error(vendorsData.message||"Failed to load equipment vendors");

  setEquipment(Array.isArray(equipmentData)?equipmentData:[]);
  setCategories(Array.isArray(categoriesData)?categoriesData:[]);
  setVendors(Array.isArray(vendorsData)?vendorsData:[]);
 };

 useEffect(()=>{
  let ignore=false;

  const loadPageData=async()=>{
   try{
    setLoading(true);
    setError("");

    await loadEquipment();
    if(ignore)return;
   }catch(err){
    if(!ignore)setError(err.message||"Failed to load equipment");
   }finally{
    if(!ignore)setLoading(false);
   }
  };

  loadPageData();

  return()=>{
   ignore=true;
  };
 },[]);

 const filteredEquipment=useMemo(()=>{
  const searchText=search.trim().toLowerCase();

  return sortItems(equipment,item=>item.name||"").filter(item=>{
   const categoryId=getObjectId(item.category);
   const vendorId=getObjectId(item.vendor);
   const matchesCategory=selectedCategory==="all"||categoryId===selectedCategory;
   const matchesVendor=selectedVendor==="all"||vendorId===selectedVendor;
   const matchesCondition=selectedCondition==="all"||item.condition===selectedCondition;
   const haystack=[
    item.name,
    item.brand,
    item.modelNumber,
    item.description,
    item.notes,
    getCategoryName(item),
    getVendorName(item)
   ].filter(Boolean).join(" ").toLowerCase();

   return matchesCategory&&matchesVendor&&matchesCondition&&(!searchText||haystack.includes(searchText));
  });
 },[equipment,search,selectedCategory,selectedVendor,selectedCondition]);

 const groupedEquipment=useMemo(()=>{
  return filteredEquipment.reduce((groups,item)=>{
   const category=getCategoryName(item);
   groups[category]=groups[category]||[];
   groups[category].push(item);
   return groups;
  },{});
 },[filteredEquipment]);

 const metrics=useMemo(()=>{
  return {
   total:equipment.length,
   categories:new Set(equipment.map(item=>getCategoryName(item))).size,
   repair:equipment.filter(item=>item.condition==="needs_repair").length,
   value:equipment.reduce((total,item)=>total+Number(item.purchasePrice||0),0)
  };
 },[equipment]);

 const categorySummary=useMemo(()=>{
  return buildSummaryRows(equipment,getCategoryName);
 },[equipment]);

 const vendorSummary=useMemo(()=>{
  return buildSummaryRows(equipment,getVendorName);
 },[equipment]);

 const conditionSummary=useMemo(()=>{
  return buildSummaryRows(equipment,item=>conditionLabel(item.condition));
 },[equipment]);

 const recentEquipment=useMemo(()=>{
  return [...equipment]
   .sort((a,b)=>new Date(b.createdAt||b.purchaseDate||0)-new Date(a.createdAt||a.purchaseDate||0))
   .slice(0,6);
 },[equipment]);

 const openAddEquipment=()=>{
  setEditingItem(null);
  setEquipmentForm(defaultEquipmentForm);
  setShowEditModal(true);
 };

 const openEditEquipment=item=>{
  setEditingItem(item);
  setEquipmentForm({
   name:item?.name||"",
   description:item?.description||"",
   category:getObjectId(item?.category),
   vendor:getObjectId(item?.vendor),
   brand:item?.brand||"",
   modelNumber:item?.modelNumber||"",
   purchaseDate:formatDateForInput(item?.purchaseDate),
   purchasePrice:item?.purchasePrice ?? "",
   condition:item?.condition||"good",
   notes:item?.notes||""
  });
  setShowEditModal(true);
 };

 const handleEquipmentFormChange=e=>{
  const {name,value,type}=e.target;
  setEquipmentForm(prev=>({
   ...prev,
   [name]:type==="number" ? value : value
  }));
 };

 const handleSaveEquipment=async e=>{
  e.preventDefault();

  try{
   setSaving(true);
   setError("");
   setSuccess("");

   const payload={
    ...equipmentForm,
    category:equipmentForm.category||null,
    vendor:equipmentForm.vendor||null,
    purchaseDate:equipmentForm.purchaseDate||null,
    purchasePrice:equipmentForm.purchasePrice==="" ? null : Number(equipmentForm.purchasePrice)
   };

   const editingId=getObjectId(editingItem);
   const res=await fetch(editingId?`/api/equipment/${editingId}`:"/api/equipment",{
    method:editingId?"PUT":"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });

   const data=await res.json().catch(()=>({}));

   if(!res.ok)throw new Error(data.message||"Failed to save equipment");

   setEquipment(prev=>{
    const next=editingId ? prev.map(item=>getObjectId(item)===getObjectId(data)?data:item) : [...prev,data];
    return sortItems(next,item=>item.name||"");
   });
   setShowEditModal(false);
   setSelectedItem(null);
   setSuccess(`${data.name||"Equipment"} was saved.`);
  }catch(err){
   setError(err.message||"Failed to save equipment");
  }finally{
   setSaving(false);
  }
 };

 return(
  <section className="equipment-page">
   <header className="equipment-header">
    <div>
     <p className="equipment-kicker">Equipment</p>
     <h1>Equipment by Category</h1>
     <p>Browse grow lights, hydro systems, tools, pumps, meters, and other equipment by category, vendor, and condition.</p>
    </div>

    <Button type="button" onClick={openAddEquipment} className="equipment-add-button">
     <Plus size={18}/>
     Add Equipment
    </Button>
   </header>

   {error&&(
    <Alert variant="danger" dismissible onClose={()=>setError("")}>{error}</Alert>
   )}

   {success&&(
    <Alert variant="success" dismissible onClose={()=>setSuccess("")}>{success}</Alert>
   )}

   <section className="equipment-metrics">
    <MetricCard icon={<Archive size={18}/>} label="Equipment" value={metrics.total}/>
    <MetricCard icon={<Tag size={18}/>} label="Categories" value={metrics.categories}/>
   <MetricCard icon={<Wrench size={18}/>} label="Needs Repair" value={metrics.repair}/>
   <MetricCard icon={<DollarSign size={18}/>} label="Purchase Value" value={formatMoney(metrics.value)}/>
  </section>

  <section className="equipment-breakdown-grid">
   <SummaryPanel
    title="Category Breakdown"
    subtitle="What equipment makes up each category count"
    rows={categorySummary}
   />

   <SummaryPanel
    title="Vendor Breakdown"
    subtitle="Which vendors your equipment is tied to"
    rows={vendorSummary}
   />

   <SummaryPanel
    title="Condition Breakdown"
    subtitle="Current equipment condition by item"
    rows={conditionSummary}
   />

   <RecentEquipmentPanel items={recentEquipment}/>
  </section>

  <Card className="equipment-card">
   <Card.Body>
     <div className="equipment-filter-grid">
      <InputGroup>
       <InputGroup.Text><Search size={16}/></InputGroup.Text>
       <Form.Control value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search equipment, model, vendor..."/>
      </InputGroup>

      <InputGroup>
       <InputGroup.Text><Filter size={16}/></InputGroup.Text>
       <SortedSelect
        value={selectedCategory}
        onChange={e=>setSelectedCategory(e.target.value)}
        options={[{_id:"all",name:"All Categories"},...categories]}
        getValue={item=>getObjectId(item)}
        getLabel={item=>item.name||"Uncategorized"}
        includePlaceholder={false}
       />
      </InputGroup>

      <SortedSelect
       value={selectedVendor}
       onChange={e=>setSelectedVendor(e.target.value)}
       options={[{_id:"all",name:"All Vendors"},...vendors]}
       getValue={item=>getObjectId(item)}
       getLabel={item=>item.name||item.companyName||"Vendor"}
       includePlaceholder={false}
      />

      <SortedSelect
       value={selectedCondition}
       onChange={e=>setSelectedCondition(e.target.value)}
       options={conditionOptions}
       getValue={item=>item.value}
       getLabel={item=>item.label}
       includePlaceholder={false}
      />
     </div>
    </Card.Body>
   </Card>

   {loading ? (
    <div className="equipment-loading">
     <Spinner animation="border" size="sm"/>
     Loading equipment...
    </div>
   ) : (
    <div className="equipment-groups">
     {Object.keys(groupedEquipment).length ? (
      <SortedList
       items={Object.entries(groupedEquipment).map(([category,items])=>({category,items}))}
       getKey={item=>item.category}
       getLabel={item=>item.category}
       className="equipment-groups-list"
       renderItem={group=>(
        <section className="equipment-group">
         <div className="equipment-group-head">
          <h2>{group.category}</h2>
          <Badge bg="success">{group.items.length}</Badge>
         </div>

         <div className="equipment-item-grid">
          {sortItems(group.items,item=>item.name||"").map(item=>(
           <EquipmentCard key={item._id} item={item} onView={()=>setSelectedItem(item)} onEdit={()=>openEditEquipment(item)}/>
          ))}
         </div>
        </section>
       )}
      />
     ) : (
      <div className="equipment-empty">No equipment matches those filters.</div>
     )}
    </div>
   )}

   <EquipmentDetailsModal item={selectedItem} onHide={()=>setSelectedItem(null)}/>
   <EquipmentFormModal
    show={showEditModal}
    saving={saving}
    formData={equipmentForm}
    categories={categories}
    vendors={vendors}
    editing={!!editingItem}
    onChange={handleEquipmentFormChange}
    onSubmit={handleSaveEquipment}
    onHide={()=>setShowEditModal(false)}
   />
  </section>
 );
}

function MetricCard({icon,label,value}){
 return(
  <Card className="equipment-metric-card">
   <Card.Body>
    <span className="equipment-metric-icon">{icon}</span>
    <div>
     <p>{label}</p>
     <strong>{value}</strong>
    </div>
   </Card.Body>
  </Card>
 );
}

function SummaryPanel({title,subtitle,rows=[]}){
 return(
  <Card className="equipment-summary-card">
   <Card.Body>
    <div className="equipment-summary-head">
     <h2>{title}</h2>
     <p>{subtitle}</p>
    </div>

    {rows.length ? (
     <div className="equipment-summary-list">
      {rows.map(row=>(
       <div className="equipment-summary-row" key={row.label}>
        <div className="equipment-summary-row-top">
         <strong>{row.label}</strong>
         <Badge bg="success">{row.count}</Badge>
        </div>
        <div className="equipment-summary-row-items">{row.equipment.slice(0,4).join(", ")}</div>
        <div className="equipment-summary-row-value">{formatMoney(row.value)}</div>
       </div>
      ))}
     </div>
    ) : (
     <div className="equipment-summary-empty">No equipment entered yet.</div>
    )}
   </Card.Body>
  </Card>
 );
}

function RecentEquipmentPanel({items=[]}){
 return(
  <Card className="equipment-summary-card">
   <Card.Body>
    <div className="equipment-summary-head">
     <h2>Recent Equipment</h2>
     <p>The newest records included in the equipment total</p>
    </div>

    {items.length ? (
     <div className="equipment-recent-list">
      {items.map(item=>(
       <div className="equipment-recent-row" key={getObjectId(item)}>
        <div>
         <strong>{item.name||"Unnamed Equipment"}</strong>
         <span>{[getCategoryName(item),getVendorName(item)].filter(Boolean).join(" • ")}</span>
        </div>
        <Badge bg={conditionVariant(item.condition)}>{conditionLabel(item.condition)}</Badge>
       </div>
      ))}
     </div>
    ) : (
     <div className="equipment-summary-empty">No equipment entered yet.</div>
    )}
   </Card.Body>
  </Card>
 );
}

function EquipmentCard({item,onView,onEdit}){
 return(
  <article className="equipment-item-card">
   <div className="equipment-item-top">
    <div>
     <h3>{item.name||"Unnamed Equipment"}</h3>
     <p>{[item.brand,item.modelNumber].filter(Boolean).join(" • ")||"No model listed"}</p>
    </div>

    <Badge bg={conditionVariant(item.condition)}>{conditionLabel(item.condition)}</Badge>
   </div>

   <div className="equipment-item-meta">
    <span><Tag size={15}/>{getCategoryName(item)}</span>
    <span><Archive size={15}/>{getVendorName(item)}</span>
    <span><CalendarDays size={15}/>{formatDate(item.purchaseDate)}</span>
    <span><DollarSign size={15}/>{formatMoney(item.purchasePrice)}</span>
   </div>

   <div className="equipment-card-actions">
    <Button type="button" variant="outline-primary" size="sm" onClick={onView}>
     <Info size={15}/>
     Details
    </Button>
    <Button type="button" variant="primary" size="sm" onClick={onEdit}>
     <Pencil size={15}/>
     Edit
    </Button>
   </div>
  </article>
 );
}

const formatDateForInput=value=>{
 if(!value)return "";
 const date=new Date(value);
 if(Number.isNaN(date.getTime()))return "";
 return date.toISOString().slice(0,10);
};

function EquipmentDetailsModal({item,onHide}){
 return(
  <Modal show={!!item} onHide={onHide} size="lg" centered>
   <Modal.Header closeButton>
    <Modal.Title>{item?.name||"Equipment Details"}</Modal.Title>
   </Modal.Header>

   <Modal.Body>
    <Row className="g-3">
     <Detail label="Category" value={getCategoryName(item)}/>
     <Detail label="Vendor" value={getVendorName(item)}/>
     <Detail label="Brand" value={item?.brand}/>
     <Detail label="Model Number" value={item?.modelNumber}/>
     <Detail label="Condition" value={conditionLabel(item?.condition)}/>
     <Detail label="Purchase Date" value={formatDate(item?.purchaseDate)}/>
     <Detail label="Purchase Price" value={formatMoney(item?.purchasePrice)}/>
     <Detail label="Description" value={item?.description} wide/>
     <Detail label="Notes" value={item?.notes} wide/>
    </Row>

    {Array.isArray(item?.maintenanceHistory)&&item.maintenanceHistory.length ? (
     <div className="equipment-maintenance">
      <h3>Maintenance History</h3>
      {item.maintenanceHistory.map((record,index)=>(
       <div key={`${record.date}-${index}`} className="equipment-maintenance-row">
        <strong>{record.type||"Maintenance"}</strong>
        <span>{formatDate(record.date)}</span>
        <p>{record.description||record.notes||"No notes listed."}</p>
       </div>
      ))}
     </div>
    ) : null}
   </Modal.Body>

   <Modal.Footer>
    <Button variant="secondary" onClick={onHide}>Close</Button>
   </Modal.Footer>
  </Modal>
 );
}

function Detail({label,value,wide=false}){
 return(
  <Col md={wide?12:6}>
   <div className="equipment-detail">
    <strong>{label}</strong>
    <span>{value||"Not listed"}</span>
   </div>
  </Col>
 );
}

function EquipmentFormModal({show,saving,formData,categories,vendors,editing,onChange,onSubmit,onHide}){
 return(
  <Modal show={show} onHide={onHide} size="lg" centered>
   <Form onSubmit={onSubmit}>
    <Modal.Header closeButton>
     <Modal.Title>{editing?"Edit Equipment":"Add Equipment"}</Modal.Title>
    </Modal.Header>

    <Modal.Body>
     <Row className="g-3">
      <Col md={8}>
       <InputGroup>
        <InputGroup.Text>Name</InputGroup.Text>
        <Form.Control name="name" value={formData.name} onChange={onChange} required/>
       </InputGroup>
      </Col>

      <Col md={4}>
       <InputGroup>
        <InputGroup.Text>Condition</InputGroup.Text>
        <SortedSelect
         name="condition"
         value={formData.condition}
         onChange={onChange}
         options={conditionOptions.filter(item=>item.value!=="all")}
         getValue={item=>item.value}
         getLabel={item=>item.label}
         includePlaceholder={false}
        />
       </InputGroup>
      </Col>

      <Col md={6}>
       <InputGroup>
        <InputGroup.Text>Category</InputGroup.Text>
        <SortedSelect
         name="category"
         value={formData.category}
         onChange={onChange}
         options={categories}
         getValue={item=>getObjectId(item)}
         getLabel={item=>item.name||"Category"}
         placeholder="Select category"
        />
       </InputGroup>
      </Col>

      <Col md={6}>
       <InputGroup>
        <InputGroup.Text>Vendor</InputGroup.Text>
        <SortedSelect
         name="vendor"
         value={formData.vendor}
         onChange={onChange}
         options={vendors}
         getValue={item=>getObjectId(item)}
         getLabel={item=>item.name||item.companyName||"Vendor"}
         placeholder="Select vendor"
        />
       </InputGroup>
      </Col>

      <Col md={4}>
       <InputGroup>
        <InputGroup.Text>Brand</InputGroup.Text>
        <Form.Control name="brand" value={formData.brand} onChange={onChange}/>
       </InputGroup>
      </Col>

      <Col md={4}>
       <InputGroup>
        <InputGroup.Text>Model</InputGroup.Text>
        <Form.Control name="modelNumber" value={formData.modelNumber} onChange={onChange}/>
       </InputGroup>
      </Col>

      <Col md={4}>
       <InputGroup>
        <InputGroup.Text>Price</InputGroup.Text>
        <Form.Control type="number" step="0.01" name="purchasePrice" value={formData.purchasePrice} onChange={onChange}/>
       </InputGroup>
      </Col>

      <Col md={6}>
       <InputGroup>
        <InputGroup.Text>Purchase Date</InputGroup.Text>
        <Form.Control type="date" name="purchaseDate" value={formData.purchaseDate} onChange={onChange}/>
       </InputGroup>
      </Col>

      <Col md={12}>
       <InputGroup>
        <InputGroup.Text>Description</InputGroup.Text>
        <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={onChange}/>
       </InputGroup>
      </Col>

      <Col md={12}>
       <InputGroup>
        <InputGroup.Text>Notes</InputGroup.Text>
        <Form.Control as="textarea" rows={3} name="notes" value={formData.notes} onChange={onChange}/>
       </InputGroup>
      </Col>
     </Row>
    </Modal.Body>

    <Modal.Footer>
     <Button type="button" variant="outline-secondary" onClick={onHide}>Cancel</Button>
     <Button type="submit" disabled={saving}>
      <Save size={16}/>
      {saving?"Saving...":"Save Equipment"}
     </Button>
    </Modal.Footer>
   </Form>
  </Modal>
 );
}
