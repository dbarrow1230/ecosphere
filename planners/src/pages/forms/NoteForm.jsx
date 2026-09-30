import {useState,useEffect,useRef} from "react";
import {Form,Button,Row,Col,Modal,Alert,Image} from "react-bootstrap";
import {EditorContent,useEditor} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {FontSize,TextStyle} from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";

function RichTextEditor({value,onChange}){
 const editor=useEditor({
  extensions:[
   StarterKit.configure({
    link:{
     openOnClick:false,
     autolink:true,
     defaultProtocol:"https"
    }
   }),
   TextStyle,
   FontSize,
   Color,
   Highlight.configure({multicolor:true}),
   TextAlign.configure({types:["heading","paragraph"]})
  ],
  content:value||"",
  editorProps:{
   attributes:{
    class:"ztk-tiptap-editor"
   }
  },
  onUpdate:({editor:activeEditor})=>{
   onChange(activeEditor.getHTML());
  }
 });

 useEffect(()=>{
  if(!editor)return;
  const current=editor.getHTML();
  const next=value||"";
  if(current!==next){
   editor.commands.setContent(next,false);
  }
 },[editor,value]);

 if(!editor){
  return <div className="ztk-tiptap-shell"/>;
 }

 const promptLink=()=>{
  const previous=editor.getAttributes("link").href||"";
  const url=window.prompt("Enter link URL",previous);
  if(url===null)return;
  if(url===""){
   editor.chain().focus().extendMarkRange("link").unsetLink().run();
   return;
  }
  editor.chain().focus().extendMarkRange("link").setLink({href:url}).run();
 };

 const applyBlock=valueName=>{
  if(valueName==="paragraph"){
   editor.chain().focus().setParagraph().run();
   return;
  }
  editor.chain().focus().toggleHeading({level:Number(valueName)}).run();
 };

 return(
  <div className="ztk-tiptap-shell">
   <div className="ztk-tiptap-toolbar">
    <select className="ztk-tiptap-select" defaultValue="paragraph" onChange={event=>applyBlock(event.target.value)}>
     <option value="paragraph">Paragraph</option>
     <option value="1">Heading 1</option>
     <option value="2">Heading 2</option>
     <option value="3">Heading 3</option>
     <option value="4">Heading 4</option>
     <option value="5">Heading 5</option>
     <option value="6">Heading 6</option>
    </select>

    <select className="ztk-tiptap-select" defaultValue="" onChange={event=>event.target.value?editor.chain().focus().setFontSize(event.target.value).run():editor.chain().focus().unsetFontSize().run()}>
     <option value="">Size</option>
     <option value="12px">12</option>
     <option value="14px">14</option>
     <option value="16px">16</option>
     <option value="18px">18</option>
     <option value="24px">24</option>
     <option value="32px">32</option>
    </select>

    <label className="ztk-tiptap-color">
     Text
     <input type="color" onInput={event=>editor.chain().focus().setColor(event.currentTarget.value).run()}/>
    </label>

    <label className="ztk-tiptap-color">
     Highlight
     <input type="color" onInput={event=>editor.chain().focus().setHighlight({color:event.currentTarget.value}).run()}/>
    </label>

    <button type="button" className={editor.isActive("bold")?"is-active":""} onClick={()=>editor.chain().focus().toggleBold().run()}>B</button>
    <button type="button" className={editor.isActive("italic")?"is-active":""} onClick={()=>editor.chain().focus().toggleItalic().run()}>I</button>
    <button type="button" className={editor.isActive("underline")?"is-active":""} onClick={()=>editor.chain().focus().toggleUnderline().run()}>U</button>
    <button type="button" className={editor.isActive("strike")?"is-active":""} onClick={()=>editor.chain().focus().toggleStrike().run()}>S</button>
    <button type="button" onClick={()=>editor.chain().focus().toggleBulletList().run()}>List</button>
    <button type="button" onClick={()=>editor.chain().focus().toggleOrderedList().run()}>1.</button>
    <button type="button" onClick={()=>editor.chain().focus().setTextAlign("left").run()}>Left</button>
    <button type="button" onClick={()=>editor.chain().focus().setTextAlign("center").run()}>Center</button>
    <button type="button" onClick={()=>editor.chain().focus().setTextAlign("right").run()}>Right</button>
    <button type="button" onClick={()=>editor.chain().focus().setTextAlign("justify").run()}>Justify</button>
    <button type="button" onClick={()=>editor.chain().focus().toggleBlockquote().run()}>Quote</button>
    <button type="button" onClick={()=>editor.chain().focus().toggleCodeBlock().run()}>Code</button>
    <button type="button" onClick={promptLink}>Link</button>
    <button type="button" onClick={()=>editor.chain().focus().unsetAllMarks().clearNodes().run()}>Clear</button>
   </div>

   <EditorContent editor={editor}/>
  </div>
 );
}

