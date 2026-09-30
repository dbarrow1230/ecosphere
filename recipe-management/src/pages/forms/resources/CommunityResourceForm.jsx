import Alert from "../../../components/AppAlert.jsx";
// src/pages/forms/resources/CommunityResourceForm.jsx
import {useEffect,useMemo,useState} from "react";
import {Button,Card,Col,Container,Form,Row,Spinner} from "react-bootstrap";
import {useNavigate,useParams} from "react-router-dom";
import axios from "axios";

function CommunityResourceForm({resourceId:propResourceId="",embedded=false,onSaved,onCancel}){

 const navigate=useNavigate();
 const {id:paramId}=useParams();
 const resourceId=propResourceId||paramId||"";
 const isEdit=Boolean(resourceId);

 const emptyScheduleItem={dayLabel:"",startTime:"",endTime:"",timeText:"",notes:""};
 const emptyForm={
  name:"",
  organization:"",
  category:"",
  subcategories:[],
  description:"",
  services:[],
  eligibility:"",
  requirements:"",
  intakeInstructions:"",
  address:{
   address1:"",
   address2:"",
   city:"",
   state:"",
   country:"",
   county:"",
   borough:"",
   postalCode:"",
   crossStreets:"",
   fullText:""
  },
  contact:{
   phone:"",
   email:"",
   website:"",
   contactName:"",
   notes:""
  },
  transportation:{
   trains:[],
   buses:[]
  },
  schedule:[{...emptyScheduleItem}],
  isWalkIn:false,
  appointmentRequired:false,
  idRequired:false,
  is24Hours:false,
  isFamilyFriendly:false,
  isWomenOnly:false,
  isMenOnly:false,
  youthOnly:false,
  notes:"",
  source:"",
  sourceDateLabel:"",
  isActive:true
 };

 const [formData,setFormData]=useState(emptyForm);
 const [categories,setCategories]=useState([]);
 const [states,setStates]=useState([]);
 const [countries,setCountries]=useState([]);
 const [counties,setCounties]=useState([]);
 const [boroughs,setBoroughs]=useState([]);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");
 const [serviceInput,setServiceInput]=useState("");
 const [trainInput,setTrainInput]=useState("");
 const [busInput,setBusInput]=useState("");

 const getId=(value)=>{
  if(!value)return "";
  if(typeof value==="string")return value;
  if(typeof value==="number")return String(value);
  if(value.$oid)return value.$oid;
  if(value._id){
   if(typeof value._id==="string")return value._id;
   if(value._id?.$oid)return value._id.$oid;
  }
  if(value.id){
   if(typeof value.id==="string")return value.id;
   if(value.id?.$oid)return value.id.$oid;
  }
  return "";
 };

 const getLabel=(value)=>{
  if(!value)return "";
  if(typeof value==="string")return value;
  if(value.name)return value.name;
  if(value.title)return value.title;
  if(value.label)return value.label;
  if(value.code)return value.code;
  if(value.abbreviation)return value.abbreviation;
  return "";
 };

 const toArray=(value)=>{
  if(Array.isArray(value))return value;
  if(Array.isArray(value?.data))return value.data;
  return [];
 };

 const normalizeResource=(item)=>{
  return{
   name:item?.name||"",
   organization:item?.organization||"",
   category:getId(item?.category)||"",
   subcategories:Array.isArray(item?.subcategories)?item.subcategories.map(getId).filter(Boolean):[],
   description:item?.description||"",
   services:Array.isArray(item?.services)?item.services.filter(Boolean):[],
   eligibility:item?.eligibility||"",
   requirements:item?.requirements||"",
   intakeInstructions:item?.intakeInstructions||"",
   address:{
    address1:item?.address?.address1||"",
    address2:item?.address?.address2||"",
    city:item?.address?.city||"",
    state:getId(item?.address?.state)||"",
    country:getId(item?.address?.country)||"",
    county:getId(item?.address?.county)||"",
    borough:getId(item?.address?.borough)||"",
    postalCode:item?.address?.postalCode||"",
    crossStreets:item?.address?.crossStreets||"",
    fullText:item?.address?.fullText||""
   },
   contact:{
    phone:item?.contact?.phone||"",
    email:item?.contact?.email||"",
    website:item?.contact?.website||"",
    contactName:item?.contact?.contactName||"",
    notes:item?.contact?.notes||""
   },
   transportation:{
    trains:Array.isArray(item?.transportation?.trains)?item.transportation.trains.filter(Boolean):[],
    buses:Array.isArray(item?.transportation?.buses)?item.transportation.buses.filter(Boolean):[]
   },
   schedule:Array.isArray(item?.schedule)&&item.schedule.length?item.schedule.map(schedule=>({
    dayLabel:schedule?.dayLabel||"",
    startTime:schedule?.startTime||"",
    endTime:schedule?.endTime||"",
    timeText:schedule?.timeText||"",
    notes:schedule?.notes||""
   })):[{...emptyScheduleItem}],
   isWalkIn:Boolean(item?.isWalkIn),
   appointmentRequired:Boolean(item?.appointmentRequired),
   idRequired:Boolean(item?.idRequired),
   is24Hours:Boolean(item?.is24Hours),
   isFamilyFriendly:Boolean(item?.isFamilyFriendly),
   isWomenOnly:Boolean(item?.isWomenOnly),
   isMenOnly:Boolean(item?.isMenOnly),
   youthOnly:Boolean(item?.youthOnly),
   notes:item?.notes||"",
   source:item?.source||"",
   sourceDateLabel:item?.sourceDateLabel||"",
   isActive:item?.isActive!==undefined?Boolean(item.isActive):true
  };
 };

 useEffect(()=>{
  const loadData=async()=>{
   try{
    setLoading(true);
    setError("");
    setSuccess("");
    setFormData(emptyForm);

    const requests=[
     axios.get("/api/resource-categories"),
     axios.get("/api/states"),
     axios.get("/api/countries"),
     axios.get("/api/counties"),
     axios.get("/api/boroughs")
    ];

    if(isEdit){
     requests.push(axios.get(`/api/community-resources/${resourceId}`));
    }

    const [categoriesRes,statesRes,countriesRes,countiesRes,boroughsRes,resourceRes]=await Promise.all(requests);

    setCategories(toArray(categoriesRes.data));
    setStates(toArray(statesRes.data));
    setCountries(toArray(countriesRes.data));
    setCounties(toArray(countiesRes.data));
    setBoroughs(toArray(boroughsRes.data));

    if(resourceRes?.data){
     setFormData(normalizeResource(resourceRes.data));
    }else{
     setFormData(emptyForm);
    }
   }catch(err){
    console.error(err);
    setError(err?.response?.data?.message||"Unable to load form data.");
   }finally{
    setLoading(false);
   }
  };

  loadData();
 },[resourceId,isEdit]);

 const topLevelCategories=useMemo(()=>{
  return categories.filter(item=>!item?.parentCategory);
 },[categories]);

 const childCategories=useMemo(()=>{
  return categories.filter(item=>{
   const parentId=getId(item?.parentCategory);
   return parentId&&parentId===formData.category;
  });
 },[categories,formData.category]);

 const handleChange=(e)=>{
  const {name,value,type,checked}=e.target;
  setFormData(prev=>({...prev,[name]:type==="checkbox"?checked:value}));
 };

 const handleAddressChange=(e)=>{
  const {name,value}=e.target;
  setFormData(prev=>({...prev,address:{...prev.address,[name]:value}}));
 };

 const handleContactChange=(e)=>{
  const {name,value}=e.target;
  setFormData(prev=>({...prev,contact:{...prev.contact,[name]:value}}));
 };

 const handleCategoryChange=(e)=>{
  const value=e.target.value;
  setFormData(prev=>({...prev,category:value,subcategories:[]}));
 };

 const handleSubcategoriesChange=(e)=>{
  const values=Array.from(e.target.selectedOptions).map(option=>option.value);
  setFormData(prev=>({...prev,subcategories:values}));
 };

 const handleScheduleChange=(index,field,value)=>{
  setFormData(prev=>{
   const next=[...prev.schedule];
   next[index]={...next[index],[field]:value};
   return{...prev,schedule:next};
  });
 };

 const addScheduleRow=()=>{
  setFormData(prev=>({...prev,schedule:[...prev.schedule,{...emptyScheduleItem}]}));
 };

 const removeScheduleRow=(index)=>{
  setFormData(prev=>{
   const next=prev.schedule.filter((_,i)=>i!==index);
   return{...prev,schedule:next.length?next:[{...emptyScheduleItem}]};
  });
 };

 const addListValue=(field,inputValue,setter)=>{
  const value=inputValue.trim();
  if(!value)return;
  setFormData(prev=>({...prev,[field]:[...prev[field],value]}));
  setter("");
 };

 const removeListValue=(field,index)=>{
  setFormData(prev=>({...prev,[field]:prev[field].filter((_,i)=>i!==index)}));
 };

 const addTransportationValue=(field,inputValue,setter)=>{
  const value=inputValue.trim();
  if(!value)return;
  setFormData(prev=>({...prev,transportation:{...prev.transportation,[field]:[...prev.transportation[field],value]}}));
  setter("");
 };

 const removeTransportationValue=(field,index)=>{
  setFormData(prev=>({...prev,transportation:{...prev.transportation,[field]:prev.transportation[field].filter((_,i)=>i!==index)}}));
 };

 const handleSubmit=async(e)=>{
  e.preventDefault();

  try{
   setSaving(true);
   setError("");
   setSuccess("");

   const payload={
    ...formData,
    services:formData.services.filter(Boolean),
    subcategories:formData.subcategories.filter(Boolean),
    transportation:{
     trains:formData.transportation.trains.filter(Boolean),
     buses:formData.transportation.buses.filter(Boolean)
    },
    schedule:formData.schedule.filter(item=>{
     return item.dayLabel||item.startTime||item.endTime||item.timeText||item.notes;
    }),
    address:{
     ...formData.address,
     state:formData.address.state||null,
     country:formData.address.country||null,
     county:formData.address.county||null,
     borough:formData.address.borough||null
    }
   };

   if(isEdit){
    const res=await axios.put(`/api/community-resources/${resourceId}`,payload);
    setSuccess("Community resource updated successfully.");
    if(embedded&&onSaved){
     onSaved(res?.data);
     return;
    }
   }else{
    const res=await axios.post("/api/community-resources",payload);
    setSuccess("Community resource created successfully.");
    if(embedded&&onSaved){
     onSaved(res?.data);
     return;
    }
    if(res?.data?._id){
     navigate(`/forms/resources/${res.data._id}/edit`);
     return;
    }
   }
  }catch(err){
   console.error(err);
   setError(err?.response?.data?.message||"Unable to save community resource.");
  }finally{
   setSaving(false);
  }
 };

 if(loading){
  return(
   <Container fluid={embedded} className={embedded?"py-2 px-1":"py-4"}>
    <div className="text-center py-5">
     <Spinner animation="border"/>
    </div>
   </Container>
  );
 }

 return(
  <Container fluid={embedded} className={embedded?"py-2 px-1":"py-4"}>
   {!embedded?(
    <Row className="mb-4">
     <Col>
      <h1 className="mb-2">{isEdit?"Edit Community Resource":"New Community Resource"}</h1>
      <p className="text-muted mb-0">Enter or update community resource details.</p>
     </Col>
    </Row>
   ):null}

   {error?<Alert variant="danger" onClose={()=>setError("")}>{error}</Alert>:null}
   {success&&!embedded?<Alert variant="success">{success}</Alert>:null}

   <Form onSubmit={handleSubmit}>
    <Card className="mb-4 shadow-sm">
     <Card.Header>Basic Information</Card.Header>
     <Card.Body>
      <Row className="g-3">
       <Col md={6}>
        <Form.Group>
         <Form.Label>Name</Form.Label>
         <Form.Control name="name" value={formData.name} onChange={handleChange} required/>
        </Form.Group>
       </Col>
       <Col md={6}>
        <Form.Group>
         <Form.Label>Organization</Form.Label>
         <Form.Control name="organization" value={formData.organization} onChange={handleChange}/>
        </Form.Group>
       </Col>
       <Col md={6}>
        <Form.Group>
         <Form.Label>Category</Form.Label>
         <Form.Select name="category" value={formData.category} onChange={handleCategoryChange}>
          <option value="">Select category</option>
          {topLevelCategories.map(item=>(
           <option key={getId(item)} value={getId(item)}>{getLabel(item)}</option>
          ))}
         </Form.Select>
        </Form.Group>
       </Col>
       <Col md={6}>
        <Form.Group>
         <Form.Label>Subcategories</Form.Label>
         <Form.Select multiple value={formData.subcategories} onChange={handleSubcategoriesChange}>
          {childCategories.map(item=>(
           <option key={getId(item)} value={getId(item)}>{getLabel(item)}</option>
          ))}
         </Form.Select>
        </Form.Group>
       </Col>
       <Col md={12}>
        <Form.Group>
         <Form.Label>Description</Form.Label>
         <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange}/>
        </Form.Group>
       </Col>
       <Col md={4}>
        <Form.Group>
         <Form.Label>Eligibility</Form.Label>
         <Form.Control name="eligibility" value={formData.eligibility} onChange={handleChange}/>
        </Form.Group>
       </Col>
       <Col md={4}>
        <Form.Group>
         <Form.Label>Requirements</Form.Label>
         <Form.Control name="requirements" value={formData.requirements} onChange={handleChange}/>
        </Form.Group>
       </Col>
       <Col md={4}>
        <Form.Group>
         <Form.Label>Intake Instructions</Form.Label>
         <Form.Control name="intakeInstructions" value={formData.intakeInstructions} onChange={handleChange}/>
        </Form.Group>
       </Col>
      </Row>
     </Card.Body>
    </Card>

    <Card className="mb-4 shadow-sm">
     <Card.Header>Services</Card.Header>
     <Card.Body>
      <Row className="g-3 align-items-end">
       <Col md={10}>
        <Form.Group>
         <Form.Label>Add Service</Form.Label>
         <Form.Control value={serviceInput} onChange={(e)=>setServiceInput(e.target.value)} placeholder="Enter a service"/>
        </Form.Group>
       </Col>
       <Col md={2}>
        <Button type="button" variant="secondary" className="w-100" onClick={()=>addListValue("services",serviceInput,setServiceInput)}>Add</Button>
       </Col>
       <Col md={12}>
        <div className="d-flex flex-wrap gap-2">
         {formData.services.map((item,index)=>(
          <span key={`${item}-${index}`} className="badge bg-secondary px-3 py-2">
           {item}
           <button type="button" className="btn btn-link text-white text-decoration-none p-0 ms-2 border-0 shadow-none" onClick={()=>removeListValue("services",index)}>×</button>
          </span>
         ))}
        </div>
       </Col>
      </Row>
     </Card.Body>
    </Card>

    <Card className="mb-4 shadow-sm">
     <Card.Header>Address</Card.Header>
     <Card.Body>
      <Row className="g-3">
       <Col md={6}>
        <Form.Group>
         <Form.Label>Address 1</Form.Label>
         <Form.Control name="address1" value={formData.address.address1} onChange={handleAddressChange}/>
        </Form.Group>
       </Col>
       <Col md={6}>
        <Form.Group>
         <Form.Label>Address 2</Form.Label>
         <Form.Control name="address2" value={formData.address.address2} onChange={handleAddressChange}/>
        </Form.Group>
       </Col>
       <Col md={3}>
        <Form.Group>
         <Form.Label>City</Form.Label>
         <Form.Control name="city" value={formData.address.city} onChange={handleAddressChange}/>
        </Form.Group>
       </Col>
       <Col md={3}>
        <Form.Group>
         <Form.Label>State</Form.Label>
         <Form.Select name="state" value={formData.address.state} onChange={handleAddressChange}>
          <option value="">Select state</option>
          {states.map(item=>(
           <option key={getId(item)} value={getId(item)}>{getLabel(item)}</option>
          ))}
         </Form.Select>
        </Form.Group>
       </Col>
       <Col md={3}>
        <Form.Group>
         <Form.Label>Country</Form.Label>
         <Form.Select name="country" value={formData.address.country} onChange={handleAddressChange}>
          <option value="">Select country</option>
          {countries.map(item=>(
           <option key={getId(item)} value={getId(item)}>{getLabel(item)}</option>
          ))}
         </Form.Select>
        </Form.Group>
       </Col>
       <Col md={3}>
        <Form.Group>
         <Form.Label>County</Form.Label>
         <Form.Select name="county" value={formData.address.county} onChange={handleAddressChange}>
          <option value="">Select county</option>
          {counties.map(item=>(
           <option key={getId(item)} value={getId(item)}>{getLabel(item)}</option>
          ))}
         </Form.Select>
        </Form.Group>
       </Col>
       <Col md={4}>
        <Form.Group>
         <Form.Label>Borough</Form.Label>
         <Form.Select name="borough" value={formData.address.borough} onChange={handleAddressChange}>
          <option value="">Select borough</option>
          {boroughs.map(item=>(
           <option key={getId(item)} value={getId(item)}>{getLabel(item)}</option>
          ))}
         </Form.Select>
        </Form.Group>
       </Col>
       <Col md={4}>
        <Form.Group>
         <Form.Label>Postal Code</Form.Label>
         <Form.Control name="postalCode" value={formData.address.postalCode} onChange={handleAddressChange}/>
        </Form.Group>
       </Col>
       <Col md={4}>
        <Form.Group>
         <Form.Label>Cross Streets</Form.Label>
         <Form.Control name="crossStreets" value={formData.address.crossStreets} onChange={handleAddressChange}/>
        </Form.Group>
       </Col>
       <Col md={12}>
        <Form.Group>
         <Form.Label>Full Text</Form.Label>
         <Form.Control name="fullText" value={formData.address.fullText} onChange={handleAddressChange}/>
        </Form.Group>
       </Col>
      </Row>
     </Card.Body>
    </Card>

    <Card className="mb-4 shadow-sm">
     <Card.Header>Transportation</Card.Header>
     <Card.Body>
      <Row className="g-3 align-items-end">
       <Col md={5}>
        <Form.Group>
         <Form.Label>Add Train</Form.Label>
         <Form.Control value={trainInput} onChange={(e)=>setTrainInput(e.target.value)} placeholder="A,C,E"/>
        </Form.Group>
       </Col>
       <Col md={1}>
        <Button type="button" variant="primary" className="w-100" onClick={()=>addTransportationValue("trains",trainInput,setTrainInput)}>Add</Button>
       </Col>
       <Col md={6}>
        <div className="d-flex flex-wrap gap-2">
         {formData.transportation.trains.map((item,index)=>(
          <span key={`${item}-${index}`} className="badge bg-primary px-3 py-2">
           {item}
           <button type="button" className="btn btn-link text-white text-decoration-none p-0 ms-2 border-0 shadow-none" onClick={()=>removeTransportationValue("trains",index)}>×</button>
          </span>
         ))}
        </div>
       </Col>
       <Col md={5}>
        <Form.Group>
         <Form.Label>Add Bus</Form.Label>
         <Form.Control value={busInput} onChange={(e)=>setBusInput(e.target.value)} placeholder="M15"/>
        </Form.Group>
       </Col>
       <Col md={1}>
        <Button type="button" variant="success" className="w-100" onClick={()=>addTransportationValue("buses",busInput,setBusInput)}>Add</Button>
       </Col>
       <Col md={6}>
        <div className="d-flex flex-wrap gap-2">
         {formData.transportation.buses.map((item,index)=>(
          <span key={`${item}-${index}`} className="badge bg-success px-3 py-2">
           {item}
           <button type="button" className="btn btn-link text-white text-decoration-none p-0 ms-2 border-0 shadow-none" onClick={()=>removeTransportationValue("buses",index)}>×</button>
          </span>
         ))}
        </div>
       </Col>
      </Row>
     </Card.Body>
    </Card>

    <Card className="mb-4 shadow-sm">
     <Card.Header>Contact</Card.Header>
     <Card.Body>
      <Row className="g-3">
       <Col md={4}>
        <Form.Group>
         <Form.Label>Phone</Form.Label>
         <Form.Control name="phone" value={formData.contact.phone} onChange={handleContactChange}/>
        </Form.Group>
       </Col>
       <Col md={4}>
        <Form.Group>
         <Form.Label>Email</Form.Label>
         <Form.Control name="email" type="email" value={formData.contact.email} onChange={handleContactChange}/>
        </Form.Group>
       </Col>
       <Col md={4}>
        <Form.Group>
         <Form.Label>Website</Form.Label>
         <Form.Control name="website" value={formData.contact.website} onChange={handleContactChange}/>
        </Form.Group>
       </Col>
       <Col md={6}>
        <Form.Group>
         <Form.Label>Contact Name</Form.Label>
         <Form.Control name="contactName" value={formData.contact.contactName} onChange={handleContactChange}/>
        </Form.Group>
       </Col>
       <Col md={6}>
        <Form.Group>
         <Form.Label>Contact Notes</Form.Label>
         <Form.Control name="notes" value={formData.contact.notes} onChange={handleContactChange}/>
        </Form.Group>
       </Col>
      </Row>
     </Card.Body>
    </Card>

    <Card className="mb-4 shadow-sm">
     <Card.Header>Schedule</Card.Header>
     <Card.Body>
      {formData.schedule.map((item,index)=>(
       <Row className="g-3 mb-3 align-items-end" key={`schedule-${index}`}>
        <Col md={3}>
         <Form.Group>
          <Form.Label>Day Label</Form.Label>
          <Form.Control value={item.dayLabel} onChange={(e)=>handleScheduleChange(index,"dayLabel",e.target.value)}/>
         </Form.Group>
        </Col>
        <Col md={2}>
         <Form.Group>
          <Form.Label>Start Time</Form.Label>
          <Form.Control value={item.startTime} onChange={(e)=>handleScheduleChange(index,"startTime",e.target.value)}/>
         </Form.Group>
        </Col>
        <Col md={2}>
         <Form.Group>
          <Form.Label>End Time</Form.Label>
          <Form.Control value={item.endTime} onChange={(e)=>handleScheduleChange(index,"endTime",e.target.value)}/>
         </Form.Group>
        </Col>
        <Col md={2}>
         <Form.Group>
          <Form.Label>Time Text</Form.Label>
          <Form.Control value={item.timeText} onChange={(e)=>handleScheduleChange(index,"timeText",e.target.value)}/>
         </Form.Group>
        </Col>
        <Col md={2}>
         <Form.Group>
          <Form.Label>Notes</Form.Label>
          <Form.Control value={item.notes} onChange={(e)=>handleScheduleChange(index,"notes",e.target.value)}/>
         </Form.Group>
        </Col>
        <Col md={1}>
         <Button type="button" variant="outline-danger" className="w-100" onClick={()=>removeScheduleRow(index)}>×</Button>
        </Col>
       </Row>
      ))}
      <Button type="button" variant="outline-secondary" onClick={addScheduleRow}>Add Schedule Row</Button>
     </Card.Body>
    </Card>

    <Card className="mb-4 shadow-sm">
     <Card.Header>Flags and Source</Card.Header>
     <Card.Body>
      <Row className="g-3">
       <Col md={3}><Form.Check label="Walk-In" name="isWalkIn" checked={formData.isWalkIn} onChange={handleChange}/></Col>
       <Col md={3}><Form.Check label="Appointment Required" name="appointmentRequired" checked={formData.appointmentRequired} onChange={handleChange}/></Col>
       <Col md={3}><Form.Check label="ID Required" name="idRequired" checked={formData.idRequired} onChange={handleChange}/></Col>
       <Col md={3}><Form.Check label="24 Hours" name="is24Hours" checked={formData.is24Hours} onChange={handleChange}/></Col>
       <Col md={3}><Form.Check label="Family Friendly" name="isFamilyFriendly" checked={formData.isFamilyFriendly} onChange={handleChange}/></Col>
       <Col md={3}><Form.Check label="Women Only" name="isWomenOnly" checked={formData.isWomenOnly} onChange={handleChange}/></Col>
       <Col md={3}><Form.Check label="Men Only" name="isMenOnly" checked={formData.isMenOnly} onChange={handleChange}/></Col>
       <Col md={3}><Form.Check label="Youth Only" name="youthOnly" checked={formData.youthOnly} onChange={handleChange}/></Col>
       <Col md={3}><Form.Check label="Active" name="isActive" checked={formData.isActive} onChange={handleChange}/></Col>
       <Col md={4}>
        <Form.Group>
         <Form.Label>Source</Form.Label>
         <Form.Control name="source" value={formData.source} onChange={handleChange}/>
        </Form.Group>
       </Col>
       <Col md={4}>
        <Form.Group>
         <Form.Label>Source Date Label</Form.Label>
         <Form.Control name="sourceDateLabel" value={formData.sourceDateLabel} onChange={handleChange}/>
        </Form.Group>
       </Col>
       <Col md={4}>
        <Form.Group>
         <Form.Label>Notes</Form.Label>
         <Form.Control name="notes" value={formData.notes} onChange={handleChange}/>
        </Form.Group>
       </Col>
      </Row>
     </Card.Body>
    </Card>

    <div className="d-flex gap-2 justify-content-end">
     {embedded?(
      <Button type="button" variant="outline-secondary" onClick={onCancel}>Cancel</Button>
     ):(
      <Button type="button" variant="outline-secondary" onClick={()=>navigate(-1)}>Cancel</Button>
     )}
     <Button type="submit" variant="primary" disabled={saving}>
      {saving?(isEdit?"Updating...":"Saving..."):(isEdit?"Update Resource":"Create Resource")}
     </Button>
    </div>
   </Form>
  </Container>
 );
}

export default CommunityResourceForm;