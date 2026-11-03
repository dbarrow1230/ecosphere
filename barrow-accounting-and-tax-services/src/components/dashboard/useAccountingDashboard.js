import {useCallback,useEffect,useRef,useState} from "react";
import {sessionToken} from "../../../../shared/public/websiteAccess.js";

export default function useAccountingDashboard(){
 const [data,setData]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState("");
 const generation=useRef(0);
 const refresh=useCallback(async()=>{
  const run=++generation.current;
  setLoading(true);setError("");
  try{
   const response=await fetch("/api/dashboard",{headers:{Authorization:`Bearer ${sessionToken()}`},credentials:"include"});
   const result=await response.json();
   if(!response.ok)throw Error(result.message||"Unable to load the accounting dashboard.");
   if(run===generation.current)setData(result);
  }catch(cause){if(run===generation.current)setError(cause.message);}finally{if(run===generation.current)setLoading(false);}
 },[]);
 useEffect(()=>{
  refresh();window.addEventListener("ECOSPHERE_AUTH_UPDATED",refresh);
  return()=>{generation.current++;window.removeEventListener("ECOSPHERE_AUTH_UPDATED",refresh);};
 },[refresh]);
 const save=async(path,payload,method="POST")=>{
  const response=await fetch(`/api/dashboard/${path}`,{method,headers:{"Content-Type":"application/json",Authorization:`Bearer ${sessionToken()}`},credentials:"include",body:JSON.stringify(payload)});
  const result=await response.json();
  if(!response.ok)throw Error(result.message||"Unable to save this change.");
  await refresh();return result;
 };
 return {data,loading,error,refresh,save};
}
