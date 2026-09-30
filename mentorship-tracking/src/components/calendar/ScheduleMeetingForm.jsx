import {useState} from "react";

const localInputParts=value=>{
 const date=value?new Date(value):new Date();
 if(Number.isNaN(date.getTime()))return{date:"",time:""};
 const local=new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString();
 return{date:local.slice(0,10),time:local.slice(11,16)};
};

function ScheduleMeetingForm({event,mentees,user,onSaved,onCancel}){
 const startParts=localInputParts(event?.start);
 const initialDuration=event?.start&&event?.end?Math.max(15,Math.round((new Date(event.end)-new Date(event.start))/60000)):30;
 const[form,setForm]=useState({
  title:event?.title||"",
  mentee:String(event?.resource?.menteeId||""),
  date:startParts.date,
  time:startParts.time,
  duration:initialDuration,
  eventType:event?.resource?.eventType||"session",
  notes:Array.isArray(event?.resource?.notes)?event.resource.notes:(event?.resource?.notes?[event.resource.notes]:[])
 });
 const[saving,setSaving]=useState(false);
 const[error,setError]=useState("");
 const nameOf=item=>`${item?.firstName||""} ${item?.lastName||""}`.trim()||item?.fullName||"Mentee";

 const submit=async(submitEvent)=>{
  submitEvent.preventDefault();
  if(!form.title.trim()||!form.date||!form.time){
   setError("Subject, date, and time are required.");
   return;
  }
  const start=new Date(`${form.date}T${form.time}`);
  const end=new Date(start.getTime()+Number(form.duration)*60000);
  const payload={
   mentee:form.mentee||null,
   title:form.title.trim(),
   start:start.toISOString(),
   end:end.toISOString(),
   eventType:form.eventType,
   notes:form.notes.map(note=>note.trim()).filter(Boolean),
   createdBy:user?._id||user?.id
  };
  try{
   setSaving(true);
   setError("");
   const response=await fetch(event?.id?`/api/calendar-events/${event.id}`:"/api/calendar-events/create",{
    method:event?.id?"PUT":"POST",
    credentials:"include",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });
   const result=await response.json().catch(()=>null);
   if(!response.ok)throw new Error(result?.message||"Failed to save scheduled event.");
   onSaved?.();
  }catch(err){
   setError(err.message||"Failed to save scheduled event.");
  }finally{
   setSaving(false);
  }
 };

 return(
  <form className="schedule-meeting-form" onSubmit={submit}>
   <div className="schedule-form-row">
    <label htmlFor="schedule-title">Subject:</label>
    <input id="schedule-title" value={form.title} onChange={e=>setForm(current=>({...current,title:e.target.value}))} required/>
   </div>
   <div className="schedule-form-row">
    <label htmlFor="schedule-mentee">Mentee:</label>
    <select id="schedule-mentee" value={form.mentee} onChange={e=>setForm(current=>({...current,mentee:e.target.value}))}>
     <option value="">Not related to a mentee</option>
     {mentees.map(item=><option value={item._id} key={item._id}>{nameOf(item)}</option>)}
    </select>
   </div>
   <div className="schedule-form-row">
    <label htmlFor="schedule-date">Date:</label>
    <input id="schedule-date" type="date" value={form.date} onChange={e=>setForm(current=>({...current,date:e.target.value}))} required/>
   </div>
   <div className="schedule-form-row">
    <label htmlFor="schedule-time">Time:</label>
    <input id="schedule-time" type="time" value={form.time} onChange={e=>setForm(current=>({...current,time:e.target.value}))} required/>
   </div>
   <div className="schedule-form-row">
    <label htmlFor="schedule-duration">Duration:</label>
    <select id="schedule-duration" value={form.duration} onChange={e=>setForm(current=>({...current,duration:Number(e.target.value)}))}>
     {[15,30,45,60,90,120].map(value=><option value={value} key={value}>{value} minutes</option>)}
    </select>
   </div>
   <div className="schedule-form-row">
    <label htmlFor="schedule-type">Type:</label>
    <select id="schedule-type" value={form.eventType} onChange={e=>setForm(current=>({...current,eventType:e.target.value}))}>
     <option value="session">Session</option>
     <option value="follow-up">Follow-up</option>
     <option value="reminder">Reminder</option>
     <option value="other">Other</option>
    </select>
   </div>
   <div className="schedule-notes-editor">
    <div className="schedule-notes-heading"><strong>Notes</strong></div>
    {form.notes.length?form.notes.map((note,index)=>(
     <div className="schedule-note-row" key={index}>
      <label htmlFor={`schedule-note-${index}`}>Note {index+1}:</label>
      <input id={`schedule-note-${index}`} value={note} onChange={e=>setForm(current=>({...current,notes:current.notes.map((item,itemIndex)=>itemIndex===index?e.target.value:item)}))}/>
      <button type="button" onClick={()=>setForm(current=>({...current,notes:current.notes.filter((_,itemIndex)=>itemIndex!==index)}))}>Remove</button>
     </div>
    )):<span className="schedule-no-notes">No notes added.</span>}
    <div className="schedule-notes-add">
     <button type="button" onClick={()=>setForm(current=>({...current,notes:[...current.notes,""]}))}>Add Note</button>
    </div>
   </div>
   {error?<p className="schedule-form-error">{error}</p>:null}
   <div className="schedule-form-actions">
    <button type="button" className="btn-secondary" onClick={onCancel} disabled={saving}>Cancel</button>
    <button type="submit" disabled={saving}>{saving?"Saving…":event?.id?"Update Event":"Schedule Event"}</button>
   </div>
  </form>
 );
}

export default ScheduleMeetingForm;
