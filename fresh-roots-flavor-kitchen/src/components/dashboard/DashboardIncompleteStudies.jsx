import {useCallback,useEffect,useMemo,useState} from "react";
import {Link} from "react-router-dom";
import {AlertCircle,BookOpen,Loader2} from "lucide-react";
import DashboardSection from "./DashboardSection.jsx";

const getName=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 return value.title||value.name||value.label||"";
};

const isComplete=study=>{
 const status=getName(study.status).toLowerCase();
 return Boolean(study.completedAt)||Number(study.progressPercent||0)>=100||["complete","completed","done"].includes(status);
};

const getStatusLabel=study=>{
 const status=getName(study.status);
 if(status)return status;
 if(study.active===false)return "Inactive";
 return "Active";
};

const getReference=study=>{
 if(study.reference)return study.reference;
 if(!study.book)return "No reference";
 const chapter=study.chapterStart||study.chapter;
 if(!chapter)return study.book;
 return `${study.book} ${chapter}${study.verseStart?`:${study.verseStart}`:""}`;
};

function DashboardIncompleteStudies({userId="",dashboardLink=path=>path}){
 const [studies,setStudies]=useState([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [statusFilter,setStatusFilter]=useState("");

 const loadStudies=useCallback(async()=>{
  setLoading(true);
  setError("");

  try{
   const query=new URLSearchParams();
   if(userId)query.set("user",userId);
   const res=await fetch(`/api/studies${query.toString()?`?${query.toString()}`:""}`);
   const data=await res.json().catch(()=>({}));
   if(!res.ok)throw new Error(data.message||"Failed to load incomplete studies");
   setStudies(Array.isArray(data.data)?data.data:[]);
  }catch(err){
   setError(err.message||"Failed to load incomplete studies");
  }finally{
   setLoading(false);
  }
 },[userId]);

 useEffect(()=>{
  const timeoutId=window.setTimeout(loadStudies,0);
  return()=>window.clearTimeout(timeoutId);
 },[loadStudies]);

 const incompleteStudies=useMemo(()=>studies.filter(study=>!isComplete(study)),[studies]);
 const statusOptions=useMemo(()=>[...new Set(incompleteStudies.map(getStatusLabel).filter(Boolean))].sort(),[incompleteStudies]);
 const visibleStudies=useMemo(()=>{
  const next=statusFilter?incompleteStudies.filter(study=>getStatusLabel(study)===statusFilter):incompleteStudies;
  return next.slice().sort((left,right)=>{
   const leftUpdated=new Date(left.updatedAt||left.createdAt||0).getTime();
   const rightUpdated=new Date(right.updatedAt||right.createdAt||0).getTime();
   return rightUpdated-leftUpdated;
  });
 },[incompleteStudies,statusFilter]);

 return(
  <DashboardSection kicker="Needs Attention" title="Incomplete Studies" linkTo={dashboardLink("/forms/studies/study")} linkText="Open studies" className="dashboard-scroll-section">
   <div className="dashboard-inline-filter">
    <label htmlFor="dashboard-incomplete-status">Status</label>
    <select id="dashboard-incomplete-status" value={statusFilter} onChange={event=>setStatusFilter(event.target.value)}>
     <option value="">All statuses</option>
     {statusOptions.map(status=><option key={status} value={status}>{status}</option>)}
    </select>
    <button type="button" onClick={()=>setStatusFilter("")} disabled={!statusFilter}>Reset</button>
   </div>

   {loading?(
    <div className="dashboard-inline-state"><Loader2 size={17}/><span>Loading incomplete studies...</span></div>
   ):error?(
    <div className="dashboard-inline-state dashboard-inline-error"><AlertCircle size={17}/><span>{error}</span></div>
   ):(
    <ul className="dashboard-list dashboard-scroll-list">
     {visibleStudies.length?visibleStudies.map(study=>(
      <li key={study._id} className="dashboard-list-item">
       <Link to={dashboardLink(`/forms/studies/study/${study._id}`)} className="dashboard-list-link">
        <span className="dashboard-list-icon"><BookOpen size={17} strokeWidth={2.2}/></span>
        <div className="dashboard-list-content">
         <span className="dashboard-item-title">{study.title||"Untitled study"}</span>
         <span className="dashboard-item-meta">{getStatusLabel(study)} · {study.progressPercent??0}% · {getReference(study)}</span>
        </div>
       </Link>
      </li>
     )):<li className="dashboard-empty">No incomplete studies found.</li>}
    </ul>
   )}
  </DashboardSection>
 );
}

export default DashboardIncompleteStudies;