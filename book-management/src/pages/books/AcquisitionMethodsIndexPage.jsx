// src/pages/books/AcquisitionMethodsIndexPage.jsx
import {useEffect,useMemo,useState} from "react";
import {Button,Form,InputGroup,Modal,Table} from "react-bootstrap";
import {FaEdit,FaPlus,FaSearch,FaTrash} from "react-icons/fa";
import AcquisitionMethodForm from "../forms/AcquisitionMethodForm";

export default function AcquisitionMethodsIndexPage(){
 const [methods,setMethods]=useState([]);
 const [loading,setLoading]=useState(true);
 const [search,setSearch]=useState("");
 const [showFormModal,setShowFormModal]=useState(false);
 const [formMode,setFormMode]=useState("add");
 const [selectedMethod,setSelectedMethod]=useState(null);
 const [showDeleteModal,setShowDeleteModal]=useState(false);

 const loadMethods=async()=>{
  try{
   setLoading(true);
   const res=await fetch("/api/acquisition-methods",{cache:"no-store"});
   const data=await res.json();
   if(!res.ok)throw new Error(data?.message||"Failed to load acquisition methods");
   setMethods(Array.isArray(data?.acquisitionMethods)?data.acquisitionMethods:[]);
  }catch{
   setMethods([]);
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{
  loadMethods();
 },[]);

 const filteredMethods=useMemo(()=>{
  const q=search.trim().toLowerCase();
  if(!q)return methods;
  return methods.filter(item=>[
   item.name,
   item.notes
  ].join(" ").toLowerCase().includes(q));
 },[methods,search]);

 const openAddModal=()=>{
  setFormMode("add");
  setSelectedMethod(null);
  setShowFormModal(true);
 };

 const openEditModal=method=>{
  setFormMode("edit");
  setSelectedMethod(method);
  setShowFormModal(true);
 };

 const closeFormModal=()=>{
  setShowFormModal(false);
  setSelectedMethod(null);
 };

 const openDeleteModal=method=>{
  setSelectedMethod(method);
  setShowDeleteModal(true);
 };

 const closeDeleteModal=()=>{
  setShowDeleteModal(false);
  setSelectedMethod(null);
 };

 const handleSaved=method=>{
  if(formMode==="edit"){
   setMethods(prev=>prev.map(item=>item._id===method?._id?method:item));
  }else{
   setMethods(prev=>[method,...prev.filter(item=>item._id!==method?._id)]);
  }
  closeFormModal();
 };

 const confirmDelete=async()=>{
  if(!selectedMethod?._id)return;
  await fetch(`/api/acquisition-methods/${selectedMethod._id}`,{method:"DELETE"});
  setMethods(prev=>prev.filter(item=>item._id!==selectedMethod._id));
  closeDeleteModal();
 };

 return(
  <div className="container py-3">
   <div className="d-flex align-items-center justify-content-between mb-3">
    <h1 className="m-0">Acquisition Methods</h1>
    <Button onClick={openAddModal}><FaPlus/> Add Method</Button>
   </div>

   <InputGroup className="mb-3">
    <InputGroup.Text><FaSearch/></InputGroup.Text>
    <Form.Control value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search methods..." />
    <Button variant="outline-secondary" onClick={()=>setSearch("")} disabled={!search}>Clear</Button>
   </InputGroup>

   <Table hover responsive>
    <thead>
     <tr>
      <th>Name</th>
      <th>Notes</th>
      <th style={{width:"120px"}}>Actions</th>
     </tr>
    </thead>
    <tbody>
     {loading?(
      <tr><td colSpan="3">Loading...</td></tr>
     ):!filteredMethods.length?(
      <tr><td colSpan="3">No acquisition methods found.</td></tr>
     ):filteredMethods.map(method=>(
      <tr key={method._id}>
       <td>{method.name}</td>
       <td>{method.notes||"—"}</td>
       <td>
        <div className="d-flex gap-2">
         <Button size="sm" onClick={()=>openEditModal(method)}><FaEdit/></Button>
         <Button size="sm" variant="danger" onClick={()=>openDeleteModal(method)}><FaTrash/></Button>
        </div>
       </td>
      </tr>
     ))}
    </tbody>
   </Table>

   <Modal show={showFormModal} onHide={closeFormModal} centered size="lg" backdrop="static">
    <Modal.Header closeButton>
     <Modal.Title>{formMode==="edit"?"Edit Acquisition Method":"Add Acquisition Method"}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     <AcquisitionMethodForm mode={formMode} methodId={selectedMethod?._id} initialData={selectedMethod} onSaved={handleSaved} onCancel={closeFormModal} />
    </Modal.Body>
   </Modal>

   <Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
    <Modal.Header closeButton>
     <Modal.Title>Delete Acquisition Method</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     Are you sure you want to delete <strong>{selectedMethod?.name||"this method"}</strong>?
    </Modal.Body>
    <Modal.Footer>
     <Button variant="secondary" onClick={closeDeleteModal}>Cancel</Button>
     <Button variant="danger" onClick={confirmDelete}><FaTrash className="me-2"/>Delete</Button>
    </Modal.Footer>
   </Modal>
  </div>
 );
}