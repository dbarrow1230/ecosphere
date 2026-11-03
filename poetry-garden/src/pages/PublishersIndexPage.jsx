import {useEffect,useMemo,useState} from "react";
import {Button,Form,InputGroup,Modal,Table} from "react-bootstrap";
import {useSearchParams} from "react-router-dom";
import {FaSearch,FaGlobe,FaPhone,FaEnvelope,FaPlus,FaEdit,FaTrash} from "react-icons/fa";
import PublisherForm from "./forms/PublisherForm";
import "../styles/PublishersIndexPage.css";

const year=v=>{
 if(!v)return "";
 const d=new Date(v);
 if(Number.isNaN(d.getTime()))return "";
 return d.getFullYear();
};

const getId=value=>{
 if(!value)return "";
 return typeof value==="object"?(value?._id||""):value;
};

const authorDisplay=author=>{
 if(!author)return "";
 return author?.displayName||[author?.firstName,author?.middleName,author?.lastName].filter(Boolean).join(" ")||author?.name||"";
};

const resolveImageSrc=(image,folder="images")=>{
 const url=typeof image==="string"?image:image?.url||"";
 if(!url)return "";
 if(/^https?:\/\//i.test(url)||/^data:/i.test(url)||/^blob:/i.test(url)||url.startsWith("/"))return url;
 if(url.startsWith(`${folder}/`))return `/${url}`;
 return `/${folder}/${url}`;
};

const normalizeList=(data,key)=>{
 if(Array.isArray(data))return data;
 if(Array.isArray(data?.[key]))return data[key];
 if(Array.isArray(data?.items))return data.items;
 if(Array.isArray(data?.results))return data.results;
 return [];
};

async function fetchJson(url){
 const res=await fetch(url);
 const data=await res.json();
 if(!res.ok)throw new Error(data?.message||`Failed to load ${url}`);
 return data;
}

export default function PublishersIndexPage({publishers:publishersProp,poems:poemsProp}){
 const [searchParams,setSearchParams]=useSearchParams();
 const [publishers,setPublishers]=useState(Array.isArray(publishersProp)?publishersProp:[]);
 const [poems,setPoems]=useState(Array.isArray(poemsProp)?poemsProp:[]);
 const [loading,setLoading]=useState(!Array.isArray(publishersProp)||!Array.isArray(poemsProp));
 const [error,setError]=useState("");
 const [search,setSearch]=useState("");
 const [typeFilter,setTypeFilter]=useState("");
 const [selectedPublisher,setSelectedPublisher]=useState(null);
 const [activePoem,setActivePoem]=useState(null);
 const [manualPublisherModal,setManualPublisherModal]=useState(false);
 const [publisherModalMode,setPublisherModalMode]=useState("add");
 const [deleting,setDeleting]=useState(false);

useEffect(()=>{
  let active=true;

  (async()=>{
   try{
    setLoading(true);
    setError("");

    const publishersData=Array.isArray(publishersProp)
     ?{publishers:publishersProp}
     :await fetchJson("/api/publishers?sort=name&order=asc");

    let poemsData={poems:Array.isArray(poemsProp)?poemsProp:[]};

    if(!Array.isArray(poemsProp)){
     try{
      poemsData=await fetchJson("/api/poems?sort=title&order=asc");
     }catch{
      poemsData={poems:[]};
     }
    }

    if(!active)return;

    setPublishers(normalizeList(publishersData,"publishers"));
    setPoems(normalizeList(poemsData,"poems"));
   }catch(err){
    if(active){
     setError(err.message||"Failed to load publishers");
     setPublishers([]);
     setPoems([]);
    }
   }finally{
    if(active)setLoading(false);
   }
 })();

  return()=>{active=false;};
 },[publishersProp,poemsProp]);

 const filteredPublishers=useMemo(()=>{
  const q=search.trim().toLowerCase();

  return publishers.filter(pub=>{
   const haystack=[
    pub?.name,
    pub?.imprint,
    pub?.city,
    pub?.contact,
    pub?.email,
    pub?.website,
    pub?.country?.name||"",
    pub?.state?.name||""
   ].join(" ").toLowerCase();

   if(q&&!haystack.includes(q))return false;
   if(typeFilter&&pub?.publisherType!==typeFilter)return false;
   return true;
  }).sort((a,b)=>(a?.name||"").localeCompare(b?.name||"",undefined,{sensitivity:"base"}));
 },[publishers,search,typeFilter]);

 const activePublisher=selectedPublisher&&filteredPublishers.some(pub=>pub?._id===selectedPublisher?._id)
  ?selectedPublisher
  :filteredPublishers[0]||null;

 const associatedPoems=useMemo(()=>{
  if(!activePublisher?._id)return [];
  return poems.filter(poem=>
   getId(poem?.publisher)===activePublisher._id
  ).sort((a,b)=>(a?.title||"").localeCompare(b?.title||"",undefined,{sensitivity:"base"}));
 },[poems,activePublisher]);

 const urlModalAction=searchParams.get("modal");
 const urlEditPublisherId=searchParams.get("edit")||"";
 const urlEditPublisher=publishers.find(publisher=>publisher?._id===urlEditPublisherId);
 const effectivePublisherModalMode=urlModalAction==="new"?"add":urlEditPublisherId?"edit":publisherModalMode;
 const effectivePublisher=effectivePublisherModalMode==="edit"?(urlEditPublisher||activePublisher):activePublisher;
 const showPublisherModal=manualPublisherModal||urlModalAction==="new"||Boolean(urlEditPublisherId&&urlEditPublisher);

 const clearSearch=()=>setSearch("");
 const clearType=()=>setTypeFilter("");

 function clearPublisherModalParams(){
  const next=new URLSearchParams(searchParams);
  next.delete("modal");
  next.delete("edit");
  setSearchParams(next);
 }

 function openAddModal(syncUrl=true){
  setPublisherModalMode("add");
  setManualPublisherModal(true);
  if(syncUrl){
   const next=new URLSearchParams(searchParams);
   next.set("modal","new");
   setSearchParams(next);
  }
 }

 function openEditModal(syncUrl=true){
  if(!activePublisher?._id)return;
  setPublisherModalMode("edit");
  setManualPublisherModal(true);
  if(syncUrl){
   const next=new URLSearchParams(searchParams);
   next.set("edit",activePublisher._id);
   next.delete("modal");
   setSearchParams(next);
  }
 }

 function handlePublisherSaved(savedPublisher){
  setPublishers(prev=>{
   const exists=prev.some(item=>item._id===savedPublisher?._id);
   if(exists){
    return prev.map(item=>item._id===savedPublisher._id?savedPublisher:item);
   }
   return [...prev,savedPublisher];
  });
  setSelectedPublisher(savedPublisher);
  setManualPublisherModal(false);
  clearPublisherModalParams();
 }

 function closePublisherModal(){
  setManualPublisherModal(false);
  clearPublisherModalParams();
 }

 async function handleDeletePublisher(){
  if(!activePublisher?._id||deleting)return;
  const confirmed=window.confirm(`Delete publisher "${activePublisher.name||"this publisher"}"?`);
  if(!confirmed)return;

  try{
   setDeleting(true);
   setError("");

   const res=await fetch(`/api/publishers/${activePublisher._id}`,{
    method:"DELETE"
   });
   const data=await res.json().catch(()=>null);

   if(!res.ok)throw new Error(data?.message||"Failed to delete publisher");

   setPublishers(prev=>prev.filter(item=>item._id!==activePublisher._id));
   setSelectedPublisher(null);
  }catch(err){
   setError(err.message||"Failed to delete publisher");
  }finally{
   setDeleting(false);
  }
 }

 if(loading){
  return(
   <div className="publishers-index-page">
    <div className="publishers-index-empty">Loading publishers...</div>
   </div>
  );
 }

 return(
  <div className="publishers-index-page">
   <div className="publishers-index-toolbar">
    <h1>Publishers</h1>
    <div className="d-flex gap-2">
     <Button onClick={openAddModal}><FaPlus/> Add Publisher</Button>
     {activePublisher?(
      <>
       <Button variant="outline-primary" onClick={openEditModal}><FaEdit/> Edit</Button>
       <Button variant="outline-danger" onClick={handleDeletePublisher} disabled={deleting}>{deleting?"Deleting...":<><FaTrash/> Delete</>}</Button>
      </>
     ):null}
    </div>
   </div>

   {error?<div className="alert alert-danger">{error}</div>:null}

   <div className="publishers-index-filters">
    <div className="publishers-index-filter">
     <label>Search</label>
     <InputGroup>
      <InputGroup.Text><FaSearch/></InputGroup.Text>
      <Form.Control value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search publisher..." />
      <Button variant="outline-secondary" onClick={clearSearch} disabled={!search}>Clear</Button>
     </InputGroup>
    </div>

    <div className="publishers-index-filter">
     <label>Type</label>
     <div className="publishers-index-filter-row">
      <Form.Select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}>
       <option value="">All</option>
       <option value="domestic">Domestic</option>
       <option value="international">International</option>
      </Form.Select>
      <Button variant="outline-secondary" onClick={clearType} disabled={!typeFilter}>Clear</Button>
     </div>
    </div>
   </div>

   <div className="publishers-index-layout">
    <div className="publishers-index-left">
     <div className="d-flex align-items-center justify-content-between">
      <div className="publishers-index-panel-title mb-0">Publishers</div>
      <Button size="sm" onClick={openAddModal}><FaPlus/> Add</Button>
     </div>

     <div className="publishers-index-list">
      {!filteredPublishers.length&&<div className="publishers-index-empty">No publishers found.</div>}

      {filteredPublishers.map(pub=>{
       const active=selectedPublisher?._id===pub._id;
       return(
        <button key={pub._id} type="button" className={`publishers-index-item${active?" is-active":""}`} onClick={()=>setSelectedPublisher(pub)}>
         <div className="publishers-index-name">{pub.name||"—"}</div>
        </button>
       );
      })}
     </div>
    </div>

    <div className="publishers-index-center">
     <div className="d-flex align-items-center justify-content-between">
      <div className="publishers-index-panel-title mb-0">
       {activePublisher?.name||"Publisher"}
      </div>
      {activePublisher?(
       <div className="d-flex gap-2 p-2">
        <Button size="sm" variant="outline-primary" onClick={openEditModal}><FaEdit/> Edit</Button>
        <Button size="sm" variant="outline-danger" onClick={handleDeletePublisher} disabled={deleting}>{deleting?"Deleting...":<><FaTrash/> Delete</>}</Button>
       </div>
      ):null}
     </div>

     {activePublisher?(
      <div className="publishers-index-details">
       <div className="publishers-index-logo-cell">
        <strong>Logo:</strong>
        {resolveImageSrc(activePublisher.logo,"logos")?<img src={resolveImageSrc(activePublisher.logo,"logos")} alt={`${activePublisher.name||"Publisher"} logo`} />:<span>—</span>}
       </div>
       <div><strong>Name:</strong> {activePublisher.name||"—"}</div>
       <div><strong>Type:</strong> {activePublisher.publisherType||"—"}</div>
       <div><strong>City:</strong> {activePublisher.city||"—"}</div>
       <div><strong>State:</strong> {activePublisher.state?.name||"—"}</div>
       <div><strong>Country:</strong> {activePublisher.country?.name||"—"}</div>
       <div><strong>Imprint:</strong> {activePublisher.imprint||"—"}</div>
       <div><strong>Status:</strong> {activePublisher.isActive?"Active":"Inactive"}</div>
       <div><strong>Poems:</strong> {associatedPoems.length}</div>
      </div>
     ):(
      <div className="publishers-index-empty">Select a publisher</div>
     )}

     <Table responsive hover className="publishers-index-poems-table">
      <thead>
       <tr>
        <th>Title</th>
        <th>Author</th>
        <th>Genre</th>
        <th>Copyright</th>
        <th>Status</th>
       </tr>
      </thead>

      <tbody>
       {!associatedPoems.length&&(
        <tr>
         <td colSpan="5" className="publishers-index-empty">No poems found for this publisher.</td>
        </tr>
       )}

       {associatedPoems.map(poem=>{
        return(
         <tr key={poem._id} onClick={()=>setActivePoem(poem)}>
          <td>
           <div className="publishers-index-poem-title">
            {resolveImageSrc(poem.backgroundImage)?<img src={resolveImageSrc(poem.backgroundImage)} alt={poem.backgroundImage?.alt||poem.title} />:null}
            <span>{poem.title||"—"}{poem.subtitle?<small>{poem.subtitle}</small>:null}</span>
           </div>
          </td>
          <td>{authorDisplay(poem.author)||"—"}</td>
          <td>{poem.genre?.name||"—"}</td>
          <td>{year(poem.copyright)||"—"}</td>
          <td>{poem.isPublished?"Published":"Draft"}{poem.isFeatured?" / Featured":""}</td>
         </tr>
        );
       })}
      </tbody>
     </Table>
    </div>

    <div className="publishers-index-right">
     <div className="d-flex align-items-center justify-content-between">
      <div className="publishers-index-panel-title mb-0">Contact</div>
      {activePublisher?(
       <div className="d-flex gap-2 p-2">
        <Button size="sm" variant="outline-primary" onClick={openEditModal}><FaEdit/> Edit</Button>
        <Button size="sm" variant="outline-danger" onClick={handleDeletePublisher} disabled={deleting}>{deleting?"Deleting...":<><FaTrash/> Delete</>}</Button>
       </div>
      ):null}
     </div>

     {activePublisher?(
      <div className="publishers-index-contact">
       <div><strong>Contact:</strong> {activePublisher.contact||"—"}</div>
       <div><FaPhone/> {activePublisher.phone||"—"}</div>
       <div><strong>Fax:</strong> {activePublisher.fax||"—"}</div>
       <div><FaEnvelope/> {activePublisher.email||"—"}</div>
       <div><FaGlobe/> {activePublisher.website||"—"}</div>
      </div>
     ):(
      <div className="publishers-index-empty">Select a publisher</div>
     )}
    </div>
   </div>

   <Modal show={showPublisherModal} onHide={closePublisherModal} centered size="lg">
    <Modal.Header closeButton>
     <Modal.Title>{effectivePublisherModalMode==="edit"?"Edit Publisher":"Add Publisher"}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     <PublisherForm
      mode={effectivePublisherModalMode}
      publisherId={effectivePublisherModalMode==="edit"?effectivePublisher?._id:""}
      initialData={effectivePublisherModalMode==="edit"?effectivePublisher:null}
      onSaved={handlePublisherSaved}
      onCancel={closePublisherModal}
     />
    </Modal.Body>
   </Modal>

   <Modal show={!!activePoem} onHide={()=>setActivePoem(null)} centered size="lg">
    <Modal.Header closeButton>
     <Modal.Title>{activePoem?.title}</Modal.Title>
    </Modal.Header>

    <Modal.Body>
     {activePoem&&(
      <div>
       <div><strong>Author:</strong> {authorDisplay(activePoem.author)||"—"}</div>
       <div><strong>Genre:</strong> {activePoem.genre?.name||"—"}</div>
       <div><strong>Publisher:</strong> {activePoem.publisher?.name||"—"}</div>
       <div className="publishers-index-poem-content">{activePoem.content||"—"}</div>
      </div>
     )}
    </Modal.Body>
   </Modal>
  </div>
 );
}

