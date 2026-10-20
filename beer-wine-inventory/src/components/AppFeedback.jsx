import {useEffect,useState} from "react";
import {Toast,ToastContainer,Modal,Button} from "react-bootstrap";

export default function AppFeedback(){
 const [notice,setNotice]=useState(null);
 const [confirmations,setConfirmations]=useState([]);
 useEffect(()=>{
  let invalidQueued=false;
  const invalid=event=>{
   event.preventDefault();
   if(invalidQueued)return;
   invalidQueued=true;
   queueMicrotask(()=>{invalidQueued=false;});
   const field=event.target;
   const label=field.labels?.[0]?.textContent?.trim().replace(/:$/,"")||field.name||"This field";
   const message=field.validity.valueMissing?`${label} is required.`:`${label}: ${field.validationMessage}`;
   setNotice({message,variant:"danger"});
  };
  const show=event=>setNotice(event.detail);
  const confirm=event=>setConfirmations(queue=>[...queue,event.detail]);
  document.addEventListener("invalid",invalid,true);
  window.addEventListener("app:notice",show);
  window.addEventListener("app:confirm",confirm);
  return()=>{document.removeEventListener("invalid",invalid,true);window.removeEventListener("app:notice",show);window.removeEventListener("app:confirm",confirm);};
 },[]);
 const answer=value=>{confirmations[0]?.resolve(value);setConfirmations(queue=>queue.slice(1));};
 return <><ToastContainer position="top-end" className="app-feedback"><Toast show={Boolean(notice)} onClose={()=>setNotice(null)} autohide delay={10000} role={notice?.variant==="success"?"status":"alert"} aria-live={notice?.variant==="success"?"polite":"assertive"}><Toast.Header><strong className="me-auto">{notice?.variant==="success"?"Success":"Please check"}</strong></Toast.Header><Toast.Body>{notice?.message}</Toast.Body></Toast></ToastContainer><Modal show={confirmations.length>0} onHide={()=>answer(false)} centered><Modal.Header closeButton><Modal.Title>Confirm action</Modal.Title></Modal.Header><Modal.Body>{confirmations[0]?.message}</Modal.Body><Modal.Footer><Button variant="secondary" onClick={()=>answer(false)}>Cancel</Button><Button variant="primary" onClick={()=>answer(true)}>Confirm</Button></Modal.Footer></Modal></>;
}
