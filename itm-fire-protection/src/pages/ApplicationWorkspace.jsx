import {useCallback,useEffect,useMemo,useState} from "react";
import {Link,useLocation,useParams} from "react-router-dom";
import {ArrowLeft} from "lucide-react";
import apps from "../../../src/data/apps.js";
import "../styles/ApplicationWorkspace.css";

function ApplicationWorkspace(){
 const {appId}=useParams();
 const location=useLocation();
 const app=useMemo(()=>apps.find(item=>item.id===appId),[appId]);
 const appPath=useMemo(()=>new URLSearchParams(location.search).get("appPath")||"",[location.search]);
 const [runtime,setRuntime]=useState({status:"loading",url:"",message:""});

 const sendAuthentication=event=>{
  if(!runtime.url)return;

  const storageKeys=["token","user","userInfo","authUser","currentUser"];
  const readStorage=storage=>storageKeys.reduce((values,key)=>{
   const value=storage.getItem(key);
   if(value!==null)values[key]=value;
   return values;
  },{});
  const targetOrigin=new URL(runtime.url).origin;

  event.currentTarget.contentWindow?.postMessage({
   type:"ECOSPHERE_AUTH_SYNC",
   version:1,
   storage:{
    localStorage:readStorage(localStorage),
    sessionStorage:readStorage(sessionStorage)
   }
  },targetOrigin);
 };

 const activateApplication=useCallback(async()=>{
  if(!app)return;

  setRuntime({status:"loading",url:"",message:""});

  try{
   const response=await fetch(`/api/app-runtime/activate/${encodeURIComponent(app.id)}`,{method:"POST"});
   const data=await response.json().catch(()=>({}));

   if(!response.ok)throw new Error(data.message||data.error||"Unable to start the application.");

   const baseUrl=data.url||app.url;
   let applicationUrl=baseUrl;

   if(appPath.startsWith("/")){
    const requestedUrl=new URL(appPath,baseUrl);
    if(requestedUrl.origin===new URL(baseUrl).origin)applicationUrl=requestedUrl.href;
   }

   setRuntime({status:"ready",url:applicationUrl,message:""});
  }catch(error){
   setRuntime({status:"error",url:"",message:error.message});
  }
 },[app,appPath]);

 useEffect(()=>{
  activateApplication();
 },[activateApplication]);

 if(!app){
  return(
   <section className="application-workspace application-workspace-missing">
    <h1>Application not found</h1>
    <p>The requested application is not configured in Eco Sphere.</p>
    <Link className="btn btn-primary" to="/dashboard">Return to Applications</Link>
   </section>
  );
 }

 return(
  <section className="application-workspace">
   <header className="application-workspace-toolbar">
    <Link className="application-workspace-back" to="/dashboard">
     <ArrowLeft size={18} aria-hidden="true"/> Return to Applications
    </Link>
   </header>

   <div className="application-workspace-frame-wrap">
    {runtime.status==="loading"&&(
     <div className="application-workspace-status" role="status">
      <span className="application-workspace-spinner" aria-hidden="true"/>
      <h2>Starting {app.title}</h2>
      <p>Connecting the application to the shared local workspace.</p>
     </div>
    )}

    {runtime.status==="error"&&(
     <div className="application-workspace-status application-workspace-error" role="alert">
      <h2>Unable to start {app.title}</h2>
      <p>{runtime.message}</p>
      <button type="button" className="btn btn-primary" onClick={activateApplication}>Try again</button>
     </div>
    )}

    {runtime.status==="ready"&&(
     <iframe
      key={app.id}
      id="application-workspace-frame"
      className="application-workspace-frame"
      src={runtime.url}
      title={`${app.title} application`}
      onLoad={sendAuthentication}
     />
    )}
   </div>
  </section>
 );
}

export default ApplicationWorkspace;
