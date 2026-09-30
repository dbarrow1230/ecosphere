// src/pages/loans/LoansIndexPage.jsx
import {useEffect,useMemo,useState} from "react";
import {Button,Form,InputGroup,Modal,Pagination,Table} from "react-bootstrap";
import {FaCheck,FaPlus,FaSearch,FaTrash} from "react-icons/fa";
import {useSearchParams} from "react-router-dom";
import LoanForm from "../forms/LoanForm";
import "../../styles/LoansIndexPage.css";

function toInputDate(value){
 if(!value)return "";
 const d=new Date(value);
 if(Number.isNaN(d.getTime()))return "";
 return d.toISOString().slice(0,10);
}

const formatDate=value=>{
 if(!value)return "—";
 const d=new Date(value);
 if(Number.isNaN(d.getTime()))return "—";
 return d.toLocaleDateString();
};

const getId=value=>{
 if(!value)return "";
 return typeof value==="object"?(value?._id||""):value;
};

const getBookLabel=item=>{
 if(!item)return "";
 if(typeof item==="string")return item;
 return [item?.title||"",item?.subtitle||""].filter(Boolean).join(": ");
};

const getContactLabel=item=>{
 if(!item)return "";
 if(typeof item==="string")return item;
 return item?.displayName||item?.name||[item?.firstName,item?.lastName].filter(Boolean).join(" ");
};

const firstImage=images=>{
 if(!Array.isArray(images)||!images.length)return "";
 return images.find(Boolean)||"";
};

const normalizeList=(data,key)=>{
 if(Array.isArray(data))return data;
 if(Array.isArray(data?.[key]))return data[key];
 if(Array.isArray(data?.items))return data.items;
 if(Array.isArray(data?.results))return data.results;
 return [];
};

const getLoanStatus=loan=>String(loan?.status||"").toLowerCase().trim();

const isReturnedLoan=loan=>Boolean(loan?.returnedAt)||["returned","closed","complete","completed"].includes(getLoanStatus(loan));

const isActiveLoan=loan=>!isReturnedLoan(loan)&&!["cancelled","canceled"].includes(getLoanStatus(loan));

const isOverdueLoan=loan=>{
 if(!isActiveLoan(loan)||!loan?.dueAt)return false;
 const due=new Date(loan.dueAt).getTime();
 return !Number.isNaN(due)&&due<Date.now();
};

const isDueTodayLoan=loan=>{
 if(!isActiveLoan(loan)||!loan?.dueAt)return false;
 const due=new Date(loan.dueAt);
 const now=new Date();
 return due.getFullYear()===now.getFullYear()&&due.getMonth()===now.getMonth()&&due.getDate()===now.getDate();
};

const isDueThisWeekLoan=loan=>{
 if(!isActiveLoan(loan)||!loan?.dueAt)return false;
 const due=new Date(loan.dueAt).getTime();
 const end=new Date();
 end.setDate(end.getDate()+7);
 return !Number.isNaN(due)&&due>=Date.now()&&due<=end.getTime();
};

async function fetchJson(url){
 const res=await fetch(url);
 const data=await res.json();
 if(!res.ok)throw new Error(data?.message||`Failed to load ${url}`);
 return data;
}

