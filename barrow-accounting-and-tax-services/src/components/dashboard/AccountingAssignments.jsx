import DashboardSection from "./DashboardSection.jsx";
import DashboardEmpty from "./DashboardEmpty.jsx";

export default function AccountingAssignments({assignments}){
 return <DashboardSection title="Client assignments" kicker="OWNER OVERVIEW" linkTo="/clients" linkText="Assign clients">
  {assignments.length?<div className="accounting-table-wrap"><table className="accounting-table"><thead><tr><th scope="col">Assigned to</th><th scope="col">Clients</th><th scope="col">Open work</th></tr></thead><tbody>{assignments.map(item=><tr key={item.id}><th scope="row">{item.name}</th><td>{item.clients}</td><td>{item.openWork}</td></tr>)}</tbody></table></div>:<DashboardEmpty message="Assignments will appear when clients are added."/>}
 </DashboardSection>;
}
