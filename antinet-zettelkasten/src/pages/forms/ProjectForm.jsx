import useDomainIdPreview from "../../hooks/useDomainIdPreview.js";
import {useEffect} from "react";
import {Button,Col,Form,Row} from "react-bootstrap";
import DomainSelect from "../../components/DomainSelect.jsx";

// Helper: generate the project code from the project title
const toProjectCode=value=>{
 const words=String(value||"")
  .trim()
  .toUpperCase()
  .split(/[^A-Z0-9]+/)
  .filter(Boolean);

 if(["A","AN","THE"].includes(words[0])){
  words.shift();
 }

 return words.join("").slice(0,24);
};

function ProjectForm({
 form,
 setForm,
 types=[],
 editing=null,
 saving=false,
 onSubmit
}){
 const domainIdPreview=useDomainIdPreview({form,editing,recordType:"PRJ",idField:"projectId",subtype:types.find(type=>type._id===form.typeId)?.code||editing?.typeId?.code,subject:form.title});
 useEffect(()=>{
  const code=toProjectCode(form.title);

  if(form.code===code)return;

  setForm(current=>({
   ...current,
   code
  }));
 },[form.title,form.code,setForm]);

 // Helper: update one project field
 const updateField=(field,value)=>{
  setForm(current=>({...current,[field]:value}));
 };

 // Helper: update the title and generated project code
 const updateTitle=value=>{
  setForm(current=>({
   ...current,
   title:value,
   code:toProjectCode(value)
  }));
 };

 // Helper: keep archived status and flag synchronized
 const updateStatus=value=>{
  setForm(current=>({
   ...current,
   status:value,
   isArchived:value==="archived"
  }));
 };

 // Helper: update the archive flag and matching status
 const updateArchived=checked=>{
  setForm(current=>({
   ...current,
   isArchived:checked,
   status:checked
    ?"archived"
    :current.status==="archived"
     ?"active"
     :current.status
  }));
 };

 return(
  <Form onSubmit={onSubmit}>
   <DomainSelect value={form.domainId} onChange={(domainId,domain)=>setForm(current=>({...current,domainId,domainCode:domain?.code||""}))}/>
   {editing?._id&&(
    <Form.Group className="mb-3">
     <Form.Label>Project ID</Form.Label>
     <Form.Control value={domainIdPreview} readOnly/>
    </Form.Group>
   )}

   <Row>
    <Col xs={12} md={8}>
     <Form.Group className="mb-3">
      <Form.Label>Title</Form.Label>
      <Form.Control
       required
       value={form.title}
       onChange={event=>updateTitle(event.target.value)}
      />
     </Form.Group>
    </Col>

    <Col xs={12} md={4}>
     <Form.Group className="mb-3">
      <Form.Label>Project Code</Form.Label>
      <Form.Control
       required
       value={form.code}
       readOnly
       placeholder="Generated from title"
      />
     </Form.Group>
    </Col>
   </Row>

   <Row>
    <Col xs={12} md={8}>
     <Form.Group className="mb-3">
      <Form.Label>Project Type</Form.Label>
      <Form.Select
       required
       value={form.typeId}
       onChange={event=>updateField("typeId",event.target.value)}
      >
       <option value="">Choose Project Type</option>

       {types.map(type=>(
        <option key={type._id} value={type._id}>
         {type.name}
         {type.code?` - ${type.code}`:""}
        </option>
       ))}
      </Form.Select>
     </Form.Group>
    </Col>

    <Col xs={12} md={4}>
     <Form.Group className="mb-3">
      <Form.Label>Status</Form.Label>
      <Form.Select
       value={form.status}
       onChange={event=>updateStatus(event.target.value)}
      >
       <option value="active">Active</option>
       <option value="paused">Paused</option>
       <option value="archived">Archived</option>
      </Form.Select>
     </Form.Group>
    </Col>
   </Row>

   <Form.Group className="mb-3">
    <Form.Label>Description</Form.Label>
    <Form.Control
     as="textarea"
     rows={5}
     value={form.description}
     onChange={event=>updateField("description",event.target.value)}
     placeholder="Describe the work area, collection, or project purpose."
    />
   </Form.Group>

   <Form.Group className="mb-3">
    <Form.Label>Tags</Form.Label>
    <Form.Control
     value={form.tags}
     onChange={event=>updateField("tags",event.target.value)}
     placeholder="Comma-separated tags"
    />
   </Form.Group>

   <Row>
    <Col xs={12} md={6}>
     <Form.Group className="mb-3">
      <Form.Label>Favorite</Form.Label>
      <Form.Check
       type="switch"
       checked={form.isFavorite}
       onChange={event=>updateField(
        "isFavorite",
        event.target.checked
       )}
       label={form.isFavorite?"Yes":"No"}
      />
     </Form.Group>
    </Col>

    <Col xs={12} md={6}>
     <Form.Group className="mb-3">
      <Form.Label>Archived</Form.Label>
      <Form.Check
       type="switch"
       checked={form.isArchived}
       onChange={event=>updateArchived(event.target.checked)}
       label={form.isArchived?"Yes":"No"}
      />
     </Form.Group>
    </Col>
   </Row>

   <div className="text-end">
    <Button type="submit" disabled={saving}>
     {saving
      ?"Saving..."
      :editing?._id
       ?"Save Changes"
       :"Save Project"}
    </Button>
   </div>
  </Form>
 );
}

export default ProjectForm;
