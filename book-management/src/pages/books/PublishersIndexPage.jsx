import {useEffect,useMemo,useState} from "react";
import {Button,Form,InputGroup,Modal,Table} from "react-bootstrap";
import {FaSearch,FaGlobe,FaPhone,FaEnvelope,FaPlus,FaEdit,FaTrash,FaMapMarkerAlt} from "react-icons/fa";
import BookBarcode from "../../components/books/BookBarcode.jsx";
import PublisherForm from "../forms/PublisherForm";
import "../../styles/PublishersIndexPage.css";

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

const joinNames=(items,key="name")=>{
 if(!Array.isArray(items)||!items.length)return "";
 return items.map(item=>{
  if(typeof item==="string")return item;
  return item?.[key]||item?.displayName||item?.name||item?.title||"";
 }).filter(Boolean).join(", ");
};

const firstImage=images=>{
 if(!Array.isArray(images)||!images.length)return "";
 return images.find(Boolean)||"";
};

const getLogoPreview=url=>{
 const value=String(url||"").trim();
 if(!value)return "";
 if(value.startsWith("http://")||value.startsWith("https://")||value.startsWith("/")||value.startsWith("data:"))return value;
 return `/publisher/${value}`;
};

const getPublisherAddress=publisher=>{
 if(!publisher)return "";
 const isInternational=publisher.publisherType==="international";
 const locality=isInternational
  ?[publisher.city,publisher.region,publisher.country?.name].filter(Boolean).join(", ")
  :[publisher.city,publisher.state?.name,publisher.country?.name].filter(Boolean).join(", ");
 return [
  publisher.addressLine1,
  publisher.addressLine2,
  locality,
  publisher.postalCode
 ].filter(Boolean).join(" | ");
};

const normalizeList=(data,key)=>{
 if(Array.isArray(data))return data;
 if(Array.isArray(data?.[key]))return data[key];
 if(Array.isArray(data?.items))return data.items;
 if(Array.isArray(data?.results))return data.results;
 return [];
};

async function fetchJson(url){
 const res=await fetch(url,{cache:"no-store"});
 const data=await res.json();
 if(!res.ok)throw new Error(data?.message||`Failed to load ${url}`);
 return data;
}

