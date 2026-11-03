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

function RecordSubtypeForm({
 form,
 setForm,
 editing=null,
 saving=false,
 onSubmit
}){
 // Helper: update one record subtype field
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
      <Form.Label>Status</Form.Label>
      <Form.Select
       value={form.status}
       onChange={event=>updateField(
        "status",
        event.target.value
       )}
      >
       <option value="active">Active</option>
       <option value="archived">Archived</option>
      </Form.Select>
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
       placeholder="Example: Permanent Note"
      />
     </Form.Group>
    </Col>

    <Col xs={12} md={4}>
     <Form.Group className="mb-3">
      <Form.Label>Code</Form.Label>
      <Form.Control
       required
       value={form.code}
       onChange={event=>updateField(
        "code",
        event.target.value.toUpperCase()
       )}
       placeholder="Example: PERM"
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
     placeholder="Describe when and how this subtype should be used."
    />
   </Form.Group>

   <div className="text-end">
    <Button type="submit" disabled={saving}>
     {saving
      ?"Saving..."
      :editing?._id
       ?"Save Changes"
       :"Save Record Subtype"}
    </Button>
   </div>
  </Form>
 );
}

export default RecordSubtypeForm;