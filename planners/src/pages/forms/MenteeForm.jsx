import {useEffect,useMemo,useState} from "react";
import {useNavigate,useParams} from "react-router-dom";
import "../../styles/mentee-form.css";

const tabs=["basic","address","programs","meetings","tracking"];

const getStoredUser=()=>{
 const keys=["userInfo","user","authUser","currentUser"];

 for(const key of keys){
  try{
   const raw=localStorage.getItem(key)||sessionStorage.getItem(key);

   if(!raw){
    continue;
   }

   const parsed=JSON.parse(raw);

   if(parsed?._id||parsed?.username||parsed?.email){
    return parsed;
   }

   if(parsed?.user?._id||parsed?.user?.username||parsed?.user?.email){
    return parsed.user;
   }

   if(parsed?.data?._id||parsed?.data?.username||parsed?.data?.email){
    return parsed.data;
   }
  }catch(err){
   console.error(`Failed to parse stored user from ${key}`,err);
  }
 }

 return null;
};

const initialForm={
 firstName:"",
 lastName:"",
 email:"",
 phone:"",
 image:"",
 businessName:"",
 website:"",
 address1:"",
 address2:"",
 city:"",
 state:"",
 country:"",
 postalCode:"",
 programs:[],
 hoursNeeded:150,
 externshipStartDate:"",
 externshipEndDate:"",
 preferredMeetingDay:"",
 preferredMeetingTime:"",
 meetingDuration:30,
 meetingFrequency:"Weekly",
 meetingMethod:"",
 status:"",
 isFlagged:false,
 flagReason:"",
 riskLevel:"low",
 currentGoalProgress:"",
 meetingRegularity:"",
 finalVerification:""
};