export default function PublishersIndexPage({publishers:publishersProp,books:booksProp}){
 const [publishers,setPublishers]=useState(Array.isArray(publishersProp)?publishersProp:[]);
 const [books,setBooks]=useState(Array.isArray(booksProp)?booksProp:[]);
 const [loading,setLoading]=useState(!Array.isArray(publishersProp)||!Array.isArray(booksProp));
 const [error,setError]=useState("");
 const [search,setSearch]=useState("");
 const [typeFilter,setTypeFilter]=useState("");
 const [selectedPublisher,setSelectedPublisher]=useState(null);
 const [activeBook,setActiveBook]=useState(null);
 const [showPublisherModal,setShowPublisherModal]=useState(false);
 const [publisherModalMode,setPublisherModalMode]=useState("add");
 const [deleting,setDeleting]=useState(false);
 const [showDeleteModal,setShowDeleteModal]=useState(false);

 useEffect(()=>{
  if(Array.isArray(publishersProp))setPublishers(publishersProp);
 },[publishersProp]);

 useEffect(()=>{
  if(Array.isArray(booksProp))setBooks(booksProp);
 },[booksProp]);

 useEffect(()=>{
  if(Array.isArray(publishersProp)&&Array.isArray(booksProp)){
   setLoading(false);
   return;
  }

  let active=true;

  (async()=>{
   try{
    setLoading(true);
    setError("");

    const [publishersData,booksData]=await Promise.all([
     Array.isArray(publishersProp)?Promise.resolve({publishers:publishersProp}):fetchJson("/api/publishers"),
     Array.isArray(booksProp)?Promise.resolve({books:booksProp}):fetchJson("/api/books")
    ]);

    if(!active)return;

    setPublishers(normalizeList(publishersData,"publishers"));
    setBooks(normalizeList(booksData,"books"));
   }catch(err){
    if(active){
     setError(err.message||"Failed to load publishers");
     setPublishers([]);
     setBooks([]);
    }
   }finally{
    if(active)setLoading(false);
   }
  })();

  return()=>{active=false;};
 },[publishersProp,booksProp]);

 const filteredPublishers=useMemo(()=>{
  const q=search.trim().toLowerCase();

  return publishers.filter(pub=>{
   const haystack=[
    pub?.name,
    pub?.imprint,
    pub?.addressLine1,
    pub?.addressLine2,
    pub?.city,
    pub?.region,
    pub?.postalCode,
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

 useEffect(()=>{
  if(!filteredPublishers.length){
   setSelectedPublisher(null);
   return;
  }
  if(!selectedPublisher){
   setSelectedPublisher(filteredPublishers[0]);
   return;
  }
  const exists=filteredPublishers.find(pub=>pub?._id===selectedPublisher?._id);
  if(!exists)setSelectedPublisher(filteredPublishers[0]);
 },[filteredPublishers,selectedPublisher]);

 const associatedBooks=useMemo(()=>{
  if(!selectedPublisher?._id)return [];
  return books.filter(book=>
   Array.isArray(book.publishers)&&
   book.publishers.some(pub=>getId(pub)===selectedPublisher._id)
  ).sort((a,b)=>(a?.title||"").localeCompare(b?.title||"",undefined,{sensitivity:"base"}));
 },[books,selectedPublisher]);

 const clearSearch=()=>setSearch("");
 const clearType=()=>setTypeFilter("");

 function openAddModal(){
  setPublisherModalMode("add");
  setShowPublisherModal(true);
 }

 function openEditModal(){
  if(!selectedPublisher?._id)return;
  setPublisherModalMode("edit");
  setShowPublisherModal(true);
 }

 function openDeleteModal(){
  if(!selectedPublisher?._id||deleting)return;
  setShowDeleteModal(true);
 }

 function closeDeleteModal(){
  if(deleting)return;
  setShowDeleteModal(false);
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
  setShowPublisherModal(false);
 }

 async function handleDeletePublisher(){
  if(!selectedPublisher?._id||deleting)return;

  try{
   setDeleting(true);
   setError("");

   const res=await fetch(`/api/publishers/${selectedPublisher._id}`,{
    method:"DELETE"
   });
   const data=await res.json().catch(()=>null);

   if(!res.ok)throw new Error(data?.message||"Failed to delete publisher");

   setPublishers(prev=>prev.filter(item=>item._id!==selectedPublisher._id));
   setSelectedPublisher(null);
   setShowDeleteModal(false);
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
     </div>

     <div className="publishers-index-list">
      {!filteredPublishers.length&&<div className="publishers-index-empty">No publishers found.</div>}

      {filteredPublishers.map(pub=>{
       const active=selectedPublisher?._id===pub._id;
       return(
        <button key={pub._id} type="button" className={`publishers-index-item${active?" is-active":""}`} onClick={()=>{setSelectedPublisher(pub);setActiveBook(null);}}>
         <div className="publishers-index-name">{pub.name||"—"}</div>
        </button>
       );
      })}
     </div>
    </div>

    <div className="publishers-index-center">
     <div className="d-flex align-items-center justify-content-between">
      <div className="publishers-index-panel-title mb-0">
       {selectedPublisher?.name||"Publisher"}
      </div>
      {selectedPublisher?(
       <div className="d-flex gap-2 p-2">
        <Button size="sm" variant="outline-primary" onClick={openEditModal}><FaEdit/> Edit</Button>
        <Button size="sm" variant="outline-danger" onClick={openDeleteModal} disabled={deleting}><FaTrash/> Delete</Button>
       </div>
      ):null}
     </div>

     {selectedPublisher?(
     <div className="publishers-index-details">
       {getLogoPreview(selectedPublisher.logo)?(
        <div className="publishers-index-logo">
         <img src={getLogoPreview(selectedPublisher.logo)} alt={`${selectedPublisher.name||"Publisher"} logo`} />
        </div>
       ):null}
       <div><strong>Type:</strong> {selectedPublisher.publisherType||"—"}</div>
       <div><strong>Address:</strong> {getPublisherAddress(selectedPublisher)||"—"}</div>
       <div><strong>City:</strong> {selectedPublisher.city||"—"}</div>
       {selectedPublisher.publisherType==="international"?(
        <div><strong>Region / Province:</strong> {selectedPublisher.region||"—"}</div>
       ):(
        <div><strong>State:</strong> {selectedPublisher.state?.name||"—"}</div>
       )}
       <div><strong>Country:</strong> {selectedPublisher.country?.name||"—"}</div>
       <div><strong>{selectedPublisher.publisherType==="domestic"?"Zip Code":"Postal Code"}:</strong> {selectedPublisher.postalCode||"—"}</div>
       <div><strong>Imprint:</strong> {selectedPublisher.imprint||"—"}</div>
       <div><strong>Books:</strong> {associatedBooks.length}</div>
      </div>
     ):(
      <div className="publishers-index-empty">Select a publisher</div>
     )}

     <Table responsive hover className="publishers-index-books-table">
      <thead>
       <tr>
        <th>Cover</th>
        <th>Barcode</th>
        <th>Title</th>
        <th>Author</th>
        <th>Year</th>
       </tr>
      </thead>

      <tbody>
       {!associatedBooks.length&&(
        <tr>
         <td colSpan="5" className="publishers-index-empty">No books found for this publisher.</td>
        </tr>
       )}

       {associatedBooks.map(book=>{
        const image=firstImage(book.images);
        return(
         <tr key={book._id} onClick={()=>setActiveBook(book)}>
          <td>
           <div className="publisher-book-cover">
            {image?<img src={`/images/${image}`} alt={book.title}/>:<div className="publisher-book-cover-placeholder">No Image</div>}
           </div>
          </td>
          <td className="publisher-barcode"><BookBarcode book={book} height={32} width={0.9} displayValue className="publisher-barcode-svg" /></td>
          <td>{book.title||"—"}</td>
          <td>{joinNames(book.authors,"displayName")||"—"}</td>
          <td>{year(book.publication?.publishedDate)||"—"}</td>
         </tr>
        );
       })}
      </tbody>
     </Table>
    </div>

    <div className="publishers-index-right">
     <div className="d-flex align-items-center justify-content-between">
      <div className="publishers-index-panel-title mb-0">Contact</div>
     </div>

     {selectedPublisher?(
     <div className="publishers-index-contact">
       <div><FaMapMarkerAlt/> {getPublisherAddress(selectedPublisher)||"—"}</div>
       <div><FaPhone/> {selectedPublisher.phone||"—"}</div>
       <div><FaEnvelope/> {selectedPublisher.email||"—"}</div>
       <div><FaGlobe/> {selectedPublisher.website||"—"}</div>
      </div>
     ):(
      <div className="publishers-index-empty">Select a publisher</div>
     )}
    </div>
   </div>

   <Modal show={showPublisherModal} onHide={()=>setShowPublisherModal(false)} centered size="lg">
    <Modal.Header closeButton>
     <Modal.Title>{publisherModalMode==="edit"?"Edit Publisher":"Add Publisher"}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     <PublisherForm
      mode={publisherModalMode}
      publisherId={publisherModalMode==="edit"?selectedPublisher?._id:""}
      initialData={publisherModalMode==="edit"?selectedPublisher:null}
      onSaved={handlePublisherSaved}
      onCancel={()=>setShowPublisherModal(false)}
     />
    </Modal.Body>
   </Modal>

   <Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
    <Modal.Header closeButton={!deleting}>
     <Modal.Title>Delete Publisher</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     <div className="publishers-index-delete">
      <div className="publishers-index-delete-content">
       <div className="publishers-index-delete-name">{selectedPublisher?.name||"Selected publisher"}</div>
       <div>Are you sure you want to delete this publisher?</div>
       <div className="publishers-index-delete-note">This action cannot be undone.</div>
      </div>
     </div>
    </Modal.Body>
    <Modal.Footer>
     <Button variant="secondary" onClick={closeDeleteModal} disabled={deleting}>Cancel</Button>
     <Button variant="danger" onClick={handleDeletePublisher} disabled={deleting}>{deleting?"Deleting...":<><FaTrash/> Delete</>}</Button>
    </Modal.Footer>
   </Modal>

   <Modal show={!!activeBook} onHide={()=>setActiveBook(null)} centered size="lg">
    <Modal.Header closeButton>
     <Modal.Title>{activeBook?.title}</Modal.Title>
    </Modal.Header>

   <Modal.Body>
     {activeBook&&(
      <div className="publishers-index-book-modal-content">
       <div className="publishers-index-book-modal-details">
        <div><strong>Barcode:</strong><div className="mt-2"><BookBarcode book={activeBook} height={52} width={1.2} displayValue className="publisher-barcode-svg" /></div></div>
        <div><strong>Author:</strong> {joinNames(activeBook.authors,"displayName")||"—"}</div>
        <div><strong>Publisher:</strong> {joinNames(activeBook.publishers,"name")||"—"}</div>
       </div>
       <div className="publishers-index-book-modal-cover">
        {firstImage(activeBook.images)?<img src={`/images/${firstImage(activeBook.images)}`} alt={activeBook.title}/>:<div className="publishers-index-book-modal-cover-placeholder">No Image</div>}
       </div>
      </div>
     )}
    </Modal.Body>
   </Modal>
  </div>
 );
}
