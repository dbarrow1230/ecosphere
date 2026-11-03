import {useCallback,useEffect,useMemo,useState} from "react";
import {Alert,Button,Modal} from "react-bootstrap";
import {getObjectId,loadCurrentBusiness} from "../../utils/currentBusiness.js";
import "../../styles/BusinessResource.css";

const emptyLookups=[];

const getRows=data=>{
 if(Array.isArray(data))return data;
 if(Array.isArray(data?.data))return data.data;
 if(Array.isArray(data?.items))return data.items;
 return [];
};

const getValue=(source,path)=>{
 return String(path).split(".").reduce((acc,key)=>acc?.[key],"")??"";
};

const setValue=(source,path,value)=>{
 const keys=String(path).split(".");
 const next={...source};
 let target=next;

 keys.forEach((key,index)=>{
  if(index===keys.length-1){
   target[key]=value;
   return;
  }

  target[key]={...(target[key]||{})};
  target=target[key];
 });

 return next;
};

const normalizeValue=(field,value)=>{
 if(field.type==="number")return value===""?0:Number(value);
 if(field.type==="checkbox")return Boolean(value);
 return value;
};

function BusinessResourcePage({title,kicker,description,endpoint,columns=[],fields=[],lookups=emptyLookups}){
 const [rows,setRows]=useState([]);
 const [businessId,setBusinessId]=useState("");
 const [lookupData,setLookupData]=useState({});
 const [selectedId,setSelectedId]=useState("");
 const [form,setForm]=useState({});
 const [mode,setMode]=useState("add");
 const [showForm,setShowForm]=useState(false);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [message,setMessage]=useState("");

 const selected=useMemo(()=>rows.find(row=>getObjectId(row)===selectedId)||null,[rows,selectedId]);

 const buildDefaultForm=useCallback(()=>{
  return fields.reduce((acc,field)=>{
   if(field.defaultValue!==undefined)return setValue(acc,field.name,field.defaultValue);
   if(field.type==="checkbox")return setValue(acc,field.name,false);
   if(field.type==="number")return setValue(acc,field.name,0);
   return setValue(acc,field.name,"");
  },{});
 },[fields]);

 const loadLookups=useCallback(async()=>{
  const loaded={};

  await Promise.all((lookups||[]).map(async lookup=>{
   try{
    const res=await fetch(lookup.endpoint,{headers:{"Content-Type":"application/json"}});
    const data=await res.json().catch(()=>null);
    loaded[lookup.key]=res.ok?getRows(data):[];
   }catch{
    loaded[lookup.key]=[];
   }
  }));

  setLookupData(loaded);
 },[lookups]);

 const loadRows=useCallback(async(nextBusinessId=businessId)=>{
  try{
   setLoading(true);
   setError("");
   const query=nextBusinessId?`?business_id=${encodeURIComponent(nextBusinessId)}`:"";
   const res=await fetch(`${endpoint}${query}`,{headers:{"Content-Type":"application/json"}});
   const data=await res.json().catch(()=>null);
   if(!res.ok)throw new Error(data?.message||`${title} could not load.`);
   const nextRows=getRows(data);
   setRows(nextRows);
   setSelectedId(current=>nextRows.some(row=>getObjectId(row)===current)?current:getObjectId(nextRows[0]));
  }catch(err){
   setRows([]);
   setSelectedId("");
   setError(err.message||`${title} could not load.`);
  }finally{
   setLoading(false);
  }
 },[businessId,endpoint,title]);

 useEffect(()=>{
  const init=async()=>{
   try{
    const business=await loadCurrentBusiness();
    const currentBusinessId=getObjectId(business);
    setBusinessId(currentBusinessId);
    await loadLookups();
    await loadRows(currentBusinessId);
   }catch(err){
    setError(err.message||"Current business could not load.");
    setLoading(false);
   }
  };

  init();
 },[loadLookups,loadRows]);

 const openAdd=()=>{
  setMode("add");
  setForm({...buildDefaultForm(),business_id:businessId});
  setShowForm(true);
 };

 const openEdit=()=>{
  if(!selected)return;
  setMode("edit");
  setForm({...buildDefaultForm(),...selected,business_id:businessId});
  setShowForm(true);
 };

 const save=async event=>{
  event.preventDefault();
  try{
   setSaving(true);
   setError("");
   setMessage("");
   const isEdit=mode==="edit"&&selected;
   const res=await fetch(isEdit?`${endpoint}/${getObjectId(selected)}`:endpoint,{
    method:isEdit?"PUT":"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({...form,business_id:businessId})
   });
   const data=await res.json().catch(()=>null);
   if(!res.ok)throw new Error(data?.message||`${title} could not save.`);
   setShowForm(false);
   setMessage(isEdit?"Updated.":"Created.");
   await loadRows(businessId);
  }catch(err){
   setError(err.message||`${title} could not save.`);
  }finally{
   setSaving(false);
  }
 };

 const renderField=field=>{
  const value=getValue(form,field.name);
  const commonProps={
   id:field.name,
   name:field.name,
   className:"business-resource-input",
   value:field.type==="checkbox"?undefined:value,
   checked:field.type==="checkbox"?Boolean(value):undefined,
   required:field.required,
   onChange:event=>{
    const nextValue=field.type==="checkbox"?event.target.checked:event.target.value;
    setForm(prev=>setValue(prev,field.name,normalizeValue(field,nextValue)));
   }
  };

  if(field.type==="select"){
   const options=field.lookupKey?lookupData[field.lookupKey]||[]:field.options||[];
   return(
    <select {...commonProps}>
     <option value="">Select {field.label}</option>
     {options.map(option=>(
      <option key={getObjectId(option)||option.value} value={getObjectId(option)||option.value}>
       {option[field.optionLabel||"name"]||option.legalName||option.productName||option.label}
      </option>
     ))}
    </select>
   );
  }

  if(field.type==="textarea")return <textarea {...commonProps} rows={4}/>;
  if(field.type==="checkbox")return <input {...commonProps} type="checkbox" className="business-resource-checkbox"/>;

  return <input {...commonProps} type={field.type||"text"} min={field.min}/>;
 };

 return(
  <section className="business-resource-page">
   <header className="business-resource-header">
    <div>
     <p>{kicker}</p>
     <h1>{title}</h1>
     <span>{description}</span>
    </div>
    <div className="business-resource-actions">
     <Button onClick={openAdd}>Add</Button>
     <Button variant="outline-primary" onClick={openEdit} disabled={!selected}>Edit</Button>
    </div>
   </header>

   {message?<Alert variant="success">{message}</Alert>:null}
   {error?<Alert variant="danger">{error}</Alert>:null}

   <div className="business-resource-layout">
    <section className="business-resource-list">
     <div className="business-resource-list-head">
      <strong>{title}</strong>
      <span>{rows.length} records</span>
     </div>
     {loading?<div className="business-resource-empty">Loading...</div>:null}
     {!loading&&!rows.length?<div className="business-resource-empty">No records yet.</div>:null}
     {rows.map(row=>(
      <button key={getObjectId(row)} type="button" className={selectedId===getObjectId(row)?"active":""} onClick={()=>setSelectedId(getObjectId(row))}>
       <strong>{getValue(row,columns[0]?.key)||row.name||row.productName||row.itemName||row.batchNumber||"Untitled"}</strong>
       <span>{getValue(row,columns[1]?.key)||row.status||row.itemType||""}</span>
      </button>
     ))}
    </section>

    <section className="business-resource-detail">
     {!selected?<div className="business-resource-empty">Select a record to view details.</div>:(
      <div className="business-resource-detail-grid">
       {columns.map(column=>(
        <div key={column.key} className="business-resource-detail-row">
         <span>{column.label}</span>
         <strong>{String(getValue(selected,column.key)||"-")}</strong>
        </div>
       ))}
      </div>
     )}
    </section>
   </div>

   <Modal show={showForm} onHide={()=>setShowForm(false)} size="lg" centered>
    <form onSubmit={save}>
     <Modal.Header closeButton>
      <Modal.Title>{mode==="edit"?"Edit":"Add"} {title}</Modal.Title>
     </Modal.Header>
     <Modal.Body>
      <div className="business-resource-form-grid">
       {fields.map(field=>(
        <label key={field.name} className={field.type==="textarea"?"wide":""}>
         <span>{field.label}</span>
         {renderField(field)}
        </label>
       ))}
      </div>
     </Modal.Body>
     <Modal.Footer>
      <Button type="button" variant="outline-secondary" onClick={()=>setShowForm(false)}>Cancel</Button>
      <Button type="submit" disabled={saving}>{saving?"Saving...":"Save"}</Button>
     </Modal.Footer>
    </form>
   </Modal>
  </section>
 );
}

export default BusinessResourcePage;
