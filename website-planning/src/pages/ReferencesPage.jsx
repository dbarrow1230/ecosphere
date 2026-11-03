import {useCallback,useEffect,useMemo,useState} from "react";
import {Link,useLocation,useNavigate} from "react-router-dom";
import {Alert,Button,ButtonGroup,Container,Form,Modal,Spinner,Table} from "react-bootstrap";
import {getObjectId,getText,renderDate,renderNoteLink} from "../utils/zettelkastenRenderers.jsx";

const getRows=(data,key)=>{
 if(Array.isArray(data))return data;
 if(Array.isArray(data?.data))return data.data;
 if(key&&Array.isArray(data?.[key]))return data[key];
 return [];
};

const getStoredUserId=()=>{
 const keys=["userInfo","user","authUser","currentUser"];

 for(const key of keys){
  try{
   const raw=localStorage.getItem(key)||sessionStorage.getItem(key);
   if(!raw)continue;
   const parsed=JSON.parse(raw);
   const candidates=[parsed,parsed?.user,parsed?.data,parsed?.data?.user,parsed?.profile,parsed?.authUser];
   const match=candidates.find(value=>{
    const id=getObjectId(value);
    return id&&/^[a-f\d]{24}$/i.test(id);
   });
   if(match)return getObjectId(match);
  }catch(err){
   console.error(`Failed to parse storage key: ${key}`,err);
  }
 }

 return "";
};

const withUserQuery=url=>{
 const userId=getStoredUserId();
 if(!userId)return url;
 const separator=url.includes("?")?"&":"?";
 return `${url}${separator}user=${encodeURIComponent(userId)}`;
};

const emptyForm={
 note:"",
 source:"",
 title:"",
 chapter:"",
 verse:"",
 page:"",
 description:""
};

