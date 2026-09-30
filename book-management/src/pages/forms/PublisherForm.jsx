import {useEffect,useMemo,useState} from "react";
import {useNavigate,useParams} from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";

const emptyForm={
 name:"",
 publisherType:"domestic",
 country:"",
 state:"",
 addressLine1:"",
 addressLine2:"",
 city:"",
 region:"",
 postalCode:"",
 imprint:"",
 contact:"",
 phone:"",
 fax:"",
 email:"",
 website:"",
 logo:"",
 isActive:true
};

function getId(value){
 if(!value)return "";
 if(typeof value==="string"||typeof value==="number")return String(value);
 return String(
  value?._id||
  value?.id||
  value?.$oid||
  value?.countryId||
  value?.countryID||
  value?.country_id||
  value?.stateId||
  value?.stateID||
  value?.state_id||
  value?.value||
  ""
 );
}

function getName(value){
 if(!value)return "";
 if(typeof value==="string")return value;
 return String(
  value?.name||
  value?.title||
  value?.label||
  value?.countryName||
  value?.stateName||
  value?.text||
  ""
 );
}

function normalizeList(data,key){
 if(Array.isArray(data))return data;
 if(Array.isArray(data?.[key]))return data[key];
 if(Array.isArray(data?.data?.[key]))return data.data[key];
 if(Array.isArray(data?.payload?.[key]))return data.payload[key];
 if(Array.isArray(data?.items))return data.items;
 if(Array.isArray(data?.results))return data.results;
 if(Array.isArray(data?.data))return data.data;
 return [];
}

function getStateCountryId(item){
 if(!item||typeof item==="string")return "";
 return String(
  item?.country?._id||
  item?.country?.id||
  item?.countryId||
  item?.countryID||
  item?.country_id||
  item?.countryCode||
  item?.country||
  ""
 );
}

function resolveOptionValue(options,value){
 if(!value)return "";
 const rawId=getId(value);
 const rawName=getName(value).trim().toLowerCase();

 if(rawId){
  const byId=options.find(item=>getId(item)===rawId);
  if(byId)return getId(byId);
 }

 if(typeof value==="string"){
  const trimmed=value.trim().toLowerCase();
  const byName=options.find(item=>getName(item).trim().toLowerCase()===trimmed);
  if(byName)return getId(byName);
 }

 if(rawName){
  const byName=options.find(item=>getName(item).trim().toLowerCase()===rawName);
  if(byName)return getId(byName);
 }

 return "";
}

function buildFormData(source){
 return{
  name:source?.name||"",
  publisherType:source?.publisherType||"domestic",
  country:source?.country||"",
  state:source?.state||"",
  addressLine1:source?.addressLine1||"",
  addressLine2:source?.addressLine2||"",
  city:source?.city||"",
  region:source?.region||"",
  postalCode:source?.postalCode||"",
  imprint:source?.imprint||"",
  contact:source?.contact||"",
  phone:source?.phone||"",
  fax:source?.fax||"",
  email:source?.email||"",
  website:source?.website||"",
  logo:cleanUploadFilename(source?.logo),
  isActive:typeof source?.isActive==="boolean"?source.isActive:true
 };
}

function cleanUploadFilename(value){
 const text=String(value||"").trim();
 if(!text)return "";
 const filename=text.replace(/\\/g,"/").split("/").pop();
 return filename.replace(/^\d{10,}-/,"");
}

function getLogoPreview(url){
 const value=String(url||"").trim();
 if(!value)return "";
 if(value.startsWith("http://")||value.startsWith("https://")||value.startsWith("/")||value.startsWith("data:"))return value;
 return `/publisher/${cleanUploadFilename(value)}`;
}

