import {useEffect,useState} from "react";
import axios from "axios";
import {Alert,Button,Form,Spinner} from "react-bootstrap";
import "../../styles/ResourceForm.css";

const blankItem={title:"",url:"",description:"",source:"",resourceType:"link",notes:"",file:null};
const blankForm={title:"",description:"",topic:"",category:"",status:"active",entryMode:"upload",item:blankItem};
const slugify=value=>String(value||"").trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");

function ResourceForm({mode="add",currentUser,initialData,onSuccess,onCancel}){
 const[formData,setFormData]=useState(blankForm);
 const[categories,setCategories]=useState([]);
 const[showNewCategory,setShowNewCategory]=useState(false);
 const[newCategory,setNewCategory]=useState({name:"",description:""});
 const[savingCategory,setSavingCategory]=useState(false);
 const[saving,setSaving]=useState(false);
 const[loading,setLoading]=useState(true);
 const[error,setError]=useState("");

 const loadCategories=async()=>{
  const response=await axios.get("/api/resource-categories");
  setCategories(Array.isArray(response.data)?response.data:response.data?.categories||[]);
 };

 useEffect(()=>{
  loadCategories().catch(err=>setError(err.response?.data?.message||"Failed to load resource categories.")).finally(()=>setLoading(false));
 },[]);

 useEffect(()=>{
  if(mode==="edit"&&initialData?._id){
   const item=initialData.links?.[0]||blankItem;
   setFormData({
    title:initialData.title||"",
    description:initialData.description||"",
    topic:initialData.topic||"",
    category:initialData.category?._id||initialData.category||"",
    status:initialData.status||"active",
    entryMode:item.url?.startsWith("/images/resources/")?"upload":"link",
    item:{
     title:item.title||"",
     url:item.url||"",
     description:item.description||"",
     source:item.source||"",
     resourceType:item.resourceType||"link",
     notes:item.notes||"",
     file:null
    }
   });
  }else{
   setFormData({...blankForm,item:{...blankItem}});
  }
 },[mode,initialData]);

 const changeMain=event=>setFormData(current=>({...current,[event.target.name]:event.target.value}));
 const changeItem=event=>setFormData(current=>({...current,item:{...current.item,[event.target.name]:event.target.value}}));
 const changeMode=entryMode=>setFormData(current=>({
  ...current,
  entryMode,
  item:{...current.item,url:entryMode==="upload"&&current.item.url&&!current.item.url.startsWith("/images/resources/")?"":current.item.url,resourceType:entryMode==="link"?"link":current.item.resourceType==="link"?"file":current.item.resourceType}
 }));
 const chooseFile=event=>{
  const file=event.target.files?.[0]||null;
  setFormData(current=>({...current,item:{...current.item,file,title:current.item.title||file?.name||"",resourceType:current.item.resourceType==="link"?"file":current.item.resourceType}}));
 };

 const saveCategory=async()=>{
  if(!newCategory.name.trim())return;
  try{
   setSavingCategory(true);
   setError("");
   const response=await axios.post("/api/resource-categories",{
    name:newCategory.name.trim(),
    description:newCategory.description.trim(),
    slug:slugify(newCategory.name),
    status:"active",
    createdBy:currentUser?._id||""
   });
   await loadCategories();
   setFormData(current=>({...current,category:response.data?._id||""}));
   setNewCategory({name:"",description:""});
   setShowNewCategory(false);
  }catch(err){
   setError(err.response?.data?.message||err.message||"Failed to create category.");
  }finally{
   setSavingCategory(false);
  }
 };

 const uploadFile=async item=>{
  if(!item.file)return item;
  const uploadData=new FormData();
  uploadData.append("file",item.file);
  const response=await axios.post("/api/upload/resources",uploadData,{headers:{"Content-Type":"multipart/form-data"}});
  return{...item,url:response.data?.url||`/images/resources/${response.data?.filename||item.file.name}`,source:item.source||"Local resource library",file:null};
 };

 const handleSubmit=async event=>{
  event.preventDefault();
  try{
   setSaving(true);
   setError("");
   if(formData.entryMode==="upload"&&!formData.item.file&&!formData.item.url.startsWith("/images/resources/")){
    throw new Error("Choose a file from your computer.");
   }
   if(formData.entryMode==="link"&&!formData.item.url.trim())throw new Error("Enter the resource web address.");
   const savedItem=await uploadFile(formData.item);
   const normalizedItem={
    title:savedItem.title||formData.title,
    url:savedItem.url,
    description:savedItem.description,
    source:savedItem.source,
    resourceType:savedItem.resourceType,
    category:formData.category||null,
    notes:savedItem.notes
   };
   const remainingLinks=mode==="edit"&&initialData?.links?.length>1?initialData.links.slice(1):[];
   const payload={
    title:formData.title,
    description:formData.description,
    topic:formData.topic,
    category:formData.category||null,
    status:formData.status,
    createdBy:currentUser?._id||initialData?.createdBy?._id||initialData?.createdBy||"",
    links:[normalizedItem,...remainingLinks]
   };
   if(mode==="edit"&&initialData?._id)await axios.put(`/api/resources/${initialData._id}`,payload);
   else await axios.post("/api/resources",payload);
   onSuccess?.();
  }catch(err){
   setError(err.response?.data?.message||err.message||"Failed to save resource.");
  }finally{
   setSaving(false);
  }
 };

 if(loading)return <div className="py-5 text-center"><Spinner animation="border"/></div>;

 return(
  <Form onSubmit={handleSubmit} className="resource-catalog-form">
   {error?<Alert variant="danger">{error}</Alert>:null}

   <section className="resource-form-section">
    <h5>Catalog Information</h5>
    <div className="resource-form-grid">
     <div className="resource-inline-row"><Form.Label>Resource Title:</Form.Label><Form.Control name="title" value={formData.title} onChange={changeMain} required/></div>
     <div className="resource-inline-row category-row">
      <Form.Label>Category:</Form.Label>
      <Form.Select name="category" value={formData.category} onChange={changeMain}><option value="">Select category</option>{categories.map(item=><option key={item._id} value={item._id}>{item.name}</option>)}</Form.Select>
      <Button type="button" variant="outline-dark" size="sm" onClick={()=>setShowNewCategory(value=>!value)}>New Category</Button>
     </div>
     <div className="resource-inline-row"><Form.Label>Topic:</Form.Label><Form.Control name="topic" value={formData.topic} onChange={changeMain}/></div>
     <div className="resource-inline-row"><Form.Label>Status:</Form.Label><Form.Select name="status" value={formData.status} onChange={changeMain}><option value="active">Active</option><option value="archived">Archived</option></Form.Select></div>
     <div className="resource-inline-row resource-wide-row"><Form.Label>Description:</Form.Label><Form.Control as="textarea" rows={2} name="description" value={formData.description} onChange={changeMain}/></div>
    </div>

    {showNewCategory?(
     <div className="new-category-row">
      <Form.Label>New Category:</Form.Label>
      <Form.Control value={newCategory.name} onChange={event=>setNewCategory(current=>({...current,name:event.target.value}))} placeholder="Category name"/>
      <Form.Control value={newCategory.description} onChange={event=>setNewCategory(current=>({...current,description:event.target.value}))} placeholder="Short description"/>
      <Button type="button" variant="dark" onClick={saveCategory} disabled={savingCategory}>{savingCategory?"Saving…":"Save Category"}</Button>
     </div>
    ):null}
   </section>

   <section className="resource-form-section">
    <div className="resource-section-heading">
     <h5>Resource Location</h5>
     <div className="resource-entry-tabs">
      <button type="button" className={formData.entryMode==="upload"?"active":""} onClick={()=>changeMode("upload")}>Upload File</button>
      <button type="button" className={formData.entryMode==="link"?"active":""} onClick={()=>changeMode("link")}>Web Link</button>
     </div>
    </div>

    <div className="resource-form-grid">
     {formData.entryMode==="upload"?(
      <div className="resource-inline-row resource-wide-row"><Form.Label>Local File:</Form.Label><Form.Control type="file" onChange={chooseFile}/>{formData.item.url?.startsWith("/images/resources/")?<a href={formData.item.url} target="_blank" rel="noreferrer">Open saved file</a>:null}</div>
     ):(
      <div className="resource-inline-row resource-wide-row"><Form.Label>Web Address:</Form.Label><Form.Control name="url" value={formData.item.url} onChange={changeItem} placeholder="https://..."/></div>
     )}
     <div className="resource-inline-row"><Form.Label>Display Title:</Form.Label><Form.Control name="title" value={formData.item.title} onChange={changeItem}/></div>
     <div className="resource-inline-row"><Form.Label>Resource Type:</Form.Label><Form.Select name="resourceType" value={formData.item.resourceType} onChange={changeItem}><option value="link">Link</option><option value="file">Downloadable File</option><option value="ebook">Ebook</option><option value="pdf">PDF</option><option value="video">Video</option><option value="article">Article</option><option value="website">Website</option><option value="form">Form</option><option value="guide">Guide</option><option value="other">Other</option></Form.Select></div>
     <div className="resource-inline-row"><Form.Label>Source:</Form.Label><Form.Control name="source" value={formData.item.source} onChange={changeItem}/></div>
     <div className="resource-inline-row resource-wide-row"><Form.Label>Resource Notes:</Form.Label><Form.Control as="textarea" rows={2} name="notes" value={formData.item.notes} onChange={changeItem}/></div>
    </div>
   </section>

   <div className="resource-form-actions"><Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button><Button type="submit" variant="dark" disabled={saving}>{saving?"Saving…":mode==="edit"?"Update Resource":"Save Resource"}</Button></div>
  </Form>
 );
}

export default ResourceForm;
