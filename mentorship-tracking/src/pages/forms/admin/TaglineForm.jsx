//src/pages/forms/admin/taglineForm.jsx
import {useEffect,useState} from "react";
import {Form,Row,Col,Button,Card} from "react-bootstrap";

const defaultFormData={
 business_id:"",
 seasonRef:"",
 occasionRef:"",
 name:"",
 text:"",
 isActive:true,
 notes:""
};

const getObjectId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 if(typeof value==="object")return String(value?._id||value?.id||value?.value||"");
 return "";
};

const getOptionValue=item=>{
 return String(item?._id||item?.id||item?.value||"");
};

const getOptionLabel=item=>{
 return item?.name||item?.title||item?.code||item?.legalName||item?.value||"";
};

const normalizeOptions=items=>{
 return Array.isArray(items)?items.filter(item=>getOptionValue(item)&&getOptionLabel(item)):[];
};

const InlineField=({label,children,labelMd=3,inputMd=9,className=""})=>(
 <Form.Group as={Row} className={`align-items-center mb-3 ${className}`}>
  <Form.Label column md={labelMd} className="fw-semibold mb-0">{label}</Form.Label>
  <Col md={inputMd}>
   {children}
  </Col>
 </Form.Group>
);

export default function TaglineForm({
 initialData={},
 onSubmit,
 loading=false,
 businesses=[],
 seasons=[],
 occasions=[]
}){
 const [formData,setFormData]=useState(defaultFormData);

 const businessOptions=normalizeOptions(businesses);
 const seasonOptions=normalizeOptions(seasons);
 const occasionOptions=normalizeOptions(occasions);

 useEffect(()=>{
  const nextData={
   ...defaultFormData,
   ...initialData,
   business_id:getObjectId(initialData?.business_id),
   seasonRef:getObjectId(initialData?.seasonRef),
   occasionRef:getObjectId(initialData?.occasionRef)
  };
  setFormData(nextData);
 },[initialData]);

 const handleChange=e=>{
  const {name,type,value,checked}=e.target;
  setFormData(prev=>({
   ...prev,
   [name]:type==="checkbox"?checked:value
  }));
 };

 const handleSeasonChange=e=>{
  const {value}=e.target;
  setFormData(prev=>({
   ...prev,
   seasonRef:value,
   occasionRef:value?"" : prev.occasionRef
  }));
 };

 const handleOccasionChange=e=>{
  const {value}=e.target;
  setFormData(prev=>({
   ...prev,
   occasionRef:value
  }));
 };

 const handleSubmit=e=>{
  e.preventDefault();
  const payload={
   ...formData,
   business_id:getObjectId(formData.business_id)||null,
   seasonRef:getObjectId(formData.seasonRef)||null,
   occasionRef:getObjectId(formData.occasionRef)||null
  };
  onSubmit&&onSubmit(payload);
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
         {businessOptions.map(item=>(
          <option key={getOptionValue(item)} value={getOptionValue(item)}>
           {getOptionLabel(item)}
          </option>
         ))}
        </Form.Select>
       </InlineField>
      </Col>

      <Col md={12}>
       <InlineField label="Season" labelMd={2} inputMd={10}>
        <Form.Select
         name="seasonRef"
         value={formData.seasonRef}
         onChange={handleSeasonChange}
        >
         <option value="">General / No Season</option>
         {seasonOptions.map(item=>(
          <option key={getOptionValue(item)} value={getOptionValue(item)}>
           {getOptionLabel(item)}
          </option>
         ))}
        </Form.Select>
       </InlineField>
      </Col>

      <Col md={12}>
       <InlineField label="Occasion" labelMd={2} inputMd={10}>
        <Form.Select
         name="occasionRef"
         value={formData.occasionRef}
         onChange={handleOccasionChange}
        >
         <option value="">General / No Occasion</option>
         {occasionOptions.map(item=>(
          <option key={getOptionValue(item)} value={getOptionValue(item)}>
           {getOptionLabel(item)}
          </option>
         ))}
        </Form.Select>
       </InlineField>
      </Col>

      <Col md={12}>
       <InlineField label="Name" labelMd={2} inputMd={10}>
        <Form.Control
         type="text"
         name="name"
         value={formData.name}
         onChange={handleChange}
         required
        />
       </InlineField>
      </Col>

      <Col md={12}>
       <InlineField label="Text" labelMd={2} inputMd={10}>
        <Form.Control
         as="textarea"
         rows={4}
         name="text"
         value={formData.text}
         onChange={handleChange}
         required
        />
       </InlineField>
      </Col>

      <Col md={6}>
       <InlineField label="Active" labelMd={4} inputMd={8}>
        <Form.Check
         type="switch"
         id="isActive"
         name="isActive"
         label=""
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
     {loading?"Saving...":"Save Tagline"}
    </Button>
   </div>
  </Form>
 );
}