// src/pages/forms/ProductForm.jsx
import {useEffect,useMemo,useState} from "react";
import {Modal,Button,Form,Row,Col,Spinner,Tabs,Tab} from "react-bootstrap";
import Barcode from "react-barcode";
import Alert from "../../components/PopupAlert.jsx";
import {parseProductDetails,applyProductDetailsEdits} from "../../../shared/parseProductDetails.js";
import {makeSku,buildBarcodeData} from "../../../shared/productIdentifiers.js";
import {groupProductSections} from "../../utils/groupProductSections.js";
import "../../styles/ProductForm.css";
import "../../styles/ProductDetails.css";

const initialForm={
 name:"",
 slug:"",
 description:"",
 shortDescription:"",
 category:"",
 price:"0",
 compareAtPrice:"",
 cost:"",
 costingRef:"",
 priceFromCosting:false,
 markupPercent:"",
 quantity:0,
 image:"",
 gallery:"",
 featured:false,
 notes:"",
 status:"",
 detailsText:""
};

const makeSlug=name=>String(name||"").trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const normalizeDetails=details=>{
 if(!details?.rawText)return null;
 try{return details.sections?.length?applyProductDetailsEdits(details.rawText,details.sections):parseProductDetails(details.rawText);}
 catch{return parseProductDetails(details.rawText);}
};

