import {useEffect,useState} from "react";
import {Button,Col,Form,Row,Tab,Tabs} from "react-bootstrap";
import RichTextEditor from "../../components/RichTextEditor.jsx";

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
 const [loadingId,setLoadingId]=useState(false);
 const [idError,setIdError]=useState("");
 const [entityTypes,setEntityTypes]=useState([]);
 const [loadingTypes,setLoadingTypes]=useState(false);
 const [showAddType,setShowAddType]=useState(false);
 const [newType,setNewType]=useState({name:"",code:"",description:""});
 const [typeError,setTypeError]=useState("");

 const updateField=(field,value)=>{
  setForm(current=>({...current,[field]:value}));
 };

 const addLinkedId=(field,value)=>{
  if(!value)return;
  setForm(current=>({...current,[field]:[...new Set([...(current[field]||[]),value])]}));
 };

 const removeLinkedId=(field,value)=>{
  setForm(current=>({...current,[field]:(current[field]||[]).filter(id=>id!==value)}));
 };

 const linkSelector=(label,field,records,idField,titleField)=>{
  const linkedIds=form[field]||[];
  const linkedRecords=linkedIds.map(id=>records.find(record=>record._id===id)).filter(Boolean);
  const availableRecords=records.filter(record=>!linkedIds.includes(record._id));

  return(
   <Form.Group className="mb-3">
    <Form.Label>{label}</Form.Label>
    <div>
     {linkedRecords.length?(
      <div className="zettel-list-items mb-2">
       {linkedRecords.map(record=>(
        <div className="zettel-list-item" key={record._id}>
         <span>{record[idField]||record._id} - {record[titleField]||"Untitled"}</span>
         <Button type="button" size="sm" variant="outline-danger" onClick={()=>removeLinkedId(field,record._id)}>Remove</Button>
        </div>
       ))}
      </div>
     ):(
      <Form.Text className="d-block mb-2">No {label.toLowerCase()}.</Form.Text>
     )}
     <Form.Select value="" onChange={event=>addLinkedId(field,event.target.value)}>
      <option value="">Add {label.toLowerCase()}...</option>
      {availableRecords.map(record=>(
       <option key={record._id} value={record._id}>{record[idField]||record._id} - {record[titleField]||"Untitled"}</option>
      ))}
     </Form.Select>
    </div>
   </Form.Group>
  );
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
  if(!userId||!name||!code)return;

  setLoadingTypes(true);
  setTypeError("");

  try{
   const response=await fetch("/api/record-subtypes",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    credentials:"include",
    body:JSON.stringify({userId,recordType:"ENT",name,code,description:newType.description,status:"active"})
   });
   const data=await response.json().catch(()=>null);
   if(!response.ok)throw new Error(data?.message||"Unable to add entity type");
   const created=data.data;
   setEntityTypes(current=>[...current.filter(item=>item._id!==created._id),created].sort((a,b)=>a.name.localeCompare(b.name)));
   updateField("entityType",created.code);
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
  const projectCode=toCode(selectedProject?.code)||"GENERAL";
  const subtypeCode=toCode(form.entityType||"CHAR");
  const subjectCode=toCode(form.code)||toSubjectCode(form.name);

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
     toCode(item.subjectCode)===subjectCode
    );

    const nextNumber=Number(sequence?.nextNumber)||1;

    const entityId=[
     "ENT",
     projectCode,
     subtypeCode,
     subjectCode,
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
  form.code,
  form.name,
  projects,
  setForm
 ]);

 return(
  <Form onSubmit={onSubmit}>
   <div className="entity-form-id">
    <span className="entity-form-id-label">Entity ID:</span>
    <code className="entity-form-id-value">{loadingId&&!editing?._id?"Generating...":form.entityId||"Generated when saved"}</code>
   </div>

   {idError&&<div className="text-danger mb-3">{idError}</div>}

   <Tabs defaultActiveKey="details" className="entity-form-tabs mb-4">
    <Tab eventKey="details" title="Entity Details">
   <Form.Group className="mb-3">
    <Form.Label>Projects (optional)</Form.Label>
    <Form.Select
     multiple
     value={form.projectIds||[]}
     onChange={event=>{const projectIds=[...event.target.selectedOptions].map(option=>option.value);setForm(current=>({...current,projectIds,projectId:projectIds[0]||""}));}}
    >
     {projects.map(project=>(
      <option key={project._id} value={project._id}>
       {project.projectId||project.code} - {project.title}
      </option>
     ))}
    </Form.Select>
    <Form.Text>Select none, one, or several projects.</Form.Text>
   </Form.Group>

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
       onChange={event=>updateField("entityType",event.target.value)}
      >
       <option value="">Select Entity Type</option>
       {form.entityType&&!entityTypes.some(type=>type.code===form.entityType)&&(
        <option value={form.entityType}>{form.entityType}</option>
       )}
       {entityTypes.map(type=><option key={type._id} value={type.code}>{type.code} - {type.name}</option>)}
      </Form.Select>
      <div className="d-flex gap-2 mt-2">
       <Button type="button" size="sm" variant="outline-primary" onClick={()=>setShowAddType(current=>!current)}>Add Type</Button>
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
    <Form.Label>Role / Use</Form.Label>
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

    <Tab eventKey="relationships" title="Sources & Links">
     <p className="text-muted mb-3">
      Only relationships saved for this entity appear below. Use an Add list to create a relationship.
     </p>

   {linkSelector("Related sources","relatedSourceIds",sources,"sourceId","title")}
   {linkSelector("Linked zettels by ID","linkedZettelIds",zettels,"zettelId","title")}
   {linkSelector("Linked outputs by ID","linkedOutputIds",outputs,"outputId","title")}
   {linkSelector("Linked sources","linkedSources",sources,"sourceId","title")}
   {linkSelector("Linked zettels","linkedZettels",zettels,"zettelId","title")}
   {linkSelector("Linked outputs","linkedOutputs",outputs,"outputId","title")}

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
