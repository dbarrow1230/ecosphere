import {useState,useEffect} from "react";
import {Form,Button,Card,Row,Col,Alert,Spinner} from "react-bootstrap";
import {useNavigate,useParams} from "react-router-dom";

function StudyRecommendationForm(){

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
  category:"",
  difficulty:"",
  audience:"",
  tags:"",
  reason:"",
  goals:"",
  outcomes:"",
  focusAreas:"",
  estimatedDays:0,
  estimatedSessions:0,
  estimatedMinutes:0,
  icon:"",
  color:"",
  status:"",
  featured:false,
  active:true,
  sortOrder:0
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
     requests.push(fetch(`/api/studies/recommendations/${id}`));
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
      category:item.category?._id||item.category||"",
      difficulty:item.difficulty?._id||item.difficulty||"",
      audience:Array.isArray(item.audience)?item.audience.join(", "):"",
      tags:Array.isArray(item.tags)?item.tags.join(", "):"",
      reason:item.reason||"",
      goals:Array.isArray(item.goals)?item.goals.join(", "):"",
      outcomes:Array.isArray(item.outcomes)?item.outcomes.join(", "):"",
      focusAreas:Array.isArray(item.focusAreas)?item.focusAreas.join(", "):"",
      estimatedDays:item.estimatedDays??0,
      estimatedSessions:item.estimatedSessions??0,
      estimatedMinutes:item.estimatedMinutes??0,
      icon:item.icon||"",
      color:item.color||"",
      status:item.status?._id||item.status||"",
      featured:Boolean(item.featured),
      active:item.active!==undefined?Boolean(item.active):true,
      sortOrder:item.sortOrder??0
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
    user:form.user||null,
    method:form.method||null,
    chapterStart:form.chapterStart===""?null:Number(form.chapterStart),
    chapterEnd:form.chapterEnd===""?null:Number(form.chapterEnd),
    verseStart:form.verseStart===""?null:Number(form.verseStart),
    verseEnd:form.verseEnd===""?null:Number(form.verseEnd),
    category:form.category||null,
    difficulty:form.difficulty||null,
    audience:form.audience.split(",").map((item)=>item.trim()).filter(Boolean),
    tags:form.tags.split(",").map((item)=>item.trim()).filter(Boolean),
    goals:form.goals.split(",").map((item)=>item.trim()).filter(Boolean),
    outcomes:form.outcomes.split(",").map((item)=>item.trim()).filter(Boolean),
    focusAreas:form.focusAreas.split(",").map((item)=>item.trim()).filter(Boolean),
    estimatedDays:Number(form.estimatedDays)||0,
    estimatedSessions:Number(form.estimatedSessions)||0,
    estimatedMinutes:Number(form.estimatedMinutes)||0,
    status:form.status||null,
    sortOrder:Number(form.sortOrder)||0
   };

   const res=await fetch(isEdit?`/api/studies/recommendations/${id}`:"/api/studies/recommendations",{
    method:isEdit?"PUT":"POST",
    headers:{
     "Content-Type":"application/json"
    },
    body:JSON.stringify(payload)
   });

   const data=await res.json();

   if(!res.ok){
    throw new Error(data.message||`Failed to ${isEdit?"update":"create"} study recommendation`);
   }

   setSuccess(`Study recommendation ${isEdit?"updated":"created"} successfully`);

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
     category:"",
     difficulty:"",
     audience:"",
     tags:"",
     reason:"",
     goals:"",
     outcomes:"",
     focusAreas:"",
     estimatedDays:0,
     estimatedSessions:0,
     estimatedMinutes:0,
     icon:"",
     color:"",
     status:"",
     featured:false,
     active:true,
     sortOrder:0
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
     <h2 className="mb-3">{isEdit?"Edit Study Recommendation":"Create Study Recommendation"}</h2>

     {error?<Alert variant="danger">{error}</Alert>:null}
     {success?<Alert variant="success">{success}</Alert>:null}

     <Form onSubmit={handleSubmit}>
      <Row className="g-3">

       <Col md={6}>
        <Form.Group>
         <Form.Label>User</Form.Label>
         <Form.Select name="user" value={form.user} onChange={handleChange}>
          <option value="">None</option>
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

       <Col md={6}>
        <Form.Group>
         <Form.Label>Title</Form.Label>
         <Form.Control name="title" value={form.title} onChange={handleChange} required/>
        </Form.Group>
       </Col>

       <Col md={6}>
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

       <Col md={6}>
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

       <Col md={6}>
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

       <Col md={6}>
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

       <Col md={6}>
        <Form.Group>
         <Form.Label>Audience</Form.Label>
         <Form.Control name="audience" value={form.audience} onChange={handleChange} placeholder="new believers, bible students"/>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Tags</Form.Label>
         <Form.Control name="tags" value={form.tags} onChange={handleChange} placeholder="grace, faith, assurance"/>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Focus Areas</Form.Label>
         <Form.Control name="focusAreas" value={form.focusAreas} onChange={handleChange} placeholder="observation, interpretation, application"/>
        </Form.Group>
       </Col>

       <Col md={12}>
        <Form.Group>
         <Form.Label>Reason</Form.Label>
         <Form.Control as="textarea" rows={2} name="reason" value={form.reason} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Goals</Form.Label>
         <Form.Control name="goals" value={form.goals} onChange={handleChange} placeholder="observe repeated themes, trace doctrine"/>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Outcomes</Form.Label>
         <Form.Control name="outcomes" value={form.outcomes} onChange={handleChange} placeholder="clearer understanding, stronger application"/>
        </Form.Group>
       </Col>

       <Col md={4}>
        <Form.Group>
         <Form.Label>Estimated Days</Form.Label>
         <Form.Control type="number" name="estimatedDays" value={form.estimatedDays} onChange={handleChange} min={0}/>
        </Form.Group>
       </Col>

       <Col md={4}>
        <Form.Group>
         <Form.Label>Estimated Sessions</Form.Label>
         <Form.Control type="number" name="estimatedSessions" value={form.estimatedSessions} onChange={handleChange} min={0}/>
        </Form.Group>
       </Col>

       <Col md={4}>
        <Form.Group>
         <Form.Label>Estimated Minutes</Form.Label>
         <Form.Control type="number" name="estimatedMinutes" value={form.estimatedMinutes} onChange={handleChange} min={0}/>
        </Form.Group>
       </Col>

       <Col md={4}>
        <Form.Group>
         <Form.Label>Icon</Form.Label>
         <Form.Control name="icon" value={form.icon} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={4}>
        <Form.Group>
         <Form.Label>Color</Form.Label>
         <Form.Control name="color" value={form.color} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={4}>
        <Form.Group>
         <Form.Label>Sort Order</Form.Label>
         <Form.Control type="number" name="sortOrder" value={form.sortOrder} onChange={handleChange} min={0}/>
        </Form.Group>
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

       <Col md={6}>
        <Form.Check
         type="checkbox"
         label="Active"
         name="active"
         checked={form.active}
         onChange={handleChange}
        />
       </Col>

       <Col md={12} className="d-flex gap-2">
        <Button type="submit" disabled={loading}>
         {loading?(isEdit?"Updating...":"Saving..."):(isEdit?"Update Study Recommendation":"Create Study Recommendation")}
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

export default StudyRecommendationForm;