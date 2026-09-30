import {useCallback,useEffect,useMemo,useState} from "react";

const token=()=>localStorage.getItem("token")||sessionStorage.getItem("token")||"";
export const musicHeaders=()=>({"Content-Type":"application/json",Authorization:`Bearer ${token()}`});
export const recordId=value=>typeof value==="object"?value?._id||"":value||"";
export const csv=value=>String(value||"").split(",").map(item=>item.trim()).filter(Boolean);

export function useMusicRecords(endpoint,createEmpty,toForm=item=>item){
 const [items,setItems]=useState([]);
 const [form,setForm]=useState(createEmpty);
 const [editingId,setEditingId]=useState("");
 const [showForm,setShowForm]=useState(false);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [query,setQuery]=useState("");

 const load=useCallback(async()=>{setLoading(true);setError("");try{const response=await fetch(endpoint,{headers:musicHeaders()});const data=await response.json().catch(()=>[]);if(!response.ok)throw new Error(data.message||"Unable to load records.");setItems(Array.isArray(data)?data:data.data||[]);}catch(err){setError(err.message);}finally{setLoading(false);}},[endpoint]);
 useEffect(()=>{const timer=window.setTimeout(load,0);return()=>window.clearTimeout(timer);},[load]);
 const filtered=useMemo(()=>{const term=query.trim().toLowerCase();return term?items.filter(item=>JSON.stringify(item).toLowerCase().includes(term)):items;},[items,query]);
 const openCreate=()=>{setForm(createEmpty());setEditingId("");setError("");setShowForm(true);};
 const openEdit=item=>{setForm(toForm(item));setEditingId(item._id);setError("");setShowForm(true);};
 const close=()=>{if(!saving)setShowForm(false);};
 const save=async payload=>{setSaving(true);setError("");try{const response=await fetch(editingId?`${endpoint}/${editingId}`:endpoint,{method:editingId?"PUT":"POST",headers:musicHeaders(),body:JSON.stringify(payload)});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.message||"Unable to save record.");setShowForm(false);await load();return true;}catch(err){setError(err.message);return false;}finally{setSaving(false);}};
 const remove=async item=>{if(!window.confirm(`Delete "${item.title||item.chord||"this record"}"?`))return;setError("");try{const response=await fetch(`${endpoint}/${item._id}`,{method:"DELETE",headers:musicHeaders()});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.message||"Unable to delete record.");setItems(current=>current.filter(record=>record._id!==item._id));}catch(err){setError(err.message);}};
 return{items:filtered,total:items.length,form,setForm,editingId,showForm,loading,saving,error,query,setQuery,openCreate,openEdit,close,save,remove};
}

export function useMusicOptions(sources){
 const stableSources=useMemo(()=>sources,[sources.join("|")]);
 const [options,setOptions]=useState({});
 useEffect(()=>{Promise.all(stableSources.map(async source=>{const response=await fetch(source,{headers:musicHeaders()});if(!response.ok)return[source,[]];const data=await response.json();return[source,Array.isArray(data)?data:data.data||[]];})).then(entries=>setOptions(Object.fromEntries(entries))).catch(()=>setOptions({}));},[stableSources]);
 return options;
}
