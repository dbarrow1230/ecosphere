import {useEffect,useState} from "react";
export default function DomainName({domain}){
 const id=String(domain?._id||domain?.$oid||domain||"");
 const label=domain?.name||domain?.code||"";
 const [resolved,setResolved]=useState(null);
 useEffect(()=>{
  if(!id||label)return;
  let active=true;
  let userId="";
  for(const key of ["userInfo","user","authUser","currentUser"]){try{const stored=JSON.parse(localStorage.getItem(key)||sessionStorage.getItem(key)||"null");const user=stored?.user||stored?.data||stored;userId=user?._id||user?.id||"";if(userId)break;}catch{/* Try another session key. */}}
  fetch(`/api/domains?userId=${encodeURIComponent(userId)}`,{credentials:"include"}).then(response=>{if(!response.ok)throw Error();return response.json();}).then(data=>{if(active){const found=data.data?.find(item=>String(item._id)===id);setResolved({id,label:found?.name||found?.code||"Domain unavailable"});}}).catch(()=>{if(active)setResolved({id,label:"Unable to load domain"});});
  return()=>{active=false;};
 },[id,label]);
 return label||(!id?"Not assigned":resolved?.id===id?resolved.label:"Loading domain…");
}
