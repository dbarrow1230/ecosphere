import {useMemo,useState} from "react";
import apps from "../data/apps";
import AppCard from "../components/AppCard";
import "../styles/ApplicationDashboard.css";

function Dashboard({onSelectApp}){
  const [selectedLetter,setSelectedLetter]=useState("ALL");
  const [search,setSearch]=useState("");
  const switchableApps=useMemo(
    ()=>apps.filter(app=>app.id!=="ecosphere"&&app.id!=="echosphere"),
    []
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
        <p className="application-dashboard-eyebrow">Connected workspace</p>
        <h1>Eco Sphere Applications</h1>
        <p>Select an application to load it inside the Eco Sphere workspace.</p>
      </header>

      <nav className="application-dashboard-jump" aria-label="Filter applications by first letter">
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
        <label htmlFor="application-search">Search applications</label>
        <input
         id="application-search"
         type="search"
         value={search}
         onChange={event=>setSearch(event.target.value)}
         placeholder="Search applications..."
        />
        <button type="button" className="application-dashboard-clear" onClick={()=>setSearch("")} disabled={!search}>
         Clear
        </button>
       </form>
      </nav>

      <p className="application-dashboard-count">
       Showing {visibleApps.length} {visibleApps.length===1?"application":"applications"}
      </p>

      <section className="application-dashboard-grid" aria-label="Available applications">
        {visibleApps.map((app) => (
            <AppCard
              key={app.id}
              title={app.title}
              description={app.description}
              logo={app.logo}
              onClick={() => onSelectApp(app.id)}
            />
          ))}
      </section>
    </main>
  );
}

export default Dashboard;
