import {Users} from "lucide-react";
import DashboardSection from "./DashboardSection.jsx";
import DashboardList from "./DashboardList.jsx";

export default function AccountingClientPortfolio({clients,owner}){
 return <DashboardSection title={owner?"Client portfolio":"My clients"} kicker="CLIENT RELATIONSHIPS" linkTo="/clients" linkText="Manage clients">
  <DashboardList items={clients.slice(0,8)} icon={<Users size={18}/>} getTitle={item=>item.name} metaBuilder={item=>[item.company,item.status,owner?(item.assignedTo?.username||"Unassigned"):null].filter(Boolean).join(" · ")} getLink={()=>"/clients"} emptyText={owner?"No clients have been added yet.":"No clients are assigned to you yet."}/>
 </DashboardSection>;
}
