import {useEffect,useMemo,useState} from "react";
import {Container,Spinner} from "react-bootstrap";
import {Radio} from "lucide-react";
import DashboardEmpty from "../components/dashboard/DashboardEmpty.jsx";
import DashboardError from "../components/dashboard/DashboardError.jsx";
import DashboardHeader from "../components/dashboard/DashboardHeader.jsx";
import DashboardList from "../components/dashboard/DashboardList.jsx";
import DashboardQuickActions from "../components/dashboard/DashboardQuickActions.jsx";
import DashboardSection from "../components/dashboard/DashboardSection.jsx";
import DashboardStats from "../components/dashboard/DashboardStats.jsx";
import "../styles/Dashboard.css";

const getToken=()=>localStorage.getItem("token")||sessionStorage.getItem("token")||"";
const locationName=value=>typeof value==="object"&&value?value.name||value.abbreviation||"":"";

export default function HamRadioDashboard({user}){
 const [qsos,setQsos]=useState([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");

 useEffect(()=>{
  let ignore=false;
  fetch("/api/qsos",{headers:{Authorization:`Bearer ${getToken()}`}})
   .then(async response=>{const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.message||"Failed to load QSO dashboard");if(!ignore)setQsos(Array.isArray(data)?data:[]);})
   .catch(loadError=>{if(!ignore)setError(loadError.message);})
   .finally(()=>{if(!ignore)setLoading(false);});
  return()=>{ignore=true;};
 },[]);

 const stats=useMemo(()=>[
  {key:"qsos",label:"Total QSOs",value:qsos.length,to:"/logbook"},
  {key:"callSigns",label:"Unique Call Signs",value:new Set(qsos.map(qso=>qso.callSign).filter(Boolean)).size},
  {key:"bands",label:"Bands Worked",value:new Set(qsos.map(qso=>qso.band).filter(Boolean)).size},
  {key:"confirmed",label:"QSL Confirmed",value:qsos.filter(qso=>qso.qslStatus==="confirmed").length}
 ],[qsos]);

 const recentContacts=useMemo(()=>qsos.slice(0,8).map(qso=>({
  ...qso,
  title:qso.callSign,
  dashboardMeta:[new Date(qso.contactDate).toLocaleString(),qso.band,qso.mode,qso.qth||locationName(qso.stateRef)||locationName(qso.countryRef)].filter(Boolean).join(" · ")
 })),[qsos]);

 if(loading)return <div className="dashboard-loading"><Spinner animation="border"/><div className="dashboard-text mt-2">Loading dashboard...</div></div>;

 return(
  <Container fluid="lg" className="dashboard">
   <DashboardHeader operatorCallSign={user?.details?.hamRadioCallSign||qsos[0]?.operatorCallSign||""}/>
   {error?<DashboardError message={error}/>:null}
   <DashboardStats stats={stats}/>
   <div className="dashboard-grid">
    <main className="dashboard-main">
     <DashboardSection kicker="Station Log" title="Recent Contacts" linkTo="/logbook" linkText="Open logbook" wide>
      {recentContacts.length?<DashboardList items={recentContacts} icon={<Radio size={17}/>} metaBuilder={item=>item.dashboardMeta}/>:<DashboardEmpty message="No QSO data yet. Log the first radio contact from the station shortcuts."/>}
     </DashboardSection>
    </main>
    <DashboardQuickActions/>
   </div>
  </Container>
 );
}
