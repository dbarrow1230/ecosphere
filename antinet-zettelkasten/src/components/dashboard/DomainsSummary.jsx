import DashboardEmpty from "./DashboardEmpty.jsx";
import DashboardSection from "./DashboardSection.jsx";

function DomainsSummary({domains=[],counts={},loading=false}){
 return(
  <DashboardSection className="dashboard-domains-summary" kicker="Knowledge Areas" title="Domains">
   {loading?(
    <DashboardEmpty message="Loading domains..."/>
   ):domains.length?(
    <div className="dashboard-type-badges">
     {[...domains].sort((left,right)=>String(left.name||left.code).localeCompare(String(right.name||right.code))).map(domain=>(
      <span className="dashboard-type-badge" key={domain._id||domain.code}>
       <span>{domain.name||domain.code}</span>
       <strong>{counts[String(domain._id||domain.id)]||0}</strong>
      </span>
     ))}
    </div>
   ):(
    <DashboardEmpty message="No domains have been configured."/>
   )}
  </DashboardSection>
 );
}

export default DomainsSummary;
