// src/pages/lifeArea/LifeAreaForm.jsx
import {useEffect,useMemo,useState} from "react";
import {useParams} from "react-router-dom";
import LifeboardFormPage from "../../components/lifeboard/LifeboardFormPage.jsx";

function LifeAreaForm({
 record=null,
 embedded=false,
 onCancel,
 onSaved
}){

 const {id}=useParams();
 const [loadedRecord,setLoadedRecord]=useState(record);
 const [loading,setLoading]=useState(false);
 const [loadError,setLoadError]=useState("");

 const normalizeId=value=>{
  if(!value)return "";
  if(typeof value==="object"&&value?.$oid)return String(value.$oid);
  if(typeof value==="object"&&value?._id)return normalizeId(value._id);
  if(typeof value==="object"&&value?.id)return normalizeId(value.id);
  return String(value).trim();
 };

 const getToken=()=>{
  return localStorage.getItem("token")||sessionStorage.getItem("token")||"";
 };

 const getHeaders=()=>{
  const token=getToken();

  return {
   "Content-Type":"application/json",
   ...(token?{Authorization:`Bearer ${token}`}:{})
  };
 };

 const getStoredUser=()=>{
  const keys=["user","userInfo","authUser","currentUser"];

  for(const key of keys){
   try{
    const raw=localStorage.getItem(key)||sessionStorage.getItem(key);
    if(!raw)continue;

    const parsed=JSON.parse(raw);

    if(parsed?._id||parsed?.id||parsed?.username||parsed?.email)return parsed;
    if(parsed?.user?._id||parsed?.user?.id||parsed?.user?.username||parsed?.user?.email)return parsed.user;
    if(parsed?.data?._id||parsed?.data?.id||parsed?.data?.username||parsed?.data?.email)return parsed.data;
   }catch(err){
    console.error(`Failed to parse stored user from ${key}`,err);
   }
  }

  return null;
 };

 const getRecordFromResponse=data=>{
  if(!data)return null;
  if(data.lifeArea)return data.lifeArea;
  if(data.record)return data.record;
  if(data.data)return data.data;
  return null;
 };

 const cleanFileName=value=>{
  return String(value||"").split("/").filter(Boolean).pop()||"";
 };

 useEffect(()=>{
  setLoadedRecord(record||null);
 },[record]);

 useEffect(()=>{
  let ignore=false;

  const loadRecord=async()=>{
   const recordId=normalizeId(id);

   if(!recordId||record){
    return;
   }

   try{
    setLoading(true);
    setLoadError("");

    const res=await fetch(`/api/life-areas/${recordId}`,{
     headers:getHeaders()
    });

    const data=await res.json().catch(()=>({}));

    if(!res.ok){
     throw new Error(data.message||"Failed to load life area");
    }

    const nextRecord=getRecordFromResponse(data);

    if(!nextRecord){
     throw new Error("Life area was not returned");
    }

    if(!ignore){
     setLoadedRecord(nextRecord);
    }
   }catch(err){
    if(!ignore){
     setLoadError(err.message||"Failed to load life area");
    }
   }finally{
    if(!ignore){
     setLoading(false);
    }
   }
  };

  loadRecord();

  return()=>{
   ignore=true;
  };
 },[id,record]);

 const currentUser=getStoredUser();
 const userId=normalizeId(currentUser?._id)||normalizeId(currentUser?.id);
 const recordId=normalizeId(loadedRecord?._id)||normalizeId(loadedRecord?.id)||normalizeId(id);
 const isEdit=!!recordId;

 const initialValues=useMemo(()=>({
  user:normalizeId(loadedRecord?.user)||userId,
  name:loadedRecord?.name||"",
  description:loadedRecord?.description||"",
  color:loadedRecord?.color||"",
  icon:cleanFileName(loadedRecord?.icon),
  sortOrder:loadedRecord?.sortOrder??0,
  isActive:loadedRecord?.isActive!==false
 }),[
  loadedRecord,
  userId
 ]);

 if(loading){
  return(
   <div className="lifeboard-page-empty">
    Loading life area...
   </div>
  );
 }

 if(loadError){
  return(
   <div className="lifeboard-page-error">
    {loadError}
   </div>
  );
 }

 return(
  <LifeboardFormPage
   title={isEdit?"Edit Life Area":"New Life Area"}
   eyebrow="Manage"
   text={isEdit?"Update this life area.":"Create a life area such as health, career, family, creativity, finance, or personal growth."}
   endpoint={isEdit?`/api/life-areas/${recordId}`:"/api/life-areas"}
   method={isEdit?"PUT":"POST"}
   redirectPath="/life-areas"
   submitLabel={isEdit?"Update Life Area":"Save Life Area"}
   embedded={embedded}
   inlineLabels={true}
   onCancel={onCancel}
   onSaved={onSaved}
   initialValues={initialValues}
   transformPayload={payload=>({
    ...payload,
    user:payload.user||userId,
    icon:cleanFileName(payload.icon),
    sortOrder:payload.sortOrder===""?0:Number(payload.sortOrder||0),
    isActive:payload.isActive!==false
   })}
   fields={[
    {name:"user",label:"User",type:"hidden"},
    {name:"name",label:"Name",required:true},
    {name:"color",label:"Color",type:"color"},
    {
     name:"icon",
     label:"Icon",
     type:"image",
     uploadEndpoint:"/api/upload/icons",
     previewBasePath:"/icons",
     fileFieldName:"file",
     accept:"image/*",
     placeholder:"penicon.png"
    },
    {name:"sortOrder",label:"Sort Order",type:"number",min:"0"},
    {name:"isActive",label:"Active",type:"checkbox",checkboxLabel:"Life area is active"},
    {name:"description",label:"Description",type:"textarea",rows:5,full:true}
   ]}
  />
 );
}

export default LifeAreaForm;