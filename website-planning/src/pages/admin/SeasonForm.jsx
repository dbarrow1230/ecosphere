//src/pages/forms/admin/seasonForm.jsx
import {useEffect,useState} from "react";
import {Form,Row,Col,Button,Card} from "react-bootstrap";

const defaultFormData={
 business_id:"",
 name:"",
 code:"",
 description:"",
 startDate:"",
 endDate:"",
 isRecurringAnnual:false,
 isDefault:false,
 isActive:true,
 notes:""
};

const getObjectId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 if(typeof value==="object")return String(value?._id||value?.id||"");
 return "";
};

const formatDateTimeLocal=value=>{
 if(!value)return "";
 const date=new Date(value);
 if(Number.isNaN(date.getTime()))return "";
 const y=date.getFullYear();
 const m=String(date.getMonth()+1).padStart(2,"0");
 const d=String(date.getDate()).padStart(2,"0");
 const h=String(date.getHours()).padStart(2,"0");
 const min=String(date.getMinutes()).padStart(2,"0");
 return `${y}-${m}-${d}T${h}:${min}`;
};

const InlineField=({label,children,labelMd=3,inputMd=9})=>(
 <Form.Group as={Row} className="align-items-center mb-3">
  <Form.Label column md={labelMd} className="fw-semibold mb-0">{label}</Form.Label>
  <Col md={inputMd}>{children}</Col>
 </Form.Group>
);

export default function SeasonForm({
 initialData={},
 onSubmit,
 loading=false,
 businesses=[]
}){
 const [formData,setFormData]=useState(defaultFormData);

 useEffect(()=>{
  setFormData({
   ...defaultFormData,
   ...initialData,
   business_id:getObjectId(initialData?.business_id),
   startDate:formatDateTimeLocal(initialData?.startDate),
   endDate:formatDateTimeLocal(initialData?.endDate)
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
   business_id:getObjectId(formData.business_id)||null,
   startDate:formData.startDate?new Date(formData.startDate).toISOString():null,
   endDate:formData.endDate?new Date(formData.endDate).toISOString():null
  });
 };

 return(
  <Form onSubmit={handleSubmit}>
   <Card className="border-0 shadow-sm">
    <Card.Body>

     <Row>

      <Col md={12}>
       <InlineField label="Business" labelMd={2} inputMd={10}>
        <Form.Select
         name="business_id"
         value={formData.business_id}
         onChange={handleChange}
         required
        >
         <option value="">Select Business</option>
         {businesses.map(b=>(
          <option key={b._id} value={b._id}>{b.legalName}</option>
         ))}
        </Form.Select>
       </InlineField>
      </Col>

      <Col md={6}>
       <InlineField label="Name" labelMd={4} inputMd={8}>
        <Form.Control
         name="name"
         value={formData.name}
         onChange={handleChange}
         required
        />
       </InlineField>
      </Col>

      <Col md={6}>
       <InlineField label="Code" labelMd={4} inputMd={8}>
        <Form.Control
         name="code"
         value={formData.code}
         onChange={handleChange}
        />
       </InlineField>
      </Col>

      <Col md={12}>
       <InlineField label="Description" labelMd={2} inputMd={10}>
        <Form.Control
         as="textarea"
         rows={2}
         name="description"
         value={formData.description}
         onChange={handleChange}
        />
       </InlineField>
      </Col>

      <Col md={6}>
       <InlineField label="Start Date" labelMd={4} inputMd={8}>
        <Form.Control
         type="datetime-local"
         name="startDate"
         value={formData.startDate}
         onChange={handleChange}
         required
        />
       </InlineField>
      </Col>

      <Col md={6}>
       <InlineField label="End Date" labelMd={4} inputMd={8}>
        <Form.Control
         type="datetime-local"
         name="endDate"
         value={formData.endDate}
         onChange={handleChange}
         required
        />
       </InlineField>
      </Col>

      <Col md={4}>
       <InlineField label="Recurring" labelMd={6} inputMd={6}>
        <Form.Check
         type="switch"
         name="isRecurringAnnual"
         checked={formData.isRecurringAnnual}
         onChange={handleChange}
        />
       </InlineField>
      </Col>

      <Col md={4}>
       <InlineField label="Default" labelMd={6} inputMd={6}>
        <Form.Check
         type="switch"
         name="isDefault"
         checked={formData.isDefault}
         onChange={handleChange}
        />
       </InlineField>
      </Col>

      <Col md={4}>
       <InlineField label="Active" labelMd={6} inputMd={6}>
        <Form.Check
         type="switch"
         name="isActive"
         checked={formData.isActive}
         onChange={handleChange}
        />
       </InlineField>
      </Col>

      <Col md={12}>
       <InlineField label="Notes" labelMd={2} inputMd={10}>
        <Form.Control
         as="textarea"
         rows={3}
         name="notes"
         value={formData.notes}
         onChange={handleChange}
        />
       </InlineField>
      </Col>

     </Row>

    </Card.Body>
   </Card>

   <div className="d-flex justify-content-end">
    <Button type="submit" disabled={loading}>
     {loading?"Saving...":"Save Season"}
    </Button>
   </div>
  </Form>
 );
}