// src/pages/Dashboard.jsx
import {useEffect,useState} from "react";
import {FolderKanban,Music2,ListMusic,NotebookPen,LayoutList,FileText} from "lucide-react";
import "../styles/Dashboard.css";
import DashboardHero from "../components/dashboard/DashboardHero.jsx";
import DashboardSection from "../components/dashboard/DashboardSection.jsx";
import QuickActionsPanel from "../components/dashboard/QuickActionsPanel.jsx";

const ENDPOINTS=[
 {key:"musicProjects",endpoint:"/api/music-projects",id:"music-projects",label:"Music Projects",Icon:FolderKanban},
 {key:"chordIdeas",endpoint:"/api/chord-ideas",id:"chord-ideas",label:"Chord Ideas",Icon:Music2},
 {key:"chordProgressions",endpoint:"/api/chord-progressions",id:"chord-progressions",label:"Chord Progressions",Icon:ListMusic},
 {key:"lyricIdeas",endpoint:"/api/lyric-ideas",id:"lyric-ideas",label:"Lyric Ideas",Icon:NotebookPen},
 {key:"arrangementIdeas",endpoint:"/api/arrangement-ideas",id:"arrangement-ideas",label:"Arrangement Ideas",Icon:LayoutList},
 {key:"musicNotes",endpoint:"/api/music-notes",id:"music-notes",label:"Music Notes",Icon:FileText}
];

function Dashboard({user}){
 const [quickActionsOpen,setQuickActionsOpen]=useState(false);
 const [records,setRecords]=useState(Object.fromEntries(ENDPOINTS.map(item=>[item.key,[]])));
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");

 useEffect(()=>{
  let ignore=false;
  const token=localStorage.getItem("token")||sessionStorage.getItem("token")||"";
  Promise.all(ENDPOINTS.map(async item=>{
   const response=await fetch(item.endpoint,{headers:{Authorization:"Bearer "+token}});
   const data=await response.json().catch(()=>[]);
   if(!response.ok)throw new Error(data.message||data.error||"Unable to load dashboard.");
   return [item.key,Array.isArray(data)?data:data.data||[]];
  })).then(values=>{
   if(!ignore)setRecords(Object.fromEntries(values));
  }).catch(err=>{
   if(!ignore)setError(err.message);
  }).finally(()=>{
   if(!ignore)setLoading(false);
  });
  return()=>{ignore=true;};
 },[]);

 const collections=ENDPOINTS.map(item=>{
  const Icon=item.Icon;
  return{id:item.id,label:item.label,value:records[item.key].length,icon:<Icon size={18} strokeWidth={2.2}/>};
 });

 const recentItems=[
  ...records.musicProjects.map(item=>({...item,type:"Music Project",meta:item.status||item.description||"Project"})),
  ...records.chordIdeas.map(item=>({...item,type:"Chord Idea",meta:[item.chord,item.key,item.instrument].filter(Boolean).join(" · ")||"Chord"})),
  ...records.chordProgressions.map(item=>({...item,type:"Chord Progression",meta:[item.key,item.mode,item.timeSignature,item.tempo?item.tempo+" BPM":""].filter(Boolean).join(" · ")||item.chords?.join(" – ")||"Progression"})),
  ...records.lyricIdeas.map(item=>({...item,type:"Lyric Idea",meta:item.content||"Lyrics"})),
  ...records.arrangementIdeas.map(item=>({...item,type:"Arrangement Idea",meta:item.content||"Arrangement"})),
  ...records.musicNotes.map(item=>({...item,type:"Music Note",meta:item.content||"Note"}))
 ].sort((a,b)=>new Date(b.updatedAt||b.createdAt||0)-new Date(a.updatedAt||a.createdAt||0)).slice(0,8);

 return(
  <section className="dashboard">
   <DashboardHero user={user}/>
   {error?<div className="alert alert-danger" role="alert">{error}</div>:null}
   <section className="dashboard-cards">
    {collections.map(item=><article id={item.id} key={item.label} className="dashboard-card"><div className="dashboard-card-top"><span className="dashboard-card-icon">{item.icon}</span><p className="dashboard-card-label">{item.label}</p></div><p className="dashboard-card-value">{loading?"…":item.value}</p></article>)}
   </section>
   <div className="dashboard-grid">
    <section className="dashboard-main">
     <DashboardSection kicker="Music Library" title="Ideas and Projects" className="dashboard-section-charts dashboard-music-summary">
      <div className="dashboard-chart-grid"><div className="dashboard-chart-card dashboard-badge-card"><div className="dashboard-chart-head"><h3 className="dashboard-chart-title">Records by Type</h3></div><div className="dashboard-type-badges">{collections.map(item=><span className="dashboard-type-badge" key={item.label}><span>{item.label}</span><strong>{loading?"…":item.value}</strong></span>)}</div></div></div>
     </DashboardSection>
     <DashboardSection kicker="Recently Updated" title="Latest Music Work" className="dashboard-music-recent">
      {loading?<div className="dashboard-empty">Loading music records...</div>:recentItems.length?<ul className="dashboard-list">{recentItems.map((item,index)=><li key={item.type+"-"+(item._id||index)} className="dashboard-list-item"><span className="dashboard-list-content"><span className="dashboard-item-title">{item.title||item.chord||"Untitled "+item.type}</span><span className="dashboard-item-meta">{item.type} · {item.meta}</span></span></li>)}</ul>:<div className="dashboard-empty">No music projects, ideas, or notes yet.</div>}
     </DashboardSection>
    </section>
    <aside className="dashboard-sidebar"><QuickActionsPanel open={quickActionsOpen} onToggle={()=>setQuickActionsOpen(value=>!value)}/></aside>
   </div>
  </section>
 );
}

export default Dashboard;
