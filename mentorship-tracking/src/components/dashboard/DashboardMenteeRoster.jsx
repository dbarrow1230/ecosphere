import {Link} from "react-router-dom";
import {Check,X} from "lucide-react";

function DashboardMenteeRoster({
 statuses,
 visibleStatusIds,
 showFlagged,
 search,
 mentees,
 getStatusId,
 getMenteeName,
 onToggleStatus,
 onToggleFlagged,
 onSearch,
 onClear
}){
 return(
  <>
   <section className="mentor-selector" aria-label="Filter dashboard mentee list">
    <span className="mentor-selector-label">Mentees:</span>
    <div className="mentor-status-filters">
     <span>Show:</span>
     {statuses.map(status=>(
      <label className={`mentor-filter-${String(status.code||status.name||"unknown").toLowerCase().replace(/\s+/g,"-")}`} key={status._id}>
       <input className="mentor-filter-checkbox" type="checkbox" checked={visibleStatusIds.includes(String(status._id))} onChange={()=>onToggleStatus(String(status._id))}/>
       <span className="mentor-filter-state" aria-hidden="true">
        {visibleStatusIds.includes(String(status._id))?<Check size={14}/>:<X size={14}/>}
       </span>
       <span>{status.name}</span>
      </label>
     ))}
     <label className="mentor-filter-flagged">
      <input className="mentor-filter-checkbox" type="checkbox" checked={showFlagged} onChange={event=>onToggleFlagged(event.target.checked)}/>
      <span className="mentor-filter-state" aria-hidden="true">{showFlagged?<Check size={14}/>:<X size={14}/>}</span>
      <span>Flagged</span>
     </label>
    </div>
    <input
     className="mentor-selector-search"
     type="search"
     value={search}
     onChange={event=>onSearch(event.target.value)}
     placeholder="Search shown mentees"
     aria-label="Search shown mentees"
    />
    <button type="button" className="mentor-clear-selection" onClick={onClear} disabled={!visibleStatusIds.length&&!showFlagged&&!search}>
     <X size={15}/> Clear
    </button>
   </section>

   <section className="mentor-roster" aria-label="Mentees in selected scope">
    <div className="mentor-roster-heading"><span>Name</span><span>Status</span><span>Business</span></div>
    {mentees.length?mentees.map(mentee=>{
     const status=statuses.find(item=>String(item._id)===getStatusId(mentee));
     return(
      <div className="mentor-roster-row" key={mentee._id}>
       <Link to={`/mentees?filter=${mentee.isFlagged?"flagged":status?.code||"all"}&focus=${mentee._id}&action=view`} state={{fromDashboard:true}}>
        {getMenteeName(mentee)}
       </Link>
       <span className={`app-status-badge status-${String(status?.code||"unknown").toLowerCase()}`}>
        {status?.name||"No status"}
       </span>
       <span>{mentee.businessName||"—"}</span>
      </div>
     );
    }):<div className="mentor-roster-empty">No mentees match the selected statuses.</div>}
   </section>
  </>
 );
}

export default DashboardMenteeRoster;
