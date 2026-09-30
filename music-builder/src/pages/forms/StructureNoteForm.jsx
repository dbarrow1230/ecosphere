import {Button,Col,Form,Row,Tab,Tabs} from "react-bootstrap";
import RelationshipSelector from "../../components/RelationshipSelector.jsx";
import RichTextEditor from "../../components/RichTextEditor.jsx";

function StructureNoteForm({
 form,
 setForm,
 projects=[],
 zettels=[],
 sources=[],
 entities=[],
 editing=null,
 saving=false,
 onSubmit
}){
 // Helper: update one form field
 const updateField=(field,value)=>{
  setForm(current=>({...current,[field]:value}));
 };

 // Helper: move one zettel within the ordered structure path
 const movePathEntry=(index,direction)=>{
  setForm(current=>{
   const pathEntries=[...(current.pathEntries||[])];
   const nextIndex=index+direction;

   if(nextIndex<0||nextIndex>=pathEntries.length)return current;

   [pathEntries[index],pathEntries[nextIndex]]=[pathEntries[nextIndex],pathEntries[index]];
   return {...current,pathEntries,zettelIds:pathEntries.map(entry=>entry.zettelId)};
  });
 };

 // Helper: update one ordered-path annotation
 const updatePathAnnotation=(index,annotation)=>{
  setForm(current=>({
   ...current,
   pathEntries:(current.pathEntries||[]).map((entry,entryIndex)=>entryIndex===index?{...entry,annotation}:entry)
  }));
 };

 // Helper: synchronize selected zettels with ordered path entries
 const updatePathZettels=value=>{
  setForm(current=>{
   const existing=new Map((current.pathEntries||[]).map(entry=>[entry.zettelId,entry]));
   return {
    ...current,
    zettelIds:value,
    pathEntries:value.map(zettelId=>existing.get(zettelId)||{zettelId,annotation:""})
   };
  });
 };

 return(
  <Form onSubmit={onSubmit}>
   {editing?._id&&(
    <div className="structure-form-id">
     <span className="structure-form-id-label">Structure Note ID:</span>
     <code className="structure-form-id-value">{editing.structureNoteId||""}</code>
    </div>
   )}

   {!editing?._id&&(
    <Row>
     <Col xs={12} md={8}>
      <Form.Group className="mb-3">
       <Form.Label>Subject Code</Form.Label>
       <Form.Control
        value={form.subjectCode}
        onChange={event=>updateField(
         "subjectCode",
         event.target.value.toUpperCase()
        )}
        placeholder="Optional ID segment"
       />
      </Form.Group>
     </Col>

     <Col xs={12} md={4}>
      <Form.Group className="mb-3">
       <Form.Label>ID Subtype</Form.Label>
       <Form.Select
        required
        value={form.subtype}
        onChange={event=>updateField(
         "subtype",
         event.target.value.toUpperCase()
        )}
       >
        <option value="STUDYMAP">Study Map</option>
        <option value="BLOGMAP">Blog Map</option>
        <option value="CHARMAP">Character Map</option>
        <option value="RECIPEMAP">Recipe Map</option>
        <option value="POEMMAP">Poem Map</option>
        <option value="RESEARCHMAP">Research Map</option>
       </Form.Select>
      </Form.Group>
     </Col>
    </Row>
   )}

   <Tabs defaultActiveKey="details" className="mb-4">
    <Tab eventKey="details" title="Structure Details">

   <Form.Group className="mb-3">
    <Form.Label>Projects (optional)</Form.Label>
    <Form.Select
     multiple
     value={form.projectIds||[]}
     onChange={event=>{const projectIds=[...event.target.selectedOptions].map(option=>option.value);setForm(current=>({...current,projectIds,projectId:projectIds[0]||""}));}}
    >
     {projects.map(project=>(
      <option key={project._id} value={project._id}>
       {project.projectId} - {project.title}
      </option>
     ))}
    </Form.Select>
    <Form.Text>Select none, one, or several projects.</Form.Text>
   </Form.Group>

   <Form.Group className="mb-3">
    <Form.Label>Title</Form.Label>
    <Form.Control
     required
     value={form.title}
     onChange={event=>updateField("title",event.target.value)}
    />
   </Form.Group>

   <Form.Group className="mb-3">
    <Form.Label>Purpose</Form.Label>
    <RichTextEditor value={form.purpose} onChange={value=>updateField("purpose",value)} placeholder="Explain what this structure note organizes and how it will be used." minHeight="7rem"/>
   </Form.Group>

   <Form.Group className="mb-3">
    <Form.Label>Summary</Form.Label>
    <RichTextEditor value={form.summary} onChange={value=>updateField("summary",value)} placeholder="Summarize this structure." minHeight="7rem"/>
   </Form.Group>

   <Form.Group className="mb-3">
    <Form.Label>Ordered Outline</Form.Label>
    <RichTextEditor value={form.outline} onChange={value=>updateField("outline",value)} placeholder="Arrange the path, sequence, sections, questions, or argument." minHeight="18rem"/>
   </Form.Group>

    </Tab>
    <Tab eventKey="relationships" title="Sources & Links">
     <RelationshipSelector label="Linked zettels" value={form.zettelIds} records={zettels} idField="zettelId" titleField="title" onChange={updatePathZettels}/>
     {(form.pathEntries||[]).map((entry,index)=>{
      const zettel=zettels.find(record=>record._id===entry.zettelId);
      return(
       <Form.Group className="mb-3" key={entry.zettelId}>
        <Form.Label>{index+1}. {zettel?.zettelId||"Zettel"} - {zettel?.title||"Selected zettel"}</Form.Label>
        <div className="d-flex gap-2 mb-2">
         <Button type="button" size="sm" variant="outline-secondary" disabled={index===0} onClick={()=>movePathEntry(index,-1)}>Move Up</Button>
         <Button type="button" size="sm" variant="outline-secondary" disabled={index===(form.pathEntries||[]).length-1} onClick={()=>movePathEntry(index,1)}>Move Down</Button>
        </div>
        <Form.Control value={entry.annotation||""} onChange={event=>updatePathAnnotation(index,event.target.value)} placeholder="Explain this zettel's place in the path."/>
       </Form.Group>
      );
     })}
     <RelationshipSelector label="Linked sources" value={form.sourceIds} records={sources} idField="sourceId" titleField="title" onChange={value=>updateField("sourceIds",value)}/>
     <RelationshipSelector label="Linked entities" value={form.entityIds} records={entities} idField="entityId" titleField="name" onChange={value=>updateField("entityIds",value)}/>
    </Tab>
   </Tabs>

   <Form.Group className="mb-3">
    <Form.Label>Tags</Form.Label>
    <Form.Control
     value={form.tags}
     onChange={event=>updateField("tags",event.target.value)}
     placeholder="Separate tags with commas"
    />
   </Form.Group>

   <Row>
    <Col xs={12} md={8}>
     <Form.Group className="mb-3">
      <Form.Label>Status</Form.Label>
      <Form.Select
       value={form.status}
       onChange={event=>updateField("status",event.target.value)}
      >
       <option value="draft">Draft</option>
       <option value="active">Active</option>
       <option value="reviewed">Reviewed</option>
       <option value="archived">Archived</option>
      </Form.Select>
     </Form.Group>
    </Col>

    <Col xs={12} md={4}>
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
   </Row>

   <div className="text-end">
    <Button type="submit" disabled={saving}>
     {saving
      ?"Saving..."
      :editing?._id
       ?"Save Changes"
       :"Save Structure Note"}
    </Button>
   </div>
  </Form>
 );
}

export default StructureNoteForm;
