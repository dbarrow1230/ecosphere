import {Link} from "react-router-dom";
import {FaArrowRight} from "react-icons/fa";

function ApothecaryDashboardSection({
 id,
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
  <section id={id} className={className}>
   <div className="dashboard-section-head">
    <div>
     {kicker&&<p className="dashboard-section-kicker">{kicker}</p>}
     <h2 className="dashboard-section-title">{title}</h2>
    </div>

    {linkTo&&(
     <Link to={linkTo} className="dashboard-section-link">
      <span>{linkText}</span>
      <FaArrowRight size={16}/>
     </Link>
    )}
   </div>

   {children}
  </section>
 );
}

export default ApothecaryDashboardSection;
