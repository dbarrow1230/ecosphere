import {ArrowUpRight,Boxes} from "lucide-react";

function AppCard({title,description,logo,onClick}){
  return (
   <button type="button" className="app-card" onClick={onClick} aria-label={`Open ${title}`}>
    <span className={`app-card-icon${logo?" has-logo":""}`} aria-hidden="true">
     {logo?<img src={logo} alt=""/>:<Boxes size={25}/>}
    </span>

    <span className="app-card-body">
     <span className="app-card-title">{title}</span>
     <span className="app-card-description">{description||"Open inside Eco Sphere"}</span>
    </span>

    <ArrowUpRight className="app-card-arrow" size={20} aria-hidden="true"/>
   </button>
  );
}

export default AppCard;
