import {Form,Row,Col,Modal,Button} from "react-bootstrap";

export default function LocationForm({show,onHide,onSubmit,form,setForm,saving,editing,locationTypes,locations,disableParentId,businesses}){
 return (
  <Modal show={show} onHide={saving?undefined:onHide} centered size="lg" backdrop={saving?"static":true}>
   <Form onSubmit={onSubmit}>
    <Modal.Header closeButton={!saving}>
     <Modal.Title>{editing?"Edit Location":"Add Location"}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     <Row className="g-3">
      <Col md={6}>
       <Form.Group>
        <Form.Label>Business</Form.Label>
        <Form.Select value={form.business||""} onChange={e=>setForm({...form,business:e.target.value,parentLocation:""})} required>
         <option value="">Select business</option>
         {businesses.map(item=>(
          <option key={item._id} value={item._id}>{item.legalName||item.name||item.code||"Business"}</option>
         ))}
        </Form.Select>
       </Form.Group>
      </Col>
      <Col md={6}>
       <Form.Group>
        <Form.Label>Name</Form.Label>
        <Form.Control value={form.name||""} onChange={e=>setForm({...form,name:e.target.value})} required />
       </Form.Group>
      </Col>
      <Col md={6}>
       <Form.Group>
        <Form.Label>Code</Form.Label>
        <Form.Control value={form.code||""} onChange={e=>setForm({...form,code:e.target.value.toUpperCase()})} />
       </Form.Group>
      </Col>
      <Col md={6}>
       <Form.Group>
        <Form.Label>Type</Form.Label>
        <Form.Select value={form.type||""} onChange={e=>setForm({...form,type:e.target.value})} required>
         <option value="">Select type</option>
         {locationTypes.map(item=>(
          <option key={item._id} value={item._id}>{item.name}</option>
         ))}
        </Form.Select>
       </Form.Group>
      </Col>
      <Col md={6}>
       <Form.Group>
        <Form.Label>Parent Location</Form.Label>
        <Form.Select value={form.parentLocation||""} onChange={e=>setForm({...form,parentLocation:e.target.value})}>
         <option value="">None</option>
         {locations.filter(item=>item._id!==disableParentId&&String(item.business?._id||item.business||"")===String(form.business||"")).map(item=>(
          <option key={item._id} value={item._id}>{item.name}</option>
         ))}
        </Form.Select>
       </Form.Group>
      </Col>
      <Col md={6} className="d-flex align-items-end">
       <Form.Check label="Active" checked={!!form.isActive} onChange={e=>setForm({...form,isActive:e.target.checked})} />
      </Col>
      <Col md={12}>
       <Form.Group>
        <Form.Label>Description</Form.Label>
        <Form.Control as="textarea" rows={3} value={form.description||""} onChange={e=>setForm({...form,description:e.target.value})} />
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