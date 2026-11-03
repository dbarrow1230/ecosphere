import Alert from "../../../../components/PopupAlert.jsx";
// src/pages/forms/admin/receipt/ReceiptSubHeaderForm.jsx
import {useEffect,useState} from "react";
import {Form,Row,Col,Button,Card,Modal} from "react-bootstrap";
import SortedSelect from "../../../../components/SortedSelect.jsx";

const defaultFormData={
 name:"",
 code:"",
 content:"",
 seasonRef:"",
 occasionRef:"",
 isDefault:false,
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
 return item?.name||item?.title||item?.code||item?.value||"";
};

const normalizeOptions=items=>{
 return Array.isArray(items)?items.filter(item=>getOptionValue(item)&&getOptionLabel(item)):[];
};

const InlineField=({label,children,labelMd=3,inputMd=9,className=""})=>(
 <Form.Group as={Row} className={`align-items-center mb-3 ${className}`}>
  <Form.Label column md={labelMd} className="fw-semibold mb-0">{label}</Form.Label>
  <Col md={inputMd}>{children}</Col>
 </Form.Group>
);

export default function ReceiptSubHeaderForm({
 show=false,
 onHide,
 onSaved,
 initialData={},
 loading=false,
 seasons=[],
 occasions=[]
}){
 const [formData,setFormData]=useState(defaultFormData);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");

 const seasonOptions=normalizeOptions(seasons);
 const occasionOptions=normalizeOptions(occasions);

 useEffect(()=>{
  setFormData({
   ...defaultFormData,
   ...initialData,
   seasonRef:getObjectId(initialData?.seasonRef),
   occasionRef:getObjectId(initialData?.occasionRef)
  });
 },[initialData,show]);

 const handleChange=e=>{
  const {name,type,value,checked}=e.target;
  setFormData(prev=>({...prev,[name]:type==="checkbox"?checked:value}));
 };

 const handleSubmit=async e=>{
  e.preventDefault();
  try{
   setSaving(true);
   setError("");
   const isEdit=Boolean(initialData?._id||initialData?.id);
   const id=initialData?._id||initialData?.id;
   const res=await fetch(isEdit?`/api/receipt-sub-headers/${id}`:"/api/receipt-sub-headers",{
    method:isEdit?"PUT":"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
     ...formData,
     seasonRef:getObjectId(formData.seasonRef)||null,
     occasionRef:getObjectId(formData.occasionRef)||null
    })
   });
   if(!res.ok){
    const errData=await res.json().catch(()=>null);
    throw new Error(errData?.message||`Failed to ${isEdit?"update":"save"} receipt sub header.`);
   }
   const saved=await res.json().catch(()=>null);
   onSaved&&onSaved(saved);
  }catch(err){
   setError(err.message||"Unable to save receipt sub header.");
  }finally{
   setSaving(false);
  }
 };

 return(
  <>
   <Modal.Header closeButton>
    <Modal.Title>{initialData?._id||initialData?.id?"Edit Receipt Sub Header":"Add Receipt Sub Header"}</Modal.Title>
   </Modal.Header>
   <Modal.Body>
    {error?<Alert variant="danger">{error}</Alert>:null}
    <Form onSubmit={handleSubmit}>
     <Card className="border-0 shadow-sm">
      <Card.Body>
       <Row>
        <Col md={8}>
         <InlineField label="Name">
          <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
         </InlineField>
        </Col>
        <Col md={4}>
         <InlineField label="Code" labelMd={4} inputMd={8}>
          <Form.Control type="text" name="code" value={formData.code} onChange={handleChange} />
         </InlineField>
        </Col>

        <Col md={12}>
         <InlineField label="Content" labelMd={2} inputMd={10}>
          <Form.Control as="textarea" rows={4} name="content" value={formData.content} onChange={handleChange} />
         </InlineField>
        </Col>

        <Col md={6}>
         <InlineField label="Season" labelMd={4} inputMd={8}>
          <SortedSelect
           name="seasonRef"
           value={formData.seasonRef}
           onChange={handleChange}
           options={seasonOptions}
           getValue={getOptionValue}
           getLabel={getOptionLabel}
           placeholder="Select Season"
          />
         </InlineField>
        </Col>

        <Col md={6}>
         <InlineField label="Occasion" labelMd={4} inputMd={8}>
          <SortedSelect
           name="occasionRef"
           value={formData.occasionRef}
           onChange={handleChange}
           options={occasionOptions}
           getValue={getOptionValue}
           getLabel={getOptionLabel}
           placeholder="Select Occasion"
          />
         </InlineField>
        </Col>

        <Col md={6}>
         <InlineField label="Default" labelMd={4} inputMd={8}>
          <Form.Check type="switch" id="receiptSubHeaderIsDefault" name="isDefault" checked={formData.isDefault} onChange={handleChange} />
         </InlineField>
        </Col>

        <Col md={6}>
         <InlineField label="Active" labelMd={4} inputMd={8}>
          <Form.Check type="switch" id="receiptSubHeaderIsActive" name="isActive" checked={formData.isActive} onChange={handleChange} />
         </InlineField>
        </Col>

        <Col md={12}>
         <InlineField label="Notes" labelMd={2} inputMd={10}>
          <Form.Control as="textarea" rows={3} name="notes" value={formData.notes} onChange={handleChange} />
         </InlineField>
        </Col>
       </Row>
      </Card.Body>
     </Card>

     <div className="d-flex justify-content-end gap-2 mt-3">
      <Button type="button" variant="outline-secondary" onClick={onHide} disabled={saving||loading}>Cancel</Button>
      <Button type="submit" disabled={saving||loading}>{saving?"Saving...":"Save Receipt Sub Header"}</Button>
     </div>
    </Form>
   </Modal.Body>
  </>
 );
}
