import {useCallback,useEffect,useState} from "react";
import {Alert,Badge,Button,Card,Col,Container,Form,Modal,Row,Spinner} from "react-bootstrap";
import {Link,useSearchParams} from "react-router-dom";
import PhotoForm from "../forms/photography/PhotoForm.jsx";
import RecordDetails from "../../components/photography/RecordDetails.jsx";
import {photoFields} from "../../config/photographyFields.js";
import {photographyApi,photographyOptions} from "../../utils/photographyApi.js";

export default function PhotosPage({view="photos"}){
 const [params,setParams]=useSearchParams();
 const [rows,setRows]=useState([]),[total,setTotal]=useState(0),[options,setOptions]=useState({});
 const [loading,setLoading]=useState(true),[error,setError]=useState("");
 const [editing,setEditing]=useState(undefined),[selected,setSelected]=useState(null),[removing,setRemoving]=useState(null),[busy,setBusy]=useState(false);
 const [search,setSearch]=useState(params.get("search")||"");
 const page=Math.max(1,Number(params.get("page"))||1);
 const title=view==="favorites"?"Favorites":view==="archive"?"Archive":"Photos";
 const query=params.toString();
 const load=useCallback(async()=>{
  setLoading(true);setError("");
  try{
   const filters=new URLSearchParams(query);filters.set("limit","24");filters.set("status",view==="archive"?"archived":"active");
   if(view==="favorites")filters.set("favorite","true");else filters.delete("favorite");
   const data=await photographyApi(`/api/photos?${filters}`);
   setRows(data.data);setTotal(data.total);
   setSelected(current=>data.data.find(row=>row._id===current?._id)||null);
  }catch(error){setError(error.status===401?"Please sign in to view your photos.":error.message);}finally{setLoading(false);}
 },[query,view]);
 useEffect(()=>{load();},[load]);
 const openForm=async photo=>{
  setBusy(true);setError("");
  try{
   const [albums,tags,shoots,equipment]=await Promise.all([photographyOptions("/api/albums"),photographyOptions("/api/photo-tags"),photographyOptions("/api/shoots"),photographyOptions("/api/equipment")]);
   setOptions({albumRefs:albums,tagRefs:tags,shootRef:shoots,cameraRef:equipment.filter(item=>item.type==="camera"),lensRef:equipment.filter(item=>item.type==="lens")});setEditing(photo);
  }catch(error){setError(error.message);}finally{setBusy(false);}
 };
 const save=async payload=>{
  await photographyApi(editing?`/api/photos/${editing._id}`:"/api/photos",{method:editing?"PUT":"POST",body:JSON.stringify(payload)});
  setEditing(undefined);await load();
 };
 const update=async(photo,changes)=>{
  setBusy(true);setError("");
  try{await photographyApi(`/api/photos/${photo._id}`,{method:"PUT",body:JSON.stringify(changes)});await load();}catch(error){setError(error.message);}finally{setBusy(false);}
 };
 const remove=async()=>{
  setBusy(true);setError("");
  try{await photographyApi(`/api/photos/${removing._id}`,{method:"DELETE"});setRemoving(null);await load();}catch(error){setError(error.message);setRemoving(null);}finally{setBusy(false);}
 };
 const changePage=next=>{const nextParams=new URLSearchParams(params);nextParams.set("page",String(next));setParams(nextParams);};
 return <Container className="py-4">
  <div className="d-flex justify-content-between align-items-center mb-3"><h1>{title}</h1>{view==="photos"&&<Button disabled={busy||loading} onClick={()=>openForm(null)}>Add Photo</Button>}</div>
  <div className="d-flex gap-3 mb-3"><Link to="/photos">All photos</Link><Link to="/favorites">Favorites</Link><Link to="/archive">Archive</Link><Link to="/albums">Albums</Link></div>
  <Form className="d-flex gap-2 mb-3" onSubmit={event=>{event.preventDefault();const next=new URLSearchParams(params);next.set("search",search);next.delete("page");setParams(next);}}><Form.Control aria-label="Search photo titles" placeholder="Search photo titles" value={search} onChange={event=>setSearch(event.target.value)}/><Button type="submit">Search</Button>{query&&<Button variant="outline-secondary" onClick={()=>{setSearch("");setParams({});}}>Clear filters</Button>}</Form>
  {error&&<Alert variant="danger">{error} <Link to="/login">Sign in</Link> <Button variant="outline-secondary" size="sm" onClick={load}>Retry</Button></Alert>}
  {loading?<Spinner animation="border" aria-label="Loading photos"/>:<>
   {!rows.length&&!error&&<Alert variant="info">No {view==="archive"?"archived ":view==="favorites"?"favorite ":""}photos found.</Alert>}
   <Row className="g-3">{rows.map(photo=><Col md={6} lg={4} key={photo._id}><Card className="h-100">
    <button type="button" className="border-0 bg-transparent p-0" onClick={()=>setSelected(photo)} aria-label={`View ${photo.title}`}><img src={photo.fileUrl} alt={photo.title} loading="lazy" style={{width:"100%",height:220,objectFit:"contain"}}/></button>
    <Card.Body><Card.Title>{photo.title}</Card.Title><p>{photo.location||"No location"}</p><Badge bg="secondary">{photo.rating}/5</Badge><div className="d-flex flex-wrap gap-2 mt-3">
     <Button size="sm" disabled={busy} onClick={()=>openForm(photo)}>Edit</Button>
     <Button size="sm" variant="outline-primary" disabled={busy} onClick={()=>update(photo,{favorite:!photo.favorite})}>{photo.favorite?"Unfavorite":"Favorite"}</Button>
     <Button size="sm" variant="outline-secondary" disabled={busy} onClick={()=>update(photo,{status:view==="archive"?"active":"archived"})}>{view==="archive"?"Restore":"Archive"}</Button>
     {view==="archive"&&<Button size="sm" variant="outline-danger" disabled={busy} onClick={()=>setRemoving(photo)}>Delete permanently</Button>}
    </div></Card.Body>
   </Card></Col>)}</Row>
   <div className="d-flex gap-3 align-items-center mt-4"><Button disabled={page<=1} variant="outline-secondary" onClick={()=>changePage(page-1)}>Previous</Button><span>Page {page} · {total} photos</span><Button disabled={page*24>=total} variant="outline-secondary" onClick={()=>changePage(page+1)}>Next</Button></div>
  </>}
  <Modal show={editing!==undefined} onHide={()=>setEditing(undefined)} size="xl" backdrop="static"><Modal.Header closeButton><Modal.Title>{editing?"Edit Photo":"Add Photo"}</Modal.Title></Modal.Header><Modal.Body>{editing!==undefined&&<PhotoForm key={editing?._id||"new"} initialData={editing||{albumRefs:params.get("albumRefs")?[params.get("albumRefs")]:[],shootRef:params.get("shootRef")||null}} options={options} onSave={save} onCancel={()=>setEditing(undefined)}/>}</Modal.Body></Modal>
  <Modal show={!!selected} onHide={()=>setSelected(null)} size="xl"><Modal.Header closeButton><Modal.Title>{selected?.title}</Modal.Title></Modal.Header><Modal.Body>{selected&&<><img src={selected.fileUrl} alt={selected.title} style={{width:"100%",maxHeight:500,objectFit:"contain"}} className="mb-3"/><RecordDetails record={selected} fields={photoFields}/></>}</Modal.Body></Modal>
  <Modal show={!!removing} onHide={()=>!busy&&setRemoving(null)}><Modal.Header><Modal.Title>Permanently delete photo?</Modal.Title></Modal.Header><Modal.Body>Delete “{removing?.title}” from your records? The uploaded image file remains on disk.</Modal.Body><Modal.Footer><Button variant="secondary" disabled={busy} onClick={()=>setRemoving(null)}>Cancel</Button><Button variant="danger" disabled={busy} onClick={remove}>Delete</Button></Modal.Footer></Modal>
 </Container>;
}
