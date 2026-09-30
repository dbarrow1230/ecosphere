import {useEffect,useMemo,useState} from "react";

const getStoredUserId=()=>{
 for(const key of ["userInfo","user","authUser","currentUser"]){
  try{
   const parsed=JSON.parse(localStorage.getItem(key)||sessionStorage.getItem(key)||"null");
   const value=parsed?.user||parsed?.data||parsed;
   const id=value?._id||value?.id||value?.$oid||value?._id?.$oid||value?.id?.$oid;
   if(id)return String(id);
  }catch{
   continue;
  }
 }
 return "";
};

export default function useRecordSubtypes(recordType,provided=[]){
 const [loaded,setLoaded]=useState([]);

 useEffect(()=>{
  const userId=getStoredUserId();
  if(!userId||!recordType)return;
  let active=true;
  const params=new URLSearchParams({userId,recordType,status:"active"});
  fetch(`/api/record-subtypes?${params}`,{credentials:"include"})
   .then(response=>response.json().then(data=>({ok:response.ok,data})))
   .then(({ok,data})=>{if(active&&ok)setLoaded(Array.isArray(data?.data)?data.data:[]);})
   .catch(()=>{});
  return()=>{active=false;};
 },[recordType]);

 return useMemo(()=>{
  const records=new Map();
  for(const subtype of [...provided,...loaded]){
   if(String(subtype?.status||"active").toLowerCase()!=="active")continue;
   const key=String(subtype?._id||subtype?.code||subtype?.name||"");
   if(key)records.set(key,subtype);
  }
  return [...records.values()].sort((a,b)=>String(a.name||a.code||"").localeCompare(String(b.name||b.code||""),undefined,{sensitivity:"base"}));
 },[provided,loaded]);
}
