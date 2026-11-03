import {createContext,useContext,useEffect,useState} from "react";
import {applyBusinessTheme} from "../utils/applyBusinessTheme.js";

const BusinessBrandContext=createContext({business:null,tagline:""});
export const useBusinessBrand=()=>useContext(BusinessBrandContext);
const apiBase=import.meta.env.VITE_PUBLIC_API_URL||"";
const getId=value=>typeof value==="string"?value:value?._id?.$oid||value?._id||value?.$oid||"";

export function BusinessBrandProvider({children}){
 const [business,setBusiness]=useState(null);
 const [taglines,setTaglines]=useState([]);
 const [index,setIndex]=useState(0);
 useEffect(()=>{
  let cancelled=false;
  const controller=new AbortController();
  const load=async()=>{
   try{
    const key=String(import.meta.env.VITE_APP_KEY||document.querySelector('meta[name="app-key"]')?.content||"");
    if(!key)return;
    const response=await fetch(`${apiBase}/api/app/current-business/${encodeURIComponent(key)}`,{signal:controller.signal});
    if(!response.ok)return;
    const payload=await response.json();
    const saved=payload.business||payload.data||null;
    if(cancelled||!saved)return;
    applyBusinessTheme(saved);
    setBusiness(saved);
    const businessId=getId(saved);
    if(!businessId)return;
    const taglineResponse=await fetch(`${apiBase}/api/taglines?business_id=${encodeURIComponent(businessId)}&isActive=true`,{signal:controller.signal});
    if(!taglineResponse.ok)return;
    const rows=await taglineResponse.json();
    const active=(Array.isArray(rows)?rows:rows.data||rows.taglines||[]).filter(row=>row.isActive!==false&&row.text);
    const selected=getId(saved.taglineId);
    active.sort((a,b)=>Number(getId(b)===selected)-Number(getId(a)===selected));
    if(!cancelled){setTaglines(active);setIndex(0);}
   }catch(error){if(error.name!=="AbortError")console.error("Public business settings could not be loaded.");}
  };
  load();
  window.addEventListener("focus",load);
  return()=>{cancelled=true;controller.abort();window.removeEventListener("focus",load);};
 },[]);
 useEffect(()=>{
  if(taglines.length<2)return;
  const timer=window.setInterval(()=>setIndex(current=>(current+1)%taglines.length),6000);
  return()=>window.clearInterval(timer);
 },[taglines]);
 return <BusinessBrandContext.Provider value={{business,tagline:taglines[index]?.text||""}}>{children}</BusinessBrandContext.Provider>;
}

export const publicAssetUrl=value=>{
 if(!value)return "";
 if(/^https?:\/\//i.test(value))return value;
 return `${apiBase}${value.startsWith("/")?value:`/logos/${value}`}`;
};
