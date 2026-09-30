import {useMemo,useState} from "react";
import {Link} from "react-router-dom";
import ShellAlertCenter from "../components/ShellAlertCenter.jsx";
import shellAlerts from "../data/shellAlerts.js";
import shellFeedCatalog from "../data/shellFeedCatalog.js";
import "../styles/ShellDashboard.css";

export default function ShellDashboard(){
 const [query,setQuery]=useState("");
 const [activeTab,setActiveTab]=useState("reminders");
 const alertTotal=shellAlerts.reduce((count,group)=>count+group.items.length,0);
 const liveCount=shellFeedCatalog.filter(app=>app.status==="live").length;
 const repairCount=shellFeedCatalog.filter(app=>app.status==="repair").length;
 const visibleFeeds=useMemo(()=>{
  const value=query.trim().toLowerCase();
  if(!value)return shellFeedCatalog;
  return shellFeedCatalog.filter(app=>`${app.appTitle} ${app.feeds.join(" ")}`.toLowerCase().includes(value));
 },[query]);

 return(
  <main className="shell-dashboard-page">
   <header className="shell-dashboard-hero">
    <div>
     <p>Eco Sphere command center</p>
     <h1>Shell Dashboard</h1>
     <span>See what needs attention across your applications without opening every app.</span>
    </div>
    <Link className="btn btn-primary" to="/dashboard">Browse Applications</Link>
   </header>

   <section className="shell-dashboard-summary" aria-label="Shell dashboard totals">
    <article><span>Items needing attention</span><strong>{alertTotal}</strong></article>
    <article><span>Dashboard feeds identified</span><strong>{shellFeedCatalog.length}</strong></article>
    <article><span>Feeds based on app dashboards</span><strong>{liveCount}</strong></article>
    <article className={repairCount?"is-warning":""}><span>Connections needing repair</span><strong>{repairCount}</strong></article>
   </section>

   <section className="shell-dashboard-tabs">
    <div className="shell-dashboard-tab-list" role="tablist" aria-label="Shell dashboard views">
     <button
      type="button"
      role="tab"
      aria-selected={activeTab==="reminders"}
      className={activeTab==="reminders"?"is-active":""}
      onClick={()=>setActiveTab("reminders")}
     >
      Reminders & Alerts <span>{alertTotal}</span>
     </button>
     <button
      type="button"
      role="tab"
      aria-selected={activeTab==="feeds"}
      className={activeTab==="feeds"?"is-active":""}
      onClick={()=>setActiveTab("feeds")}
     >
      Application Feed Plan <span>{shellFeedCatalog.length}</span>
     </button>
    </div>

    {activeTab==="reminders"&&<div role="tabpanel"><ShellAlertCenter mode="dashboard"/></div>}

    {activeTab==="feeds"&&<section className="shell-feed-plan" role="tabpanel">
    <header className="shell-feed-plan-head">
     <div>
      <p>Application feed plan</p>
      <h2>What each app should send to the shell</h2>
      <span>“From dashboard” follows the screens you provided. “Recommended” fills in apps whose dashboard is still a template.</span>
     </div>
     <div className="shell-feed-search">
      <input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search apps or feed items..." aria-label="Search application feeds"/>
      <button type="button" onClick={()=>setQuery("")} disabled={!query}>Clear</button>
     </div>
    </header>
    <div className="shell-feed-grid">
     {visibleFeeds.map(app=>(
      <article className="shell-feed-card" key={app.appId}>
       <header>
        <h3>{app.appTitle}</h3>
        <span className={`shell-feed-status is-${app.status}`}>{app.status==="live"?"From dashboard":app.status==="repair"?"Repair feed":"Recommended"}</span>
       </header>
       <ul>{app.feeds.map(feed=><li key={feed}>{feed}</li>)}</ul>
       <Link to={`/applications/${encodeURIComponent(app.appId)}`}>Open application</Link>
      </article>
     ))}
    </div>
    {!visibleFeeds.length&&<p className="shell-feed-empty">No application feed matches “{query}”.</p>}
    </section>}
   </section>
  </main>
 );
}
