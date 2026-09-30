import {useState} from "react";
import {Button,Col,Form,Row} from "react-bootstrap";
import Alert from "../../../components/PopupAlert.jsx";

const defaultForm={
 name:"",
 code:"",
 stateRef:"",
 rate:"",
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

const getStateLabel=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 return value?.name||value?.title||value?.code||"";
};

export default function TaxRateForm({
 initialData={},
 onSubmit,
 onSaved,
 onHide,
 loading=false,
 states=[]
}){
 const [error,setError]=useState("");
 const [form,setForm]=useState(()=>({
   ...defaultForm,
   ...initialData,
   stateRef:getObjectId(initialData?.stateRef),
   rate:initialData?.rate===undefined||initialData?.rate===null?"":String(initialData.rate),
   isDefault:!!initialData?.isDefault,
   isActive:initialData?.isActive!==false
  }));

 const handleChange=event=>{
  const {name,type,value,checked}=event.target;
  setForm(prev=>({
   ...prev,
   [name]:type==="checkbox"?checked:value
  }));
 };

 const handleSubmit=async event=>{
  event.preventDefault();

  const payload={
   ...form,
   stateRef:getObjectId(form.stateRef)||null,
   rate:form.rate===""?0:Number(form.rate),
   isDefault:!!form.isDefault,
   isActive:!!form.isActive
  };

  setError("");
  try{
   const saved=await onSubmit?.(payload);
   onSaved?.(saved);
  }catch(error){setError(error.message||"Unable to save tax rate");}
 };

 return(
  <Form onSubmit={handleSubmit}>
   {error&&<Alert variant="danger">{error}</Alert>}
   <Row className="g-3">
    <Col md={6}>
     <Form.Group>
      <Form.Label>Name</Form.Label>
      <Form.Control
       name="name"
       value={form.name}
       onChange={handleChange}
       required
       disabled={loading}
      />
     </Form.Group>
    </Col>

    <Col md={6}>
     <Form.Group>
      <Form.Label>Code</Form.Label>
      <Form.Control
       name="code"
       value={form.code}
       onChange={handleChange}
       disabled={loading}
      />
     </Form.Group>
    </Col>

    <Col md={6}>
     <Form.Group>
      <Form.Label>State</Form.Label>
      <Form.Select
       name="stateRef"
       value={form.stateRef}
       onChange={handleChange}
       required
       disabled={loading}
      >
       <option value="">Select State</option>
       {states.map(state=>(
        <option key={getObjectId(state)} value={getObjectId(state)}>
         {getStateLabel(state)}
        </option>
       ))}
      </Form.Select>
     </Form.Group>
    </Col>

    <Col md={6}>
     <Form.Group>
      <Form.Label>Rate Percent</Form.Label>
      <Form.Control
       type="number"
       step="0.001"
       min="0"
       max="100"
       name="rate"
       value={form.rate}
       onChange={handleChange}
       required
       disabled={loading}
      />
     </Form.Group>
    </Col>

    <Col md={6}>
     <Form.Check
      type="switch"
      id="tax-rate-default"
      name="isDefault"
      label="Default for state"
      checked={form.isDefault}
      onChange={handleChange}
      disabled={loading}
     />
    </Col>

    <Col md={6}>
     <Form.Check
      type="switch"
      id="tax-rate-active"
      name="isActive"
      label="Active"
      checked={form.isActive}
      onChange={handleChange}
      disabled={loading}
     />
    </Col>

    <Col xs={12}>
     <Form.Group>
      <Form.Label>Notes</Form.Label>
      <Form.Control
       as="textarea"
       rows={3}
       name="notes"
       value={form.notes}
       onChange={handleChange}
       disabled={loading}
      />
     </Form.Group>
    </Col>
   </Row>

   <div className="d-flex justify-content-end gap-2 mt-3">
    <Button type="button" variant="secondary" onClick={onHide} disabled={loading}>
     Cancel
    </Button>
    <Button type="submit" disabled={loading}>
     {loading?"Saving...":"Save Tax Rate"}
    </Button>
   </div>
  </Form>
 );
}
