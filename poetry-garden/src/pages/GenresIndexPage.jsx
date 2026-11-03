import {useEffect,useMemo,useState} from "react";
import {Alert,Button,Form,InputGroup,Modal,Spinner,Table} from "react-bootstrap";
import {FaEdit,FaPlus,FaSearch,FaTrash} from "react-icons/fa";
import "../styles/GenresIndexPage.css";

const normalizeGenres=data=>{
 if(Array.isArray(data))return data;
 if(Array.isArray(data?.genres))return data.genres;
 if(Array.isArray(data?.items))return data.items;
 return [];
};

const normalizePoems=data=>{
 if(Array.isArray(data))return data;
 if(Array.isArray(data?.poems))return data.poems;
 if(Array.isArray(data?.items))return data.items;
 return [];
};

const genreId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 return value?._id||value?.id||"";
};

function GenresIndexPage(){
 const [genres,setGenres]=useState([]);
 const [poems,setPoems]=useState([]);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [deleting,setDeleting]=useState(false);
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");
 const [search,setSearch]=useState("");
 const [selectedGenre,setSelectedGenre]=useState(null);
 const [showFormModal,setShowFormModal]=useState(false);
 const [showDeleteModal,setShowDeleteModal]=useState(false);
 const [formName,setFormName]=useState("");

 useEffect(()=>{
  let active=true;

  (async()=>{
   try{
    const [genreRes,poemRes]=await Promise.all([
     fetch("/api/genres"),
     fetch("/api/poems?sort=title&order=asc")
    ]);

    const genreData=await genreRes.json().catch(()=>null);
    const poemData=await poemRes.json().catch(()=>null);

    if(!genreRes.ok)throw new Error(genreData?.message||"Failed to load genres");
    if(!active)return;

    setGenres(normalizeGenres(genreData));
    setPoems(poemRes.ok?normalizePoems(poemData):[]);
   }catch(err){
    if(!active)return;
    setError(err.message||"Failed to load genres");
    setGenres([]);
    setPoems([]);
   }finally{
    if(active)setLoading(false);
   }
  })();

  return()=>{
   active=false;
  };
 },[]);

 const genrePoemCounts=useMemo(()=>{
  const counts=new Map();
  poems.forEach(poem=>{
   const id=genreId(poem?.genre);
   if(!id)return;
   counts.set(id,(counts.get(id)||0)+1);
  });
  return counts;
 },[poems]);

 const filteredGenres=useMemo(()=>{
  const q=search.trim().toLowerCase();
  return genres
   .filter(genre=>!q||String(genre?.name||"").toLowerCase().includes(q))
   .sort((a,b)=>String(a?.name||"").localeCompare(String(b?.name||""),undefined,{sensitivity:"base"}));
 },[genres,search]);

 const activeGenre=selectedGenre&&filteredGenres.some(genre=>genre?._id===selectedGenre?._id)
  ?selectedGenre
  :filteredGenres[0]||null;

 const openAddModal=()=>{
  setSelectedGenre(null);
  setFormName("");
  setError("");
  setSuccess("");
  setShowFormModal(true);
 };

 const openEditModal=genre=>{
  if(!genre?._id)return;
  setSelectedGenre(genre);
  setFormName(genre.name||"");
  setError("");
  setSuccess("");
  setShowFormModal(true);
 };

 const closeFormModal=()=>{
  if(saving)return;
  setShowFormModal(false);
  setFormName("");
 };

 const saveGenre=async event=>{
  event.preventDefault();
  if(saving)return;

  const name=formName.trim();

  if(!name){
   setError("Genre name is required.");
   return;
  }

  try{
   setSaving(true);
   setError("");
   setSuccess("");

   const isEdit=Boolean(selectedGenre?._id);
   const response=await fetch(isEdit?`/api/genres/${selectedGenre._id}`:"/api/genres",{
    method:isEdit?"PUT":"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({name})
   });
   const data=await response.json().catch(()=>null);

   if(!response.ok)throw new Error(data?.message||`Failed to ${isEdit?"update":"create"} genre`);

   const savedGenre=data?.genre||data;
   setGenres(prev=>{
    const exists=prev.some(item=>item?._id===savedGenre?._id);
    if(exists)return prev.map(item=>item._id===savedGenre._id?savedGenre:item);
    return [...prev,savedGenre];
   });
   setSelectedGenre(savedGenre);
   setSuccess(data?.message||`Genre ${isEdit?"updated":"created"} successfully.`);
   setShowFormModal(false);
  }catch(err){
   setError(err.message||"Failed to save genre");
  }finally{
   setSaving(false);
  }
 };

 const openDeleteModal=genre=>{
  if(!genre?._id)return;
  setSelectedGenre(genre);
  setError("");
  setSuccess("");
  setShowDeleteModal(true);
 };

 const closeDeleteModal=()=>{
  if(deleting)return;
  setShowDeleteModal(false);
 };

 const deleteGenre=async()=>{
  if(!selectedGenre?._id||deleting)return;

  try{
   setDeleting(true);
   setError("");
   setSuccess("");

   const response=await fetch(`/api/genres/${selectedGenre._id}`,{method:"DELETE"});
   const data=await response.json().catch(()=>null);

   if(!response.ok)throw new Error(data?.message||"Failed to delete genre");

   setGenres(prev=>prev.filter(item=>item?._id!==selectedGenre._id));
   setSuccess(data?.message||"Genre deleted successfully.");
   setShowDeleteModal(false);
   setSelectedGenre(null);
  }catch(err){
   setError(err.message||"Failed to delete genre");
  }finally{
   setDeleting(false);
  }
 };

 return(
  <section className="genres-page">
   <div className="genres-page-header">
    <div>
     <p className="genres-page-eyebrow">Poem References</p>
     <h1>Genres</h1>
     <p>Manage the genre list used by poem forms, filters, dashboard views, and poem displays.</p>
    </div>

    <Button type="button" onClick={openAddModal}>
     <FaPlus className="me-2"/> Add Genre
    </Button>
   </div>

   {error?<Alert variant="danger" dismissible onClose={()=>setError("")}>{error}</Alert>:null}
   {success?<Alert variant="success" dismissible onClose={()=>setSuccess("")}>{success}</Alert>:null}

   <div className="genres-tools">
    <InputGroup>
     <InputGroup.Text><FaSearch/></InputGroup.Text>
     <Form.Control
      value={search}
      onChange={event=>setSearch(event.target.value)}
      placeholder="Search genres..."
     />
     {search?(
      <Button type="button" variant="outline-secondary" onClick={()=>setSearch("")}>Clear</Button>
     ):null}
    </InputGroup>
   </div>

   <div className="genres-card">
    {loading?(
     <div className="genres-loading">
      <Spinner animation="border" role="status"/>
     </div>
    ):(
     <Table responsive hover className="genres-table align-middle mb-0">
      <thead>
       <tr>
        <th>Genre</th>
        <th>Poems</th>
        <th>Created</th>
        <th>Updated</th>
        <th>Actions</th>
       </tr>
      </thead>
      <tbody>
       {filteredGenres.length?filteredGenres.map(genre=>(
        <tr
         key={genre._id}
         className={activeGenre?._id===genre._id?"is-selected":""}
         onClick={()=>setSelectedGenre(genre)}
        >
         <td><strong>{genre.name}</strong></td>
         <td>{genrePoemCounts.get(genre._id)||0}</td>
         <td>{genre.createdAt?new Date(genre.createdAt).toLocaleDateString():"-"}</td>
         <td>{genre.updatedAt?new Date(genre.updatedAt).toLocaleDateString():"-"}</td>
         <td>
          <div className="genres-table-actions" onClick={event=>event.stopPropagation()}>
           <Button type="button" variant="outline-primary" size="sm" onClick={()=>openEditModal(genre)}>
            <FaEdit className="me-1"/> Edit
           </Button>
           <Button type="button" variant="outline-danger" size="sm" onClick={()=>openDeleteModal(genre)}>
            <FaTrash className="me-1"/> Delete
           </Button>
          </div>
         </td>
        </tr>
       )):(
        <tr>
         <td colSpan="5" className="text-center py-4">No genres found.</td>
        </tr>
       )}
      </tbody>
     </Table>
    )}
   </div>

   <Modal show={showFormModal} onHide={closeFormModal} centered backdrop="static">
    <Form onSubmit={saveGenre}>
     <Modal.Header closeButton={!saving}>
      <Modal.Title>{selectedGenre?._id?"Edit Genre":"Add Genre"}</Modal.Title>
     </Modal.Header>
     <Modal.Body>
      <Form.Group>
       <Form.Label>Genre Name</Form.Label>
       <Form.Control
        value={formName}
        onChange={event=>setFormName(event.target.value)}
        autoFocus
        required
       />
      </Form.Group>
     </Modal.Body>
     <Modal.Footer>
      <Button type="button" variant="secondary" onClick={closeFormModal} disabled={saving}>Cancel</Button>
      <Button type="submit" disabled={saving}>{saving?"Saving...":"Save Genre"}</Button>
     </Modal.Footer>
    </Form>
   </Modal>

   <Modal show={showDeleteModal} onHide={closeDeleteModal} centered backdrop="static">
    <Modal.Header closeButton={!deleting}>
     <Modal.Title>Delete Genre</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     <p className="mb-2">Are you sure you want to delete this genre?</p>
     <div className="genres-delete-name">{selectedGenre?.name||"Selected genre"}</div>
     {(genrePoemCounts.get(selectedGenre?._id)||0)>0?(
      <p className="text-danger mt-3 mb-0">This genre is used by {genrePoemCounts.get(selectedGenre?._id)} poem(s). Reassign those poems before deleting.</p>
     ):(
      <p className="text-muted mb-0">This action cannot be undone.</p>
     )}
    </Modal.Body>
    <Modal.Footer>
     <Button type="button" variant="secondary" onClick={closeDeleteModal} disabled={deleting}>Cancel</Button>
     <Button
      type="button"
      variant="danger"
      onClick={deleteGenre}
      disabled={deleting||(genrePoemCounts.get(selectedGenre?._id)||0)>0}
     >
      {deleting?"Deleting...":"Delete Genre"}
     </Button>
    </Modal.Footer>
   </Modal>
  </section>
 );
}

export default GenresIndexPage;
