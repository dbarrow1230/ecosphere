import {useState,useEffect} from "react";
import {Form,Button,Card,Row,Col,Alert,Spinner} from "react-bootstrap";
import {useNavigate,useParams} from "react-router-dom";

function LibraryItemForm(){

 const navigate=useNavigate();
 const {id}=useParams();
 const isEdit=Boolean(id);

 const [form,setForm]=useState({
  user:"",
  study:"",
  method:"",
  title:"",
  subtitle:"",
  type:"",
  reference:"",
  content:"",
  source:"",
  category:"",
  status:"",
  tags:"",
  notes:"",
  featured:false,
  active:true
 });

 const [users,setUsers]=useState([]);
 const [studies,setStudies]=useState([]);
 const [methods,setMethods]=useState([]);
 const [types,setTypes]=useState([]);
 const [categories,setCategories]=useState([]);
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
     fetch("/api/lookups/library-item-types"),
     fetch("/api/lookups/study-categories"),
     fetch("/api/lookups/statuses")
    ];

    if(isEdit){
     requests.push(fetch(`/api/studies/library-items/${id}`));
    }

    const [
     usersRes,
     studiesRes,
     methodsRes,
     typesRes,
     categoriesRes,
     statusesRes,
     itemRes
    ]=await Promise.all(requests);

    const [
     usersData,
     studiesData,
     methodsData,
     typesData,
     categoriesData,
     statusesData,
     itemData
    ]=await Promise.all([
     usersRes.json(),
     studiesRes.json(),
     methodsRes.json(),
     typesRes.json(),
     categoriesRes.json(),
     statusesRes.json(),
     itemRes?itemRes.json():Promise.resolve(null)
    ]);

    if(!isMounted)return;

    setUsers(usersData.data||[]);
    setStudies(studiesData.data||[]);
    setMethods(methodsData.data||[]);
    setTypes(typesData.data||[]);
    setCategories(categoriesData.data||[]);
    setStatuses(statusesData.data||[]);

    if(isEdit&&itemData?.data){
     const item=itemData.data;

     setForm({
      user:item.user?._id||item.user||"",
      study:item.study?._id||item.study||"",
      method:item.method?._id||item.method||"",
      title:item.title||"",
      subtitle:item.subtitle||"",
      type:item.type?._id||item.type||"",
      reference:item.reference||"",
      content:item.content||"",
      source:item.source||"",
      category:item.category?._id||item.category||"",
      status:item.status?._id||item.status||"",
      tags:Array.isArray(item.tags)?item.tags.join(", "):"",
      notes:Array.isArray(item.notes)?item.notes.join(", "):"",
      featured:Boolean(item.featured),
      active:item.active!==undefined?Boolean(item.active):true
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
    study:form.study||null,
    method:form.method||null,
    type:form.type||null,
    category:form.category||null,
    status:form.status||null,
    tags:form.tags.split(",").map(t=>t.trim()).filter(Boolean),
    notes:form.notes.split(",").map(n=>n.trim()).filter(Boolean)
   };

   const res=await fetch(isEdit?`/api/studies/library-items/${id}`:"/api/studies/library-items",{
    method:isEdit?"PUT":"POST",
    headers:{
     "Content-Type":"application/json"
    },
    body:JSON.stringify(payload)
   });

   const data=await res.json();

   if(!res.ok){
    throw new Error(data.message||`Failed to ${isEdit?"update":"create"} library item`);
   }

   setSuccess(`Library item ${isEdit?"updated":"created"} successfully`);

   if(!isEdit){
    setForm({
     user:"",
     study:"",
     method:"",
     title:"",
     subtitle:"",
     type:"",
     reference:"",
     content:"",
     source:"",
     category:"",
     status:"",
     tags:"",
     notes:"",
     featured:false,
     active:true
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
     <h2 className="mb-3">{isEdit?"Edit Library Item":"Create Library Item"}</h2>

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
         <Form.Select name="study" value={form.study} onChange={handleChange}>
          <option value="">None</option>
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
         <Form.Label>Type</Form.Label>
         <Form.Select name="type" value={form.type} onChange={handleChange}>
          <option value="">Select type</option>
          {types.map(t=>(
           <option key={t._id} value={t._id}>{t.title}</option>
          ))}
         </Form.Select>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Category</Form.Label>
         <Form.Select name="category" value={form.category} onChange={handleChange}>
          <option value="">Select category</option>
          {categories.map(c=>(
           <option key={c._id} value={c._id}>{c.title}</option>
          ))}
         </Form.Select>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Status</Form.Label>
         <Form.Select name="status" value={form.status} onChange={handleChange}>
          <option value="">Select status</option>
          {statuses.map(s=>(
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
         <Form.Label>Subtitle</Form.Label>
         <Form.Control name="subtitle" value={form.subtitle} onChange={handleChange}/>
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
         <Form.Label>Source</Form.Label>
         <Form.Control name="source" value={form.source} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={12}>
        <Form.Group>
         <Form.Label>Content</Form.Label>
         <Form.Control as="textarea" rows={4} name="content" value={form.content} onChange={handleChange}/>
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
         {loading?(isEdit?"Updating...":"Saving..."):(isEdit?"Update Library Item":"Create Library Item")}
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

export default LibraryItemForm;