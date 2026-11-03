import {Link} from "react-router-dom";

function DashboardList({
 items=[],
 emptyText="No planner records found.",
 icon,
 getTitle=item=>item.title||item.name||"Untitled",
 metaBuilder=()=>"",
 getLink
}){
 return(
  <ul className="dashboard-list">
   {items?.length?items.map(item=>{
    const content=(
     <>
      <span className="dashboard-list-icon">{icon}</span>
      <div className="dashboard-list-content">
       <span className="dashboard-item-title">{getTitle(item)}</span>
       <span className="dashboard-item-meta">{metaBuilder(item)}</span>
      </div>
     </>
    );
    const linkTo=getLink?getLink(item):"";

    return(
     <li key={item._id||item.slug||getTitle(item)} className="dashboard-list-item">
      {linkTo?<Link to={linkTo} className="dashboard-list-link">{content}</Link>:content}
     </li>
    );
   }):(
    <li className="dashboard-empty">{emptyText}</li>
   )}
  </ul>
 );
}

export default DashboardList;
