import {useEffect,useState} from "react";
import {Button,Col,Form,Row,Tab,Tabs} from "react-bootstrap";
import RelationshipSelector from "../../components/RelationshipSelector.jsx";
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

const getObjectId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 return value._id?.$oid||value.id?.$oid||value._id||value.id||value.$oid||"";
};

const toCode=value=>String(value||"").trim().toUpperCase().replace(/[^A-Z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,24);

const toSubjectCode=value=>{
 const words=String(value||"").trim().toUpperCase().split(/[^A-Z0-9]+/).filter(Boolean);
 if(words.length>1)return words.map(word=>word.slice(0,3)).join("").slice(0,12);
 return (words[0]||"").slice(0,12);
};

const textValue=value=>Array.isArray(value)?value.join(", "):value||"";

function ZettelForm({
 form,
 setForm,
 projects=[],
 subtypes=[],
 sources=[],
 entities=[],
 fleetingNotes=[],
 editing=null,
 saving=false,
 onSubmit
}){
 const [loadingId,setLoadingId]=useState(false);
 const [idError,setIdError]=useState("");

 const updateField=(field,value)=>{
  setForm(current=>({...current,[field]:value}));
 };

 useEffect(()=>{
  if(editing?._id){
   queueMicrotask(()=>{
    setForm(current=>current.zettelId===editing.zettelId?current:{...current,zettelId:editing.zettelId||""});
    setIdError("");
   });
   return;
  }

  const userId=getStoredUserId();

  if(!userId){
   queueMicrotask(()=>setIdError("A valid user is required to generate the zettel ID."));
   return;
  }

  const selectedProject=projects.find(project=>getObjectId(project)===form.projectIds?.[0]);
  const selectedSubtype=subtypes.find(subtype=>{
   return getObjectId(subtype)===form.subtype||toCode(subtype.code)===toCode(form.subtype);
  });

  const projectCode=toCode(selectedProject?.code)||"GENERAL";
  const subtypeCode=toCode(selectedSubtype?.code);
  const subjectCode=toSubjectCode(form.title);

  if(!subtypeCode){
   queueMicrotask(()=>{
    setForm(current=>current.zettelId?{...current,zettelId:""}:current);
    setIdError("Select a zettel subtype.");
   });
   return;
  }

  if(!subjectCode){
   queueMicrotask(()=>{
    setForm(current=>current.zettelId?{...current,zettelId:""}:current);
    setIdError("Enter the zettel title.");
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
     recordType:"ZTL",
     projectCode,
     subtypeCode,
     subjectCode
    });

    const response=await fetch(`/api/id-sequences?${params.toString()}`,{credentials:"include"});
    const data=await response.json().catch(()=>null);

    if(!response.ok){
     throw new Error(data?.message||"Unable to generate zettel ID preview");
    }

    const sequences=Array.isArray(data?.data)?data.data:data?.data?[data.data]:[];

    const sequence=sequences.find(item=>
     toCode(item.recordType)==="ZTL"&&
     toCode(item.projectCode)===projectCode&&
     toCode(item.subtypeCode)===subtypeCode&&
     toCode(item.subjectCode)===subjectCode
    );

    const nextNumber=Number(sequence?.nextNumber)||1;
    const zettelId=`ZTL-${projectCode}-${subtypeCode}-${subjectCode}-${String(nextNumber).padStart(3,"0")}`;

    if(active){
     setForm(current=>current.zettelId===zettelId?current:{...current,zettelId});
    }
   }catch(error){
    if(active){
     setForm(current=>({...current,zettelId:""}));
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
  editing?.zettelId,
  form.projectIds,
  form.subtype,
  form.title,
  projects,
  subtypes,
  setForm
 ]);

 return(
  <Form onSubmit={onSubmit}>
   <div className="zettel-form-id"><span>Zettel ID</span><code>{loadingId&&!editing?._id?"Generating...":form.zettelId||"Generated when saved"}</code></div>
   {idError&&<div className="text-danger mb-3">{idError}</div>}

   <Tabs defaultActiveKey="details" className="mb-4">
    <Tab eventKey="details" title="Zettel Details">

   <Row>
    <Col xs={12} md={6}>
     <Form.Group className="mb-3">
    <Form.Label>Projects</Form.Label>
      <Form.Select
       multiple
       value={form.projectIds||[]}
       onChange={event=>updateField("projectIds",Array.from(event.target.selectedOptions,option=>option.value))}
      >
       <option value="">No Project</option>

       {projects.map(project=>(
        <option key={project._id} value={project._id}>
         {project.projectId||project.code} - {project.title}
        </option>
       ))}
      </Form.Select>
     </Form.Group>
    </Col>

    <Col xs={12} md={6}>
     <Form.Group className="mb-3">
      <Form.Label>Subtype</Form.Label>
      <Form.Select
       required
       value={form.subtype||""}
       disabled={Boolean(editing?._id)}
       onChange={event=>updateField("subtype",event.target.value)}
      >
       <option value="">Select Subtype</option>

       {subtypes.map(subtype=>(
        <option key={subtype._id} value={subtype._id}>
         {subtype.code} - {subtype.name}
        </option>
       ))}
      </Form.Select>
     </Form.Group>
    </Col>
   </Row>

   <Form.Group className="mb-3">
    <Form.Label>Title</Form.Label>
    <Form.Control
     required
     value={form.title||""}
     disabled={Boolean(editing?._id)}
     onChange={event=>updateField("title",event.target.value)}
    />
   </Form.Group>

   <Form.Group className="mb-3">
    <Form.Label>Main Idea</Form.Label>
    <RichTextEditor value={form.mainIdea||""} onChange={value=>updateField("mainIdea",value)} placeholder="State one processed thought in your own words." minHeight="7rem"/>
   </Form.Group>

   <Form.Group className="mb-3">
    <Form.Label>Body</Form.Label>
    <RichTextEditor value={form.body||""} onChange={value=>updateField("body",value)} placeholder="Develop the note with formatted text, lists, quotes, and links." minHeight="16rem"/>
   </Form.Group>

   <Row>
    <Col xs={12} md={6}>
     <Form.Group className="mb-3">
      <Form.Label>Future Use</Form.Label>
      <Form.Control
       value={textValue(form.futureUse)}
       onChange={event=>updateField("futureUse",event.target.value)}
       placeholder="Separate values with commas"
      />
     </Form.Group>
    </Col>

    <Col xs={12} md={6}>
     <Form.Group className="mb-3">
      <Form.Label>Questions</Form.Label>
      <Form.Control
       value={textValue(form.questions)}
       onChange={event=>updateField("questions",event.target.value)}
       placeholder="Separate questions with commas"
      />
     </Form.Group>
    </Col>
   </Row>

   <Form.Group className="mb-3">
    <Form.Label>Tags</Form.Label>
    <Form.Control
     value={textValue(form.tags)}
     onChange={event=>updateField("tags",event.target.value)}
     placeholder="Separate tags with commas"
    />
   </Form.Group>

   <Row>
    <Col xs={12} md={6}>
     <Form.Group className="mb-3">
      <Form.Label>Status</Form.Label>
      <Form.Select
       value={form.status||"draft"}
       onChange={event=>updateField("status",event.target.value)}
      >
       <option value="draft">Draft</option>
       <option value="active">Active</option>
       <option value="reviewed">Reviewed</option>
       <option value="archived">Archived</option>
      </Form.Select>
     </Form.Group>
    </Col>

    <Col xs={12} md={6} className="d-flex align-items-center">
     <Form.Check
      type="checkbox"
      id="zettel-favorite"
      label="Favorite"
      checked={Boolean(form.isFavorite)}
      onChange={event=>updateField("isFavorite",event.target.checked)}
     />
    </Col>
   </Row>

    </Tab>
    <Tab eventKey="relationships" title="Sources & Links">
     <RelationshipSelector label="Linked sources" value={form.sourceIds} records={sources} idField="sourceId" titleField="title" onChange={value=>updateField("sourceIds",value)}/>
     <RelationshipSelector label="Linked entities" value={form.entityIds} records={entities} idField="entityId" titleField="name" onChange={value=>updateField("entityIds",value)}/>
     <Form.Group className="mb-3">
      <Form.Label>Origin Fleeting Note</Form.Label>
      <Form.Select value={form.originFleetingNoteId||""} onChange={event=>updateField("originFleetingNoteId",event.target.value)}>
       <option value="">No Fleeting Note</option>
       {fleetingNotes.map(note=><option key={note._id} value={note._id}>{note.fleetingNoteId} - {note.rawCapture}</option>)}
      </Form.Select>
     </Form.Group>
    </Tab>
   </Tabs>

   <div className="text-end">
    <Button
     type="submit"
     disabled={saving||loadingId||(!editing?._id&&!form.zettelId)}
    >
     {saving?"Saving...":editing?._id?"Save Changes":"Save Zettel"}
    </Button>
   </div>
  </Form>
 );
}

export default ZettelForm;
