// src/pages/forms/reference/DietaryForm.jsx
import {Form,Row,Col,Modal,Button} from "react-bootstrap";

export default function DietaryForm({show,onHide,onSubmit,form,setForm,saving,editing}){
 return (
  <Modal show={show} onHide={saving?undefined:onHide} centered backdrop={saving?"static":true}>
   <Form onSubmit={onSubmit}>
    <Modal.Header closeButton={!saving}>
     <Modal.Title>{editing?"Edit Dietary":"Add Dietary"}</Modal.Title>
    </Modal.Header>

    <Modal.Body>
     <Row className="g-3">
      <Col md={6}>
       <Form.Group>
        <Form.Label>Name</Form.Label>
        <Form.Control value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
       </Form.Group>
      </Col>

      <Col md={6}>
       <Form.Group>
        <Form.Label>Slug</Form.Label>
        <Form.Control value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})} />
       </Form.Group>
      </Col>

      <Col md={6} className="d-flex align-items-end">
       <Form.Check label="Active" checked={form.isActive} onChange={e=>setForm({...form,isActive:e.target.checked})}/>
      </Col>

      <Col md={12}>
       <Form.Group>
        <Form.Label>Description</Form.Label>
        <Form.Control as="textarea" rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
       </Form.Group>
      </Col>
     </Row>
    </Modal.Body>

    <Modal.Footer>
      <Button variant="secondary" onClick={onHide} disabled={saving}>Cancel</Button>
      <Button type="submit" disabled={saving}>{saving?"Saving...":"Save"}</Button>
    </Modal.Footer>
   </Form>
  </Modal>
 );
}