export default function LoansIndexPage({loans:loansProp,books:booksProp,contacts:contactsProp}){
 const [searchParams]=useSearchParams();
 const [loans,setLoans]=useState(Array.isArray(loansProp)?loansProp:[]);
 const [books,setBooks]=useState(Array.isArray(booksProp)?booksProp:[]);
 const [contacts,setContacts]=useState(Array.isArray(contactsProp)?contactsProp:[]);
 const [loading,setLoading]=useState(!Array.isArray(loansProp)||!Array.isArray(booksProp)||!Array.isArray(contactsProp));
 const [error,setError]=useState("");
 const [search,setSearch]=useState("");
 const [statusFilter,setStatusFilter]=useState("");
 const [selectedRows,setSelectedRows]=useState([]);
 const [currentPage,setCurrentPage]=useState(1);
 const [showLoanFormModal,setShowLoanFormModal]=useState(false);
 const [loanFormMode,setLoanFormMode]=useState("add");
 const [selectedLoan,setSelectedLoan]=useState(null);
 const [showReturnModal,setShowReturnModal]=useState(false);
 const [returnConditionIn,setReturnConditionIn]=useState("good");
 const [returnDate,setReturnDate]=useState("");
 const [activeLoan,setActiveLoan]=useState(null);
 const pageSize=15;
 const statusQuery=searchParams.get("status")||"";
 const dueQuery=searchParams.get("due")||"";
 const loanQuery=searchParams.get("loan")||"";

 useEffect(()=>{
  setCurrentPage(1);
 },[statusQuery,dueQuery,loanQuery]);

 useEffect(()=>{
  if(Array.isArray(loansProp)&&Array.isArray(booksProp)&&Array.isArray(contactsProp)){
   setLoans(loansProp);
   setBooks(booksProp);
   setContacts(contactsProp);
   setLoading(false);
   return;
  }

  let active=true;

  (async()=>{
   try{
    setLoading(true);
    setError("");

    const [loansData,booksData,contactsData]=await Promise.all([
     Array.isArray(loansProp)?Promise.resolve({loans:loansProp}):fetchJson("/api/loans?limit=500"),
     Array.isArray(booksProp)?Promise.resolve({books:booksProp}):fetchJson("/api/books?limit=500"),
     Array.isArray(contactsProp)?Promise.resolve({contacts:contactsProp}):fetchJson("/api/contacts?limit=500")
    ]);

    if(!active)return;

    setLoans(normalizeList(loansData,"loans"));
    setBooks(normalizeList(booksData,"books"));
    setContacts(normalizeList(contactsData,"contacts"));
   }catch(err){
    if(active){
     setError(err.message||"Failed to load loans");
     setLoans([]);
     setBooks([]);
     setContacts([]);
    }
   }finally{
    if(active)setLoading(false);
   }
  })();

  return()=>{active=false;};
 },[loansProp,booksProp,contactsProp]);

 const mergedLoans=useMemo(()=>{
  return loans.map(loan=>{
   const bookId=getId(loan?.book);
   const contactId=getId(loan?.contact);
   const book=typeof loan?.book==="object"&&loan?.book?loan.book:books.find(item=>String(item?._id)===String(bookId))||loan?.book;
   const contact=typeof loan?.contact==="object"&&loan?.contact?loan.contact:contacts.find(item=>String(item?._id)===String(contactId))||loan?.contact;
   return {...loan,book,contact};
  });
 },[loans,books,contacts]);

 const filteredLoans=useMemo(()=>{
  const q=search.trim().toLowerCase();
  return mergedLoans.filter(loan=>{
   const haystack=[
    getBookLabel(loan?.book),
    getContactLabel(loan?.contact),
    loan?.status,
    loan?.loanRule,
    loan?.conditionOut,
    loan?.conditionIn,
    Array.isArray(loan?.notes)?loan.notes.join(" "):""
   ].join(" ").toLowerCase();

   if(loanQuery&&String(loan?._id||loan?.id)!==loanQuery)return false;
   if(q&&!haystack.includes(q))return false;
   if(statusFilter&&loan?.status!==statusFilter)return false;
   if(statusQuery==="active"&&!isActiveLoan(loan))return false;
   if(statusQuery==="overdue"&&!isOverdueLoan(loan))return false;
   if(statusQuery==="returned"&&!isReturnedLoan(loan))return false;
   if(dueQuery==="today"&&!isDueTodayLoan(loan))return false;
   if(dueQuery==="week"&&!isDueThisWeekLoan(loan))return false;
   return true;
  }).sort((a,b)=>new Date(b?.lentAt||0)-new Date(a?.lentAt||0));
 },[mergedLoans,search,statusFilter,statusQuery,dueQuery,loanQuery]);

 const totalPages=Math.max(1,Math.ceil(filteredLoans.length/pageSize));
 const safeCurrentPage=currentPage>totalPages?totalPages:currentPage;

 const paginatedLoans=useMemo(()=>{
  const start=(safeCurrentPage-1)*pageSize;
  return filteredLoans.slice(start,start+pageSize);
 },[filteredLoans,safeCurrentPage]);

 const toggleRow=id=>{
  setSelectedRows(prev=>prev.includes(id)?prev.filter(item=>item!==id):[...prev,id]);
 };

 const toggleAllCurrentPage=()=>{
  const ids=paginatedLoans.map(item=>item._id);
  const allSelected=ids.length>0&&ids.every(id=>selectedRows.includes(id));
  if(allSelected){
   setSelectedRows(prev=>prev.filter(id=>!ids.includes(id)));
   return;
  }
  setSelectedRows(prev=>[...new Set([...prev,...ids])]);
 };

 const clearSearch=()=>{setSearch("");setCurrentPage(1);};
 const clearStatus=()=>{setStatusFilter("");setCurrentPage(1);};

 const openAddLoanModal=()=>{
  setLoanFormMode("add");
  setSelectedLoan(null);
  setShowLoanFormModal(true);
 };

 const openEditLoanModal=loan=>{
  setLoanFormMode("edit");
  setSelectedLoan(loan);
  setShowLoanFormModal(true);
 };

 const closeLoanFormModal=()=>{
  setShowLoanFormModal(false);
  setSelectedLoan(null);
 };

 const openReturnModal=loan=>{
  setSelectedLoan(loan);
  setReturnConditionIn(loan?.conditionIn||"good");
  setReturnDate("");
  setShowReturnModal(true);
 };

 const closeReturnModal=()=>{
  setShowReturnModal(false);
  setSelectedLoan(null);
  setReturnConditionIn("good");
  setReturnDate("");
 };

 const handleLoanSaved=loan=>{
  setShowLoanFormModal(false);
  if(loanFormMode==="edit"){
   setLoans(prev=>prev.map(item=>item._id===loan?._id?loan:item));
  }else{
   setLoans(prev=>loan?._id?[loan,...prev.filter(item=>item._id!==loan._id)]:prev);
  }
  setSelectedLoan(null);
 };

 const handleReturnLoan=async()=>{
  if(!selectedLoan?._id)return;
  try{
   const res=await fetch(`/api/loans/${selectedLoan._id}/return`,{
    method:"PUT",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
     returnedAt:returnDate||null,
     conditionIn:returnConditionIn
    })
   });
   const data=await res.json();
   if(!res.ok)throw new Error(data?.message||"Failed to return loan");
   const saved=data?.loan||data;
   setLoans(prev=>prev.map(item=>item._id===saved?._id?saved:item));
   closeReturnModal();
  }catch(err){
   setError(err.message||"Failed to return loan");
  }
 };

 const handleDeleteSelected=async()=>{
  try{
   await Promise.all(selectedRows.map(id=>fetch(`/api/loans/${id}`,{method:"DELETE"})));
   setLoans(prev=>prev.filter(item=>!selectedRows.includes(item._id)));
   setSelectedRows([]);
  }catch{
   setError("Failed to delete selected loans");
  }
 };

 if(loading){
  return <div className="loans-index-page"><div className="loans-index-empty">Loading loans...</div></div>;
 }

 return(
  <div className="loans-index-page">
   <div className="loans-index-toolbar">
    <div className="loans-index-heading">
     <h1>Lending</h1>
    </div>
    <div className="loans-index-actions">
     <Button onClick={openAddLoanModal}><FaPlus className="me-2"/>Lend Book</Button>
     <Button variant="outline-danger" onClick={handleDeleteSelected} disabled={!selectedRows.length}><FaTrash className="me-2"/>Delete Selected</Button>
    </div>
   </div>

   {error?<div className="alert alert-danger">{error}</div>:null}

   <div className="loans-index-filters">
    <div className="loans-index-filter loans-index-search">
     <label>Search</label>
     <InputGroup>
      <InputGroup.Text><FaSearch/></InputGroup.Text>
      <Form.Control value={search} onChange={e=>{setSearch(e.target.value);setCurrentPage(1);}} placeholder="Search book, contact, rule, status..." />
      <Button variant="outline-secondary" onClick={clearSearch} disabled={!search}>Clear</Button>
     </InputGroup>
    </div>

    <div className="loans-index-filter">
     <label>Status</label>
     <div className="loans-index-filter-row">
      <Form.Select value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setCurrentPage(1);}}>
       <option value="">All</option>
       <option value="active">Active</option>
       <option value="overdue">Overdue</option>
       <option value="returned">Returned</option>
      </Form.Select>
      <Button variant="outline-secondary" onClick={clearStatus} disabled={!statusFilter}>Clear</Button>
     </div>
    </div>
   </div>

   <div className="loans-index-table-wrap">
    <Table responsive hover className="loans-index-table">
     <thead>
      <tr>
       <th><Form.Check type="checkbox" checked={paginatedLoans.length>0&&paginatedLoans.every(item=>selectedRows.includes(item._id))} onChange={toggleAllCurrentPage}/></th>
       <th>Cover</th>
       <th>Book</th>
       <th>Contact</th>
       <th>Status</th>
       <th>Lent</th>
       <th>Due</th>
       <th>Returned</th>
       <th>Rule</th>
       <th>Actions</th>
      </tr>
     </thead>
     <tbody>
      {!paginatedLoans.length&&(
       <tr>
        <td colSpan="10" className="loans-index-empty">No loans found.</td>
       </tr>
      )}
      {paginatedLoans.map(loan=>{
       const image=firstImage(loan?.book?.images);
       return(
        <tr key={loan._id} className={selectedRows.includes(loan._id)?"is-selected":""}>
         <td onClick={e=>e.stopPropagation()}><Form.Check type="checkbox" checked={selectedRows.includes(loan._id)} onChange={()=>toggleRow(loan._id)}/></td>
         <td onClick={()=>setActiveLoan(loan)}>
          <div className="loans-index-cover">
           {image?<img src={`/images/${image}`} alt={loan?.book?.title}/>:<div className="loans-index-cover-placeholder">No Image</div>}
          </div>
         </td>
         <td onClick={()=>setActiveLoan(loan)}>{getBookLabel(loan?.book)||"—"}</td>
         <td onClick={()=>setActiveLoan(loan)}>{getContactLabel(loan?.contact)||"—"}</td>
         <td onClick={()=>setActiveLoan(loan)}>{loan?.status||"—"}</td>
         <td onClick={()=>setActiveLoan(loan)}>{formatDate(loan?.lentAt)}</td>
         <td onClick={()=>setActiveLoan(loan)}>{formatDate(loan?.dueAt)}</td>
         <td onClick={()=>setActiveLoan(loan)}>{formatDate(loan?.returnedAt)}</td>
         <td onClick={()=>setActiveLoan(loan)}>{loan?.loanRule||"—"}</td>
         <td onClick={e=>e.stopPropagation()} className="d-flex gap-2">
          <Button size="sm" variant="outline-primary" onClick={()=>openEditLoanModal(loan)}>Edit</Button>
          {!loan?.returnedAt?<Button size="sm" variant="outline-success" onClick={()=>openReturnModal(loan)}><FaCheck/></Button>:null}
         </td>
        </tr>
       );
      })}
     </tbody>
    </Table>
   </div>

   <div className="loans-index-footer">
    <div className="loans-index-count">Showing {paginatedLoans.length?((safeCurrentPage-1)*pageSize)+1:0}-{Math.min(safeCurrentPage*pageSize,filteredLoans.length)} of {filteredLoans.length}</div>
    <Pagination className="loans-index-pagination">
     <Pagination.First onClick={()=>setCurrentPage(1)} disabled={safeCurrentPage===1}/>
     <Pagination.Prev onClick={()=>setCurrentPage(safeCurrentPage-1)} disabled={safeCurrentPage===1}/>
     {Array.from({length:totalPages},(_,i)=>i+1).slice(Math.max(0,safeCurrentPage-3),Math.min(totalPages,safeCurrentPage+2)).map(page=><Pagination.Item key={page} active={page===safeCurrentPage} onClick={()=>setCurrentPage(page)}>{page}</Pagination.Item>)}
     <Pagination.Next onClick={()=>setCurrentPage(safeCurrentPage+1)} disabled={safeCurrentPage===totalPages}/>
     <Pagination.Last onClick={()=>setCurrentPage(totalPages)} disabled={safeCurrentPage===totalPages}/>
    </Pagination>
   </div>

   <Modal show={showLoanFormModal} onHide={closeLoanFormModal} centered size="xl" backdrop="static">
    <Modal.Header closeButton>
     <Modal.Title>{loanFormMode==="edit"?"Edit Loan":"Lend Book"}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     <LoanForm
      mode={loanFormMode}
      loanId={loanFormMode==="edit"?selectedLoan?._id:""}
      initialData={loanFormMode==="edit"?selectedLoan:null}
      onSaved={handleLoanSaved}
      onCancel={closeLoanFormModal}
     />
    </Modal.Body>
   </Modal>

   <Modal show={showReturnModal} onHide={closeReturnModal} centered>
    <Modal.Header closeButton>
     <Modal.Title>Return Book</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     <div className="mb-3"><strong>Book:</strong> {getBookLabel(selectedLoan?.book)||"—"}</div>
     <div className="mb-3"><strong>Contact:</strong> {getContactLabel(selectedLoan?.contact)||"—"}</div>
     <div className="mb-3">
      <label className="form-label">Returned At</label>
      <input type="date" className="form-control" value={returnDate} min={toInputDate(selectedLoan?.lentAt)||undefined} onChange={e=>setReturnDate(e.target.value)} />
     </div>
     <div className="mb-3">
      <label className="form-label">Condition In</label>
      <Form.Select value={returnConditionIn} onChange={e=>setReturnConditionIn(e.target.value)}>
       <option value="new">new</option>
       <option value="like new">like new</option>
       <option value="very good">very good</option>
       <option value="good">good</option>
       <option value="fair">fair</option>
       <option value="poor">poor</option>
       <option value="damaged">damaged</option>
      </Form.Select>
     </div>
    </Modal.Body>
    <Modal.Footer>
     <Button variant="secondary" onClick={closeReturnModal}>Cancel</Button>
     <Button variant="success" onClick={handleReturnLoan}><FaCheck className="me-2"/>Return</Button>
    </Modal.Footer>
   </Modal>

   <Modal show={!!activeLoan} onHide={()=>setActiveLoan(null)} centered size="lg">
    <Modal.Header closeButton>
     <Modal.Title>{getBookLabel(activeLoan?.book)||"Loan Details"}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     {activeLoan&&(
      <div className="d-flex gap-3">
       <div style={{width:"120px",flex:"0 0 120px"}}>
        {firstImage(activeLoan?.book?.images)?<img src={`/images/${firstImage(activeLoan.book.images)}`} alt={activeLoan?.book?.title} style={{width:"100%",borderRadius:"8px"}}/>:<div className="loans-index-cover-placeholder">No Image</div>}
       </div>
       <div className="flex-grow-1">
        <div><strong>Book:</strong> {getBookLabel(activeLoan?.book)||"—"}</div>
        <div><strong>Contact:</strong> {getContactLabel(activeLoan?.contact)||"—"}</div>
        <div><strong>Status:</strong> {activeLoan?.status||"—"}</div>
        <div><strong>Lent At:</strong> {formatDate(activeLoan?.lentAt)}</div>
        <div><strong>Due At:</strong> {formatDate(activeLoan?.dueAt)}</div>
        <div><strong>Returned At:</strong> {formatDate(activeLoan?.returnedAt)}</div>
        <div><strong>Loan Rule:</strong> {activeLoan?.loanRule||"—"}</div>
        <div><strong>Loan Days:</strong> {activeLoan?.loanDays||"—"}</div>
        <div><strong>Condition Out:</strong> {activeLoan?.conditionOut||"—"}</div>
        <div><strong>Condition In:</strong> {activeLoan?.conditionIn||"—"}</div>
        <div><strong>Notes:</strong> {(activeLoan?.notes||[]).join(" | ")||"—"}</div>
       </div>
      </div>
     )}
    </Modal.Body>
   </Modal>
  </div>
 );
}
