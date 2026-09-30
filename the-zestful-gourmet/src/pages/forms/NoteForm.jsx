import {useEffect,useMemo,useState} from "react";
import {Alert,Button,Card,Container,Form,Spinner,Tab,Tabs} from "react-bootstrap";
import RichTextEditor from "../../components/RichTextEditor.jsx";
import {richTextToPlainText} from "../../utils/richText.js";

const emptyForm={
 projectIds:[],
 subjectCode:"",
 title:"",
 mainIdea:"",
 body:"",
 subtype:"IDEA",
 futureUse:[""],
 questions:[""],
 tags:[],
 status:"draft",
 isFavorite:false,
 sourceIds:[],
 entityIds:[],
 originFleetingNoteId:""
};

const toCode=value=>String(value||"")
 .trim()
 .toUpperCase()
 .replace(/[^A-Z0-9]+/g,"-")
 .replace(/^-+|-+$/g,"")
 .slice(0,24);

const getObjectId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 if(typeof value.$oid==="string")return value.$oid;
 if(typeof value._id==="string")return value._id;
 if(typeof value.id==="string")return value.id;
 if(typeof value._id?.$oid==="string")return value._id.$oid;
 if(typeof value.id?.$oid==="string")return value.id.$oid;
 return "";
};

// Helper: normalize populated subtype records and plain subtype codes
const getSubtypeCode=value=>{
 if(!value)return "IDEA";

 if(typeof value==="string"){
  return value.toUpperCase();
 }

 if(typeof value==="object"){
  return String(
   value.code||
   value.name||
   value.recordType||
   "IDEA"
  ).toUpperCase();
 }

 return "IDEA";
};

const getStoredUserId=()=>{
 for(const key of ["userInfo","user","authUser","currentUser"]){
  try{
   const value=JSON.parse(localStorage.getItem(key)||sessionStorage.getItem(key)||"null");
   const id=getObjectId(value?.user||value?.data||value);

   if(id)return id;
  }catch{
   continue;
  }
 }

 return "";
};

const normalizeTextArray=value=>{
 if(Array.isArray(value)){
  const cleaned=value
   .map(item=>String(item||"").trim())
   .filter(Boolean);

  return cleaned.length?cleaned:[""];
 }

 const text=String(value||"").trim();

 return text?[text]:[""];
};

const normalizeObjectIdArray=value=>{
 if(!Array.isArray(value))return [];

 return value
  .map(item=>getObjectId(item))
  .filter(Boolean);
};

const selectedIds=select=>{
 return Array.from(select.selectedOptions).map(option=>option.value);
};

function TextArrayField({label,name,values,placeholder,onChange}){
 const updateItem=(index,value)=>{
  const nextValues=values.map((item,itemIndex)=>
   itemIndex===index?value:item
  );

  onChange(name,nextValues);
 };

 const addItem=()=>{
  onChange(name,[...values,""]);
 };

 const removeItem=index=>{
  const nextValues=values.filter((_,itemIndex)=>itemIndex!==index);

  onChange(name,nextValues.length?nextValues:[""]);
 };

 return(
  <Form.Group className="zettel-field zettel-field-full zettel-list-field">
   <Form.Label>{label}</Form.Label>

   <div className="form-field-content">
    {values.map((value,index)=>(
     <div className="d-flex align-items-start gap-2 mb-2" key={`${name}-${index}`}>
      <Form.Control
       as="textarea"
       rows={2}
       value={value}
       onChange={event=>updateItem(index,event.target.value)}
       placeholder={placeholder}
      />

      <Button
       type="button"
       size="sm"
       variant="outline-danger"
       onClick={()=>removeItem(index)}
       disabled={values.length===1&&!value}
      >
       Remove
      </Button>

      {index===values.length-1&&(
       <Button type="button" size="sm" variant="outline-primary" onClick={addItem}>
        Add
       </Button>
      )}
     </div>
    ))}
   </div>
  </Form.Group>
 );
}

