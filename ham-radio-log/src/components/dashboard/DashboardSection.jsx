// src/components/dashboard/DashboardSection.jsx
import {Link} from "react-router-dom";
import {ArrowRight} from "lucide-react";

function DashboardSection({
 kicker,
 title,
 linkTo,
 linkText="View details",
 wide=false,
 priority=false,
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

    {linkTo&&(
     <Link to={linkTo} className="dashboard-section-link">
      <span>{linkText}</span>
      <ArrowRight size={16} strokeWidth={2.1}/>
     </Link>
    )}
   </div>

   {children}
  </section>
 );
}

export default DashboardSection;
