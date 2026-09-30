// src/pages/forms/reference/MetricUnitForm.jsx
import {Form,Row,Col,Modal,Button} from "react-bootstrap";

export default function MetricUnitForm({show,onHide,onSubmit,form,setForm,saving,editing}){
 return (
  <Modal show={show} onHide={saving?undefined:onHide} centered backdrop={saving?"static":true}>
   <Form onSubmit={onSubmit}>
    <Modal.Header closeButton={!saving}>
     <Modal.Title>{editing?"Edit Metric Unit":"Add Metric Unit"}</Modal.Title>
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
        <Form.Label>Symbol</Form.Label>
        <Form.Control value={form.symbol} onChange={e=>setForm({...form,symbol:e.target.value})} required />
       </Form.Group>
      </Col>
      <Col md={6}>
       <Form.Group>
        <Form.Label>Type</Form.Label>
        <Form.Select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} required>
         <option value="weight">Weight</option>
         <option value="volume">Volume</option>
         <option value="length">Length</option>
         <option value="count">Count</option>
        </Form.Select>
       </Form.Group>
      </Col>
      <Col md={6} className="d-flex align-items-end">
       <Form.Group>
        <Form.Check label="Active" checked={form.isActive} onChange={e=>setForm({...form,isActive:e.target.checked})} />
       </Form.Group>
      </Col>
      <Col md={12}>
       <Form.Group>
        <Form.Label>Description</Form.Label>
        <Form.Control as="textarea" rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
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