import {Button,Col,Form,Row} from "react-bootstrap";

const toCode=value=>String(value||"").trim().toUpperCase().replace(/[^A-Z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,24);

function RelationTypeForm({
 form,
 setForm,
 editing=null,
 saving=false,
 onSubmit
}){
 // Helper: update one relation type field
 const updateField=(field,value)=>{
  setForm(current=>({...current,[field]:value}));
 };

 const updateName=value=>{
  setForm(current=>({...current,name:value,code:toCode(value)}));
 };

 return(
  <Form onSubmit={onSubmit}>
   <Row>
    <Col xs={12}>
     <Form.Group className="mb-3">
      <Form.Label>Name</Form.Label>
      <Form.Control
       required
       value={form.name}
       onChange={event=>updateName(event.target.value)}
       placeholder="Example: Supports"
      />
      <Form.Text>Code: {form.code||"Generated from the name"}</Form.Text>
     </Form.Group>
    </Col>
   </Row>

   <Form.Group className="mb-3">
    <Form.Label>Description</Form.Label>
    <Form.Control
     as="textarea"
     rows={5}
     value={form.description}
     onChange={event=>updateField(
      "description",
      event.target.value
     )}
     placeholder="Explain what this relationship means and when it should be used."
    />
   </Form.Group>

   <Form.Group className="mb-3">
    <Form.Label>Status</Form.Label>
    <Form.Select
     value={form.status}
     onChange={event=>updateField("status",event.target.value)}
    >
     <option value="active">Active</option>
     <option value="archived">Archived</option>
    </Form.Select>
   </Form.Group>

   <div className="text-end">
    <Button type="submit" disabled={saving}>
     {saving
      ?"Saving..."
      :editing?._id
       ?"Save Changes"
       :"Save Relation Type"}
    </Button>
   </div>
  </Form>
 );
}

export default RelationTypeForm;
