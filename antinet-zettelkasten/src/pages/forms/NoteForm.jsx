import {useEffect,useMemo,useState} from "react";
import {Alert,Button,Card,Container,Form,Spinner,Tab,Tabs} from "react-bootstrap";
import RichTextEditor from "../../components/RichTextEditor.jsx";
import DomainSelect from "../../components/DomainSelect.jsx";
import TextArrayField from "../../components/TextArrayField.jsx";
import {richTextToPlainText} from "../../utils/richText.js";
import {sortItems} from "../../utils/sortItems.js";

const emptyForm={
 domainId:"",
 domainCode:"",
 projectIds:[],
 subjectCode:"",
 title:"",
 mainIdea:"",
 body:"",
 subtype:["IDEA"],
 idSubtype:"IDEA",
 futureUse:[""],
 questions:[""],
 tags:[],
 status:"active",
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

const toSubjectCode=value=>{
 const words=String(value||"").trim().toUpperCase().split(/[^A-Z0-9]+/).filter(Boolean);
 if(words.length>1)return words.map(word=>word.slice(0,3)).join("").slice(0,12);
 return (words[0]||"").slice(0,12);
};

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
const getSubtypeCodes=value=>{
 const values=Array.isArray(value)?value:[value];
 const codes=values.map(item=>{
  if(typeof item==="string")return item.toUpperCase();
  if(item&&typeof item==="object")return String(item.code||item.name||item.recordType||"").toUpperCase();
  return "";
 }).filter(Boolean);
 return codes.length?[...new Set(codes)]:["IDEA"];
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
 const [subtypeSearch,setSubtypeSearch]=useState("");
 const [generatedIdPreview,setGeneratedIdPreview]=useState("");

 const resolvedUserId=getObjectId(userId)||getStoredUserId();
 const isEditing=Boolean(note?._id);

 useEffect(()=>{
  queueMicrotask(()=>setForm({
  ...emptyForm,
   domainId:getObjectId(note?.domainId),
   domainCode:note?.domainId?.code||"",
   projectIds:[...new Set([
    ...(Array.isArray(note?.projectIds)?note.projectIds.map(getObjectId):[]),
    getObjectId(note?.projectId)
   ].filter(Boolean))],
   subjectCode:note?.subjectCode||"",
   title:note?.title||"",
   mainIdea:note?.mainIdea||"",
   body:note?.body||"",
   subtype:getSubtypeCodes(note?.subtype),
   idSubtype:note?.idSubtype||getSubtypeCodes(note?.subtype)[0],
   futureUse:normalizeTextArray(note?.futureUse),
   questions:normalizeTextArray(note?.questions),
   tags:Array.isArray(note?.tags)?note.tags:[],
   status:note?.status||"active",
   isFavorite:Boolean(note?.isFavorite),
   sourceIds:normalizeObjectIdArray(note?.sourceIds),
   entityIds:normalizeObjectIdArray(note?.entityIds),
   originFleetingNoteId:getObjectId(note?.originFleetingNoteId)
  }));
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
   setForm(current=>({...current,subtype:[...new Set([...current.subtype,created.code])]}));
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

 const generatedSubjectCode=useMemo(()=>toSubjectCode(form.title),[form.title]);
 const effectiveSubjectCode=toCode(form.subjectCode)||generatedSubjectCode;
 const sortedProjects=useMemo(()=>sortItems(projects,project=>project.title||project.code),[projects]);
 const sortedSubtypes=useMemo(()=>sortItems(recordSubtypes,subtype=>subtype.name||subtype.code),[recordSubtypes]);
 const visibleSubtypes=useMemo(()=>{
  const search=subtypeSearch.trim().toLocaleLowerCase();
  if(!search)return sortedSubtypes;
  return sortedSubtypes.filter(subtype=>`${subtype.name||""} ${subtype.code||""}`.toLocaleLowerCase().includes(search));
 },[sortedSubtypes,subtypeSearch]);
 const selectedProjectCode=toCode(form.domainCode)||toCode(sortedProjects.find(project=>form.projectIds.includes(project._id))?.code)||"GENERAL";
 const selectedSubtypeCode=toCode(form.idSubtype)||toCode(form.subtype[0])||"GENERAL";
 const generatedDate=new Date().toLocaleDateString("en-CA").replaceAll("-","");
 const sortedSources=useMemo(()=>sortItems(sources,source=>source.title||source.sourceId),[sources]);
 const sortedEntities=useMemo(()=>sortItems(entities,entity=>entity.name||entity.entityId),[entities]);

 useEffect(()=>{
  const subjectCode=effectiveSubjectCode||"GENERAL";
  const prefix=`ZTL-${selectedProjectCode}-${selectedSubtypeCode}-${subjectCode}`;
  const existingId=String(note?.zettelId||"");
  if(isEditing&&existingId.startsWith(`${prefix}-`)&&/-\d{8}-\d{3}$/.test(existingId)){
   queueMicrotask(()=>setGeneratedIdPreview(existingId));
   return;
  }
  if(!resolvedUserId){
   queueMicrotask(()=>setGeneratedIdPreview(`${prefix}-${generatedDate}-001`));
   return;
  }
  let active=true;
  const params=new URLSearchParams({userId:resolvedUserId,recordType:"ZTL",projectCode:selectedProjectCode,subtypeCode:selectedSubtypeCode,subjectCode:`${subjectCode}-${generatedDate}`});
  fetch(`/api/id-sequences?${params}`,{credentials:"include"})
   .then(response=>response.json())
   .then(data=>{
    if(!active)return;
    const sequences=Array.isArray(data?.data)?data.data:data?.data?[data.data]:[];
    const sequence=sequences.find(item=>toCode(item.recordType)==="ZTL"&&toCode(item.projectCode)===selectedProjectCode&&toCode(item.subtypeCode)===selectedSubtypeCode&&toCode(item.subjectCode)===`${subjectCode}-${generatedDate}`);
    setGeneratedIdPreview(`${prefix}-${generatedDate}-${String(Number(sequence?.nextNumber)||1).padStart(3,"0")}`);
   })
   .catch(()=>{if(active)setGeneratedIdPreview(`${prefix}-${generatedDate}-001`);});
  return()=>{active=false;};
 },[effectiveSubjectCode,generatedDate,isEditing,note?.zettelId,resolvedUserId,selectedProjectCode,selectedSubtypeCode]);

 const toggleId=(field,id,checked)=>{
  setForm(current=>({
   ...current,
   [field]:checked
    ?[...new Set([...current[field],id])]
    :current[field].filter(value=>value!==id)
  }));
 };

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

  if(!form.subtype.length){
   setError("Select at least one subtype.");
   return;
  }

  setSaving(true);

  try{
   const payload={
    userId:resolvedUserId,
    projectIds:form.projectIds,
    projectId:form.projectIds[0]||null,
    domainId:form.domainId||null,
    subjectCode:effectiveSubjectCode,
    title:form.title,
    mainIdea:form.mainIdea,
    body:form.body,
    subtype:form.subtype,
    idSubtype:form.idSubtype||form.subtype[0],
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
      <span>{isEditing&&!/-\d{8}-\d{3}$/.test(note.zettelId||"")?"New ID when saved":"ID Preview"}</span>
      <code>{generatedIdPreview}</code>
     </Card.Header>

     <Card.Body className="zettel-id-builder-grid">
      <Form.Group>
       <Form.Label>Record Prefix</Form.Label>
       <Form.Control value="ZTL" disabled readOnly/>
      </Form.Group>

      <Form.Group>
       <Form.Label>Subject Code</Form.Label>
       <Form.Control name="subjectCode" value={form.subjectCode} onChange={update} placeholder={generatedSubjectCode||"Generated from title"}/>
       <Form.Text>Optional. Leave blank to generate it automatically from the title.</Form.Text>
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

    <DomainSelect className="zettel-field zettel-field-domain" value={form.domainId} onChange={(domainId,domain)=>setForm(current=>({...current,domainId,domainCode:domain?.code||""}))}/>

    <Form.Group className="zettel-field zettel-field-type">
     <Form.Label>Subtype</Form.Label>
     <div className="zettel-option-control">
      <div className="zettel-subtype-tools">
       <Form.Control type="search" value={subtypeSearch} onChange={event=>setSubtypeSearch(event.target.value)} placeholder="Search subtypes" aria-label="Search Zettel subtypes"/>
       <span>{visibleSubtypes.length} of {sortedSubtypes.length}</span>
      </div>
      <div className="zettel-subtype-checkboxes" role="group" aria-label="Zettel subtypes">
       {visibleSubtypes.map(subtype=>(
        <Form.Check
         key={subtype._id}
         type="checkbox"
         id={`zettel-subtype-${subtype._id}`}
         label={subtype.name||subtype.code}
         checked={form.subtype.includes(subtype.code)}
         onChange={event=>setForm(current=>{
          const selected=event.target.checked?[...new Set([...current.subtype,subtype.code])]:current.subtype.filter(code=>code!==subtype.code);
          return {...current,subtype:selected,idSubtype:selected.includes(current.idSubtype)?current.idSubtype:selected[0]||""};
         })}
        />
       ))}
       {!visibleSubtypes.length&&<p className="zettel-subtype-empty">No matching subtypes.</p>}
      </div>
      <Button type="button" size="sm" variant="outline-primary" onClick={()=>setShowAddSubtype(current=>!current)}>
       Add Subtype
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
     <div className="zettel-id-subtype-choice">
      <div className="zettel-id-subtype-choice__label"><Form.Label>Subtype Used in ID</Form.Label></div>
      <div className="zettel-id-subtype-choice__control"><Form.Select required value={form.idSubtype||""} onChange={event=>setForm(current=>({...current,idSubtype:event.target.value}))}>
       <option value="">Choose a checked subtype</option>
       {form.subtype.map(code=><option key={code} value={code}>{recordSubtypes.find(item=>item.code===code)?.name||code}</option>)}
      </Form.Select></div>
     </div>
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
      <div className="zettel-checkbox-options" role="group" aria-label="Projects">
       {sortedProjects.map(project=><Form.Check key={project._id} type="checkbox" id={`zettel-project-${project._id}`} label={project.title||project.code||"Untitled project"} checked={form.projectIds.includes(project._id)} disabled={loadingOptions} onChange={event=>toggleId("projectIds",project._id,event.target.checked)}/>) }
      </div>

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
        {projectTypes.map(type=><option key={type._id} value={type._id}>{type.name||type.code}</option>)}
       </Form.Select>
       <Button type="button" size="sm" disabled={savingOption||!newProject.title.trim()||!newProject.typeId} onClick={createProject}>
        {savingOption?"Saving...":"Save and select"}
       </Button>
      </div>
     )}
    </Form.Group>

     </Container>
    </Tab>

    <Tab eventKey="development" title="Development">
     <Container fluid className="zettel-form-grid px-3 py-3">
      <Form.Group className="zettel-field zettel-field-full">
       <Form.Label>Body</Form.Label>
       <RichTextEditor value={form.body} onChange={value=>setForm(current=>({...current,body:value}))} placeholder="Develop the zettel with formatted text, lists, quotes, and links." minHeight="16rem"/>
      </Form.Group>
      <TextArrayField label="Future Use" name="futureUse" values={form.futureUse} placeholder="Add one future use for this zettel" rows={1} onChange={updateTextArray}/>
      <TextArrayField label="Question" name="questions" values={form.questions} placeholder="Add one question raised by this zettel" rows={1} onChange={updateTextArray}/>
      <Form.Group className="zettel-field zettel-field-half"><Form.Label>Tags</Form.Label><Form.Control value={tagsText} onChange={event=>setForm(current=>({...current,tags:event.target.value.split(",")}))} placeholder="Separate tags with commas"/></Form.Group>
      <Form.Group className="zettel-field zettel-field-status"><Form.Label>Status</Form.Label><Form.Select name="status" value={form.status} onChange={update}><option value="active">Active</option><option value="draft">Draft</option><option value="reviewed">Reviewed</option><option value="archived">Archived</option></Form.Select></Form.Group>
      <Form.Group className="zettel-field zettel-field-favorite"><Form.Label>Favorite</Form.Label><Form.Check name="isFavorite" checked={form.isFavorite} onChange={update} label=""/></Form.Group>
     </Container>
    </Tab>

    <Tab eventKey="relationships" title="Relationships">
     <Container fluid className="zettel-form-grid px-3 py-3">

    <Form.Group className="zettel-field zettel-field-full">
     <Form.Label>Archived Sources</Form.Label>

     <div className="zettel-checkbox-options" role="group" aria-label="Archived Sources">
      {sortedSources.map(source=><Form.Check key={source._id} type="checkbox" id={`zettel-source-${source._id}`} label={source.title||"Untitled source"} checked={form.sourceIds.includes(source._id)} disabled={loadingOptions} onChange={event=>toggleId("sourceIds",source._id,event.target.checked)}/>) }
     </div>

     <Form.Text>
      Select the source material this zettel processes.
     </Form.Text>
    </Form.Group>

    <Form.Group className="zettel-field zettel-field-full">
     <Form.Label>Entities</Form.Label>

     <div className="zettel-checkbox-options" role="group" aria-label="Entities">
      {sortedEntities.map(entity=><Form.Check key={entity._id} type="checkbox" id={`zettel-entity-${entity._id}`} label={entity.name||"Untitled entity"} checked={form.entityIds.includes(entity._id)} disabled={loadingOptions} onChange={event=>toggleId("entityIds",entity._id,event.target.checked)}/>) }
     </div>

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
        {fleetingNote.topic||richTextToPlainText(fleetingNote.rawCapture)||"Untitled capture"}
       </option>
      ))}
     </Form.Select>
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
