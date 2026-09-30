// src/pages/genres/GenresIndexPage.jsx
import {useEffect,useMemo,useState} from "react";
import {Button,Form,InputGroup,Modal,Table} from "react-bootstrap";
import {FaPlus,FaSearch,FaEdit,FaTrash} from "react-icons/fa";
import GenreForm from "../pages/forms/GenreForm";
import "../styles/GenresIndexPage.css";

const normalizeGenres=value=>{
 if(Array.isArray(value))return value;
 if(Array.isArray(value?.genres))return value.genres;
 if(Array.isArray(value?.items))return value.items;
 if(Array.isArray(value?.results))return value.results;
 return [];
};

const normalizeBooks=value=>{
 if(Array.isArray(value))return value;
 if(Array.isArray(value?.books))return value.books;
 if(Array.isArray(value?.data))return value.data;
 if(Array.isArray(value?.data?.books))return value.data.books;
 return [];
};

const getGenreBookCount=genre=>{
 const count=Number(genre?.numberOfBooks||genre?.bookCount||0);
 return Number.isFinite(count)?count:0;
};

const getBookTitle=book=>[book?.title,book?.subtitle].filter(Boolean).join(": ")||"Untitled Book";

const bookHasGenre=(book,genre)=>{
 const genreId=String(genre?._id||genre?.id||"");
 const genreName=String(genre?.name||"").trim().toLowerCase();
 const bookGenres=Array.isArray(book?.genres)?book.genres:[];

 return bookGenres.some(item=>{
  if(!item)return false;
  if(typeof item==="string")return item===genreId||item.trim().toLowerCase()===genreName;
  return String(item._id||item.id||"")===genreId||String(item.name||"").trim().toLowerCase()===genreName;
 });
};