function NoteForm({note,onSuccess,userId,autoFocusTitle}){
 const [form,setForm]=useState({...emptyForm});
 const [projects,setProjects]=useState([]);
 const [projectTypes,setProjectTypes]=useState([]);
 const [recordSubtypes,setRecordSubtypes]=useState([]);
 const [sources,setSources]=useState([]);
 const [entities,setEntities]=useState([]);
 const [fleetingNotes,setFleetingNotes]=useState([]);
 const [loadingOptions,setLoadingOptions]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [showAddProject,setShowAddProject]=useState(false);
 const [showAddSubtype,setShowAddSubtype]=useState(false);
 const [savingOption,setSavingOption]=useState(false);
 const [newProject,setNewProject]=useState({title:"",code:"",typeId:""});
 const [newSubtype,setNewSubtype]=useState({name:"",code:""});

 const resolvedUserId=getObjectId(userId)||getStoredUserId();
 const isEditing=Boolean(note?._id);

 useEffect(()=>{
  setForm({
   ...emptyForm,
   projectIds:[...new Set([
    ...(Array.isArray(note?.projectIds)?note.projectIds.map(getObjectId):[]),
    getObjectId(note?.projectId)
   ].filter(Boolean))],
   subjectCode:note?.subjectCode||"",
   title:note?.title||"",
   mainIdea:note?.mainIdea||"",
   body:note?.body||"",
   subtype:getSubtypeCode(note?.subtype),
   futureUse:normalizeTextArray(note?.futureUse),
   questions:normalizeTextArray(note?.questions),
   tags:Array.isArray(note?.tags)?note.tags:[],
   status:note?.status||"draft",
   isFavorite:Boolean(note?.isFavorite),
   sourceIds:normalizeObjectIdArray(note?.sourceIds),
   entityIds:normalizeObjectIdArray(note?.entityIds),
   originFleetingNoteId:getObjectId(note?.originFleetingNoteId)
  });
 },[note]);

 useEffect(()=>{
  let active=true;

  const loadOptions=async()=>{
   if(!resolvedUserId){
    if(active){
     setProjects([]);
     setProjectTypes([]);
     setRecordSubtypes([]);
     setSources([]);
     setEntities([]);
     setFleetingNotes([]);
     setLoadingOptions(false);
    }

    return;
   }

   try{
    setLoadingOptions(true);
    setError("");

    const query=`userId=${encodeURIComponent(resolvedUserId)}`;

    const [
     projectResponse,
     projectTypeResponse,
     subtypeResponse,
     sourceResponse,
     entityResponse,
     fleetingResponse
    ]=await Promise.all([
     fetch(`/api/projects?${query}&status=active`,{credentials:"include"}),
     fetch(`/api/project-types?${query}&status=active`,{credentials:"include"}),
     fetch(`/api/record-subtypes?${query}&recordType=ZTL&status=active`,{credentials:"include"}),
     fetch(`/api/sources?${query}&status=active`,{credentials:"include"}),
     fetch(`/api/entities?${query}&status=active`,{credentials:"include"}),
     fetch(`/api/fleeting-notes?${query}&includeProcessed=true`,{credentials:"include"})
    ]);

    const [
     projectData,
     projectTypeData,
     subtypeData,
     sourceData,
     entityData,
     fleetingData
    ]=await Promise.all([
     projectResponse.json().catch(()=>null),
     projectTypeResponse.json().catch(()=>null),
     subtypeResponse.json().catch(()=>null),
     sourceResponse.json().catch(()=>null),
     entityResponse.json().catch(()=>null),
     fleetingResponse.json().catch(()=>null)
    ]);

    if(!projectResponse.ok){
     throw new Error(projectData?.message||"Unable to load projects");
    }

    if(!projectTypeResponse.ok){
     throw new Error(projectTypeData?.message||"Unable to load project types");
    }

    if(!subtypeResponse.ok){
     throw new Error(subtypeData?.message||"Unable to load zettel subtypes");
    }

    if(!sourceResponse.ok){
     throw new Error(sourceData?.message||"Unable to load sources");
    }

    if(!entityResponse.ok){
     throw new Error(entityData?.message||"Unable to load entities");
    }

    if(!fleetingResponse.ok){
     throw new Error(fleetingData?.message||"Unable to load fleeting notes");
    }

    if(active){
     setProjects(Array.isArray(projectData?.data)?projectData.data:[]);
     setProjectTypes(Array.isArray(projectTypeData?.data)?projectTypeData.data:[]);
     setRecordSubtypes(Array.isArray(subtypeData?.data)?subtypeData.data:[]);
     setSources(Array.isArray(sourceData?.data)?sourceData.data:[]);
     setEntities(Array.isArray(entityData?.data)?entityData.data:[]);
     setFleetingNotes(Array.isArray(fleetingData?.data)?fleetingData.data:[]);
    }
   }catch(loadError){
    if(active)setError(loadError.message);
   }finally{
    if(active)setLoadingOptions(false);
   }
  };

  loadOptions();

  return()=>{
   active=false;
  };
 },[resolvedUserId]);

 const createProject=async()=>{
  const title=newProject.title.trim();
  const code=toCode(newProject.code||title);
  if(!title||!code||!newProject.typeId)return;

  setSavingOption(true);
  setError("");

  try{
   const response=await fetch("/api/projects",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    credentials:"include",
    body:JSON.stringify({
     userId:resolvedUserId,
     title,
     code,
     typeId:newProject.typeId,
     status:"active"
    })
   });
   const data=await response.json().catch(()=>null);
   if(!response.ok)throw new Error(data?.message||"Unable to add project");

   const created=data.data;
   setProjects(current=>[...current.filter(item=>item._id!==created._id),created]
    .sort((a,b)=>a.title.localeCompare(b.title)));
   setForm(current=>({...current,projectIds:[...new Set([...current.projectIds,created._id])]}));
   setNewProject({title:"",code:"",typeId:""});
   setShowAddProject(false);
  }catch(createError){
   setError(createError.message);
  }finally{
   setSavingOption(false);
  }
 };

 const createSubtype=async()=>{
  const name=newSubtype.name.trim();
  const code=toCode(newSubtype.code||name);
  if(!name||!code)return;

  setSavingOption(true);
  setError("");

  try{
   const response=await fetch("/api/record-subtypes",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    credentials:"include",
    body:JSON.stringify({userId:resolvedUserId,recordType:"ZTL",name,code,status:"active"})
   });
   const data=await response.json().catch(()=>null);
   if(!response.ok)throw new Error(data?.message||"Unable to add zettel subtype");

   const created=data.data;
   setRecordSubtypes(current=>[...current.filter(item=>item._id!==created._id),created]
    .sort((a,b)=>a.name.localeCompare(b.name)));
   setForm(current=>({...current,subtype:created.code}));
   setNewSubtype({name:"",code:""});
   setShowAddSubtype(false);
  }catch(createError){
   setError(createError.message);
  }finally{
   setSavingOption(false);
  }
 };

 const tagsText=useMemo(()=>{
  return form.tags.join(", ");
 },[form.tags]);

 const update=event=>{
  const {name,value,checked,type}=event.target;

  setForm(current=>({
   ...current,
   [name]:type==="checkbox"?checked:value
  }));
 };

 const updateTextArray=(name,values)=>{
  setForm(current=>({
   ...current,
   [name]:values
  }));
 };

 const submit=async event=>{
  event.preventDefault();
  setError("");

  if(!resolvedUserId){
   setError("Please log in before saving a zettel.");
   return;
  }

  if(!richTextToPlainText(form.mainIdea)){
   setError("Main Idea is required.");
   return;
  }

  setSaving(true);

  try{
   const payload={
    userId:resolvedUserId,
    projectIds:form.projectIds,
    projectId:form.projectIds[0]||null,
    subjectCode:form.subjectCode,
    title:form.title,
    mainIdea:form.mainIdea,
    body:form.body,
    subtype:form.subtype,
    sourceIds:form.sourceIds,
    entityIds:form.entityIds,
    originFleetingNoteId:form.originFleetingNoteId||null,
    futureUse:normalizeTextArray(form.futureUse)
     .map(item=>item.trim())
     .filter(Boolean),
    questions:normalizeTextArray(form.questions)
     .map(item=>item.trim())
     .filter(Boolean),
    tags:form.tags
     .map(tag=>String(tag||"").trim())
     .filter(Boolean),
    status:form.status,
    isFavorite:form.isFavorite
   };

   const response=await fetch(
    isEditing?`/api/zettels/${note._id}`:"/api/zettels",
    {
     method:isEditing?"PUT":"POST",
     headers:{"Content-Type":"application/json"},
     credentials:"include",
     body:JSON.stringify(payload)
    }
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(
     data?.message||
     `Unable to ${isEditing?"update":"save"} zettel`
    );
   }

   onSuccess?.(data.data);
  }catch(saveError){
   setError(saveError.message);
  }finally{
   setSaving(false);
  }
 };

 return(
  <Form className="zettel-form" onSubmit={submit}>
   {error&&(
    <Alert variant="danger">
     {error}
    </Alert>
   )}

   <Tabs defaultActiveKey="details" className="zettel-form-tabs">
    <Tab eventKey="details" title="Details">
     <Container fluid className="zettel-form-grid px-3 py-3">
    <Card className="zettel-id-builder zettel-field">
     <Card.Header className="zettel-id-builder-preview">
      <span>{isEditing?"Permanent ID":"ID Preview"}</span>
      <code>
       {isEditing
        ?note.zettelId
        :`ZTL-${projects.find(project=>project._id===form.projectIds[0])?.code||"PROJECT"}-${form.subtype||"SUBTYPE"}${form.subjectCode?`-${form.subjectCode}`:""}-###`}
      </code>
     </Card.Header>

     <Card.Body className="zettel-id-builder-grid">
      <Form.Group>
       <Form.Label>Record Prefix</Form.Label>
       <Form.Control value="ZTL" disabled readOnly/>
      </Form.Group>

      <Form.Group>
       <Form.Label>Subject Code</Form.Label>
      <Form.Control
       name="subjectCode"
       value={form.subjectCode}
       onChange={event=>setForm(current=>({
        ...current,
        subjectCode:event.target.value.toUpperCase()
       }))}
       placeholder="Optional, for example RAIN or QOH"
      />
      </Form.Group>
     </Card.Body>
    </Card>

    <Form.Group className="zettel-field zettel-field-title">
     <Form.Label>Title</Form.Label>
     <Form.Control
      autoFocus={autoFocusTitle}
      name="title"
      value={form.title}
      onChange={update}
      required
     />
    </Form.Group>

    <Form.Group className="zettel-field zettel-field-type">
     <Form.Label>Subtype</Form.Label>
     <div className="zettel-option-control">
      <Form.Select name="subtype" value={form.subtype} onChange={update} required>
       {form.subtype&&!recordSubtypes.some(subtype=>subtype.code===form.subtype)&&(
        <option value={form.subtype}>{form.subtype}</option>
       )}
       {recordSubtypes.map(subtype=>(
        <option key={subtype._id} value={subtype.code}>{subtype.code} - {subtype.name}</option>
       ))}
      </Form.Select>
      <Button type="button" size="sm" variant="outline-primary" onClick={()=>setShowAddSubtype(current=>!current)}>
       Add new
      </Button>
     </div>

     {showAddSubtype&&(
      <div className="zettel-inline-create">
       <Form.Control value={newSubtype.name} onChange={event=>setNewSubtype(current=>({...current,name:event.target.value}))} placeholder="Subtype name"/>
       <Form.Control value={newSubtype.code} onChange={event=>setNewSubtype(current=>({...current,code:event.target.value.toUpperCase()}))} placeholder="Code (generated if blank)"/>
       <Button type="button" size="sm" disabled={savingOption||!newSubtype.name.trim()} onClick={createSubtype}>
        {savingOption?"Saving...":"Save and select"}
       </Button>
      </div>
     )}
    </Form.Group>

    <Form.Group className="zettel-field zettel-field-full">
     <Form.Label>Main Idea</Form.Label>
     <RichTextEditor
      value={form.mainIdea}
      onChange={value=>setForm(current=>({...current,mainIdea:value}))}
      placeholder="State the single thought this zettel captures"
      minHeight="7rem"
     />
    </Form.Group>

    <Form.Group className="zettel-field zettel-field-full">
     <Form.Label>Projects</Form.Label>

     <div className="zettel-option-control">
      <Form.Select
       multiple
       value={form.projectIds}
       onChange={event=>setForm(current=>({...current,projectIds:selectedIds(event.target)}))}
       disabled={loadingOptions}
      >
       {projects.map(project=>(
        <option key={project._id} value={project._id}>
         {project.projectId||project.code} - {project.title}
        </option>
       ))}
      </Form.Select>

      <Button type="button" size="sm" variant="outline-primary" onClick={()=>setShowAddProject(current=>!current)}>
       Add new
      </Button>

      {loadingOptions&&(
       <Form.Text>
        <Spinner size="sm"/> Loading options...
       </Form.Text>
      )}
     </div>


     {showAddProject&&(
      <div className="zettel-inline-create">
       <Form.Control value={newProject.title} onChange={event=>setNewProject(current=>({...current,title:event.target.value}))} placeholder="Project title"/>
       <Form.Control value={newProject.code} onChange={event=>setNewProject(current=>({...current,code:event.target.value.toUpperCase()}))} placeholder="Project code (generated if blank)"/>
       <Form.Select value={newProject.typeId} onChange={event=>setNewProject(current=>({...current,typeId:event.target.value}))}>
        <option value="">Select project type</option>
        {projectTypes.map(type=><option key={type._id} value={type._id}>{type.code} - {type.name}</option>)}
       </Form.Select>
       <Button type="button" size="sm" disabled={savingOption||!newProject.title.trim()||!newProject.typeId} onClick={createProject}>
        {savingOption?"Saving...":"Save and select"}
       </Button>
      </div>
     )}
    </Form.Group>

     </Container>
    </Tab>

    <Tab eventKey="relationships" title="Relationships">
     <Container fluid className="zettel-form-grid px-3 py-3">

    <Form.Group className="zettel-field zettel-field-full">
     <Form.Label>Archived Sources</Form.Label>

     <Form.Select
      multiple
      value={form.sourceIds}
      onChange={event=>setForm(current=>({
       ...current,
       sourceIds:selectedIds(event.target)
      }))}
      disabled={loadingOptions}
     >
      {sources.map(source=>(
       <option key={source._id} value={source._id}>
        {source.sourceId} - {source.title}
       </option>
      ))}
     </Form.Select>

     <Form.Text>
      Select the source material this zettel processes.
     </Form.Text>
    </Form.Group>

    <Form.Group className="zettel-field zettel-field-full">
     <Form.Label>Entities</Form.Label>

     <Form.Select
      multiple
      value={form.entityIds}
      onChange={event=>setForm(current=>({
       ...current,
       entityIds:selectedIds(event.target)
      }))}
      disabled={loadingOptions}
     >
      {entities.map(entity=>(
       <option key={entity._id} value={entity._id}>
        {entity.entityId} - {entity.name}
       </option>
      ))}
     </Form.Select>

     <Form.Text>
      Select the people, concepts, places, symbols, ingredients, tools, or other entities connected to this thought.
     </Form.Text>
    </Form.Group>

    <Form.Group className="zettel-field zettel-field-full">
     <Form.Label>Origin Fleeting Note</Form.Label>

     <Form.Select
      name="originFleetingNoteId"
      value={form.originFleetingNoteId}
      onChange={update}
      disabled={loadingOptions}
     >
      <option value="">No Fleeting Note Origin</option>

      {fleetingNotes.map(fleetingNote=>(
       <option key={fleetingNote._id} value={fleetingNote._id}>
        {fleetingNote.fleetingNoteId} - {fleetingNote.topic||richTextToPlainText(fleetingNote.rawCapture)||"Untitled capture"}
       </option>
      ))}
     </Form.Select>
    </Form.Group>

     </Container>
    </Tab>

    <Tab eventKey="development" title="Development">
     <Container fluid className="zettel-form-grid px-3 py-3">

    <Form.Group className="zettel-field zettel-field-full">
     <Form.Label>Body</Form.Label>
     <RichTextEditor
      value={form.body}
      onChange={value=>setForm(current=>({...current,body:value}))}
      placeholder="Develop the zettel with formatted text, lists, quotes, and links."
      minHeight="16rem"
     />
    </Form.Group>

    <TextArrayField
     label="Future Use"
     name="futureUse"
     values={form.futureUse}
     placeholder="Add one future use for this zettel"
     onChange={updateTextArray}
    />

    <TextArrayField
     label="Question"
     name="questions"
     values={form.questions}
     placeholder="Add one question raised by this zettel"
     onChange={updateTextArray}
    />

    <Form.Group className="zettel-field zettel-field-half">
     <Form.Label>Tags</Form.Label>
     <Form.Control
      value={tagsText}
      onChange={event=>setForm(current=>({
       ...current,
       tags:event.target.value.split(",")
      }))}
      placeholder="Separate tags with commas"
     />
    </Form.Group>

    <Form.Group className="zettel-field zettel-field-status">
     <Form.Label>Status</Form.Label>
     <Form.Select
      name="status"
      value={form.status}
      onChange={update}
     >
      <option value="draft">Draft</option>
      <option value="active">Active</option>
      <option value="reviewed">Reviewed</option>
      <option value="archived">Archived</option>
     </Form.Select>
    </Form.Group>

    <Form.Group className="zettel-field zettel-field-favorite">
     <Form.Label>Favorite</Form.Label>
     <Form.Check
      name="isFavorite"
      checked={form.isFavorite}
      onChange={update}
      label=""
     />
    </Form.Group>
     </Container>
    </Tab>
   </Tabs>

   <Container fluid className="d-flex justify-content-end px-3 mt-4">
    <Button type="submit" disabled={saving}>
     {saving?"Saving...":isEditing?"Update Zettel":"Save Zettel"}
    </Button>
   </Container>
  </Form>
 );
}

export default NoteForm;
