// frontend/pages/books/ContactsIndexPage.jsx
import {useEffect,useMemo,useRef,useState} from "react";
import {Button,Form,InputGroup,Modal,Table} from "react-bootstrap";
import {FaPhone,FaSearch,FaEnvelope,FaPlus,FaEdit,FaTrash} from "react-icons/fa";
import DOMPurify from "dompurify";
import BookBarcode from "../../components/books/BookBarcode.jsx";
import ContactForm from "../forms/ContactForm";
import "../../styles/ContactsIndexPage.css";

const joinNames=(items,key="name")=>{
 if(!Array.isArray(items)||!items.length)return "";
 return items.map(item=>{
  if(typeof item==="string")return item;
  return item?.[key]||item?.displayName||item?.name||"";
 }).filter(Boolean).join(", ");
};

const year=v=>{
 if(!v)return "";
 const d=new Date(v);
 if(Number.isNaN(d.getTime()))return "";
 return d.getFullYear();
};

const firstImage=images=>{
 if(!Array.isArray(images)||!images.length)return "";
 return images.find(Boolean)||"";
};

const normalizeArray=(data,type)=>{
 if(Array.isArray(data))return data;
 if(Array.isArray(data?.data))return data.data;
 if(type==="contacts"&&Array.isArray(data?.contacts))return data.contacts;
 if(type==="books"&&Array.isArray(data?.books))return data.books;
 if(Array.isArray(data?.results))return data.results;
 return [];
};

const formatPhone=value=>{
 if(!value)return "";
 const raw=String(value).trim();
 const digits=raw.replace(/\D/g,"");

 if(digits.length===11&&digits.startsWith("1")){
  const a=digits.slice(1,4);
  const b=digits.slice(4,7);
  const c=digits.slice(7,11);
  return `1 (${a}) - ${b}-${c}`;
 }

 if(digits.length===10){
  const a=digits.slice(0,3);
  const b=digits.slice(3,6);
  const c=digits.slice(6,10);
  return `1 (${a}) - ${b}-${c}`;
 }

 if(raw.startsWith("+"))return raw;
 if(digits.length>10)return `+${digits}`;
 return raw;
};

function FormattedText({value}){
 const text=Array.isArray(value)?value.filter(Boolean).join("<br/>"):String(value||"");
 if(!text)return "—";
 return <div className="contacts-index-formatted-text" dangerouslySetInnerHTML={{__html:DOMPurify.sanitize(text)}} />;
}