function ProductForm({show,onHide,editingProduct,onSuccess}){
 const[formData,setFormData]=useState(initialForm);
 const[categories,setCategories]=useState([]);
 const[categoryDraft,setCategoryDraft]=useState("");
 const[creatingCategory,setCreatingCategory]=useState(false);
 const[statuses,setStatuses]=useState([]);
 const[costings,setCostings]=useState([]);
 const[referenceLoading,setReferenceLoading]=useState(false);
 const[loading,setLoading]=useState(false);
 const[message,setMessage]=useState("");
 const[parsedDetails,setParsedDetails]=useState(null);
 const[parsing,setParsing]=useState(false);
 const[activeTab,setActiveTab]=useState("paste");
 const[savedDetails,setSavedDetails]=useState(null);

 useEffect(()=>{
  if(show){
   fetchCategories();
  }
 },[show]);

 useEffect(()=>{
  if(editingProduct){
   setFormData({
    name:editingProduct.name||"",
    slug:editingProduct.slug||"",
    description:editingProduct.description||"",
    shortDescription:editingProduct.shortDescription||"",
    category:editingProduct.category?._id||editingProduct.category||"",
    price:editingProduct.price||"0",
    compareAtPrice:editingProduct.compareAtPrice||"",
    cost:editingProduct.cost||"",
    costingRef:editingProduct.costingRef?._id||editingProduct.costingRef||"",
    priceFromCosting:Boolean(editingProduct.priceFromCosting),
    markupPercent:editingProduct.markupPercent||"",
    quantity:editingProduct.quantity||0,
    image:Array.isArray(editingProduct.image)?editingProduct.image.join("\n"):editingProduct.image||"",
    gallery:Array.isArray(editingProduct.gallery)?editingProduct.gallery.join(", "):"",
    featured:Boolean(editingProduct.featured),
    notes:Array.isArray(editingProduct.notes)?editingProduct.notes.join(", "):"",
    status:editingProduct.status?._id||(typeof editingProduct.status==="string"?editingProduct.status:""),
    detailsText:editingProduct.details?.rawText||""
   });
   setParsedDetails(normalizeDetails(editingProduct.details));
   setSavedDetails(normalizeDetails(editingProduct.details));
   setActiveTab(editingProduct.details?.rawText?"overview":"product");
   setMessage("");
   setCategoryDraft("");
  }else{
   setFormData(initialForm);
   setParsedDetails(null);
   setSavedDetails(null);
   setActiveTab("paste");
   setMessage("");
   setCategoryDraft("");
  }
 },[editingProduct,show]);

 useEffect(()=>{
  if(!show||!editingProduct?._id)return;
  let active=true;
  fetch(`/api/products/${editingProduct._id}`).then(res=>res.json()).then(data=>{
   if(active&&data.success)setSavedDetails(normalizeDetails(data.product?.details));
  }).catch(()=>{});
  return()=>{active=false;};
 },[show,editingProduct?._id]);

 const submitLabel=useMemo(()=>editingProduct?"Update Product":"Add Product",[editingProduct]);
 const imagePreview=useMemo(()=>String(formData.image||"").split(/\r?\n/).map(item=>item.trim()).filter(Boolean)[0]||"",[formData.image]);

 // SKU and barcode always follow the name and current price.
 const effectivePrice=formData.priceFromCosting?(Number(formData.cost||0)*(1+Number(formData.markupPercent||0)/100)).toFixed(2):formData.price;
 const generatedSku=useMemo(()=>makeSku(formData.name,effectivePrice),[formData.name,effectivePrice]);
 const generatedBarcode=useMemo(()=>buildBarcodeData(formData.name,effectivePrice),[formData.name,effectivePrice]);
 const parsedDirty=!!editingProduct&&!!parsedDetails&&JSON.stringify(parsedDetails.sections)!==JSON.stringify(savedDetails?.sections);
 const parsedGroups=useMemo(()=>groupProductSections(parsedDetails?.sections?.map((section,index)=>({...section,sectionIndex:index})),{includeEmpty:true}),[parsedDetails]);

 const fetchCategories=async()=>{
  setReferenceLoading(true);
  try{
   const [categoryRes,statusRes]=await Promise.all([fetch("/api/reference/categories"),fetch("/api/reference/statuses")]);
   const [categoryData,statusData]=await Promise.all([categoryRes.json(),statusRes.json()]);
   if(!categoryRes.ok||!categoryData.success)throw new Error(categoryData.message||"Unable to load categories");
   if(!statusRes.ok||!statusData.success)throw new Error(statusData.message||"Unable to load statuses");
   setCategories(categoryData.categories||[]);
   setStatuses(statusData.statuses||[]);
   fetch("/api/costings").then(res=>res.json()).then(data=>setCostings(data.success?data.costings||[]:[])).catch(()=>setCostings([]));
   if(!statusData.statuses?.length)setMessage("A status must be configured before saving a product.");
   if(!editingProduct){
    const defaultStatus=statusData.statuses?.find(item=>item.isDefault)||statusData.statuses?.find(item=>item.code==="active");
    if(defaultStatus)setFormData(prev=>({...prev,status:prev.status||defaultStatus._id}));
   }else{
    const legacyCode=typeof editingProduct.status==="string"?editingProduct.status:editingProduct.status?.code;
    const matched=statusData.statuses?.find(item=>item.code===legacyCode||item.name===legacyCode);
    if(matched)setFormData(prev=>({...prev,status:matched._id}));
   }
  }catch(error){setMessage(error.message);}
  finally{setReferenceLoading(false);}
 };

 const handleChange=e=>{
  const{name,value,type,checked}=e.target;
  if(name==="category")setCategoryDraft("");
  if(name==="costingRef"){
   const selected=costings.find(item=>item._id===value);
   setFormData(prev=>({
    ...prev,costingRef:value,
    cost:selected?.unitCost||prev.cost,
    price:selected?.suggestedPrice||prev.price,
    priceFromCosting:selected?.suggestedPrice?false:prev.priceFromCosting
   }));
   return;
  }
  setFormData(prev=>name==="name"?{
   ...prev,name:value,
   slug:!prev.slug||prev.slug===makeSlug(prev.name)?makeSlug(value):prev.slug
  }:{...prev,[name]:type==="checkbox"?checked:value});
  if(name==="detailsText")setParsedDetails(null);
  const sectionTitle={name:"Name",description:"Description",shortDescription:"Introduction"}[name];
  if(sectionTitle&&parsedDetails?.sections?.some(section=>section.title===sectionTitle)){
   const edits=parsedDetails.sections.map(section=>({title:section.title,content:section.title===sectionTitle?value:section.content}));
   setParsedDetails(applyProductDetailsEdits(formData.detailsText,edits));
  }
 };

 const handleParsedFieldChange=(index,value)=>{
  if(!parsedDetails)return;
  const edits=parsedDetails.sections.map((section,sectionIndex)=>({title:section.title,content:sectionIndex===index?value:section.content}));
  const next=applyProductDetailsEdits(formData.detailsText,edits);
  setParsedDetails(next);
  const title=parsedDetails.sections[index]?.title.toLowerCase();
  if(title==="name")setFormData(prev=>({...prev,name:value,slug:makeSlug(value)}));
  if(title==="description")setFormData(prev=>({...prev,description:value}));
  if(title==="introduction")setFormData(prev=>({...prev,shortDescription:value.slice(0,250)}));
  if(title==="category"){
   const categoryName=value.trim();
   const matched=categories.find(item=>item.name?.trim().toLowerCase()===categoryName.toLowerCase());
   setCategoryDraft(categoryName&&!matched?categoryName:"");
   setFormData(prev=>({...prev,category:categoryName?matched?._id||"":prev.category}));
  }
  if(title==="suggested price"&&next.suggestedPrice)setFormData(prev=>prev.priceFromCosting||prev.costingRef?prev:{...prev,price:next.suggestedPrice});
 };

 const handleDetailsFile=async e=>{
  const file=e.target.files?.[0];
  if(!file)return;
  if(!/\.txt$/i.test(file.name)&&file.type!=="text/plain"){
   setMessage("Choose a plain-text (.txt) file.");
   return;
  }
  try{
   const detailsText=await file.text();
   setFormData(prev=>({...prev,detailsText}));
   setParsedDetails(null);
   setMessage("");
  }catch{setMessage("Unable to read the selected text file.");}
  e.target.value="";
 };

 const handleParseDetails=()=>{
  setParsing(true);
  setMessage("");
  try{
   const details=parseProductDetails(formData.detailsText);
   if(!details.rawText.trim())throw new Error("Paste product details before parsing.");
   const categoryName=details.sections.find(section=>section.title.toLowerCase()==="category")?.content.trim()||"";
   const matchedCategory=categories.find(item=>item.name?.trim().toLowerCase()===categoryName.toLowerCase());
   setCategoryDraft(categoryName&&!matchedCategory?categoryName:"");
   setParsedDetails(details);
   setFormData(prev=>({
    ...prev,
    name:details.name||prev.name,
    slug:prev.slug||makeSlug(details.name||prev.name),
    description:details.description||prev.description,
    shortDescription:details.introduction?.slice(0,250)||prev.shortDescription,
    category:categoryName?matchedCategory?._id||"":prev.category,
    price:!prev.priceFromCosting&&!prev.costingRef&&details.suggestedPrice?details.suggestedPrice:prev.price
   }));
   setActiveTab("product");
  }catch(error){setMessage(error.message);}
  finally{setParsing(false);}
 };

 const handleCreateCategory=async()=>{
  const name=categoryDraft.trim();
  if(!name)return;
  const existing=categories.find(item=>item.name?.trim().toLowerCase()===name.toLowerCase());
  if(existing){
   setFormData(prev=>({...prev,category:existing._id}));
   setCategoryDraft("");
   return;
  }
  setCreatingCategory(true);
  setMessage("");
  try{
   const res=await fetch("/api/reference/categories",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({name})
   });
   const data=await res.json();
   if(!res.ok||!data?.success||!data.category?._id)throw new Error(data?.message||"Unable to create category.");
   setCategories(prev=>[...prev.filter(item=>item._id!==data.category._id),data.category].sort((a,b)=>a.name.localeCompare(b.name)));
   setFormData(prev=>({...prev,category:data.category._id}));
   setCategoryDraft("");
  }catch(error){setMessage(error.message||"Unable to create category.");}
  finally{setCreatingCategory(false);}
 };

 // Handles product image upload and thumbnail preview
 const handleImageUpload=e=>{
  const file=e.target.files?.[0];
  if(!file)return;

  if(!file.type.startsWith("image/")){
   setMessage("Please select a valid image file.");
   e.target.value="";
   return;
  }

  const reader=new FileReader();
  reader.onload=()=>{
   setFormData(prev=>({...prev,image:String(reader.result||"")}));
   setMessage("");
  };
  reader.onerror=()=>{
   setMessage("Unable to read the selected image.");
  };
  reader.readAsDataURL(file);
 };

 // Clears the selected product image
 const clearImage=()=>{
  setFormData(prev=>({...prev,image:""}));
  const input=document.getElementById("product-image-upload");
  if(input)input.value="";
 };

 const handleClose=()=>{
  if(loading)return;
  setMessage("");
  if(onHide)onHide();
 };

 const handleSubmit=async e=>{
  e.preventDefault();
  if(!formData.name.trim()||!formData.category||!formData.status){
   setMessage("Name, category, and status are required before saving.");
   setActiveTab("product");
   return;
  }
  setLoading(true);
  setMessage("");

  try{
   const payload={
    ...formData,
    detailsSections:parsedDetails?.rawText===formData.detailsText?parsedDetails.sections.map(section=>({title:section.title,content:section.content})):undefined,
    image:formData.image.split(/\r?\n/).map(item=>item.trim()).filter(Boolean),
    gallery:formData.gallery.split(",").map(item=>item.trim()).filter(Boolean),
    notes:formData.notes.split(",").map(item=>item.trim()).filter(Boolean),
    quantity:Number(formData.quantity||0)
   };

   const res=await fetch(editingProduct?`/api/products/${editingProduct._id}`:"/api/products",{
    method:editingProduct?"PUT":"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });

   const data=await res.json();

   if(!res.ok){
    setMessage(data?.message||"Request failed");
    setLoading(false);
    return;
   }

   if(onSuccess)onSuccess(data.product);
   setFormData(initialForm);
   setMessage("");
   if(onHide)onHide();
  }catch(error){
   setMessage("Something went wrong");
  }finally{
   setLoading(false);
  }
 };

 return(
  <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false} centered size="lg" scrollable dialogClassName="product-form-dialog">
   {message?<Alert variant="danger">{message}</Alert>:null}
   <Form onSubmit={handleSubmit} noValidate>
    <Modal.Header closeButton={!loading}>
     <Modal.Title>{submitLabel}</Modal.Title>
    </Modal.Header>

    <Modal.Body>
     <Tabs activeKey={activeTab} onSelect={key=>setActiveTab(key||"product")} className="mb-3 product-form-tabs">
      <Tab eventKey="paste" title="Paste & Parse">
       <p className="text-muted small">Paste the complete GPT product response or a two-column field table. Parsing fills the product fields and prepares every section for saving.</p>
       <Form.Group className="mb-3 product-details-input">
        <Form.Label>Product data</Form.Label>
        <Form.Control as="textarea" name="detailsText" value={formData.detailsText} onChange={handleChange} rows={16} placeholder="Paste the complete product text here, including tables, instructions, and references." />
        <Form.Text>The original text and parsed sections are both saved with the product.</Form.Text>
        <div className="d-flex flex-wrap gap-2 mt-2 align-items-center">
         <Button type="button" variant="primary" onClick={handleParseDetails} disabled={parsing||!formData.detailsText.trim()}>{parsing?"Parsing...":"Parse and fill product fields"}</Button>
         <Form.Control type="file" accept=".txt,text/plain" aria-label="Attach a text file of product details" onChange={handleDetailsFile} className="product-details-file" />
        </div>
       </Form.Group>
      </Tab>

      <Tab eventKey="product" title="Product">

     <Row>
      <Col md={6}>
       <Form.Group className="mb-3">
        <Form.Label>Name</Form.Label>
        <Form.Control name="name" value={formData.name} onChange={handleChange} />
       </Form.Group>
      </Col>

      <Col md={6}>
       <Form.Group className="mb-3">
        <Form.Label>Slug</Form.Label>
        <Form.Control name="slug" value={formData.slug} onChange={handleChange} />
       </Form.Group>
      </Col>
     </Row>

     <Row>
      <Col md={6}>
       <Form.Group className="mb-3">
        <Form.Label>Short Description</Form.Label>
        <Form.Control name="shortDescription" value={formData.shortDescription} onChange={handleChange} />
       </Form.Group>
      </Col>

      <Col md={6}>
       <Form.Group className="mb-3">
        <Form.Label>Category</Form.Label>
        <Form.Select name="category" value={formData.category} onChange={handleChange}>
         <option value="">Select category</option>
         {categories.map(item=><option key={item._id} value={item._id}>{item.name}</option>)}
        </Form.Select>
        <div className="product-category-create">
         <Form.Control value={categoryDraft} onChange={event=>setCategoryDraft(event.target.value)} aria-label="New category name" placeholder="New category name" />
         <Button type="button" onClick={handleCreateCategory} disabled={creatingCategory||!categoryDraft.trim()}>{creatingCategory?"Creating...":"Create category"}</Button>
        </div>
        {categoryDraft&&<Form.Text className="product-category-hint">Create this category to select it for the product.</Form.Text>}
       </Form.Group>
      </Col>
     </Row>

     <Row>
      <Col md={12}>
       <Form.Group className="mb-3">
        <Form.Label>Description</Form.Label>
        <Form.Control as="textarea" name="description" value={formData.description} onChange={handleChange} rows={4} />
       </Form.Group>
      </Col>
     </Row>

     <Row>
      <Col md={4}>
       <Form.Group className="mb-3">
        <Form.Label>Price</Form.Label>
        <Form.Control type="number" min="0" step="0.01" name="price" value={effectivePrice} onChange={handleChange} readOnly={formData.priceFromCosting} />
        <Form.Text>{formData.priceFromCosting?"Calculated from actual cost and markup.":formData.costingRef?"Price from the selected costing when available.":parsedDetails?.suggestedPriceText?"Midpoint of the suggested range until costing is completed.":"Suggested price until costing is completed."}</Form.Text>
       </Form.Group>
      </Col>

      <Col md={4}>
       <Form.Group className="mb-3">
        <Form.Label>Compare At Price</Form.Label>
        <Form.Control type="number" min="0" step="0.01" name="compareAtPrice" value={formData.compareAtPrice} onChange={handleChange} />
       </Form.Group>
      </Col>

      <Col md={4}>
       <Form.Group className="mb-3">
        <Form.Label>Cost</Form.Label>
        <Form.Control type="number" min="0" step="0.01" name="cost" value={formData.cost} onChange={handleChange} />
       </Form.Group>
      </Col>
     </Row>

     <Row>
      <Col md={4}>
       <Form.Group className="mb-3">
        <Form.Label>Generated SKU</Form.Label>
        <div className="form-control bg-light" aria-live="polite">{formData.name?generatedSku:"Enter a name to generate the SKU"}</div>
        <Form.Text>Based on the name and current price.</Form.Text>
       </Form.Group>
      </Col>

      <Col md={4}>
       <Form.Group className="mb-3">
        <Form.Label>Quantity</Form.Label>
        <Form.Control type="number" min="0" name="quantity" value={formData.quantity} onChange={handleChange} />
       </Form.Group>
      </Col>
     </Row>

     <Row>
      <Col md={6}>
       <Form.Group className="mb-3">
        <Form.Label>Images (one URL per line)</Form.Label>
        <Form.Control as="textarea" rows={2} name="image" value={formData.image} onChange={handleChange} />
       </Form.Group>

       <Form.Group className="mb-3">
        <Form.Label>Upload Image</Form.Label>
        <Form.Control id="product-image-upload" type="file" accept="image/*" onChange={handleImageUpload} />
       </Form.Group>
      </Col>

      <Col md={6}>
       <Form.Group className="mb-3">
        <Form.Label>Gallery (comma separated)</Form.Label>
        <Form.Control name="gallery" value={formData.gallery} onChange={handleChange} />
       </Form.Group>

       {imagePreview&&(
        <div className="mb-3">
         <Form.Label>Image Thumbnail</Form.Label>
         <div className="border rounded p-2 text-center bg-light">
          <img src={imagePreview} alt={formData.name||"Product preview"} className="product-form-image-thumbnail" />
          <div className="mt-2">
           <Button type="button" size="sm" variant="outline-danger" onClick={clearImage}>Clear Image</Button>
          </div>
         </div>
        </div>
       )}
      </Col>
     </Row>

     <Row>
      <Col md={6}>
       <Form.Group className="mb-3">
        <Form.Label>Notes (comma separated)</Form.Label>
        <Form.Control name="notes" value={formData.notes} onChange={handleChange} />
       </Form.Group>
      </Col>

      <Col md={3}>
       <Form.Group className="mb-3">
        <Form.Label>Status</Form.Label>
        <Form.Select name="status" value={formData.status} onChange={handleChange}>
         <option value="">Select status</option>
         {statuses.map(item=><option key={item._id} value={item._id}>{item.name}</option>)}
        </Form.Select>
       </Form.Group>
      </Col>

      <Col md={3} className="d-flex align-items-center">
       <Form.Group className="mb-3 mt-md-4">
        <Form.Check type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} label="Featured" />
       </Form.Group>
      </Col>
     </Row>

     {formData.name&&<div className="border rounded p-3 mb-3 product-barcode-preview">
      <div className="small text-muted mb-2">Generated barcode image</div>
      <Barcode value={generatedBarcode} format="CODE128" width={1.3} height={48} fontSize={12} margin={0} />
     </div>}

     <Row>
      <Col md={6}>
       <Form.Group className="mb-3">
        <Form.Label>Costing Reference</Form.Label>
        <Form.Select name="costingRef" value={formData.costingRef} onChange={handleChange}>
         <option value="">None</option>
         {costings.map(item=><option key={item._id} value={item._id}>{item.name}</option>)}
        </Form.Select>
        <Form.Text>Optional reference. Enter the unit cost above to calculate a price.</Form.Text>
       </Form.Group>
      </Col>

      <Col md={3}>
       <Form.Group className="mb-3">
        <Form.Label>Markup (%)</Form.Label>
        <Form.Control type="number" min="0" step="0.01" name="markupPercent" value={formData.markupPercent} onChange={handleChange}/>
       </Form.Group>
      </Col>

      <Col md={3} className="d-flex align-items-center">
       <Form.Check name="priceFromCosting" checked={formData.priceFromCosting} onChange={handleChange} label="Calculate price from cost"/>
      </Col>
     </Row>
      </Tab>

      {parsedGroups.map(group=><Tab eventKey={group.key} title={group.label} key={group.key}>
       {parsedDetails?.rawText?<>
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
         <div>
          <h3 className="h5 mb-1">Edit {group.label}</h3>
          <p className="small text-muted mb-0">Every labeled field below is editable. Click {editingProduct?"Update Product":"Add Product"} to save these values with the product.</p>
         </div>
         {editingProduct&&savedDetails&&<Button type="button" variant="outline-secondary" size="sm" onClick={()=>setParsedDetails(savedDetails)}>Restore saved values</Button>}
        </div>
        {editingProduct&&<div className="small fw-semibold mb-3">{parsedDirty?"Unsaved parsed changes":"Loaded from saved product"}</div>}
        {group.sections.length?<div className="parsed-fields-form">
         {group.sections.map(section=>{
          const index=section.sectionIndex;
          const multiline=section.content.includes("\n")||section.content.length>120||section.tables?.length>0;
          return <Form.Group controlId={`parsed-field-${index}`} className="parsed-field-row" key={`${section.title}-${index}`}>
           <Form.Label>{section.title}:</Form.Label>
           <div className="parsed-field-control">
            <Form.Control as={multiline?"textarea":"input"} rows={multiline?Math.min(9,Math.max(3,section.content.split("\n").length)):undefined} value={section.content} onChange={event=>handleParsedFieldChange(index,event.target.value)} />
            {section.tables?.length>0&&<Form.Text>Keep table columns separated by tabs and each row on its own line.</Form.Text>}
           </div>
          </Form.Group>;
         })}
        </div>:<p>No {group.label.toLowerCase()} information was found in the pasted product data.</p>}
       </>:<p className="text-muted">No parsed data is saved yet. Paste product data and select Parse and fill product fields.</p>}
      </Tab>)}
     </Tabs>
    </Modal.Body>

    <Modal.Footer>
     <Button variant="secondary" type="button" onClick={handleClose} disabled={loading}>Cancel</Button>
     <Button variant="primary" type="submit" disabled={loading||referenceLoading||creatingCategory||!categories.length||!statuses.length}>
      {loading?<><Spinner animation="border" size="sm" className="me-2"/>{editingProduct?"Updating...":"Saving..."}</>:activeTab!=="paste"&&activeTab!=="product"?(editingProduct?"Save Product Information":"Add Product and Save Information"):submitLabel}
     </Button>
    </Modal.Footer>
   </Form>
  </Modal>
 );
}

export default ProductForm;
