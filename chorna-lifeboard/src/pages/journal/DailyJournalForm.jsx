// src/pages/journal/DailyJournalForm.jsx
import {useEffect,useState} from "react";
import {useNavigate} from "react-router-dom";
import "../../styles/LifeboardPage.css";

function DailyJournalForm(){

 const navigate=useNavigate();

 const [prompts,setPrompts]=useState([]);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [form,setForm]=useState({
  title:"",
  entryDate:new Date().toISOString().slice(0,10),
  mood:"",
  energy:"",
  weather:"",
  location:"",
  content:"",
  activities:"",
  highlights:"",
  challenges:"",
  gratitude:"",
  lessons:"",
  nextSteps:"",
  promptResponses:[]
 });

 const getToken=()=>{
  return localStorage.getItem("token")||sessionStorage.getItem("token")||"";
 };

 useEffect(()=>{
  let ignore=false;

  const loadPrompts=async()=>{
   try{
    const token=getToken();
    const res=await fetch("/api/prompts/journal?journalType=daily",{
     headers:{
      "Content-Type":"application/json",
      ...(token?{Authorization:`Bearer ${token}`}:{})
     }
    });

    const data=await res.json().catch(()=>({}));
    const records=Array.isArray(data)?data:Array.isArray(data?.journalPrompts)?data.journalPrompts:Array.isArray(data?.prompts)?data.prompts:Array.isArray(data?.data)?data.data:[];

    if(!ignore){
     setPrompts(records);
     setForm(prev=>({
      ...prev,
      promptResponses:records.map(item=>({
       prompt:item._id,
       question:item.question,
       answer:""
      }))
     }));
    }
   }catch(err){
    console.error(err);
   }
  };

  loadPrompts();

  return()=>{
   ignore=true;
  };
 },[]);

 const updateField=(field,value)=>{
  setForm(prev=>({...prev,[field]:value}));
 };

 const updatePromptAnswer=(index,value)=>{
  setForm(prev=>({
   ...prev,
   promptResponses:prev.promptResponses.map((item,i)=>i===index?{...item,answer:value}:item)
  }));
 };

 const splitLines=value=>{
  return String(value||"").split("\n").map(item=>item.trim()).filter(Boolean);
 };

 const handleSubmit=async e=>{
  e.preventDefault();

  try{
   setSaving(true);
   setError("");

   const token=getToken();
   const payload={
    title:form.title||"Daily Journal",
    journalType:"daily",
    entryDate:form.entryDate,
    mood:form.mood,
    energy:form.energy?Number(form.energy):undefined,
    weather:form.weather,
    location:form.location,
    content:form.content,
    activities:splitLines(form.activities),
    highlights:splitLines(form.highlights),
    challenges:splitLines(form.challenges),
    gratitude:splitLines(form.gratitude),
    lessons:splitLines(form.lessons),
    nextSteps:splitLines(form.nextSteps),
    promptResponses:form.promptResponses,
    isPrivate:false
   };

   const res=await fetch("/api/journal",{
    method:"POST",
    headers:{
     "Content-Type":"application/json",
     ...(token?{Authorization:`Bearer ${token}`}:{})
    },
    body:JSON.stringify(payload)
   });

   const data=await res.json().catch(()=>({}));

   if(!res.ok)throw new Error(data.message||"Failed to save journal entry");

   navigate("/journal");
  }catch(err){
   setError(err.message);
  }finally{
   setSaving(false);
  }
 };

 return(
  <section className="lifeboard-page">

   <header className="lifeboard-page-header">
    <div>
     <p className="lifeboard-page-eyebrow">Journal</p>
     <h1 className="lifeboard-page-title">Daily Journal Entry</h1>
     <p className="lifeboard-page-text">Record daily activities, mood, reflections, highlights, challenges, gratitude, and next steps.</p>
    </div>
   </header>

   <form onSubmit={handleSubmit} className="lifeboard-page-card" style={{padding:"1.25rem",display:"grid",gap:"1rem"}}>
    {error&&<div className="lifeboard-page-error">{error}</div>}

    <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:"1rem"}}>
     <label>
      Title
      <input className="lifeboard-page-search" value={form.title} onChange={(e)=>updateField("title",e.target.value)} placeholder="Daily Journal"/>
     </label>

     <label>
      Entry Date
      <input className="lifeboard-page-search" type="date" value={form.entryDate} onChange={(e)=>updateField("entryDate",e.target.value)} required/>
     </label>

     <label>
      Mood
      <input className="lifeboard-page-search" value={form.mood} onChange={(e)=>updateField("mood",e.target.value)} placeholder="Calm, focused, tired..."/>
     </label>

     <label>
      Energy
      <input className="lifeboard-page-search" type="number" min="1" max="10" value={form.energy} onChange={(e)=>updateField("energy",e.target.value)} placeholder="1-10"/>
     </label>

     <label>
      Weather
      <input className="lifeboard-page-search" value={form.weather} onChange={(e)=>updateField("weather",e.target.value)} placeholder="Sunny, rainy..."/>
     </label>

     <label>
      Location
      <input className="lifeboard-page-search" value={form.location} onChange={(e)=>updateField("location",e.target.value)} placeholder="Where were you?"/>
     </label>
    </div>

    <label>
     Main Entry
     <textarea className="lifeboard-page-search" rows="7" value={form.content} onChange={(e)=>updateField("content",e.target.value)} placeholder="Write about your day..."/>
    </label>

    <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:"1rem"}}>
     <label>
      Activities
      <textarea className="lifeboard-page-search" rows="4" value={form.activities} onChange={(e)=>updateField("activities",e.target.value)} placeholder="One activity per line"/>
     </label>

     <label>
      Highlights
      <textarea className="lifeboard-page-search" rows="4" value={form.highlights} onChange={(e)=>updateField("highlights",e.target.value)} placeholder="One highlight per line"/>
     </label>

     <label>
      Challenges
      <textarea className="lifeboard-page-search" rows="4" value={form.challenges} onChange={(e)=>updateField("challenges",e.target.value)} placeholder="One challenge per line"/>
     </label>

     <label>
      Gratitude
      <textarea className="lifeboard-page-search" rows="4" value={form.gratitude} onChange={(e)=>updateField("gratitude",e.target.value)} placeholder="One gratitude item per line"/>
     </label>

     <label>
      Lessons
      <textarea className="lifeboard-page-search" rows="4" value={form.lessons} onChange={(e)=>updateField("lessons",e.target.value)} placeholder="One lesson per line"/>
     </label>

     <label>
      Next Steps
      <textarea className="lifeboard-page-search" rows="4" value={form.nextSteps} onChange={(e)=>updateField("nextSteps",e.target.value)} placeholder="One next step per line"/>
     </label>
    </div>

    {prompts.length>0&&(
     <section style={{display:"grid",gap:"1rem"}}>
      <h2 className="lifeboard-page-title" style={{fontSize:"1.25rem"}}>Guided Prompts</h2>

      {form.promptResponses.map((item,index)=>(
       <label key={item.prompt||index}>
        {item.question}
        <textarea className="lifeboard-page-search" rows="3" value={item.answer} onChange={(e)=>updatePromptAnswer(index,e.target.value)}/>
       </label>
      ))}
     </section>
    )}

    <button type="submit" className="lifeboard-page-action" disabled={saving}>
     {saving?"Saving...":"Save Daily Entry"}
    </button>
   </form>

  </section>
 );
}

export default DailyJournalForm;