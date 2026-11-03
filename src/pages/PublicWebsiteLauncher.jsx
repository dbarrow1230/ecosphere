import {sessionToken} from "../../shared/public/websiteAccess.js";
import {useCallback,useEffect,useState} from "react";
import {Link,useParams} from "react-router-dom";
import apps from "../data/apps.js";
import runtime from "../../app-runtime-config.json";
import "../styles/ApplicationWorkspace.css";
export default function PublicWebsiteLauncher(){
 const {appId}=useParams();const app=apps.find(item=>item.id===appId);
 const [error,setError]=useState("");
 const activate=useCallback(async()=>{
  setError("");
  if(!Object.hasOwn(runtime.publicApplications||{},appId)){setError("No public website is configured for this application.");return;}
  try{
   const expected=`http://${runtime.host}:${runtime.publicApplications[appId]}`;
   // A separately started public preview can be opened before the shell
   // backend has restarted to load the new activation endpoint.
   try{
    await fetch(expected,{mode:"no-cors",signal:AbortSignal.timeout(1500)});
    window.location.replace(expected);
    return;
   }catch{/* Start it through the shell when no preview is listening. */}
   const response=await fetch(`/api/app-runtime/activate-public/${encodeURIComponent(appId)}`,{method:"POST",headers:{Authorization:`Bearer ${sessionToken()}`}});
   const data=await response.json().catch(()=>({}));
   if(!response.ok)throw Error(response.status===404?"Restart the EcoSphere backend to load the public website launcher.":[data.message,data.error].filter(Boolean).join(" ")||"Unable to start the website.");
   if(new URL(data.url).origin!==expected)throw Error("The website returned an unexpected address.");
   window.location.replace(expected);
  }catch(problem){setError(problem.message);}
 },[appId]);
 useEffect(()=>{const timer=setTimeout(activate,0);return()=>clearTimeout(timer);},[activate]);
 return <section className="application-workspace"><div className="application-workspace-status" role={error?"alert":"status"}><h1>{error?"Unable to open website":`Opening ${app?.title||"public website"}`}</h1><p>{error||"Starting the public website and its business settings connection."}</p>{error&&<button type="button" className="btn btn-primary" onClick={activate}>Try again</button>}<Link to="/public-websites">All public websites</Link></div></section>;
}
