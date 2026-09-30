// src/pages/referance/PoetryFormsReference.jsx
import React,{useEffect,useMemo,useState} from "react";
import {Badge,Button,Form,InputGroup,ListGroup,Modal,Nav,Spinner,Toast,ToastContainer} from "react-bootstrap";
import {BookOpen,Edit3,ExternalLink,Plus,Search,Trash2,X} from "lucide-react";
import PoetryFormAdmin from "../forms/PoetryFormAdmin";
import "./PoetryFormsReference.css";

const PoetryFormsReference=({isLoggedIn=false})=>{
 const [poetryForms,setPoetryForms]=useState([]);
 const [selectedForm,setSelectedForm]=useState(null);
 const [search,setSearch]=useState("");
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [showForm,setShowForm]=useState(false);
 const [editingForm,setEditingForm]=useState(null);
 const [showDelete,setShowDelete]=useState(false);
 const [deleting,setDeleting]=useState(false);
 const [activeDetailTab,setActiveDetailTab]=useState("details");
 const [toast,setToast]=useState({
  show:false,
  message:"",
  variant:"success",
  critical:false
 });

 useEffect(()=>{
  loadPoetryForms();
 },[]);

 const showToast=(message,variant="success",critical=false)=>{
  setToast({
   show:true,
   message,
   variant,
   critical
  });
 };

 const loadPoetryForms=async(selectedId=null)=>{
  try{
   setLoading(true);
   setError("");

   const res=await fetch("/api/poetry-forms");

   if(!res.ok){
    throw new Error("Unable to load poetry forms");
   }

   const data=await res.json();
   const forms=Array.isArray(data)?data:[];

   setPoetryForms(forms);

   if(selectedId){
    setSelectedForm(
     forms.find(form=>form._id===selectedId)||
     forms[0]||
     null
    );
   }else{
    setSelectedForm(current=>{
     if(!current){
      return forms[0]||null;
     }

     return(
      forms.find(form=>form._id===current._id)||
      forms[0]||
      null
     );
    });
   }
  }catch(error){
   setError(
    error.message||
    "Unable to load poetry forms"
   );
  }finally{
   setLoading(false);
  }
 };

 const filteredForms=useMemo(()=>{
  const query=search
   .trim()
   .toLowerCase();

  if(!query){
   return poetryForms;
  }

  return poetryForms.filter(form=>
   form.name?.toLowerCase().includes(query)||
   form.description?.toLowerCase().includes(query)||
   form.type?.toLowerCase().includes(query)||
   form.category?.toLowerCase().includes(query)||
   form.origin?.toLowerCase().includes(query)||
   form.alternateNames?.some(name=>
    name.toLowerCase().includes(query)
   )||
   form.tags?.some(tag=>
    tag.toLowerCase().includes(query)
   )
  );
 },[poetryForms,search]);

 const clearSearch=()=>{
  setSearch("");
 };

 const selectPoetryForm=form=>{
  setSelectedForm(form);
  setActiveDetailTab("details");
 };

 const openAddForm=()=>{
  setEditingForm(null);
  setShowForm(true);
 };

 const openEditForm=()=>{
  if(!selectedForm)return;

  setEditingForm(selectedForm);
  setShowForm(true);
 };

 const handleSaved=async(savedForm,isEdit)=>{
  setShowForm(false);
  setEditingForm(null);

  showToast(
   isEdit
    ?"Poetry form updated successfully"
    :"Poetry form added successfully",
   "success"
  );

  await loadPoetryForms(
   savedForm._id
  );
 };

 const handleFormError=(message,critical=false)=>{
  showToast(
   message,
   "danger",
   critical
  );
 };

 const deletePoetryForm=async()=>{
  if(!selectedForm)return;

  try{
   setDeleting(true);

   const res=await fetch(
    `/api/poetry-forms/${selectedForm._id}`,
    {
     method:"DELETE"
    }
   );

   const data=await res
    .json()
    .catch(()=>({}));

   if(!res.ok){
    showToast(
     data.message||
     "Unable to delete poetry form",
     "danger",
     res.status>=500
    );

    return;
   }

   setShowDelete(false);
   setSelectedForm(null);
   setActiveDetailTab("details");

   showToast(
    "Poetry form deleted successfully",
    "success"
   );

   await loadPoetryForms();
  }catch(error){
   showToast(
    error.message||
    "Unable to connect to the server",
    "danger",
    true
   );
  }finally{
   setDeleting(false);
  }
 };

 const hasValue=value=>{
  return(
   value!==null&&
   value!==undefined&&
   String(value).trim()!==""
  );
 };

 const getAdditionalRules=()=>{
  const rules=
   selectedForm?.structure?.additionalRules;

  if(Array.isArray(rules)){
   return rules.filter(rule=>
    String(rule||"").trim()
   );
  }

  if(!rules){
   return [];
  }

  return String(rules)
   .split("\n")
   .map(rule=>
    rule
     .replace(/^\s*[-*•]\s*/,"")
     .trim()
   )
   .filter(Boolean);
 };

 const additionalRules=getAdditionalRules();

 return(
  <div className="poetry-reference-page">
   <ToastContainer
    position="top-end"
    className="poetry-reference-toast"
   >
    <Toast
     show={toast.show}
     autohide={!toast.critical}
     delay={10000}
     onClose={()=>
      setToast(current=>({
       ...current,
       show:false
      }))
     }
     bg={toast.variant}
    >
     <Toast.Header closeButton>
      <strong className="me-auto">
       {toast.critical
        ?"Critical Error"
        :toast.variant==="danger"
         ?"Error"
         :"Poetry Forms"}
      </strong>
     </Toast.Header>

     <Toast.Body
      className={
       toast.variant==="danger"||
       toast.variant==="success"
        ?"text-white"
        :""
      }
     >
      {toast.message}
     </Toast.Body>
    </Toast>
   </ToastContainer>

   <div className="poetry-reference-heading">
    <h1>
     <BookOpen size={30}/>
     Poetry Forms
    </h1>

    <div>
     {poetryForms.length} Forms
    </div>

    {isLoggedIn&&(
     <div className="poetry-reference-admin-actions">
      <Button
       type="button"
       size="sm"
       variant="primary"
       onClick={openAddForm}
      >
       <Plus size={16}/>
       Add Form
      </Button>

      <Button
       type="button"
       size="sm"
       variant="secondary"
       onClick={openEditForm}
       disabled={!selectedForm}
      >
       <Edit3 size={16}/>
       Edit
      </Button>

      <Button
       type="button"
       size="sm"
       variant="danger"
       onClick={()=>
        setShowDelete(true)
       }
       disabled={!selectedForm}
      >
       <Trash2 size={16}/>
       Delete
      </Button>
     </div>
    )}
   </div>

   <div className="poetry-reference-search">
    <InputGroup>
     <InputGroup.Text>
      <Search size={17}/>
     </InputGroup.Text>

     <Form.Control
      type="search"
      placeholder="Search forms..."
      value={search}
      onChange={e=>
       setSearch(e.target.value)
      }
     />

     <Button
      type="button"
      className="poetry-reference-clear"
      onClick={clearSearch}
      disabled={!search}
     >
      <X size={16}/>
      Clear
     </Button>
    </InputGroup>

    <div className="poetry-reference-count">
     Showing {filteredForms.length} of {poetryForms.length}
    </div>
   </div>

   <div className="poetry-reference-list-wrap">
    {loading?(
     <div className="poetry-reference-empty">
      <Spinner
       animation="border"
       size="sm"
       className="me-2"
      />
      Loading poetry forms...
     </div>
    ):error?(
     <div className="poetry-reference-empty">
      {error}
     </div>
    ):(
     <ListGroup className="poetry-reference-list">
      {filteredForms.map(form=>(
       <ListGroup.Item
        key={form._id}
        action
        active={
         selectedForm?._id===
         form._id
        }
        onClick={()=>
         selectPoetryForm(form)
        }
        className="poetry-reference-list-item"
       >
        {form.name}
       </ListGroup.Item>
      ))}

      {filteredForms.length===0&&(
       <div className="poetry-reference-empty">
        No forms found
       </div>
      )}
     </ListGroup>
    )}
   </div>

   <main className="poetry-reference-detail">
    {selectedForm&&(
     <>
      <div className="poetry-reference-detail-header">
       <div className="poetry-reference-detail-icon">
        <BookOpen size={28}/>
       </div>

       <div>
        <div className="poetry-reference-label">
         {selectedForm.type||"form"}
        </div>

        <h2>
         {selectedForm.name}
        </h2>

        {selectedForm.alternateNames?.length>0&&(
         <div className="poetry-reference-alternate-names">
          {selectedForm.alternateNames.join(", ")}
         </div>
        )}
       </div>
      </div>

      <Nav
       variant="tabs"
       fill
       activeKey={activeDetailTab}
       onSelect={key=>
        setActiveDetailTab(
         key||"details"
        )
       }
       className="poetry-reference-detail-tabs"
      >
       <Nav.Item>
        <Nav.Link eventKey="details">
         Form Details
        </Nav.Link>
       </Nav.Item>

       <Nav.Item>
        <Nav.Link eventKey="examples">
         Examples ({selectedForm.examples?.length||0})
        </Nav.Link>
       </Nav.Item>
      </Nav>

      {activeDetailTab==="details"&&(
       <div className="poetry-reference-detail-body">
        <div className="d-flex flex-wrap align-items-center gap-4 mb-4">
         <div>
          <strong>Name:</strong>{" "}
          {selectedForm.name}
         </div>

         <div>
          <strong>Type:</strong>{" "}
          {selectedForm.type||"N/A"}
         </div>

         <div>
          <strong>Category:</strong>{" "}
          {selectedForm.category||"N/A"}
         </div>

         <div className="d-flex align-items-center gap-1">
          <strong>Status:</strong>

          <Badge
           bg={
            selectedForm.isActive!==false
             ?"success"
             :"secondary"
           }
          >
           {selectedForm.isActive!==false
            ?"Active"
            :"Inactive"}
          </Badge>
         </div>
        </div>

        <div className="poetry-reference-detail-section">
         <h3>
          Description
         </h3>

         <p>
          {selectedForm.description||"N/A"}
         </p>
        </div>

        <div className="poetry-reference-detail-section">
         <h3>
          Origin
         </h3>

         <p>
          {selectedForm.origin||"N/A"}
         </p>
        </div>

        <div className="poetry-reference-detail-section">
         <h3>
          Structure
         </h3>

         <div className="d-flex flex-wrap align-items-start gap-4">
          <div>
           <strong>Lines:</strong>{" "}
           {hasValue(
            selectedForm.structure?.lines
           )
            ?selectedForm.structure.lines
            :"N/A"}
          </div>

          <div>
           <strong>Stanzas:</strong>{" "}
           {selectedForm.structure?.stanzas||
           "N/A"}
          </div>

          <div>
           <strong>Meter:</strong>{" "}
           {selectedForm.structure?.meter||
           "N/A"}
          </div>

          <div>
           <strong>Rhyme Scheme:</strong>{" "}
           {selectedForm.structure?.rhymeScheme||
           "N/A"}
          </div>

          <div>
           <strong>Syllable Pattern:</strong>{" "}
           {selectedForm.structure?.syllablePattern||
           "N/A"}
          </div>

          <div>
           <strong>Refrain:</strong>{" "}
           {selectedForm.structure?.refrain||
           "N/A"}
          </div>
         </div>

         <div className="mt-2">
          <h3>
           Additional Rules
          </h3>

          {additionalRules.length>0?(
           <ul className="mb-0">
            {additionalRules.map(
             (rule,index)=>(
              <li key={index}>
               {rule}
              </li>
             )
            )}
           </ul>
          ):(
           <p>
            N/A
           </p>
          )}
         </div>
        </div>

        {selectedForm.tags?.length>0&&(
         <div className="poetry-reference-detail-section">
          <h3>
           Tags
          </h3>

          <div className="d-flex flex-wrap gap-2">
           {selectedForm.tags.map(
            (tag,index)=>(
             <Badge
              key={`${tag}-${index}`}
              bg="secondary"
             >
              {tag}
             </Badge>
            )
           )}
          </div>
         </div>
        )}

        <div className="poetry-reference-detail-section">
         <h3>
          Notes
         </h3>

         <p>
          {selectedForm.notes||"N/A"}
         </p>
        </div>
       </div>
      )}

      {activeDetailTab==="examples"&&(
       <div className="poetry-reference-detail-body">
        {selectedForm.examples?.length>0?(
         <div className="poetry-reference-center-examples">
          {selectedForm.examples.map(
           (example,index)=>(
            <div
             className="poetry-reference-example-item"
             key={
              example._id||
              index
             }
            >
             <div className="d-flex justify-content-between align-items-start gap-3">
              <h3>
               {example.title&&
                example.title!=="N/A"
                 ?example.title
                 :`Example ${index+1}`}
              </h3>

              <Badge bg="secondary">
               {index+1} of {selectedForm.examples.length}
              </Badge>
             </div>

             <div className="mb-3">
              <strong>
               Author:
              </strong>{" "}
              {example.author||"N/A"}
             </div>

             <div className="mb-3">
              <strong>
               Text:
              </strong>

              <div
               className="poetry-reference-example-text mt-1"
               style={{
                whiteSpace:"pre-wrap"
               }}
              >
               {example.text||"N/A"}
              </div>
             </div>

             <div className="mb-3">
              <strong>
               Notes:
              </strong>

              <div className="mt-1">
               {example.notes||"N/A"}
              </div>
             </div>

             {example.sourceUrl&&
              example.sourceUrl!=="N/A"?(
               <a
                href={example.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="poetry-reference-link"
               >
                Example Source{" "}
                <ExternalLink size={14}/>
               </a>
              ):(
               <div>
                <strong>
                 Source URL:
                </strong>{" "}
                N/A
               </div>
              )}
            </div>
           )
          )}
         </div>
        ):(
         <div className="poetry-reference-empty">
          No examples added.
         </div>
        )}
       </div>
      )}
     </>
    )}
   </main>

   <aside className="poetry-reference-example">
    {selectedForm&&(
     <>
      <div className="poetry-reference-example-header">
       <h3>
        References ({selectedForm.references?.length||0})
       </h3>
      </div>

      <div className="poetry-reference-example-body">
       {selectedForm.references?.length>0?(
        selectedForm.references.map(
         (reference,index)=>(
          <div
           className="poetry-reference-reference-item"
           key={
            reference._id||
            index
           }
          >
           <h4>
            {reference.title||"N/A"}
           </h4>

           {reference.url&&
            reference.url!=="N/A"?(
             <>
              <div
               className="mb-2"
               style={{
                overflowWrap:"anywhere"
               }}
              >
               {reference.url}
              </div>

              <a
               href={reference.url}
               target="_blank"
               rel="noreferrer"
               className="poetry-reference-link"
              >
               View Reference{" "}
               <ExternalLink size={14}/>
              </a>
             </>
            ):(
             <div>
              N/A
             </div>
            )}
          </div>
         )
        )
       ):(
        <div className="poetry-reference-empty">
         No references added.
        </div>
       )}
      </div>
     </>
    )}
   </aside>

   {isLoggedIn&&(
    <PoetryFormAdmin
     show={showForm}
     poetryForm={editingForm}
     onClose={()=>
      setShowForm(false)
     }
     onSaved={handleSaved}
     onError={handleFormError}
    />
   )}

   {isLoggedIn&&(
    <Modal
     show={showDelete}
     onHide={()=>
      setShowDelete(false)
     }
     backdrop="static"
     keyboard={false}
     centered
    >
     <Modal.Header>
      <Modal.Title>
       Delete Poetry Form
      </Modal.Title>
     </Modal.Header>

     <Modal.Body>
      Delete{" "}
      <strong>
       {selectedForm?.name}
      </strong>
      ? This cannot be undone.
     </Modal.Body>

     <Modal.Footer>
      <Button
       type="button"
       variant="secondary"
       onClick={()=>
        setShowDelete(false)
       }
       disabled={deleting}
      >
       Cancel
      </Button>

      <Button
       type="button"
       variant="danger"
       onClick={deletePoetryForm}
       disabled={deleting}
      >
       {deleting?(
        <Spinner
         animation="border"
         size="sm"
        />
       ):(
        <Trash2 size={16}/>
       )}
       Delete
      </Button>
     </Modal.Footer>
    </Modal>
   )}
  </div>
 );
};

export default PoetryFormsReference;