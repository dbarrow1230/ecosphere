import useDomainIdPreview from "../../hooks/useDomainIdPreview.js";
import {useEffect,useState} from "react";
import {Button,Col,Form,Row,Tab,Tabs} from "react-bootstrap";
import RecordSubtypeForm from "./RecordSubtypeForm.jsx";
import "../../styles/RecordSubtypes.css";
import RichTextEditor from "../../components/RichTextEditor.jsx";
import RelationshipSelector from "../../components/RelationshipSelector.jsx";
import DomainSelect from "../../components/DomainSelect.jsx";
import {getEntityTemplate,getEntityTemplateLabel} from "../../config/entityTemplates.js";

const getStoredUserId=()=>{
 for(const key of ["userInfo","user","authUser","currentUser"]){
  try{
   const parsed=JSON.parse(localStorage.getItem(key)||sessionStorage.getItem(key)||"null");
   const value=parsed?.user||parsed?.data||parsed;
   const id=value?._id||value?.id||value?.$oid||value?._id?.$oid||value?.id?.$oid;
   if(id)return String(id);
  }catch{
   continue;
  }
 }
 return "";
};

const toCode=value=>String(value||"").trim().toUpperCase().replace(/[^A-Z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,24);

const toSubjectCode=value=>{
 const words=String(value||"").trim().toUpperCase().split(/[^A-Z0-9]+/).filter(Boolean);
 if(words.length>1)return words.map(word=>word.slice(0,3)).join("").slice(0,12);
 return (words[0]||"").slice(0,12);
};

const textValue=value=>Array.isArray(value)?value.join(", "):value||"";

function EntityForm({
 form,
 setForm,
 projects=[],
 sources=[],
 zettels=[],
 outputs=[],
 editing=null,
 saving=false,
 onSubmit
}){
 const domainIdPreview=useDomainIdPreview({form,editing,recordType:"ENT",idField:"entityId",subtype:form.entityType,subject:form.code||form.name});
 const [loadingId,setLoadingId]=useState(false);
 const [idError,setIdError]=useState("");
 const [entityTypes,setEntityTypes]=useState([]);
 const [loadingTypes,setLoadingTypes]=useState(false);
 const [showAddType,setShowAddType]=useState(false);
 const [newType,setNewType]=useState({name:"",code:"",description:""});
 const [typeError,setTypeError]=useState("");
 const [templateDraft,setTemplateDraft]=useState(null);
 const [savingTemplate,setSavingTemplate]=useState(false);
 const [templateError,setTemplateError]=useState("");
 const [activeTab,setActiveTab]=useState("details");
 const selectedEntityType=entityTypes.find(type=>type.code===form.entityType);
 const savedTemplateFields=Array.isArray(selectedEntityType?.templateFields)?selectedEntityType.templateFields:[];
 const templateFields=savedTemplateFields.length?savedTemplateFields.map(field=>({...field,long:field.inputType==="richtext"})):getEntityTemplate(form.entityType,selectedEntityType?.name);
 const templateLabel=getEntityTemplateLabel(form.entityType,selectedEntityType?.name);
 const roleLabel=templateLabel==="CHARACTER"?"Role in Project":templateLabel==="PLACE"?"Project Role":"Role / Use";

 const openTemplateDesigner=()=>{
  setTemplateError("");
  setTemplateDraft({
   recordType:"ENT",name:selectedEntityType?.name||form.entityType||"",
   code:form.entityType||"",description:selectedEntityType?.description||"",
   status:selectedEntityType?.status||"active",
   templateFields:templateFields.map(field=>({...field,inputType:field.inputType||(field.long?"richtext":"text")}))
  });
 };

 const saveTemplate=async event=>{
  event.preventDefault();
  setSavingTemplate(true);
  setTemplateError("");
  try{
   const id=selectedEntityType?._id;
   const response=await fetch(id?`/api/record-subtypes/${id}`:"/api/record-subtypes",{
    method:id?"PUT":"POST",headers:{"Content-Type":"application/json"},credentials:"include",
    body:JSON.stringify({...templateDraft,userId:getStoredUserId()})
   });
   const data=await response.json().catch(()=>null);
   if(!response.ok)throw new Error(data?.message||"Unable to save template");
   const saved=data.data;
   setEntityTypes(current=>[...current.filter(item=>item._id!==saved._id),saved]);
   setForm(current=>({...current,entityType:saved.code}));
   setActiveTab("type-details");
   setTemplateDraft(null);
  }catch(error){setTemplateError(error.message);}
  finally{setSavingTemplate(false);}
 };

 const updateField=(field,value)=>{
  setForm(current=>({...current,[field]:value}));
 };

 const updateTypeField=(field,value)=>{
  setForm(current=>({...current,typeData:{...(current.typeData||{}),[field]:value}}));
 };

 const renderTemplateControl=field=>{
  const value=form.typeData?.[field.key]||"";
  if(field.inputType==="richtext"||field.long)return <RichTextEditor value={value} onChange={nextValue=>updateTypeField(field.key,nextValue)} placeholder={field.placeholder} minHeight="6rem"/>;
  if(field.inputType==="select")return <Form.Select value={value} onChange={event=>updateTypeField(field.key,event.target.value)}><option value="">Select {field.label}</option>{(field.options||[]).map(option=><option key={option} value={option}>{option}</option>)}</Form.Select>;
  if(field.inputType==="checkbox")return <Form.Check type="checkbox" checked={value==="true"||value===true} onChange={event=>updateTypeField(field.key,event.target.checked?"true":"false")} label={field.placeholder||field.label}/>;
  return <Form.Control type={field.inputType==="number"?"number":field.inputType==="date"?"date":"text"} value={value} onChange={event=>updateTypeField(field.key,event.target.value)} placeholder={field.placeholder}/>;
 };

 const selectEntityType=value=>{
  updateField("entityType",value);
  if(value)setActiveTab("type-details");
 };

 const loadEntityTypes=async()=>{
  const userId=getStoredUserId();
  if(!userId)return;

  setLoadingTypes(true);
  setTypeError("");

  try{
   const response=await fetch(`/api/record-subtypes?userId=${encodeURIComponent(userId)}&recordType=ENT&status=active`,{credentials:"include"});
   const data=await response.json().catch(()=>null);
   if(!response.ok)throw new Error(data?.message||"Unable to load entity types");
   setEntityTypes(Array.isArray(data?.data)?data.data:[]);
  }catch(error){
   setTypeError(error.message);
  }finally{
   setLoadingTypes(false);
  }
 };

 const createEntityType=async()=>{
  const userId=getStoredUserId();
  const name=String(newType.name||"").trim();
  const code=toCode(newType.code||name);
  const suggestedFields=getEntityTemplate(code,name).map(field=>({key:field.key,label:field.label,inputType:field.long?"richtext":"text",placeholder:field.placeholder||""}));
  if(!userId||!name||!code)return;

  setLoadingTypes(true);
  setTypeError("");

  try{
   const response=await fetch("/api/record-subtypes",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    credentials:"include",
    body:JSON.stringify({userId,recordType:"ENT",name,code,description:newType.description,templateFields:suggestedFields,status:"active"})
   });
   const data=await response.json().catch(()=>null);
   if(!response.ok)throw new Error(data?.message||"Unable to add entity type");
   const created=data.data;
   setEntityTypes(current=>[...current.filter(item=>item._id!==created._id),created].sort((a,b)=>a.name.localeCompare(b.name)));
   selectEntityType(created.code);
   setNewType({name:"",code:"",description:""});
   setShowAddType(false);
  }catch(error){
   setTypeError(error.message);
  }finally{
   setLoadingTypes(false);
  }
 };

 useEffect(()=>{
  queueMicrotask(loadEntityTypes);
 },[]);

 useEffect(()=>{
  if(editing?._id){
   return;
  }

  const userId=getStoredUserId();
  if(!userId){
   queueMicrotask(()=>setIdError("A valid user is required to generate the entity ID."));
   return;
  }

  const selectedProject=projects.find(project=>project._id===form.projectId);
  const projectCode=toCode(form.domainCode)||toCode(selectedProject?.code)||"GENERAL";
  const subtypeCode=toCode(form.entityType||"CHAR");
  const subjectCode=toCode(form.code)||toSubjectCode(form.name);
  const generatedDate=new Date().toLocaleDateString("en-CA").replaceAll("-","");

  if(!subjectCode){
   queueMicrotask(()=>{
    setForm(current=>current.entityId?{...current,entityId:""}:current);
    setIdError("Enter an entity name or subject code.");
   });
   return;
  }
  let active=true;

  const timer=setTimeout(async()=>{
   setLoadingId(true);
   setIdError("");

   try{
    const params=new URLSearchParams({
     userId,
     recordType:"ENT",
     projectCode,
     subtypeCode,
     subjectCode
    });

    const response=await fetch(`/api/id-sequences?${params.toString()}`,{credentials:"include"});
    const data=await response.json().catch(()=>null);

    if(!response.ok)throw new Error(data?.message||"Unable to generate entity ID preview");

    const sequences=Array.isArray(data?.data)?data.data:data?.data?[data.data]:[];

    const sequence=sequences.find(item=>
     toCode(item.recordType)==="ENT"&&
     toCode(item.projectCode)===projectCode&&
     toCode(item.subtypeCode)===subtypeCode&&
     toCode(item.subjectCode)===`${subjectCode}-${generatedDate}`
    );

    const nextNumber=Number(sequence?.nextNumber)||1;

    const entityId=[
     "ENT",
     projectCode,
     subtypeCode,
     subjectCode,
     generatedDate,
     String(nextNumber).padStart(3,"0")
    ].filter(Boolean).join("-");

    if(active){
     setForm(current=>current.entityId===entityId?current:{...current,entityId});
    }
   }catch(error){
    if(active){
     setForm(current=>({...current,entityId:""}));
     setIdError(error.message);
    }
   }finally{
    if(active)setLoadingId(false);
   }
  },250);

  return()=>{
   active=false;
   clearTimeout(timer);
  };
 },[
  editing?._id,
  editing?.entityId,
  form.projectId,
  form.entityType,
  form.domainCode,
  form.code,
  form.name,
  projects,
  setForm
 ]);

 if(templateDraft)return <section>
  <div className="d-flex justify-content-between align-items-center mb-3">
   <h3>Template Designer: {templateDraft.name||templateDraft.code}</h3>
   <Button type="button" variant="outline-secondary" disabled={savingTemplate} onClick={()=>setTemplateDraft(null)}>Back to Entity</Button>
  </div>
  {templateError&&<div role="alert" className="text-danger mb-3">{templateError}</div>}
  <RecordSubtypeForm lockIdentity form={templateDraft} setForm={setTemplateDraft} editing={selectedEntityType} saving={savingTemplate} onSubmit={saveTemplate}/>
 </section>;

 return(
  <Form onSubmit={onSubmit}>
   <div className="entity-form-id">
    <span className="entity-form-id-label">Entity ID:</span>
    <code className="entity-form-id-value">{loadingId&&!editing?._id?"Generating...":(editing?._id?domainIdPreview:form.entityId)||"Generated when saved"}</code>
   </div>

   {idError&&<div className="text-danger mb-3">{idError}</div>}

   <Tabs activeKey={activeTab} onSelect={key=>setActiveTab(key||"details")} className="entity-form-tabs mb-4">
   <Tab eventKey="details" title="Entity Details">
    <DomainSelect value={form.domainId} onChange={(value,domain)=>setForm(current=>({...current,domainId:value,domainCode:domain?.code||"",entityId:""}))}/>
   <RelationshipSelector label="Projects (optional)" value={form.projectIds||[]} records={projects} idField="projectId" titleField="title" onChange={projectIds=>setForm(current=>({...current,projectIds,projectId:projectIds[0]||""}))}/>

   <Row>
    <Col xs={12} md={8}>
     <Form.Group className="mb-3">
      <Form.Label>Name</Form.Label>
      <Form.Control
       required
       value={form.name||""}
       onChange={event=>updateField("name",event.target.value)}
      />
     </Form.Group>
    </Col>

    <Col xs={12} md={4}>
     <Form.Group className="mb-3">
      <Form.Label>Code</Form.Label>
      <Form.Control
       value={form.code||""}
       onChange={event=>updateField("code",event.target.value.toUpperCase())}
      />
     </Form.Group>
    </Col>
   </Row>

   <Row>
    <Col xs={12} md={6}>
     <Form.Group className="mb-3">
      <Form.Label>Entity Type</Form.Label>
      <Form.Select
       required
       value={form.entityType||""}
       onChange={event=>selectEntityType(event.target.value)}
      >
       <option value="">Select Entity Type</option>
       {form.entityType&&!entityTypes.some(type=>type.code===form.entityType)&&(
        <option value={form.entityType}>{form.entityType}</option>
       )}
       {entityTypes.map(type=><option key={type._id} value={type.code}>{type.name||type.code}</option>)}
      </Form.Select>
      <div className="d-flex gap-2 mt-2">
       <Button type="button" size="sm" variant="outline-primary" onClick={()=>setShowAddType(current=>!current)}>Add Type</Button>
       <Button type="button" onClick={openTemplateDesigner} size="sm" variant="outline-primary" disabled={!form.entityType||loadingTypes}>Design This Template</Button>
       <Button type="button" size="sm" variant="outline-secondary" disabled={loadingTypes} onClick={loadEntityTypes}>{loadingTypes?"Refreshing...":"Refresh Types"}</Button>
      </div>
      {showAddType&&(
       <div className="mt-2">
        <Form.Control className="mb-2" value={newType.name} onChange={event=>setNewType(current=>({...current,name:event.target.value}))} placeholder="Type name"/>
        <Form.Control className="mb-2" value={newType.code} onChange={event=>setNewType(current=>({...current,code:event.target.value.toUpperCase()}))} placeholder="Code (generated from name if blank)"/>
        <Form.Control className="mb-2" value={newType.description} onChange={event=>setNewType(current=>({...current,description:event.target.value}))} placeholder="Description"/>
        <Button type="button" size="sm" disabled={loadingTypes||!newType.name.trim()} onClick={createEntityType}>Save and Select Type</Button>
       </div>
      )}
      {typeError&&<Form.Text className="text-danger d-block">{typeError}</Form.Text>}
     </Form.Group>
    </Col>

    <Col xs={12} md={6}>
     <Form.Group className="mb-3">
      <Form.Label>Status</Form.Label>
      <Form.Select
       value={form.status||"active"}
       onChange={event=>updateField("status",event.target.value)}
      >
       <option value="active">Active</option>
       <option value="archived">Archived</option>
      </Form.Select>
     </Form.Group>
    </Col>
   </Row>

   <Form.Group className="mb-3">
    <Form.Label>Description</Form.Label>
    <RichTextEditor value={form.description||""} onChange={value=>updateField("description",value)} placeholder="Describe this reusable subject identity." minHeight="8rem"/>
   </Form.Group>

   <Form.Group className="mb-3">
    <Form.Label>{roleLabel}</Form.Label>
    <RichTextEditor value={form.roleUse||""} onChange={value=>updateField("roleUse",value)} placeholder="Explain how this entity is used in the knowledge system." minHeight="6rem"/>
   </Form.Group>

   <Form.Group className="mb-3">
    <Form.Label>Aliases</Form.Label>
    <Form.Control
     value={textValue(form.aliases)}
     onChange={event=>updateField("aliases",event.target.value)}
     placeholder="Separate aliases with commas"
    />
   </Form.Group>

    </Tab>

    {form.entityType&&(
     <Tab eventKey="type-details" title={`${templateLabel.charAt(0)}${templateLabel.slice(1).toLowerCase()} Details`}>
      <section className="entity-template-fields">
       {templateFields.length>0?templateFields.map(field=>(
        <Form.Group className={`entity-template-field entity-template-field--span-${Math.min(12,Math.max(1,Number(field.columnSpan)||12))}`} key={field.key}>
         <Form.Label>{field.label}</Form.Label>
         {renderTemplateControl(field)}
        </Form.Group>
       )):(
       <div className="entity-template-empty">
         <p><strong>{selectedEntityType?.name||form.entityType}</strong> does not have its own template fields configured.</p>
         <Button type="button" onClick={openTemplateDesigner} size="sm" variant="outline-primary" disabled={loadingTypes||!!typeError}>Create This Template</Button>
        </div>
       )}
      </section>
     </Tab>
    )}

    <Tab eventKey="relationships" title="Sources & Links">
     <p className="text-muted mb-3">
      Only relationships saved for this entity appear below. Use an Add list to create a relationship.
     </p>

   <RelationshipSelector label="Sources" value={form.relatedSourceIds||[]} records={sources} idField="sourceId" titleField="title" onChange={value=>updateField("relatedSourceIds",value)}/>
   <RelationshipSelector label="Zettels" value={form.linkedZettelIds||[]} records={zettels} idField="zettelId" titleField="title" onChange={value=>updateField("linkedZettelIds",value)}/>
   <RelationshipSelector label="Outputs" value={form.linkedOutputIds||[]} records={outputs} idField="outputId" titleField="title" onChange={value=>updateField("linkedOutputIds",value)}/>

    </Tab>
   </Tabs>

   <Form.Group className="mb-3">
    <Form.Label>Tags</Form.Label>
    <Form.Control
     value={textValue(form.tags)}
     onChange={event=>updateField("tags",event.target.value)}
     placeholder="Separate tags with commas"
    />
   </Form.Group>

   <div className="text-end">
    <Button
     type="submit"
     disabled={saving||loadingId||(!editing?._id&&!form.entityId)}
    >
     {saving?"Saving...":editing?._id?"Save Changes":"Save Entity"}
    </Button>
   </div>
  </Form>
 );
}

export default EntityForm;
