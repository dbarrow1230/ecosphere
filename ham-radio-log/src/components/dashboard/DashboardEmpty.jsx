// src/components/dashboard/DashboardEmpty.jsx
function DashboardEmpty({message="No data available.",as="div",className=""}){
 const Component=as;

 return(
  <Component className={`dashboard-empty ${className}`.trim()}>
   {message}
  </Component>
 );
}

export default DashboardEmpty;
