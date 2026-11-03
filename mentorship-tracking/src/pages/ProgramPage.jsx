import {useEffect,useMemo,useState} from "react";
import axios from "axios";
import ProgramForm from "./forms/ProgramForm";
import "../styles/programs.css";

const ProgramPage=({user})=>{
 const [programs,setPrograms]=useState([]);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState("");
 const [showModal,setShowModal]=useState(false);
 const [editingProgram,setEditingProgram]=useState(null);
 const [activeTab,setActiveTab]=useState("diploma");
 const [filters,setFilters]=useState({category:"all",search:""});

 const fetchPrograms=async()=>{
  try{
   setLoading(true);
   setError("");
   const {data}=await axios.get("/api/programs");
   setPrograms(Array.isArray(data)?data:[]);
  }catch(err){
   setError(err.response?.data?.message||"Failed to load programs");
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{
  fetchPrograms();
 },[]);

 const filteredPrograms=useMemo(()=>{
  return programs.filter(program=>{
   const matchesTab=(program.programType||"").toLowerCase()===activeTab;
   const matchesCategory=filters.category==="all"?true:(program.category||"").toLowerCase()===filters.category;
   const search=filters.search.trim().toLowerCase();

   const matchesSearch=!search
    ||(program.courseName||"").toLowerCase().includes(search)
    ||(program.category||"").toLowerCase().includes(search)
    ||(program.programType||"").toLowerCase().includes(search)
    ||(Array.isArray(program.courses)&&program.courses.some(course=>
      (course.courseNumber||"").toLowerCase().includes(search)
      ||(course.courseName||"").toLowerCase().includes(search)
     ));

   return matchesTab&&matchesCategory&&matchesSearch;
  });
 },[programs,activeTab,filters]);

 const resetFilters=tab=>{
  setActiveTab(tab);
  setFilters(prev=>({...prev,category:"all",search:""}));
 };

 const openAddModal=()=>{
  setEditingProgram(null);
  setShowModal(true);
 };

 const openEditModal=program=>{
  setEditingProgram(program);
  setShowModal(true);
 };

 const closeModal=()=>{
  setShowModal(false);
  setEditingProgram(null);
 };

 const handleDelete=async program=>{
  const confirmed=window.confirm(`Delete ${program.courseName||program.programType} program?`);
  if(!confirmed)return;

  try{
   await axios.delete(`/api/programs/${program._id}`);
   fetchPrograms();
  }catch(err){
   setError(err.response?.data?.message||"Delete failed");
  }
 };

 const handleFilterChange=e=>{
  const {name,value}=e.target;
  setFilters(prev=>({...prev,[name]:value}));
 };

 return(
  <div className="py-4 px-3 px-lg-4 program-page-container">
   <div className="d-flex justify-content-between align-items-center mb-4">
    <h3>Programs</h3>
    <button className="btn btn-primary" onClick={openAddModal}>Add Program</button>
   </div>

   <div className="mb-4">
    <ul className="nav nav-tabs program-tabs">
     <li className="nav-item">
      <button type="button" className={`nav-link ${activeTab==="diploma"?"active":""}`} onClick={()=>resetFilters("diploma")}>
       Diploma
      </button>
     </li>
     <li className="nav-item">
      <button type="button" className={`nav-link ${activeTab==="associate"?"active":""}`} onClick={()=>resetFilters("associate")}>
       Associate
      </button>
     </li>
     <li className="nav-item">
      <button type="button" className={`nav-link ${activeTab==="stand alone"?"active":""}`} onClick={()=>resetFilters("stand alone")}>
       Stand Alone
      </button>
     </li>
    </ul>
   </div>

   <div className="mb-4 program-filter-card">
     <div className="row g-3">
      <div className="col-md-4">
       <label className="form-label">Category</label>
       <select className="form-select" name="category" value={filters.category} onChange={handleFilterChange}>
        <option value="all">All Categories</option>
        <option value="culinary">Culinary</option>
        <option value="pastry">Pastry</option>
        <option value="holistic">Holistic</option>
        <option value="plant based">Plant Based</option>
          <option value="stand alone">Stand Alone</option>
       </select>
      </div>

      <div className="col-md-8">
       <label className="form-label">Search</label>
       <input className="form-control" name="search" value={filters.search} onChange={handleFilterChange} />
      </div>
     </div>
   </div>

   {error?<div className="alert alert-danger">{error}</div>:null}
   {loading?<p>Loading...</p>:null}

   {!loading&&!filteredPrograms.length?<div className="alert alert-light border">No programs found.</div>:null}

   <div className="row program-grid">
    {filteredPrograms.map(program=>(
     <div key={program._id} className="col-lg-6 col-md-12">
      <div className="card program-card mb-3">
       <div className="card-body">

        <div className="d-flex justify-content-between align-items-start program-header">
         <div>
          <div className="program-title">{program.courseName||"Unnamed Program"}</div>
          <div className="text-muted text-capitalize">{program.category}</div>
         </div>

         <div className="program-actions">
          <button className="btn btn-sm btn-outline-primary" onClick={()=>openEditModal(program)}>Edit</button>
          <button className="btn btn-sm btn-outline-danger" onClick={()=>handleDelete(program)}>Delete</button>
         </div>
        </div>

        <hr />

        <div className="mb-2">
         <strong>Courses</strong>

         {program.courses?.length?(
          <div className="table-responsive">
           <table className="table table-sm program-table mb-0">
            <thead>
             <tr>
              <th style={{width:"120px"}}>Code</th>
              <th>Name</th>
             </tr>
            </thead>
            <tbody>
             {program.courses.map((c,i)=>(
              <tr key={i}>
               <td>{c.courseNumber}</td>
               <td>{c.courseName}</td>
              </tr>
             ))}
            </tbody>
           </table>
          </div>
         ):<p className="text-muted mb-0">No courses</p>}
        </div>

        <div className="small text-muted">
         Required: {program.requiredHours} | Externship: {program.externshipHours}
        </div>

       </div>
      </div>
     </div>
    ))}
   </div>

   {showModal&&(
    <div className="modal d-block" style={{background:"rgba(0,0,0,0.5)"}}>
     <div className="modal-dialog modal-lg">
      <div className="modal-content">
       <div className="modal-header">
        <h5 className="modal-title">{editingProgram?"Edit Program":"Add Program"}</h5>
        <button className="btn-close" onClick={closeModal}></button>
       </div>

       <div className="modal-body">
        <ProgramForm
         program={editingProgram}
         userId={user?._id||""}
         onCancel={closeModal}
         onSuccess={()=>{closeModal();fetchPrograms();}}
        />
       </div>
      </div>
     </div>
    </div>
   )}
  </div>
 );
};

export default ProgramPage;
