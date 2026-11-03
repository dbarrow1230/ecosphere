// src/pages/Translations.jsx
import {useCallback,useMemo,useState,useEffect} from "react";
import {Card,Button,Alert,Spinner,Modal,Form,Row,Col} from "react-bootstrap";
import TranslationForm from "../pages/forms/lookups/TranslationForm";
import bannerImage from "../images/hero_image.png";
import "../styles/translations.css";

function Translations(){

 const [translations,setTranslations]=useState([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");
 const [showDeleteModal,setShowDeleteModal]=useState(false);
 const [selectedTranslation,setSelectedTranslation]=useState(null);
 const [showFormModal,setShowFormModal]=useState(false);
 const [editingTranslation,setEditingTranslation]=useState(null);
 const [activeTranslationId,setActiveTranslationId]=useState("");
 const [filters,setFilters]=useState({search:"",language:"English",type:""});

 const getTranslationType=item=>item?.type||"";

 const loadTranslations=useCallback(async()=>{
  try{
   setLoading(true);
   setError("");
   const res=await fetch("/api/lookups/translations");
   const data=await res.json();
   if(!res.ok)throw new Error(data.message||"Failed to load translations");
   setTranslations(data.data||[]);
  }
  catch(err){
   setError(err.message);
  }
  finally{
   setLoading(false);
  }
 },[]);

 useEffect(()=>{
  const timer=window.setTimeout(loadTranslations,0);
  return()=>window.clearTimeout(timer);
 },[loadTranslations]);

 const filteredTranslations=useMemo(()=>{
  let next=translations.filter(item=>item.active!==false);

  if(filters.search){
   const search=filters.search.toLowerCase();
   next=next.filter(item=>
    item.title?.toLowerCase().includes(search)||
    item.abbreviation?.toLowerCase().includes(search)||
    item.language?.toLowerCase().includes(search)||
    getTranslationType(item).toLowerCase().includes(search)
   );
  }

  if(filters.language)next=next.filter(item=>item.language===filters.language);
  if(filters.type)next=next.filter(item=>getTranslationType(item)===filters.type);

  next.sort((a,b)=>(a.title||"").localeCompare(b.title||""));
  return next;
 },[translations,filters]);

 const activeTranslation=useMemo(()=>{
  if(!filteredTranslations.length)return null;
  return filteredTranslations.find(item=>item._id===activeTranslationId)||filteredTranslations[0];
 },[filteredTranslations,activeTranslationId]);

 const handleFilterChange=(e)=>{
  const {name,value}=e.target;
  setFilters(prev=>({...prev,[name]:value}));
 };

 const resetFilter=(name,value)=>{
  setFilters(prev=>({...prev,[name]:value}));
 };

 const handleDeleteClick=(translation)=>{
  setSelectedTranslation(translation);
  setShowDeleteModal(true);
 };

 const handleDeleteConfirm=async()=>{
  if(!selectedTranslation)return;

  try{
   setError("");
   setSuccess("");

   const res=await fetch(`/api/lookups/translations/${selectedTranslation._id}`,{method:"DELETE"});
   const data=await res.json();

   if(!res.ok)throw new Error(data.message||"Failed to delete translation");

   setSuccess("Translation deleted successfully");
   setTranslations(prev=>prev.filter(item=>item._id!==selectedTranslation._id));
   if(activeTranslationId===selectedTranslation._id)setActiveTranslationId("");
   setShowDeleteModal(false);
   setSelectedTranslation(null);
  }
  catch(err){
   setError(err.message);
   setShowDeleteModal(false);
  }
 };

 const getUniqueLanguages=()=>[...new Set(translations.map(item=>item.language).filter(Boolean))].sort();
 const getUniqueTypes=()=>[...new Set(translations.filter(item=>item.active!==false).map(item=>getTranslationType(item)).filter(Boolean))].sort();

 if(loading)return(<div className="container py-4 text-center"><Spinner animation="border"/></div>);

 return(
  <main>
   <div className="translations-banner"><img src={bannerImage} alt="Bible translations banner"/><div className="translations-banner-overlay"><h1>Translations</h1></div></div>
   <div className="translations-page-shell py-4">
    <Card className="border-0 shadow-sm translations-card">
     <Card.Body className="translations-card-body">
      <div className="translations-header">
       <div><h2 className="mb-1">Translations</h2><div className="text-muted">Manage bible translations</div></div>
       <Button onClick={()=>{setEditingTranslation(null);setShowFormModal(true);}}>Add Translation</Button>
      </div>

      {error?<Alert variant="danger" onClose={()=>setError("")} dismissible>{error}</Alert>:null}
      {success?<Alert variant="success" onClose={()=>setSuccess("")} dismissible>{success}</Alert>:null}

      <Row className="g-3 mb-3">
       <Col md={6}>
        <Form.Group className="translations-filter-control">
         <Form.Label>Search</Form.Label>
         <Form.Control name="search" value={filters.search} onChange={handleFilterChange} placeholder="Search title, abbreviation, language, type..."/>
         <Button type="button" size="sm" variant="link" onClick={()=>resetFilter("search","")} disabled={!filters.search}>Clear</Button>
        </Form.Group>
       </Col>
       <Col md={3}>
        <Form.Group className="translations-filter-control">
         <Form.Label>Language</Form.Label>
         <Form.Select name="language" value={filters.language} onChange={handleFilterChange}>
          <option value="">All languages</option>
          {getUniqueLanguages().map(language=><option key={language} value={language}>{language}</option>)}
         </Form.Select>
         <Button type="button" size="sm" variant="link" onClick={()=>resetFilter("language","English")} disabled={filters.language==="English"}>Reset</Button>
        </Form.Group>
       </Col>
       <Col md={3}>
        <Form.Group className="translations-filter-control">
         <Form.Label>Type</Form.Label>
         <Form.Select name="type" value={filters.type} onChange={handleFilterChange}>
          <option value="">All types</option>
          {getUniqueTypes().map(type=><option key={type} value={type}>{type}</option>)}
         </Form.Select>
         <Button type="button" size="sm" variant="link" onClick={()=>resetFilter("type","")} disabled={!filters.type}>Reset</Button>
        </Form.Group>
       </Col>
      </Row>

      <div className="translations-browser">
       <aside className="translations-list-pane" aria-label="Translations">
        {filteredTranslations.length?(
         <ul className="translation-list">
          {filteredTranslations.map(item=>(
           <li
            key={item._id}
            className={`translation-list-item${activeTranslation?._id===item._id?" active":""}`}
            role="button"
            tabIndex={0}
            onClick={()=>setActiveTranslationId(item._id)}
            onKeyDown={event=>{
             if(event.key==="Enter"||event.key===" "){
              event.preventDefault();
              setActiveTranslationId(item._id);
             }
            }}
           >
            <span className="translation-list-title">{item.title}</span>
           </li>
          ))}
         </ul>
        ):<div className="translations-empty">No active translations found</div>}
       </aside>

       <section className="translation-detail-pane" aria-live="polite">
        {activeTranslation?(
         <>
          <div className="translation-detail-header">
           <div>
            <h3>{activeTranslation.title}</h3>
            <p>{activeTranslation.abbreviation} · {activeTranslation.language||"No language"} · {getTranslationType(activeTranslation)||"No type"}</p>
           </div>
           <div className="translation-detail-actions">
            <Button size="sm" variant="outline-primary" onClick={()=>{setEditingTranslation(activeTranslation);setShowFormModal(true);}}>Edit</Button>
            <Button size="sm" variant="outline-danger" onClick={()=>handleDeleteClick(activeTranslation)}>Delete</Button>
           </div>
          </div>

          <div className="translation-detail">
           <div className="translation-detail-meta">
            <div><span>Abbreviation</span><strong>{activeTranslation.abbreviation||"—"}</strong></div>
            <div><span>Language</span><strong>{activeTranslation.language||"—"}</strong></div>
            <div><span>Type</span><strong>{getTranslationType(activeTranslation)||"—"}</strong></div>
           </div>

           {activeTranslation.description?(
            <section>
             <h3>History and Notes</h3>
             <p>{activeTranslation.description}</p>
            </section>
           ):null}

           {activeTranslation.source?(
            <section>
             <h3>Source</h3>
             <p><a href={activeTranslation.source} target="_blank" rel="noreferrer">{activeTranslation.source}</a></p>
            </section>
           ):null}

           {activeTranslation.copyright?(
            <section>
             <h3>Copyright</h3>
             <p>{activeTranslation.copyright}</p>
            </section>
           ):null}
          </div>
         </>
        ):(
         <div className="translation-detail-placeholder">
          <h3>No Translation Selected</h3>
          <p>Adjust the filters or add a translation.</p>
          <Button onClick={()=>{setEditingTranslation(null);setShowFormModal(true);}}>Add Translation</Button>
         </div>
        )}
       </section>
      </div>
     </Card.Body>
    </Card>

    <Modal show={showDeleteModal} onHide={()=>setShowDeleteModal(false)} centered>
     <Modal.Header closeButton><Modal.Title>Delete Translation</Modal.Title></Modal.Header>
     <Modal.Body>Are you sure you want to delete <strong>{selectedTranslation?.title}</strong>?</Modal.Body>
     <Modal.Footer><Button variant="secondary" onClick={()=>setShowDeleteModal(false)}>Cancel</Button><Button variant="danger" onClick={handleDeleteConfirm}>Delete</Button></Modal.Footer>
    </Modal>

    <Modal show={showFormModal} onHide={()=>{setShowFormModal(false);setEditingTranslation(null);}} centered size="lg" backdrop="static">
     <Modal.Header closeButton><Modal.Title>{editingTranslation?"Edit Translation":"Add Translation"}</Modal.Title></Modal.Header>
     <Modal.Body><TranslationForm id={editingTranslation?._id||""} embedded={true} onSuccess={()=>{setShowFormModal(false);setEditingTranslation(null);loadTranslations();}} onClose={()=>{setShowFormModal(false);setEditingTranslation(null);}}/></Modal.Body>
    </Modal>
   </div>
  </main>
 );
}

export default Translations;
