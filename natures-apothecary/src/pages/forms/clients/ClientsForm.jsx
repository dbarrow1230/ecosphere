// src/pages/forms/clients/ClientsForm.jsx
import {useState,useEffect} from "react";
import {Form,Row,Col,Button} from "react-bootstrap";
import Alert from "../../../components/PopupAlert.jsx";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";

function ClientsForm({
 selectedClient=null,
 onSaved=()=>{},
 onCancel=()=>{}
}){

 const initialFormData={
  name:"",
  firstName:"",
  lastName:"",
  company:"",
  email:"",
  phone:"",
  altPhone:"",
  address1:"",
  address2:"",
  city:"",
  state:"",
  country:"",
  postalCode:"",
  notes:"",
  status:"active"
 };

 const [countries,setCountries]=useState([]);
 const [states,setStates]=useState([]);
 const [saving,setSaving]=useState(false);
 const [alert,setAlert]=useState({show:false,variant:"success",message:""});
 const [formData,setFormData]=useState(initialFormData);

 const normalizeStatus=value=>{
  const status=String(value||"").trim().toLowerCase();
  return status==="inactive"?"inactive":"active";
 };

 useEffect(()=>{
  if(selectedClient){
   setFormData({
    name:selectedClient.name||"",
    firstName:selectedClient.firstName||"",
    lastName:selectedClient.lastName||"",
    company:selectedClient.company||"",
    email:selectedClient.email||"",
    phone:selectedClient.phone||"",
    altPhone:selectedClient.altPhone||"",
    address1:selectedClient.address1||"",
    address2:selectedClient.address2||"",
    city:selectedClient.city||"",
    state:selectedClient.state?._id||selectedClient.state||"",
    country:selectedClient.country?._id||selectedClient.country||"",
    postalCode:selectedClient.postalCode||"",
    notes:selectedClient.notes||"",
    status:normalizeStatus(selectedClient.status)
   });
  }else{
   setFormData(initialFormData);
  }
 },[selectedClient]);

 useEffect(()=>{
  const loadCountries=async()=>{
   try{
    const res=await fetch("/api/countries");
    const data=await res.json();
    const countryList=Array.isArray(data)?data:Array.isArray(data?.countries)?data.countries:Array.isArray(data?.data)?data.data:[];
    setCountries(countryList);
   }catch(err){
    console.error("Error loading countries:",err);
    setCountries([]);
   }
  };

  loadCountries();
 },[]);

 useEffect(()=>{
  const loadStates=async()=>{
   if(!formData.country){
    setStates([]);
    return;
   }

   try{
    const res=await fetch(`/api/states?country=${formData.country}`);
    const data=await res.json();
    const stateList=Array.isArray(data)?data:Array.isArray(data?.states)?data.states:Array.isArray(data?.data)?data.data:[];
    setStates(stateList);
   }catch(err){
    console.error("Error loading states:",err);
    setStates([]);
   }
  };

  loadStates();
 },[formData.country]);

 const handleChange=e=>{
  const {name,value}=e.target;

  if(name==="country"){
   setFormData(prev=>({...prev,country:value,state:""}));
   return;
  }

  if(name==="status"){
   setFormData(prev=>({...prev,status:normalizeStatus(value)}));
   return;
  }

  setFormData(prev=>({...prev,[name]:value}));
 };

 const handlePhoneChange=(name,value)=>{
  setFormData(prev=>({...prev,[name]:value}));
 };

 const closeAlert=()=>{
  setAlert({show:false,variant:"success",message:""});
 };

 const resetForm=()=>{
  setFormData(initialFormData);
  setStates([]);
 };

 const handleSubmit=async e=>{
  e.preventDefault();

  try{
   setSaving(true);
   closeAlert();

   const payload={
    ...formData,
    status:normalizeStatus(formData.status),
    state:formData.state||null,
    country:formData.country||null
   };

   const url=selectedClient?`/api/clients/${selectedClient._id}`:"/api/clients";
   const method=selectedClient?"PUT":"POST";

   const res=await fetch(url,{
    method,
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });

   const data=await res.json();
   const savedClient=data?.client||data?.data;

   if(res.ok&&savedClient){
    setAlert({show:true,variant:"success",message:selectedClient?"Client updated successfully.":"Client saved successfully."});
    if(!selectedClient){
     resetForm();
    }
    onSaved(savedClient);
   }else{
    setAlert({show:true,variant:"danger",message:data?.message||"Failed to save client."});
   }
  }catch(err){
   console.error("Error saving client:",err);
   setAlert({show:true,variant:"danger",message:"Error saving client."});
  }finally{
   setSaving(false);
  }
 };

 return(
  <>
   {alert.show&&(
    <Alert variant={alert.variant} dismissible onClose={closeAlert} className="mb-3">
     {alert.message}
    </Alert>
   )}

   <Form onSubmit={handleSubmit}>

    <Form.Group className="mb-3" controlId="name">
     <Form.Label>Name</Form.Label>
     <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full name" required/>
    </Form.Group>

    <Row>
     <Col md={6}>
      <Form.Group className="mb-3" controlId="firstName">
       <Form.Label>First Name</Form.Label>
       <Form.Control type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First name" required/>
      </Form.Group>
     </Col>

     <Col md={6}>
      <Form.Group className="mb-3" controlId="lastName">
       <Form.Label>Last Name</Form.Label>
       <Form.Control type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last name" required/>
      </Form.Group>
     </Col>
    </Row>

    <Form.Group className="mb-3" controlId="company">
     <Form.Label>Company</Form.Label>
     <Form.Control type="text" name="company" value={formData.company} onChange={handleChange} placeholder="Company name"/>
    </Form.Group>

    <Form.Group className="mb-3" controlId="email">
     <Form.Label>Email</Form.Label>
     <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email address" required/>
    </Form.Group>

    <Row>
     <Col md={6}>
      <Form.Group className="mb-3" controlId="phone">
       <Form.Label>Phone</Form.Label>
       <PhoneInput
        country={"us"}
        value={formData.phone}
        onChange={value=>handlePhoneChange("phone",value)}
        inputProps={{name:"phone",required:true}}
        inputClass="form-control w-100"
        containerClass="w-100"
        buttonClass=""
        dropdownClass=""
        enableSearch
       />
      </Form.Group>
     </Col>

     <Col md={6}>
      <Form.Group className="mb-3" controlId="altPhone">
       <Form.Label>Alt Phone</Form.Label>
       <PhoneInput
        country={"us"}
        value={formData.altPhone}
        onChange={value=>handlePhoneChange("altPhone",value)}
        inputProps={{name:"altPhone"}}
        inputClass="form-control w-100"
        containerClass="w-100"
        buttonClass=""
        dropdownClass=""
        enableSearch
       />
      </Form.Group>
     </Col>
    </Row>

    <Form.Group className="mb-3" controlId="address1">
     <Form.Label>Address 1</Form.Label>
     <Form.Control type="text" name="address1" value={formData.address1} onChange={handleChange} placeholder="Address line 1"/>
    </Form.Group>

    <Form.Group className="mb-3" controlId="address2">
     <Form.Label>Address 2</Form.Label>
     <Form.Control type="text" name="address2" value={formData.address2} onChange={handleChange} placeholder="Address line 2"/>
    </Form.Group>

    <Row>
     <Col md={4}>
      <Form.Group className="mb-3" controlId="city">
       <Form.Label>City</Form.Label>
       <Form.Control type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City"/>
      </Form.Group>
     </Col>

     <Col md={4}>
      <Form.Group className="mb-3" controlId="country">
       <Form.Label>Country</Form.Label>
       <Form.Select name="country" value={formData.country} onChange={handleChange}>
        <option value="">Select country</option>
        {Array.isArray(countries)&&countries.map(country=>(
         <option key={country._id} value={country._id}>{country.name}</option>
        ))}
       </Form.Select>
      </Form.Group>
     </Col>

     <Col md={4}>
      <Form.Group className="mb-3" controlId="state">
       <Form.Label>State</Form.Label>
       <Form.Select name="state" value={formData.state} onChange={handleChange} disabled={!formData.country}>
        <option value="">Select state</option>
        {Array.isArray(states)&&states.map(state=>(
         <option key={state._id} value={state._id}>{state.name}</option>
        ))}
       </Form.Select>
      </Form.Group>
     </Col>
    </Row>

    <Row>
     <Col md={6}>
      <Form.Group className="mb-3" controlId="postalCode">
       <Form.Label>Postal Code</Form.Label>
       <Form.Control type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="Postal code"/>
      </Form.Group>
     </Col>

     <Col md={6}>
      <Form.Group className="mb-3" controlId="status">
       <Form.Label>Status</Form.Label>
       <Form.Select name="status" value={normalizeStatus(formData.status)} onChange={handleChange}>
        <option value="active">active</option>
        <option value="inactive">inactive</option>
       </Form.Select>
      </Form.Group>
     </Col>
    </Row>

    <Form.Group className="mb-4" controlId="notes">
     <Form.Label>Notes</Form.Label>
     <Form.Control as="textarea" rows={4} name="notes" value={formData.notes} onChange={handleChange} placeholder="Client notes"/>
    </Form.Group>

    <div className="d-flex gap-2 justify-content-end">
     <Button variant="outline-secondary" type="button" onClick={onCancel}>
      Cancel
     </Button>
     <Button variant="primary" type="submit" disabled={saving}>
      {saving?selectedClient?"Updating...":"Saving...":selectedClient?"Update Client":"Save Client"}
     </Button>
    </div>

   </Form>
  </>
 );
}

export default ClientsForm;