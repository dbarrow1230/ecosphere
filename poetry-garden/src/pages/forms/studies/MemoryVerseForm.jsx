import {useState,useEffect} from "react";
import {Form,Button,Card,Row,Col,Alert,Spinner} from "react-bootstrap";
import {useNavigate,useParams} from "react-router-dom";

function MemoryVerseForm(){

 const navigate=useNavigate();
 const {id}=useParams();
 const isEdit=Boolean(id);

 const [form,setForm]=useState({
  user:"",
  study:"",
  reference:"",
  book:"",
  chapter:"",
  verseStart:"",
  verseEnd:"",
  text:"",
  translation:"",
  status:"",
  memorized:false,
  reviewLevel:0,
  lastReviewedAt:"",
  nextReviewAt:"",
  notes:"",
  tags:""
 });

 const [users,setUsers]=useState([]);
 const [studies,setStudies]=useState([]);
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
     fetch("/api/lookups/statuses")
    ];

    if(isEdit){
     requests.push(fetch(`/api/studies/memory-verses/${id}`));
    }

    const [
     usersRes,
     studiesRes,
     statusesRes,
     itemRes
    ]=await Promise.all(requests);

    const [
     usersData,
     studiesData,
     statusesData,
     itemData
    ]=await Promise.all([
     usersRes.json(),
     studiesRes.json(),
     statusesRes.json(),
     itemRes?itemRes.json():Promise.resolve(null)
    ]);

    if(!isMounted)return;

    setUsers(usersData.data||[]);
    setStudies(studiesData.data||[]);
    setStatuses(statusesData.data||[]);

    if(isEdit&&itemData?.data){
     const item=itemData.data;

     setForm({
      user:item.user?._id||item.user||"",
      study:item.study?._id||item.study||"",
      reference:item.reference||"",
      book:item.book||"",
      chapter:item.chapter??"",
      verseStart:item.verseStart??"",
      verseEnd:item.verseEnd??"",
      text:item.text||"",
      translation:item.translation||"",
      status:item.status?._id||item.status||"",
      memorized:Boolean(item.memorized),
      reviewLevel:item.reviewLevel??0,
      lastReviewedAt:formatDateTimeLocal(item.lastReviewedAt),
      nextReviewAt:formatDateTimeLocal(item.nextReviewAt),
      notes:item.notes||"",
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
    chapter:form.chapter===""?null:Number(form.chapter),
    verseStart:form.verseStart===""?null:Number(form.verseStart),
    verseEnd:form.verseEnd===""?null:Number(form.verseEnd),
    status:form.status||null,
    reviewLevel:Number(form.reviewLevel)||0,
    lastReviewedAt:form.lastReviewedAt||null,
    nextReviewAt:form.nextReviewAt||null,
    tags:form.tags.split(",").map((tag)=>tag.trim()).filter(Boolean)
   };

   const res=await fetch(isEdit?`/api/studies/memory-verses/${id}`:"/api/studies/memory-verses",{
    method:isEdit?"PUT":"POST",
    headers:{
     "Content-Type":"application/json"
    },
    body:JSON.stringify(payload)
   });

   const data=await res.json();

   if(!res.ok){
    throw new Error(data.message||`Failed to ${isEdit?"update":"create"} memory verse`);
   }

   setSuccess(`Memory verse ${isEdit?"updated":"created"} successfully`);

   if(!isEdit){
    setForm({
     user:"",
     study:"",
     reference:"",
     book:"",
     chapter:"",
     verseStart:"",
     verseEnd:"",
     text:"",
     translation:"",
     status:"",
     memorized:false,
     reviewLevel:0,
     lastReviewedAt:"",
     nextReviewAt:"",
     notes:"",
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
     <h2 className="mb-3">{isEdit?"Edit Memory Verse":"Create Memory Verse"}</h2>

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
         <Form.Label>Reference</Form.Label>
         <Form.Control name="reference" value={form.reference} onChange={handleChange} required/>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Book</Form.Label>
         <Form.Control name="book" value={form.book} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={4}>
        <Form.Group>
         <Form.Label>Chapter</Form.Label>
         <Form.Control type="number" name="chapter" value={form.chapter} onChange={handleChange} min={1}/>
        </Form.Group>
       </Col>

       <Col md={4}>
        <Form.Group>
         <Form.Label>Verse Start</Form.Label>
         <Form.Control type="number" name="verseStart" value={form.verseStart} onChange={handleChange} min={1}/>
        </Form.Group>
       </Col>

       <Col md={4}>
        <Form.Group>
         <Form.Label>Verse End</Form.Label>
         <Form.Control type="number" name="verseEnd" value={form.verseEnd} onChange={handleChange} min={1}/>
        </Form.Group>
       </Col>

       <Col md={12}>
        <Form.Group>
         <Form.Label>Text</Form.Label>
         <Form.Control as="textarea" rows={4} name="text" value={form.text} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Translation</Form.Label>
         <Form.Control name="translation" value={form.translation} onChange={handleChange}/>
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
         <Form.Label>Review Level</Form.Label>
         <Form.Control type="number" name="reviewLevel" value={form.reviewLevel} onChange={handleChange} min={0}/>
        </Form.Group>
       </Col>

       <Col md={6} className="d-flex align-items-end">
        <Form.Check type="checkbox" label="Memorized" name="memorized" checked={form.memorized} onChange={handleChange}/>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Last Reviewed At</Form.Label>
         <Form.Control type="datetime-local" name="lastReviewedAt" value={form.lastReviewedAt} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Next Review At</Form.Label>
         <Form.Control type="datetime-local" name="nextReviewAt" value={form.nextReviewAt} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={12}>
        <Form.Group>
         <Form.Label>Notes</Form.Label>
         <Form.Control as="textarea" rows={3} name="notes" value={form.notes} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={12}>
        <Form.Group>
         <Form.Label>Tags</Form.Label>
         <Form.Control name="tags" value={form.tags} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={12} className="d-flex gap-2">
        <Button type="submit" disabled={loading}>
         {loading?(isEdit?"Updating...":"Saving..."):(isEdit?"Update Memory Verse":"Create Memory Verse")}
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

export default MemoryVerseForm;