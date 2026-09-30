import {useEffect,useMemo,useState} from "react";
import {Button,Form,InputGroup,Modal,Table} from "react-bootstrap";
import {useSearchParams} from "react-router-dom";
import {FaPlus,FaSearch,FaTrash,FaEdit} from "react-icons/fa";
import AuthorForm from "./forms/AuthorForm";
import "../styles/AuthorsIndexPage.css";

const year=v=>{
 if(!v)return "";
 const d=new Date(v);
 if(!Number.isNaN(d.getTime()))return d.getFullYear();
 if(typeof v==="number"||/^\d{4}$/.test(String(v)))return String(v);
 return "";
};

const firstImage=value=>{
 if(Array.isArray(value)&&value.length){
  const found=value.find(item=>{
   if(typeof item==="string")return !!item;
   return !!(item?.url||item?.src||item?.path||item?.thumbnail||item?.small||item?.medium||item?.large||item?.filename||item?.name);
  });
  if(!found)return "";
  if(typeof found==="string")return found;
  return found?.url||found?.src||found?.path||found?.thumbnail||found?.small||found?.medium||found?.large||found?.filename||found?.name||"";
 }
 if(typeof value==="string")return value;
 return value?.url||value?.src||value?.path||value?.thumbnail||value?.small||value?.medium||value?.large||value?.filename||value?.name||"";
};

