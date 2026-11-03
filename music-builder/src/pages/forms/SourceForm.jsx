import {useEffect,useState} from "react";
import {Button,Form,Tab,Tabs} from "react-bootstrap";
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

function SourceForm({form,setForm,projects=[],entities=[],sourceTypes=[],editing=null,saving=false,onSubmit}){
 const [loadingId,setLoadingId]=useState(false);
 const [idError,setIdError]=useState("");

 const updateField=(field,value)=>{
  setForm(current=>({...current,[field]:value}));
 };

 useEffect(()=>{
  if(editing?._id){
   queueMicrotask(()=>{
    setForm(current=>current.sourceId===editing.sourceId?current:{...current,sourceId:editing.sourceId||""});
    setIdError("");
   });
   return;
  }

  const userId=getStoredUserId();

  if(!userId){
   queueMicrotask(()=>setIdError("A valid user is required to generate the source ID."));
   return;
  }

  const selectedProject=projects.find(project=>getObjectId(project)===form.projectId);
  const selectedSubtype=sourceTypes.find(type=>getObjectId(type)===form.subtypeId);
  const projectCode=toCode(selectedProject?.code)||"GENERAL";
  const subtypeCode=toCode(selectedSubtype?.code);
  const subjectCode=toSubjectCode(form.title);

  if(!subtypeCode){
   queueMicrotask(()=>{
    setForm(current=>current.sourceId?{...current,sourceId:""}:current);
    setIdError("Select a source type.");
   });
   return;
  }

  if(!subjectCode){
   queueMicrotask(()=>{
    setForm(current=>current.sourceId?{...current,sourceId:""}:current);
    setIdError("Enter the source title.");
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
     recordType:"SRC",
     projectCode,
     subtypeCode,
     subjectCode
    });

    const response=await fetch(`/api/id-sequences?${params.toString()}`,{credentials:"include"});
    const data=await response.json().catch(()=>null);

    if(!response.ok)throw new Error(data?.message||"Unable to generate source ID preview");

    const sequences=Array.isArray(data?.data)?data.data:data?.data?[data.data]:[];

    const sequence=sequences.find(item=>
     toCode(item.recordType)==="SRC"&&
     toCode(item.projectCode)===projectCode&&
     toCode(item.subtypeCode)===subtypeCode&&
     toCode(item.subjectCode)===subjectCode
    );

    const nextNumber=Number(sequence?.nextNumber)||1;
    const sourceId=`SRC-${projectCode}-${subtypeCode}-${subjectCode}-${String(nextNumber).padStart(3,"0")}`;

    if(active){
     setForm(current=>current.sourceId===sourceId?current:{...current,sourceId});
    }
   }catch(error){
    if(active){
     setForm(current=>({...current,sourceId:""}));
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
  editing?.sourceId,
  form.projectId,
  form.subtypeId,
  form.title,
  projects,
  sourceTypes,
  setForm
 ]);

 return(
  <Form onSubmit={onSubmit}>
   <div className="zettel-form-id"><span>Source ID</span><code>{loadingId&&!editing?._id?"Generating...":form.sourceId||"Generated when saved"}</code></div>
   {idError&&<div className="text-danger mb-3">{idError}</div>}

   <Tabs defaultActiveKey="details" className="mb-4">
    <Tab eventKey="details" title="Source Details">

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
     value={form.title||""}
     onChange={event=>updateField("title",event.target.value)}
    />
   </Form.Group>

   <Form.Group className="mb-3">
    <Form.Label>Source Type</Form.Label>
    <Form.Select
     required
     value={form.subtypeId||""}
     onChange={event=>updateField("subtypeId",event.target.value)}
    >
     <option value="">Select Source Type</option>
     {sourceTypes.map(type=>(
      <option key={type._id} value={type._id}>{type.code} - {type.name}</option>
     ))}
    </Form.Select>
   </Form.Group>

   <Form.Group className="mb-3">
    <Form.Label>Author / Creator</Form.Label>
    <Form.Control
     value={form.author||""}
     onChange={event=>updateField("author",event.target.value)}
    />
   </Form.Group>

   <Form.Group className="mb-3">
    <Form.Label>Publisher</Form.Label>
    <Form.Control
     value={form.publisher||""}
     onChange={event=>updateField("publisher",event.target.value)}
    />
   </Form.Group>

   <Form.Group className="mb-3">
    <Form.Label>Original URL</Form.Label>
    <Form.Control
     type="url"
     value={form.originalUrl||""}
     onChange={event=>updateField("originalUrl",event.target.value)}
    />
   </Form.Group>

   <Form.Group className="mb-3">
    <Form.Label>Upload Source File</Form.Label>
    <Form.Control
     type="file"
     onChange={event=>{const uploadFile=event.target.files?.[0]||null;setForm(current=>({...current,uploadFile,title:current.title||String(uploadFile?.name||"").replace(/\.[^.]+$/,""),filePath:current.filePath}));}}
    />
    <Form.Text>The file is uploaded and linked to this source when you save.</Form.Text>
   </Form.Group>

   <Form.Group className="mb-3">
    <Form.Label>Existing File Path</Form.Label>
    <Form.Control
     value={form.filePath||""}
     onChange={event=>updateField("filePath",event.target.value)}
    />
    <Form.Text>Kept for existing and legacy source records.</Form.Text>
   </Form.Group>

   <Form.Group className="mb-3">
    <Form.Label>Access Date</Form.Label>
    <Form.Control
     type="date"
     value={form.accessDate||""}
     onChange={event=>updateField("accessDate",event.target.value)}
    />
   </Form.Group>

   <Form.Group className="mb-3">
    <Form.Label>Archive Type</Form.Label>
    <Form.Control
     value={form.archiveType||""}
     onChange={event=>updateField("archiveType",event.target.value)}
    />
   </Form.Group>

   <Form.Group className="mb-3">
    <Form.Label>Archive Location</Form.Label>
    <Form.Control
     value={form.archiveLocation||""}
     onChange={event=>updateField("archiveLocation",event.target.value)}
    />
   </Form.Group>

   <Form.Group className="mb-3">
    <Form.Label>Copied Text / Saved Extract</Form.Label>
    <RichTextEditor value={form.copiedText||""} onChange={value=>updateField("copiedText",value)} placeholder="Paste or write the preserved source material." minHeight="16rem"/>
   </Form.Group>
    </Tab>
    <Tab eventKey="relationships" title="Entities & Links">
     <RelationshipSelector label="Linked entities" value={form.entityIds} records={entities} idField="entityId" titleField="name" onChange={value=>updateField("entityIds",value)}/>
    </Tab>
   </Tabs>

   <Form.Group className="mb-3">
    <Form.Label>Source Summary</Form.Label>
    <RichTextEditor value={form.summary||""} onChange={value=>updateField("summary",value)} placeholder="Summarize the source and why it matters." minHeight="7rem"/>
   </Form.Group>

   <Form.Group className="mb-3">
    <Form.Label>Tags</Form.Label>
    <Form.Control
     value={form.tags||""}
     onChange={event=>updateField("tags",event.target.value)}
     placeholder="Separate tags with commas"
    />
   </Form.Group>

   <Form.Group className="mb-3">
    <Form.Label>Status</Form.Label>
    <Form.Select
     value={form.status||"active"}
     onChange={event=>updateField("status",event.target.value)}
    >
     <option value="draft">Draft</option>
     <option value="active">Active</option>
     <option value="archived">Archived</option>
    </Form.Select>
   </Form.Group>

   <div className="text-end">
    <Button type="submit" disabled={saving||loadingId||(!editing?._id&&!form.sourceId)}>
     {saving?"Saving...":editing?._id?"Save Changes":"Save Source"}
    </Button>
   </div>
  </Form>
 );
}

export default SourceForm;
