import {useEffect,useState} from "react";
import {Button,Form} from "react-bootstrap";
import "./DomainSelect.css";
const userId=()=>{for(const key of ["userInfo","user","authUser","currentUser"]){try{const value=JSON.parse(localStorage.getItem(key)||sessionStorage.getItem(key)||"null");const item=value?.user||value?.data||value;if(item?._id||item?.id)return item._id||item.id;}catch{/* Ignore malformed stored sessions. */}}return "";};
export default function DomainSelect({value,onChange,required=true,className=""}){
 const [domains,setDomains]=useState([]);
 const [adding,setAdding]=useState(false);
 const [name,setName]=useState("");
 const [saving,setSaving]=useState(false);
 const selectedValue=String(value?._id||value?.id||value?.$oid||value||"");
 useEffect(()=>{fetch(`/api/domains?userId=${userId()}`,{credentials:"include"}).then(r=>r.json()).then(data=>setDomains((data.data||[]).filter(item=>item.status==="active"||String(item._id)===selectedValue)));},[selectedValue]);
 const createDomain=async()=>{
  const trimmed=name.trim();
  if(!trimmed)return;
  setSaving(true);
  try{
   const response=await fetch("/api/domains",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({userId:userId(),name:trimmed})});
   const data=await response.json();
   if(!response.ok)throw new Error(data.message||"Unable to add domain");
   setDomains(current=>[...current,data.data].sort((a,b)=>a.name.localeCompare(b.name)));
   onChange(data.data._id,data.data);
   setName("");
   setAdding(false);
  }catch(error){
   window.alert(error.message);
  }finally{setSaving(false);}
 };
 return <Form.Group className={`domain-field ${className}`.trim()}><div className="domain-field__layout"><div className="domain-field__label"><Form.Label>Domain</Form.Label></div><div className="domain-field__body"><div className="domain-field__controls"><Form.Select required={required} value={selectedValue} onChange={event=>onChange(event.target.value,domains.find(domain=>String(domain._id)===event.target.value)||null)}><option value="">Choose domain</option>{domains.map(domain=><option key={domain._id} value={domain._id}>{domain.name}</option>)}</Form.Select><Button type="button" size="sm" variant="outline-primary" onClick={()=>setAdding(current=>!current)}>Add New Domain</Button></div>{adding&&<div className="domain-field__create"><Form.Control value={name} onChange={event=>setName(event.target.value)} placeholder="New domain name"/><Button type="button" disabled={saving||!name.trim()} onClick={createDomain}>{saving?"Saving...":"Save Domain"}</Button></div>}</div></div></Form.Group>;
}
