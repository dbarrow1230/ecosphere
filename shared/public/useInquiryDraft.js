import {useEffect,useState} from "react";
import {useLocation} from "react-router-dom";
import {usePublicSite} from "./PublicSiteContext.jsx";

// Data and email-draft state only. Every business authors its own contact UI.
export default function useInquiryDraft(defaultTopic=""){
 const {business,site,name}=usePublicSite(),{search}=useLocation();
 const topic=new URLSearchParams(search).get("topic")||defaultTopic;
 const [fields,setFields]=useState({name:"",email:"",topic,message:""}),[draft,setDraft]=useState("");
 useEffect(()=>{setFields(current=>({...current,topic}));setDraft("");},[topic]);
 const email=typeof business?.email==="string"&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(business.email)?business.email:"";
 const phone=typeof business?.phone==="string"?business.phone:"";
 const address=[business?.addressLine1,business?.addressLine2,business?.city].filter(Boolean).join(", ");
 const edit=event=>{const {name,value}=event.target;setFields(current=>({...current,[name]:value}));setDraft("");};
 const prepare=event=>{
  event.preventDefault();if(!email)return;
  const extra=Object.entries(fields).filter(([key,value])=>!["name","email","topic","message"].includes(key)&&value).map(([key,value])=>`${key}: ${value}`).join("\n");
  const body=`Name: ${fields.name}\nReply email: ${fields.email}\n${extra}\n\n${fields.message}`;
  setDraft(`mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(fields.topic||name)}&body=${encodeURIComponent(body)}`);
 };
 return {fields,edit,prepare,draft,email,phone,address,site,name};
}
