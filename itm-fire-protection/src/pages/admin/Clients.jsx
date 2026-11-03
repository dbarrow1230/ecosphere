import {useState,useEffect} from "react";
import {Container,Row,Col,Card,Form,Button,Table,Badge,Alert} from "react-bootstrap";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";
import {itmFetch as fetch} from "../../utils/itmApi.js";
import ClientServiceLookup from "../../components/ClientServiceLookup.jsx";

function Clients(){

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
  propertyName:"",propertyType:"",siteContact:"",accessInstructions:"",
  status:"active"
 };

 const [clients,setClients]=useState([]);
 const [countries,setCountries]=useState([]);
 const [states,setStates]=useState([]);
 const [formData,setFormData]=useState(initialFormData);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [selectedClient,setSelectedClient]=useState(null);
 const [isEditing,setIsEditing]=useState(false);
 const [alert,setAlert]=useState({show:false,variant:"success",message:""});

 const normalizeStatus=value=>{
  const status=String(value||"").trim().toLowerCase();
  return status==="inactive"?"inactive":"active";
 };

 useEffect(()=>{
  const loadClients=async()=>{
   try{
    setLoading(true);
    const res=await fetch("/api/clients");
    if(!res.ok)throw new Error("Unable to load clients");
    const data=await res.json();
    const clientList=Array.isArray(data?.clients)?data.clients:Array.isArray(data?.data)?data.data:[];
    setClients(clientList);
   }catch(err){
    console.error("Error loading clients:",err);
    setClients([]);
    setAlert({show:true,variant:"danger",message:"Failed to load clients."});
   }finally{
    setLoading(false);
   }
  };

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

  loadClients();
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

 const resetForm=()=>{
  setFormData(initialFormData);
  setStates([]);
  setSelectedClient(null);
  setIsEditing(false);
 };

 const closeAlert=()=>{
  setAlert({show:false,variant:"success",message:""});
 };

 const handleViewClient=client=>{
  setSelectedClient(client);
  setIsEditing(false);
  closeAlert();
  window.scrollTo({top:0,behavior:"smooth"});
 };

 const handleEditClient=client=>{
  setSelectedClient(client);
  setFormData({
   name:client.name||"",
   firstName:client.firstName||"",
   lastName:client.lastName||"",
   company:client.company||"",
   email:client.email||"",
   phone:client.phone||"",
   altPhone:client.altPhone||"",
   address1:client.address1||"",
   address2:client.address2||"",
   city:client.city||"",
   state:client.state?._id||client.state||"",
   country:client.country?._id||client.country||"",
   postalCode:client.postalCode||"",
   notes:client.notes||"",
   propertyName:client.propertyName||"",propertyType:client.propertyType||"",siteContact:client.siteContact||"",accessInstructions:client.accessInstructions||"",
   status:normalizeStatus(client.status)
  });
  setIsEditing(true);
  closeAlert();
  window.scrollTo({top:0,behavior:"smooth"});
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

   const url=isEditing&&selectedClient?`/api/clients/${selectedClient._id}`:"/api/clients";
   const method=isEditing&&selectedClient?"PUT":"POST";

   const res=await fetch(url,{
    method,
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });

   const data=await res.json();
   const savedClient=data?.client||data?.data;

   if(res.ok&&savedClient){
    if(isEditing&&selectedClient){
     setClients(prev=>prev.map(client=>client._id===savedClient._id?savedClient:client));
     setSelectedClient(savedClient);
     setIsEditing(false);
     setAlert({show:true,variant:"success",message:"Client updated successfully."});
    }else{
     setClients(prev=>[savedClient,...prev]);
     resetForm();
     setAlert({show:true,variant:"success",message:"Client saved successfully."});
    }
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

 const statusVariant=status=>{
  const normalized=normalizeStatus(status);
  if(normalized==="active") return "success";
  if(normalized==="inactive") return "secondary";
  return "secondary";
 };

 const total=clients.length;
 const active=clients.filter(client=>normalizeStatus(client.status)==="active").length;
 const inactive=clients.filter(client=>normalizeStatus(client.status)==="inactive").length;

 return(
  <section className="clients-page py-4">
   <ClientServiceLookup/>
   <Container fluid="lg">

    <Row className="g-4 mb-4">
     <Col lg={8}>
      <div>
       <p className="text-muted mb-2">Client Management</p>
       <h1 className="mb-2">Clients</h1>
       <p className="text-muted mb-0">
        Manage client records, contact information, and client details.
       </p>
      </div>
     </Col>

     <Col lg={4}>
      <Card className="h-100">
       <Card.Body>
        <Row className="g-3 text-center">
         <Col xs={4}>
          <p className="text-muted mb-1">Total</p>
          <h3 className="mb-0">{total}</h3>
         </Col>
         <Col xs={4}>
          <p className="text-muted mb-1">Active</p>
          <h3 className="mb-0">{active}</h3>
         </Col>
         <Col xs={4}>
          <p className="text-muted mb-1">Inactive</p>
          <h3 className="mb-0">{inactive}</h3>
         </Col>
        </Row>
       </Card.Body>
      </Card>
     </Col>
    </Row>

    {alert.show&&(
     <Row className="mb-4">
      <Col lg={12}>
       <Alert variant={alert.variant} dismissible onClose={closeAlert} className="mb-0">
        {alert.message}
       </Alert>
      </Col>
     </Row>
    )}

    <Row className="g-4">

     <Col lg={4}>
      <Card>
       <Card.Body>

        {!selectedClient&&!isEditing&&(
         <>
          <h2 className="h4 mb-3">Add Client</h2>

          <Form onSubmit={handleSubmit}>
           <ClientSiteFields formData={formData} onChange={handleChange}/>

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
                <option key={country._id} value={country._id}>
                 {country.name}
                </option>
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
                <option key={state._id} value={state._id}>
                 {state.name}
                </option>
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

           <div className="d-grid">
            <Button variant="primary" type="submit" disabled={saving}>
             {saving?"Saving...":"Save Client"}
            </Button>
           </div>

          </Form>
         </>
        )}

        {selectedClient&&!isEditing&&(
         <>
          <div className="d-flex justify-content-between align-items-center mb-3">
           <h2 className="h4 mb-0">View Client</h2>
           <div className="d-flex gap-2">
            <Button variant="outline-secondary" size="sm" onClick={resetForm}>
             Close
            </Button>
            <Button variant="primary" size="sm" onClick={()=>handleEditClient(selectedClient)}>
             Edit Client
            </Button>
           </div>
          </div>

          <div className="mb-3">
           <strong>Name</strong>
           <div>{selectedClient.name||"-"}</div>
          </div>

          <Row>
           <Col md={6}>
            <div className="mb-3">
             <strong>First Name</strong>
             <div>{selectedClient.firstName||"-"}</div>
            </div>
           </Col>

           <Col md={6}>
            <div className="mb-3">
             <strong>Last Name</strong>
             <div>{selectedClient.lastName||"-"}</div>
            </div>
           </Col>
          </Row>

          <div className="mb-3">
           <strong>Company</strong>
           <div>{selectedClient.company||"-"}</div>
          </div>

          <div className="mb-3">
           <strong>Email</strong>
           <div>{selectedClient.email||"-"}</div>
          </div>

          <Row>
           <Col md={6}>
            <div className="mb-3">
             <strong>Phone</strong>
             <div>{selectedClient.phone||"-"}</div>
            </div>
           </Col>

           <Col md={6}>
            <div className="mb-3">
             <strong>Alt Phone</strong>
             <div>{selectedClient.altPhone||"-"}</div>
            </div>
           </Col>
          </Row>

          <div className="mb-3">
           <strong>Address 1</strong>
           <div>{selectedClient.address1||"-"}</div>
          </div>

          <div className="mb-3">
           <strong>Address 2</strong>
           <div>{selectedClient.address2||"-"}</div>
          </div>

          <Row>
           <Col md={4}>
            <div className="mb-3">
             <strong>City</strong>
             <div>{selectedClient.city||"-"}</div>
            </div>
           </Col>

           <Col md={4}>
            <div className="mb-3">
             <strong>Country</strong>
             <div>{selectedClient.country?.name||"-"}</div>
            </div>
           </Col>

           <Col md={4}>
            <div className="mb-3">
             <strong>State</strong>
             <div>{selectedClient.state?.name||"-"}</div>
            </div>
           </Col>
          </Row>

          <Row>
           <Col md={6}>
            <div className="mb-3">
             <strong>Postal Code</strong>
             <div>{selectedClient.postalCode||"-"}</div>
            </div>
           </Col>

           <Col md={6}>
            <div className="mb-3">
             <strong>Status</strong>
             <div>
              <Badge bg={statusVariant(selectedClient.status)}>
               {normalizeStatus(selectedClient.status)}
              </Badge>
             </div>
            </div>
           </Col>
          </Row>

          <div className="mb-0">
           <strong>Notes</strong>
           <div>{selectedClient.notes||"-"}</div>
          </div>
         </>
        )}

        {isEditing&&selectedClient&&(
         <>
          <div className="d-flex justify-content-between align-items-center mb-3">
           <h2 className="h4 mb-0">Edit Client</h2>
           <div className="d-flex gap-2">
            <Button variant="outline-secondary" size="sm" onClick={()=>setIsEditing(false)}>
             Cancel
            </Button>
           </div>
          </div>

          <Form onSubmit={handleSubmit}>
           <ClientSiteFields formData={formData} onChange={handleChange}/>

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
                <option key={country._id} value={country._id}>
                 {country.name}
                </option>
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
                <option key={state._id} value={state._id}>
                 {state.name}
                </option>
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

           <div className="d-grid">
            <Button variant="primary" type="submit" disabled={saving}>
             {saving?"Saving...":"Update Client"}
            </Button>
           </div>

          </Form>
         </>
        )}

       </Card.Body>
      </Card>
     </Col>

     <Col lg={8}>
      <Card className="h-100">
       <Card.Body>

        <div className="d-flex justify-content-between align-items-center mb-3">
         <div>
          <h2 className="h4 mb-1">Client Directory</h2>
          <p className="text-muted mb-0">
           View clients and track their contact details.
          </p>
         </div>
        </div>

        <div className="table-responsive">

         <Table hover className="align-middle mb-0">

          <thead>
           <tr>
            <th>Name</th>
            <th>First</th>
            <th>Last</th>
            <th>Company</th>
            <th>Email</th>
            <th>Phone</th>
            <th>City</th>
            <th>Status</th>
           </tr>
          </thead>

          <tbody>
           {loading&&(
            <tr>
             <td colSpan="8" className="text-center text-muted py-4">Loading clients...</td>
            </tr>
           )}

           {!loading&&clients.length===0&&(
            <tr>
             <td colSpan="8" className="text-center text-muted py-4">No clients found.</td>
            </tr>
           )}

           {!loading&&clients.map(client=>(
            <tr key={client._id} onClick={()=>handleViewClient(client)} style={{cursor:"pointer"}} className={selectedClient?._id===client._id?"table-active":""}>
             <td>{client.name}</td>
             <td>{client.firstName}</td>
             <td>{client.lastName}</td>
             <td>{client.company||"-"}</td>
             <td>{client.email}</td>
             <td>{client.phone}</td>
             <td>{client.city||"-"}</td>
             <td>
              <Badge bg={statusVariant(client.status)}>
               {normalizeStatus(client.status)}
              </Badge>
             </td>
            </tr>
           ))}
          </tbody>

         </Table>

        </div>

       </Card.Body>
      </Card>
     </Col>

    </Row>

   </Container>
  </section>
 );
}

export default Clients;
function ClientSiteFields({formData,onChange}){
 return <>{Object.entries({propertyName:"Property name",propertyType:"Property type",siteContact:"Site contact",accessInstructions:"Access instructions"}).map(([name,label])=><Form.Group key={name} controlId={`client-${name}`} className="mb-3"><Form.Label>{label}</Form.Label><Form.Control name={name} value={formData[name]||""} onChange={onChange}/></Form.Group>)}</>;
}
