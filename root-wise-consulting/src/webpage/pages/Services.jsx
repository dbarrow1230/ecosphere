import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import {ArrowUpRight,Utensils,ChefHat,DoorOpen} from "lucide-react";
import {useRootWise} from "../RootWiseShell.jsx";
import {apiBase} from "../../../../shared/public/usePublicBusiness.js";
export default function Services(){
 const {content}=useRootWise();const [services,setServices]=useState([]),[error,setError]=useState("");
 useEffect(()=>{const controller=new AbortController();fetch(`${apiBase()}/api/public-site/services`,{signal:controller.signal}).then(async response=>{if(!response.ok)throw Error("Current service listings could not be loaded.");return response.json();}).then(setServices).catch(cause=>{if(cause.name!=="AbortError")setError(cause.message);});return()=>controller.abort();},[]);
 const icons=[Utensils,ChefHat,DoorOpen];
 return <section className="rw-page"><header><p className="rw-kicker">Consulting expertise</p><h1>Look at the details.<br/>See the connections.</h1><p className="rw-page-lead">Choose an area to explore the work it can involve.</p></header><div className="rw-service-ledger">{content.pages[0].sections.map((section,index)=>{const Icon=icons[index];return <details key={section.title} open={index===0}><summary><Icon size={28}/><h2>{section.title}</h2><span className="rw-expand" aria-hidden="true">+</span></summary><div className="rw-service-detail">{section.text.map(text=><p key={text}>{text}</p>)}<ul>{section.items.map(item=><li key={item}>{item}</li>)}</ul><Link className="rw-text-link" to={`/contact?topic=${encodeURIComponent(section.title)}`}>Talk through this work<ArrowUpRight size={18}/></Link></div></details>;})}</div>{error&&<p role="alert">{error}</p>}{services.length>0&&<section className="rw-saved-services"><h2>Current service listings</h2>{services.map(service=><article key={service._id}><h3>{service.name}</h3><p>{service.description}</p>{service.scope?.length>0&&<ul>{service.scope.map(item=><li key={item}>{item}</li>)}</ul>}{service.deliverables?.length>0&&<><h4>Deliverables</h4><ul>{service.deliverables.map(item=><li key={item}>{item}</li>)}</ul></>}</article>)}</section>}</section>;
}
