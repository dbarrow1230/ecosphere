// src/components/dashboard/DashboardList.jsx

function DashboardList({
 items=[],
 emptyText="No travel log records found.",
 icon,
 metaBuilder,
 getStatus,
 getGroupName
}){

 return(
  <ul className="dashboard-list">
   {items?.length?items.map(item=>(
    <li key={item._id||item.id||item.name||item.title} className="dashboard-list-item">
     <span className="dashboard-list-icon">{icon}</span>

     <div className="dashboard-list-content">
      <span className="dashboard-item-title">{item.title||item.name||item.question||"Untitled Travel Item"}</span>
      <span className="dashboard-item-meta">{metaBuilder?metaBuilder(item):`${getStatus(item)} · ${getGroupName(item)}`}</span>
     </div>
    </li>
   )):(
    <li className="dashboard-empty">{emptyText}</li>
   )}
  </ul>
 );
}

export default DashboardList;