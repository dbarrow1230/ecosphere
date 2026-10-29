import {useEffect,useMemo,useState} from "react";
import apps from "../data/apps";
import {Link} from "react-router-dom";
import {ArrowUpRight,Globe} from "lucide-react";
import catalog from "../data/publicWebsiteCatalog.js";
import runtime from "../../app-runtime-config.json";
import "../styles/ApplicationDashboard.css";

function PublicWebsites(){
  const [selectedLetter,setSelectedLetter]=useState("ALL");
  const [search,setSearch]=useState("");
  const [businesses,setBusinesses]=useState({});
  useEffect(()=>{const controller=new AbortController();Promise.all(apps.filter(app=>runtime.publicApplications?.[app.id]).map(async app=>{try{const response=await fetch(`/api/app/current-business/${app.id}`,{signal:controller.signal});if(!response.ok)return null;const {business}=await response.json();return business?{id:app.id,title:business.legalName,logo:business.logo}:null;}catch{return null;}})).then(rows=>{if(!controller.signal.aborted)setBusinesses(Object.fromEntries(rows.filter(Boolean).map(row=>[row.id,row])));});return()=>controller.abort();},[]);
  const switchableApps=useMemo(
    ()=>apps.filter(app=>runtime.publicApplications?.[app.id]).map(app=>({...app,...catalog[app.id],title:businesses[app.id]?.title||catalog[app.id]?.title||app.title,fallbackLogo:app.logo,logo:businesses[app.id]?.logo?(/^(https?:\/\/|data:image\/(png|jpe?g|webp|gif|avif);base64,)/i.test(businesses[app.id].logo)?businesses[app.id].logo:`http://${runtime.host}:${runtime.publicApplications[app.id]}${businesses[app.id].logo.startsWith("/")?businesses[app.id].logo:`/logos/${businesses[app.id].logo}`}`):app.logo})).sort((a,b)=>a.title.localeCompare(b.title)),
    [businesses]
  );
  const availableLetters=useMemo(
    ()=>new Set(switchableApps.map(app=>app.title.charAt(0).toUpperCase())),
    [switchableApps]
  );
  const visibleApps=useMemo(
    ()=>switchableApps.filter(app=>{
      const matchesLetter=selectedLetter==="ALL"||app.title.toUpperCase().startsWith(selectedLetter);
      const query=search.trim().toLowerCase();
      const matchesSearch=!query||`${app.title} ${app.description}`.toLowerCase().includes(query);
      return matchesLetter&&matchesSearch;
    }),
    [search,selectedLetter,switchableApps]
  );
  const alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <main className="application-dashboard">
      <header className="application-dashboard-header">
        
        <h1><Globe size={36} aria-hidden="true"/> Public websites</h1>
        
      </header>

      <nav className="application-dashboard-jump" aria-label="Filter websites by first letter">
       <button
        type="button"
        className={selectedLetter==="ALL"?"is-active":""}
        onClick={()=>setSelectedLetter("ALL")}
        aria-pressed={selectedLetter==="ALL"}
       >
        All
       </button>

       {alphabet.map(letter=>(
        <button
         type="button"
         key={letter}
         className={selectedLetter===letter?"is-active":""}
         disabled={!availableLetters.has(letter)}
         onClick={()=>setSelectedLetter(letter)}
         aria-pressed={selectedLetter===letter}
        >
         {letter}
        </button>
       ))}

       <form className="application-dashboard-search" role="search" onSubmit={event=>event.preventDefault()}>
        <label htmlFor="website-search">Search websites</label>
        <input
         id="website-search"
         type="search"
         value={search}
         onChange={event=>setSearch(event.target.value)}
         placeholder="Search websites..."
        />
        <button type="button" className="application-dashboard-clear" onClick={()=>setSearch("")} disabled={!search}>
         Clear
        </button>
       </form>
      </nav>

      <p className="application-dashboard-count">
       Showing {visibleApps.length} {visibleApps.length===1?"website":"websites"}
      </p>

      <section className="application-dashboard-grid" aria-label="Business websites">
        {visibleApps.map((app) => (
            <Link key={app.id} className="app-card" to={`/public-websites/${app.id}`} target="_blank" rel="noopener noreferrer" aria-label={`${app.title}: ${app.description}`}><span className="app-card-icon has-logo" aria-hidden="true">{app.logo?<img src={app.logo} alt="" onError={event=>{if(!event.currentTarget.dataset.fallback){event.currentTarget.dataset.fallback="true";event.currentTarget.src=app.fallbackLogo;}}}/>:<Globe size={28}/>}</span><span className="app-card-body"><span className="app-card-title">{app.title}</span><span className="app-card-description">{app.description}</span></span><ArrowUpRight className="app-card-arrow" size={20} aria-hidden="true"/></Link>
          ))}
      </section>
      {!visibleApps.length&&<p role="status">No websites match your search and selected letter.</p>}
    </main>
  );
}

export default PublicWebsites;
