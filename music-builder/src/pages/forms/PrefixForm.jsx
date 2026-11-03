import {Button,Col,Form,Row} from "react-bootstrap";

const recordTypes=[
 {value:"FLT",label:"Fleeting Note"},
 {value:"SRC",label:"Source"},
 {value:"ENT",label:"Entity"},
 {value:"ZTL",label:"Zettel"},
 {value:"LNK",label:"Connection"},
 {value:"STR",label:"Structure Note"},
 {value:"OUT",label:"Output"},
 {value:"PRJ",label:"Project"}
];

function PrefixForm({
 form,
 setForm,
 editing=null,
 saving=false,
 onSubmit
}){
 // Helper: update one prefix field
 const updateField=(field,value)=>{
  setForm(current=>({...current,[field]:value}));
 };

 return(
  <Form onSubmit={onSubmit}>
   <Row>
    <Col xs={12} md={6}>
     <Form.Group className="mb-3">
      <Form.Label>Record Type</Form.Label>

      <Form.Select
       required
       value={form.recordType}
       onChange={event=>updateField(
        "recordType",
        event.target.value
       )}
      >
       <option value="">Choose Record Type</option>

       {recordTypes.map(type=>(
        <option key={type.value} value={type.value}>
         {type.value} - {type.label}
        </option>
       ))}
      </Form.Select>
     </Form.Group>
    </Col>

    <Col xs={12} md={6}>
     <Form.Group className="mb-3">
      <Form.Label>Active</Form.Label>

      <Form.Check
       type="switch"
       checked={form.isActive}
       onChange={event=>updateField(
        "isActive",
        event.target.checked
       )}
       label={form.isActive?"Active":"Inactive"}
      />
     </Form.Group>
    </Col>
   </Row>

   <Row>
    <Col xs={12} md={8}>
     <Form.Group className="mb-3">
      <Form.Label>Name</Form.Label>

      <Form.Control
       required
       value={form.name}
       onChange={event=>updateField(
        "name",
        event.target.value
       )}
       placeholder="Example: Fleeting Note"
      />
     </Form.Group>
    </Col>

    <Col xs={12} md={4}>
     <Form.Group className="mb-3">
      <Form.Label>Prefix Code</Form.Label>

      <Form.Control
       required
       value={form.code}
       onChange={event=>updateField(
        "code",
        event.target.value.toUpperCase()
       )}
       placeholder="Example: FLT"
      />
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
     placeholder="Describe where this prefix is used."
    />
   </Form.Group>

   <div className="text-end">
    <Button type="submit" disabled={saving}>
     {saving
      ?"Saving..."
      :editing?._id
       ?"Save Changes"
       :"Save Prefix"}
    </Button>
   </div>
  </Form>
 );
}

export default PrefixForm;