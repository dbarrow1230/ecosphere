import {useEffect,useState} from "react";
const objectId=value=>String(value?._id||value?.id||value?.$oid||value||"");
const code=value=>String(value||"").trim().toUpperCase().replace(/[^A-Z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,24);
const subjectCode=value=>{const words=String(value||"").trim().toUpperCase().split(/[^A-Z0-9]+/).filter(Boolean);return (words.length>1?words.map(word=>word.slice(0,3)).join(""):words[0]||"GENERAL").slice(0,12);};
export default function useDomainIdPreview({form,editing,recordType,idField,subtype,subject}){
 const domainId=objectId(form.domainId);
 const changed=!!editing?._id&&domainId!==objectId(editing.domainId);
 const existingId=editing?.[idField]||"";
 const date=new Date(editing?.createdAt||Date.now());
 const dateCode=[date.getFullYear(),String(date.getMonth()+1).padStart(2,"0"),String(date.getDate()).padStart(2,"0")].join("");
 const key=JSON.stringify([domainId,form.domainCode,recordType,subtype,subject,dateCode]);
 const [result,setResult]=useState(null);
 useEffect(()=>{
  if(!changed)return;
  let active=true;
  const load=async()=>{
   try{
    let userId="";
    for(const name of ["userInfo","user","authUser","currentUser"]){try{const stored=JSON.parse(localStorage.getItem(name)||sessionStorage.getItem(name)||"null");userId=objectId(stored?.user||stored?.data||stored);if(userId)break;}catch{/* Try another session key. */}}
    let domainCode=form.domainCode;
    if(domainId&&!domainCode){const response=await fetch(`/api/domains?userId=${encodeURIComponent(userId)}`,{credentials:"include"});if(!response.ok)throw Error();const data=await response.json();domainCode=data.data?.find(item=>objectId(item)===domainId)?.code;if(!domainCode)throw Error();}
    const response=await fetch("/api/id-sequences/preview",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId,recordType,projectCode:code(domainCode)||"GENERAL",subtypeCode:code(subtype)||"GENERAL",subjectCode:subjectCode(subject)+"-"+dateCode})});
    const data=await response.json();if(!response.ok||!data.data?.generatedId)throw Error();
    if(active)setResult({key,value:data.data.generatedId});
   }catch{if(active)setResult({key,value:"ID will be generated when saved"});}
  };
  load();return()=>{active=false;};
 },[changed,key,domainId,form.domainCode,recordType,subtype,subject,dateCode]);
 return changed?(result?.key===key?result.value:"Previewing ID..."):existingId;
}
