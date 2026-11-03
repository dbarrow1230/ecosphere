import {useState,useEffect} from "react";
import {Form,Button,Card,Row,Col,Alert,Spinner} from "react-bootstrap";
import {useNavigate,useParams} from "react-router-dom";

function StudyTaskForm(){

 const navigate=useNavigate();
 const {id}=useParams();
 const isEdit=Boolean(id);

 const [form,setForm]=useState({
  user:"",
  study:"",
  title:"",
  description:"",
  context:"",
  dueLabel:"",
  dueDate:"",
  priority:"",
  status:"",
  completed:false,
  completedAt:"",
  reminderAt:"",
  tags:""
 });

 const [users,setUsers]=useState([]);
 const [studies,setStudies]=useState([]);
 const [priorities,setPriorities]=useState([]);
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
     fetch("/api/lookups/task-priorities"),
     fetch("/api/lookups/task-statuses")
    ];

    if(isEdit){
     requests.push(fetch(`/api/studies/tasks/${id}`));
    }

    const [
     usersRes,
     studiesRes,
     prioritiesRes,
     statusesRes,
     itemRes
    ]=await Promise.all(requests);

    const [
     usersData,
     studiesData,
     prioritiesData,
     statusesData,
     itemData
    ]=await Promise.all([
     usersRes.json(),
     studiesRes.json(),
     prioritiesRes.json(),
     statusesRes.json(),
     itemRes?itemRes.json():Promise.resolve(null)
    ]);

    if(!isMounted)return;

    setUsers(usersData.data||[]);
    setStudies(studiesData.data||[]);
    setPriorities(prioritiesData.data||[]);
    setStatuses(statusesData.data||[]);

    if(isEdit&&itemData?.data){
     const item=itemData.data;

     setForm({
      user:item.user?._id||item.user||"",
      study:item.study?._id||item.study||"",
      title:item.title||"",
      description:item.description||"",
      context:item.context||"",
      dueLabel:item.dueLabel||"",
      dueDate:formatDateTimeLocal(item.dueDate),
      priority:item.priority?._id||item.priority||"",
      status:item.status?._id||item.status||"",
      completed:Boolean(item.completed),
      completedAt:formatDateTimeLocal(item.completedAt),
      reminderAt:formatDateTimeLocal(item.reminderAt),
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
    study:form.study||null,
    dueDate:form.dueDate||null,
    priority:form.priority||null,
    status:form.status||null,
    completedAt:form.completedAt||null,
    reminderAt:form.reminderAt||null,
    tags:form.tags.split(",").map((tag)=>tag.trim()).filter(Boolean)
   };

   const res=await fetch(isEdit?`/api/studies/tasks/${id}`:"/api/studies/tasks",{
    method:isEdit?"PUT":"POST",
    headers:{
     "Content-Type":"application/json"
    },
    body:JSON.stringify(payload)
   });

   const data=await res.json();

   if(!res.ok){
    throw new Error(data.message||`Failed to ${isEdit?"update":"create"} study task`);
   }

   setSuccess(`Study task ${isEdit?"updated":"created"} successfully`);

   if(!isEdit){
    setForm({
     user:"",
     study:"",
     title:"",
     description:"",
     context:"",
     dueLabel:"",
     dueDate:"",
     priority:"",
     status:"",
     completed:false,
     completedAt:"",
     reminderAt:"",
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
     <h2 className="mb-3">{isEdit?"Edit Study Task":"Create Study Task"}</h2>

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

       <Col md={12}>
        <Form.Group>
         <Form.Label>Title</Form.Label>
         <Form.Control name="title" value={form.title} onChange={handleChange} required/>
        </Form.Group>
       </Col>

       <Col md={12}>
        <Form.Group>
         <Form.Label>Description</Form.Label>
         <Form.Control as="textarea" rows={3} name="description" value={form.description} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={12}>
        <Form.Group>
         <Form.Label>Context</Form.Label>
         <Form.Control name="context" value={form.context} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={4}>
        <Form.Group>
         <Form.Label>Due Label</Form.Label>
         <Form.Control name="dueLabel" value={form.dueLabel} onChange={handleChange} placeholder="Today, Tomorrow, This Week"/>
        </Form.Group>
       </Col>

       <Col md={4}>
        <Form.Group>
         <Form.Label>Due Date</Form.Label>
         <Form.Control type="datetime-local" name="dueDate" value={form.dueDate} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={4}>
        <Form.Group>
         <Form.Label>Reminder At</Form.Label>
         <Form.Control type="datetime-local" name="reminderAt" value={form.reminderAt} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Priority</Form.Label>
         <Form.Select name="priority" value={form.priority} onChange={handleChange}>
          <option value="">Select priority</option>
          {priorities.map((priority)=>(
           <option key={priority._id} value={priority._id}>{priority.title}</option>
          ))}
         </Form.Select>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Status</Form.Label>
         <Form.Select name="status" value={form.status} onChange={handleChange}>
          <option value="">Select status</option>
          {statuses.map((status)=>(
           <option key={status._id} value={status._id}>{status.title}</option>
          ))}
         </Form.Select>
        </Form.Group>
       </Col>

       <Col md={6} className="d-flex align-items-end">
        <Form.Check
         type="checkbox"
         label="Completed"
         name="completed"
         checked={form.completed}
         onChange={handleChange}
        />
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Completed At</Form.Label>
         <Form.Control type="datetime-local" name="completedAt" value={form.completedAt} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={12}>
        <Form.Group>
         <Form.Label>Tags</Form.Label>
         <Form.Control name="tags" value={form.tags} onChange={handleChange} placeholder="priority, doctrine, review"/>
        </Form.Group>
       </Col>

       <Col md={12} className="d-flex gap-2">
        <Button type="submit" disabled={loading}>
         {loading?(isEdit?"Updating...":"Saving..."):(isEdit?"Update Study Task":"Create Study Task")}
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

export default StudyTaskForm;