//src/pages/forms/admin/vendorForm.jsx
import {useEffect,useState} from "react";
import {Form,Row,Col,Button,Card,Tabs,Tab} from "react-bootstrap";
import SortedSelect from "../../../components/SortedSelect.jsx";

const defaultFormData={
 business_id:"",
 legalName:"",
 code:"",
 dbaName:"",
 vendorCategory:"",
 website:"",
 logo:"",
 email:"",
 phone:"",
 fax:"",
 contacts:[],
 addresses:[],
 payment:{},
 ordering:{},
 performance:{},
 compliance:{},
 supportsIngredients:false,
 isPreferred:false,
 isActive:true,
 notes:""
};

const getId=v=>{
 if(!v)return "";
 if(typeof v==="string")return v;
 if(typeof v==="object")return String(v?._id||"");
 return "";
};

const getBusinessLabel=business=>business?.legalName||business?.name||business?.code||"";

export default function VendorForm({
 initialData={},
 onSubmit,
 loading=false,
 businesses=[]
}){
 const [formData,setFormData]=useState(defaultFormData);
 const [activeTab,setActiveTab]=useState("general");

 useEffect(()=>{
  setFormData({
   ...defaultFormData,
   ...initialData,
   business_id:getId(initialData?.business_id)
  });
 },[initialData]);

 const handleChange=e=>{
  const {name,value,type,checked}=e.target;
  setFormData(prev=>({
   ...prev,
   [name]:type==="checkbox"?checked:value
  }));
 };

 const handleSubmit=e=>{
  e.preventDefault();
  onSubmit&&onSubmit({
   ...formData,
   business_id:getId(formData.business_id)||null
  });
 };

 return(
  <Form onSubmit={handleSubmit}>
   <Tabs activeKey={activeTab} onSelect={k=>setActiveTab(k)} className="mb-3">

    {/* GENERAL */}
    <Tab eventKey="general" title="General">
     <Card><Card.Body>

      <Row>

       <Col md={12}>
        <Form.Group as={Row} className="mb-3">
         <Form.Label column md={2}>Business</Form.Label>
         <Col md={10}>
          <SortedSelect
           name="business_id"
           value={formData.business_id}
           onChange={handleChange}
           required
           options={businesses}
           getValue={getId}
           getLabel={getBusinessLabel}
           placeholder="Select"
          />
         </Col>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group as={Row} className="mb-3">
         <Form.Label column md={4}>Legal Name</Form.Label>
         <Col md={8}>
          <Form.Control name="legalName" value={formData.legalName} onChange={handleChange} required/>
         </Col>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group as={Row} className="mb-3">
         <Form.Label column md={4}>Code</Form.Label>
         <Col md={8}>
          <Form.Control name="code" value={formData.code} onChange={handleChange}/>
         </Col>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group as={Row} className="mb-3">
         <Form.Label column md={4}>DBA</Form.Label>
         <Col md={8}>
          <Form.Control name="dbaName" value={formData.dbaName} onChange={handleChange}/>
         </Col>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group as={Row} className="mb-3">
         <Form.Label column md={4}>Category</Form.Label>
         <Col md={8}>
          <Form.Control name="vendorCategory" value={formData.vendorCategory} onChange={handleChange}/>
         </Col>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group as={Row} className="mb-3">
         <Form.Label column md={4}>Email</Form.Label>
         <Col md={8}>
          <Form.Control name="email" value={formData.email} onChange={handleChange}/>
         </Col>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group as={Row} className="mb-3">
         <Form.Label column md={4}>Phone</Form.Label>
         <Col md={8}>
          <Form.Control name="phone" value={formData.phone} onChange={handleChange}/>
         </Col>
        </Form.Group>
       </Col>

      </Row>

     </Card.Body></Card>
    </Tab>

    {/* PAYMENT */}
    <Tab eventKey="payment" title="Payment">
     <Card><Card.Body>
      <Row>

       <Col md={6}>
        <Form.Group as={Row} className="mb-3">
         <Form.Label column md={5}>Terms</Form.Label>
         <Col md={7}>
          <Form.Control
           value={formData.payment?.paymentTerms||""}
           onChange={e=>setFormData(p=>({...p,payment:{...p.payment,paymentTerms:e.target.value}}))}
          />
         </Col>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group as={Row} className="mb-3">
         <Form.Label column md={5}>Method</Form.Label>
         <Col md={7}>
          <Form.Control
           value={formData.payment?.preferredPaymentMethod||""}
           onChange={e=>setFormData(p=>({...p,payment:{...p.payment,preferredPaymentMethod:e.target.value}}))}
          />
         </Col>
        </Form.Group>
       </Col>

      </Row>
     </Card.Body></Card>
    </Tab>

    {/* ORDERING */}
    <Tab eventKey="ordering" title="Ordering">
     <Card><Card.Body>

      <Row>

       <Col md={12}>
        <Form.Group as={Row} className="mb-3">
         <Form.Label column md={3}>Portal</Form.Label>
         <Col md={9}>
          <Form.Control
           value={formData.ordering?.vendorPortalUrl||""}
           onChange={e=>setFormData(p=>({...p,ordering:{...p.ordering,vendorPortalUrl:e.target.value}}))}
          />
         </Col>
        </Form.Group>
       </Col>

      </Row>

     </Card.Body></Card>
    </Tab>

    {/* FLAGS */}
    <Tab eventKey="flags" title="Flags">
     <Card><Card.Body>
      <Row>

       <Col md={6}>
        <Form.Check type="switch" label="Supplies ingredients"
         checked={formData.supportsIngredients}
         onChange={e=>setFormData(p=>({...p,supportsIngredients:e.target.checked}))}/>
       </Col>

       <Col md={6}>
        <Form.Check type="switch" label="Preferred"
         checked={formData.isPreferred}
         onChange={e=>setFormData(p=>({...p,isPreferred:e.target.checked}))}/>
       </Col>

       <Col md={6}>
        <Form.Check type="switch" label="Active"
         checked={formData.isActive}
         onChange={e=>setFormData(p=>({...p,isActive:e.target.checked}))}/>
       </Col>

      </Row>
     </Card.Body></Card>
    </Tab>

   </Tabs>

   <div className="d-flex justify-content-end">
    <Button type="submit" disabled={loading}>
     {loading?"Saving...":"Save Vendor"}
    </Button>
   </div>
  </Form>
 );
}