function MenteeForm({user,mode,onSuccess,onCancel,mentee,menteeId,initialData}){
 const navigate=useNavigate();
 const {id:routeId}=useParams();
 const id=menteeId||mentee?._id||initialData?._id||routeId;
 const isEdit=mode==="edit"||Boolean(id);

 const [form,setForm]=useState(initialForm);
 const [states,setStates]=useState([]);
 const [countries,setCountries]=useState([]);
 const [statuses,setStatuses]=useState([]);
 const [programs,setPrograms]=useState([]);
 const [meetingMethods,setMeetingMethods]=useState([]);
 const [loading,setLoading]=useState(isEdit);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");
 const [activeTab,setActiveTab]=useState("basic");
 const [storedUser,setStoredUser]=useState(()=>getStoredUser());

 useEffect(()=>{
  setStoredUser(getStoredUser());
 },[]);

 const currentUser=user?._id||user?.id?user:storedUser;
 const currentUserId=currentUser?._id||currentUser?.id||"";
 const propMentee=mentee||initialData||null;

 const formatDate=value=>{
  if(!value)return "";
  const d=new Date(value);
  if(Number.isNaN(d.getTime()))return "";
  return d.toISOString().slice(0,10);
 };

 const getIdValue=value=>{
  if(!value)return "";
  if(typeof value==="string")return value;
  if(typeof value==="object")return value._id||"";
  return "";
 };

 const getIdArray=values=>{
  if(!Array.isArray(values))return [];
  return values.map(item=>getIdValue(item)).filter(Boolean);
 };

 const normalizeCollection=(payload,preferredKey)=>{
  if(Array.isArray(payload))return payload;
  if(!payload||typeof payload!=="object")return [];

  if(preferredKey&&Array.isArray(payload[preferredKey]))return payload[preferredKey];
  if(Array.isArray(payload.data))return payload.data;
  if(Array.isArray(payload.items))return payload.items;
  if(Array.isArray(payload.results))return payload.results;
  if(Array.isArray(payload.rows))return payload.rows;

  for(const value of Object.values(payload)){
   if(Array.isArray(value))return value;
  }

  return [];
 };

 const normalizeStatuses=payload=>{
  if(Array.isArray(payload)){
   if(payload.length&&payload[0]?.mentees&&Array.isArray(payload[0].mentees)){
    return payload[0].mentees;
   }
   return payload;
  }

  if(payload?.mentees&&Array.isArray(payload.mentees))return payload.mentees;
  if(payload?.statuses&&Array.isArray(payload.statuses))return payload.statuses;
  if(payload?.data?.mentees&&Array.isArray(payload.data.mentees))return payload.data.mentees;
  if(payload?.data?.statuses&&Array.isArray(payload.data.statuses))return payload.data.statuses;
  if(payload?.items?.mentees&&Array.isArray(payload.items.mentees))return payload.items.mentees;

  return [];
 };

 const buildFormFromMentee=m=>({
  firstName:m?.firstName||"",
  lastName:m?.lastName||"",
  email:m?.email||"",
  phone:m?.phone||"",
  image:m?.image||"",
  businessName:m?.businessName||"",
  website:m?.website||"",
  address1:m?.address1||"",
  address2:m?.address2||"",
  city:m?.city||"",
  state:getIdValue(m?.state),
  country:getIdValue(m?.country),
  postalCode:m?.postalCode||"",
  programs:getIdArray(m?.programs),
  hoursNeeded:m?.hoursNeeded??150,
  externshipStartDate:formatDate(m?.externshipStartDate),
  externshipEndDate:formatDate(m?.externshipEndDate),
  preferredMeetingDay:m?.preferredMeetingDay||"",
  preferredMeetingTime:m?.preferredMeetingTime||"",
  meetingDuration:m?.meetingDuration??30,
  meetingFrequency:m?.meetingFrequency||"Weekly",
  meetingMethod:getIdValue(m?.meetingMethod),
  status:getIdValue(m?.status),
  isFlagged:Boolean(m?.isFlagged),
  flagReason:m?.flagReason||"",
  riskLevel:m?.riskLevel||"low",
  currentGoalProgress:m?.currentGoalProgress||"",
  meetingRegularity:m?.meetingRegularity||"",
  finalVerification:m?.finalVerification||""
 });

 useEffect(()=>{
  let mounted=true;

  const fetchCollection=async(url,preferredKey,setter,normalizer=normalizeCollection)=>{
   try{
    const res=await fetch(url,{credentials:"include"});
    if(!res.ok)throw new Error(`Failed to load ${preferredKey}`);
    const data=await res.json();
    const items=normalizer(data,preferredKey);
    if(mounted)setter(Array.isArray(items)?items:[]);
   }catch{
    if(mounted)setter([]);
   }
  };

  const loadForm=async()=>{
   try{
    setLoading(true);
    setError("");

    await Promise.allSettled([
     fetchCollection("/api/states","states",setStates),
     fetchCollection("/api/countries","countries",setCountries),
     fetchCollection("/api/statuses/list?type=mentee","statuses",setStatuses,normalizeStatuses),
     fetchCollection("/api/programs","programs",setPrograms),
     fetchCollection("/api/meeting-methods","meetingMethods",setMeetingMethods)
    ]);

    if(isEdit){
     if(propMentee){
      if(!mounted)return;
      setForm(buildFormFromMentee(propMentee));
     }else{
      const res=await fetch(`/api/mentees/${id}`,{credentials:"include"});
      if(!res.ok)throw new Error("Failed to load mentee");
      const data=await res.json();

      if(!mounted)return;

      const m=data?.mentee||data;
      setForm(buildFormFromMentee(m));
     }
    }else{
     if(mounted)setForm(initialForm);
    }
   }catch(err){
    if(mounted)setError(err.message||"Failed to load form data");
   }finally{
    if(mounted)setLoading(false);
   }
  };

  loadForm();

  return()=>{
   mounted=false;
  };
 },[id,isEdit,propMentee]);

 const handleChange=e=>{
  const {name,value,type,checked}=e.target;
  setForm(prev=>({
   ...prev,
   [name]:type==="checkbox"?checked:value,
   ...(name==="isFlagged"&&!checked?{flagReason:""}:{})
  }));
 };

 const handleProgramToggle=programId=>{
  setForm(prev=>({
   ...prev,
   programs:prev.programs.includes(programId)?prev.programs.filter(item=>item!==programId):[...prev.programs,programId]
  }));
 };

 const handleImageChange=e=>{
  const file=e.target.files?.[0];
  if(!file)return;

  const reader=new FileReader();
  reader.onload=()=>{
   setForm(prev=>({...prev,image:typeof reader.result==="string"?reader.result:""}));
  };
  reader.readAsDataURL(file);
 };

 const handleClearImage=()=>{
  setForm(prev=>({...prev,image:""}));
  const input=document.getElementById("mentee-image-upload");
  if(input)input.value="";
 };

 const payload=useMemo(()=>({
  ...form,
  hoursNeeded:Number(form.hoursNeeded||0),
  meetingDuration:Number(form.meetingDuration||0),
  createdBy:currentUserId||"",
  state:form.state||null,
  country:form.country||null,
  programs:Array.isArray(form.programs)?form.programs.filter(Boolean):[],
  meetingMethod:form.meetingMethod||null,
  status:form.status||null,
  externshipStartDate:form.externshipStartDate||null,
  externshipEndDate:form.externshipEndDate||null,
  preferredMeetingDay:form.preferredMeetingDay||null,
  preferredMeetingTime:form.preferredMeetingTime||null,
  flagReason:form.isFlagged?form.flagReason:"",
  image:form.image||""
 }),[form,currentUserId]);

 const handleSubmit=async e=>{
  e.preventDefault();

  try{
   setSaving(true);
   setError("");
   setSuccess("");

   if(!currentUserId){
    throw new Error("No logged in user found");
   }

   const method=isEdit?"PUT":"POST";
   let res;

   if(isEdit){
    res=await fetch(`/api/mentees/${id}`,{
     method,
     credentials:"include",
     headers:{
      "Content-Type":"application/json"
     },
     body:JSON.stringify(payload)
    });
   }else{
    res=await fetch("/api/mentees",{
     method,
     credentials:"include",
     headers:{
      "Content-Type":"application/json"
     },
     body:JSON.stringify(payload)
    });

    if(res.status===404){
     res=await fetch("/api/mentees/create",{
      method:"POST",
      credentials:"include",
      headers:{
       "Content-Type":"application/json"
      },
      body:JSON.stringify(payload)
     });
    }
   }

   let data=null;

   try{
    data=await res.json();
   }catch{
    data=null;
   }

   if(!res.ok){
    throw new Error(data?.error||data?.message||`${res.status} ${res.statusText}`||`Failed to ${isEdit?"update":"create"} mentee`);
   }

   setSuccess(`Mentee ${isEdit?"updated":"created"} successfully`);

   if(onSuccess){
    onSuccess(data);
    return;
   }

   const menteeRecordId=data?.mentee?._id||data?._id||id;

   setTimeout(()=>{
    if(menteeRecordId){
     navigate(`/mentees/${menteeRecordId}`);
    }else{
     navigate("/mentees");
    }
   },800);
  }catch(err){
   setError(err.message||"Failed to save mentee");
  }finally{
   setSaving(false);
  }
 };

 const goToTab=tab=>{
  setActiveTab(tab);
 };

 const goNext=()=>{
  const index=tabs.indexOf(activeTab);
  if(index<tabs.length-1)setActiveTab(tabs[index+1]);
 };

 const goBack=()=>{
  const index=tabs.indexOf(activeTab);
  if(index>0)setActiveTab(tabs[index-1]);
 };

 const renderField=(label,field)=>(
  <div className="mentee-form-row">
   <label className="mentee-form-label">{label}</label>
   <div className="mentee-form-field">{field}</div>
  </div>
 );

 const selectedPrograms=useMemo(()=>{
  if(!Array.isArray(programs)||!programs.length)return [];
  return programs.filter(program=>form.programs.includes(program._id));
 },[programs,form.programs]);

 if(loading){
  return(
   <section className="mentee-form-page">
    <div className="mentee-form-shell">
     <div className="mentee-form-card">
      <div className="mentee-form-header">
       <div>
        <p className="mentee-form-eyebrow">Mentees</p>
        <h1 className="mentee-form-title">{isEdit?"Edit Mentee":"Add Mentee"}</h1>
        <p className="mentee-form-text">Loading form...</p>
       </div>
      </div>
     </div>
    </div>
   </section>
  );
 }

 return(
  <section className="mentee-form-page">
   <div className="mentee-form-shell">
    <form className="mentee-form-card" onSubmit={handleSubmit} autoComplete="off">
     <div className="mentee-form-header">
      <div>
       <p className="mentee-form-eyebrow">Mentees</p>
       <h1 className="mentee-form-title">{isEdit?"Edit Mentee":"Add Mentee"}</h1>
       <p className="mentee-form-text">Create or update mentee details, program assignments, meeting preferences, and tracking status.</p>
      </div>
     </div>

     {error&&<div className="mentee-form-alert mentee-form-alert-error">{error}</div>}
     {success&&<div className="mentee-form-alert mentee-form-alert-success">{success}</div>}

     <div className="mb-4">
      <ul className="nav nav-tabs">
       <li className="nav-item">
        <button type="button" className={`nav-link ${activeTab==="basic"?"active":""}`} onClick={()=>goToTab("basic")}>Basic Info</button>
       </li>
       <li className="nav-item">
        <button type="button" className={`nav-link ${activeTab==="address"?"active":""}`} onClick={()=>goToTab("address")}>Address</button>
       </li>
       <li className="nav-item">
        <button type="button" className={`nav-link ${activeTab==="programs"?"active":""}`} onClick={()=>goToTab("programs")}>Programs</button>
       </li>
       <li className="nav-item">
        <button type="button" className={`nav-link ${activeTab==="meetings"?"active":""}`} onClick={()=>goToTab("meetings")}>Meetings</button>
       </li>
       <li className="nav-item">
        <button type="button" className={`nav-link ${activeTab==="tracking"?"active":""}`} onClick={()=>goToTab("tracking")}>Tracking</button>
       </li>
      </ul>
     </div>

     {activeTab==="basic"&&(
      <div className="mentee-form-section">
       <h2 className="mentee-form-section-title">Basic Information</h2>
       <div className="row g-3">
        <div className="col-md-6">
         {renderField("First Name",<input type="text" name="firstName" className="mentee-form-input" value={form.firstName} onChange={handleChange} autoComplete="given-name" required />)}
        </div>
        <div className="col-md-6">
         {renderField("Last Name",<input type="text" name="lastName" className="mentee-form-input" value={form.lastName} onChange={handleChange} autoComplete="family-name" required />)}
        </div>
        <div className="col-md-6">
         {renderField("Email",<input type="email" name="email" className="mentee-form-input" value={form.email} onChange={handleChange} autoComplete="email" />)}
        </div>
        <div className="col-md-6">
         {renderField("Phone",<input type="text" name="phone" className="mentee-form-input" value={form.phone} onChange={handleChange} autoComplete="tel" />)}
        </div>
        <div className="col-md-6">
         {renderField("Business Name",<input type="text" name="businessName" className="mentee-form-input" value={form.businessName} onChange={handleChange} autoComplete="organization" />)}
        </div>
        <div className="col-md-6">
         {renderField("Website",<input type="text" name="website" className="mentee-form-input" value={form.website} onChange={handleChange} autoComplete="url" />)}
        </div>
        <div className="col-12">
         <div className="mentee-form-row">
          <label className="mentee-form-label">Image</label>
          <div className="mentee-form-field">
           <div className="d-flex flex-column gap-2">
            {form.image?(
             <div>
              <img
               src={form.image}
               alt="Mentee preview"
               style={{width:"120px",height:"120px",objectFit:"cover",borderRadius:"10px",border:"1px solid #d1d5db"}}
              />
             </div>
            ):null}
            <input id="mentee-image-upload" type="file" name="imageUpload" accept="image/*" className="mentee-form-input" onChange={handleImageChange} autoComplete="off" />
            <div className="d-flex gap-2">
             <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleClearImage}>Clear</button>
            </div>
           </div>
          </div>
         </div>
        </div>
       </div>
      </div>
     )}

     {activeTab==="address"&&(
      <div className="mentee-form-section">
       <h2 className="mentee-form-section-title">Address</h2>
       <div className="row g-3">
        <div className="col-12">
         {renderField("Address 1",<input type="text" name="address1" className="mentee-form-input" value={form.address1} onChange={handleChange} autoComplete="address-line1" />)}
        </div>
        <div className="col-12">
         {renderField("Address 2",<input type="text" name="address2" className="mentee-form-input" value={form.address2} onChange={handleChange} autoComplete="address-line2" />)}
        </div>
        <div className="col-md-4">
         {renderField("City",<input type="text" name="city" className="mentee-form-input" value={form.city} onChange={handleChange} autoComplete="address-level2" />)}
        </div>
        <div className="col-md-4">
         {renderField("State",<select name="state" className="mentee-form-select" value={form.state} onChange={handleChange} autoComplete="address-level1"><option value="">Select state</option>{states.map(item=><option key={item._id} value={item._id}>{item.name||item.stateName||item.label}</option>)}</select>)}
        </div>
        <div className="col-md-4">
         {renderField("Country",<select name="country" className="mentee-form-select" value={form.country} onChange={handleChange} autoComplete="country-name"><option value="">Select country</option>{countries.map(item=><option key={item._id} value={item._id}>{item.name||item.countryName||item.label}</option>)}</select>)}
        </div>
        <div className="col-md-4">
         {renderField("Postal Code",<input type="text" name="postalCode" className="mentee-form-input" value={form.postalCode} onChange={handleChange} autoComplete="postal-code" />)}
        </div>
       </div>
      </div>
     )}

     {activeTab==="programs"&&(
      <div className="mentee-form-section">
       <h2 className="mentee-form-section-title">Programs</h2>
       <div className="row g-3">
        <div className="col-md-4">
         {renderField("Hours Needed",<input type="number" min="0" name="hoursNeeded" className="mentee-form-input" value={form.hoursNeeded} onChange={handleChange} autoComplete="off" />)}
        </div>
        <div className="col-md-4">
         {renderField("Externship Start Date",<input type="date" name="externshipStartDate" className="mentee-form-input" value={form.externshipStartDate} onChange={handleChange} autoComplete="off" />)}
        </div>
        <div className="col-md-4">
         {renderField("Externship End Date",<input type="date" name="externshipEndDate" className="mentee-form-input" value={form.externshipEndDate} onChange={handleChange} autoComplete="off" />)}
        </div>

        <div className="col-12">
         <div className="mentee-form-row">
          <label className="mentee-form-label">Assigned Programs</label>
          <div className="mentee-form-field">
           {programs.length?(
            <div className="row g-2">
             {programs.map(program=>(
              <div key={program._id} className="col-md-6">
               <div className="form-check">
                <input
                 id={`program-${program._id}`}
                 type="checkbox"
                 name={`program-${program._id}`}
                 className="form-check-input"
                 checked={form.programs.includes(program._id)}
                 onChange={()=>handleProgramToggle(program._id)}
                 autoComplete="off"
                />
                <label htmlFor={`program-${program._id}`} className="form-check-label">
                 {program.courseName||"Unnamed Program"} {program.category?`(${program.category})`:""}
                </label>
               </div>
              </div>
             ))}
            </div>
           ):<div className="text-muted">No programs available.</div>}
          </div>
         </div>
        </div>

        {selectedPrograms.length?(
         <div className="col-12">
          <div className="mentee-form-row">
           <label className="mentee-form-label">Selected</label>
           <div className="mentee-form-field">
            <ul className="mb-0">
             {selectedPrograms.map(program=>(
              <li key={program._id}>{program.courseName||"Unnamed Program"} {program.programType?`- ${program.programType}`:""} {program.category?`- ${program.category}`:""}</li>
             ))}
            </ul>
           </div>
          </div>
         </div>
        ):null}
       </div>
      </div>
     )}

     {activeTab==="meetings"&&(
      <div className="mentee-form-section">
       <h2 className="mentee-form-section-title">Meeting Preferences</h2>
       <div className="row g-3">
        <div className="col-md-4">
         {renderField("Preferred Meeting Day",<select name="preferredMeetingDay" className="mentee-form-select" value={form.preferredMeetingDay} onChange={handleChange} autoComplete="off"><option value="">Select day</option><option value="Monday">Monday</option><option value="Tuesday">Tuesday</option><option value="Wednesday">Wednesday</option><option value="Thursday">Thursday</option><option value="Friday">Friday</option><option value="Saturday">Saturday</option><option value="Sunday">Sunday</option></select>)}
        </div>
        <div className="col-md-4">
         {renderField("Preferred Meeting Time",<input type="time" name="preferredMeetingTime" className="mentee-form-input" value={form.preferredMeetingTime} onChange={handleChange} autoComplete="off" />)}
        </div>
        <div className="col-md-4">
         {renderField("Meeting Duration",<input type="number" min="0" name="meetingDuration" className="mentee-form-input" value={form.meetingDuration} onChange={handleChange} autoComplete="off" />)}
        </div>
        <div className="col-md-6">
         {renderField("Meeting Frequency",<select name="meetingFrequency" className="mentee-form-select" value={form.meetingFrequency} onChange={handleChange} autoComplete="off"><option value="Weekly">Weekly</option><option value="bi-weekly">bi-weekly</option></select>)}
        </div>
        <div className="col-md-6">
         {renderField("Meeting Method",<select name="meetingMethod" className="mentee-form-select" value={form.meetingMethod} onChange={handleChange} autoComplete="off"><option value="">Select meeting method</option>{meetingMethods.map(item=><option key={item._id} value={item._id}>{item.name||item.label||item.methodName}</option>)}</select>)}
        </div>
       </div>
      </div>
     )}

     {activeTab==="tracking"&&(
      <div className="mentee-form-section">
       <h2 className="mentee-form-section-title">Status & Tracking</h2>
       <div className="row g-3">
        <div className="col-md-4">
         {renderField("Status",<select name="status" className="mentee-form-select" value={form.status} onChange={handleChange} autoComplete="off"><option value="">Select status</option>{statuses.map(item=><option key={item._id} value={item._id}>{item.name||item.label}</option>)}</select>)}
        </div>
        <div className="col-md-4">
         {renderField("Risk Level",<select name="riskLevel" className="mentee-form-select" value={form.riskLevel} onChange={handleChange} autoComplete="off"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select>)}
        </div>
        <div className="col-md-4">
         {renderField("Current Goal Progress",<select name="currentGoalProgress" className="mentee-form-select" value={form.currentGoalProgress} onChange={handleChange} autoComplete="off"><option value="">Select progress</option><option value="on-track">On Track</option><option value="needs-revision">Needs Revision</option></select>)}
        </div>
        <div className="col-md-6">
         {renderField("Meeting Regularity",<select name="meetingRegularity" className="mentee-form-select" value={form.meetingRegularity} onChange={handleChange} autoComplete="off"><option value="">Select regularity</option><option value="consistent">Consistent</option><option value="infrequent">Infrequent</option></select>)}
        </div>
        <div className="col-md-6">
         {renderField("Final Verification",<select name="finalVerification" className="mentee-form-select" value={form.finalVerification} onChange={handleChange} autoComplete="off"><option value="">Select verification</option><option value="manual-sheet-needed">Manual Sheet Needed</option><option value="portal-complete">Portal Complete</option></select>)}
        </div>
        <div className="col-12">
         <div className="mentee-form-row mentee-form-row-check">
          <label className="mentee-form-label">Flagged</label>
          <div className="mentee-form-field">
           <div className="mentee-form-check form-check">
            <input id="isFlagged" type="checkbox" name="isFlagged" className="form-check-input" checked={form.isFlagged} onChange={handleChange} autoComplete="off" />
            <label htmlFor="isFlagged" className="form-check-label">Flag this mentee</label>
           </div>
          </div>
         </div>
        </div>
        {form.isFlagged&&(
         <div className="col-12">
          {renderField("Flag Reason",<textarea name="flagReason" className="mentee-form-input mentee-form-textarea" rows="3" value={form.flagReason} onChange={handleChange} autoComplete="off" />)}
         </div>
        )}
       </div>
      </div>
     )}

     <div className="d-flex justify-content-between align-items-center gap-2 mt-4">
      <div className="d-flex gap-2">
       <button type="button" className="btn btn-outline-secondary" onClick={onCancel?onCancel:()=>navigate(-1)} disabled={saving}>Cancel</button>
       <button type="button" className="btn btn-outline-secondary" onClick={goBack} disabled={saving||tabs.indexOf(activeTab)===0}>Back</button>
      </div>

      <div className="d-flex gap-2">
       {tabs.indexOf(activeTab)<tabs.length-1?(
        <button type="button" className="btn btn-primary" onClick={goNext} disabled={saving}>Next</button>
       ):(
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving?(isEdit?"Saving...":"Creating..."):(isEdit?"Update Mentee":"Create Mentee")}</button>
       )}
      </div>
     </div>
    </form>
   </div>
  </section>
 );
}

export default MenteeForm;