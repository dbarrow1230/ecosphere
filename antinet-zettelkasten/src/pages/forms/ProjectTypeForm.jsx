import {Button,Col,Form,Row} from "react-bootstrap";

function ProjectTypeForm({form,setForm,editing,saving,onSubmit}){
 const update=(field,value)=>setForm(current=>({...current,[field]:value}));
 const toCode=value=>String(value||"").trim().toUpperCase().replace(/[^A-Z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,24);

 return(
  <Form onSubmit={onSubmit}>
   <Row className="g-3">
    <Col xs={12} md={4}>
     <Form.Group controlId="project-type-name">
      <Form.Label>Name</Form.Label>
      <Form.Control
       value={form.name}
       onChange={event=>{const name=event.target.value;setForm(current=>({...current,name,code:toCode(name)}));}}
       required
      />
     </Form.Group>
    </Col>

    <Col xs={12} md={5}>
     <Form.Group controlId="project-type-code">
      <Form.Label>Code</Form.Label>
      <Form.Control value={form.code||toCode(form.name)} readOnly/>
     </Form.Group>
    </Col>

    <Col xs={12} md={3}>
     <Form.Group controlId="project-type-status">
      <Form.Label>Status</Form.Label>
      <Form.Select
       value={form.status}
       onChange={event=>update("status",event.target.value)}
      >
       <option value="active">Active</option>
       <option value="archived">Archived</option>
      </Form.Select>
     </Form.Group>
    </Col>

    <Col xs={12}>
     <Form.Group controlId="project-type-description">
      <Form.Label>Description</Form.Label>
      <Form.Control
       as="textarea"
       rows={4}
       value={form.description}
       onChange={event=>update("description",event.target.value)}
      />
     </Form.Group>
    </Col>
   </Row>

   <div className="d-flex justify-content-end gap-2 mt-4">
    <Button type="submit" disabled={saving}>
     {saving?"Saving…":editing?._id?"Save Project Type":"Add Project Type"}
    </Button>
   </div>
  </Form>
 );
}

export default ProjectTypeForm;
