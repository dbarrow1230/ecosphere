import {useState} from "react";
import {Button,Col,Form,Row} from "react-bootstrap";
import {getEntityTemplate} from "../../config/entityTemplates.js";

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
 lockIdentity=false,
 onSubmit
}){
 const [selectedFieldIndex,setSelectedFieldIndex]=useState(0);
 // Helper: update one record subtype field
 const updateField=(field,value)=>{
  setForm(current=>({...current,[field]:value}));
 };

 const updateTemplateField=(index,field,value)=>{
  setForm(current=>({...current,templateFields:(current.templateFields||[]).map((item,itemIndex)=>itemIndex===index?{...item,[field]:value}:item)}));
 };

 const addTemplateField=()=>{
  setForm(current=>{
   const fields=[...(current.templateFields||[]),{key:"",label:"",inputType:"text",columnSpan:12,options:[],placeholder:""}];
   setSelectedFieldIndex(fields.length-1);
   return {...current,templateFields:fields};
  });
 };

 const removeTemplateField=index=>{
  setForm(current=>({...current,templateFields:(current.templateFields||[]).filter((_,itemIndex)=>itemIndex!==index)}));
  setSelectedFieldIndex(current=>Math.max(0,current>index?current-1:current===index?index-1:current));
 };

 const moveTemplateField=(fromIndex,toIndex)=>{
  if(fromIndex===toIndex||fromIndex<0)return;
  setForm(current=>{
   const fields=[...(current.templateFields||[])];
   const [field]=fields.splice(fromIndex,1);
   if(!field)return current;
   fields.splice(toIndex,0,field);
   setSelectedFieldIndex(toIndex);
   return {...current,templateFields:fields};
  });
 };

 const loadSuggestedTemplate=()=>{
  const suggested=getEntityTemplate(form.code,form.name);
  setForm(current=>({...current,templateFields:suggested.map(field=>({key:field.key,label:field.label,inputType:field.long?"richtext":"text",columnSpan:12,options:[],placeholder:field.placeholder||""}))}));
  setSelectedFieldIndex(0);
 };

 const selectedTemplateField=(form.templateFields||[])[selectedFieldIndex];

 return(
  <Form onSubmit={onSubmit}>
   <Row>
    <Col xs={12} md={6}>
     <Form.Group className="mb-3">
      <Form.Label>Record Type</Form.Label>
      <Form.Select
       required
       disabled={lockIdentity}
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
       disabled={lockIdentity}
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

   {form.recordType==="ENT"&&(
    <section className="record-subtype-template-fields">
     <div className="record-subtype-template-header">
      <div><h3>Entity Template Fields</h3><p>These fields appear only when this Entity Type is selected.</p></div>
      <div className="record-subtype-template-actions">
       {getEntityTemplate(form.code,form.name).length>0&&<Button type="button" size="sm" variant="outline-secondary" onClick={loadSuggestedTemplate}>Use Suggested Fields</Button>}
       <Button type="button" size="sm" variant="outline-primary" onClick={addTemplateField}>Add Field</Button>
      </div>
     </div>

     {(form.templateFields||[]).length>0&&<p className="record-subtype-template-help">This canvas matches the Entity form layout. Drag a field handle to place it in the sequence; its column width determines which fields share each row.</p>}

     <div className="record-subtype-layout-canvas">
      {(form.templateFields||[]).map((field,index)=>(
       <div className={`record-subtype-layout-field record-subtype-layout-field--span-${Math.min(12,Math.max(1,Number(field.columnSpan)||12))}${selectedFieldIndex===index?" is-selected":""}`} key={`${field.key}-${index}`} onClick={()=>setSelectedFieldIndex(index)} onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();moveTemplateField(Number(event.dataTransfer.getData("text/plain")),index);}}>
        <span className="record-subtype-template-handle" draggable aria-label={`Drag template field ${index+1}`} onDragStart={event=>event.dataTransfer.setData("text/plain",String(index))}>⋮⋮</span>
        <span className="record-subtype-layout-label">{field.label||`Field ${index+1}`}</span>
        <span className="record-subtype-layout-type">{field.inputType==="richtext"?"TipTap rich text":field.inputType||"text"} · {field.columnSpan||12}/12</span>
       </div>
      ))}
     </div>

     {selectedTemplateField&&(
      <div className="record-subtype-field-editor">
       <h4>Selected Field</h4>
       <Row>
        <Col xs={12} md={6}><Form.Group><Form.Label>Label</Form.Label><Form.Control value={selectedTemplateField.label||""} onChange={event=>updateTemplateField(selectedFieldIndex,"label",event.target.value)} placeholder="Field label"/></Form.Group></Col>
        <Col xs={12} md={6}><Form.Group><Form.Label>Field Key</Form.Label><Form.Control value={selectedTemplateField.key||""} onChange={event=>updateTemplateField(selectedFieldIndex,"key",event.target.value)} placeholder="Generated from label if blank"/></Form.Group></Col>
        <Col xs={12} md={6}><Form.Group><Form.Label>Field Type</Form.Label><Form.Select value={selectedTemplateField.inputType||"text"} onChange={event=>updateTemplateField(selectedFieldIndex,"inputType",event.target.value)}><option value="text">Short text</option><option value="richtext">Rich text (TipTap)</option><option value="number">Number</option><option value="date">Date</option><option value="select">Dropdown</option><option value="checkbox">Checkbox</option></Form.Select></Form.Group></Col>
        <Col xs={12} md={6}><Form.Group><Form.Label>Column Width</Form.Label><Form.Control type="number" min="1" max="12" step="1" value={selectedTemplateField.columnSpan||12} onChange={event=>updateTemplateField(selectedFieldIndex,"columnSpan",event.target.value)}/></Form.Group></Col>
        {selectedTemplateField.inputType==="select"&&<Col xs={12}><Form.Group><Form.Label>Dropdown Choices</Form.Label><Form.Control value={Array.isArray(selectedTemplateField.options)?selectedTemplateField.options.join(", "):selectedTemplateField.options||""} onChange={event=>updateTemplateField(selectedFieldIndex,"options",event.target.value.split(",").map(option=>option.trim()).filter(Boolean))} placeholder="Choices separated by commas"/></Form.Group></Col>}
        <Col xs={12}><Form.Group><Form.Label>Prompt / Placeholder</Form.Label><Form.Control value={selectedTemplateField.placeholder||""} onChange={event=>updateTemplateField(selectedFieldIndex,"placeholder",event.target.value)}/></Form.Group></Col>
       </Row>
       <div className="record-subtype-field-editor-actions"><Button type="button" size="sm" variant="outline-danger" onClick={()=>removeTemplateField(selectedFieldIndex)}>Remove Field</Button></div>
      </div>
     )}
    </section>
   )}

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
