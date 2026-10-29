import {Globe} from "lucide-react";
import {canManagePublicWebsites,storedSession} from "./websiteAccess.js";
import runtime from "../../app-runtime-config.json";
export default function PublicWebsiteLink({appId,user}){
 if(!canManagePublicWebsites(user||storedSession()))return null;
 return <a className="nav-link app-nav-link public-website-admin-link" href={`http://${runtime.host}:${runtime.ecospherePort}/public-websites/${encodeURIComponent(appId)}`} target="_blank" rel="noopener noreferrer"><Globe size={16} aria-hidden="true"/> Public website</a>;
}
