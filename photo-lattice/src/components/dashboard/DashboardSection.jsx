// src/components/dashboard/DashboardSection.jsx
import {Link} from "react-router-dom";
import {ArrowRight} from "lucide-react";

function DashboardSection({className="",kicker="",title="",linkTo="",linkLabel="",children}){

 return(
  <section className={`dashboard-section ${className}`.trim()}>
   <div className="dashboard-section-head">
    <div>
     {kicker?<p className="dashboard-section-kicker">{kicker}</p>:null}
     {title?<h2 className="dashboard-section-title">{title}</h2>:null}
    </div>

    {linkTo&&linkLabel?(
     <Link to={linkTo} className="dashboard-section-link">
      {linkLabel}
      <ArrowRight size={16} strokeWidth={2.1}/>
     </Link>
    ):null}
   </div>

   {children}
  </section>
 );
}

export default DashboardSection;