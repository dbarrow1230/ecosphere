// src/components/dashboard/DashboardError.jsx
function DashboardError({message="Unable to load this dashboard section right now.",as="div",className=""}){
 const Component=as;

 return(
  <Component className={`dashboard-empty ${className}`.trim()}>
   {message}
  </Component>
 );
}

export default DashboardError;
