import Alert from "../../components/AppAlert.jsx";
import {useEffect,useState} from "react";
import axios from "axios";

const getInitialForm=program=>({
 programType:program?.programType||"diploma",
 category:program?.category||"culinary",
 courseName:program?.courseName||"",
 courses:Array.isArray(program?.courses)&&program.courses.length?program.courses.map(course=>({
  courseNumber:course.courseNumber||"",
  courseName:course.courseName||""
 })):[{courseNumber:"",courseName:""}],
 requiredHours:program?.requiredHours??150,
 externshipHours:program?.externshipHours??150,
 notes:program?.notes||""
});

const ProgramForm=({program,onSuccess,onCancel,userId})=>{
 const [form,setForm]=useState(getInitialForm(program));
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState("");

 useEffect(()=>{
  setForm(getInitialForm(program));
  setError("");
 },[program]);

 const handleChange=e=>{
  const {name,value}=e.target;
  setForm(prev=>({...prev,[name]:name==="requiredHours"||name==="externshipHours"?Number(value):value}));
 };

 const handleCourseChange=(index,e)=>{
  const {name,value}=e.target;
  const updatedCourses=[...form.courses];
  updatedCourses[index]={...updatedCourses[index],[name]:value};
  setForm(prev=>({...prev,courses:updatedCourses}));
 };

 const addCourse=()=>{
  setForm(prev=>({...prev,courses:[...prev.courses,{courseNumber:"",courseName:""}]}));
 };

 const removeCourse=index=>{
  const updatedCourses=form.courses.filter((_,i)=>i!==index);
  setForm(prev=>({...prev,courses:updatedCourses.length?updatedCourses:[{courseNumber:"",courseName:""}]}));
 };

 const handleSubmit=async e=>{
  e.preventDefault();
  setLoading(true);
  setError("");

  try{
   const payload={
    ...form,
    createdBy:userId,
    courses:form.courses.filter(course=>course.courseNumber?.trim()||course.courseName?.trim())
   };

   if(program?._id){
    await axios.put(`/api/programs/${program._id}`,payload);
   }else{
    await axios.post("/api/programs",payload);
   }

   if(onSuccess)onSuccess();
  }catch(err){
   setError(err.response?.data?.message||"Error saving program");
  }finally{
   setLoading(false);
  }
 };

 return(
  <form onSubmit={handleSubmit}>
   {error?<Alert variant="danger" onClose={()=>setError("")}>{error}</Alert>:null}

   <div className="row mb-3 align-items-center">
    <label htmlFor="programType" className="col-sm-3 col-form-label">Program Type</label>
    <div className="col-sm-9">
     <select id="programType" className="form-select" name="programType" value={form.programType} onChange={handleChange} required>
      <option value="diploma">Diploma</option>
      <option value="associate">Associate</option>
     </select>
    </div>
   </div>

   <div className="row mb-3 align-items-center">
    <label htmlFor="category" className="col-sm-3 col-form-label">Category</label>
    <div className="col-sm-9">
     <select id="category" className="form-select" name="category" value={form.category} onChange={handleChange} required>
      <option value="culinary">Culinary</option>
      <option value="pastry">Pastry</option>
      <option value="holistic">Holistic</option>
      <option value="plant based">Plant Based</option>
     </select>
    </div>
   </div>

   <div className="row mb-3 align-items-center">
    <label htmlFor="courseName" className="col-sm-3 col-form-label">Program Name</label>
    <div className="col-sm-9">
     <input id="courseName" className="form-control" name="courseName" value={form.courseName} onChange={handleChange} required />
    </div>
   </div>

   <div className="row mb-3">
    <label className="col-sm-3 col-form-label">Courses</label>
    <div className="col-sm-9">
     {form.courses.map((course,index)=>(
      <div className="border rounded p-3 mb-2" key={index}>
       <div className="row mb-2 align-items-center">
        <label htmlFor={`courseNumber-${index}`} className="col-sm-3 col-form-label">Number</label>
        <div className="col-sm-9">
         <input id={`courseNumber-${index}`} className="form-control" name="courseNumber" value={course.courseNumber} onChange={e=>handleCourseChange(index,e)} />
        </div>
       </div>

       <div className="row align-items-center">
        <label htmlFor={`courseName-${index}`} className="col-sm-3 col-form-label">Name</label>
        <div className="col-sm-6">
         <input id={`courseName-${index}`} className="form-control" name="courseName" value={course.courseName} onChange={e=>handleCourseChange(index,e)} />
        </div>
        <div className="col-sm-3 text-end">
         <button type="button" className="btn btn-outline-danger" onClick={()=>removeCourse(index)} disabled={form.courses.length===1}>Remove</button>
        </div>
       </div>
      </div>
     ))}

     <button type="button" className="btn btn-outline-primary" onClick={addCourse}>Add Course</button>
    </div>
   </div>

   <div className="row mb-3 align-items-center">
    <label htmlFor="requiredHours" className="col-sm-3 col-form-label">Required Hours</label>
    <div className="col-sm-9">
     <input id="requiredHours" className="form-control" type="number" name="requiredHours" value={form.requiredHours} onChange={handleChange} />
    </div>
   </div>

   <div className="row mb-3 align-items-center">
    <label htmlFor="externshipHours" className="col-sm-3 col-form-label">Externship Hours</label>
    <div className="col-sm-9">
     <input id="externshipHours" className="form-control" type="number" name="externshipHours" value={form.externshipHours} onChange={handleChange} />
    </div>
   </div>

   <div className="row mb-4">
    <label htmlFor="notes" className="col-sm-3 col-form-label">Notes</label>
    <div className="col-sm-9">
     <textarea id="notes" className="form-control" name="notes" value={form.notes} onChange={handleChange} rows="4" />
    </div>
   </div>

   <div className="d-flex justify-content-end gap-2">
    {onCancel?<button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>:null}
    <button type="submit" className="btn btn-primary" disabled={loading}>
     {loading?"Saving...":program?._id?"Update Program":"Create Program"}
    </button>
   </div>
  </form>
 );
};

export default ProgramForm;