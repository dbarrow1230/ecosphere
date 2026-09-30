import {useCallback,useEffect,useRef,useState} from "react";
import {Button,Form,Modal,Spinner} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import RichTextEditor from "./RichTextEditor.jsx";
import RichTextContent from "./RichTextContent.jsx";
import {createStructureDocument,createStructureDraft,extractSavedOutline,getOrderedZettels} from "../utils/structureDraft.js";
import {createDocx} from "../utils/docxExport.js";
import "../styles/StructureWritingModal.css";

const objectId=value=>typeof value==="string"?value:value?._id?.$oid||value?._id||value?.id||"";
const fileName=value=>String(value||"Untitled document").replace(/[<>:"/\\|?*\x00-\x1f]/g,"").trim().slice(0,100)||"Untitled document";

export default function StructureWritingModal({structureId,userId,onClose}){
 const navigate=useNavigate();
 const storageKey=`structure-writing:${userId}:${structureId}`;
 const previewAbort=useRef(null);
 const [structure,setStructure]=useState(null);
 const [title,setTitle]=useState("");
 const [body,setBody]=useState("");
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 const [savedAt,setSavedAt]=useState(null);
 const [savedVersion,setSavedVersion]=useState(null);
 const [saving,setSaving]=useState(false);
 const [downloaded,setDownloaded]=useState(false);
 const [previewNote,setPreviewNote]=useState(null);
 const [previewLoading,setPreviewLoading]=useState(false);
 const [previewError,setPreviewError]=useState("");

 useEffect(()=>{
  let active=true;
  const load=async()=>{
   try{
    const response=await fetch(`/api/structure-notes/${encodeURIComponent(structureId)}?userId=${encodeURIComponent(userId)}`,{credentials:"include"});
    const data=await response.json().catch(()=>null);
    if(!response.ok)throw new Error(data?.message||"Unable to load structure note");
    const record=data?.data;
    if(!record)throw new Error("Structure note not found");
    if(!active)return;
    setStructure(record);
    let saved=null;
    try{saved=JSON.parse(localStorage.getItem(storageKey)||"null");}catch{/* Use the structure outline. */}
    const serverDraft=record.writingDraft;
    const localBody=typeof saved?.body==="string"?(saved.version===2?saved.body:extractSavedOutline(saved.body)):"";
    const localHasContent=Boolean(localBody.replace(/<[^>]*>/g,"").trim());
    const serverHasContent=Boolean(serverDraft?.body?.replace(/<[^>]*>/g,"").trim());
    const localIsNewer=localHasContent&&(!serverDraft?.savedAt||new Date(saved.updatedAt||0)>new Date(serverDraft.savedAt));
    const chosen=localIsNewer?{title:saved.title,body:localBody}:serverHasContent?serverDraft:null;
    setTitle(chosen?.title||record.title||"Untitled document");
    setBody(chosen?.body||createStructureDraft(record));
    setSavedAt(serverDraft?.savedAt||null);
    setSavedVersion(serverDraft?.savedAt?{title:serverDraft.title,body:serverDraft.body}:null);
   }catch(loadError){if(active)setError(loadError.message);}
   finally{if(active)setLoading(false);}
  };
  load();
  return()=>{active=false;previewAbort.current?.abort();};
 },[structureId,userId,storageKey]);

 const persistDraft=useCallback(()=>{
  try{
   localStorage.setItem(storageKey,JSON.stringify({version:2,title,body,updatedAt:new Date().toISOString()}));
   return true;
  }catch{setError("This browser could not save your draft locally. Download a DOCX to keep a copy.");return false;}
 },[storageKey,title,body]);
 useEffect(()=>{
  if(!structure)return;
  const timer=window.setTimeout(persistDraft,600);
  return()=>window.clearTimeout(timer);
 },[structure,persistDraft]);

 useEffect(()=>{
  if(!notice&&!error)return;
  const timer=window.setTimeout(()=>{setNotice("");setError("");},6500);
  return()=>window.clearTimeout(timer);
 },[notice,error]);
 const saveDraft=async()=>{
  setSaving(true);
  try{
   const response=await fetch(`/api/structure-notes/${encodeURIComponent(structureId)}/writing-draft`,{
    method:"PUT",headers:{"Content-Type":"application/json"},credentials:"include",
    body:JSON.stringify({userId,title,body})
   });
   const data=await response.json().catch(()=>null);
   if(!response.ok)throw new Error(data?.message||"Unable to save draft");
   persistDraft();
   setSavedAt(data?.data?.savedAt||new Date().toISOString());
   setSavedVersion({title,body});
   setNotice("Draft saved to your structure note.");
   setError("");
  }catch(saveError){setError(saveError.message);}
  finally{setSaving(false);}
 };
 const close=()=>{
  if(structure)persistDraft();
  onClose();
 };
 const downloadDocx=()=>{
  try{
   const blob=createDocx(title,createStructureDocument(structure,body));
   const url=URL.createObjectURL(blob);
   const link=document.createElement("a");
   link.href=url;
   link.download=`${fileName(title)}.docx`;
   document.body.appendChild(link);
   link.click();
   link.remove();
   window.setTimeout(()=>URL.revokeObjectURL(url),1000);
   persistDraft();
   setDownloaded(true);
   setNotice("DOCX downloaded. Open the Output form to add metadata and attach the file.");
  }catch(exportError){setError(exportError.message||"Unable to create DOCX");}
 };
 const openNote=async note=>{
  previewAbort.current?.abort();
  const controller=new AbortController();
  previewAbort.current=controller;
  setPreviewNote(note);
  setPreviewLoading(true);
  setPreviewError("");
  try{
   const response=await fetch(`/api/zettels/${encodeURIComponent(objectId(note))}?userId=${encodeURIComponent(userId)}`,{credentials:"include",signal:controller.signal});
   const data=await response.json().catch(()=>null);
   if(!response.ok)throw new Error(data?.message||"Unable to load note");
   if(!controller.signal.aborted)setPreviewNote(data?.data||note);
  }catch(loadError){if(!controller.signal.aborted){setPreviewError(loadError.message);setError(loadError.message);}}
  finally{if(!controller.signal.aborted)setPreviewLoading(false);}
 };
 const closePreview=()=>{previewAbort.current?.abort();setPreviewNote(null);setPreviewError("");};
 const linkedNotes=structure?getOrderedZettels(structure):[];
 const hasUnsavedEdits=!savedVersion||savedVersion.title!==title||savedVersion.body!==body;
 const openOutputForm=()=>{close();navigate("/outputs?new=1");};

 return <>
  {(notice||error)&&<div className={`structure-writing-toast ${error?"is-error":""}`} role={error?"alert":"status"}>{error||notice}<button type="button" aria-label="Dismiss message" onClick={()=>{setError("");setNotice("");}}>×</button></div>}
  <Modal show onHide={close} backdrop="static" keyboard={false} centered scrollable size="xl" className="structure-writing-modal" enforceFocus={!previewNote}>
   <Modal.Header closeButton><Modal.Title>Write from {structure?.title||"structure note"}</Modal.Title></Modal.Header>
   <Modal.Body>
    {loading?<div className="text-center py-5"><Spinner animation="border"/></div>:!structure?<p>Unable to open the structure note.</p>:<>
     <section className="structure-writing-context" aria-label="Structure note reference">
      <div className="structure-writing-context-grid">
       <section><h3>Purpose</h3><RichTextContent value={structure.purpose} empty="No purpose recorded."/></section>
       <section><h3>Summary</h3><RichTextContent value={structure.summary} empty="No summary recorded."/></section>
      </div>
      <section className="structure-writing-note-links"><h3>Note links</h3>
       {linkedNotes.length?<div>{linkedNotes.map(note=><Button key={objectId(note)} type="button" variant="link" onClick={()=>openNote(note)}>{note.title||note.zettelId||"Untitled note"}</Button>)}</div>:<p>No linked notes.</p>}
      </section>
     </section>
     <section className="structure-writing-document" aria-label="Editable document">
      <Form.Group className="mb-3"><Form.Label htmlFor="writing-title">Document title</Form.Label><Form.Control id="writing-title" value={title} onChange={event=>{setTitle(event.target.value);setDownloaded(false);}}/></Form.Group>
      <h3>Outline and document</h3>
      <RichTextEditor value={body} onChange={value=>{setBody(value);setDownloaded(false);}} placeholder="Develop the outline and write your answer here." minHeight="27rem"/>
     </section>
    </>}
   </Modal.Body>
   <Modal.Footer><span className="structure-writing-footer-hint">{hasUnsavedEdits?"Unsaved edits":savedAt?`Draft saved ${new Date(savedAt).toLocaleString()}`:"Draft not saved"}</span><Button variant="primary" onClick={saveDraft} disabled={!structure||saving||!title.trim()}>{saving?"Saving…":"Save draft"}</Button><Button variant="outline-primary" onClick={downloadDocx} disabled={!structure||!title.trim()}>Download DOCX</Button>{downloaded&&<Button variant="outline-secondary" onClick={openOutputForm}>Open Output form</Button>}</Modal.Footer>
  </Modal>
  <Modal show={!!previewNote} onHide={closePreview} centered size="lg" className="structure-writing-note-preview" backdrop="static">
   <Modal.Header closeButton><Modal.Title>{previewNote?.title||"Linked note"}</Modal.Title></Modal.Header>
   <Modal.Body>
    {previewLoading?<div className="text-center py-4"><Spinner animation="border"/></div>:<>
     {previewError&&<p>Unable to load the full note.</p>}
     {previewNote?.zettelId&&<p><code>{previewNote.zettelId}</code></p>}
     <h3>Main idea</h3><RichTextContent value={previewNote?.mainIdea} empty="No main idea recorded."/>
     {previewNote?.body&&<><h3 className="mt-4">Note</h3><RichTextContent value={previewNote.body}/></>}
    </>}
   </Modal.Body>
   <Modal.Footer><Button variant="secondary" onClick={closePreview}>Back to writing</Button></Modal.Footer>
  </Modal>
 </>;
}
