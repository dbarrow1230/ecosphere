import {useState,useEffect} from "react";
import {Form,Button,Card,Row,Col,Alert,Spinner} from "react-bootstrap";
import {useNavigate,useParams} from "react-router-dom";

function StudyForm(){

 const navigate=useNavigate();
 const {id}=useParams();
 const isEdit=Boolean(id);

 const [form,setForm]=useState({
  user:"",
  method:"",
  title:"",
  slug:"",
  subtitle:"",
  description:"",
  reference:"",
  book:"",
  chapterStart:"",
  chapterEnd:"",
  verseStart:"",
  verseEnd:"",
  section:"",
  category:"",
  difficulty:"",
  progress:"",
  progressPercent:0,
  health:0,
  issues:0,
  status:"",
  startedAt:"",
  completedAt:"",
  tags:"",
  notes:"",
  active:true,
  featured:false
 });

 const [users,setUsers]=useState([]);
 const [methods,setMethods]=useState([]);
 const [categories,setCategories]=useState([]);
 const [difficulties,setDifficulties]=useState([]);
 const [statuses,setStatuses]=useState([]);

 const [loading,setLoading]=useState(false);
 const [loadingData,setLoadingData]=useState(true);
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");

 useEffect(()=>{
  let isMounted=true;

  const formatDateTimeLocal=(value)=>{
   if(!value)return "";
   const date=new Date(value);
   if(Number.isNaN(date.getTime()))return "";
   const offset=date.getTimezoneOffset();
   const localDate=new Date(date.getTime()-offset*60000);
   return localDate.toISOString().slice(0,16);
  };

  const loadData=async()=>{
   try{
    setLoadingData(true);
    setError("");

    const requests=[
     fetch("/api/users"),
     fetch("/api/methods"),
     fetch("/api/lookups/study-categories"),
     fetch("/api/lookups/difficulty-levels"),
     fetch("/api/lookups/statuses")
    ];

    if(isEdit){
     requests.push(fetch(`/api/studies/${id}`));
    }

    const [
     usersRes,
     methodsRes,
     categoriesRes,
     difficultiesRes,
     statusesRes,
     itemRes
    ]=await Promise.all(requests);

    const [
     usersData,
     methodsData,
     categoriesData,
     difficultiesData,
     statusesData,
     itemData
    ]=await Promise.all([
     usersRes.json(),
     methodsRes.json(),
     categoriesRes.json(),
     difficultiesRes.json(),
     statusesRes.json(),
     itemRes?itemRes.json():Promise.resolve(null)
    ]);

    if(!isMounted)return;

    setUsers(usersData.data||[]);
    setMethods(methodsData.data||[]);
    setCategories(categoriesData.data||[]);
    setDifficulties(difficultiesData.data||[]);
    setStatuses(statusesData.data||[]);

    if(isEdit&&itemData?.data){
     const item=itemData.data;

     setForm({
      user:item.user?._id||item.user||"",
      method:item.method?._id||item.method||"",
      title:item.title||"",
      slug:item.slug||"",
      subtitle:item.subtitle||"",
      description:item.description||"",
      reference:item.reference||"",
      book:item.book||"",
      chapterStart:item.chapterStart??"",
      chapterEnd:item.chapterEnd??"",
      verseStart:item.verseStart??"",
      verseEnd:item.verseEnd??"",
      section:item.section||"",
      category:item.category?._id||item.category||"",
      difficulty:item.difficulty?._id||item.difficulty||"",
      progress:item.progress||"",
      progressPercent:item.progressPercent??0,
      health:item.health??0,
      issues:item.issues??0,
      status:item.status?._id||item.status||"",
      startedAt:formatDateTimeLocal(item.startedAt),
      completedAt:formatDateTimeLocal(item.completedAt),
      tags:Array.isArray(item.tags)?item.tags.join(", "):"",
      notes:Array.isArray(item.notes)?item.notes.join(", "):"",
      active:item.active!==undefined?Boolean(item.active):true,
      featured:Boolean(item.featured)
     });
    }
   }
   catch(err){
    if(!isMounted)return;
    setError("Failed to load form data");
   }
   finally{
    if(isMounted)setLoadingData(false);
   }
  };

  loadData();

  return()=>{isMounted=false;};
 },[id,isEdit]);

 const handleChange=(e)=>{
  const {name,value,type,checked}=e.target;

  setForm((prev)=>({
   ...prev,
   [name]:type==="checkbox"?checked:value
  }));
 };

 const handleSubmit=async(e)=>{
  e.preventDefault();

  try{
   setLoading(true);
   setError("");
   setSuccess("");

   const payload={
    ...form,
    method:form.method||null,
    chapterStart:form.chapterStart===""?null:Number(form.chapterStart),
    chapterEnd:form.chapterEnd===""?null:Number(form.chapterEnd),
    verseStart:form.verseStart===""?null:Number(form.verseStart),
    verseEnd:form.verseEnd===""?null:Number(form.verseEnd),
    category:form.category||null,
    difficulty:form.difficulty||null,
    progressPercent:Number(form.progressPercent)||0,
    health:Number(form.health)||0,
    issues:Number(form.issues)||0,
    status:form.status||null,
    startedAt:form.startedAt||null,
    completedAt:form.completedAt||null,
    tags:form.tags.split(",").map((tag)=>tag.trim()).filter(Boolean),
    notes:form.notes.split(",").map((note)=>note.trim()).filter(Boolean)
   };

   const res=await fetch(isEdit?`/api/studies/${id}`:"/api/studies",{
    method:isEdit?"PUT":"POST",
    headers:{
     "Content-Type":"application/json"
    },
    body:JSON.stringify(payload)
   });

   const data=await res.json();

   if(!res.ok){
    throw new Error(data.message||`Failed to ${isEdit?"update":"create"} study`);
   }

   setSuccess(`Study ${isEdit?"updated":"created"} successfully`);

   if(!isEdit){
    setForm({
     user:"",
     method:"",
     title:"",
     slug:"",
     subtitle:"",
     description:"",
     reference:"",
     book:"",
     chapterStart:"",
     chapterEnd:"",
     verseStart:"",
     verseEnd:"",
     section:"",
     category:"",
     difficulty:"",
     progress:"",
     progressPercent:0,
     health:0,
     issues:0,
     status:"",
     startedAt:"",
     completedAt:"",
     tags:"",
     notes:"",
     active:true,
     featured:false
    });
   }
   else{
    setTimeout(()=>{
     navigate("/dashboard");
    },800);
   }
  }
  catch(err){
   setError(err.message);
  }
  finally{
   setLoading(false);
  }
 };

 if(loadingData){
  return(
   <div className="container py-4 text-center">
    <Spinner animation="border"/>
   </div>
  );
 }

 return(
  <div className="container py-4">
   <Card>
    <Card.Body>
     <h2 className="mb-3">{isEdit?"Edit Study":"Create Study"}</h2>

     {error?<Alert variant="danger">{error}</Alert>:null}
     {success?<Alert variant="success">{success}</Alert>:null}

     <Form onSubmit={handleSubmit}>
      <Row className="g-3">

       <Col md={6}>
        <Form.Group>
         <Form.Label>User</Form.Label>
         <Form.Select name="user" value={form.user} onChange={handleChange} required>
          <option value="">Select user</option>
          {users.map((u)=>(
           <option key={u._id} value={u._id}>{u.username||u.email}</option>
          ))}
         </Form.Select>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Method</Form.Label>
         <Form.Select name="method" value={form.method} onChange={handleChange}>
          <option value="">None</option>
          {methods.map((m)=>(
           <option key={m._id} value={m._id}>{m.title}</option>
          ))}
         </Form.Select>
        </Form.Group>
       </Col>

       <Col md={8}>
        <Form.Group>
         <Form.Label>Title</Form.Label>
         <Form.Control name="title" value={form.title} onChange={handleChange} required/>
        </Form.Group>
       </Col>

       <Col md={4}>
        <Form.Group>
         <Form.Label>Slug</Form.Label>
         <Form.Control name="slug" value={form.slug} onChange={handleChange} required/>
        </Form.Group>
       </Col>

       <Col md={12}>
        <Form.Group>
         <Form.Label>Subtitle</Form.Label>
         <Form.Control name="subtitle" value={form.subtitle} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={12}>
        <Form.Group>
         <Form.Label>Description</Form.Label>
         <Form.Control as="textarea" rows={4} name="description" value={form.description} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Reference</Form.Label>
         <Form.Control name="reference" value={form.reference} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Book</Form.Label>
         <Form.Control name="book" value={form.book} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={3}>
        <Form.Group>
         <Form.Label>Chapter Start</Form.Label>
         <Form.Control type="number" name="chapterStart" value={form.chapterStart} onChange={handleChange} min={1}/>
        </Form.Group>
       </Col>

       <Col md={3}>
        <Form.Group>
         <Form.Label>Chapter End</Form.Label>
         <Form.Control type="number" name="chapterEnd" value={form.chapterEnd} onChange={handleChange} min={1}/>
        </Form.Group>
       </Col>

       <Col md={3}>
        <Form.Group>
         <Form.Label>Verse Start</Form.Label>
         <Form.Control type="number" name="verseStart" value={form.verseStart} onChange={handleChange} min={1}/>
        </Form.Group>
       </Col>

       <Col md={3}>
        <Form.Group>
         <Form.Label>Verse End</Form.Label>
         <Form.Control type="number" name="verseEnd" value={form.verseEnd} onChange={handleChange} min={1}/>
        </Form.Group>
       </Col>

       <Col md={4}>
        <Form.Group>
         <Form.Label>Section</Form.Label>
         <Form.Control name="section" value={form.section} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={4}>
        <Form.Group>
         <Form.Label>Category</Form.Label>
         <Form.Select name="category" value={form.category} onChange={handleChange}>
          <option value="">Select category</option>
          {categories.map((c)=>(
           <option key={c._id} value={c._id}>{c.title}</option>
          ))}
         </Form.Select>
        </Form.Group>
       </Col>

       <Col md={4}>
        <Form.Group>
         <Form.Label>Difficulty</Form.Label>
         <Form.Select name="difficulty" value={form.difficulty} onChange={handleChange}>
          <option value="">Select difficulty</option>
          {difficulties.map((d)=>(
           <option key={d._id} value={d._id}>{d.title}</option>
          ))}
         </Form.Select>
        </Form.Group>
       </Col>

       <Col md={3}>
        <Form.Group>
         <Form.Label>Progress</Form.Label>
         <Form.Control name="progress" value={form.progress} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={3}>
        <Form.Group>
         <Form.Label>Progress Percent</Form.Label>
         <Form.Control type="number" name="progressPercent" value={form.progressPercent} onChange={handleChange} min={0} max={100}/>
        </Form.Group>
       </Col>

       <Col md={3}>
        <Form.Group>
         <Form.Label>Health</Form.Label>
         <Form.Control type="number" name="health" value={form.health} onChange={handleChange} min={0} max={100}/>
        </Form.Group>
       </Col>

       <Col md={3}>
        <Form.Group>
         <Form.Label>Issues</Form.Label>
         <Form.Control type="number" name="issues" value={form.issues} onChange={handleChange} min={0}/>
        </Form.Group>
       </Col>

       <Col md={4}>
        <Form.Group>
         <Form.Label>Status</Form.Label>
         <Form.Select name="status" value={form.status} onChange={handleChange}>
          <option value="">Select status</option>
          {statuses.map((s)=>(
           <option key={s._id} value={s._id}>{s.title}</option>
          ))}
         </Form.Select>
        </Form.Group>
       </Col>

       <Col md={4}>
        <Form.Group>
         <Form.Label>Started At</Form.Label>
         <Form.Control type="datetime-local" name="startedAt" value={form.startedAt} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={4}>
        <Form.Group>
         <Form.Label>Completed At</Form.Label>
         <Form.Control type="datetime-local" name="completedAt" value={form.completedAt} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Tags</Form.Label>
         <Form.Control name="tags" value={form.tags} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Notes</Form.Label>
         <Form.Control name="notes" value={form.notes} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Check
         type="checkbox"
         label="Active"
         name="active"
         checked={form.active}
         onChange={handleChange}
        />
       </Col>

       <Col md={6}>
        <Form.Check
         type="checkbox"
         label="Featured"
         name="featured"
         checked={form.featured}
         onChange={handleChange}
        />
       </Col>

       <Col md={12} className="d-flex gap-2">
        <Button type="submit" disabled={loading}>
         {loading?(isEdit?"Updating...":"Saving..."):(isEdit?"Update Study":"Create Study")}
        </Button>
        {isEdit?<Button type="button" variant="secondary" onClick={()=>navigate("/dashboard")}>Cancel</Button>:null}
       </Col>

      </Row>
     </Form>
    </Card.Body>
   </Card>
  </div>
 );
}

export default StudyForm;