import {Button,Col,Form,Row} from "react-bootstrap";

const parentModels=[
 "FleetingNote",
 "Source",
 "Entity",
 "Zettel",
 "Connection",
 "StructureNote",
 "Output",
 "Project"
];

function RevisionForm({
 form,
 setForm,
 editing=null,
 saving=false,
 onSubmit
}){
 // Helper: update one revision field
 const updateField=(field,value)=>{
  setForm(current=>({...current,[field]:value}));
 };

 return(
  <Form onSubmit={onSubmit}>
   <Row>
    <Col xs={12} md={6}>
     <Form.Group className="mb-3">
      <Form.Label>Parent Model</Form.Label>

      <Form.Control
       required
       list="revision-parent-models"
       value={form.parentModel}
       onChange={event=>updateField(
        "parentModel",
        event.target.value
       )}
       placeholder="Example: Zettel"
      />

      <datalist id="revision-parent-models">
       {parentModels.map(model=>(
        <option key={model} value={model}/>
       ))}
      </datalist>
     </Form.Group>
    </Col>

    <Col xs={12} md={6}>
     <Form.Group className="mb-3">
      <Form.Label>Parent Record Object ID</Form.Label>

      <Form.Control
       required
       value={form.parentRecordId}
       onChange={event=>updateField(
        "parentRecordId",
        event.target.value
       )}
       pattern="[a-fA-F0-9]{24}"
       maxLength={24}
       placeholder="24-character MongoDB Object ID"
      />
     </Form.Group>
    </Col>
   </Row>

   <Row>
    <Col xs={12} md={8}>
     <Form.Group className="mb-3">
      <Form.Label>Parent Display ID</Form.Label>

      <Form.Control
       value={form.parentDisplayId}
       onChange={event=>updateField(
        "parentDisplayId",
        event.target.value
       )}
       placeholder="Example: ZTL-PERM-000001"
      />
     </Form.Group>
    </Col>

    <Col xs={12} md={4}>
     <Form.Group className="mb-3">
      <Form.Label>Version</Form.Label>

      <Form.Control
       type="number"
       min={1}
       step={1}
       value={form.version}
       onChange={event=>updateField(
        "version",
        event.target.value
       )}
       placeholder={editing?._id?"Version":"Automatic"}
      />

      {!editing?._id&&(
       <Form.Text muted>
        Leave blank to assign the next version.
       </Form.Text>
      )}
     </Form.Group>
    </Col>
   </Row>

   <Form.Group className="mb-3">
    <Form.Label>Title</Form.Label>

    <Form.Control
     value={form.title}
     onChange={event=>updateField(
      "title",
      event.target.value
     )}
     placeholder="Revision title"
    />
   </Form.Group>

   <Row>
    <Col xs={12} md={6}>
     <Form.Group className="mb-3">
      <Form.Label>Summary</Form.Label>

      <Form.Control
       as="textarea"
       rows={4}
       value={form.summary}
       onChange={event=>updateField(
        "summary",
        event.target.value
       )}
       placeholder="Summarize this version."
      />
     </Form.Group>
    </Col>

    <Col xs={12} md={6}>
     <Form.Group className="mb-3">
      <Form.Label>Change Note</Form.Label>

      <Form.Control
       as="textarea"
       rows={4}
       value={form.changeNote}
       onChange={event=>updateField(
        "changeNote",
        event.target.value
       )}
       placeholder="Describe what changed."
      />
     </Form.Group>
    </Col>
   </Row>

   <Form.Group className="mb-3">
    <Form.Label>Content</Form.Label>

    <Form.Control
     as="textarea"
     rows={8}
     value={form.content}
     onChange={event=>updateField(
      "content",
      event.target.value
     )}
     placeholder="Stored content for this revision."
    />
   </Form.Group>

   <Form.Group className="mb-3">
    <Form.Label>Snapshot JSON</Form.Label>

    <Form.Control
     as="textarea"
     rows={8}
     value={form.snapshotText}
     onChange={event=>updateField(
      "snapshotText",
      event.target.value
     )}
     placeholder='{"title":"Example","body":"Stored record data"}'
     spellCheck={false}
    />

    <Form.Text muted>
     Enter a valid JSON object containing the complete record snapshot.
    </Form.Text>
   </Form.Group>

   <div className="text-end">
    <Button type="submit" disabled={saving}>
     {saving
      ?"Saving..."
      :editing?._id
       ?"Save Changes"
       :"Create Revision"}
    </Button>
   </div>
  </Form>
 );
}

export default RevisionForm;