// src/pages/forms/DehydratorForm.jsx
import {useEffect,useState} from "react";
import {Form,Row,Col,Button} from "react-bootstrap";

const initialForm={
 brand:"",
 name:"",
 watts:"",
 isActive:true,
 notes:""
};

export default function DehydratorForm({onSubmit,initialData,loading,submitText="Create",onCancel}){

 const [form,setForm]=useState(initialForm);

 useEffect(()=>{
  if(initialData){
   setForm({
    brand:initialData.brand||"",
    name:initialData.name||"",
    watts:initialData.watts??"",
    isActive:initialData.isActive??true,
    notes:initialData.notes||""
   });
  }else{
   setForm(initialForm);
  }
 },[initialData]);

 const handleChange=e=>{
  const {name,value,type,checked}=e.target;
  setForm(prev=>({...prev,[name]:type==="checkbox"?checked:value}));
 };

 const handleSubmit=e=>{
  e.preventDefault();
  onSubmit({
   brand:form.brand.trim(),
   name:form.name.trim(),
   watts:form.watts,
   isActive:form.isActive,
   notes:form.notes.trim()
  });
 };

 return(
  <Form onSubmit={handleSubmit}>

   <Row className="mb-3">
    <Col md={6} className="d-flex align-items-center gap-2">
     <Form.Label className="mb-0">Brand:</Form.Label>
     <Form.Control
      type="text"
      name="brand"
      value={form.brand}
      onChange={handleChange}
      required
     />
    </Col>

    <Col md={6} className="d-flex align-items-center gap-2">
     <Form.Label className="mb-0">Name:</Form.Label>
     <Form.Control
      type="text"
      name="name"
      value={form.name}
      onChange={handleChange}
      required
     />
    </Col>
   </Row>

   <Row className="mb-3">
    <Col md={6} className="d-flex align-items-center gap-2">
     <Form.Label className="mb-0">Watts:</Form.Label>
     <Form.Control
      type="number"
      step="0.01"
      name="watts"
      value={form.watts}
      onChange={handleChange}
      required
     />
    </Col>

    <Col md={6} className="d-flex align-items-center gap-2">
     <Form.Label className="mb-0">Active:</Form.Label>
     <Form.Check
      type="checkbox"
      name="isActive"
      checked={form.isActive}
      onChange={handleChange}
     />
    </Col>
   </Row>

   <Row className="mb-3">
    <Col md={12} className="d-flex align-items-start gap-2">
     <Form.Label className="mb-0">Notes:</Form.Label>
     <Form.Control
      as="textarea"
      rows={3}
      name="notes"
      value={form.notes}
      onChange={handleChange}
     />
    </Col>
   </Row>

   <Button type="submit" disabled={loading}>
    {loading?"Saving...":submitText}
   </Button>

  </Form>
 );
}