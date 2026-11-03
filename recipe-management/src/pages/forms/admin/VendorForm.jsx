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
 onCancel,
 fixedBusiness,
 loading=false,
 businesses=[]
}){
 const [formData,setFormData]=useState(defaultFormData);
 const [activeTab,setActiveTab]=useState("general");
 const [vendorCategories,setVendorCategories]=useState([]);


 useEffect(()=>{
  setFormData({
   ...defaultFormData,
   ...initialData,
   business_id:initialData._id&&getId(initialData.business_id)?getId(initialData.business_id):getId(fixedBusiness)||getId(initialData?.business_id)
  });
 },[initialData,fixedBusiness?._id]);
 useEffect(()=>{let active=true;fetch("/api/vendor-categories").then(response=>response.json()).then(data=>{if(active)setVendorCategories(Array.isArray(data)?data:data.data||[]);}).catch(()=>{});return()=>{active=false;};},[]);

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
          <Form.Control plaintext readOnly value={businesses.find(item=>getId(item)===formData.business_id)?.legalName||(getId(fixedBusiness)===formData.business_id?(fixedBusiness?.legalName||fixedBusiness?.name):"")||"Recipe Management"}/>
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
         <Form.Label column md={4}>Vendor Type</Form.Label>
         <Col md={8}>
          <SortedSelect name="vendorCategory" value={formData.vendorCategory} onChange={handleChange} options={vendorCategories} getValue={item=>item.name} getLabel={item=>item.name} placeholder="Select vendor type"/>
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

       <Col md={6}><Form.Group as={Row} className="mb-3"><Form.Label column md={4} htmlFor="vendor-rating">Rating (0–5)</Form.Label><Col md={8}><Form.Control id="vendor-rating" name="rating" type="number" min="0" max="5" step="0.1" value={formData.performance?.rating??""} disabled={loading} onChange={event=>setFormData(current=>({...current,performance:{...current.performance,rating:event.target.value===""?null:Number(event.target.value)}}))}/></Col></Form.Group></Col>
       {[["onTimeRate","On Time (%)"],["fillRate","Fill Rate (%)"]].map(([key,label])=><Col md={6} key={key}><Form.Group as={Row} className="mb-3"><Form.Label column md={4} htmlFor={"vendor-"+key}>{label}</Form.Label><Col md={8}><Form.Control id={"vendor-"+key} type="number" min="0" max="100" step="0.1" value={formData.performance?.[key]??""} disabled={loading} onChange={event=>setFormData(current=>({...current,performance:{...current.performance,[key]:event.target.value===""?null:Number(event.target.value)}}))}/></Col></Form.Group></Col>)}
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

       {[{key:"orderingEmail",label:"Order Email",type:"email"},{key:"leadTimeDays",label:"Lead Time (days)",type:"number"},{key:"minimumOrderValue",label:"Minimum Order",type:"number"}].map(field=><Col md={12} key={field.key}><Form.Group as={Row} className="mb-3"><Form.Label column md={3}>{field.label}</Form.Label><Col md={9}><Form.Control type={field.type} min={field.type==="number"?0:undefined} step={field.type==="number"?"any":undefined} value={formData.ordering?.[field.key]??""} onChange={event=>setFormData(current=>({...current,ordering:{...current.ordering,[field.key]:field.type==="number"&&event.target.value!==""?Number(event.target.value):event.target.value}}))}/></Col></Form.Group></Col>)}
      </Row>

     </Card.Body></Card>
    </Tab>

    {/* FLAGS */}
    <Tab eventKey="flags" title="Flags">
     <Card><Card.Body>
      <Row>

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

   <div className="d-flex justify-content-end gap-2">
    {onCancel?<Button type="button" variant="outline-primary" disabled={loading} onClick={onCancel}>Cancel</Button>:null}
    <Button type="submit" disabled={loading}>
     {loading?"Saving...":"Save Vendor"}
    </Button>
   </div>
  </Form>
 );
}
