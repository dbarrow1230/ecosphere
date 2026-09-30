import {useEffect,useState} from "react";
import {Button,Col,Form,Row} from "react-bootstrap";

const getObjectId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 if(typeof value==="object")return String(value?._id||value?.id||value?.value||"");
 return "";
};

const defaultFormData={
 name:"",
 code:"",
 rate:"",
 stateRef:"",
 notes:"",
 isActive:true
};

export default function TaxRateForm({initialData={},onSubmit,onHide,loading=false,states=[]}){
 const [formData,setFormData]=useState(defaultFormData);

 useEffect(()=>{
  setFormData({
   name:initialData?.name||"",
   code:initialData?.code||"",
   rate:initialData?.rate??"",
   stateRef:getObjectId(initialData?.stateRef),
   notes:initialData?.notes||"",
   isActive:initialData?.isActive!==false
  });
 },[initialData]);

 const handleChange=event=>{
  const {name,value,type,checked}=event.target;
  setFormData(prev=>({
   ...prev,
   [name]:type==="checkbox"?checked:value
  }));
 };

 const handleSubmit=event=>{
  event.preventDefault();
  onSubmit?.({
   ...formData,
   rate:Number(formData.rate)||0,
   stateRef:formData.stateRef||null
  });
 };

 return(
  <Form onSubmit={handleSubmit}>
   <Row className="g-3">
    <Col md={6}>
     <Form.Group controlId="taxRateName">
      <Form.Label>Name</Form.Label>
      <Form.Control name="name" value={formData.name} onChange={handleChange} required/>
     </Form.Group>
    </Col>
    <Col md={3}>
     <Form.Group controlId="taxRateCode">
      <Form.Label>Code</Form.Label>
      <Form.Control name="code" value={formData.code} onChange={handleChange}/>
     </Form.Group>
    </Col>
    <Col md={3}>
     <Form.Group controlId="taxRateRate">
      <Form.Label>Rate</Form.Label>
      <Form.Control type="number" step="0.0001" min="0" name="rate" value={formData.rate} onChange={handleChange}/>
     </Form.Group>
    </Col>
    <Col md={6}>
     <Form.Group controlId="taxRateState">
      <Form.Label>State</Form.Label>
      <Form.Select name="stateRef" value={formData.stateRef} onChange={handleChange}>
       <option value="">None</option>
       {states.map(state=>(
        <option key={state._id||state.id} value={state._id||state.id}>
         {state.name||state.code||state.abbreviation||state._id}
        </option>
       ))}
      </Form.Select>
     </Form.Group>
    </Col>
    <Col md={6} className="d-flex align-items-end">
     <Form.Check
      type="switch"
      id="taxRateActive"
      name="isActive"
      label="Active"
      checked={formData.isActive}
      onChange={handleChange}
     />
    </Col>
    <Col xs={12}>
     <Form.Group controlId="taxRateNotes">
      <Form.Label>Notes</Form.Label>
      <Form.Control as="textarea" rows={3} name="notes" value={formData.notes} onChange={handleChange}/>
     </Form.Group>
    </Col>
   </Row>
   <div className="d-flex justify-content-end gap-2 mt-4">
    <Button type="button" variant="outline-secondary" onClick={onHide} disabled={loading}>Cancel</Button>
    <Button type="submit" variant="primary" disabled={loading}>{loading?"Saving...":"Save"}</Button>
   </div>
  </Form>
 );
}
