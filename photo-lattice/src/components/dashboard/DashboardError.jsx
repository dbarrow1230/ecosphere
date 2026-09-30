// src/components/dashboard/DashboardError.jsx
function DashboardError({message="Unable to load this dashboard section right now.",as:Tag="div",className=""}){
 const Component=Tag;

 return(
  <Component className={`dashboard-empty ${className}`.trim()}>
   {message}
  </Component>
 );
}

export default DashboardError;
