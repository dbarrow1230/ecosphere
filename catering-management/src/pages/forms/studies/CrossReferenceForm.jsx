// src/pages/forms/studies/CrossReferenceForm.jsx
import {useState,useEffect} from "react";
import {Form,Button,Card,Row,Col,Alert,Spinner} from "react-bootstrap";
import {useNavigate,useParams} from "react-router-dom";

function CrossReferenceForm(){

 const navigate=useNavigate();
 const {id}=useParams();
 const isEdit=Boolean(id);

 const [form,setForm]=useState({
  user:"",
  study:"",
  fromReference:"",
  toReference:"",
  theme:"",
  note:"",
  strength:0,
  tags:"",
  active:true
 });

 const [users,setUsers]=useState([]);
 const [studies,setStudies]=useState([]);
 const [categories,setCategories]=useState([]);

 const [loading,setLoading]=useState(false);
 const [loadingData,setLoadingData]=useState(true);
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");

 useEffect(()=>{
  let isMounted=true;

  const getDataArray=(data)=>Array.isArray(data)?data:(data?.data||[]);

  const loadData=async()=>{
   try{
    setLoadingData(true);
    setError("");

    const requests=[
     fetch("/api/users"),
     fetch("/api/studies"),
     fetch("/api/lookups/study-categories")
    ];

    if(isEdit){
     requests.push(fetch(`/api/studies/cross-references/${id}`));
    }

    const responses=await Promise.all(requests);

    const failedResponse=responses.find(res=>!res.ok);
    if(failedResponse){
      throw new Error("Failed to load form data");
    }

    const results=await Promise.all(responses.map(res=>res.json()));

    if(!isMounted)return;

    setUsers(getDataArray(results[0]));
    setStudies(getDataArray(results[1]));
    setCategories(getDataArray(results[2]));

    if(isEdit){
     const item=results[3]?.data||results[3];

     setForm({
      user:item?.user?._id||item?.user||"",
      study:item?.study?._id||item?.study||"",
      fromReference:item?.fromReference||"",
      toReference:item?.toReference||"",
      theme:item?.theme?._id||item?.theme||"",
      note:item?.note||"",
      strength:item?.strength??0,
      tags:Array.isArray(item?.tags)?item.tags.join(", "):"",
      active:item?.active??true
     });
    }
   }
   catch(err){
    if(!isMounted)return;
    setError(err.message||"Failed to load form data");
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
    theme:form.theme||null,
    strength:Number(form.strength)||0,
    tags:form.tags.split(",").map(tag=>tag.trim()).filter(Boolean)
   };

   const res=await fetch(isEdit?`/api/studies/cross-references/${id}`:"/api/studies/cross-references",{
    method:isEdit?"PUT":"POST",
    headers:{
     "Content-Type":"application/json"
    },
    body:JSON.stringify(payload)
   });

   const data=await res.json();

   if(!res.ok){
    throw new Error(data.message||`Failed to ${isEdit?"update":"create"} cross reference`);
   }

   setSuccess(`Cross reference ${isEdit?"updated":"created"} successfully`);

   if(!isEdit){
    setForm({
     user:"",
     study:"",
     fromReference:"",
     toReference:"",
     theme:"",
     note:"",
     strength:0,
     tags:"",
     active:true
    });
   }

   setTimeout(()=>{
    navigate("/dashboard");
   },800);
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
     <h2 className="mb-3">{isEdit?"Edit Cross Reference":"Create Cross Reference"}</h2>

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
         <Form.Label>Study (optional)</Form.Label>
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
         <Form.Label>From Reference</Form.Label>
         <Form.Control name="fromReference" value={form.fromReference} onChange={handleChange} placeholder="e.g. Romans 8:1" required/>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>To Reference</Form.Label>
         <Form.Control name="toReference" value={form.toReference} onChange={handleChange} placeholder="e.g. John 3:16" required/>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Theme</Form.Label>
         <Form.Select name="theme" value={form.theme} onChange={handleChange}>
          <option value="">Select category</option>
          {categories.map((c)=>(
           <option key={c._id} value={c._id}>{c.title}</option>
          ))}
         </Form.Select>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Strength (0–100)</Form.Label>
         <Form.Control type="number" name="strength" value={form.strength} onChange={handleChange} min={0} max={100}/>
        </Form.Group>
       </Col>

       <Col md={12}>
        <Form.Group>
         <Form.Label>Note</Form.Label>
         <Form.Control as="textarea" rows={3} name="note" value={form.note} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={12}>
        <Form.Group>
         <Form.Label>Tags (comma separated)</Form.Label>
         <Form.Control name="tags" value={form.tags} onChange={handleChange} placeholder="faith, grace, salvation"/>
        </Form.Group>
       </Col>

       <Col md={12}>
        <Form.Check type="checkbox" label="Active" name="active" checked={form.active} onChange={handleChange}/>
       </Col>

       <Col md={12} className="d-flex gap-2">
        <Button type="submit" disabled={loading}>
         {loading?(isEdit?"Updating...":"Saving..."):(isEdit?"Update Cross Reference":"Create Cross Reference")}
        </Button>
        <Button type="button" variant="secondary" onClick={()=>navigate("/dashboard")}>Cancel</Button>
       </Col>

      </Row>
     </Form>
    </Card.Body>
   </Card>
  </div>
 );
}

export default CrossReferenceForm;