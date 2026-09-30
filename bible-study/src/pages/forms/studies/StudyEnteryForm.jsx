import {useState,useEffect} from "react";
import {Form,Button,Card,Row,Col,Alert,Spinner} from "react-bootstrap";
import {useNavigate,useParams} from "react-router-dom";

function StudyEntryForm(){

 const navigate=useNavigate();
 const {id}=useParams();
 const isEdit=Boolean(id);

 const [form,setForm]=useState({
  user:"",
  study:"",
  method:"",
  entryType:"",
  title:"",
  scripture:"",
  content:"",
  detail:"",
  tags:"",
  keywords:"",
  isImportant:false,
  isPinned:false,
  status:""
 });

 const [users,setUsers]=useState([]);
 const [studies,setStudies]=useState([]);
 const [methods,setMethods]=useState([]);
 const [entryTypes,setEntryTypes]=useState([]);
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
     fetch("/api/studies"),
     fetch("/api/methods"),
     fetch("/api/lookups/study-entry-types"),
     fetch("/api/lookups/statuses")
    ];

    if(isEdit){
     requests.push(fetch(`/api/studies/entries/${id}`));
    }

    const [
     usersRes,
     studiesRes,
     methodsRes,
     entryTypesRes,
     statusesRes,
     itemRes
    ]=await Promise.all(requests);

    const [
     usersData,
     studiesData,
     methodsData,
     entryTypesData,
     statusesData,
     itemData
    ]=await Promise.all([
     usersRes.json(),
     studiesRes.json(),
     methodsRes.json(),
     entryTypesRes.json(),
     statusesRes.json(),
     itemRes?itemRes.json():Promise.resolve(null)
    ]);

    if(!isMounted)return;

    setUsers(usersData.data||[]);
    setStudies(studiesData.data||[]);
    setMethods(methodsData.data||[]);
    setEntryTypes(entryTypesData.data||[]);
    setStatuses(statusesData.data||[]);

    if(isEdit&&itemData?.data){
     const item=itemData.data;

     setForm({
      user:item.user?._id||item.user||"",
      study:item.study?._id||item.study||"",
      method:item.method?._id||item.method||"",
      entryType:item.entryType?._id||item.entryType||"",
      title:item.title||"",
      scripture:item.scripture||"",
      content:item.content||"",
      detail:item.detail||"",
      tags:Array.isArray(item.tags)?item.tags.join(", "):"",
      keywords:Array.isArray(item.keywords)?item.keywords.join(", "):"",
      isImportant:Boolean(item.isImportant),
      isPinned:Boolean(item.isPinned),
      status:item.status?._id||item.status||""
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

  setForm(prev=>({
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
    status:form.status||null,
    tags:form.tags.split(",").map(tag=>tag.trim()).filter(Boolean),
    keywords:form.keywords.split(",").map(keyword=>keyword.trim()).filter(Boolean)
   };

   const res=await fetch(isEdit?`/api/studies/entries/${id}`:"/api/studies/entries",{
    method:isEdit?"PUT":"POST",
    headers:{
     "Content-Type":"application/json"
    },
    body:JSON.stringify(payload)
   });

   const data=await res.json();

   if(!res.ok){
    throw new Error(data.message||`Failed to ${isEdit?"update":"create"} study entry`);
   }

   setSuccess(`Study entry ${isEdit?"updated":"created"} successfully`);

   if(!isEdit){
    setForm({
     user:"",
     study:"",
     method:"",
     entryType:"",
     title:"",
     scripture:"",
     content:"",
     detail:"",
     tags:"",
     keywords:"",
     isImportant:false,
     isPinned:false,
     status:""
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
     <h2 className="mb-3">{isEdit?"Edit Study Entry":"Create Study Entry"}</h2>

     {error?<Alert variant="danger">{error}</Alert>:null}
     {success?<Alert variant="success">{success}</Alert>:null}

     <Form onSubmit={handleSubmit}>
      <Row className="g-3">

       <Col md={6}>
        <Form.Group>
         <Form.Label>User</Form.Label>
         <Form.Select name="user" value={form.user} onChange={handleChange} required>
          <option value="">Select user</option>
          {users.map(u=>(
           <option key={u._id} value={u._id}>{u.username||u.email}</option>
          ))}
         </Form.Select>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Study</Form.Label>
         <Form.Select name="study" value={form.study} onChange={handleChange} required>
          <option value="">Select study</option>
          {studies.map(s=>(
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
          {methods.map(m=>(
           <option key={m._id} value={m._id}>{m.title}</option>
          ))}
         </Form.Select>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Entry Type</Form.Label>
         <Form.Select name="entryType" value={form.entryType} onChange={handleChange} required>
          <option value="">Select entry type</option>
          {entryTypes.map(type=>(
           <option key={type._id} value={type._id}>{type.title}</option>
          ))}
         </Form.Select>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Status</Form.Label>
         <Form.Select name="status" value={form.status} onChange={handleChange}>
          <option value="">Select status</option>
          {statuses.map(status=>(
           <option key={status._id} value={status._id}>{status.title}</option>
          ))}
         </Form.Select>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Scripture</Form.Label>
         <Form.Control name="scripture" value={form.scripture} onChange={handleChange} placeholder="e.g. Romans 8:1-11"/>
        </Form.Group>
       </Col>

       <Col md={12}>
        <Form.Group>
         <Form.Label>Title</Form.Label>
         <Form.Control name="title" value={form.title} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={12}>
        <Form.Group>
         <Form.Label>Content</Form.Label>
         <Form.Control as="textarea" rows={5} name="content" value={form.content} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={12}>
        <Form.Group>
         <Form.Label>Detail</Form.Label>
         <Form.Control as="textarea" rows={3} name="detail" value={form.detail} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Tags</Form.Label>
         <Form.Control name="tags" value={form.tags} onChange={handleChange} placeholder="faith, grace, spirit"/>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Keywords</Form.Label>
         <Form.Control name="keywords" value={form.keywords} onChange={handleChange} placeholder="justification, peace, life"/>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Check
         type="checkbox"
         label="Important"
         name="isImportant"
         checked={form.isImportant}
         onChange={handleChange}
        />
       </Col>

       <Col md={6}>
        <Form.Check
         type="checkbox"
         label="Pinned"
         name="isPinned"
         checked={form.isPinned}
         onChange={handleChange}
        />
       </Col>

       <Col md={12} className="d-flex gap-2">
        <Button type="submit" disabled={loading}>
         {loading?(isEdit?"Updating...":"Saving..."):(isEdit?"Update Study Entry":"Create Study Entry")}
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

export default StudyEntryForm;