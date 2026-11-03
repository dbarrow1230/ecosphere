import {useState,useEffect} from "react";
import {Form,Button,Row,Col,Modal,Alert} from "react-bootstrap";

export default function NoteForm({note,onSuccess,userId})
{
 const [form,setForm]=useState({
  notebook:"",
  noteType:"",
  title:"",
  noteId:"",
  content:"",
  summary:"",
  tags:[],
  isArchived:false,
  isFavorite:false,
  status:"active"
 });

 const [saving,setSaving]=useState(false);
 const [notebooks,setNotebooks]=useState([]);
 const [noteTypes,setNoteTypes]=useState([]);
 const [tags,setTags]=useState([]);

 const [showNotebookModal,setShowNotebookModal]=useState(false);
 const [showNoteTypeModal,setShowNoteTypeModal]=useState(false);

 const [newNotebook,setNewNotebook]=useState({
  name:"",
  description:"",
  color:"#0f766e",
  isArchived:false
 });

 const [newNoteType,setNewNoteType]=useState({
  name:"",
  description:""
 });

 const [savingNotebook,setSavingNotebook]=useState(false);
 const [savingNoteType,setSavingNoteType]=useState(false);
 const [notebookError,setNotebookError]=useState("");
 const [noteTypeError,setNoteTypeError]=useState("");
 const [noteError,setNoteError]=useState("");

 const getStoredUser=()=>{
  const keys=["userInfo","user","authUser","currentUser"];

  for(const key of keys)
  {
   try
   {
    const raw=localStorage.getItem(key);

    if(!raw)
    {
     continue;
    }

    const parsed=JSON.parse(raw);

    if(parsed?._id)
    {
     return parsed;
    }

    if(parsed?.user?._id)
    {
     return parsed.user;
    }

    if(parsed?.data?._id)
    {
     return parsed.data;
    }
   }
   catch(err)
   {
    console.error(`Failed to parse localStorage key: ${key}`,err);
   }
  }

  return null;
 };

 const resolveUserId=(value)=>{
  if(!value)
  {
   return "";
  }

  if(typeof value==="string")
  {
   return value;
  }

  if(typeof value==="object"&&value._id)
  {
   return value._id;
  }

  return "";
 };

 const resolvedUserId=resolveUserId(userId)||resolveUserId(note?.user)||resolveUserId(getStoredUser());

 const getToken=()=>{
  try
  {
   return (localStorage.getItem("token")||"").trim();
  }
  catch(err)
  {
   console.error("Failed to read token",err);
   return "";
  }
 };

 const getAuthHeaders=()=>{
  const token=getToken();
  return token?{
   "Content-Type":"application/json",
   Authorization:`Bearer ${token}`
  }:{
   "Content-Type":"application/json"
  };
 };

 const fetchNotebooks=async()=>{
  try
  {
   const res=await fetch("/api/notebooks",{
    headers:getAuthHeaders()
   });
   const data=await res.json();

   if(Array.isArray(data.data))
   {
    setNotebooks(data.data);
   }
   else
   {
    setNotebooks([]);
   }
  }
  catch
  {
   setNotebooks([]);
  }
 };

 const fetchNoteTypes=async()=>{
  try
  {
   const res=await fetch("/api/note-types",{
    headers:getAuthHeaders()
   });
   const data=await res.json();

   if(Array.isArray(data.data))
   {
    setNoteTypes(data.data);
   }
   else
   {
    setNoteTypes([]);
   }
  }
  catch
  {
   setNoteTypes([]);
  }
 };

 const fetchTags=async()=>{
  try
  {
   const res=await fetch("/api/tags",{
    headers:getAuthHeaders()
   });
   const data=await res.json();

   if(Array.isArray(data.data))
   {
    setTags(data.data);
   }
   else
   {
    setTags([]);
   }
  }
  catch
  {
   setTags([]);
  }
 };

 useEffect(()=>{
  fetchNotebooks();
  fetchNoteTypes();
  fetchTags();
 },[]);

 useEffect(()=>{
  if(note)
  {
   setForm({
    notebook:typeof note.notebook==="object"&&note.notebook?note.notebook._id||"":note.notebook||"",
    noteType:typeof note.noteType==="object"&&note.noteType?note.noteType._id||"":note.noteType||"",
    title:note.title||"",
    noteId:note.noteId||"",
    content:note.content||"",
    summary:note.summary||"",
    tags:Array.isArray(note.tags)?note.tags.map(tag=>typeof tag==="object"&&tag?tag._id:tag):[],
    isArchived:note.isArchived||false,
    isFavorite:note.isFavorite||false,
    status:note.status||"active"
   });
  }
 },[note]);

 const handleChange=(e)=>{
  const {name,value,type,checked}=e.target;

  if(type==="checkbox"&&name!=="tags")
  {
   setForm(prev=>({...prev,[name]:checked}));
   return;
  }

  setForm(prev=>({...prev,[name]:value}));
 };

 const handleTagChange=(tagId)=>{
  setForm(prev=>{
   const exists=prev.tags.includes(tagId);

   if(exists)
   {
    return{
     ...prev,
     tags:prev.tags.filter(id=>id!==tagId)
    };
   }

   return{
    ...prev,
    tags:[...prev.tags,tagId]
   };
  });
 };

 const handleNewNotebookChange=(e)=>{
  const {name,value,type,checked}=e.target;

  setNewNotebook(prev=>({
   ...prev,
   [name]:type==="checkbox"?checked:value
  }));
 };

 const handleNewNoteTypeChange=(e)=>{
  const {name,value}=e.target;

  setNewNoteType(prev=>({
   ...prev,
   [name]:value
  }));
 };

 const handleCreateNotebook=async(e)=>{
  e.preventDefault();
  setSavingNotebook(true);
  setNotebookError("");

  if(!resolvedUserId)
  {
   setNotebookError("Cannot create notebook: missing user id.");
   setSavingNotebook(false);
   return;
  }

  try
  {
   const payload={
    user:resolvedUserId,
    name:newNotebook.name,
    description:newNotebook.description,
    color:newNotebook.color,
    isArchived:newNotebook.isArchived
   };

   const res=await fetch("/api/notebooks",{
    method:"POST",
    headers:getAuthHeaders(),
    body:JSON.stringify(payload)
   });

   const data=await res.json();

   if(!res.ok)
   {
    throw new Error(data?.error||data?.message||"Failed to create notebook");
   }

   if(data.success&&data.data)
   {
    await fetchNotebooks();
    setForm(prev=>({...prev,notebook:data.data._id}));
    setNewNotebook({
     name:"",
     description:"",
     color:"#0f766e",
     isArchived:false
    });
    setShowNotebookModal(false);
   }
  }
  catch(err)
  {
   setNotebookError(err.message||"Failed to create notebook");
  }
  finally
  {
   setSavingNotebook(false);
  }
 };

 const handleCreateNoteType=async(e)=>{
  e.preventDefault();
  setSavingNoteType(true);
  setNoteTypeError("");

  try
  {
   const res=await fetch("/api/note-types",{
    method:"POST",
    headers:getAuthHeaders(),
    body:JSON.stringify(newNoteType)
   });

   const data=await res.json();

   if(!res.ok)
   {
    throw new Error(data?.error||data?.message||"Failed to create note type");
   }

   if(data.success&&data.data)
   {
    await fetchNoteTypes();
    setForm(prev=>({...prev,noteType:data.data._id}));
    setNewNoteType({
     name:"",
     description:""
    });
    setShowNoteTypeModal(false);
   }
  }
  catch(err)
  {
   setNoteTypeError(err.message||"Failed to create note type");
  }
  finally
  {
   setSavingNoteType(false);
  }
 };

 const handleSubmit=async(e)=>{
  e.preventDefault();
  setSaving(true);
  setNoteError("");

  if(!resolvedUserId)
  {
   setNoteError("Cannot save note: missing user id.");
   setSaving(false);
   return;
  }

  try
  {
   const method=note?"PUT":"POST";
   const url=note?`/api/notes/${note._id}`:"/api/notes";
   const payload={
    ...form,
    user:resolvedUserId
   };

   const res=await fetch(url,{
    method,
    headers:getAuthHeaders(),
    body:JSON.stringify(payload)
   });

   const data=await res.json();

   if(!res.ok)
   {
    throw new Error(data?.error||data?.message||"Failed to save note");
   }

   if(data.success&&onSuccess)
   {
    onSuccess(data.data);
   }
  }
  catch(err)
  {
   setNoteError(err.message||"Failed to save note");
  }
  finally
  {
   setSaving(false);
  }
 };

 return(
  <>
   <Form className="ztk-note-form" onSubmit={handleSubmit}>

    {noteError&&<Alert variant="danger">{noteError}</Alert>}

    <Row className="mb-3">

     <Col md={6}>
      <Form.Group>
       <Form.Label className="ztk-form-label">Title</Form.Label>
       <Form.Control className="ztk-form-control" type="text" name="title" value={form.title} onChange={handleChange} required/>
      </Form.Group>
     </Col>

     <Col md={6}>
      <Form.Group>
       <Form.Label className="ztk-form-label">Note ID</Form.Label>
       <Form.Control className="ztk-form-control" type="text" name="noteId" value={form.noteId} onChange={handleChange} required/>
      </Form.Group>
     </Col>

    </Row>

    <Row className="mb-3">

     <Col md={6}>
      <Form.Group>
       <div className="d-flex justify-content-between align-items-center mb-1">
        <Form.Label className="ztk-form-label mb-0">Notebook</Form.Label>
        <Button type="button" size="sm" variant="outline-primary" onClick={()=>setShowNotebookModal(true)}>New Notebook</Button>
       </div>
       <Form.Select className="ztk-form-select" name="notebook" value={form.notebook} onChange={handleChange}>
        <option value="">None</option>
        {notebooks.map(nb=><option key={nb._id} value={nb._id}>{nb.name}</option>)}
       </Form.Select>
      </Form.Group>
     </Col>

     <Col md={6}>
      <Form.Group>
       <div className="d-flex justify-content-between align-items-center mb-1">
        <Form.Label className="ztk-form-label mb-0">Note Type</Form.Label>
        <Button type="button" size="sm" variant="outline-primary" onClick={()=>setShowNoteTypeModal(true)}>New Type</Button>
       </div>
       <Form.Select className="ztk-form-select" name="noteType" value={form.noteType} onChange={handleChange} required>
        <option value="">Select Type</option>
        {noteTypes.map(nt=><option key={nt._id} value={nt._id}>{nt.name}</option>)}
       </Form.Select>
      </Form.Group>
     </Col>

    </Row>

    <Form.Group className="mb-3">
     <Form.Label className="ztk-form-label">Summary</Form.Label>
     <Form.Control className="ztk-form-control ztk-form-textarea" as="textarea" rows={3} name="summary" value={form.summary} onChange={handleChange}/>
    </Form.Group>

    <Form.Group className="mb-3">
     <Form.Label className="ztk-form-label">Content</Form.Label>
     <Form.Control className="ztk-form-control ztk-form-textarea" as="textarea" rows={6} name="content" value={form.content} onChange={handleChange}/>
    </Form.Group>

    <Form.Group className="mb-3">
     <Form.Label className="ztk-form-label">Tags</Form.Label>

     <div className="border rounded p-3">
      <Row>
       {tags.map(tag=>(
        <Col md={4} key={tag._id} className="mb-2">
         <Form.Check className="ztk-form-check" type="checkbox" id={`tag-${tag._id}`} label={tag.name} checked={form.tags.includes(tag._id)} onChange={()=>handleTagChange(tag._id)}/>
        </Col>
       ))}
      </Row>
     </div>

    </Form.Group>

    <Row className="mb-3">

     <Col md={4}>
      <Form.Group>
       <Form.Label className="ztk-form-label">Status</Form.Label>
       <Form.Select className="ztk-form-select" name="status" value={form.status} onChange={handleChange}>
        <option value="draft">Draft</option>
        <option value="active">Active</option>
        <option value="archived">Archived</option>
       </Form.Select>
      </Form.Group>
     </Col>

     <Col md={4} className="d-flex align-items-center">
      <Form.Check className="ztk-form-check" type="checkbox" label="Favorite" name="isFavorite" checked={form.isFavorite} onChange={handleChange}/>
     </Col>

     <Col md={4} className="d-flex align-items-center">
      <Form.Check className="ztk-form-check" type="checkbox" label="Archived" name="isArchived" checked={form.isArchived} onChange={handleChange}/>
     </Col>

    </Row>

    <Button type="submit" disabled={saving}>{saving?"Saving...":note?"Update Note":"Create Note"}</Button>

   </Form>

   <Modal show={showNotebookModal} onHide={()=>setShowNotebookModal(false)} centered>
    <Modal.Header closeButton><Modal.Title>New Notebook</Modal.Title></Modal.Header>
    <Modal.Body>
     <Form onSubmit={handleCreateNotebook}>

      {notebookError&&<Alert variant="danger">{notebookError}</Alert>}

      <Form.Group className="mb-3">
       <Form.Label>Name</Form.Label>
       <Form.Control type="text" name="name" value={newNotebook.name} onChange={handleNewNotebookChange} required/>
      </Form.Group>

      <Form.Group className="mb-3">
       <Form.Label>Description</Form.Label>
       <Form.Control as="textarea" rows={3} name="description" value={newNotebook.description} onChange={handleNewNotebookChange}/>
      </Form.Group>

      <Row className="mb-3">
       <Col md={6}>
        <Form.Group>
         <Form.Label>Color</Form.Label>
         <Form.Control type="color" name="color" value={newNotebook.color} onChange={handleNewNotebookChange}/>
        </Form.Group>
       </Col>

       <Col md={6} className="d-flex align-items-center">
        <Form.Check type="checkbox" label="Archived" name="isArchived" checked={newNotebook.isArchived} onChange={handleNewNotebookChange}/>
       </Col>
      </Row>

      <Button type="submit" disabled={savingNotebook}>{savingNotebook?"Saving...":"Save Notebook"}</Button>

     </Form>
    </Modal.Body>
   </Modal>

   <Modal show={showNoteTypeModal} onHide={()=>setShowNoteTypeModal(false)} centered>
    <Modal.Header closeButton><Modal.Title>New Note Type</Modal.Title></Modal.Header>
    <Modal.Body>
     <Form onSubmit={handleCreateNoteType}>

      {noteTypeError&&<Alert variant="danger">{noteTypeError}</Alert>}

      <Form.Group className="mb-3">
       <Form.Label>Name</Form.Label>
       <Form.Control type="text" name="name" value={newNoteType.name} onChange={handleNewNoteTypeChange} required/>
      </Form.Group>

      <Form.Group className="mb-3">
       <Form.Label>Description</Form.Label>
       <Form.Control as="textarea" rows={3} name="description" value={newNoteType.description} onChange={handleNewNoteTypeChange}/>
      </Form.Group>

      <Button type="submit" disabled={savingNoteType}>{savingNoteType?"Saving...":"Save Note Type"}</Button>

     </Form>
    </Modal.Body>
   </Modal>
  </>
 );
}