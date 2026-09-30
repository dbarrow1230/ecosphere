// src/pages/admin/VendorCategoryForm.jsx
import {useState} from "react";
import {Button,Col,Form,Row} from "react-bootstrap";

const defaultForm={
 name:"",
 code:"",
 description:"",
 isActive:true
};

export default function VendorCategoryForm({
 initialData={},
 onSubmit,
 onSaved,
 onHide,
 loading=false
}){
 const [form,setForm]=useState(()=>({
  ...defaultForm,
  ...initialData,
  name:initialData?.name||"",
  code:initialData?.code||"",
  description:initialData?.description||"",
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
   code:String(form.code||"").trim().toUpperCase(),
   isActive:!!form.isActive
  };

  const saved=await onSubmit?.(payload);
  onSaved?.(saved);
 };

 return(
  <Form onSubmit={handleSubmit}>
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

    <Col xs={12}>
     <Form.Group>
      <Form.Label>Description</Form.Label>
      <Form.Control
       as="textarea"
       rows={3}
       name="description"
       value={form.description}
       onChange={handleChange}
       disabled={loading}
      />
     </Form.Group>
    </Col>

    <Col xs={12}>
     <Form.Check
      type="switch"
      id="vendor-category-active"
      name="isActive"
      label="Active"
      checked={form.isActive}
      onChange={handleChange}
      disabled={loading}
     />
    </Col>
   </Row>

   <div className="d-flex justify-content-end gap-2 mt-3">
    <Button type="button" variant="secondary" onClick={onHide} disabled={loading}>
     Cancel
    </Button>
    <Button type="submit" disabled={loading}>
     {loading?"Saving...":"Save Vendor Category"}
    </Button>
   </div>
  </Form>
 );
}