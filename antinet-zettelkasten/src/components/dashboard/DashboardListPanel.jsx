import DashboardEmpty from "./DashboardEmpty";
import DashboardSection from "./DashboardSection";
import {Link} from "react-router-dom";

function DashboardListPanel({
 className="",
 kicker="",
 title="",
 linkTo="",
 linkLabel="",
 loading=false,
 loadingMessage="Loading...",
 emptyMessage="No items found.",
 items=[],
 icon,
 iconClassName="",
 getKey=item=>item._id||item.id||item.slug||item.title||item.name,
 getTitle=item=>item.title||item.name||"Untitled",
 getMeta=()=>"",
 getLink=null,
}){
 return(
  <DashboardSection className={className} kicker={kicker} title={title} linkTo={linkTo} linkLabel={linkLabel}>
   <ul className="dashboard-list">
    {!loading&&items.length?items.map(item=>(
     <li key={getKey(item)} className="dashboard-list-item">
      {getLink?.(item)?(
       <Link to={getLink(item)} className="dashboard-list-row-link">
        <span className={`dashboard-list-icon ${iconClassName}`.trim()}>{icon}</span>

        <span className="dashboard-list-content">
         <span className="dashboard-item-title">{getTitle(item)}</span>
         <span className="dashboard-item-meta">{getMeta(item)}</span>
        </span>
       </Link>
      ):(
       <>
        <span className={`dashboard-list-icon ${iconClassName}`.trim()}>{icon}</span>

        <div className="dashboard-list-content">
         <span className="dashboard-item-title">{getTitle(item)}</span>
         <span className="dashboard-item-meta">{getMeta(item)}</span>
        </div>
       </>
      )}
     </li>
    )):(
     <DashboardEmpty as="li" message={loading?loadingMessage:emptyMessage}/>
    )}
   </ul>
  </DashboardSection>
 );
}

export default DashboardListPanel;