export default function PublisherForm({mode,publisherId,initialData,onSaved,onCancel}){
 const navigate=useNavigate();
 const {id:routeId}=useParams();
 const id=publisherId||routeId||"";
 const isEdit=mode?mode==="edit":!!id;

 const [form,setForm]=useState(emptyForm);
 const [loading,setLoading]=useState(isEdit&&!initialData);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");
 const [countries,setCountries]=useState([]);
 const [states,setStates]=useState([]);
 const [lookupLoading,setLookupLoading]=useState(true);
 const [uploadingLogo,setUploadingLogo]=useState(false);

 useEffect(()=>{
  let active=true;

  (async()=>{
   try{
    setLookupLoading(true);
    setError("");

    const [countriesRes,statesRes]=await Promise.all([
     fetch("/api/countries"),
     fetch("/api/states")
    ]);

    const [countriesData,statesData]=await Promise.all([
     countriesRes.json(),
     statesRes.json()
    ]);

    if(!countriesRes.ok)throw new Error(countriesData?.message||"Failed to load countries");
    if(!statesRes.ok)throw new Error(statesData?.message||"Failed to load states");
    if(!active)return;

    const countryList=normalizeList(countriesData,"countries");
    const stateList=normalizeList(statesData,"states");

    setCountries(countryList);
    setStates(stateList);
   }catch(err){
    if(active){
     setCountries([]);
     setStates([]);
     setError(err.message||"Failed to load lookup data");
    }
   }finally{
    if(active)setLookupLoading(false);
   }
  })();

  return()=>{active=false;};
 },[]);

 useEffect(()=>{
  if(initialData){
   setForm(buildFormData(initialData));
   setLoading(false);
   return;
  }

  if(!isEdit)return;

  let active=true;

  (async()=>{
   try{
    setLoading(true);
    setError("");

    const res=await fetch(`/api/publishers/${id}`);
    const data=await res.json();

    if(!res.ok)throw new Error(data?.message||"Failed to load publisher");

    const publisher=data?.publisher||data;
    if(!active)return;

    setForm(buildFormData(publisher));
   }catch(err){
    if(active)setError(err.message||"Failed to load publisher");
   }finally{
    if(active)setLoading(false);
   }
  })();

  return()=>{active=false;};
 },[id,isEdit,initialData]);

 useEffect(()=>{
  if(!countries.length)return;
  setForm(prev=>{
   const resolvedCountry=resolveOptionValue(countries,prev.country);
   const nextCountry=resolvedCountry||"";
   if(nextCountry===prev.country)return prev;
   return {...prev,country:nextCountry};
  });
 },[countries]);

 useEffect(()=>{
  if(!states.length)return;
  setForm(prev=>{
   const resolvedState=resolveOptionValue(states,prev.state);
   const nextState=resolvedState||"";
   if(nextState===prev.state)return prev;
   return {...prev,state:nextState};
  });
 },[states]);

 const isUnitedStatesSelected=useMemo(()=>{
  if(!form.country)return false;
  const selectedCountry=countries.find(item=>getId(item)===String(form.country));
  if(!selectedCountry)return false;
  const name=getName(selectedCountry).trim().toLowerCase();
  const iso2=String(selectedCountry?.iso2||"").trim().toUpperCase();
  const iso3=String(selectedCountry?.iso3||"").trim().toUpperCase();
  return name==="united states"||name==="united states of america"||iso2==="US"||iso3==="USA";
 },[countries,form.country]);

 const defaultCountryCode=useMemo(()=>{
  if(!form.country)return "us";
  const selectedCountry=countries.find(item=>getId(item)===String(form.country));
  const iso2=String(selectedCountry?.iso2||"").trim().toLowerCase();
  return iso2||"us";
 },[countries,form.country]);

 const filteredStates=useMemo(()=>{
  if(!isUnitedStatesSelected)return [];
  if(!form.country)return states;
  const matched=states.filter(item=>getStateCountryId(item)===String(form.country));
  return matched.length?matched:states;
 },[states,form.country,isUnitedStatesSelected]);

 const logoPreview=useMemo(()=>getLogoPreview(form.logo),[form.logo]);

 useEffect(()=>{
  if(isUnitedStatesSelected)return;
  if(!form.state)return;
  setForm(prev=>({...prev,state:""}));
 },[isUnitedStatesSelected,form.state]);

 useEffect(()=>{
  if(!form.state)return;
  const existsInFiltered=filteredStates.some(item=>getId(item)===String(form.state));
  const existsInAll=states.some(item=>getId(item)===String(form.state));
  if(existsInFiltered||(!filteredStates.length&&existsInAll&&isUnitedStatesSelected))return;
  setForm(prev=>({...prev,state:""}));
 },[filteredStates,states,form.state,isUnitedStatesSelected]);

 function setField(name,value){
  setForm(prev=>({...prev,[name]:value}));
 }

 function handleCountryChange(value){
  setForm(prev=>{
   if(prev.country===value)return prev;
   return {...prev,country:value,state:""};
  });
 }

 function handlePublisherTypeChange(value){
  setForm(prev=>({
   ...prev,
   publisherType:value,
   state:value==="domestic"?prev.state:"",
   region:value==="international"?prev.region:""
  }));
 }

 async function handleLogoChange(e){
  const file=e.target.files?.[0];
  if(!file)return;

  setError("");
  setUploadingLogo(true);

  try{
   const body=new FormData();
   body.append("file",file);

   const res=await fetch("/api/upload/publisher",{
    method:"POST",
    body
   });
   const data=await res.json();

   if(!res.ok)throw new Error(data?.message||"Failed to upload publisher logo");

   setField("logo",cleanUploadFilename(data?.filename||file.name));
  }catch(err){
   setError(err.message||"Failed to upload publisher logo");
  }finally{
   setUploadingLogo(false);
   e.target.value="";
  }
 }

 function clearLogo(){
  setField("logo","");
 }

 async function handleSubmit(e){
  e.preventDefault();
  if(saving)return;
  setError("");
  setSuccess("");

  if(!form.name.trim()){
   setError("Name is required.");
   return;
  }

  if(!form.publisherType){
   setError("Publisher type is required.");
   return;
  }

  if(form.phone.trim()&&!/^\+?[0-9\s\-().]{7,20}$/.test(form.phone.trim())){
   setError("Invalid phone number.");
   return;
  }

  if(form.fax.trim()&&!/^\+?[0-9\s\-().]{7,20}$/.test(form.fax.trim())){
   setError("Invalid fax number.");
   return;
  }

  if(form.email.trim()&&!/^\S+@\S+\.\S+$/.test(form.email.trim().toLowerCase())){
   setError("Invalid email address.");
   return;
  }

  if(form.website.trim()&&!/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[^\s]*)?$/.test(form.website.trim())){
   setError("Invalid website URL.");
   return;
  }

  const payload={
   name:form.name.trim(),
   publisherType:form.publisherType,
   country:form.country||null,
   state:form.publisherType==="domestic"&&isUnitedStatesSelected?(form.state||null):null,
   addressLine1:form.addressLine1.trim(),
   addressLine2:form.addressLine2.trim(),
   city:form.city.trim(),
   region:form.publisherType==="international"?form.region.trim():"",
   postalCode:form.postalCode.trim(),
   imprint:form.imprint.trim(),
   contact:form.contact.trim(),
   phone:form.phone.trim(),
   fax:form.fax.trim(),
   email:form.email.trim().toLowerCase(),
   website:form.website.trim(),
   logo:cleanUploadFilename(form.logo),
   isActive:!!form.isActive
  };

  try{
   setSaving(true);

   const res=await fetch(isEdit?`/api/publishers/${id}`:"/api/publishers",{
    method:isEdit?"PUT":"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });

   const data=await res.json();
   if(!res.ok)throw new Error(data?.message||`Failed to ${isEdit?"update":"create"} publisher`);

   const saved=data?.publisher||data;
   setSuccess(`Publisher ${isEdit?"updated":"created"} successfully.`);

   if(onSaved){
    onSaved(saved);
    return;
   }

   navigate(saved?._id?`/publishers/${saved._id}`:"/publishers");
  }catch(err){
   setError(err.message||`Failed to ${isEdit?"update":"create"} publisher`);
  }finally{
   setSaving(false);
  }
 }

 if(loading||lookupLoading){
  return <div className="container py-4">Loading...</div>;
 }

 return(
  <div className="container py-4">
   {!onSaved&&(
    <div className="d-flex align-items-center justify-content-between mb-4">
     <h1 className="m-0">{isEdit?"Edit Publisher":"Add Publisher"}</h1>
     <button type="button" className="btn btn-outline-secondary" onClick={()=>onCancel?onCancel():navigate(-1)}>Back</button>
    </div>
   )}

   {error?<div className="alert alert-danger">{error}</div>:null}
   {success?<div className="alert alert-success">{success}</div>:null}

   <form onSubmit={handleSubmit}>
    <div className="row g-3">
     <div className="col-md-6">
      <label className="form-label">Name</label>
      <input type="text" className="form-control" value={form.name} onChange={e=>setField("name",e.target.value)} required />
     </div>

     <div className="col-md-3">
     <label className="form-label">Publisher Type</label>
      <select className="form-select" value={form.publisherType} onChange={e=>handlePublisherTypeChange(e.target.value)} required>
       <option value="domestic">domestic</option>
       <option value="international">international</option>
      </select>
     </div>

     <div className="col-md-3 d-flex align-items-end">
      <div className="form-check mb-2">
       <input id="isActive" type="checkbox" className="form-check-input" checked={form.isActive} onChange={e=>setField("isActive",e.target.checked)} />
       <label htmlFor="isActive" className="form-check-label">Active</label>
      </div>
     </div>

     <div className="col-md-4">
     <label className="form-label">Country</label>
      <select className="form-select" value={form.country} onChange={e=>handleCountryChange(e.target.value)}>
       <option value="">Select country</option>
       {countries.map(item=>{
        const optionId=getId(item);
        return <option key={optionId||getName(item)} value={optionId}>{getName(item)}</option>;
       })}
      </select>
     </div>

     {form.publisherType==="domestic"?(
     <div className="col-md-4">
      <label className="form-label">State</label>
      <select className="form-select" value={form.state} onChange={e=>setField("state",e.target.value)} disabled={!isUnitedStatesSelected}>
       <option value="">{isUnitedStatesSelected?"Select state":"Select United States first"}</option>
       {filteredStates.map(item=>{
        const optionId=getId(item);
        return <option key={optionId||getName(item)} value={optionId}>{getName(item)}</option>;
       })}
      </select>
     </div>
     ):(
     <div className="col-md-4">
      <label className="form-label">Region / Province</label>
      <input type="text" className="form-control" value={form.region} onChange={e=>setField("region",e.target.value)} />
     </div>
     )}

     <div className="col-md-4">
      <label className="form-label">City</label>
      <input type="text" className="form-control" value={form.city} onChange={e=>setField("city",e.target.value)} />
     </div>

     <div className="col-md-5">
      <label className="form-label">Address 1</label>
      <input type="text" className="form-control" value={form.addressLine1} onChange={e=>setField("addressLine1",e.target.value)} />
     </div>

     <div className="col-md-5">
      <label className="form-label">Address 2</label>
      <input type="text" className="form-control" value={form.addressLine2} onChange={e=>setField("addressLine2",e.target.value)} />
     </div>

     <div className="col-md-2">
      <label className="form-label">{form.publisherType==="domestic"?"Zip Code":"Postal Code"}</label>
      <input type="text" className="form-control" value={form.postalCode} onChange={e=>setField("postalCode",e.target.value)} />
     </div>

     <div className="col-md-6">
      <label className="form-label">Imprint</label>
      <input type="text" className="form-control" value={form.imprint} onChange={e=>setField("imprint",e.target.value)} />
     </div>

     <div className="col-md-6">
      <label className="form-label">Contact</label>
      <input type="text" className="form-control" value={form.contact} onChange={e=>setField("contact",e.target.value)} />
     </div>

     <div className="col-md-3">
      <label className="form-label">Phone</label>
      <PhoneInput
       country={defaultCountryCode}
       value={form.phone}
       onChange={value=>setField("phone",value?`+${value}`:"")}
       inputClass="form-control w-100"
       containerClass="w-100"
       buttonClass=""
       inputProps={{name:"phone"}}
      />
     </div>

     <div className="col-md-3">
      <label className="form-label">Fax</label>
      <PhoneInput
       country={defaultCountryCode}
       value={form.fax}
       onChange={value=>setField("fax",value?`+${value}`:"")}
       inputClass="form-control w-100"
       containerClass="w-100"
       buttonClass=""
       inputProps={{name:"fax"}}
      />
     </div>

     <div className="col-md-3">
      <label className="form-label">Email</label>
      <input type="email" className="form-control" value={form.email} onChange={e=>setField("email",e.target.value)} />
     </div>

     <div className="col-md-3">
      <label className="form-label">Website</label>
      <input type="text" className="form-control" value={form.website} onChange={e=>setField("website",e.target.value)} />
     </div>

     <div className="col-12">
      <label className="form-label">Logo</label>
      <div className="d-flex flex-column gap-2">
       <div className="d-flex gap-2 align-items-center flex-wrap">
        <input type="file" className="form-control" accept="image/*" onChange={handleLogoChange} disabled={uploadingLogo} />
        <button type="button" className="btn btn-outline-secondary" onClick={clearLogo} disabled={!form.logo||uploadingLogo}>Clear</button>
       </div>
       {uploadingLogo?<div className="text-muted small">Uploading...</div>:null}
       {form.logo?<div className="small text-muted">Logo: {cleanUploadFilename(form.logo)}</div>:null}
       {logoPreview?<div><img src={logoPreview} alt={`${form.name||"Publisher"} logo preview`} style={{maxWidth:"160px",maxHeight:"100px",borderRadius:"8px",border:"1px solid #ddd",objectFit:"contain",background:"#fff"}} /></div>:null}
      </div>
     </div>

     <div className="col-12 d-flex gap-2 pt-2">
      <button type="submit" className="btn btn-primary" disabled={saving}>{saving?(isEdit?"Saving...":"Creating..."):(isEdit?"Save Changes":"Create Publisher")}</button>
      <button type="button" className="btn btn-outline-secondary" onClick={()=>setForm(emptyForm)} disabled={saving||isEdit}>Reset</button>
     </div>
    </div>
   </form>
  </div>
 );
}
