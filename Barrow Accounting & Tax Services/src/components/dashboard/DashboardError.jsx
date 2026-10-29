// src/components/dashboard/DashboardError.jsx
function DashboardError({message="Unable to load this dashboard section right now.",as:Tag="div",className=""}){

 return(
  <Tag className={`dashboard-empty ${className}`.trim()}>
   {message}
  </Tag>
 );
}

export default DashboardError;