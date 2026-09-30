// src/forms/ElectricityAccountForm.jsx
import {Form,Row,Col,Button,Spinner} from "react-bootstrap";

function InlineTextField({label,name,value,onChange,required=false,type="text",step,disabled=false}){
 return(
  <Form.Group as={Row} className="align-items-center mb-3">
   <Form.Label column sm={4} className="text-sm-end">{label}:</Form.Label>
   <Col sm={8}>
    <Form.Control type={type} step={step} name={name} value={value} onChange={onChange} required={required} disabled={disabled}/>
   </Col>
  </Form.Group>
 );
}

function InlineTextareaField({label,name,value,onChange,rows=3}){
 return(
  <Form.Group as={Row} className="align-items-start mb-3">
   <Form.Label column sm={4} className="text-sm-end">{label}:</Form.Label>
   <Col sm={8}>
    <Form.Control as="textarea" rows={rows} name={name} value={value} onChange={onChange}/>
   </Col>
  </Form.Group>
 );
}

function InlineCheckboxField({label,name,checked,onChange,id}){
 return(
  <Form.Group as={Row} className="align-items-center mb-3">
   <Form.Label column sm={4} className="text-sm-end">{label}:</Form.Label>
   <Col sm={8}>
    <Form.Check id={id} type="checkbox" name={name} checked={checked} onChange={onChange}/>
   </Col>
  </Form.Group>
 );
}

export default function ElectricityAccountForm({form,onChange,onSubmit,onCancel,loading,submitText="Save Account",checkboxId="accountIsActive"}){
 return(
  <Form onSubmit={onSubmit}>
   <InlineTextField label="Provider" name="provider" value={form.provider} onChange={onChange} required/>
   <InlineTextField label="Account Number" name="accountNumber" value={form.accountNumber} onChange={onChange} required/>
   <InlineTextField label="Meter Number" name="meterNumber" value={form.meterNumber} onChange={onChange}/>
   <InlineTextField label="Nickname" name="nickname" value={form.nickname} onChange={onChange}/>
   <InlineTextareaField label="Notes" name="notes" value={form.notes} onChange={onChange} rows={3}/>
   <InlineCheckboxField label="Active" name="isActive" checked={form.isActive} onChange={onChange} id={checkboxId}/>
   <div className="d-flex justify-content-end gap-2">
    {onCancel?<Button variant="outline-secondary" type="button" onClick={onCancel} disabled={loading}>Cancel</Button>:null}
    <Button type="submit" disabled={loading}>
     {loading?<><Spinner size="sm" animation="border" className="me-2"/>Saving...</>:submitText}
    </Button>
   </div>
  </Form>
 );
}