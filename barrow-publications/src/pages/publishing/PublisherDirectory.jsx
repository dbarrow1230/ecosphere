import {useState} from "react";
import {Modal} from "react-bootstrap";
import {Link,useSearchParams} from "react-router-dom";
import {ArrowLeft,Plus,RefreshCw,Tags} from "lucide-react";
import {useCatalog,publishingApi,idOf} from "../../utils/publishingApi.js";
import {CatalogNotice,MultiSelect} from "./PublishingFields.jsx";
import "../../styles/PublishingWorkspace.css";

const emptyPublisher=()=>({name:"",publisherType:"domestic",imprint:"",contact:"",email:"",phone:"",website:"",genres:[],categories:[],submissionGuidelines:"",isActive:true});
const namesFor=(ids,options)=>options.filter(item=>(ids||[]).map(idOf).includes(idOf(item))).map(item=>item.name);

export default function PublisherDirectory(){
 const catalog=useCatalog();
 const [params]=useSearchParams();
 const [search,setSearch]=useState("");
 const [genre,setGenre]=useState("");
 const [category,setCategory]=useState("");
 const [form,setForm]=useState(()=>params.get("new")==="1"?emptyPublisher():null);
 const [classificationsOpen,setClassificationsOpen]=useState(false);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [message,setMessage]=useState("");
 const [newGenre,setNewGenre]=useState("");
 const [newCategory,setNewCategory]=useState("");
 const set=(key,value)=>setForm(previous=>({...previous,[key]:value}));
 const openForm=publisher=>{setForm(publisher?{...emptyPublisher(),...publisher}:emptyPublisher());setError("");};
 const rows=catalog.publishers.filter(row=>(!search||[row.name,row.imprint,row.contact,row.email].join(" ").toLowerCase().includes(search.toLowerCase()))&&(!genre||(row.genres||[]).map(idOf).includes(genre))&&(!category||(row.categories||[]).map(idOf).includes(category)));

 const save=async event=>{
  event.preventDefault();setSaving(true);setError("");setMessage("");
  try{
   const body=Object.fromEntries(Object.keys(emptyPublisher()).map(key=>[key,form[key]]));
   await publishingApi(`book-catalog/publishers${form._id?`/${form._id}`:""}`,{method:form._id?"PUT":"POST",body});
   setForm(null);setMessage("Publisher saved in Book Management.");await catalog.reload();
  }catch(cause){setError(cause.message);}finally{setSaving(false);}
 };
 const addClassification=async(resource,name)=>{
  if(!name.trim())return;
  setSaving(true);setError("");
  try{
   await publishingApi(`book-catalog/${resource}`,{method:"POST",body:{name:name.trim()}});
   if(resource==="genres")setNewGenre("");else setNewCategory("");
   setMessage(`${resource==="genres"?"Genre":"Category"} saved in Book Management.`);
   await catalog.reload();
  }catch(cause){setError(cause.message);}finally{setSaving(false);}
 };

 return <section className="publishing-workspace publishing-directory">
  <Link className="publishing-back-link" to="/publishing/dashboard"><ArrowLeft size={17}/> Publishing dashboard</Link>
  <header className="publishing-directory-header">
   <div><h1>Publishers</h1><p>Find publishers and maintain their submission guidance and classifications in Book Management.</p></div>
   <button type="button" className="btn btn-primary publishing-directory-add" onClick={()=>openForm(null)}><Plus size={18}/> Add publisher</button>
  </header>
  <CatalogNotice catalog={catalog}/>{message&&<div role="status" className="alert alert-success">{message}</div>}
  <div className="publishing-directory-toolbar">
   <input className="form-control" aria-label="Search publishers" placeholder="Search name, imprint or contact" value={search} onChange={event=>setSearch(event.target.value)}/>
   <select className="form-select" aria-label="Filter genre" value={genre} onChange={event=>setGenre(event.target.value)}><option value="">All genres</option>{catalog.genres.map(row=><option key={row._id} value={row._id}>{row.name}</option>)}</select>
   <select className="form-select" aria-label="Filter category" value={category} onChange={event=>setCategory(event.target.value)}><option value="">All categories</option>{catalog.categories.map(row=><option key={row._id} value={row._id}>{row.name}</option>)}</select>
   <button type="button" className="btn btn-outline-primary" onClick={()=>{setClassificationsOpen(true);setError("");}}><Tags size={17}/> Genres & categories</button>
   <button type="button" className="btn btn-outline-secondary" onClick={catalog.reload} disabled={catalog.loading} aria-label="Refresh publishers"><RefreshCw size={17}/></button>
  </div>
  {catalog.loading?<p role="status">Loading publisher directory…</p>:<div className="publishing-table-wrap">
   <table className="table"><thead><tr><th>Publisher</th><th>Genres / categories</th><th>Contact</th><th>Status</th><th>Actions</th></tr></thead><tbody>
    {rows.map(row=><tr key={row._id}><td><strong>{row.name}</strong><small className="d-block">{row.imprint}</small></td><td>{[...namesFor(row.genres,catalog.genres),...namesFor(row.categories,catalog.categories)].join(", ")||"Not categorized"}</td><td>{row.contact}<small className="d-block">{row.email}</small></td><td>{row.isActive===false?"Inactive":"Active"}</td><td><button type="button" className="btn btn-sm btn-outline-primary" onClick={()=>openForm(row)}>Edit</button></td></tr>)}
   </tbody></table>{!rows.length&&!catalog.publisherError&&<p className="publishing-records-empty">No publishers match. Add a publisher or clear the filters.</p>}
  </div>}

  <Modal show={!!form} onHide={()=>{if(!saving)setForm(null);}} size="xl" centered scrollable backdrop="static" dialogClassName="publishing-editor-dialog">
   <Modal.Header closeButton={!saving}><div><p className="publishing-form-eyebrow">Book Management catalog</p><Modal.Title>{form?._id?"Edit publisher":"Add publisher"}</Modal.Title></div></Modal.Header>
   <Modal.Body>{error&&<div role="alert" className="alert alert-danger">{error}</div>}{catalog.error&&<CatalogNotice catalog={catalog}/>}
    {form&&<form className="publishing-form publishing-modal-form" onSubmit={save}><fieldset disabled={saving}>
     <div className="publishing-form-grid">
      {[["name","Publisher name","text"],["imprint","Imprint","text"],["contact","Contact person","text"],["email","Email","email"],["phone","Phone","tel"],["website","Website","text"]].map(([key,label,type])=><label key={key}>{label}<input className="form-control" type={type} required={key==="name"} value={form[key]||""} onChange={event=>set(key,event.target.value)}/></label>)}
      <label>Publisher type<select className="form-select" value={form.publisherType} onChange={event=>set("publisherType",event.target.value)}><option value="domestic">Domestic</option><option value="international">International</option></select></label>
      <label className="publishing-checkbox-label"><input type="checkbox" checked={form.isActive!==false} onChange={event=>set("isActive",event.target.checked)}/> Active publisher</label>
      <MultiSelect label="Genres" values={form.genres} options={catalog.genres} onChange={value=>set("genres",value)}/>
      <MultiSelect label="Categories" values={form.categories} options={catalog.categories} onChange={value=>set("categories",value)}/>
     </div>
     <label>Submission guidelines and contact notes<textarea className="form-control" value={form.submissionGuidelines||""} onChange={event=>set("submissionGuidelines",event.target.value)}/></label>
     <div className="publishing-form-actions"><button className="btn btn-primary" disabled={catalog.loading||!!catalog.publisherError}>{saving?"Saving…":"Save publisher"}</button><button type="button" className="btn btn-outline-secondary" onClick={()=>setForm(null)}>Cancel</button></div>
    </fieldset></form>}
   </Modal.Body>
  </Modal>

  <Modal show={classificationsOpen} onHide={()=>{if(!saving)setClassificationsOpen(false);}} centered backdrop="static" dialogClassName="publishing-delete-dialog">
   <Modal.Header closeButton={!saving}><Modal.Title>Genres & categories</Modal.Title></Modal.Header>
   <Modal.Body>{error&&<div role="alert" className="alert alert-danger">{error}</div>}<p>These choices are saved in Book Management and shared with publishing records.</p>
    <form className="publishing-classification-form" onSubmit={event=>{event.preventDefault();addClassification("genres",newGenre);}}><label htmlFor="new-publisher-genre">New genre</label><div><input id="new-publisher-genre" className="form-control" value={newGenre} onChange={event=>setNewGenre(event.target.value)}/><button className="btn btn-outline-primary" disabled={saving||!newGenre.trim()||!!catalog.errors.genres}>Add</button></div></form>
    <form className="publishing-classification-form" onSubmit={event=>{event.preventDefault();addClassification("categories",newCategory);}}><label htmlFor="new-publisher-category">New category</label><div><input id="new-publisher-category" className="form-control" value={newCategory} onChange={event=>setNewCategory(event.target.value)}/><button className="btn btn-outline-primary" disabled={saving||!newCategory.trim()||!!catalog.errors.categories}>Add</button></div></form>
   </Modal.Body><Modal.Footer><button type="button" className="btn btn-outline-secondary" disabled={saving} onClick={()=>setClassificationsOpen(false)}>Done</button></Modal.Footer>
  </Modal>
 </section>;
}
