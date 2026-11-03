import {MusicDialog as Modal} from "../components/MusicDialog.jsx";
import {FolderKanban,Plus,Search,Pencil,Trash2} from "lucide-react";
import {useMusicRecords,csv} from "../hooks/useMusicRecords.js";
import {Field,TextArea,TextInput,SelectInput} from "../components/MusicFormControls.jsx";
import "../styles/MusicPages.css";

const emptyProject=()=>({title:"",description:"",status:"Idea",notes:"",tags:"",isActive:true});
const toForm=item=>({...item,tags:(item.tags||[]).join(", ")});

export default function MusicProjectsPage(){
 const page=useMusicRecords("/api/music-projects",emptyProject,toForm);
 const update=(name,value)=>page.setForm(current=>({...current,[name]:value}));
 const submit=event=>{event.preventDefault();page.save({...page.form,tags:csv(page.form.tags)});};
 const groups=["Idea","Writing","Developing","Complete"];
 return <section className="music-page projects-page">
  <header className="music-page-header"><div><span>Workspace</span><h1>Music Projects</h1><p>Track each piece from the first idea through a finished arrangement.</p></div><button onClick={page.openCreate}><Plus size={18}/>New project</button></header>
  <div className="projects-tools"><label className="app-search-control"><Search size={17}/><input value={page.query} onChange={event=>page.setQuery(event.target.value)} placeholder="Find a project"/></label><span>{page.total} projects</span></div>
  {page.error&&!page.showForm?<p className="music-error">{page.error}</p>:null}
  <div className="project-board">{groups.map(status=><section key={status}><header><h2>{status}</h2><span>{page.items.filter(item=>(item.status||"Idea")===status).length}</span></header><div>{page.items.filter(item=>(item.status||"Idea")===status).map(item=><article key={item._id}><h3>{item.title}</h3><p>{item.description||"No description"}</p><div className="music-card-actions"><button onClick={()=>page.openEdit(item)}><Pencil size={15}/></button><button onClick={()=>page.remove(item)}><Trash2 size={15}/></button></div></article>)}</div></section>)}</div>
  {!page.loading&&!page.items.length?<div className="music-empty"><FolderKanban/><h2>No projects yet</h2><p>Start with the musical idea you want to develop.</p></div>:null}
  <Modal className="music-editor-modal" dialogClassName="music-editor-dialog" show={page.showForm} onHide={page.close} backdrop="static" centered>
   <form onSubmit={submit}><Modal.Header closeButton={!page.saving}><Modal.Title>{page.editingId?"Edit project":"New music project"}</Modal.Title></Modal.Header><Modal.Body>{page.error?<p className="music-error">{page.error}</p>:null}<div className="project-form-layout"><section><h3>Project identity</h3><Field label="Title"><TextInput required value={page.form.title} onChange={e=>update("title",e.target.value)}/></Field><Field label="Status"><SelectInput value={page.form.status} onChange={e=>update("status",e.target.value)}>{groups.map(value=><option key={value}>{value}</option>)}</SelectInput></Field><Field label="Description" wide><TextArea rows="3" value={page.form.description} onChange={e=>update("description",e.target.value)}/></Field></section><section><h3>Working notes</h3><Field label="Notes" wide><TextArea rows="7" value={page.form.notes} onChange={e=>update("notes",e.target.value)}/></Field><Field label="Tags"><TextInput value={page.form.tags} onChange={e=>update("tags",e.target.value)}/></Field><Field label="Active"><label className="music-toggle"><input type="checkbox" checked={page.form.isActive} onChange={e=>update("isActive",e.target.checked)}/><span>Available in workspace</span></label></Field></section></div></Modal.Body><Modal.Footer><button type="button" onClick={page.close}>Cancel</button><button className="is-primary" disabled={page.saving}>{page.saving?"Saving…":"Save project"}</button></Modal.Footer></form>
  </Modal>
 </section>;
}
