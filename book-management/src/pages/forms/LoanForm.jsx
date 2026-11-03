// src/pages/forms/LoanForm.jsx
import {useEffect,useMemo,useState} from "react";
import {Modal} from "react-bootstrap";
import {useNavigate,useParams} from "react-router-dom";
import ContactForm from "./ContactForm";

const LOAN_PERIOD_DAYS={default:14,children:7,reference:3,audiobook:14,ebook:14};
const CONDITION_OPTIONS=["new","like new","very good","good","fair","poor","damaged"];

const emptyForm={
 book:"",
 contact:"",
 lentAt:"",
 loanRule:"default",
 loanDays:"",
 dueAt:"",
 returnedAt:"",
 conditionOut:"good",
 conditionIn:"good",
 notes:""
};

function toInputDate(value){
 if(!value)return "";
 const d=new Date(value);
 if(Number.isNaN(d.getTime()))return "";
 return d.toISOString().slice(0,10);
}

function toCsv(value){
 if(!Array.isArray(value))return "";
 return value.filter(Boolean).join(", ");
}

function fromCsv(value){
 return value.split(",").map(item=>item.trim()).filter(Boolean);
}

function getId(value){
 if(!value)return "";
 return String(typeof value==="object"?(value?._id||value?.$oid||""):value);
}

function getBookLabel(item){
 if(!item)return "";
 if(typeof item==="string")return item;
 return [item?.title||"",item?.subtitle||""].filter(Boolean).join(": ");
}

function getContactLabel(item){
 if(!item)return "";
 if(typeof item==="string")return item;
 return item?.displayName||item?.name||[item?.firstName,item?.lastName].filter(Boolean).join(" ");
}

function normalizeOptions(data,key){
 if(Array.isArray(data))return data;
 if(Array.isArray(data?.[key]))return data[key];
 if(Array.isArray(data?.items))return data.items;
 if(Array.isArray(data?.results))return data.results;
 return [];
}

async function fetchJson(url){
 const res=await fetch(url);
 const data=await res.json();
 if(!res.ok)throw new Error(data?.message||`Failed to load ${url}`);
 return data;
}

function InlineField({label,children,right}){
 return(
  <div className="row g-2 align-items-start mb-2">
   <div className="col-md-3 fw-semibold text-md-end pt-2">{label}:</div>
   <div className="col-md-9">
    <div className="d-flex gap-2 align-items-start flex-wrap">
     <div className="flex-grow-1">{children}</div>
     {right||null}
    </div>
   </div>
  </div>
 );
}

