import {useEffect,useState} from "react";

const tokens={bg:"--bg",bgAlt:"--bg-alt",surface:"--surface",surface2:"--surface-2",text:"--text",textSoft:"--text-soft",textInverse:"--text-inverse",heading:"--heading",primary:"--primary",primaryHover:"--primary-hover",secondary:"--secondary",secondaryHover:"--secondary-hover",accent:"--accent",border:"--border",borderStrong:"--border-strong",danger:"--danger",success:"--success"};
const value=token=>typeof token==="string"?token.trim():typeof token?.value==="string"?token.value.trim():"";
const id=record=>typeof record==="string"?record:record?._id?.$oid||record?._id||record?.$oid||"";
export const apiBase=()=>String(import.meta.env?.VITE_PUBLIC_API_URL||"").replace(/\/$/,"");
export function assetUrl(source){if(!source)return "";if(/^https?:\/\//i.test(source)||/^data:image\/(png|jpe?g|webp|gif|avif);base64,/i.test(source))return source;return `${apiBase()}${source.startsWith("/")?source:`/logos/${source}`}`;}

export function businessStyle(business){
 const theme=business?.themeColors||{},style={};
 for(const [key,property] of Object.entries(tokens)){const saved=value(theme[key]);if(saved)style[property]=saved;}
 for(const [key,property] of [["fontHeading","--font-heading"],["fontBody","--font-body"]]){
  const font=theme[key];
  if(font?.fontName?.trim())style[property]=`"${font.fontName.trim().replaceAll('"',"")}"${font.fallbackFont?`,${font.fallbackFont}`:""}`;
 }
 const treatment=theme.backgroundTreatment;
 if(treatment?.mode==="gradient"&&treatment.gradientStart&&treatment.gradientEnd){
  const start=value(treatment.gradientStart),end=value(treatment.gradientEnd);
  const stop=(color,position)=>position!==undefined&&Number.isFinite(Number(position))?`${color} ${Number(position)}%`:color;
  if(start&&end){const stops=`${stop(start,treatment.gradientStartStop)},${stop(end,treatment.gradientEndStop)}`;style["--public-background"]=treatment.gradientType==="radial"?`radial-gradient(circle,${stops})`:`linear-gradient(${treatment.gradientDirection||"to bottom"},${stops})`;}
 }
 if(treatment?.mode==="image"&&treatment.image){
  style["--public-background-image"]=`url(${JSON.stringify(assetUrl(treatment.image))})`;
  style["--public-background-image-opacity"]=Number.isFinite(Number(treatment.imageOpacity))?Math.max(0,Math.min(1,Number(treatment.imageOpacity))):0;
  style["--public-background-image-position"]=treatment.imagePosition||"center";
  style["--public-background-image-size"]=treatment.imageSize||"cover";
  style["--public-background-image-repeat"]=treatment.imageRepeat||"no-repeat";
 }
 return style;
}

export default function usePublicBusiness(appKey){
 const [business,setBusiness]=useState(null),[taglines,setTaglines]=useState([]),[taglineIndex,setTaglineIndex]=useState(0);
 useEffect(()=>{
  const controller=new AbortController();let generation=0;
  const load=async()=>{
   const current=++generation;
   try{
   const effectiveKey=String(import.meta.env.VITE_APP_KEY||appKey);
   const response=await fetch(`${apiBase()}/api/app/current-business/${encodeURIComponent(effectiveKey)}`,{signal:controller.signal});
    if(!response.ok)return;
    const body=await response.json(),saved=body.business||body.data||null;
    if(current!==generation||controller.signal.aborted)return;
    setBusiness(saved);setTaglines([]);setTaglineIndex(0);
    if(!id(saved))return;
    const taglineResponse=await fetch(`${apiBase()}/api/taglines?business_id=${encodeURIComponent(id(saved))}&isActive=true`,{signal:controller.signal});
    if(!taglineResponse.ok)return;
    const data=await taglineResponse.json();
    const rows=(Array.isArray(data)?data:data.data||data.taglines||[]).filter(row=>row.isActive!==false&&row.text);
    rows.sort((a,b)=>Number(id(b)===id(saved.taglineId))-Number(id(a)===id(saved.taglineId)));
    if(current===generation&&!controller.signal.aborted)setTaglines(rows);
   }catch(error){if(error.name!=="AbortError")console.error("Public business settings are unavailable.");}
  };
  load();window.addEventListener("focus",load);
  return()=>{controller.abort();window.removeEventListener("focus",load);};
 },[appKey]);
 useEffect(()=>{
  const ids=[];
  for(const font of [business?.themeColors?.fontHeading,business?.themeColors?.fontBody]){
   if(!font?.fontName?.trim())continue;
   const link=document.createElement("link");link.rel="stylesheet";link.href=`https://fonts.googleapis.com/css2?family=${encodeURIComponent(font.fontName.trim())}:wght@400;500;600;700;800&display=swap`;document.head.appendChild(link);ids.push(link);
  }
  return()=>ids.forEach(link=>link.remove());
 },[business]);
 useEffect(()=>{if(taglines.length<2)return;const timer=window.setInterval(()=>setTaglineIndex(index=>(index+1)%taglines.length),6000);return()=>window.clearInterval(timer);},[taglines]);
 return {business,tagline:taglines[taglineIndex]?.text||"",style:businessStyle(business)};
}