export default function ContactsIndexPage({contacts=[],books=[],onSelectBook}){
 const [search,setSearch]=useState("");
 const [statusFilter,setStatusFilter]=useState("");
 const [selectedContact,setSelectedContact]=useState(null);
 const [activeBook,setActiveBook]=useState(null);
 const [contactsData,setContactsData]=useState([]);
 const [booksData,setBooksData]=useState([]);
 const [loading,setLoading]=useState(false);
 const [deleting,setDeleting]=useState(false);
 const [error,setError]=useState("");
 const [showContactModal,setShowContactModal]=useState(false);
 const [contactModalMode,setContactModalMode]=useState("add");
 const didFetchRef=useRef(false);

 useEffect(()=>{
  if(didFetchRef.current)return;
  if(Array.isArray(contacts)&&contacts.length){
   setContactsData(contacts);
  }
  if(Array.isArray(books)&&books.length){
   setBooksData(books);
  }
  if((Array.isArray(contacts)&&contacts.length)||(Array.isArray(books)&&books.length))return;

  didFetchRef.current=true;

  const fetchData=async()=>{
   setLoading(true);
   setError("");
   try{
    const [contactsRes,booksRes]=await Promise.all([
     fetch("/api/contacts"),
     fetch("/api/books")
    ]);

    if(!contactsRes.ok||!booksRes.ok)throw new Error("Failed to load contacts or books.");

    const [contactsJson,booksJson]=await Promise.all([
     contactsRes.json(),
     booksRes.json()
    ]);

    setContactsData(normalizeArray(contactsJson,"contacts"));
    setBooksData(normalizeArray(booksJson,"books"));
   }catch(err){
    setError(err.message||"Failed to load contacts and books.");
   }finally{
    setLoading(false);
   }
  };

  fetchData();
 },[]);

 const sourceContacts=Array.isArray(contacts)&&contacts.length?contacts:contactsData;
 const sourceBooks=Array.isArray(books)&&books.length?books:booksData;

 const filteredContacts=useMemo(()=>{
  const q=search.trim().toLowerCase();
  return sourceContacts.filter(contact=>{
   const haystack=[
    contact.name,
    contact.phone,
    contact.email,
    (contact.notes||[]).join(" ")
   ].join(" ").toLowerCase();

   if(q&&!haystack.includes(q))return false;
   if(statusFilter==="active"&&!contact.isActive)return false;
   if(statusFilter==="inactive"&&contact.isActive)return false;
   return true;
  }).sort((a,b)=>(a.name||"").localeCompare(b.name||""));
 },[sourceContacts,search,statusFilter]);

 const associatedBooks=useMemo(()=>{
  if(!selectedContact?._id)return [];
  return sourceBooks.filter(book=>{
   if(typeof book.lentTo==="string")return book.lentTo===selectedContact._id;
   return book.lentTo?._id===selectedContact._id;
  });
 },[sourceBooks,selectedContact]);

 const clearSearch=()=>setSearch("");
 const clearStatus=()=>setStatusFilter("");
 const clearAll=()=>{
  setSearch("");
  setStatusFilter("");
 };

 function openAddModal(){
  setContactModalMode("add");
  setShowContactModal(true);
 }

 function openEditModal(){
  if(!selectedContact?._id)return;
  setContactModalMode("edit");
  setShowContactModal(true);
 }

 function handleContactSaved(savedContact){
  setContactsData(prev=>{
   const exists=prev.some(item=>item._id===savedContact?._id);
   if(exists){
    return prev.map(item=>item._id===savedContact._id?savedContact:item);
   }
   return [...prev,savedContact];
  });
  setSelectedContact(savedContact);
  setShowContactModal(false);
 }

 async function handleDeleteContact(){
  if(!selectedContact?._id||deleting)return;
  const confirmed=window.confirm(`Delete contact "${selectedContact.name||"this contact"}"?`);
  if(!confirmed)return;

  try{
   setDeleting(true);
   setError("");

   const res=await fetch(`/api/contacts/${selectedContact._id}`,{
    method:"DELETE"
   });
   const data=await res.json().catch(()=>null);

   if(!res.ok)throw new Error(data?.message||"Failed to delete contact.");

   setContactsData(prev=>prev.filter(item=>item._id!==selectedContact._id));
   setSelectedContact(null);
  }catch(err){
   setError(err.message||"Failed to delete contact.");
  }finally{
   setDeleting(false);
  }
 }

 return(
  <div className="contacts-index-page">
   <div className="contacts-index-toolbar">
    <div className="contacts-index-heading">
     <h1>Contacts</h1>
     <div className="contacts-index-subtitle">View contacts and books currently associated with them</div>
    </div>
    <div className="d-flex gap-2">
     <Button onClick={openAddModal}><FaPlus/> Add Contact</Button>
     {selectedContact?(
      <>
       <Button variant="outline-primary" onClick={openEditModal}><FaEdit/> Edit</Button>
       <Button variant="outline-danger" onClick={handleDeleteContact} disabled={deleting}>{deleting?"Deleting...":<><FaTrash/> Delete</>}</Button>
      </>
     ):null}
    </div>
   </div>

   <div className="contacts-index-filters">
    <div className="contacts-index-filter contacts-index-search">
     <label>Search Contacts</label>
     <InputGroup>
      <InputGroup.Text><FaSearch/></InputGroup.Text>
      <Form.Control value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, phone, email..." />
      <Button variant="outline-secondary" onClick={clearSearch} disabled={!search}>Clear</Button>
     </InputGroup>
    </div>

    <div className="contacts-index-filter">
     <label>Status</label>
     <div className="contacts-index-filter-row">
      <Form.Select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
       <option value="">All</option>
       <option value="active">Active</option>
       <option value="inactive">Inactive</option>
      </Form.Select>
      <Button variant="outline-secondary" onClick={clearStatus} disabled={!statusFilter}>Clear</Button>
     </div>
    </div>

    <div className="contacts-index-filter contacts-index-clear-all">
     <label>&nbsp;</label>
     <Button className="contacts-index-clear-btn" onClick={clearAll}>Clear All Filters</Button>
    </div>
   </div>

   {!!error&&<div className="contacts-index-empty">{error}</div>}
   {loading&&<div className="contacts-index-empty">Loading contacts and books...</div>}

   <div className="contacts-index-layout">
    <div className="contacts-index-left">
     <div className="d-flex align-items-center justify-content-between mb-2">
      <div className="contacts-index-panel-title mb-0">Contacts</div>
      <Button size="sm" onClick={openAddModal}><FaPlus/> Add</Button>
     </div>
     <div className="contacts-index-contact-list">
      {!loading&&!filteredContacts.length&&<div className="contacts-index-empty">No contacts found.</div>}
      {filteredContacts.map(contact=>{
       const isActive=selectedContact?._id===contact._id;
       return(
        <button key={contact._id} type="button" className={`contacts-index-contact-item${isActive?" is-active":""}`} onClick={()=>setSelectedContact(contact)}>
         <div className="contacts-index-contact-name">{contact.name}</div>
        </button>
       );
      })}
     </div>
    </div>

    <div className="contacts-index-center">
     <div className="d-flex align-items-center justify-content-between mb-2">
      <div className="contacts-index-panel-title mb-0">{selectedContact?.name||"Contact Details"}</div>
      {selectedContact?(
       <div className="d-flex gap-2">
        <Button size="sm" variant="outline-primary" onClick={openEditModal}><FaEdit/> Edit</Button>
        <Button size="sm" variant="outline-danger" onClick={handleDeleteContact} disabled={deleting}>{deleting?"Deleting...":<><FaTrash/> Delete</>}</Button>
       </div>
      ):null}
     </div>

     {selectedContact?(
      <>
       <div className="contacts-index-contact-card">
        <div className="contacts-index-contact-card-details">
         <div><span className="label">Name:</span> {selectedContact.name||"—"}</div>
         <div><span className="label">Email:</span> {selectedContact.email||"—"}</div>
         <div><span className="label">Phone:</span> {formatPhone(selectedContact.phone)||"—"}</div>
         <div><span className="label">Status:</span> {selectedContact.isActive?"Active":"Inactive"}</div>
         <div><span className="label">Books Out:</span> {associatedBooks.length}</div>
         <div><span className="label">Notes:</span> {(selectedContact.notes||[]).join(" | ")||"—"}</div>
        </div>
       </div>

       <div className="contacts-index-books-wrap">
        <Table responsive hover className="contacts-index-books-table">
         <thead>
          <tr>
           <th>Cover</th>
           <th>Barcode</th>
           <th>Title</th>
           <th>Author</th>
           <th>Publisher</th>
           <th>Lent</th>
           <th>Due</th>
           <th>Returned</th>
          </tr>
         </thead>
         <tbody>
          {!associatedBooks.length&&(
           <tr>
            <td colSpan="8" className="contacts-index-empty">No books associated with this contact.</td>
           </tr>
          )}
          {associatedBooks.map(book=>{
           const image=firstImage(book.images);
           return(
            <tr key={book._id} onClick={()=>{
             setActiveBook(book);
             if(onSelectBook)onSelectBook(book);
            }}>
             <td>
              <div className="contacts-index-book-cover">
               {image?<img src={image} alt={book.title}/>:<div className="contacts-index-book-cover-placeholder">No Image</div>}
              </div>
             </td>
             <td className="contacts-index-barcode"><BookBarcode book={book} height={28} width={0.9} displayValue /></td>
             <td>{book.title}{book.subtitle?`: ${book.subtitle}`:""}</td>
             <td>{joinNames(book.authors,"displayName")||"—"}</td>
             <td>{joinNames(book.publishers,"name")||"—"}</td>
             <td>{book.lentAt?new Date(book.lentAt).toLocaleDateString():"—"}</td>
             <td>{book.dueAt?new Date(book.dueAt).toLocaleDateString():"—"}</td>
             <td>{book.returnedAt?new Date(book.returnedAt).toLocaleDateString():"—"}</td>
            </tr>
           );
          })}
         </tbody>
        </Table>
       </div>
      </>
     ):<div className="contacts-index-empty contacts-index-center-empty">Select a contact to view details.</div>}
    </div>

    <div className="contacts-index-right">
     <div className="contacts-index-panel-title">Contact Summary</div>
     {selectedContact?(
      <div className="contacts-index-summary">
       <div className="contacts-index-summary-item"><FaEnvelope/> <span>{selectedContact.email||"No email"}</span></div>
       <div className="contacts-index-summary-item"><FaPhone/> <span>{formatPhone(selectedContact.phone)||"No phone"}</span></div>
       <div className="contacts-index-summary-item"><span className={`contacts-index-status${selectedContact.isActive?" is-active":" is-inactive"}`}>{selectedContact.isActive?"Active":"Inactive"}</span></div>
       <div className="contacts-index-summary-item">Books linked: {associatedBooks.length}</div>
       <div className="d-flex gap-2 pt-2">
        <Button size="sm" variant="outline-primary" onClick={openEditModal}><FaEdit/> Edit</Button>
        <Button size="sm" variant="outline-danger" onClick={handleDeleteContact} disabled={deleting}>{deleting?"Deleting...":<><FaTrash/> Delete</>}</Button>
       </div>
      </div>
     ):<div className="contacts-index-empty">No contact selected.</div>}
    </div>
   </div>

   <Modal show={showContactModal} onHide={()=>setShowContactModal(false)} centered size="lg">
    <Modal.Header closeButton>
     <Modal.Title>{contactModalMode==="edit"?"Edit Contact":"Add Contact"}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     <ContactForm
      mode={contactModalMode}
      contactId={contactModalMode==="edit"?selectedContact?._id:""}
      initialData={contactModalMode==="edit"?selectedContact:null}
      onSaved={handleContactSaved}
      onCancel={()=>setShowContactModal(false)}
     />
    </Modal.Body>
   </Modal>

   <Modal show={!!activeBook} onHide={()=>setActiveBook(null)} centered size="lg" className="contacts-index-modal">
    <Modal.Header closeButton>
     <Modal.Title>{activeBook?.title}{activeBook?.subtitle?`: ${activeBook.subtitle}`:""}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     {activeBook&&(
      <div className="contacts-index-modal-content">
       <div className="contacts-index-modal-image">
        {firstImage(activeBook.images)?<img src={firstImage(activeBook.images)} alt={activeBook.title}/>:<div className="contacts-index-modal-image-placeholder">No Image</div>}
       </div>
       <div className="contacts-index-modal-details">
        <div><span className="label">Barcode:</span> <div className="mt-2"><BookBarcode book={activeBook} height={44} width={1.1} displayValue /></div></div>
        <div><span className="label">Author:</span> {joinNames(activeBook.authors,"displayName")||"—"}</div>
        <div><span className="label">Publisher:</span> {joinNames(activeBook.publishers,"name")||"—"}</div>
        <div><span className="label">Series:</span> {activeBook.series?.name||"—"}{activeBook.seriesNumber?` #${activeBook.seriesNumber}`:""}</div>
        <div><span className="label">Publication:</span> {[year(activeBook.publication?.publishedDate),activeBook.publication?.language].filter(Boolean).join(" ")||"—"}</div>
        <div><span className="label">ISBN-10:</span> {activeBook.isbn10||"—"}</div>
        <div><span className="label">ISBN-13:</span> {activeBook.isbn13||"—"}</div>
        <div><span className="label">eISBN:</span> {activeBook.eisbn||"—"}</div>
        <div><span className="label">Formats:</span> {(activeBook.formats||[]).join(", ")||"—"}</div>
        <div><span className="label">Genres:</span> {(activeBook.genres||[]).join(", ")||"—"}</div>
        <div><span className="label">Subjects:</span> {(activeBook.subjects||[]).join("; ")||"—"}</div>
        <div><span className="label">Summary:</span> <FormattedText value={activeBook.summary} /></div>
       </div>
      </div>
     )}
    </Modal.Body>
   </Modal>
  </div>
 );
}
