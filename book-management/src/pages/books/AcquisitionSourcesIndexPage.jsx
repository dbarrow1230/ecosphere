// src/pages/books/AcquisitionSourcesIndexPage.jsx
import {useEffect,useMemo,useState} from "react";
import {Button,Form,InputGroup,Modal,Table} from "react-bootstrap";
import {FaEdit,FaPlus,FaSearch,FaTrash} from "react-icons/fa";
import AcquisitionSourceForm from "../forms/AcquisitionSourceForm";

export default function AcquisitionSourcesIndexPage(){
 const [sources,setSources]=useState([]);
 const [loading,setLoading]=useState(true);
 const [search,setSearch]=useState("");
 const [showFormModal,setShowFormModal]=useState(false);
 const [formMode,setFormMode]=useState("add");
 const [selectedSource,setSelectedSource]=useState(null);
 const [showDeleteModal,setShowDeleteModal]=useState(false);

 const loadSources=async()=>{
  try{
   setLoading(true);
   const res=await fetch("/api/acquisition-sources",{cache:"no-store"});
   const data=await res.json();
   if(!res.ok)throw new Error(data?.message||"Failed to load acquisition sources");
   setSources(Array.isArray(data?.acquisitionSources)?data.acquisitionSources:[]);
  }catch{
   setSources([]);
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{
  loadSources();
 },[]);

 const filteredSources=useMemo(()=>{
  const q=search.trim().toLowerCase();
  if(!q)return sources;
  return sources.filter(item=>[
   item.name,
   item.website,
   item.notes
  ].join(" ").toLowerCase().includes(q));
 },[sources,search]);

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
  await fetch(`/api/acquisition-sources/${selectedSource._id}`,{method:"DELETE"});
  setSources(prev=>prev.filter(item=>item._id!==selectedSource._id));
  closeDeleteModal();
 };

 return(
  <div className="container py-3">
   <div className="d-flex align-items-center justify-content-between mb-3">
    <h1 className="m-0">Acquisition Sources</h1>
    <Button onClick={openAddModal}><FaPlus/> Add Source</Button>
   </div>

   <InputGroup className="mb-3">
    <InputGroup.Text><FaSearch/></InputGroup.Text>
    <Form.Control value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search sources..." />
    <Button variant="outline-secondary" onClick={()=>setSearch("")} disabled={!search}>Clear</Button>
   </InputGroup>

   <Table hover responsive>
    <thead>
     <tr>
      <th>Name</th>
      <th>Website</th>
      <th>Notes</th>
      <th style={{width:"120px"}}>Actions</th>
     </tr>
    </thead>
    <tbody>
     {loading?(
      <tr><td colSpan="4">Loading...</td></tr>
     ):!filteredSources.length?(
      <tr><td colSpan="4">No acquisition sources found.</td></tr>
     ):filteredSources.map(source=>(
      <tr key={source._id}>
       <td>{source.name}</td>
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
     <Modal.Title>{formMode==="edit"?"Edit Acquisition Source":"Add Acquisition Source"}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     <AcquisitionSourceForm mode={formMode} sourceId={selectedSource?._id} initialData={selectedSource} onSaved={handleSaved} onCancel={closeFormModal} />
    </Modal.Body>
   </Modal>

   <Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
    <Modal.Header closeButton>
     <Modal.Title>Delete Acquisition Source</Modal.Title>
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