export default function LoanForm({mode,loanId,initialData,onSaved,onCancel,initialBookId="",initialContactId=""}){
 const navigate=useNavigate();
 const params=useParams();
 const id=loanId||params.id||"";
 const isEdit=mode?mode==="edit":!!id;

 const [form,setForm]=useState({...emptyForm,book:initialBookId||"",contact:initialContactId||""});
 const [loading,setLoading]=useState(isEdit&&!initialData);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");

 const [bookOptions,setBookOptions]=useState([]);
 const [contactOptions,setContactOptions]=useState([]);
 const [lookupLoading,setLookupLoading]=useState(true);
 const [showContactModal,setShowContactModal]=useState(false);

 const computed=useMemo(()=>{
  const loanDays=LOAN_PERIOD_DAYS[form.loanRule]||LOAN_PERIOD_DAYS.default;
  let dueAt="";
  if(form.lentAt){
   const d=new Date(form.lentAt);
   if(!Number.isNaN(d.getTime())){
    d.setDate(d.getDate()+loanDays);
    dueAt=d.toISOString().slice(0,10);
   }
  }
  return {loanDays,dueAt};
 },[form.loanRule,form.lentAt]);

 async function loadLookups(){
  try{
   setLookupLoading(true);
   setError("");

   const [booksData,contactsData,loansData]=await Promise.all([
    fetchJson("/api/books"),
    fetchJson("/api/contacts"),
    fetchJson("/api/loans?active=true&limit=500")
   ]);

   const books=normalizeOptions(booksData,"books");
   const contacts=normalizeOptions(contactsData,"contacts");
   const activeLoans=normalizeOptions(loansData,"loans");
   const activeBookIds=new Set(
    activeLoans
     .filter(item=>!isEdit||String(getId(item?._id))!==String(id))
     .map(item=>getId(item?.book))
     .filter(Boolean)
   );

   setBookOptions(
    books.filter(item=>{
     const bookId=getId(item);
     if(isEdit&&String(bookId)===String(form.book||initialBookId||getId(initialData?.book)))return true;
     return !activeBookIds.has(String(bookId));
    })
   );
   setContactOptions(contacts);
  }catch(err){
   setError(err.message||"Failed to load lookup data");
  }finally{
   setLookupLoading(false);
  }
 }

 function applyLoanToForm(loan){
  setForm({
   book:getId(loan?.book)||initialBookId||"",
   contact:getId(loan?.contact)||initialContactId||"",
   lentAt:toInputDate(loan?.lentAt),
   loanRule:loan?.loanRule||"default",
   loanDays:loan?.loanDays??LOAN_PERIOD_DAYS[loan?.loanRule||"default"]??LOAN_PERIOD_DAYS.default,
   dueAt:toInputDate(loan?.dueAt),
   returnedAt:toInputDate(loan?.returnedAt),
   conditionOut:loan?.conditionOut||"good",
   conditionIn:loan?.conditionIn||"good",
   notes:toCsv(loan?.notes)
  });
 }

 useEffect(()=>{
  loadLookups();
 },[]);

 useEffect(()=>{
  setForm(prev=>{
   const nextLoanDays=String(computed.loanDays);
   const nextDueAt=computed.dueAt;
   if(prev.loanDays===nextLoanDays&&prev.dueAt===nextDueAt)return prev;
   return {...prev,loanDays:nextLoanDays,dueAt:nextDueAt};
  });
 },[computed.loanDays,computed.dueAt]);

 useEffect(()=>{
  if(initialData){
   applyLoanToForm(initialData);
   return;
  }
  if(!isEdit)return;
  let active=true;
  (async()=>{
   try{
    setLoading(true);
    setError("");
    const data=await fetchJson(`/api/loans/${id}`);
    if(!active)return;
    applyLoanToForm(data?.loan||data);
   }catch(err){
    if(active)setError(err.message||"Failed to load loan");
   }finally{
    if(active)setLoading(false);
   }
  })();
  return()=>{active=false;};
 },[id,isEdit,initialData]);

 useEffect(()=>{
  if(initialBookId){
   setForm(prev=>prev.book?prev:{...prev,book:String(initialBookId)});
  }
 },[initialBookId]);

 useEffect(()=>{
  if(initialContactId){
   setForm(prev=>prev.contact?prev:{...prev,contact:String(initialContactId)});
  }
 },[initialContactId]);

 function setField(name,value){
  setForm(prev=>({...prev,[name]:value}));
 }

 async function handleSubmit(e){
  e.preventDefault();
  if(saving)return;
  setError("");
  setSuccess("");

  if(!form.book){
   setError("Book is required.");
   return;
  }

  if(!form.contact){
   setError("Contact is required.");
   return;
  }

  if(!form.lentAt){
   setError("Lent date is required.");
   return;
  }

  if(form.returnedAt&&new Date(form.returnedAt)<new Date(form.lentAt)){
   setError("Returned date cannot be before lent date.");
   return;
  }

  const payload={
   book:form.book,
   contact:form.contact,
   lentAt:form.lentAt||null,
   loanRule:form.loanRule||"default",
   loanDays:computed.loanDays,
   dueAt:computed.dueAt||null,
   returnedAt:form.returnedAt||null,
   conditionOut:form.conditionOut.trim(),
   conditionIn:form.conditionIn.trim(),
   notes:fromCsv(form.notes)
  };

  try{
   setSaving(true);
   const res=await fetch(isEdit?`/api/loans/${id}`:"/api/loans",{
    method:isEdit?"PUT":"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });
   const data=await res.json();
   if(!res.ok)throw new Error(data?.message||`Failed to ${isEdit?"update":"create"} loan`);
   const saved=data?.loan||data;
   setSuccess(`Loan ${isEdit?"updated":"created"} successfully.`);
   if(onSaved){
    onSaved(saved);
    return;
   }
   navigate(saved?._id?`/loans/${saved._id}`:"/loans");
  }catch(err){
   setError(err.message||`Failed to ${isEdit?"update":"create"} loan`);
  }finally{
   setSaving(false);
  }
 }

 if(loading||lookupLoading){
  return <div className="container py-4">Loading...</div>;
 }

 return(
  <div className="container py-3">
   {!onSaved&&(
    <div className="d-flex align-items-center justify-content-between mb-3">
     <h1 className="m-0">{isEdit?"Edit Loan":"Lend Book"}</h1>
     <button type="button" className="btn btn-outline-secondary" onClick={()=>onCancel?onCancel():navigate(-1)}>Back</button>
    </div>
   )}

   {error?<div className="alert alert-danger py-2">{error}</div>:null}
   {success?<div className="alert alert-success py-2">{success}</div>:null}

   <form onSubmit={handleSubmit}>
    <div className="border rounded p-3 bg-white">
     <InlineField label="Book">
      <select className="form-select" value={form.book} onChange={e=>setField("book",e.target.value)} required disabled={!!initialBookId}>
       <option value="">Select book</option>
       {bookOptions.map(item=><option key={item._id} value={String(item._id)}>{getBookLabel(item)}</option>)}
      </select>
     </InlineField>

     <InlineField label="Contact" right={
      <div className="d-flex gap-2">
       <button type="button" className="btn btn-outline-primary btn-sm" onClick={()=>setShowContactModal(true)}>Add Contact</button>
       <button type="button" className="btn btn-outline-secondary btn-sm" onClick={loadLookups}>Refresh</button>
      </div>
     }>
      <select className="form-select" value={form.contact} onChange={e=>setField("contact",e.target.value)} required disabled={!!initialContactId}>
       <option value="">Select contact</option>
       {contactOptions.map(item=><option key={item._id} value={String(item._id)}>{getContactLabel(item)}</option>)}
      </select>
     </InlineField>

     <InlineField label="Lent At">
      <input type="date" className="form-control" value={form.lentAt} onChange={e=>setField("lentAt",e.target.value)} required />
     </InlineField>

     <InlineField label="Loan Rule">
      <select className="form-select" value={form.loanRule} onChange={e=>setField("loanRule",e.target.value)}>
       <option value="default">default</option>
       <option value="children">children</option>
       <option value="reference">reference</option>
       <option value="audiobook">audiobook</option>
       <option value="ebook">ebook</option>
      </select>
     </InlineField>

     <InlineField label="Loan Days">
      <input type="number" className="form-control" value={computed.loanDays} readOnly />
     </InlineField>

     <InlineField label="Due At">
      <input type="date" className="form-control" value={computed.dueAt} readOnly />
     </InlineField>

     <InlineField label="Returned At">
      <input type="date" className="form-control" value={form.returnedAt} min={form.lentAt||undefined} onChange={e=>setField("returnedAt",e.target.value)} />
     </InlineField>

     <InlineField label="Condition Out">
      <select className="form-select" value={form.conditionOut} onChange={e=>setField("conditionOut",e.target.value)}>
       {CONDITION_OPTIONS.map(item=><option key={item} value={item}>{item}</option>)}
      </select>
     </InlineField>

     <InlineField label="Condition In">
      <select className="form-select" value={form.conditionIn} onChange={e=>setField("conditionIn",e.target.value)}>
       {CONDITION_OPTIONS.map(item=><option key={item} value={item}>{item}</option>)}
      </select>
     </InlineField>

     <InlineField label="Notes">
      <textarea className="form-control" rows="3" value={form.notes} onChange={e=>setField("notes",e.target.value)} placeholder="Comma separated notes" />
     </InlineField>
    </div>

    <div className="d-flex gap-2 pt-2">
     <button type="submit" className="btn btn-primary" disabled={saving}>{saving?(isEdit?"Saving...":"Creating..."):(isEdit?"Save Changes":"Create Loan")}</button>
     <button type="button" className="btn btn-outline-secondary" onClick={()=>onCancel?onCancel():navigate(-1)} disabled={saving}>Cancel</button>
     {!isEdit?<button type="button" className="btn btn-outline-secondary" onClick={()=>setForm({...emptyForm,book:initialBookId||"",contact:initialContactId||""})} disabled={saving}>Reset</button>:null}
    </div>
   </form>

   <Modal show={showContactModal} onHide={()=>setShowContactModal(false)} centered size="xl" backdrop="static">
    <Modal.Header closeButton>
     <Modal.Title>Add Contact</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     <ContactForm
      mode="add"
      onSaved={async contact=>{
       await loadLookups();
       if(contact?._id)setField("contact",String(contact._id));
       setShowContactModal(false);
      }}
      onCancel={()=>setShowContactModal(false)}
     />
    </Modal.Body>
   </Modal>
  </div>
 );
}
