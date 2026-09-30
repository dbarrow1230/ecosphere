// src/pages/books/BorrowSourcesIndexPage.jsx
import {useEffect,useMemo,useState} from "react";
import {Button,Form,InputGroup,Modal,Table} from "react-bootstrap";
import {FaEdit,FaPlus,FaSearch,FaTrash} from "react-icons/fa";
import BorrowSourceForm from "../forms/BorrowSourceForm";

export default function BorrowSourcesIndexPage(){
 const [sources,setSources]=useState([]);
 const [loading,setLoading]=useState(true);
 const [search,setSearch]=useState("");
 const [typeFilter,setTypeFilter]=useState("");
 const [showFormModal,setShowFormModal]=useState(false);
 const [formMode,setFormMode]=useState("add");
 const [selectedSource,setSelectedSource]=useState(null);
 const [showDeleteModal,setShowDeleteModal]=useState(false);

 const loadSources=async()=>{
  try{
   setLoading(true);
   const res=await fetch("/api/borrow-sources",{cache:"no-store"});
   const data=await res.json();
   if(!res.ok)throw new Error(data?.message||"Failed to load borrow sources");
   setSources(Array.isArray(data?.borrowSources)?data.borrowSources:[]);
  }catch{
   setSources([]);
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{
  loadSources();
 },[]);

 const typeOptions=useMemo(()=>{
  return [...new Set(sources.map(item=>item.type).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
 },[sources]);

 const filteredSources=useMemo(()=>{
  const q=search.trim().toLowerCase();
  return sources.filter(item=>{
   const haystack=[
    item.name,
    item.type,
    item.website,
    item.notes
   ].join(" ").toLowerCase();

   if(typeFilter&&item.type!==typeFilter)return false;
   if(q&&!haystack.includes(q))return false;
   return true;
  });
 },[sources,search,typeFilter]);

 const openAddModal=()=>{
  setFormMode("add");
  setSelectedSource(null);
  setShowFormModal(true);
 };

 const openEditModal=source=>{
  setFormMode("edit");
  setSelectedSource(source);
  setShowFormModal(true);
 };

 const closeFormModal=()=>{
  setShowFormModal(false);
  setSelectedSource(null);
 };

 const openDeleteModal=source=>{
  setSelectedSource(source);
  setShowDeleteModal(true);
 };

 const closeDeleteModal=()=>{
  setShowDeleteModal(false);
  setSelectedSource(null);
 };

 const handleSaved=source=>{
  if(formMode==="edit"){
   setSources(prev=>prev.map(item=>item._id===source?._id?source:item));
  }else{
   setSources(prev=>[source,...prev.filter(item=>item._id!==source?._id)]);
  }
  closeFormModal();
 };

 const confirmDelete=async()=>{
  if(!selectedSource?._id)return;
  await fetch(`/api/borrow-sources/${selectedSource._id}`,{method:"DELETE"});
  setSources(prev=>prev.filter(item=>item._id!==selectedSource._id));
  closeDeleteModal();
 };

 return(
  <div className="container py-3">
   <div className="d-flex align-items-center justify-content-between mb-3">
    <h1 className="m-0">Borrow Sources</h1>
    <Button onClick={openAddModal}><FaPlus/> Add Source</Button>
   </div>

   <div className="row g-2 mb-3">
    <div className="col-md-8">
     <InputGroup>
      <InputGroup.Text><FaSearch/></InputGroup.Text>
      <Form.Control value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search borrow sources..." />
      <Button variant="outline-secondary" onClick={()=>setSearch("")} disabled={!search}>Clear</Button>
     </InputGroup>
    </div>
    <div className="col-md-4">
     <Form.Select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}>
      <option value="">All Types</option>
      {typeOptions.map(item=><option key={item} value={item}>{item}</option>)}
     </Form.Select>
    </div>
   </div>

   <Table hover responsive>
    <thead>
     <tr>
      <th>Name</th>
      <th>Type</th>
      <th>Website</th>
      <th>Notes</th>
      <th style={{width:"120px"}}>Actions</th>
     </tr>
    </thead>
    <tbody>
     {loading?(
      <tr><td colSpan="5">Loading...</td></tr>
     ):!filteredSources.length?(
      <tr><td colSpan="5">No borrow sources found.</td></tr>
     ):filteredSources.map(source=>(
      <tr key={source._id}>
       <td>{source.name}</td>
       <td>{source.type||"Other"}</td>
       <td>{source.website?<a href={source.website} target="_blank" rel="noreferrer">{source.website}</a>:"—"}</td>
       <td>{source.notes||"—"}</td>
       <td>
        <div className="d-flex gap-2">
         <Button size="sm" onClick={()=>openEditModal(source)}><FaEdit/></Button>
         <Button size="sm" variant="danger" onClick={()=>openDeleteModal(source)}><FaTrash/></Button>
        </div>
       </td>
      </tr>
     ))}
    </tbody>
   </Table>

   <Modal show={showFormModal} onHide={closeFormModal} centered size="lg" backdrop="static">
    <Modal.Header closeButton>
     <Modal.Title>{formMode==="edit"?"Edit Borrow Source":"Add Borrow Source"}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     <BorrowSourceForm mode={formMode} sourceId={selectedSource?._id} initialData={selectedSource} onSaved={handleSaved} onCancel={closeFormModal} />
    </Modal.Body>
   </Modal>

   <Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
    <Modal.Header closeButton>
     <Modal.Title>Delete Borrow Source</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     Are you sure you want to delete <strong>{selectedSource?.name||"this source"}</strong>?
    </Modal.Body>
    <Modal.Footer>
     <Button variant="secondary" onClick={closeDeleteModal}>Cancel</Button>
     <Button variant="danger" onClick={confirmDelete}><FaTrash className="me-2"/>Delete</Button>
    </Modal.Footer>
   </Modal>
  </div>
 );
}