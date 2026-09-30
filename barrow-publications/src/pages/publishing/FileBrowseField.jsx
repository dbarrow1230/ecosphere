import {useId,useState} from "react";
import {FileText,Image,UploadCloud,X} from "lucide-react";

const fileName=value=>{try{return decodeURIComponent(String(value).split("/").pop().split("?")[0]);}catch{return String(value).split("/").pop();}};
const isImage=value=>/\.(png|jpe?g|gif|webp|avif|svg)(?:$|[?#])/i.test(value);
const isPdf=value=>/\.pdf(?:$|[?#])/i.test(value);

export function FilePreview({value,label="Attached file"}){
 return <a className="publishing-file-preview" href={value} target="_blank" rel="noreferrer" aria-label={`Open ${label}: ${fileName(value)}`}><span>{isImage(value)?<img src={value} alt=""/>:<FileText size={24}/>}</span><strong>{fileName(value)}</strong><small>Open file</small></a>;
}

export default function FileBrowseField({field,value,onChange,onUploadChange}){
 const inputId=useId();
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const upload=async event=>{
  const chosen=event.target.files?.[0];
  if(!chosen)return;
  setBusy(true);setError("");onUploadChange(1);
  try{
   const body=new FormData();body.append("file",chosen);
   const token=(localStorage.getItem("token")||sessionStorage.getItem("token")||"").replace(/^["']|["']$/g,"");
   const response=await fetch(`/api/upload/${field.directory}`,{method:"POST",headers:token?{Authorization:`Bearer ${token}`}:{},body});
   const data=await response.json().catch(()=>({}));
   if(!response.ok||!data.url)throw new Error(data.message||"File upload failed.");
   onChange(encodeURI(data.url));
  }catch(cause){setError(cause.message);}
  finally{setBusy(false);onUploadChange(-1);event.target.value="";}
 };
 return <div className="publishing-file-field"><span className="publishing-file-label">{field.label}</span><div className="publishing-file-card"><div className="publishing-file-thumb">{value&&isImage(value)?<img src={value} alt="Selected file preview"/>:value&&isPdf(value)?<iframe src={`${value}#page=1&toolbar=0`} title={`${field.label} preview`}/>:value?<FileText size={27}/>:<Image size={27}/>}</div><div className="publishing-file-copy"><strong>{value?fileName(value):"No file selected"}</strong><small>{busy?"Uploading…":value?"Stored file — browse to replace it":"Browse for a file to attach"}</small></div><div className="publishing-file-actions"><label htmlFor={inputId} className={`publishing-file-browse${busy?" is-busy":""}`}><UploadCloud size={16}/>{busy?"Uploading":"Browse"}</label>{value&&<button type="button" aria-label={`Remove ${field.label}`} disabled={busy} onClick={()=>onChange("")}><X size={16}/></button>}</div></div><input id={inputId} type="file" className="publishing-file-input" onChange={upload} disabled={busy} accept={field.directory.includes("cover")?"image/*,.pdf":undefined}/>{error&&<small role="alert" className="publishing-book-error">{error}</small>}</div>;
}