const resolveImageSrc=value=>{
 const image=firstImage(value);
 if(!image)return "";
 if(/^https?:\/\//i.test(image)||/^data:/i.test(image)||/^blob:/i.test(image)||image.startsWith("/"))return image;
 if(image.startsWith("authors/"))return `/${image}`;
 return `/authors/${image}`;
};

const normalizeAuthors=value=>{
 if(Array.isArray(value))return value;
 if(Array.isArray(value?.authors))return value.authors;
 if(Array.isArray(value?.items))return value.items;
 return [];
};

const normalizePoems=value=>{
 if(Array.isArray(value))return value;
 if(Array.isArray(value?.poems))return value.poems;
 if(Array.isArray(value?.items))return value.items;
 return [];
};

const authorDisplay=author=>{
 return author?.displayName||author?.sortName||[author?.firstName,author?.middleName,author?.lastName].filter(Boolean).join(" ")||"";
};

const matchesAuthorValue=(value,selectedAuthor)=>{
 if(!value||!selectedAuthor)return false;

 const selectedId=String(selectedAuthor?._id||"").trim();
 const selectedSlug=String(selectedAuthor?.slug||"").trim();
 const selectedDisplay=String(selectedAuthor?.displayName||"").trim();
 const selectedSort=String(selectedAuthor?.sortName||"").trim();
 const selectedFull=String([selectedAuthor?.firstName,selectedAuthor?.middleName,selectedAuthor?.lastName].filter(Boolean).join(" ")).trim();

 if(typeof value==="string"){
  const test=value.trim();
  return test===selectedId||test===selectedSlug||test===selectedDisplay||test===selectedSort||test===selectedFull;
 }

 const valueId=String(value?._id||"").trim();
 const valueSlug=String(value?.slug||"").trim();
 const valueDisplay=String(value?.displayName||"").trim();
 const valueSort=String(value?.sortName||"").trim();
 const valueFull=String([value?.firstName,value?.middleName,value?.lastName].filter(Boolean).join(" ")).trim();

 return valueId===selectedId||
  valueSlug===selectedSlug||
  valueDisplay===selectedDisplay||
  valueSort===selectedSort||
  valueFull===selectedFull;
};

export default function AuthorsIndexPage({authors,poems,onSelectPoem,onAddAuthor,onEditAuthor,onDeleteAuthor}){
 const [searchParams,setSearchParams]=useSearchParams();
 const [search,setSearch]=useState("");
 const [nationalityFilter,setNationalityFilter]=useState("");
 const [languageFilter,setLanguageFilter]=useState("");
 const [selectedAuthor,setSelectedAuthor]=useState(null);
 const [manualAuthorFormModal,setManualAuthorFormModal]=useState(false);
 const [showDeleteModal,setShowDeleteModal]=useState(false);
 const [authorFormMode,setAuthorFormMode]=useState("add");
 const [fetchedAuthors,setFetchedAuthors]=useState([]);
 const [fetchedPoems,setFetchedPoems]=useState([]);

 const incomingAuthors=useMemo(()=>normalizeAuthors(authors),[authors]);
 const incomingPoems=useMemo(()=>normalizePoems(poems),[poems]);

 useEffect(()=>{
  if(incomingAuthors.length||incomingPoems.length)return;

  let active=true;

  (async()=>{
   try{
     const authorsRes=await fetch("/api/authors?sort=lastName&order=asc");
    const authorsData=await authorsRes.json();

    if(!active)return;

    setFetchedAuthors(authorsRes.ok?normalizeAuthors(authorsData):[]);

    try{
     const poemsRes=await fetch("/api/poems?sort=title&order=asc");
     const poemsData=await poemsRes.json();

     if(!active)return;

     setFetchedPoems(poemsRes.ok?normalizePoems(poemsData):[]);
    }catch{
     if(!active)return;
     setFetchedPoems([]);
    }
   }catch{
    if(!active)return;
    setFetchedAuthors([]);
    setFetchedPoems([]);
   }
  })();

  return()=>{active=false;};
 },[incomingAuthors.length,incomingPoems.length]);

 const authorsList=useMemo(()=>{
  if(!incomingAuthors.length)return fetchedAuthors;
  if(!fetchedAuthors.length)return incomingAuthors;

  const merged=new Map();
  incomingAuthors.forEach(author=>merged.set(author?._id||author?.slug||author?.displayName,author));
  fetchedAuthors.forEach(author=>merged.set(author?._id||author?.slug||author?.displayName,author));
  return [...merged.values()];
 },[incomingAuthors,fetchedAuthors]);

 const poemsList=useMemo(()=>{
  return incomingPoems.length?incomingPoems:fetchedPoems;
 },[incomingPoems,fetchedPoems]);

 const nationalityOptions=useMemo(()=>{
  return [...new Set(authorsList.map(author=>author?.nationality).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
 },[authorsList]);

 const languageOptions=useMemo(()=>{
  return [...new Set(authorsList.flatMap(author=>Array.isArray(author?.languages)?author.languages:[]).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
 },[authorsList]);

 const filteredAuthors=useMemo(()=>{
  const q=search.trim().toLowerCase();
  return authorsList.filter(author=>{
   const haystack=[
    author?.displayName,
    author?.sortName,
    author?.firstName,
    author?.middleName,
    author?.lastName,
    author?.nationality,
    (Array.isArray(author?.languages)?author.languages:[]).join(" "),
    (Array.isArray(author?.roles)?author.roles:[]).join(" "),
    author?.bio,
    author?.slug
   ].filter(Boolean).join(" ").toLowerCase();

   if(q&&!haystack.includes(q))return false;
   if(nationalityFilter&&author?.nationality!==nationalityFilter)return false;
   if(languageFilter&&!(Array.isArray(author?.languages)?author.languages:[]).includes(languageFilter))return false;
   return true;
  }).sort((a,b)=>authorDisplay(a).localeCompare(authorDisplay(b),undefined,{sensitivity:"base"}));
 },[authorsList,search,nationalityFilter,languageFilter]);

 const activeAuthor=selectedAuthor&&filteredAuthors.some(author=>author?._id===selectedAuthor?._id)
  ?selectedAuthor
  :filteredAuthors[0]||null;

 const associatedPoems=useMemo(()=>{
  if(!activeAuthor)return [];
  return poemsList.filter(poem=>{
   if(matchesAuthorValue(poem?.author,activeAuthor))return true;
   return false;
  }).sort((a,b)=>(a?.title||"").localeCompare(b?.title||"",undefined,{sensitivity:"base"}));
 },[poemsList,activeAuthor]);

 const associatedPublishers=useMemo(()=>{
  const map=new Map();
  associatedPoems.forEach(poem=>{
   const publishersList=poem?.publisher?[poem.publisher]:[];
   publishersList.forEach(publisher=>{
    if(typeof publisher==="string"){
     if(!map.has(publisher))map.set(publisher,{_id:publisher,name:publisher,country:"",poemCount:0});
     map.get(publisher).poemCount+=1;
     return;
    }
    const id=publisher?._id||publisher?.name||publisher?.slug||publisher?.website||`${poem?._id}-publisher`;
    const name=publisher?.name||"";
    if(!name)return;
    if(!map.has(id))map.set(id,{
     _id:id,
     name,
     imprint:publisher?.imprint||"",
     website:publisher?.website||"",
     country:publisher?.country?.name||publisher?.country||"",
     poemCount:0
    });
    map.get(id).poemCount+=1;
   });
  });
  return [...map.values()].sort((a,b)=>(a.name||"").localeCompare(b.name||""));
 },[associatedPoems]);

 const urlModalAction=searchParams.get("modal");
 const urlEditAuthorId=searchParams.get("edit")||"";
 const urlEditAuthor=authorsList.find(author=>author?._id===urlEditAuthorId);
 const effectiveAuthorFormMode=urlModalAction==="new"?"add":urlEditAuthorId?"edit":authorFormMode;
 const effectiveAuthor=effectiveAuthorFormMode==="edit"?(urlEditAuthor||activeAuthor):activeAuthor;
 const showAuthorFormModal=manualAuthorFormModal||urlModalAction==="new"||Boolean(urlEditAuthorId&&urlEditAuthor);

 const clearSearch=()=>setSearch("");
 const clearNationality=()=>setNationalityFilter("");
 const clearLanguage=()=>setLanguageFilter("");
 const clearAll=()=>{
  setSearch("");
  setNationalityFilter("");
  setLanguageFilter("");
 };

 const clearAuthorModalParams=()=>{
  const next=new URLSearchParams(searchParams);
  next.delete("modal");
  next.delete("edit");
  setSearchParams(next);
 };

 const openAddAuthorModal=(syncUrl=true)=>{
  setAuthorFormMode("add");
  setManualAuthorFormModal(true);
  if(syncUrl){
   const next=new URLSearchParams(searchParams);
   next.set("modal","new");
   setSearchParams(next);
  }
 };

 const openEditAuthorModal=(syncUrl=true)=>{
  if(!activeAuthor?._id)return;
  setAuthorFormMode("edit");
  setManualAuthorFormModal(true);
  if(syncUrl){
   const next=new URLSearchParams(searchParams);
   next.set("edit",activeAuthor._id);
   next.delete("modal");
   setSearchParams(next);
  }
 };

 const closeAuthorFormModal=()=>{
  setManualAuthorFormModal(false);
  clearAuthorModalParams();
 };

 const openDeleteModal=()=>{
  if(!activeAuthor?._id)return;
  setShowDeleteModal(true);
 };

 const closeDeleteModal=()=>{
  setShowDeleteModal(false);
 };

 const confirmDeleteAuthor=()=>{
  if(!activeAuthor||!onDeleteAuthor)return;
  onDeleteAuthor(activeAuthor);
  setShowDeleteModal(false);
 };

 const handleAuthorFormSaved=author=>{
  setManualAuthorFormModal(false);
  clearAuthorModalParams();
  if(author){
   setFetchedAuthors(prev=>{
    const exists=prev.find(item=>item?._id===author?._id);
    if(effectiveAuthorFormMode==="edit"){
     return exists?prev.map(item=>item?._id===author?._id ? author : item):[author,...prev];
    }
    return exists?prev:[author,...prev];
   });
   setSelectedAuthor(author);
  }
  if(effectiveAuthorFormMode==="edit"){
   if(onEditAuthor)onEditAuthor(author||activeAuthor);
   return;
  }
  if(onAddAuthor)onAddAuthor(author);
 };

 return(
  <div className="authors-index-page">
   <div className="authors-index-toolbar">
    <div className="authors-index-heading">
     <h1>Authors</h1>
     <div className="authors-index-subtitle">Browse poet profiles, poems, and publisher connections</div>
    </div>
    <div className="d-flex gap-2">
     <Button onClick={openAddAuthorModal}><FaPlus className="me-2"/>Add Author</Button>
     <Button variant="outline-primary" onClick={openEditAuthorModal} disabled={!activeAuthor}><FaEdit className="me-2"/>Edit Author</Button>
     <Button variant="outline-danger" onClick={openDeleteModal} disabled={!activeAuthor}><FaTrash className="me-2"/>Delete Author</Button>
    </div>
   </div>

   <div className="authors-index-filters">
    <div className="authors-index-filter authors-index-search">
     <label>Search Authors</label>
     <InputGroup>
      <InputGroup.Text><FaSearch/></InputGroup.Text>
      <Form.Control value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search author, nationality, language..." />
      <Button variant="outline-secondary" onClick={clearSearch} disabled={!search}>Clear</Button>
     </InputGroup>
    </div>

    <div className="authors-index-filter">
     <label>Nationality</label>
     <div className="authors-index-filter-row">
      <Form.Select value={nationalityFilter} onChange={e=>setNationalityFilter(e.target.value)}>
       <option value="">All Nationalities</option>
       {nationalityOptions.map(item=><option key={item} value={item}>{item}</option>)}
      </Form.Select>
      <Button variant="outline-secondary" onClick={clearNationality} disabled={!nationalityFilter}>Clear</Button>
     </div>
    </div>

    <div className="authors-index-filter">
     <label>Language</label>
     <div className="authors-index-filter-row">
      <Form.Select value={languageFilter} onChange={e=>setLanguageFilter(e.target.value)}>
       <option value="">All Languages</option>
       {languageOptions.map(item=><option key={item} value={item}>{item}</option>)}
      </Form.Select>
      <Button variant="outline-secondary" onClick={clearLanguage} disabled={!languageFilter}>Clear</Button>
     </div>
    </div>

    <div className="authors-index-filter authors-index-clear-all">
     <label>&nbsp;</label>
     <Button className="authors-index-clear-btn" onClick={clearAll}>Clear All Filters</Button>
    </div>
   </div>

   <div className="authors-index-layout">
    <div className="authors-index-left">
     <div className="authors-index-panel-title">Authors</div>
     <div className="authors-index-author-list">
      {!filteredAuthors.length&&<div className="authors-index-empty">No authors found.</div>}
      {filteredAuthors.map(author=>{
       const isActive=selectedAuthor?._id===author?._id;
       return(
        <button key={author?._id||author?.slug} type="button" className={`authors-index-author-item${isActive?" is-active":""}`} onClick={()=>setSelectedAuthor(author)}>
         <div className="authors-index-author-name">{authorDisplay(author)||"—"}</div>
        </button>
       );
      })}
     </div>
    </div>

    <div className="authors-index-center">
     <div className="authors-index-panel-title">
      {activeAuthor?(authorDisplay(activeAuthor)||"Poems"):"Poems"}
     </div>

     {activeAuthor&&(
      <div className="authors-index-author-card">
       <div className="authors-index-author-card-image">
        {resolveImageSrc(activeAuthor.image||activeAuthor.images||activeAuthor.photo||activeAuthor.avatar)?<img src={resolveImageSrc(activeAuthor.image||activeAuthor.images||activeAuthor.photo||activeAuthor.avatar)} alt={activeAuthor.image?.alt||activeAuthor.displayName||authorDisplay(activeAuthor)} />:<div className="authors-index-author-card-placeholder">No Image</div>}
       </div>
       <div className="authors-index-author-card-details">
        <div><span className="label">Name:</span> {authorDisplay(activeAuthor)||"—"}</div>
        <div><span className="label">Sort Name:</span> {activeAuthor.sortName||"—"}</div>
        <div><span className="label">Slug:</span> {activeAuthor.slug||"—"}</div>
        <div><span className="label">Nationality:</span> {activeAuthor.nationality||"—"}</div>
        <div><span className="label">Languages:</span> {activeAuthor.languages?.join(", ")||"—"}</div>
        <div><span className="label">Roles:</span> {activeAuthor.roles?.join(", ")||"—"}</div>
        <div><span className="label">Born:</span> {year(activeAuthor.birthDate)||"—"}</div>
        <div><span className="label">Died:</span> {year(activeAuthor.deathDate)||"—"}</div>
        <div><span className="label">Status:</span> {activeAuthor.isActive?"Active":"Inactive"}</div>
        <div><span className="label">Poems:</span> {associatedPoems.length}</div>
       </div>
       {activeAuthor.bio?(
        <div className="authors-index-author-bio">
         <span>Bio</span>
         <p>{activeAuthor.bio}</p>
        </div>
       ):null}
       {activeAuthor.links&&Object.values(activeAuthor.links).some(Boolean)?(
        <div className="authors-index-author-links">
         <span>Links</span>
         <div>
          {activeAuthor.links.official?<a href={activeAuthor.links.official} target="_blank" rel="noreferrer">Official</a>:null}
          {activeAuthor.links.wikipedia?<a href={activeAuthor.links.wikipedia} target="_blank" rel="noreferrer">Wikipedia</a>:null}
          {activeAuthor.links.goodreads?<a href={activeAuthor.links.goodreads} target="_blank" rel="noreferrer">Goodreads</a>:null}
          {activeAuthor.links.openLibrary?<a href={activeAuthor.links.openLibrary} target="_blank" rel="noreferrer">Open Library</a>:null}
         </div>
        </div>
       ):null}
       {Array.isArray(activeAuthor.notes)&&activeAuthor.notes.length?(
        <div className="authors-index-author-notes">
         <span>Notes</span>
         <ul>
          {activeAuthor.notes.map((note,index)=><li key={`${note}-${index}`}>{note}</li>)}
         </ul>
        </div>
       ):null}
      </div>
     )}

     <div className="authors-index-poems-wrap">
      <Table responsive hover className="authors-index-poems-table">
       <thead>
        <tr>
         <th>Title</th>
         <th>Genre</th>
         <th>Publisher</th>
         <th>Copyright</th>
         <th>Status</th>
        </tr>
       </thead>
       <tbody>
        {!associatedPoems.length&&(
         <tr>
          <td colSpan="5" className="authors-index-empty">No poems associated with this author.</td>
         </tr>
        )}
        {associatedPoems.map(poem=>{
         return(
          <tr key={poem?._id} onClick={()=>onSelectPoem&&onSelectPoem(poem)}>
           <td>{poem?.title||"—"}{poem?.subtitle?<span className="authors-index-poem-subtitle">{poem.subtitle}</span>:null}</td>
           <td>{poem?.genre?.name||"—"}</td>
           <td>{poem?.publisher?.name||"—"}</td>
           <td>{year(poem?.copyright)||"—"}</td>
           <td>{poem?.isPublished?"Published":"Draft"}{poem?.isFeatured?" / Featured":""}</td>
          </tr>
         );
        })}
       </tbody>
      </Table>
     </div>
    </div>

    <div className="authors-index-right">
     <div className="authors-index-panel-title">Publishers</div>
     <div className="authors-index-publisher-list">
      {!associatedPublishers.length&&<div className="authors-index-empty">No publishers found.</div>}
      {associatedPublishers.map(publisher=>(
       <div key={publisher._id} className="authors-index-publisher-item">
        <div className="authors-index-publisher-name">{publisher.name||"—"}</div>
        <div className="authors-index-publisher-meta">
         {publisher.imprint||publisher.country||"—"} • {publisher.poemCount} poem{publisher.poemCount===1?"":"s"}
        </div>
       </div>
      ))}
     </div>
    </div>
   </div>

   <Modal show={showAuthorFormModal} onHide={closeAuthorFormModal} size="xl" centered backdrop="static">
    <Modal.Header closeButton>
     <Modal.Title>{effectiveAuthorFormMode==="edit"?"Edit Author":"Add Author"}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     <AuthorForm
      mode={effectiveAuthorFormMode}
      authorId={effectiveAuthorFormMode==="edit"?effectiveAuthor?._id:""}
      initialData={effectiveAuthorFormMode==="edit"?effectiveAuthor:null}
      onSaved={handleAuthorFormSaved}
      onCancel={closeAuthorFormModal}
     />
    </Modal.Body>
   </Modal>

   <Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
    <Modal.Header closeButton>
     <Modal.Title>Delete Author</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     <div className="authors-index-delete">
      <div className="authors-index-delete-image">
       {resolveImageSrc(activeAuthor?.image||activeAuthor?.images||activeAuthor?.photo||activeAuthor?.avatar)?<img src={resolveImageSrc(activeAuthor?.image||activeAuthor?.images||activeAuthor?.photo||activeAuthor?.avatar)} alt={activeAuthor?.image?.alt||activeAuthor?.displayName||authorDisplay(activeAuthor)} className="authors-index-delete-image-tag" />:<div className="authors-index-delete-placeholder">No Image</div>}
      </div>
      <div className="authors-index-delete-content">
       <div className="authors-index-delete-name">{activeAuthor?.displayName||activeAuthor?.sortName||"Selected author"}</div>
       <div>Are you sure you want to delete this author?</div>
       <div className="authors-index-delete-note">This action cannot be undone.</div>
      </div>
     </div>
    </Modal.Body>
    <Modal.Footer>
     <Button variant="secondary" onClick={closeDeleteModal}>Cancel</Button>
     <Button variant="danger" onClick={confirmDeleteAuthor}><FaTrash className="me-2"/>Delete</Button>
    </Modal.Footer>
   </Modal>
  </div>
 );
}

