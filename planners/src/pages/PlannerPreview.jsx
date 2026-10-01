import {useParams} from "react-router-dom";
import WorkflowPlaceholder from "@shared/components/WorkflowPlaceholder.jsx";

export default function PlannerPreview(){
 const {category,template}=useParams();
 const title=value=>String(value||"").split("-").map(word=>word.charAt(0).toUpperCase()+word.slice(1)).join(" ");
 return <WorkflowPlaceholder title={`${title(category)} / ${title(template)}`}/>;
}
