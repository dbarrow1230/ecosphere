import {Users,ClipboardList,Clock,TriangleAlert,RefreshCw} from "lucide-react";
import DashboardHeader from "../components/dashboard/DashboardHeader.jsx";
import DashboardStats from "../components/dashboard/DashboardStats.jsx";
import DashboardError from "../components/dashboard/DashboardError.jsx";
import DashboardQuickActions from "../components/dashboard/DashboardQuickActions.jsx";
import AccountingWorkQueue from "../components/dashboard/AccountingWorkQueue.jsx";
import AccountingClientPortfolio from "../components/dashboard/AccountingClientPortfolio.jsx";
import AccountingAssignments from "../components/dashboard/AccountingAssignments.jsx";
import AccountingInquiries from "../components/dashboard/AccountingInquiries.jsx";
import useAccountingDashboard from "../components/dashboard/useAccountingDashboard.js";
import "../styles/Dashboard.css";
import "../styles/AccountingDashboard.css";

export default function Dashboard(){
 const {data,loading,error,refresh,save}=useAccountingDashboard();
 const owner=data?.canManageAllClients,summary=data?.summary;
 const stats=summary?[
  {label:owner?"Client portfolio":"My clients",value:summary.totalClients,icon:<Users/>,detail:[{label:"Active",value:summary.activeClients},...(owner?[{label:"Unassigned",value:summary.unassignedClients}]:[])]},
  {label:"Open client work",value:summary.openWork,icon:<ClipboardList/>,detail:`${summary.waitingOnClient} waiting on client`},
  {label:"Due in the next 7 days",value:summary.dueSoon,icon:<Clock/>,detail:"Open work with a recorded due date"},
  {label:"Overdue",value:summary.overdue,icon:<TriangleAlert/>,detail:"Open work past its recorded due date"}
 ]:[];
 return <div className="dashboard accounting-dashboard">
  <DashboardHeader title="Accounting practice dashboard" text="Client relationships, accounting work, tax deadlines, and the next follow-up." panelLabel={data?(owner?"Owner view":"My work"):"Client services"} panelTitle={data?(owner?"The whole practice, in view.":"Your clients. Your next steps."):"Accounting, bookkeeping & tax"} panelText={data?(owner?"All clients, staff assignments, service work, and new website inquiries.":"Client records and work shown here are assigned to you."):"Loading your authorized client work."}/>
  <div className="accounting-dashboard-toolbar"><p>{loading?"Updating dashboard…":"Based on saved client and work records"}</p><button className="btn btn-outline-primary" type="button" disabled={loading} onClick={refresh}><RefreshCw size={16}/> Refresh</button></div>
  {data&&<DashboardQuickActions/>}
  {error&&<div role="alert"><DashboardError message={error}/></div>}
  {!data&&loading&&<p role="status">Loading clients, assignments, and service work…</p>}
  {data&&<><DashboardStats stats={stats}/><AccountingWorkQueue work={data.work} clients={data.clients} services={data.services} statuses={data.statuses} save={save}/><div className="accounting-dashboard-columns"><AccountingClientPortfolio clients={data.clients} owner={owner}/>{owner&&<AccountingAssignments assignments={summary.assignments}/>}</div>{owner&&<AccountingInquiries inquiries={data.inquiries} save={save}/>}</>}
 </div>;
}
