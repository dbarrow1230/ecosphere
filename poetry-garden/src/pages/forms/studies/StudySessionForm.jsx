import {useState,useEffect} from "react";
import {Form,Button,Card,Row,Col,Alert,Spinner} from "react-bootstrap";
import {useNavigate,useParams} from "react-router-dom";

function StudySessionForm(){

 const navigate=useNavigate();
 const {id}=useParams();
 const isEdit=Boolean(id);

 const [form,setForm]=useState({
  user:"",
  study:"",
  method:"",
  title:"",
  focus:"",
  location:"",
  notesExpected:"",
  scheduledFor:"",
  startedAt:"",
  endedAt:"",
  durationMinutes:0,
  status:"",
  summary:"",
  tags:""
 });

 const [users,setUsers]=useState([]);
 const [studies,setStudies]=useState([]);
 const [methods,setMethods]=useState([]);
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
     fetch("/api/studies"),
     fetch("/api/methods"),
     fetch("/api/lookups/statuses")
    ];

    if(isEdit){
     requests.push(fetch(`/api/studies/sessions/${id}`));
    }

    const [
     usersRes,
     studiesRes,
     methodsRes,
     statusesRes,
     itemRes
    ]=await Promise.all(requests);

    const [
     usersData,
     studiesData,
     methodsData,
     statusesData,
     itemData
    ]=await Promise.all([
     usersRes.json(),
     studiesRes.json(),
     methodsRes.json(),
     statusesRes.json(),
     itemRes?itemRes.json():Promise.resolve(null)
    ]);

    if(!isMounted)return;

    setUsers(usersData.data||[]);
    setStudies(studiesData.data||[]);
    setMethods(methodsData.data||[]);
    setStatuses(statusesData.data||[]);

    if(isEdit&&itemData?.data){
     const item=itemData.data;

     setForm({
      user:item.user?._id||item.user||"",
      study:item.study?._id||item.study||"",
      method:item.method?._id||item.method||"",
      title:item.title||"",
      focus:item.focus||"",
      location:item.location||"",
      notesExpected:item.notesExpected||"",
      scheduledFor:formatDateTimeLocal(item.scheduledFor),
      startedAt:formatDateTimeLocal(item.startedAt),
      endedAt:formatDateTimeLocal(item.endedAt),
      durationMinutes:item.durationMinutes??0,
      status:item.status?._id||item.status||"",
      summary:item.summary||"",
      tags:Array.isArray(item.tags)?item.tags.join(", "):""
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
  const {name,value}=e.target;

  setForm((prev)=>({
   ...prev,
   [name]:value
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
    study:form.study||null,
    method:form.method||null,
    scheduledFor:form.scheduledFor||null,
    startedAt:form.startedAt||null,
    endedAt:form.endedAt||null,
    durationMinutes:Number(form.durationMinutes)||0,
    status:form.status||null,
    tags:form.tags.split(",").map((tag)=>tag.trim()).filter(Boolean)
   };

   const res=await fetch(isEdit?`/api/studies/sessions/${id}`:"/api/studies/sessions",{
    method:isEdit?"PUT":"POST",
    headers:{
     "Content-Type":"application/json"
    },
    body:JSON.stringify(payload)
   });

   const data=await res.json();

   if(!res.ok){
    throw new Error(data.message||`Failed to ${isEdit?"update":"create"} study session`);
   }

   setSuccess(`Study session ${isEdit?"updated":"created"} successfully`);

   if(!isEdit){
    setForm({
     user:"",
     study:"",
     method:"",
     title:"",
     focus:"",
     location:"",
     notesExpected:"",
     scheduledFor:"",
     startedAt:"",
     endedAt:"",
     durationMinutes:0,
     status:"",
     summary:"",
     tags:""
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
     <h2 className="mb-3">{isEdit?"Edit Study Session":"Create Study Session"}</h2>

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
         <Form.Label>Study</Form.Label>
         <Form.Select name="study" value={form.study} onChange={handleChange}>
          <option value="">None</option>
          {studies.map((s)=>(
           <option key={s._id} value={s._id}>{s.title}</option>
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
         <Form.Label>Status</Form.Label>
         <Form.Select name="status" value={form.status} onChange={handleChange}>
          <option value="">Select status</option>
          {statuses.map((s)=>(
           <option key={s._id} value={s._id}>{s.title}</option>
          ))}
         </Form.Select>
        </Form.Group>
       </Col>

       <Col md={12}>
        <Form.Group>
         <Form.Label>Title</Form.Label>
         <Form.Control name="title" value={form.title} onChange={handleChange} required/>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Focus</Form.Label>
         <Form.Control name="focus" value={form.focus} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Location</Form.Label>
         <Form.Control name="location" value={form.location} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={12}>
        <Form.Group>
         <Form.Label>Notes Expected</Form.Label>
         <Form.Control name="notesExpected" value={form.notesExpected} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={4}>
        <Form.Group>
         <Form.Label>Scheduled For</Form.Label>
         <Form.Control type="datetime-local" name="scheduledFor" value={form.scheduledFor} onChange={handleChange}/>
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
         <Form.Label>Ended At</Form.Label>
         <Form.Control type="datetime-local" name="endedAt" value={form.endedAt} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Duration Minutes</Form.Label>
         <Form.Control type="number" name="durationMinutes" value={form.durationMinutes} onChange={handleChange} min={0}/>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Tags</Form.Label>
         <Form.Control name="tags" value={form.tags} onChange={handleChange} placeholder="session, review, prayer"/>
        </Form.Group>
       </Col>

       <Col md={12}>
        <Form.Group>
         <Form.Label>Summary</Form.Label>
         <Form.Control as="textarea" rows={4} name="summary" value={form.summary} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={12} className="d-flex gap-2">
        <Button type="submit" disabled={loading}>
         {loading?(isEdit?"Updating...":"Saving..."):(isEdit?"Update Study Session":"Create Study Session")}
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

export default StudySessionForm;