export default function GenresIndexPage({genres:genresProp}){
 const [genres,setGenres]=useState(Array.isArray(genresProp)?genresProp:[]);
 const [loading,setLoading]=useState(!Array.isArray(genresProp));
 const [error,setError]=useState("");
 const [search,setSearch]=useState("");
 const [selectedGenre,setSelectedGenre]=useState(null);
 const [showGenreModal,setShowGenreModal]=useState(false);
 const [genreModalMode,setGenreModalMode]=useState("add");
 const [showDeleteModal,setShowDeleteModal]=useState(false);
 const [deleting,setDeleting]=useState(false);
 const [genreBooks,setGenreBooks]=useState([]);
 const [booksLoading,setBooksLoading]=useState(false);
 const [booksError,setBooksError]=useState("");

 useEffect(()=>{
  if(Array.isArray(genresProp))setGenres(genresProp);
 },[genresProp]);

 useEffect(()=>{
  if(Array.isArray(genresProp)){
   setLoading(false);
   return;
  }

  let active=true;

  (async()=>{
   try{
    setLoading(true);
    setError("");

    const res=await fetch("/api/genres");
    const data=await res.json().catch(()=>null);

    if(!active)return;

    if(!res.ok)throw new Error(data?.message||"Failed to load genres");

    setGenres(normalizeGenres(data));
   }catch(err){
    if(active){
     setError(err.message||"Failed to load genres");
     setGenres([]);
    }
   }finally{
    if(active)setLoading(false);
   }
  })();

  return()=>{active=false;};
 },[genresProp]);

 const filteredGenres=useMemo(()=>{
  const q=search.trim().toLowerCase();

  return genres.filter(genre=>{
   const haystack=[
    genre?.name
   ].filter(Boolean).join(" ").toLowerCase();

   if(q&&!haystack.includes(q))return false;
   return true;
  }).sort((a,b)=>(a?.name||"").localeCompare(b?.name||"",undefined,{sensitivity:"base"}));
 },[genres,search]);

 useEffect(()=>{
  if(!filteredGenres.length){
   setSelectedGenre(null);
   return;
  }
  if(!selectedGenre){
   setSelectedGenre(filteredGenres[0]);
   return;
  }
  const exists=filteredGenres.find(genre=>genre?._id===selectedGenre?._id);
  if(!exists){
   setSelectedGenre(filteredGenres[0]);
   return;
  }

  if(
   exists.name!==selectedGenre.name||
   getGenreBookCount(exists)!==getGenreBookCount(selectedGenre)||
   exists.updatedAt!==selectedGenre.updatedAt
  ){
   setSelectedGenre(exists);
  }
 },[filteredGenres,selectedGenre]);

 const selectedGenreId=selectedGenre?._id||"";
 const selectedGenreName=selectedGenre?.name||"";

 useEffect(()=>{
  if(!selectedGenreId){
   setGenreBooks([]);
   setBooksError("");
   setBooksLoading(false);
   return;
  }

  let active=true;

  (async()=>{
   try{
    setBooksLoading(true);
    setBooksError("");

    const res=await fetch(`/api/books?genre=${encodeURIComponent(selectedGenreId)}&limit=250`,{
     headers:{"Content-Type":"application/json"}
    });
    const data=await res.json().catch(()=>null);

    if(!active)return;
    if(!res.ok)throw new Error(data?.message||"Failed to load books for this genre");

    const exactBooks=normalizeBooks(data).filter(book=>bookHasGenre(book,{_id:selectedGenreId,name:selectedGenreName}));
    const exactCount=Number.isFinite(Number(data?.total))?Number(data.total):exactBooks.length;

    setGenreBooks(exactBooks);
    setGenres(prev=>prev.map(genre=>genre?._id===selectedGenreId&&getGenreBookCount(genre)!==exactCount?{...genre,numberOfBooks:exactCount}:genre));
    setSelectedGenre(prev=>prev?._id===selectedGenreId&&getGenreBookCount(prev)!==exactCount?{...prev,numberOfBooks:exactCount}:prev);
   }catch(err){
    if(active){
     setGenreBooks([]);
     setBooksError(err.message||"Failed to load books for this genre");
    }
   }finally{
    if(active)setBooksLoading(false);
   }
  })();

  return()=>{active=false;};
 },[selectedGenreId,selectedGenreName]);

 const clearSearch=()=>setSearch("");

 const openAddModal=()=>{
  setGenreModalMode("add");
  setShowGenreModal(true);
 };

 const openEditModal=(genre=selectedGenre)=>{
  if(!genre?._id)return;
  setSelectedGenre(genre);
  setGenreModalMode("edit");
  setShowGenreModal(true);
 };

 const closeGenreModal=()=>{
  setShowGenreModal(false);
 };

 const openDeleteModal=(genre=selectedGenre)=>{
  if(!genre?._id||deleting)return;
  setSelectedGenre(genre);
  setShowDeleteModal(true);
 };

 const closeDeleteModal=()=>{
  if(deleting)return;
  setShowDeleteModal(false);
 };

 const handleGenreSaved=savedGenre=>{
  if(!savedGenre)return;

  setGenres(prev=>{
   const exists=prev.some(item=>item?._id===savedGenre?._id);
   if(exists)return prev.map(item=>item?._id===savedGenre?._id?savedGenre:item);
   return [savedGenre,...prev];
  });

  setSelectedGenre(savedGenre);
  setShowGenreModal(false);
 };

 const handleDeleteGenre=async()=>{
  if(!selectedGenre?._id||deleting)return;

  try{
   setDeleting(true);
   setError("");

   const deletingId=selectedGenre._id;

   const res=await fetch(`/api/genres/${deletingId}`,{
    method:"DELETE"
   });
   const data=await res.json().catch(()=>null);

   if(!res.ok)throw new Error(data?.message||"Failed to delete genre");

   setGenres(prev=>prev.filter(item=>item?._id!==deletingId));
   setSelectedGenre(prev=>prev?._id===deletingId?null:prev);
   setShowDeleteModal(false);
  }catch(err){
   setError(err.message||"Failed to delete genre");
  }finally{
   setDeleting(false);
  }
 };

 if(loading){
  return(
   <div className="genres-index-page">
    <div className="genres-index-empty">Loading genres...</div>
   </div>
  );
 }

 return(
  <div className="genres-index-page">
   <div className="genres-index-toolbar">
    <div className="genres-index-heading">
     <h1>Genres</h1>
     <div className="genres-index-subtitle">View, add, edit, and delete genres</div>
    </div>

    <div className="d-flex gap-2 flex-wrap">
     <Button onClick={openAddModal}><FaPlus className="me-2"/>Add Genre</Button>
    </div>
   </div>

   {error?<div className="alert alert-danger">{error}</div>:null}

   <div className="genres-index-filters">
    <div className="genres-index-filter genres-index-search">
     <label>Search Genres</label>
     <InputGroup>
      <InputGroup.Text><FaSearch/></InputGroup.Text>
      <Form.Control value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search genre..." />
      <Button variant="outline-secondary" onClick={clearSearch} disabled={!search}>Clear</Button>
     </InputGroup>
    </div>
   </div>

   <div className="genres-index-layout">
    <div className="genres-index-left">
     <div className="genres-index-panel-title">Genres</div>

     <div className="genres-index-list">
      {!filteredGenres.length&&<div className="genres-index-empty">No genres found.</div>}

      {filteredGenres.map(genre=>{
       const active=selectedGenre?._id===genre?._id;
       return(
        <button key={genre?._id} type="button" className={`genres-index-item${active?" is-active":""}`} onClick={()=>setSelectedGenre(genre)}>
          <span className="genres-index-name">{genre?.name||"—"}</span>
          <span className="genres-index-count" title={`${getGenreBookCount(genre).toLocaleString()} ${getGenreBookCount(genre)===1?"book":"books"}`}>
           {getGenreBookCount(genre).toLocaleString()}
          </span>
        </button>
       );
      })}
     </div>
    </div>

    <div className="genres-index-center">
     <div className="genres-index-center-header">
      <div className="genres-index-panel-title mb-0">{selectedGenre?.name||"Genre Details"}</div>
      {selectedGenre?(
       <div className="d-flex gap-2 flex-wrap">
        <Button size="sm" variant="outline-primary" onClick={()=>openEditModal(selectedGenre)}><FaEdit className="me-2"/>Edit</Button>
        <Button size="sm" variant="outline-danger" onClick={()=>openDeleteModal(selectedGenre)} disabled={deleting}><FaTrash className="me-2"/>Delete</Button>
       </div>
      ):null}
     </div>

     {selectedGenre?(
      <div className="genres-index-details-card">
       <Table responsive className="genres-index-details-table mb-0">
        <tbody>
         <tr>
          <th>Name</th>
          <td>{selectedGenre.name||"—"}</td>
         </tr>
         <tr>
          <th>Books Using Genre</th>
          <td>{getGenreBookCount(selectedGenre).toLocaleString()}</td>
         </tr>
         <tr>
          <th>Created</th>
          <td>{selectedGenre.createdAt?new Date(selectedGenre.createdAt).toLocaleString():"—"}</td>
         </tr>
         <tr>
          <th>Updated</th>
          <td>{selectedGenre.updatedAt?new Date(selectedGenre.updatedAt).toLocaleString():"—"}</td>
         </tr>
        </tbody>
       </Table>
      </div>
     ):(
     <div className="genres-index-empty">Select a genre</div>
     )}
    </div>

    <div className="genres-index-books">
     <div className="genres-index-books-header">
      <div>
       <div className="genres-index-panel-label">Genre</div>
       <div className="genres-index-panel-title mb-0">{selectedGenre?.name||"Books"}</div>
      </div>
      <div className="genres-index-books-count">{genreBooks.length.toLocaleString()}</div>
     </div>

     {booksLoading?<div className="genres-index-empty">Loading books...</div>:null}
     {booksError?<div className="alert alert-danger">{booksError}</div>:null}
     {!booksLoading&&!booksError&&!genreBooks.length?<div className="genres-index-empty">No books use this genre.</div>:null}

     {!booksLoading&&!booksError&&genreBooks.length?(
      <div className="genres-index-books-table-wrap">
       <table className="genres-index-books-table">
       <thead>
        <tr>
          <th>Title</th>
        </tr>
       </thead>
       <tbody>
         {genreBooks.map(book=>(
          <tr key={book?._id||book?.id||getBookTitle(book)}>
           <td>{getBookTitle(book)}</td>
          </tr>
         ))}
        </tbody>
       </table>
      </div>
     ):null}
    </div>
   </div>

   <Modal show={showGenreModal} onHide={closeGenreModal} centered size="lg">
    <Modal.Header closeButton>
     <Modal.Title>{genreModalMode==="edit"?"Edit Genre":"Add Genre"}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     <GenreForm
      mode={genreModalMode}
      genreId={genreModalMode==="edit"?selectedGenre?._id:""}
      initialData={genreModalMode==="edit"?selectedGenre:null}
      onSaved={handleGenreSaved}
      onCancel={closeGenreModal}
     />
    </Modal.Body>
   </Modal>

   <Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
    <Modal.Header closeButton={!deleting}>
     <Modal.Title>Delete Genre</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     <div className="genres-index-delete">
      <div className="genres-index-delete-content">
       <div className="genres-index-delete-name">{selectedGenre?.name||"Selected genre"}</div>
       <div>Are you sure you want to delete this genre?</div>
       {getGenreBookCount(selectedGenre)>0?(
        <div className="genres-index-delete-note">
         This genre is assigned to {getGenreBookCount(selectedGenre).toLocaleString()} {getGenreBookCount(selectedGenre)===1?"book":"books"}. Remove it from those books before deleting it.
        </div>
       ):(
        <div className="genres-index-delete-note">This action cannot be undone.</div>
       )}
      </div>
     </div>
    </Modal.Body>
    <Modal.Footer>
     <Button variant="secondary" onClick={closeDeleteModal} disabled={deleting}>Cancel</Button>
     <Button variant="danger" onClick={handleDeleteGenre} disabled={deleting}>{deleting?"Deleting...":<><FaTrash className="me-2"/>Delete</>}</Button>
    </Modal.Footer>
   </Modal>
  </div>
 );
}
