import {useEffect,useRef,useState} from "react";
import {createPortal} from "react-dom";
import {Alert as BootstrapAlert} from "react-bootstrap";
import "../styles/ErrorPopup.css";

const messageText=value=>Array.isArray(value)?value.map(messageText).join(' '):value&&typeof value==='object'?messageText(value.props?.children):String(value??'');
function notificationHost(){
 let host=document.getElementById('app-notifications');
 if(!host){host=document.createElement('div');host.id='app-notifications';host.setAttribute('popover','manual');document.body.appendChild(host);}
 // Native popover puts notifications above modal stacking contexts without blocking forms.
 if(host.showPopover&&!host.matches(':popover-open'))host.showPopover();
 return host;
}
export default function AppAlert({variant,children,show=true,onClose,notification=false,...props}){
 const text=messageText(children);
 const floating=notification||variant==='danger'||variant==='success'||/\b(saving|deleting|updating|importing|processing)\b/i.test(text);
 const [dismissed,setDismissed]=useState(null);
 const [host,setHost]=useState(null);
 const closeRef=useRef(onClose);closeRef.current=onClose;
 const messageKey=variant+':'+text;
 useEffect(()=>{
  if(!floating||!show)return;
  setHost(notificationHost());setDismissed(null);
  const timeout=setTimeout(()=>{setDismissed(messageKey);closeRef.current?.();},10000);
  return()=>clearTimeout(timeout);
 },[floating,show,messageKey]);
 if(!floating)return <BootstrapAlert variant={variant} show={show} onClose={onClose} {...props}>{children}</BootstrapAlert>;
 if(!show||dismissed===messageKey||!host)return null;
 const close=()=>{setDismissed(messageKey);closeRef.current?.();};
 return createPortal(<div className={`app-notification app-notification-${variant||'info'}`} role={variant==='danger'?'alert':'status'} aria-atomic="true">
  <div><strong>{variant==='danger'?'Error':variant==='success'?'Success':'In progress'}</strong><div className="app-notification-message">{children}</div><small>Closes automatically after 10 seconds</small></div>
  <button type="button" className="btn-close" aria-label="Dismiss notification" onClick={close}/>
 </div>,host);
}
