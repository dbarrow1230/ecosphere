import {useState} from "react";

// Explicitly temporary workflow scaffolding. It never calls an API or writes storage.
export default function WorkflowPreview({title="Workflow preview",sections=[]}){
 const [entries,setEntries]=useState([{id:1,title:"Sample entry",notes:"Open this entry to try the workflow."}]);
 const [selected,setSelected]=useState(1);
 const [draft,setDraft]=useState(entries[0]);
 const [message,setMessage]=useState("");
 const open=entry=>{setSelected(entry.id);setDraft({...entry});setMessage("");};
 const add=()=>{setSelected(null);setDraft({title:"",notes:""});setMessage("");};
 const save=event=>{
  event.preventDefault();
  if(!draft.title.trim())return;
  const entry={...draft,title:draft.title.trim(),id:selected??Math.max(0,...entries.map(item=>item.id))+1};
  setEntries(current=>selected===null?[...current,entry]:current.map(item=>item.id===selected?entry:item));
  setSelected(entry.id);setDraft(entry);setMessage("Preview updated. This sample is only kept until you leave or refresh the page.");
 };
 return(
  <section className="container py-4" style={{maxWidth:1000,margin:"2rem auto",padding:"1.5rem",textAlign:"left"}}>
   <h1>{title}</h1>
   <p role="note"><strong>Workflow preview.</strong> This page is not connected to saved records yet. All entries below are samples; changes are temporary and are not saved to MongoDB.</p>
   <nav aria-label="Preview navigation" style={{display:"flex",gap:"1rem",flexWrap:"wrap",marginBottom:"1rem"}}>
    <a href="/dashboard">Dashboard</a>
    {sections.map(section=><a key={section.path} href={section.path}>{section.title}</a>)}
   </nav>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:"1.5rem"}}>
    <section aria-label="Sample entries">
     <h2>Sample entries</h2>
     <button type="button" className="btn btn-outline-primary" onClick={add}>Add sample</button>
     <ul>{entries.map(entry=><li key={entry.id}><button type="button" className="btn btn-link" onClick={()=>open(entry)} aria-pressed={entry.id===selected}>{entry.title}</button></li>)}</ul>
    </section>
    <form onSubmit={save}>
     <h2>{selected===null?"New sample":"Edit sample"}</h2>
     <label style={{display:"block"}}>Title<input className="form-control" required value={draft.title} onChange={event=>setDraft(current=>({...current,title:event.target.value}))}/></label>
     <label style={{display:"block",margin:"1rem 0"}}>Notes<textarea className="form-control" rows={4} value={draft.notes} onChange={event=>setDraft(current=>({...current,notes:event.target.value}))}/></label>
     <button type="submit" className="btn btn-primary">Update preview only</button>
     {message&&<p role="status">{message}</p>}
    </form>
   </div>
  </section>
 );
}
