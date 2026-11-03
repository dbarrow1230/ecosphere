// src/components/dashboard/DashboardEmpty.jsx
function DashboardEmpty({message="No data available.",as:Tag="div",className=""}){
 const Component=Tag;

 return(
  <Component className={`dashboard-empty ${className}`.trim()}>
   {message}
  </Component>
 );
}

export default DashboardEmpty;
