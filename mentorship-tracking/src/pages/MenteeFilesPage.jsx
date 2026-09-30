// src/pages/MenteeFilesPage.jsx
import {useEffect,useMemo,useState} from "react";
import axios from "axios";
import DOMPurify from "dompurify";
import mammoth from "mammoth";
import {Alert,Badge,Button,Card,Col,Container,Form,InputGroup,Modal,Row,Spinner,Table} from "react-bootstrap";
import {CornerDownRight,FileImage,FileText,FolderUp,Upload,Trash2,Pencil,Download,Plus} from "lucide-react";
import "../styles/MenteeFilesPage.css";

const defaultFileTypeOptions=[
 {value:"image",label:"Image"},
 {value:"document",label:"Document"},
 {value:"timesheet",label:"Timesheet"},
 {value:"proof",label:"Proof"}
];

const defaultCategoryOptions=[
 {value:"general",label:"General"},
 {value:"production",label:"Production"},
 {value:"session",label:"Session"},
 {value:"hours",label:"Hours"}
];

function MenteeFilesPage({user}){
 const [mentees,setMentees]=useState([]);
 const [files,setFiles]=useState([]);
 const [fileTypeOptions,setFileTypeOptions]=useState(defaultFileTypeOptions);
 const [categoryOptions,setCategoryOptions]=useState(defaultCategoryOptions);
 const [addingFileType,setAddingFileType]=useState(false);
 const [newFileTypeName,setNewFileTypeName]=useState("");
 const [addingCategory,setAddingCategory]=useState(false);
 const [newCategoryName,setNewCategoryName]=useState("");
 const [selectedMentee,setSelectedMentee]=useState("");
 const [selectedCategory,setSelectedCategory]=useState("");
 const [search,setSearch]=useState("");
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");
 const [showDeleteConfirm,setShowDeleteConfirm]=useState(false);
 const [deleteTarget,setDeleteTarget]=useState(null);
 const [fileInputKey,setFileInputKey]=useState(Date.now());
 const [showEditModal,setShowEditModal]=useState(false);
 const [filePreview,setFilePreview]=useState(null);
 const [filePreviewLoading,setFilePreviewLoading]=useState(false);
 const [editTarget,setEditTarget]=useState(null);
 const [editFormData,setEditFormData]=useState({
  weekNumber:"",
  fileType:"document",
  category:"general",
  description:""
 });

 const [formData,setFormData]=useState({
  mentee:"",
  weekNumber:"",
  fileType:"document",
  category:"general",
  description:"",
  file:null
 });

 useEffect(()=>{
  fetchData();
 },[]);

 useEffect(()=>{
  if(!success) return;
  const timer=setTimeout(()=>setSuccess(""),5000);
  return()=>clearTimeout(timer);
 },[success]);

 const resolveCreatedBy=value=>{
  return value?._id||value?.id||value?.user?._id||value?.user?.id||value?.userId||"";
 };

 const normalizeWeekNumber=value=>{
  if(value===undefined||value===null||value==="") return null;
  const parsed=Number(value);
  if(Number.isNaN(parsed)||parsed<=0) return null;
  return parsed;
 };

 const getBackendBaseUrl=()=>{
  const explicitBase=String(
   axios.defaults.baseURL||
   import.meta.env.VITE_API_BASE_URL||
   import.meta.env.VITE_API_URL||
   import.meta.env.VITE_BACKEND_URL||
   ""
  ).trim();

  if(explicitBase){
   return explicitBase.replace(/\/api\/?$/,"").replace(/\/$/,"");
  }

  if(typeof window!=="undefined"){
   const {protocol,hostname}=window.location;
   if(hostname==="localhost"||hostname==="127.0.0.1"){
    return `${protocol}//${hostname}:3001`;
   }
   return window.location.origin.replace(/\/$/,"");
  }

  return "";
 };

 const getSubfolderByFileType=fileType=>{
  return String(fileType||"").toLowerCase()==="image"?"images":"docs";
 };

 const buildStoredRelativePath=(menteeName,fileType,fileName)=>{
  return `mentee/${menteeName}/${getSubfolderByFileType(fileType)}/${fileName}`;
 };

 const normalizeStoredFilePath=item=>{
  const rawPath=String(item?.filePath||"").replace(/\\/g,"/").replace(/^\/+/,"").trim();
  if(!rawPath) return "";

  if(/^https?:\/\//i.test(rawPath)) return rawPath;

  const parts=rawPath.split("/").filter(Boolean);

  if(parts[0]==="mentee"&&parts.length===3){
   const [,folderName,fileName]=parts;
   return `mentee/${folderName}/${getSubfolderByFileType(item?.fileType)}/${fileName}`;
  }

  return rawPath;
 };

 const fetchData=async()=>{
  try{
   setLoading(true);
   setError("");

   const [menteesRes,filesRes]=await Promise.all([
    axios.get("/api/mentees/list"),
    axios.get("/api/mentee-files/list")
   ]);

   const menteeListRaw=Array.isArray(menteesRes.data)?menteesRes.data:menteesRes.data?.mentees||[];
   const fileList=Array.isArray(filesRes.data)?filesRes.data:filesRes.data?.files||filesRes.data?.menteeFiles||[];

   setMentees(menteeListRaw);
   setFiles(fileList);

   try{
    const lookupsRes=await axios.get("/api/file-lookups");
    const lookups=lookupsRes.data?.fileLookups||[];
    const types=lookups.filter(item=>item.kind==="type"&&item.isActive!==false).map(item=>({value:item.value,label:item.name}));
    const categories=lookups.filter(item=>item.kind==="category"&&item.isActive!==false).map(item=>({value:item.value,label:item.name}));
    setFileTypeOptions(types.length?types:defaultFileTypeOptions);
    setCategoryOptions(categories.length?categories:defaultCategoryOptions);
   }catch(lookupError){
    setFileTypeOptions(defaultFileTypeOptions);
    setCategoryOptions(defaultCategoryOptions);
    console.error("Failed to load file lookup options",lookupError);
   }
  }catch(err){
   setError(err.response?.data?.message||"Failed to load mentee files.");
  }finally{
   setLoading(false);
  }
 };

 const getFullName=mentee=>`${mentee?.firstName||""} ${mentee?.lastName||""}`.trim();

 const getMenteeStatus=item=>String(
  item?.status?.code||
  item?.status?.name||
  item?.status?.label||
  item?.status?.value||
  item?.status||
  ""
 ).trim().toLowerCase();

 const currentReviewMentees=useMemo(
  ()=>mentees.filter(item=>!["completed","dropped"].includes(getMenteeStatus(item))),
  [mentees]
 );

 const previousMentees=useMemo(
  ()=>mentees.filter(item=>["completed","dropped"].includes(getMenteeStatus(item))),
  [mentees]
 );

 const getMenteeNameById=menteeId=>{
  const matched=mentees.find(item=>String(item?._id||"")===String(menteeId||""));
  return matched?getFullName(matched):"Unknown Mentee";
 };

 const getMenteeFileCount=menteeId=>files.filter(
  item=>String(item?.mentee?._id||item?.mentee||"")===String(menteeId||"")
 ).length;

 const isImageFile=item=>{
  return String(item?.fileType||"").toLowerCase()==="image";
 };

 const buildFileUrl=item=>{
  const normalizedPath=normalizeStoredFilePath(item);
  if(!normalizedPath) return "";
  if(/^https?:\/\//i.test(normalizedPath)) return normalizedPath;
  const backendBaseUrl=getBackendBaseUrl();
  return `${backendBaseUrl}/${normalizedPath}`;
 };

 const filteredFiles=useMemo(()=>{
  if(!selectedMentee) return [];

  let list=files.filter(
   item=>String(item?.mentee?._id||item?.mentee||"")===String(selectedMentee)
  );

  const term=search.trim().toLowerCase();
  if(term){
   list=list.filter(item=>{
    const menteeName=getMenteeNameById(item?.mentee?._id||item?.mentee||"").toLowerCase();
    const fileName=String(item?.fileName||"").toLowerCase();
    const description=String(item?.description||"").toLowerCase();
    const fileType=String(item?.fileType||"").toLowerCase();
    const category=String(item?.category||"").toLowerCase();
    return menteeName.includes(term)||fileName.includes(term)||description.includes(term)||fileType.includes(term)||category.includes(term);
   });
  }

  return list.sort((a,b)=>new Date(b?.createdAt||0)-new Date(a?.createdAt||0));
 },[files,selectedMentee,search,mentees]);

 const selectedMenteeName=selectedMentee?getMenteeNameById(selectedMentee):"";
 const groupedFiles=useMemo(()=>{
  const groups=new Map();
  filteredFiles.forEach(item=>{
   const category=String(item?.category||"general").trim().toLowerCase()||"general";
   if(!groups.has(category))groups.set(category,[]);
   groups.get(category).push(item);
  });
  return [...groups.entries()].sort(([left],[right])=>left.localeCompare(right));
 },[filteredFiles]);

 useEffect(()=>{
  if(!groupedFiles.length){
   setSelectedCategory("");
   return;
  }
  if(!groupedFiles.some(([category])=>category===selectedCategory)){
   setSelectedCategory(groupedFiles[0][0]);
  }
 },[groupedFiles,selectedCategory]);

 const selectedCategoryFiles=groupedFiles.find(([category])=>category===selectedCategory)?.[1]||[];

 const getCategoryLabel=value=>{
  const option=categoryOptions.find(item=>item.value===value);
  return option?.label||value.replace(/(^|[-_\s])\w/g,match=>match.toUpperCase());
 };

 const handleChange=e=>{
  const {name,value}=e.target;
  setFormData(prev=>({
   ...prev,
   [name]:value
  }));
  if(name==="mentee"){
   setSelectedMentee(value);
   if(!value){
    setAddingFileType(false);
    setNewFileTypeName("");
    setAddingCategory(false);
    setNewCategoryName("");
   }
  }
 };

 const handleEditChange=e=>{
  const {name,value}=e.target;
  setEditFormData(prev=>({
   ...prev,
   [name]:value
  }));
 };

 const handleFileChange=e=>{
  const file=e.target.files?.[0]||null;
  setFormData(prev=>({
   ...prev,
   file
  }));
 };

 const addCategory=async()=>{
  const name=newCategoryName.trim();
  if(!name)return;
  try{
   setSaving(true);
   setError("");
   const response=await axios.post("/api/file-lookups",{kind:"category",name,createdBy:resolveCreatedBy(user)||null});
   const item=response.data?.fileLookup;
   if(item){
    setCategoryOptions(prev=>[...prev.filter(option=>option.value!==item.value),{value:item.value,label:item.name}].sort((a,b)=>a.label.localeCompare(b.label)));
    setFormData(prev=>({...prev,category:item.value}));
   }
   setNewCategoryName("");
   setAddingCategory(false);
   setSuccess("Category added.");
  }catch(err){
   setError(err.response?.data?.message||"Failed to add category.");
  }finally{
   setSaving(false);
  }
 };

 const addFileType=async()=>{
  const name=newFileTypeName.trim();
  if(!name)return;
  try{
   setSaving(true);
   setError("");
   const response=await axios.post("/api/file-lookups",{kind:"type",name,createdBy:resolveCreatedBy(user)||null});
   const item=response.data?.fileLookup;
   if(item){
    setFileTypeOptions(prev=>[...prev.filter(option=>option.value!==item.value),{value:item.value,label:item.name}].sort((a,b)=>a.label.localeCompare(b.label)));
    setFormData(prev=>({...prev,fileType:item.value}));
   }
   setNewFileTypeName("");
   setAddingFileType(false);
   setSuccess("File type added.");
  }catch(err){
   setError(err.response?.data?.message||"Failed to add file type.");
  }finally{
   setSaving(false);
  }
 };

 const resetForm=()=>{
  setFormData(previous=>({
   mentee:previous.mentee,
   weekNumber:"",
   fileType:"document",
   category:"general",
   description:"",
   file:null
  }));
  setFileInputKey(Date.now());
 };

 const clearUploadForm=()=>{
  setFormData({
   mentee:"",
   weekNumber:"",
   fileType:"document",
   category:"general",
   description:"",
   file:null
  });
  setSelectedMentee("");
  setSelectedCategory("");
  setAddingFileType(false);
  setNewFileTypeName("");
  setAddingCategory(false);
  setNewCategoryName("");
  setFileInputKey(Date.now());
  setError("");
  setSuccess("");
 };

 const validateForm=()=>{
  const normalizedWeekNumber=normalizeWeekNumber(formData.weekNumber);
  if(!formData.mentee) return "Mentee is required.";
  if(!formData.file) return "File is required.";
  if(!formData.fileType) return "File type is required.";
  if(formData.weekNumber!==""&&normalizedWeekNumber===null) return "Week number must be 1 or greater.";
  return "";
 };

 const validateEditForm=()=>{
  const normalizedWeekNumber=normalizeWeekNumber(editFormData.weekNumber);
  if(editFormData.weekNumber!==""&&normalizedWeekNumber===null) return "Week number must be 1 or greater.";
  if(!editFormData.fileType) return "File type is required.";
  return "";
 };

 const handleSubmit=async e=>{
  e.preventDefault();

  const validationError=validateForm();
  if(validationError){
   setError(validationError);
   return;
  }

  try{
   setSaving(true);
   setError("");
   setSuccess("");

   const selectedMenteeRecord=mentees.find(item=>String(item?._id||"")===String(formData.mentee||""));
   const menteeName=getFullName(selectedMenteeRecord);
   const createdBy=resolveCreatedBy(user);
   const weekNumber=normalizeWeekNumber(formData.weekNumber);
   const subfolder=getSubfolderByFileType(formData.fileType);

   if(!menteeName){
    setError("Selected mentee could not be resolved.");
    return;
   }

   if(!createdBy){
    setError("Current user id could not be resolved.");
    return;
   }

   const uploadData=new FormData();
   uploadData.append("folderName",menteeName);
   uploadData.append("menteeName",menteeName);
   uploadData.append("subfolder",subfolder);
   uploadData.append("fileType",formData.fileType);
   uploadData.append("file",formData.file);

   const uploadRes=await axios.post("/api/upload/mentee",uploadData,{
    headers:{
     "Content-Type":"multipart/form-data"
    }
   });

   const uploaded=uploadRes.data||{};
   const finalFileName=uploaded.filename||formData.file.name;
   const payload={
    mentee:formData.mentee,
    weekNumber,
    fileName:finalFileName,
    filePath:uploaded.relativePath||buildStoredRelativePath(menteeName,formData.fileType,finalFileName),
    fileType:formData.fileType,
    category:formData.category,
    description:formData.description,
    createdBy
   };

   const existingRecord=files.find(item=>
    String(item?.mentee?._id||item?.mentee||"")===String(formData.mentee)&&
    String(item?.fileName||"")===String(finalFileName)
   );

   if(existingRecord?._id){
    await axios.put(`/api/mentee-files/${existingRecord._id}`,payload);
   }else{
    await axios.post("/api/mentee-files",payload);
   }

   setSuccess(existingRecord?"Missing file restored successfully.":"File uploaded successfully.");
   resetForm();
   await fetchData();
  }catch(err){
   setError(err.response?.data?.message||err.response?.data?.error||"Failed to upload file.");
  }finally{
   setSaving(false);
  }
 };

 const handleOpenFile=async fileRecord=>{
  const fileUrl=buildFileUrl(fileRecord);
  if(!fileUrl){
   setError("File URL could not be resolved.");
   return;
  }
  const extension=String(fileRecord?.fileName||"").split(".").pop().toLowerCase();
  if(extension==="doc"){
   setFilePreview({
    title:fileRecord.fileName,
    kind:"message",
    message:"Legacy .doc files cannot be rendered by the installed preview reader. Convert this file to .docx to preview it."
   });
   return;
  }
  if(extension==="docx"){
   try{
    setError("");
    setFilePreviewLoading(true);
    setFilePreview({title:fileRecord.fileName,kind:"html",html:""});
    const response=await axios.get(fileUrl,{responseType:"arraybuffer"});
    const result=await mammoth.convertToHtml({arrayBuffer:response.data});
    setFilePreview({title:fileRecord.fileName,kind:"html",html:DOMPurify.sanitize(result.value)});
   }catch(err){
    setFilePreview(null);
    setError(err.response?.data?.message||"Failed to open the Word preview.");
   }finally{
    setFilePreviewLoading(false);
   }
   return;
  }
  const imageExtensions=["png","jpg","jpeg","gif","webp","bmp","svg"];
  const audioExtensions=["mp3","wav","ogg","m4a"];
  const videoExtensions=["mp4","webm","ogv","mov"];
  const kind=imageExtensions.includes(extension)?"image":
   audioExtensions.includes(extension)?"audio":
   videoExtensions.includes(extension)?"video":"frame";
  setFilePreview({title:fileRecord.fileName,kind,url:fileUrl});
 };

 const handleDownloadFile=fileRecord=>{
  const fileUrl=buildFileUrl(fileRecord);
  if(!fileUrl){
   setError("File URL could not be resolved.");
   return;
  }
  const link=document.createElement("a");
  link.href=fileUrl;
  link.target="_blank";
  link.rel="noreferrer";
  link.download=fileRecord?.fileName||"download";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
 };

 const handleEditClick=fileRecord=>{
  setEditTarget(fileRecord);
  setEditFormData({
   weekNumber:fileRecord?.weekNumber??"",
   fileType:fileRecord?.fileType||"document",
   category:fileRecord?.category||"general",
   description:fileRecord?.description||""
  });
  setShowEditModal(true);
 };

 const handleEditSave=async()=>{
  if(!editTarget?._id) return;

  const validationError=validateEditForm();
  if(validationError){
   setError(validationError);
   return;
  }

  try{
   setSaving(true);
   setError("");
   setSuccess("");

   const payload={
    weekNumber:normalizeWeekNumber(editFormData.weekNumber),
    fileType:editFormData.fileType,
    category:editFormData.category,
    description:editFormData.description
   };

   await axios.put(`/api/mentee-files/${editTarget._id}`,payload);

   setSuccess("File updated successfully.");
   setShowEditModal(false);
   setEditTarget(null);
   await fetchData();
  }catch(err){
   setError(err.response?.data?.message||err.response?.data?.error||"Failed to update file.");
  }finally{
   setSaving(false);
  }
 };

 const handleDeleteClick=fileRecord=>{
  setDeleteTarget(fileRecord);
  setShowDeleteConfirm(true);
 };

 const handleDeleteConfirmed=async()=>{
  if(!deleteTarget?._id) return;

  try{
   setSaving(true);
   setError("");
   setSuccess("");
   await axios.delete(`/api/mentee-files/${deleteTarget._id}`);
   setSuccess("File deleted successfully.");
   setShowDeleteConfirm(false);
   setDeleteTarget(null);
   await fetchData();
  }catch(err){
   setError(err.response?.data?.message||"Failed to delete file.");
  }finally{
   setSaving(false);
  }
 };

 return(
  <Container fluid className="py-4 mentee-files-page">
   <div className="mentee-files-layout">
    <section className="mentee-files-upload-column">
     <Card className="shadow-sm border-0 mentee-files-upload-panel">
      <Card.Body>
       <div className="d-flex align-items-center gap-2 mb-3">
        <FolderUp size={18}/>
        <h4 className="mb-0">Upload Mentee File</h4>
       </div>

       {error&&<Alert variant="danger" className="mb-3">{error}</Alert>}
       {success&&<Alert variant="success" className="mb-3">{success}</Alert>}

       <Form onSubmit={handleSubmit} className="mentee-files-upload-form">
        <Row className="g-3">
         <Col md={12}>
          <Form.Group className="mentee-files-field mentee-files-field-mentee">
           <label className="mentee-files-label" htmlFor="mentee-file-mentee">Mentee</label>
           <Form.Select id="mentee-file-mentee" name="mentee" value={formData.mentee} onChange={handleChange}>
            <option value="">Select mentee</option>
            {currentReviewMentees.length?(
             <optgroup label="Current Mentorships">
              {currentReviewMentees.map(item=>(
               <option key={item._id} value={item._id}>
                {getFullName(item)} — {item?.status?.name||item?.status?.label||getMenteeStatus(item)}
               </option>
              ))}
             </optgroup>
            ):null}
            {previousMentees.length?(
             <optgroup label="Previous Mentorships">
              {previousMentees.map(item=>(
               <option key={item._id} value={item._id}>
                {getFullName(item)} — {item?.status?.name||item?.status?.label||getMenteeStatus(item)}
               </option>
              ))}
             </optgroup>
            ):null}
           </Form.Select>
          </Form.Group>
         </Col>

         <Col md={12}>
          <Form.Group className="mentee-files-field mentee-files-field-week">
           <label className="mentee-files-label" htmlFor="mentee-file-week">Week Number</label>
           <Form.Control
            id="mentee-file-week"
            type="number"
            min="1"
            name="weekNumber"
            value={formData.weekNumber}
            onChange={handleChange}
            placeholder="Optional"
           />
          </Form.Group>
         </Col>

         <Col md={12}>
         <Form.Group className="mentee-files-field mentee-files-field-type">
           <label className="mentee-files-label" htmlFor="mentee-file-type">File Type</label>
           <div className="mentee-files-category-controls">
            <Form.Select id="mentee-file-type" name="fileType" value={formData.fileType} onChange={handleChange}>
             {fileTypeOptions.map(option=>(
              <option key={option.value} value={option.value}>{option.label}</option>
             ))}
            </Form.Select>
            <Button className="mentee-files-add-category" type="button" variant="secondary" disabled={!formData.mentee} onClick={()=>setAddingFileType(value=>!value)}><Plus size={14}/> Add File Type</Button>
           </div>
          </Form.Group>
          {addingFileType?<div className="mentee-files-inline-category">
           <label className="mentee-files-label" htmlFor="new-file-type">New File Type</label>
           <Form.Control id="new-file-type" value={newFileTypeName} onChange={event=>setNewFileTypeName(event.target.value)} />
           <Button type="button" variant="primary" disabled={saving||!newFileTypeName.trim()} onClick={addFileType}>Save</Button>
           <Button type="button" variant="secondary" onClick={()=>{setAddingFileType(false);setNewFileTypeName("");}}>Cancel</Button>
          </div>:null}
         </Col>

         <Col md={12}>
         <Form.Group className="mentee-files-field mentee-files-field-category">
           <label className="mentee-files-label" htmlFor="mentee-file-category">Category</label>
           <div className="mentee-files-category-controls">
            <Form.Select id="mentee-file-category" name="category" value={formData.category} onChange={handleChange}>
             {categoryOptions.map(option=>(
              <option key={option.value} value={option.value}>{option.label}</option>
             ))}
            </Form.Select>
            <Button className="mentee-files-add-category" type="button" variant="secondary" disabled={!formData.mentee} onClick={()=>setAddingCategory(value=>!value)}><Plus size={14}/> Add Category</Button>
           </div>
          </Form.Group>
          {addingCategory?<div className="mentee-files-inline-category">
           <label className="mentee-files-label" htmlFor="new-file-category">New Category</label>
           <Form.Control id="new-file-category" value={newCategoryName} onChange={event=>setNewCategoryName(event.target.value)} />
           <Button type="button" variant="primary" disabled={saving||!newCategoryName.trim()} onClick={addCategory}>Save</Button>
           <Button type="button" variant="secondary" onClick={()=>{setAddingCategory(false);setNewCategoryName("");}}>Cancel</Button>
          </div>:null}
         </Col>

         <Col md={12}>
          <Form.Group className="mentee-files-field mentee-files-field-description mentee-files-description-field">
           <label className="mentee-files-label" htmlFor="mentee-file-description">Description</label>
           <Form.Control
            id="mentee-file-description"
            as="textarea"
            rows={3}
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Optional description"
           />
          </Form.Group>
         </Col>

         <Col md={12}>
          <Form.Group className="mentee-files-field mentee-files-field-file">
           <label className="mentee-files-label" htmlFor="mentee-file-upload">File</label>
           <Form.Control id="mentee-file-upload" key={fileInputKey} type="file" onChange={handleFileChange}/>
           {formData.file&&<Form.Text className="text-muted">{formData.file.name}</Form.Text>}
          </Form.Group>
         </Col>

         <Col md={12} className="d-flex justify-content-end gap-2">
          <Button type="button" variant="secondary" onClick={clearUploadForm}>
           Clear
          </Button>
          <Button type="submit" variant="primary" disabled={saving||!formData.mentee||!formData.file} className="d-inline-flex align-items-center gap-2">
           <Upload size={16}/>
           <span>{saving?"Uploading...":"Upload File"}</span>
          </Button>
         </Col>
        </Row>
       </Form>
      </Card.Body>
     </Card>
    </section>

    <section className="mentee-files-list-column">
     <Card className="shadow-sm border-0 mentee-files-list-panel">
      <Card.Body>
       <Row className="g-3 align-items-center mb-3 mentee-files-filter-row">
        <Col md={4}>
         <Form.Group className="mentee-files-filter-field">
          <Form.Label>Filter by Mentee</Form.Label>
          <Form.Select value={selectedMentee} onChange={e=>setSelectedMentee(e.target.value)}>
           <option value="">Select mentee</option>
           {currentReviewMentees.length?(
            <optgroup label="Current Mentorships">
             {currentReviewMentees.map(item=>(
              <option key={item._id} value={item._id}>
               {getFullName(item)} — {item?.status?.name||item?.status?.label||getMenteeStatus(item)} — {getMenteeFileCount(item._id)} files
              </option>
             ))}
            </optgroup>
           ):null}
           {previousMentees.length?(
            <optgroup label="Previous Mentorships">
             {previousMentees.map(item=>(
              <option key={item._id} value={item._id}>
               {getFullName(item)} — {item?.status?.name||item?.status?.label||getMenteeStatus(item)} — {getMenteeFileCount(item._id)} files
              </option>
             ))}
            </optgroup>
           ):null}
          </Form.Select>
         </Form.Group>
        </Col>

        <Col md={8}>
         <Form.Group className="mentee-files-filter-field">
          <Form.Label>Search</Form.Label>
          <InputGroup>
           <InputGroup.Text>
            <FileText size={16}/>
           </InputGroup.Text>
           <Form.Control
            type="text"
            value={search}
            onChange={e=>setSearch(e.target.value)}
            placeholder="Search by mentee, file name, type, category..."
           />
          </InputGroup>
         </Form.Group>
        </Col>
       </Row>

       {loading?(
        <div className="py-5 text-center">
         <Spinner animation="border"/>
        </div>
       ):(
        <div className="mentee-files-records">
         {selectedMentee?<h3 className="mentee-files-selected-name">{selectedMenteeName}</h3>:null}
         {groupedFiles.length?(
          <div className="mentee-file-category-tabs" role="tablist" aria-label={`${selectedMenteeName} file categories`}>
           {groupedFiles.map(([category,categoryFiles])=>(
            <button
             key={category}
             type="button"
             role="tab"
             aria-selected={selectedCategory===category}
             className={selectedCategory===category?"is-active":""}
             onClick={()=>setSelectedCategory(category)}
            >
             <span>{getCategoryLabel(category)}</span>
             <small>{categoryFiles.length}</small>
            </button>
           ))}
          </div>
         ):null}
         <div className="table-responsive">
         <Table hover className="align-middle mb-0 mentee-files-table">
          <thead>
           <tr>
            <th>File Details</th>
            <th className="text-end">Actions</th>
           </tr>
          </thead>
          <tbody>
           {selectedCategoryFiles.length?selectedCategoryFiles.map(item=>{
             const fileMentee=mentees.find(
              mentee=>String(mentee?._id||"")===String(item?.mentee?._id||item?.mentee||"")
             );
             const isCompletedFile=getMenteeStatus(fileMentee)==="completed";
             return(
             <tr key={item._id}>
              <td>
               <div className="mentee-file-name">
                <CornerDownRight className="mentee-file-indent-arrow" size={17} aria-hidden="true"/>
                {isImageFile(item)?<FileImage size={16}/>:<FileText size={16}/>}
                <span>{item.fileName||"—"}</span>
               </div>
               <div className="mentee-file-metadata">
                <span><strong>Type:</strong> <Badge bg={item.fileType==="image"?"info":"secondary"}>{item.fileType||"—"}</Badge></span>
                <span><strong>Week:</strong> {item.weekNumber??"—"}</span>
                <span><strong>Description:</strong> {item.description||"—"}</span>
                <span><strong>Created:</strong> {item.createdAt?new Date(item.createdAt).toLocaleDateString():"—"}</span>
               </div>
              </td>
              <td className="text-end">
               <div className="mentee-files-actions">
                <Button size="sm" variant="outline-secondary" onClick={()=>handleOpenFile(item)}>Open</Button>
                <Button size="sm" variant="outline-dark" onClick={()=>handleDownloadFile(item)} className="d-inline-flex align-items-center gap-1">
                 <Download size={14}/>
                 <span>Download</span>
                </Button>
                <Button size="sm" variant="outline-warning" onClick={()=>handleEditClick(item)} className="d-inline-flex align-items-center gap-1">
                 <Pencil size={14}/>
                 <span>Edit</span>
                </Button>
                {!isCompletedFile?(
                 <Button size="sm" variant="outline-danger" onClick={()=>handleDeleteClick(item)} className="d-inline-flex align-items-center gap-1">
                  <Trash2 size={14}/>
                  <span>Delete</span>
                 </Button>
                ):null}
               </div>
              </td>
             </tr>
             );
            }):(
            <tr>
             <td colSpan="2" className="text-center py-5 text-muted">No files found.</td>
            </tr>
           )}
          </tbody>
         </Table>
         </div>
        </div>
       )}
      </Card.Body>
     </Card>
    </section>
   </div>

   <Modal
    show={Boolean(filePreview)}
    onHide={()=>setFilePreview(null)}
    centered
    size="xl"
    backdrop="static"
    keyboard={false}
    dialogClassName="mentee-word-preview-modal"
   >
    <Modal.Header closeButton>
     <Modal.Title>{filePreview?.title||"File Preview"}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     {filePreviewLoading?(
      <div className="mentee-word-preview-loading"><Spinner size="sm"/><span>Opening document…</span></div>
     ):filePreview?.kind==="html"?(
      <article className="mentee-word-preview-content" dangerouslySetInnerHTML={{__html:filePreview.html||""}}/>
     ):filePreview?.kind==="image"?(
      <div className="mentee-file-preview-media"><img src={filePreview.url} alt={filePreview.title}/></div>
     ):filePreview?.kind==="audio"?(
      <div className="mentee-file-preview-media"><audio src={filePreview.url} controls/></div>
     ):filePreview?.kind==="video"?(
      <div className="mentee-file-preview-media"><video src={filePreview.url} controls/></div>
     ):filePreview?.kind==="message"?(
      <div className="mentee-file-preview-message">{filePreview.message}</div>
     ):(
      <iframe className="mentee-file-preview-frame" src={filePreview?.url} title={filePreview?.title||"File preview"}/>
     )}
    </Modal.Body>
    <Modal.Footer>
     <Button variant="secondary" onClick={()=>setFilePreview(null)}>Close</Button>
    </Modal.Footer>
   </Modal>

   <Modal show={showEditModal} onHide={()=>{setShowEditModal(false);setEditTarget(null);}} centered backdrop="static" keyboard={false}>
    <Modal.Header closeButton>
     <Modal.Title>Edit File Details</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     <Row className="g-3">
      <Col md={12}>
       <Form.Group>
        <Form.Label>Week Number</Form.Label>
        <Form.Control
         type="number"
         min="1"
         name="weekNumber"
         value={editFormData.weekNumber}
         onChange={handleEditChange}
         placeholder="Optional"
        />
       </Form.Group>
      </Col>

      <Col md={12}>
       <Form.Group>
        <Form.Label>File Type</Form.Label>
        <Form.Select name="fileType" value={editFormData.fileType} onChange={handleEditChange}>
         {fileTypeOptions.map(option=>(
          <option key={option.value} value={option.value}>{option.label}</option>
         ))}
        </Form.Select>
       </Form.Group>
      </Col>

      <Col md={12}>
       <Form.Group>
        <Form.Label>Category</Form.Label>
        <Form.Select name="category" value={editFormData.category} onChange={handleEditChange}>
         {categoryOptions.map(option=>(
          <option key={option.value} value={option.value}>{option.label}</option>
         ))}
        </Form.Select>
       </Form.Group>
      </Col>

      <Col md={12}>
       <Form.Group>
        <Form.Label>Description</Form.Label>
        <Form.Control
         as="textarea"
         rows={3}
         name="description"
         value={editFormData.description}
         onChange={handleEditChange}
         placeholder="Optional description"
        />
       </Form.Group>
      </Col>
     </Row>
    </Modal.Body>
    <Modal.Footer>
     <Button variant="secondary" onClick={()=>{setShowEditModal(false);setEditTarget(null);}}>
      Cancel
     </Button>
     <Button variant="primary" onClick={handleEditSave} disabled={saving}>
      Save Changes
     </Button>
    </Modal.Footer>
   </Modal>

   <Modal show={showDeleteConfirm} onHide={()=>{setShowDeleteConfirm(false);setDeleteTarget(null);}} centered>
    <Modal.Header closeButton>
     <Modal.Title>Delete File</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     Are you sure you want to delete {deleteTarget?.fileName||"this file"}?
    </Modal.Body>
    <Modal.Footer>
     <Button variant="secondary" onClick={()=>{setShowDeleteConfirm(false);setDeleteTarget(null);}}>
      Cancel
     </Button>
     <Button variant="danger" onClick={handleDeleteConfirmed} disabled={saving}>
      Delete
     </Button>
    </Modal.Footer>
   </Modal>
  </Container>
 );
}

export default MenteeFilesPage;