export default function NoteForm({note,onSuccess,userId,autoFocusTitle})
{
 const isEditing=!!note?._id;

 const [form,setForm]=useState({
  notebook:"",
  noteType:"",
  title:"",
  noteId:"",
  content:"",
  summary:"",
  tags:[],
  images:[],
  attachments:[],
  isArchived:false,
  isFavorite:false,
  status:"active"
 });

 const [saving,setSaving]=useState(false);
 const [notebooks,setNotebooks]=useState([]);
 const [noteTypes,setNoteTypes]=useState([]);
 const [tags,setTags]=useState([]);

 const [showNotebookModal,setShowNotebookModal]=useState(false);
 const [showNoteTypeModal,setShowNoteTypeModal]=useState(false);

 const [newNotebook,setNewNotebook]=useState({
  name:"",
  description:"",
  color:"#0f766e",
  isArchived:false
 });

 const [newNoteType,setNewNoteType]=useState({
  name:"",
  description:""
 });

 const [savingNotebook,setSavingNotebook]=useState(false);
 const [savingNoteType,setSavingNoteType]=useState(false);
 const [notebookError,setNotebookError]=useState("");
 const [noteTypeError,setNoteTypeError]=useState("");
 const [noteError,setNoteError]=useState("");
 const [imageFiles,setImageFiles]=useState([]);
 const [attachmentFiles,setAttachmentFiles]=useState([]);
 const [imagePreviews,setImagePreviews]=useState([]);
 const titleRef=useRef(null);
 const imagesInputRef=useRef(null);
 const attachmentsInputRef=useRef(null);

 const getStoredUser=()=>{
  const keys=["userInfo","user","authUser","currentUser"];

  for(const key of keys)
  {
   try
   {
    const raw=localStorage.getItem(key);

    if(!raw)
    {
     continue;
    }

    const parsed=JSON.parse(raw);

    if(parsed?._id)
    {
     return parsed;
    }

    if(parsed?.user?._id)
    {
     return parsed.user;
    }

    if(parsed?.data?._id)
    {
     return parsed.data;
    }
   }
   catch(err)
   {
    console.error(`Failed to parse localStorage key: ${key}`,err);
   }
  }

  return null;
 };

 const resolveUserId=value=>{
  if(!value)
  {
   return "";
  }

  if(typeof value==="string")
  {
   return value;
  }

  if(typeof value==="object"&&value._id)
  {
   return value._id;
  }

  return "";
 };

 const makeCodePart=value=>{
  if(!value)return "";
  const cleaned=value
   .trim()
   .toUpperCase()
   .replace(/&/g," AND ")
   .replace(/[^A-Z0-9\s-]/g," ")
   .replace(/\s+/g," ")
   .trim();

  if(!cleaned)return "";

  const words=cleaned.split(" ").filter(Boolean);

  if(words.length===1)
  {
   return words[0].slice(0,6);
  }

  return words.map(word=>word.slice(0,3)).join("").slice(0,12);
 };

 const getNotebookLabel=notebookId=>{
  if(note?.notebookData?._id===notebookId)
  {
   return note.notebookData.name||"";
  }

  const notebook=notebooks.find(nb=>nb._id===notebookId);
  return notebook?.name||"";
 };

 const getNoteTypeLabel=noteTypeId=>{
  const noteType=noteTypes.find(nt=>nt._id===noteTypeId);
  return noteType?.name||"";
 };

 const buildGeneratedNoteId=()=>{
  const notebookPart=makeCodePart(getNotebookLabel(form.notebook));
  const noteTypePart=makeCodePart(getNoteTypeLabel(form.noteType));
  const titlePart=makeCodePart(form.title);

  if(!notebookPart||!noteTypePart||!titlePart)
  {
   return "";
  }

  return`${notebookPart}-${noteTypePart}-${titlePart}-001`;
 };

 const resolvedUserId=resolveUserId(userId)||resolveUserId(note?.user)||resolveUserId(getStoredUser());

 const getToken=()=>{
  try
  {
   return (localStorage.getItem("token")||"").trim();
  }
  catch(err)
  {
   console.error("Failed to read token",err);
   return "";
  }
 };

 const getAuthHeaders=()=>{
  const token=getToken();
  return token?{
   Authorization:`Bearer ${token}`
  }:{};
 };

 const fetchNotebooks=async()=>{
  try
  {
   const query=resolvedUserId?`?user=${encodeURIComponent(resolvedUserId)}`:"";
   const res=await fetch(`/api/notebooks${query}`,{
    headers:{
     "Content-Type":"application/json",
     ...getAuthHeaders()
    }
   });
   const data=await res.json();

   if(Array.isArray(data.data))
   {
    setNotebooks(data.data);
   }
   else
   {
    setNotebooks([]);
   }
  }
  catch
  {
   setNotebooks([]);
  }
 };

 const fetchNoteTypes=async()=>{
  try
  {
   const res=await fetch("/api/note-types",{
    headers:{
     "Content-Type":"application/json",
     ...getAuthHeaders()
    }
   });
   const data=await res.json();

   if(Array.isArray(data.data))
   {
    setNoteTypes(data.data);
   }
   else
   {
    setNoteTypes([]);
   }
  }
  catch
  {
   setNoteTypes([]);
  }
 };

 const fetchTags=async()=>{
  try
  {
   const res=await fetch("/api/tags",{
    headers:{
     "Content-Type":"application/json",
     ...getAuthHeaders()
    }
   });
   const data=await res.json();

   if(Array.isArray(data.data))
   {
    setTags(data.data);
   }
   else
   {
    setTags([]);
   }
  }
  catch
  {
   setTags([]);
  }
 };

 useEffect(()=>{
  fetchNotebooks();
  fetchNoteTypes();
  fetchTags();
 },[]);

 useEffect(()=>{
  setForm({
   notebook:typeof note?.notebook==="object"&&note?.notebook?note.notebook._id||"":note?.notebook||"",
   noteType:typeof note?.noteType==="object"&&note?.noteType?note.noteType._id||"":note?.noteType||"",
   title:note?.title||"",
   noteId:note?.noteId||"",
   content:note?.content||"",
   summary:note?.summary||"",
   tags:Array.isArray(note?.tags)?note.tags.map(tag=>typeof tag==="object"&&tag?tag._id:tag):[],
   images:Array.isArray(note?.images)?note.images:[],
   attachments:Array.isArray(note?.attachments)?note.attachments:[],
   isArchived:note?.isArchived||false,
   isFavorite:note?.isFavorite||false,
   status:note?.status||"active"
  });

  setImageFiles([]);
  setAttachmentFiles([]);
 },[note]);

 useEffect(()=>{
  if(isEditing)
  {
   return;
  }

  const generatedNoteId=buildGeneratedNoteId();

  setForm(prev=>({
   ...prev,
   noteId:generatedNoteId
  }));
 },[form.title,form.notebook,form.noteType,notebooks,noteTypes,isEditing]);

 useEffect(()=>{
  if(autoFocusTitle&&titleRef.current)
  {
   titleRef.current.focus();
  }
 },[autoFocusTitle,showNotebookModal,showNoteTypeModal]);

 useEffect(()=>{
  const previews=imageFiles.map(file=>({
   name:file.name,
   url:URL.createObjectURL(file)
  }));

  setImagePreviews(previews);

  return()=>{
   previews.forEach(preview=>URL.revokeObjectURL(preview.url));
  };
 },[imageFiles]);

 const handleChange=e=>{
  const {name,value,type,checked}=e.target;

  if(type==="checkbox"&&name!=="tags")
  {
   setForm(prev=>({...prev,[name]:checked}));
   return;
  }

  setForm(prev=>({...prev,[name]:value}));
 };

 const handleTagChange=tagId=>{
  setForm(prev=>{
   const exists=prev.tags.includes(tagId);

   if(exists)
   {
    return{
     ...prev,
     tags:prev.tags.filter(id=>id!==tagId)
    };
   }

   return{
    ...prev,
    tags:[...prev.tags,tagId]
   };
  });
 };

 const handleImagesChange=e=>{
  const selectedFiles=Array.from(e.target.files||[]);
  setImageFiles(selectedFiles);
 };

 const handleAttachmentsChange=e=>{
  const selectedFiles=Array.from(e.target.files||[]);
  setAttachmentFiles(selectedFiles);
 };

 const clearSelectedImages=()=>{
  setImageFiles([]);
  if(imagesInputRef.current)
  {
   imagesInputRef.current.value="";
  }
 };

 const clearSelectedAttachments=()=>{
  setAttachmentFiles([]);
  if(attachmentsInputRef.current)
  {
   attachmentsInputRef.current.value="";
  }
 };

 const removeExistingImage=index=>{
  setForm(prev=>({
   ...prev,
   images:prev.images.filter((_,i)=>i!==index)
  }));
 };

 const removeExistingAttachment=index=>{
  setForm(prev=>({
   ...prev,
   attachments:prev.attachments.filter((_,i)=>i!==index)
  }));
 };

 const handleNewNotebookChange=e=>{
  const {name,value,type,checked}=e.target;

  setNewNotebook(prev=>({
   ...prev,
   [name]:type==="checkbox"?checked:value
  }));
 };

 const handleNewNoteTypeChange=e=>{
  const {name,value}=e.target;

  setNewNoteType(prev=>({
   ...prev,
   [name]:value
  }));
 };

 const handleCreateNotebook=async e=>{
  e.preventDefault();
  setSavingNotebook(true);
  setNotebookError("");

  if(!resolvedUserId)
  {
   setNotebookError("Cannot create notebook: missing user id.");
   setSavingNotebook(false);
   return;
  }

  try
  {
   const payload={
    user:resolvedUserId,
    name:newNotebook.name,
    description:newNotebook.description,
    color:newNotebook.color,
    isArchived:newNotebook.isArchived
   };

   const res=await fetch("/api/notebooks",{
    method:"POST",
    headers:{
     "Content-Type":"application/json",
     ...getAuthHeaders()
    },
    body:JSON.stringify(payload)
   });

   const data=await res.json();

   if(!res.ok)
   {
    throw new Error(data?.error||data?.message||"Failed to create notebook");
   }

   if(data.success&&data.data)
   {
    await fetchNotebooks();
    setForm(prev=>({...prev,notebook:data.data._id}));
    setNewNotebook({
     name:"",
     description:"",
     color:"#0f766e",
     isArchived:false
    });
    setShowNotebookModal(false);
   }
  }
  catch(err)
  {
   setNotebookError(err.message||"Failed to create notebook");
  }
  finally
  {
   setSavingNotebook(false);
  }
 };

 const handleCreateNoteType=async e=>{
  e.preventDefault();
  setSavingNoteType(true);
  setNoteTypeError("");

  try
  {
   const res=await fetch("/api/note-types",{
    method:"POST",
    headers:{
     "Content-Type":"application/json",
     ...getAuthHeaders()
    },
    body:JSON.stringify(newNoteType)
   });

   const data=await res.json();

   if(!res.ok)
   {
    throw new Error(data?.error||data?.message||"Failed to create note type");
   }

   if(data.success&&data.data)
   {
    await fetchNoteTypes();
    setForm(prev=>({...prev,noteType:data.data._id}));
    setNewNoteType({
     name:"",
     description:""
    });
    setShowNoteTypeModal(false);
   }
  }
  catch(err)
  {
   setNoteTypeError(err.message||"Failed to create note type");
  }
  finally
  {
   setSavingNoteType(false);
  }
 };

 const handleSubmit=async e=>{
  e.preventDefault();
  setSaving(true);
  setNoteError("");

  if(!resolvedUserId)
  {
   setNoteError("Cannot save note: missing user id.");
   setSaving(false);
   return;
  }

  try
  {
   const method=isEditing?"PUT":"POST";
   const url=isEditing?`/api/notes/${note._id}`:"/api/notes";
   const payload=new FormData();

   payload.append("user",resolvedUserId);
   payload.append("notebook",form.notebook||"");
   payload.append("noteType",form.noteType||"");
   payload.append("title",form.title||"");
   payload.append("noteId",form.noteId||"");
   payload.append("content",form.content||"");
   payload.append("summary",form.summary||"");
   payload.append("status",form.status||"active");
   payload.append("isArchived",String(form.isArchived));
   payload.append("isFavorite",String(form.isFavorite));
   payload.append("tags",JSON.stringify(form.tags));
   payload.append("existingImages",JSON.stringify(form.images));
   payload.append("existingAttachments",JSON.stringify(form.attachments));

   imageFiles.forEach(file=>{
    payload.append("images",file);
   });

   attachmentFiles.forEach(file=>{
    payload.append("attachments",file);
   });

   const res=await fetch(url,{
    method,
    headers:getAuthHeaders(),
    body:payload
   });

   const data=await res.json();

   if(!res.ok)
   {
    throw new Error(data?.error||data?.message||"Failed to save note");
   }

   if(onSuccess)
   {
    onSuccess(data?.data||data?.note||data);
   }
  }
  catch(err)
  {
   setNoteError(err.message||"Failed to save note");
  }
  finally
  {
   setSaving(false);
  }
 };

 return(
  <>
   <Form className="ztk-note-form" onSubmit={handleSubmit}>

    {noteError&&<Alert variant="danger">{noteError}</Alert>}

    <Row className="mb-3">

     <Col xs={12}>
      <div className="ztk-note-id-meta">
       <span className="ztk-note-id-label">Note ID</span>
       <span className="ztk-note-id-value">{form.noteId||"Generated after save"}</span>
      </div>
     </Col>

    </Row>

    <Row className="mb-3">

     <Col xs={12}>
      <Form.Group className="ztk-note-field">
       <Form.Label className="ztk-form-label">Title</Form.Label>
       <Form.Control ref={titleRef} className="ztk-form-control" type="text" name="title" value={form.title} onChange={handleChange} required/>
      </Form.Group>
     </Col>

    </Row>

    <Row className="mb-3">

     <Col md={6}>
      <Form.Group className="ztk-note-field">
       <div className="ztk-note-field-actions">
        <Form.Label className="ztk-form-label mb-0">Notebook</Form.Label>
        <Button type="button" size="sm" variant="outline-primary" onClick={()=>setShowNotebookModal(true)}>New Notebook</Button>
       </div>
       <Form.Select className="ztk-form-select" name="notebook" value={form.notebook} onChange={handleChange}>
        <option value="">None</option>
        {notebooks.map(nb=><option key={nb._id} value={nb._id}>{nb.name}</option>)}
       </Form.Select>
      </Form.Group>
     </Col>

     <Col md={6}>
      <Form.Group className="ztk-note-field">
       <div className="ztk-note-field-actions">
        <Form.Label className="ztk-form-label mb-0">Note Type</Form.Label>
        <Button type="button" size="sm" variant="outline-primary" onClick={()=>setShowNoteTypeModal(true)}>New Type</Button>
       </div>
       <Form.Select className="ztk-form-select" name="noteType" value={form.noteType} onChange={handleChange} required>
        <option value="">Select Type</option>
        {noteTypes.map(nt=><option key={nt._id} value={nt._id}>{nt.name}</option>)}
       </Form.Select>
      </Form.Group>
     </Col>

    </Row>

    <Form.Group className="mb-3 ztk-note-field ztk-note-field-top">
     <Form.Label className="ztk-form-label">Summary</Form.Label>
     <Form.Control className="ztk-form-control ztk-form-textarea" as="textarea" rows={3} name="summary" value={form.summary} onChange={handleChange}/>
    </Form.Group>

    <Form.Group className="mb-3 ztk-note-field ztk-note-field-top">
     <Form.Label className="ztk-form-label">Content</Form.Label>
     <div className="ztk-rich-text-wrapper">
      <RichTextEditor
       value={form.content}
       onChange={value=>setForm(prev=>({...prev,content:value}))}
      />
     </div>
    </Form.Group>

    <Form.Group className="mb-3 ztk-note-field ztk-note-field-top">
     <div className="ztk-note-field-actions">
      <Form.Label className="ztk-form-label mb-0">Images</Form.Label>
      <div className="ztk-note-button-row">
       <Button type="button" size="sm" variant="outline-primary" onClick={()=>imagesInputRef.current&&imagesInputRef.current.click()}>Browse</Button>
       <Button type="button" size="sm" variant="outline-danger" onClick={clearSelectedImages}>Clear Selected</Button>
      </div>
     </div>

     <Form.Control ref={imagesInputRef} className="ztk-file-input" type="file" accept="image/*" multiple onChange={handleImagesChange}/>

     {Array.isArray(form.images)&&form.images.length>0&&
      <div className="border rounded p-3 mb-3">
       <div className="fw-semibold mb-2">Existing Images</div>
       <div className="d-flex flex-wrap gap-3">
        {form.images.map((imageName,index)=>(
         <div key={`${imageName}-${index}`} className="border rounded p-2 text-center ztk-file-preview">
          <Image src={`/images/${imageName}`} thumbnail className="ztk-file-preview-image"/>
          <div className="small mt-2 text-break">{imageName}</div>
          <Button type="button" size="sm" variant="outline-danger" className="mt-2" onClick={()=>removeExistingImage(index)}>Clear</Button>
         </div>
        ))}
       </div>
      </div>
     }

     {imagePreviews.length>0&&
      <div className="border rounded p-3">
       <div className="fw-semibold mb-2">Selected Images</div>
       <div className="d-flex flex-wrap gap-3">
        {imagePreviews.map((preview,index)=>(
         <div key={`${preview.name}-${index}`} className="border rounded p-2 text-center ztk-file-preview">
          <Image src={preview.url} thumbnail className="ztk-file-preview-image"/>
          <div className="small mt-2 text-break">{preview.name}</div>
         </div>
        ))}
       </div>
      </div>
     }
    </Form.Group>

    <Form.Group className="mb-3 ztk-note-field ztk-note-field-top">
     <div className="ztk-note-field-actions">
      <Form.Label className="ztk-form-label mb-0">Attachments</Form.Label>
      <div className="ztk-note-button-row">
       <Button type="button" size="sm" variant="outline-primary" onClick={()=>attachmentsInputRef.current&&attachmentsInputRef.current.click()}>Browse</Button>
       <Button type="button" size="sm" variant="outline-danger" onClick={clearSelectedAttachments}>Clear Selected</Button>
      </div>
     </div>

     <Form.Control ref={attachmentsInputRef} className="ztk-file-input" type="file" multiple onChange={handleAttachmentsChange}/>

     {Array.isArray(form.attachments)&&form.attachments.length>0&&
      <div className="border rounded p-3 mb-3">
       <div className="fw-semibold mb-2">Existing Attachments</div>
       <div className="d-flex flex-column gap-2">
        {form.attachments.map((attachmentName,index)=>(
         <div key={`${attachmentName}-${index}`} className="d-flex justify-content-between align-items-center border rounded p-2">
          <a href={`/attachments/${attachmentName}`} target="_blank" rel="noreferrer" className="text-break">
           {attachmentName}
          </a>
          <Button type="button" size="sm" variant="outline-danger" onClick={()=>removeExistingAttachment(index)}>Clear</Button>
         </div>
        ))}
       </div>
      </div>
     }

     {attachmentFiles.length>0&&
      <div className="border rounded p-3">
       <div className="fw-semibold mb-2">Selected Attachments</div>
       <div className="d-flex flex-column gap-2">
        {attachmentFiles.map((file,index)=>(
         <div key={`${file.name}-${index}`} className="border rounded p-2 text-break">
          {file.name}
         </div>
        ))}
       </div>
      </div>
     }
    </Form.Group>

    <Form.Group className="mb-3 ztk-note-field ztk-note-field-top">
     <Form.Label className="ztk-form-label">Tags</Form.Label>

     <div className="border rounded p-3">
      <Row>
       {tags.map(tag=>(
        <Col md={4} key={tag._id} className="mb-2">
         <Form.Check className="ztk-form-check" type="checkbox" id={`tag-${tag._id}`} label={tag.name} checked={form.tags.includes(tag._id)} onChange={()=>handleTagChange(tag._id)}/>
        </Col>
       ))}
      </Row>
     </div>

    </Form.Group>

    <Row className="mb-3">

     <Col md={4}>
      <Form.Group className="ztk-note-field">
       <Form.Label className="ztk-form-label">Status</Form.Label>
       <Form.Select className="ztk-form-select" name="status" value={form.status} onChange={handleChange}>
        <option value="draft">Draft</option>
        <option value="active">Active</option>
        <option value="archived">Archived</option>
       </Form.Select>
      </Form.Group>
     </Col>

     <Col md={4} className="d-flex align-items-center">
      <Form.Check className="ztk-form-check" type="checkbox" label="Favorite" name="isFavorite" checked={form.isFavorite} onChange={handleChange}/>
     </Col>

     <Col md={4} className="d-flex align-items-center">
      <Form.Check className="ztk-form-check" type="checkbox" label="Archived" name="isArchived" checked={form.isArchived} onChange={handleChange}/>
     </Col>

    </Row>

    <Button type="submit" disabled={saving}>{saving?"Saving...":isEditing?"Update Note":"Create Note"}</Button>

   </Form>

   <Modal show={showNotebookModal} onHide={()=>setShowNotebookModal(false)} centered>
    <Modal.Header closeButton><Modal.Title>New Notebook</Modal.Title></Modal.Header>
    <Modal.Body>
     <Form onSubmit={handleCreateNotebook}>

      {notebookError&&<Alert variant="danger">{notebookError}</Alert>}

      <Form.Group className="mb-3">
       <Form.Label>Name</Form.Label>
       <Form.Control type="text" name="name" value={newNotebook.name} onChange={handleNewNotebookChange} required/>
      </Form.Group>

      <Form.Group className="mb-3">
       <Form.Label>Description</Form.Label>
       <Form.Control as="textarea" rows={3} name="description" value={newNotebook.description} onChange={handleNewNotebookChange}/>
      </Form.Group>

      <Row className="mb-3">
       <Col md={6}>
        <Form.Group>
         <Form.Label>Color</Form.Label>
         <Form.Control type="color" name="color" value={newNotebook.color} onChange={handleNewNotebookChange}/>
        </Form.Group>
       </Col>

       <Col md={6} className="d-flex align-items-center">
        <Form.Check type="checkbox" label="Archived" name="isArchived" checked={newNotebook.isArchived} onChange={handleNewNotebookChange}/>
       </Col>
      </Row>

      <Button type="submit" disabled={savingNotebook}>{savingNotebook?"Saving...":"Save Notebook"}</Button>

     </Form>
    </Modal.Body>
   </Modal>

   <Modal show={showNoteTypeModal} onHide={()=>setShowNoteTypeModal(false)} centered>
    <Modal.Header closeButton><Modal.Title>New Note Type</Modal.Title></Modal.Header>
    <Modal.Body>
     <Form onSubmit={handleCreateNoteType}>

      {noteTypeError&&<Alert variant="danger">{noteTypeError}</Alert>}

      <Form.Group className="mb-3">
       <Form.Label>Name</Form.Label>
       <Form.Control type="text" name="name" value={newNoteType.name} onChange={handleNewNoteTypeChange} required/>
      </Form.Group>

      <Form.Group className="mb-3">
       <Form.Label>Description</Form.Label>
       <Form.Control as="textarea" rows={3} name="description" value={newNoteType.description} onChange={handleNewNoteTypeChange}/>
      </Form.Group>

      <Button type="submit" disabled={savingNoteType}>{savingNoteType?"Saving...":"Save Note Type"}</Button>

     </Form>
    </Modal.Body>
   </Modal>
  </>
 );
}
