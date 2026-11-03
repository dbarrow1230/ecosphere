import {useEffect,useState} from "react";
import {Alert,Button,Col,Form,Row,Tab,Tabs} from "react-bootstrap";
import RelationshipSelector from "../../components/RelationshipSelector.jsx";
import RichTextEditor from "../../components/RichTextEditor.jsx";

function ProcessFleetingNoteForm({
 form,
 setForm,
 userId="",
 projects=[],
 recordSubtypes=[],
 onSubtypeCreated=()=>{},
 sources=[],
 entities=[],
 zettels=[],
 structureNotes=[],
 outputs=[],
 saving=false,
 error="",
 onSubmit
}){
 const [addedSubtypes,setAddedSubtypes]=useState([]);
 const [showAddEntityType,setShowAddEntityType]=useState(false);
 const [newEntityType,setNewEntityType]=useState({name:"",code:"",description:""});
 const [typeError,setTypeError]=useState("");
 const [savingType,setSavingType]=useState(false);

 const toCode=value=>String(value||"").trim().toUpperCase().replace(/[^A-Z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,24);
 const toSubjectCode=value=>String(value||"").trim().toUpperCase().split(/[^A-Z0-9]+/).filter(Boolean).map(word=>word.slice(0,3)).join("").slice(0,12);

 // Helper: keep the selected status valid for the target model
 useEffect(()=>{
  const targetType=form.targetType||"ZTL";

  const allowedStatuses={
   ZTL:["draft","active","reviewed","archived"],
   SRC:["draft","active","archived"],
   ENT:["active","archived"],
   STR:["draft","active","reviewed","archived"],
   OUT:["draft","active","published","archived"]
  };

  const defaultStatuses={
   ZTL:"active",
   SRC:"active",
   ENT:"active",
   STR:"active",
   OUT:"active"
  };

  const allowed=allowedStatuses[targetType]||["active"];

  if(allowed.includes(form.status))return;

  setForm(current=>({
   ...current,
   status:defaultStatuses[targetType]||"active"
  }));
 },[form.targetType,form.status,setForm]);

 const updateField=(field,value)=>{
  setForm(current=>({...current,[field]:value}));
 };

 const changeTargetType=value=>{
  const defaults={
   ZTL:{subtype:"",status:"active"},
   SRC:{subtype:"",status:"active"},
   ENT:{entityType:"",status:"active"},
   STR:{subtype:"",status:"active"},
   OUT:{outputType:"",status:"active"}
  };

  setForm(current=>({
   ...current,
   targetType:value,
   ...(defaults[value]||{}),
   sourceIds:[],
   entityIds:[],
   relatedSourceIds:[],
   linkedZettelIds:[],
   linkedOutputIds:[],
   linkedSources:[],
   linkedZettels:[],
   linkedOutputs:[],
   zettelIds:[],
   structureNoteIds:[]
  }));
 };

 const multiSelect=(label,field,records,idField,titleField)=>{
  return <RelationshipSelector label={label} value={form[field]||[]} records={records} idField={idField} titleField={titleField} onChange={value=>updateField(field,value)}/>;
 };

 const subtypeOptions=recordType=>[...recordSubtypes,...addedSubtypes].filter(type=>{
  return String(type.recordType||"").toUpperCase()===recordType&&String(type.status||"active").toLowerCase()==="active";
 });

 const updateEntityName=value=>{
  setForm(current=>{
   const previousGeneratedCode=toSubjectCode(current.name);
   const code=!current.code||current.code===previousGeneratedCode?toSubjectCode(value):current.code;
   return {...current,name:value,code};
  });
 };

 const createEntityType=async()=>{
  const name=String(newEntityType.name||"").trim();
  const code=toCode(newEntityType.code||name);
  if(!userId||!name||!code)return;
  setSavingType(true);
  setTypeError("");
  try{
   const response=await fetch("/api/record-subtypes",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    credentials:"include",
    body:JSON.stringify({userId,recordType:"ENT",name,code,description:newEntityType.description,status:"active"})
   });
   const data=await response.json().catch(()=>null);
   if(!response.ok)throw new Error(data?.message||"Unable to add entity type");
   setAddedSubtypes(current=>[...current.filter(type=>type._id!==data.data._id),data.data]);
   onSubtypeCreated(data.data);
   updateField("entityType",data.data.code);
   setNewEntityType({name:"",code:"",description:""});
   setShowAddEntityType(false);
  }catch(error){
   setTypeError(error.message);
  }finally{
   setSavingType(false);
  }
 };

 return(
  <Form className="process-fleeting-form" onSubmit={onSubmit}>
   {error&&<Alert variant="danger">{error}</Alert>}
   <Row>
    <Col xs={12} md={6}>
     <Form.Group className="mb-3">
      <Form.Label>Create Record Type</Form.Label>
      <Form.Select value={form.targetType||"ZTL"} onChange={event=>changeTargetType(event.target.value)}>
       <option value="ZTL">Zettel</option>
       <option value="SRC">Source</option>
       <option value="ENT">Entity</option>
       <option value="STR">Structure Note</option>
       <option value="OUT">Output</option>
      </Form.Select>
     </Form.Group>
    </Col>

    <Col xs={12} md={6}>
     <Form.Group className="mb-3">
      <Form.Label>Projects (optional)</Form.Label>
      <Form.Select multiple value={form.projectIds||[]} onChange={event=>{const projectIds=[...event.target.selectedOptions].map(option=>option.value);setForm(current=>({...current,projectIds,projectId:projectIds[0]||""}));}}>
       {projects.map(project=>(
        <option key={project._id} value={project._id}>
         {project.projectId||project.code} - {project.title}
        </option>
       ))}
      </Form.Select>
      <Form.Text>Select none, one, or several projects.</Form.Text>
     </Form.Group>
    </Col>
   </Row>

   <Form.Group className="mb-3">
    <Form.Label>{form.targetType==="ENT"?"Name":"Title"}</Form.Label>
    <Form.Control
     required
     value={form.targetType==="ENT"?form.name||"":form.title||""}
     onChange={event=>form.targetType==="ENT"?updateEntityName(event.target.value):updateField("title",event.target.value)}
    />
   </Form.Group>

   {form.targetType==="ZTL"&&(
    <>
     <Row>
      <Col xs={12} md={6}>
       <Form.Group className="mb-3">
        <Form.Label>Subtype</Form.Label>
        <Form.Select required value={form.subtype||""} onChange={event=>updateField("subtype",event.target.value)}>
         <option value="">Select Subtype</option>
         {subtypeOptions("ZTL").map(subtype=>(
          <option key={subtype._id} value={subtype._id}>
           {subtype.code} - {subtype.name}
          </option>
         ))}
        </Form.Select>
       </Form.Group>
      </Col>

      <Col xs={12} md={6}>
       <Form.Group className="mb-3">
        <Form.Label>Status</Form.Label>
        <Form.Select value={form.status||"active"} onChange={event=>updateField("status",event.target.value)}>
         <option value="draft">Draft</option>
         <option value="active">Active</option>
         <option value="reviewed">Reviewed</option>
         <option value="archived">Archived</option>
        </Form.Select>
       </Form.Group>
      </Col>
     </Row>

     <Form.Group className="mb-3">
      <Form.Label>Main Idea</Form.Label>
      <RichTextEditor value={form.mainIdea||""} onChange={value=>updateField("mainIdea",value)} placeholder="State the processed thought in your own words." minHeight="7rem"/>
     </Form.Group>

     <Form.Group className="mb-3">
      <Form.Label>Body</Form.Label>
      <RichTextEditor value={form.body||""} onChange={value=>updateField("body",value)} placeholder="Develop the permanent note." minHeight="14rem"/>
     </Form.Group>

     {multiSelect("Sources","sourceIds",sources,"sourceId","title")}
     {multiSelect("Entities","entityIds",entities,"entityId","name")}

     <Form.Group className="mb-3">
      <Form.Label>Future Use</Form.Label>
      <Form.Control
       value={form.futureUse||""}
       onChange={event=>updateField("futureUse",event.target.value)}
       placeholder="Separate values with commas"
      />
     </Form.Group>

     <Form.Group className="mb-3">
      <Form.Label>Questions</Form.Label>
      <Form.Control
       value={form.questions||""}
       onChange={event=>updateField("questions",event.target.value)}
       placeholder="Separate questions with commas"
      />
     </Form.Group>

     <Form.Check
      className="mb-3"
      type="checkbox"
      id="process-zettel-favorite"
      label="Favorite"
      checked={Boolean(form.isFavorite)}
      onChange={event=>updateField("isFavorite",event.target.checked)}
     />
    </>
   )}

   {form.targetType==="SRC"&&(
    <>
     <Row>
      <Col xs={12} md={6}>
       <Form.Group className="mb-3">
        <Form.Label>Subtype</Form.Label>
        <Form.Select required value={form.subtype||""} onChange={event=>updateField("subtype",event.target.value)}>
         <option value="">Select Source Type</option>
         {subtypeOptions("SRC").map(type=><option key={type._id} value={type._id}>{type.code} - {type.name}</option>)}
        </Form.Select>
       </Form.Group>
      </Col>

      <Col xs={12} md={6}>
       <Form.Group className="mb-3">
        <Form.Label>Status</Form.Label>
        <Form.Select value={form.status||"active"} onChange={event=>updateField("status",event.target.value)}>
         <option value="draft">Draft</option>
         <option value="active">Active</option>
         <option value="archived">Archived</option>
        </Form.Select>
       </Form.Group>
      </Col>
     </Row>

     <Row>
      <Col xs={12} md={6}>
       <Form.Group className="mb-3">
        <Form.Label>Author</Form.Label>
        <Form.Control value={form.author||""} onChange={event=>updateField("author",event.target.value)}/>
       </Form.Group>
      </Col>

      <Col xs={12} md={6}>
       <Form.Group className="mb-3">
        <Form.Label>Publisher</Form.Label>
        <Form.Control value={form.publisher||""} onChange={event=>updateField("publisher",event.target.value)}/>
       </Form.Group>
      </Col>
     </Row>

     <Form.Group className="mb-3">
      <Form.Label>Original URL</Form.Label>
      <Form.Control type="url" value={form.originalUrl||""} onChange={event=>updateField("originalUrl",event.target.value)}/>
     </Form.Group>

     <Form.Group className="mb-3">
      <Form.Label>File Path</Form.Label>
      <Form.Control value={form.filePath||""} onChange={event=>updateField("filePath",event.target.value)}/>
     </Form.Group>

     <Row>
      <Col xs={12} md={4}>
       <Form.Group className="mb-3">
        <Form.Label>Access Date</Form.Label>
        <Form.Control type="date" value={form.accessDate||""} onChange={event=>updateField("accessDate",event.target.value)}/>
       </Form.Group>
      </Col>

      <Col xs={12} md={4}>
       <Form.Group className="mb-3">
        <Form.Label>Archive Type</Form.Label>
        <Form.Control value={form.archiveType||""} onChange={event=>updateField("archiveType",event.target.value)}/>
       </Form.Group>
      </Col>

      <Col xs={12} md={4}>
       <Form.Group className="mb-3">
        <Form.Label>Archive Location</Form.Label>
        <Form.Control value={form.archiveLocation||""} onChange={event=>updateField("archiveLocation",event.target.value)}/>
       </Form.Group>
      </Col>
     </Row>

     <Form.Group className="mb-3">
      <Form.Label>Copied Text</Form.Label>
      <RichTextEditor value={form.copiedText||""} onChange={value=>updateField("copiedText",value)} placeholder="Preserve the source extract." minHeight="14rem"/>
     </Form.Group>

     <Form.Group className="mb-3">
      <Form.Label>Summary</Form.Label>
      <RichTextEditor value={form.summary||""} onChange={value=>updateField("summary",value)} placeholder="Summarize the source and its value." minHeight="7rem"/>
     </Form.Group>

     {multiSelect("Entities","entityIds",entities,"entityId","name")}
    </>
   )}

   {form.targetType==="ENT"&&(
    <>
     <Tabs defaultActiveKey="details" className="mb-4">
      <Tab eventKey="details" title="Entity Details">
       <Row>
        <Col xs={12} md={4}>
         <Form.Group className="mb-3">
          <Form.Label>Entity Type</Form.Label>
          <Form.Select required value={form.entityType||""} onChange={event=>updateField("entityType",event.target.value)}>
           <option value="">Select Entity Type</option>
           {subtypeOptions("ENT").map(type=><option key={type._id} value={type.code}>{type.code} - {type.name}</option>)}
          </Form.Select>
          <div className="d-flex gap-2 mt-2">
           <Button type="button" size="sm" variant="outline-primary" onClick={()=>setShowAddEntityType(current=>!current)}>Add Type</Button>
          </div>
          {showAddEntityType&&(
           <div className="mt-2">
            <Form.Control className="mb-2" value={newEntityType.name} onChange={event=>setNewEntityType(current=>({...current,name:event.target.value}))} placeholder="Type name"/>
            <Form.Control className="mb-2" value={newEntityType.code} onChange={event=>setNewEntityType(current=>({...current,code:event.target.value.toUpperCase()}))} placeholder="Code (generated from name if blank)"/>
            <Form.Control className="mb-2" value={newEntityType.description} onChange={event=>setNewEntityType(current=>({...current,description:event.target.value}))} placeholder="Description"/>
            <Button type="button" size="sm" disabled={savingType||!newEntityType.name.trim()} onClick={createEntityType}>Save and Select Type</Button>
           </div>
          )}
          {typeError&&<Form.Text className="text-danger d-block">{typeError}</Form.Text>}
         </Form.Group>
        </Col>

        <Col xs={12} md={4}>
         <Form.Group className="mb-3">
          <Form.Label>Code</Form.Label>
          <Form.Control className="process-generated-code" value={form.code||""} onChange={event=>updateField("code",event.target.value.toUpperCase())}/>
         </Form.Group>
        </Col>

        <Col xs={12} md={4}>
         <Form.Group className="mb-3">
          <Form.Label>Status</Form.Label>
          <Form.Select value={form.status||"active"} onChange={event=>updateField("status",event.target.value)}>
           <option value="active">Active</option>
           <option value="archived">Archived</option>
          </Form.Select>
         </Form.Group>
        </Col>
       </Row>

       <Form.Group className="mb-3">
        <Form.Label>Description</Form.Label>
        <RichTextEditor value={form.description||""} onChange={value=>updateField("description",value)} placeholder="Describe this entity." minHeight="8rem"/>
       </Form.Group>

       <Form.Group className="mb-3">
        <Form.Label>Role / Use</Form.Label>
        <RichTextEditor value={form.roleUse||""} onChange={value=>updateField("roleUse",value)} placeholder="Explain how this entity is used." minHeight="6rem"/>
       </Form.Group>

       <Form.Group className="mb-3">
        <Form.Label>Aliases</Form.Label>
        <Form.Control
         value={form.aliases||""}
         onChange={event=>updateField("aliases",event.target.value)}
         placeholder="Separate aliases with commas"
        />
       </Form.Group>
      </Tab>

      <Tab eventKey="relationships" title="Sources & Links">
       {multiSelect("Related Sources","relatedSourceIds",sources,"sourceId","title")}
       {multiSelect("Linked Zettels","linkedZettelIds",zettels,"zettelId","title")}
       {multiSelect("Linked Outputs","linkedOutputIds",outputs,"outputId","title")}
      </Tab>
     </Tabs>
    </>
   )}

   {form.targetType==="STR"&&(
    <>
     <Row>
      <Col xs={12} md={6}>
       <Form.Group className="mb-3">
        <Form.Label>ID Subtype</Form.Label>
        <Form.Select required value={form.subtype||""} onChange={event=>updateField("subtype",event.target.value)}>
         <option value="">Select Structure Type</option>
         {subtypeOptions("STR").map(type=><option key={type._id} value={type.code}>{type.code} - {type.name}</option>)}
        </Form.Select>
       </Form.Group>
      </Col>

      <Col xs={12} md={6}>
       <Form.Group className="mb-3">
        <Form.Label>Status</Form.Label>
        <Form.Select value={form.status||"active"} onChange={event=>updateField("status",event.target.value)}>
         <option value="draft">Draft</option>
         <option value="active">Active</option>
         <option value="reviewed">Reviewed</option>
         <option value="archived">Archived</option>
        </Form.Select>
       </Form.Group>
      </Col>
     </Row>

     <Form.Group className="mb-3">
      <Form.Label>Purpose</Form.Label>
      <RichTextEditor value={form.purpose||""} onChange={value=>updateField("purpose",value)} placeholder="Explain what this structure organizes." minHeight="7rem"/>
     </Form.Group>

     <Form.Group className="mb-3">
      <Form.Label>Summary</Form.Label>
      <RichTextEditor value={form.summary||""} onChange={value=>updateField("summary",value)} placeholder="Summarize the structure." minHeight="7rem"/>
     </Form.Group>

     <Form.Group className="mb-3">
      <Form.Label>Outline</Form.Label>
      <RichTextEditor value={form.outline||""} onChange={value=>updateField("outline",value)} placeholder="Arrange the ordered outline." minHeight="16rem"/>
     </Form.Group>

     {multiSelect("Zettels","zettelIds",zettels,"zettelId","title")}
     {multiSelect("Sources","sourceIds",sources,"sourceId","title")}
     {multiSelect("Entities","entityIds",entities,"entityId","name")}

     <Form.Check
      className="mb-3"
      type="checkbox"
      id="process-structure-favorite"
      label="Favorite"
      checked={Boolean(form.isFavorite)}
      onChange={event=>updateField("isFavorite",event.target.checked)}
     />
    </>
   )}

   {form.targetType==="OUT"&&(
    <>
     <Tabs defaultActiveKey="details" className="mb-4">
      <Tab eventKey="details" title="Output Details">
       <Row>
        <Col xs={12} md={6}>
         <Form.Group className="mb-3">
          <Form.Label>Output Type</Form.Label>
          <Form.Select required value={form.outputType||""} onChange={event=>updateField("outputType",event.target.value)}>
           <option value="">Select Output Type</option>
           {subtypeOptions("OUT").map(type=><option key={type._id} value={type.code}>{type.code} - {type.name}</option>)}
          </Form.Select>
         </Form.Group>
        </Col>

        <Col xs={12} md={6}>
         <Form.Group className="mb-3">
          <Form.Label>Status</Form.Label>
          <Form.Select value={form.status||"active"} onChange={event=>updateField("status",event.target.value)}>
           <option value="draft">Draft</option>
           <option value="active">Active</option>
           <option value="published">Published</option>
           <option value="archived">Archived</option>
          </Form.Select>
         </Form.Group>
        </Col>
       </Row>

       <Form.Group className="mb-3">
        <Form.Label>Description</Form.Label>
        <RichTextEditor value={form.description||""} onChange={value=>updateField("description",value)} placeholder="Describe the intended output." minHeight="7rem"/>
       </Form.Group>

       <Form.Group className="mb-3">
        <Form.Label>Body</Form.Label>
        <RichTextEditor value={form.body||""} onChange={value=>updateField("body",value)} placeholder="Draft the output." minHeight="16rem"/>
       </Form.Group>

       <Form.Group className="mb-3">
        <Form.Label>Final Document Path</Form.Label>
        <Form.Control value={form.documentPath||""} onChange={event=>updateField("documentPath",event.target.value)} placeholder="Example: E:\\Documents\\Final Document.docx"/>
        <Form.Text>Only the path is stored. The file is not copied into MongoDB.</Form.Text>
       </Form.Group>

       <Form.Check
        className="mb-3"
        type="checkbox"
        id="process-output-favorite"
        label="Favorite"
        checked={Boolean(form.isFavorite)}
        onChange={event=>updateField("isFavorite",event.target.checked)}
       />
      </Tab>

      <Tab eventKey="relationships" title="Sources & Links">
       {multiSelect("Zettels","zettelIds",zettels,"zettelId","title")}
       {multiSelect("Sources","sourceIds",sources,"sourceId","title")}
       {multiSelect("Entities","entityIds",entities,"entityId","name")}
       {multiSelect("Structure Notes","structureNoteIds",structureNotes,"structureNoteId","title")}
      </Tab>
     </Tabs>
    </>
   )}

   <Form.Group className="mb-3">
    <Form.Label>Tags</Form.Label>
    <Form.Control
     value={form.tags||""}
     onChange={event=>updateField("tags",event.target.value)}
     placeholder="Separate tags with commas"
    />
   </Form.Group>

   <div className="text-end">
    <Button type="submit" disabled={saving}>
     {saving?"Processing...":"Create Record and Mark Processed"}
    </Button>
   </div>
  </Form>
 );
}

export default ProcessFleetingNoteForm;
