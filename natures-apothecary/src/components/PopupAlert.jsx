import {isValidElement,useEffect,useRef,useState} from "react";
import {createPortal} from "react-dom";
import {Alert as BootstrapAlert} from "react-bootstrap";

const asText=value=>{
 if(value==null||typeof value==="boolean")return "";
 if(Array.isArray(value))return value.map(asText).join("");
 if(isValidElement(value))return asText(value.props.children);
 return String(value);
};

export default function PopupAlert({children,onClose,show=true,variant="info",className="",...props}){
 const[visible,setVisible]=useState(true);
 const onCloseRef=useRef(onClose);
 onCloseRef.current=onClose;
 const message=asText(children);

 useEffect(()=>{
  if(!show)return;
  setVisible(true);
  const timer=setTimeout(()=>{
   setVisible(false);
   onCloseRef.current?.();
  },10000);
  return()=>clearTimeout(timer);
 },[message,variant,show]);

 if(!show||!visible)return null;
 const target=document.getElementById("popup-alert-root");
 if(!target)return null;

 const close=()=>{
  setVisible(false);
  onCloseRef.current?.();
 };

 return createPortal(
  <BootstrapAlert {...props} variant={variant} dismissible onClose={close} className={`popup-alert ${className}`.trim()}>{children}</BootstrapAlert>,
  target
 );
}
