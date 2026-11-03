// src/components/lifeboard/LifeboardFormPage.jsx
import {useEffect,useState} from "react";
import {useNavigate} from "react-router-dom";
import "../../styles/LifeboardPage.css";
import "../../styles/LifeboardMediaFields.css";

function LifeboardFormPage({
 title,
 eyebrow="Chorna Lifeboard",
 text="Create a new record.",
 endpoint,
 method="POST",
 redirectPath,
 submitLabel="Save",
 initialValues={},
 fields=[],
 transformPayload,
 embedded=false,
 inlineLabels=false,
 onCancel,
 onSaved,
 onReferenceCreated
}){

 const navigate=useNavigate();
 const [form,setForm]=useState(initialValues);
 const [saving,setSaving]=useState(false);
 const [uploadingField,setUploadingField]=useState("");
 const [creatingField,setCreatingField]=useState("");
 const [createValues,setCreateValues]=useState({});
 const [fieldOptions,setFieldOptions]=useState({});
 const [error,setError]=useState("");

 useEffect(()=>{
  setForm(initialValues);
 },[JSON.stringify(initialValues)]);

 useEffect(()=>{
  const nextOptions={};

  fields.forEach(field=>{
   if(field.options){
    nextOptions[field.name]=field.options;
   }
  });

  setFieldOptions(nextOptions);
 },[fields]);

 const getToken=()=>{
  return localStorage.getItem("token")||sessionStorage.getItem("token")||"";
 };

 const getHeaders=(isFormData=false)=>{
  const token=getToken();

  return {
   ...(isFormData?{}:{"Content-Type":"application/json"}),
   ...(token?{Authorization:`Bearer ${token}`}:{})
  };
 };

 const normalizeId=value=>{
  if(!value)return "";
  if(typeof value==="object"&&value?.$oid)return String(value.$oid);
  if(typeof value==="object"&&value?._id)return normalizeId(value._id);
  if(typeof value==="object"&&value?.id)return normalizeId(value.id);
  return String(value).trim();
 };

 const normalizeRecords=data=>{
  if(Array.isArray(data))return data;
  if(Array.isArray(data?.data))return data.data;
  if(Array.isArray(data?.records))return data.records;
  if(Array.isArray(data?.lifeAreas))return data.lifeAreas;
  if(Array.isArray(data?.categories))return data.categories;
  if(Array.isArray(data?.tags))return data.tags;
  return [];
 };

 const normalizeColor=value=>{
  const color=String(value||"").trim();

  if(!color)return "";

  if(color.startsWith("#")){
   return color;
  }

  if(/^[0-9a-fA-F]{6}$/.test(color)){
   return `#${color}`;
  }

  return color;
 };

 const getColorPickerValue=value=>{
  const color=normalizeColor(value);

  if(/^#[0-9a-fA-F]{6}$/.test(color)){
   return color;
  }

  return "#000000";
 };

 const getRecordFromResponse=(data,field)=>{
  if(!data)return null;

  const singleKey=field.responseKey||field.createResponseKey;

  if(singleKey&&data[singleKey])return data[singleKey];
  if(data.record)return data.record;
  if(data.data)return data.data;
  if(data.lifeArea)return data.lifeArea;
  if(data.category)return data.category;
  if(data.tag)return data.tag;

  return null;
 };

 const getOptionFromRecord=(record,field)=>{
  if(!record)return null;

  const value=normalizeId(record._id)||normalizeId(record.id);
  const label=record.name||record.title||record.label||createValues[field.name]||"New Option";

  if(!value)return null;

  return {value,label};
 };

 const getOptionsFromRecords=(records,field)=>{
  const existingOptions=field.options||[];
  const hasPlaceholder=existingOptions.length&&existingOptions[0]?.value==="";

  return [
   ...(hasPlaceholder?[existingOptions[0]]:[]),
   ...records.map(record=>getOptionFromRecord(record,field)).filter(Boolean)
  ];
 };

 const getUploadFileName=data=>{
  if(!data)return "";
  if(data.filename)return data.filename;
  if(data.fileName)return data.fileName;
  if(data.name)return data.name;
  if(data.file?.filename)return data.file.filename;
  if(data.file?.fileName)return data.file.fileName;
  if(data.data?.filename)return data.data.filename;
  if(data.data?.fileName)return data.data.fileName;

  if(data.url){
   return String(data.url).split("/").filter(Boolean).pop()||"";
  }

  if(data.file?.url){
   return String(data.file.url).split("/").filter(Boolean).pop()||"";
  }

  return "";
 };

 const getImagePreviewSrc=(value,field)=>{
  const fileName=String(value||"").trim();

  if(!fileName)return "";

  if(fileName.startsWith("http://")||fileName.startsWith("https://")||fileName.startsWith("/")){
   return fileName;
  }

  const basePath=field.previewBasePath||"/uploads/icons";

  return `${basePath}/${fileName}`;
 };

 const normalizeTimeSlots=(value,count)=>{
  const numberCount=Math.max(1,Number(count)||1);
  const source=Array.isArray(value)?value:[];
  const slots=[];

  for(let index=0;index<numberCount;index+=1){
   slots.push({
    startTime:source[index]?.startTime||"",
    endTime:source[index]?.endTime||""
   });
  }

  return slots;
 };

 const getFieldRequired=field=>{
  if(typeof field.required==="function"){
   return !!field.required(form);
  }

  return !!field.required;
 };

 const updateField=(name,value)=>{
  setForm(prev=>{
   let next={...prev,[name]:value};
   const changedField=fields.find(field=>field.name===name);

   fields.forEach(field=>{
    if(field.type==="timeSlots"&&field.countField===name){
     next[field.name]=normalizeTimeSlots(next[field.name],value);
    }
   });

   if(changedField&&typeof changedField.onValueChange==="function"){
    const updates=changedField.onValueChange(value,next)||{};
    next={
     ...next,
     ...updates,
     [name]:value
    };
   }

   return next;
  });
 };

 const updateTimeSlot=(name,index,slotField,value)=>{
  setForm(prev=>{
   const field=fields.find(item=>item.name===name);
   const count=field?.countField?prev[field.countField]:prev[name]?.length;
   const slots=normalizeTimeSlots(prev[name],count).map((slot,slotIndex)=>{
    if(slotIndex!==index)return slot;

    return {
     ...slot,
     [slotField]:value
    };
   });

   return {
    ...prev,
    [name]:slots
   };
  });
 };

 const updateCreateValue=(name,value)=>{
  setCreateValues(prev=>({...prev,[name]:value}));
 };

 const splitLines=value=>{
  return String(value||"").split("\n").map(item=>item.trim()).filter(Boolean);
 };

 const cleanEmptyValues=payload=>{
  const cleaned={...payload};

  Object.keys(cleaned).forEach(key=>{
   if(cleaned[key]===""){
    delete cleaned[key];
   }

   if(Array.isArray(cleaned[key])){
    cleaned[key]=cleaned[key].filter(Boolean);
   }
  });

  return cleaned;
 };

 const buildPayload=()=>{
  const payload={...form};

  fields.forEach(field=>{
   if(field.arrayFromLines){
    payload[field.name]=splitLines(form[field.name]);
   }

   if(field.type==="number"&&form[field.name]!==""){
    payload[field.name]=Number(form[field.name]);
   }

   if(field.type==="checkbox"){
    payload[field.name]=!!form[field.name];
   }

   if(field.type==="multiselect"){
    payload[field.name]=Array.isArray(form[field.name])?form[field.name].filter(Boolean):[];
   }

   if(field.type==="timeSlots"){
    payload[field.name]=normalizeTimeSlots(form[field.name],field.countField?form[field.countField]:form[field.name]?.length);
   }

   if(field.type==="color"){
    payload[field.name]=normalizeColor(form[field.name]);
   }

   if(field.type==="image"){
    payload[field.name]=String(form[field.name]||"").trim();
   }
  });

  const cleanedPayload=cleanEmptyValues(payload);

  return transformPayload?transformPayload(cleanedPayload):cleanedPayload;
 };

 const handleImageUpload=async(field,file)=>{
  try{
   if(!file)return;

   if(!field.uploadEndpoint){
    throw new Error(`Missing upload endpoint for ${field.label}`);
   }

   setUploadingField(field.name);
   setError("");

   const body=new FormData();
   body.append(field.fileFieldName||"file",file);

   const res=await fetch(field.uploadEndpoint,{
    method:"POST",
    headers:getHeaders(true),
    body
   });

   const data=await res.json().catch(()=>({}));

   if(!res.ok){
    throw new Error(data.message||`Failed to upload ${field.label}`);
   }

   const fileName=getUploadFileName(data);

   if(!fileName){
    throw new Error("Upload succeeded but filename was not returned");
   }

   updateField(field.name,fileName);
  }catch(err){
   setError(err.message||`Failed to upload ${field.label}`);
  }finally{
   setUploadingField("");
  }
 };

 const refreshFieldOptions=async(field,option)=>{
  if(!field.refreshEndpoint){
   setFieldOptions(prev=>({
    ...prev,
    [field.name]:[
     ...(prev[field.name]||field.options||[]),
     option
    ]
   }));

   return;
  }

  const res=await fetch(field.refreshEndpoint,{
   headers:getHeaders()
  });

  const data=await res.json().catch(()=>({}));

  if(!res.ok){
   setFieldOptions(prev=>({
    ...prev,
    [field.name]:[
     ...(prev[field.name]||field.options||[]),
     option
    ]
   }));

   return;
  }

  const records=normalizeRecords(data);
  const refreshedOptions=getOptionsFromRecords(records,field);

  setFieldOptions(prev=>({
   ...prev,
   [field.name]:refreshedOptions
  }));
 };

 const handleCreateOption=async(field)=>{
  try{
   const value=String(createValues[field.name]||"").trim();

   if(!value){
    throw new Error(`Enter a ${field.createLabel||field.label} name`);
   }

   if(!field.createEndpoint){
    throw new Error(`Missing create endpoint for ${field.label}`);
   }

   setSaving(true);
   setError("");

   const payload=field.createPayload?field.createPayload(value,form):{name:value};

   const res=await fetch(field.createEndpoint,{
    method:"POST",
    headers:getHeaders(),
    body:JSON.stringify(payload)
   });

   const data=await res.json().catch(()=>({}));

   if(!res.ok){
    throw new Error(data.message||`Failed to create ${field.label}`);
   }

   const record=getRecordFromResponse(data,field);
   const option=getOptionFromRecord(record,field);

   if(!option){
    throw new Error(`Created ${field.label}, but no usable ID was returned`);
   }

   await refreshFieldOptions(field,option);

   if(field.type==="multiselect"){
    const currentValues=Array.isArray(form[field.name])?form[field.name]:[];
    updateField(field.name,Array.from(new Set([...currentValues,option.value])));
   }else{
    updateField(field.name,option.value);
   }

   if(onReferenceCreated){
    onReferenceCreated(field.name,record);
   }

   updateCreateValue(field.name,"");
   setCreatingField("");
  }catch(err){
   setError(err.message||`Failed to create ${field.label}`);
  }finally{
   setSaving(false);
  }
 };

 const handleSubmit=async e=>{
  e.preventDefault();

  try{
   setSaving(true);
   setError("");

   const res=await fetch(endpoint,{
    method,
    headers:getHeaders(),
    body:JSON.stringify(buildPayload())
   });

   const data=await res.json().catch(()=>({}));

   if(!res.ok)throw new Error(data.message||"Failed to save record");

   if(onSaved){
    onSaved(data);
    return;
   }

   if(redirectPath){
    navigate(redirectPath);
   }
  }catch(err){
   setError(err.message||"Failed to save record");
  }finally{
   setSaving(false);
  }
 };

 const renderCreateControl=field=>{
  if(!field.allowCreate){
   return null;
  }

  if(creatingField!==field.name){
   return(
    <button
     type="button"
     className="lifeboard-field-add-button"
     onClick={()=>setCreatingField(field.name)}
    >
     Add {field.createLabel||field.label}
    </button>
   );
  }

  return(
   <div className="lifeboard-field-add-row">
    <input
     className="lifeboard-page-search"
     type="text"
     value={createValues[field.name]||""}
     onChange={(e)=>updateCreateValue(field.name,e.target.value)}
     placeholder={`New ${field.createLabel||field.label}`}
    />

    <button
     type="button"
     className="lifeboard-field-save-button"
     onClick={()=>handleCreateOption(field)}
     disabled={saving}
    >
     Add
    </button>

    <button
     type="button"
     className="lifeboard-field-cancel-button"
     onClick={()=>{
      setCreatingField("");
      updateCreateValue(field.name,"");
     }}
     disabled={saving}
    >
     Cancel
    </button>
   </div>
  );
 };

 const renderField=field=>{
  const value=form[field.name]??"";
  const options=fieldOptions[field.name]||field.options||[];
  const required=getFieldRequired(field);

  if(field.type==="hidden"){
   return(
    <input
     type="hidden"
     value={value}
     onChange={(e)=>updateField(field.name,e.target.value)}
    />
   );
  }

  if(field.type==="image"){
   const previewSrc=getImagePreviewSrc(value,field);

   return(
    <div className="lifeboard-image-field">
     <div className="lifeboard-image-preview">
      {previewSrc?(
       <img src={previewSrc} alt={`${field.label} preview`}/>
      ):(
       <span>No image</span>
      )}
     </div>

     <div className="lifeboard-image-controls">
      <input
       className="lifeboard-file-input"
       type="file"
       accept={field.accept||"image/*"}
       onChange={(e)=>handleImageUpload(field,e.target.files?.[0])}
       disabled={uploadingField===field.name}
      />

      <input
       className="lifeboard-page-search"
       type="text"
       value={value}
       onChange={(e)=>updateField(field.name,e.target.value)}
       placeholder={field.placeholder||"Uploaded filename"}
       required={required}
      />

      {value&&(
       <button
        type="button"
        className="lifeboard-field-cancel-button"
        onClick={()=>updateField(field.name,"")}
        disabled={uploadingField===field.name}
       >
        Remove
       </button>
      )}

      {uploadingField===field.name&&(
       <small className="lifeboard-form-help">Uploading...</small>
      )}
     </div>
    </div>
   );
  }

  if(field.type==="color"){
   const normalizedColor=normalizeColor(value);

   return(
    <div className="lifeboard-color-field">
     <input
      className="lifeboard-color-picker"
      type="color"
      value={getColorPickerValue(value)}
      onChange={(e)=>updateField(field.name,e.target.value)}
      title={normalizedColor||"Choose color"}
     />

     <input
      className="lifeboard-page-search lifeboard-color-hex-input"
      type="text"
      value={normalizedColor}
      onChange={(e)=>updateField(field.name,e.target.value)}
      placeholder="#000000"
      maxLength="7"
      required={required}
     />

     {normalizedColor&&(
      <span
       className="lifeboard-badge lifeboard-color-badge"
       style={{
        backgroundColor:/^#[0-9a-fA-F]{6}$/.test(normalizedColor)?normalizedColor:"var(--surface2)",
        borderColor:/^#[0-9a-fA-F]{6}$/.test(normalizedColor)?normalizedColor:"var(--border)",
        color:/^#[0-9a-fA-F]{6}$/.test(normalizedColor)?"var(--textInverse)":"var(--text)"
       }}
      >
       {normalizedColor}
      </span>
     )}
    </div>
   );
  }

  if(field.type==="textarea"){
   return(
    <textarea
     className="lifeboard-page-search"
     rows={field.rows||4}
     value={value}
     onChange={(e)=>updateField(field.name,e.target.value)}
     placeholder={field.placeholder||""}
     required={required}
    />
   );
  }

  if(field.type==="select"){
   return(
    <>
     <select
      className="lifeboard-page-search"
      value={value}
      onChange={(e)=>updateField(field.name,e.target.value)}
      required={required}
     >
      {options.map(option=>(
       <option key={option.value} value={option.value}>{option.label}</option>
      ))}
     </select>

     {renderCreateControl(field)}
    </>
   );
  }

  if(field.type==="multiselect"){
   const selectedValues=Array.isArray(value)?value:[];

   return(
    <>
     <select
      className="lifeboard-page-search"
      value={selectedValues}
      multiple
      onChange={(e)=>updateField(field.name,Array.from(e.target.selectedOptions).map(option=>option.value))}
      required={required}
     >
      {options.map(option=>(
       <option key={option.value} value={option.value}>{option.label}</option>
      ))}
     </select>

     {renderCreateControl(field)}
    </>
   );
  }

  if(field.type==="timeSlots"){
   const count=field.countField?form[field.countField]:value.length;
   const slots=normalizeTimeSlots(value,count);

   return(
    <div className="lifeboard-time-slots">
     {slots.map((slot,index)=>(
      <div key={`${field.name}-${index}`} className="lifeboard-time-slot-row">
       <span className="lifeboard-time-slot-label">{field.slotLabel?field.slotLabel(index):`Time ${index+1}`}</span>

       <input
        className="lifeboard-page-search"
        type="time"
        value={slot.startTime}
        onChange={(e)=>updateTimeSlot(field.name,index,"startTime",e.target.value)}
       />

       <input
        className="lifeboard-page-search"
        type="time"
        value={slot.endTime}
        onChange={(e)=>updateTimeSlot(field.name,index,"endTime",e.target.value)}
       />
      </div>
     ))}
    </div>
   );
  }

  if(field.type==="checkbox"){
   return(
    <label className="lifeboard-checkbox">
     <input
      type="checkbox"
      checked={!!value}
      onChange={(e)=>updateField(field.name,e.target.checked)}
     />
     <span>{field.checkboxLabel||field.label}</span>
    </label>
   );
  }

  return(
   <input
    className="lifeboard-page-search"
    type={field.type||"text"}
    value={value}
    min={field.min}
    max={field.max}
    onChange={(e)=>updateField(field.name,e.target.value)}
    placeholder={field.placeholder||""}
    required={required}
   />
  );
 };

 const visibleFields=fields.filter(field=>field.type!=="hidden"&&!(typeof field.hiddenWhen==="function"&&field.hiddenWhen(form)));
 const hiddenFields=fields.filter(field=>field.type==="hidden");

 const formClass=[
  "lifeboard-form",
  embedded?"lifeboard-form-embedded":"",
  inlineLabels?"lifeboard-form-inline":""
 ].filter(Boolean).join(" ");

 const formContent=(
  <form onSubmit={handleSubmit} className={formClass}>
   {hiddenFields.map(field=>(
    <span key={field.name}>{renderField(field)}</span>
   ))}

   {error&&<div className="lifeboard-page-error">{error}</div>}

   <div className="lifeboard-form-grid">
    {visibleFields.map(field=>(
     <label
      key={field.name}
      className={[
       "lifeboard-form-field",
       field.full?"lifeboard-form-field-full":"",
       field.type==="checkbox"?"lifeboard-form-checkbox-field":"",
       field.type==="image"?"lifeboard-form-field-image":"",
       field.type==="timeSlots"?"lifeboard-form-field-time-slots":""
      ].filter(Boolean).join(" ")}
     >
      {field.type!=="checkbox"&&<span>{inlineLabels?`${field.label}:`:field.label}</span>}

      <div className="lifeboard-form-control-wrap">
       {renderField(field)}
       {field.helpText&&<small className="lifeboard-form-help">{field.helpText}</small>}
      </div>
     </label>
    ))}
   </div>

   <div className="lifeboard-form-actions">
    {onCancel&&(
     <button type="button" className="lifeboard-form-cancel" onClick={onCancel} disabled={saving}>
      Cancel
     </button>
    )}

    <button type="submit" className="lifeboard-page-action" disabled={saving||!!uploadingField}>
     {saving?"Saving...":submitLabel}
    </button>
   </div>
  </form>
 );

 if(embedded){
  return formContent;
 }

 return(
  <section className="lifeboard-page">

   <header className="lifeboard-page-header">
    <div>
     <p className="lifeboard-page-eyebrow">{eyebrow}</p>
     <h1 className="lifeboard-page-title">{title}</h1>
     <p className="lifeboard-page-text">{text}</p>
    </div>
   </header>

   <div className="lifeboard-page-card">
    {formContent}
   </div>

  </section>
 );
}

export default LifeboardFormPage;