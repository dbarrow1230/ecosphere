// src/pages/forms/lookups/TranslationForm.jsx
import {useMemo,useState,useEffect} from "react";
import {Form,Button,Row,Col,Alert,Spinner} from "react-bootstrap";
import {useNavigate,useParams} from "react-router-dom";

function TranslationForm({id:propId="",onSuccess,onClose,embedded=false}){

 const navigate=useNavigate();
 const params=useParams();
 const routeId=params.id||"";
 const id=propId||routeId;
 const isEdit=Boolean(id);

 const initialForm=useMemo(()=>({
  title:"",
  slug:"",
  abbreviation:"",
  description:"",
  language:"English",
  type:"Actual Translation",
  copyright:"",
  source:"",
  active:true,
  sortOrder:""
 }),[]);

 const [form,setForm]=useState(initialForm);
 const [loading,setLoading]=useState(false);
 const [loadingData,setLoadingData]=useState(false);
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");

 useEffect(()=>{
  let isMounted=true;

  const loadNextSortOrder=async()=>{
   try{
    setLoadingData(true);
    setError("");
    setSuccess("");

    const res=await fetch("/api/lookups/translations/next-sort");
    const data=await res.json();

    if(!res.ok){
     throw new Error(data.message||"Failed to load next sort order");
    }

    if(!isMounted)return;

    setForm(prev=>({
     ...initialForm,
     ...prev,
     sortOrder:data.data?.sortOrder??""
    }));
   }
   catch(err){
    if(!isMounted)return;
    setError(err.message);
    setForm(initialForm);
   }
   finally{
    if(isMounted)setLoadingData(false);
   }
  };

  const loadItem=async()=>{
   try{
    setLoadingData(true);
    setError("");
    setSuccess("");

    const res=await fetch(`/api/lookups/translations/${id}`);
    const data=await res.json();

    if(!res.ok){
     throw new Error(data.message||"Failed to load translation");
    }

    if(!isMounted)return;

    const item=data.data||{};

    setForm({
     title:item.title||"",
     slug:item.slug||"",
     abbreviation:item.abbreviation||"",
     description:item.description||"",
     language:item.language||"English",
     type:item.type||"",
     copyright:item.copyright||"",
     source:item.source||"",
     active:item.active??true,
     sortOrder:item.sortOrder??""
    });
   }
   catch(err){
    if(!isMounted)return;
    setError(err.message);
   }
   finally{
    if(isMounted)setLoadingData(false);
   }
  };

  if(isEdit)loadItem();
  else loadNextSortOrder();

  return()=>{isMounted=false;};
 },[id,isEdit,initialForm]);

 const handleChange=(e)=>{
  const {name,value,type,checked}=e.target;

  setForm(prev=>({
   ...prev,
   [name]:type==="checkbox"?checked:value
  }));
 };

 const generateSlug=(value)=>{
  return value
   .toLowerCase()
   .replace(/[^a-z0-9\s-]/g,"")
   .trim()
   .replace(/\s+/g,"-");
 };

 const handleTitleChange=(e)=>{
  const value=e.target.value;

  setForm(prev=>({
   ...prev,
   title:value,
   slug:generateSlug(value)
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
    abbreviation:(form.abbreviation||"").toUpperCase()
   };

   if(form.sortOrder!==""&&form.sortOrder!==null&&form.sortOrder!==undefined){
    payload.sortOrder=Number(form.sortOrder)||0;
   }else{
    delete payload.sortOrder;
   }

   const res=await fetch(isEdit?`/api/lookups/translations/${id}`:"/api/lookups/translations",{
    method:isEdit?"PUT":"POST",
    headers:{
     "Content-Type":"application/json"
    },
    body:JSON.stringify(payload)
   });

   const data=await res.json();

   if(!res.ok){
    throw new Error(data.message||`Failed to ${isEdit?"update":"create"} translation`);
   }

   setSuccess(`Translation ${isEdit?"updated":"created"} successfully`);

   if(typeof onSuccess==="function"){
    onSuccess(data.data||null);
   }

   if(embedded){
    return;
   }

   if(!isEdit){
    setForm(initialForm);
   }
   else{
    setTimeout(()=>{
     navigate("/lookups/translations");
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
   <div className="py-4 text-center">
    <Spinner animation="border"/>
   </div>
  );
 }

 return(
  <Form onSubmit={handleSubmit}>
   {error?<Alert variant="danger" className="mb-3">{error}</Alert>:null}
   {success?<Alert variant="success" className="mb-3">{success}</Alert>:null}

   <Row className="g-3">

    <Col md={6}>
     <Form.Group>
      <Form.Label>Title</Form.Label>
      <Form.Control name="title" value={form.title} onChange={handleTitleChange} required/>
     </Form.Group>
    </Col>

    <Col md={6}>
     <Form.Group>
      <Form.Label>Slug</Form.Label>
      <Form.Control name="slug" value={form.slug} onChange={handleChange} required/>
     </Form.Group>
    </Col>

    <Col md={4}>
     <Form.Group>
      <Form.Label>Abbreviation</Form.Label>
      <Form.Control name="abbreviation" value={form.abbreviation} onChange={handleChange} required/>
     </Form.Group>
    </Col>

    <Col md={4}>
     <Form.Group>
      <Form.Label>Language</Form.Label>
      <Form.Control name="language" value={form.language} onChange={handleChange}/>
     </Form.Group>
    </Col>

    <Col md={4}>
     <Form.Group>
      <Form.Label>Sort Order</Form.Label>
      <Form.Control type="number" name="sortOrder" value={form.sortOrder} onChange={handleChange}/>
     </Form.Group>
    </Col>

    <Col md={6}>
     <Form.Group>
      <Form.Label>Type</Form.Label>
      <Form.Select name="type" value={form.type} onChange={handleChange} required>
       <option value="Actual Translation">Actual Translation</option>
       <option value="Transliteration">Transliteration</option>
       <option value="Original Language Text">Original Language Text</option>
       <option value="Paraphrase">Paraphrase</option>
      </Form.Select>
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
      <Form.Label>Description</Form.Label>
      <Form.Control as="textarea" rows={3} name="description" value={form.description} onChange={handleChange}/>
     </Form.Group>
    </Col>

    <Col md={12}>
     <Form.Group>
      <Form.Label>Copyright</Form.Label>
      <Form.Control name="copyright" value={form.copyright} onChange={handleChange}/>
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

    <Col md={12} className="d-flex gap-2">
     <Button type="submit" disabled={loading}>
      {loading?(isEdit?"Updating...":"Saving..."):(isEdit?"Update Translation":"Create Translation")}
     </Button>
     {(embedded||isEdit)?<Button type="button" variant="secondary" onClick={()=>{
      if(typeof onClose==="function"){
       onClose();
       return;
      }
      navigate("/lookups/translations");
     }}>Cancel</Button>:null}
    </Col>

   </Row>
  </Form>
 );
}

export default TranslationForm;
