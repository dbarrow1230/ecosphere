// src/components/dashboard/DashboardSection.jsx
import {Link} from "react-router-dom";
import {ArrowRight,AlertCircle,Loader2} from "lucide-react";

function DashboardSection({
 kicker,
 title,
 linkTo,
 linkText="View details",
 wide=false,
 priority=false,
 loading=false,
 loadingText="Loading...",
 error="",
 headerAside=null,
 children
}){

 const className=[
  "dashboard-section",
  wide?"dashboard-section-wide":"",
  priority?"dashboard-section-priority":""
 ].filter(Boolean).join(" ");

 return(
  <section className={className}>
   <div className="dashboard-section-head">
    <div>
     {kicker&&<p className="dashboard-section-kicker">{kicker}</p>}
     <h2 className="dashboard-section-title">{title}</h2>
    </div>

    {(headerAside||linkTo)&&(
     <div className="dashboard-section-actions">
      {headerAside}
      {linkTo&&(
       <Link to={linkTo} className="dashboard-section-link">
        <span>{linkText}</span>
        <ArrowRight size={16} strokeWidth={2.1}/>
       </Link>
      )}
     </div>
    )}
   </div>

   {(loading||error)&&(
    <div className={error?"dashboard-inline-state dashboard-inline-error":"dashboard-inline-state"}>
     {error?<AlertCircle size={17} strokeWidth={2.2}/>:<Loader2 size={17} strokeWidth={2.2}/>}
     <span>{error||loadingText}</span>
    </div>
   )}

   {children}
  </section>
 );
}

export default DashboardSection;