function ReferencesPage(){
 const location=useLocation();
 const navigate=useNavigate();
 const [references,setReferences]=useState([]);
 const [notes,setNotes]=useState([]);
 const [sources,setSources]=useState([]);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [deletingId,setDeletingId]=useState("");
 const [error,setError]=useState("");
 const [showModal,setShowModal]=useState(false);
 const [editingReference,setEditingReference]=useState(null);
 const [form,setForm]=useState(emptyForm);

 const getNotebookName=useCallback(note=>{
  return getText(note?.notebook?.name||note?.notebook?.title||note?.notebookData?.name||note?.notebookData?.title);
 },[]);

 const getNoteOptionLabel=useCallback(note=>{
  const notebookName=getNotebookName(note);
  const title=note?.title||note?.name||"Untitled note";
  return notebookName&&notebookName!=="-"?`${notebookName}: ${title}`:title;
 },[getNotebookName]);

 const noteOptions=useMemo(()=>{
  return [...notes].sort((a,b)=>(getNoteOptionLabel(a)).localeCompare(getNoteOptionLabel(b)));
 },[notes,getNoteOptionLabel]);

 const sourceOptions=useMemo(()=>{
  return [...sources].sort((a,b)=>(a.title||"").localeCompare(b.title||""));
 },[sources]);

 const loadPageData=async()=>{
  try{
   setLoading(true);
   setError("");

   const [referencesRes,notesRes,sourcesRes]=await Promise.all([
    fetch(withUserQuery("/api/references")),
    fetch(withUserQuery("/api/notes")),
    fetch("/api/sources")
   ]);

   const [referencesData,notesData,sourcesData]=await Promise.all([
    referencesRes.json().catch(()=>null),
    notesRes.json().catch(()=>null),
    sourcesRes.json().catch(()=>null)
   ]);

   if(!referencesRes.ok)throw new Error(referencesData?.message||referencesData?.error||"Failed to load references");
   if(!notesRes.ok)throw new Error(notesData?.message||notesData?.error||"Failed to load notes");
   if(!sourcesRes.ok)throw new Error(sourcesData?.message||sourcesData?.error||"Failed to load sources");

   setReferences(getRows(referencesData,"references"));
   setNotes(getRows(notesData,"notes"));
   setSources(getRows(sourcesData,"sources"));
  }catch(err){
   setError(err.message||"Failed to load references");
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{
  queueMicrotask(()=>loadPageData());
 },[]);

 const handleChange=event=>{
  const {name,value}=event.target;
  setForm(prev=>({...prev,[name]:value}));
 };

 const openEditModal=useCallback(row=>{
  setEditingReference(row);
  setForm({
   note:getObjectId(row.note),
   source:getObjectId(row.source),
   title:getText(row.title)==="-"?"":getText(row.title),
   chapter:getText(row.chapter)==="-"?"":getText(row.chapter),
   verse:getText(row.verse)==="-"?"":getText(row.verse),
   page:getText(row.page)==="-"?"":getText(row.page),
   description:getText(row.description)==="-"?"":getText(row.description)
  });
  setShowModal(true);
 },[]);

 useEffect(()=>{
  const params=new URLSearchParams(location.search);
  const editId=params.get("edit");

  if(!editId||loading||!references.length)return;

  const match=references.find(item=>String(item._id||item.id)===String(editId));

  if(match){
   queueMicrotask(()=>openEditModal(match));
  }
 },[location.search,loading,references,openEditModal]);

 const closeModal=()=>{
  setShowModal(false);
  setEditingReference(null);
  setForm(emptyForm);

  const params=new URLSearchParams(location.search);
  if(params.has("edit")){
   params.delete("edit");
   navigate({
    pathname:location.pathname,
    search:params.toString()?`?${params.toString()}`:""
   },{replace:true});
  }
 };

 const handleSubmit=async event=>{
  event.preventDefault();
  setSaving(true);
  setError("");

  try{
   if(!form.note)throw new Error("Choose a note/topic for this reference.");
   if(!form.source)throw new Error("Choose a source for this reference.");
   if(!form.title.trim())throw new Error("Title is required.");

   const id=editingReference?._id||editingReference?.id;
   const res=await fetch(id?`/api/references/${id}`:"/api/references",{
    method:id?"PUT":"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
     note:form.note,
     source:form.source,
     title:form.title.trim(),
     chapter:form.chapter.trim(),
     verse:form.verse.trim(),
     page:form.page.trim(),
     description:form.description.trim()
    })
   });

   const data=await res.json().catch(()=>null);
   if(!res.ok)throw new Error(data?.message||data?.error||`Failed to ${id?"update":"create"} reference`);

   closeModal();
   await loadPageData();
  }catch(err){
   setError(err.message||`Failed to ${editingReference?"update":"create"} reference`);
  }finally{
   setSaving(false);
  }
 };

 const deleteReference=async row=>{
  const id=row._id||row.id;
  if(!id||!window.confirm("Delete this reference?"))return;

  try{
   setDeletingId(id);
   setError("");
   const res=await fetch(`/api/references/${id}`,{method:"DELETE"});
   const data=await res.json().catch(()=>null);
   if(!res.ok)throw new Error(data?.message||data?.error||"Delete failed");
   setReferences(prev=>prev.filter(item=>(item._id||item.id)!==id));
  }catch(err){
   setError(err.message||"Delete failed");
  }finally{
   setDeletingId("");
  }
 };

 if(loading){
  return(
   <Container className="py-5 text-center">
    <Spinner animation="border"/>
   </Container>
  );
 }

 return(
  <Container className="py-5 ztk-review-page">
   <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
    <div>
     <p className="dashboard-section-kicker mb-1">Source Material</p>
     <h1 className="mb-0">References</h1>
    </div>
    <div className="d-flex gap-2">
     <Button onClick={()=>{
      setEditingReference(null);
      setForm(emptyForm);
      setShowModal(true);
     }}>
      Add Reference
     </Button>
     <Link to="/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
    </div>
   </div>

   {error?<Alert variant="danger">{error}</Alert>:null}

   {!references.length?(
    <Alert variant="light" className="text-center mb-0">No references found yet.</Alert>
   ):(
    <div className="table-wrap">
     <Table striped hover responsive className="mb-0 ztk-review-table">
      <thead>
       <tr>
        <th>Title</th>
        <th>Note / Topic</th>
        <th>Notebook</th>
        <th>Source</th>
        <th>Location</th>
        <th>Description</th>
        <th>Created</th>
        <th>Actions</th>
       </tr>
      </thead>
      <tbody>
       {references.map(row=>(
        <tr key={row._id||row.id}>
         <td>{getText(row.title)}</td>
         <td>{renderNoteLink(row.note,"/references")}</td>
         <td>{getNotebookName(row.note)}</td>
         <td>{getText(row.source)}</td>
         <td>{[row.chapter,row.verse,row.page].filter(Boolean).join(" / ")||"-"}</td>
         <td>{getText(row.description)}</td>
         <td>{renderDate(row.createdAt)}</td>
         <td>
          <ButtonGroup size="sm">
           <Button variant="outline-primary" onClick={()=>openEditModal(row)}>Edit</Button>
           <Button variant="outline-danger" disabled={deletingId===(row._id||row.id)} onClick={()=>deleteReference(row)}>
            Delete
           </Button>
          </ButtonGroup>
         </td>
        </tr>
       ))}
      </tbody>
     </Table>
    </div>
   )}

   <Modal show={showModal} onHide={closeModal} centered size="lg">
    <Modal.Header closeButton>
     <Modal.Title>{editingReference?"Edit Reference":"Add Reference"}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     <Form onSubmit={handleSubmit}>
      <div className="row g-3">
       <div className="col-md-6">
        <Form.Group>
         <Form.Label>Note / Notebook Topic</Form.Label>
         <Form.Select name="note" value={form.note} onChange={handleChange} required>
          <option value="">Select note/topic</option>
          {noteOptions.map(note=>(
           <option key={getObjectId(note)} value={getObjectId(note)}>{getNoteOptionLabel(note)}</option>
          ))}
         </Form.Select>
        </Form.Group>
       </div>

       <div className="col-md-6">
        <Form.Group>
         <Form.Label>Source</Form.Label>
         <Form.Select name="source" value={form.source} onChange={handleChange} required>
          <option value="">Select source</option>
          {sourceOptions.map(source=>(
           <option key={getObjectId(source)} value={getObjectId(source)}>{source.title||source.name||"Untitled source"}</option>
          ))}
         </Form.Select>
        </Form.Group>
       </div>

       <div className="col-12">
        <Form.Group>
         <Form.Label>Title</Form.Label>
         <Form.Control name="title" value={form.title} onChange={handleChange} required/>
        </Form.Group>
       </div>

       <div className="col-md-4">
        <Form.Group>
         <Form.Label>Chapter</Form.Label>
         <Form.Control name="chapter" value={form.chapter} onChange={handleChange}/>
        </Form.Group>
       </div>

       <div className="col-md-4">
        <Form.Group>
         <Form.Label>Verse</Form.Label>
         <Form.Control name="verse" value={form.verse} onChange={handleChange}/>
        </Form.Group>
       </div>

       <div className="col-md-4">
        <Form.Group>
         <Form.Label>Page</Form.Label>
         <Form.Control name="page" value={form.page} onChange={handleChange}/>
        </Form.Group>
       </div>

       <div className="col-12">
        <Form.Group>
         <Form.Label>Description</Form.Label>
         <Form.Control as="textarea" rows={3} name="description" value={form.description} onChange={handleChange}/>
        </Form.Group>
       </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
       <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
       <Button type="submit" disabled={saving}>{saving?"Saving...":editingReference?"Update Reference":"Save Reference"}</Button>
      </div>
     </Form>
    </Modal.Body>
   </Modal>
  </Container>
 );
}

export default ReferencesPage;
