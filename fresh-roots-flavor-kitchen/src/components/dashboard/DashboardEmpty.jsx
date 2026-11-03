// src/components/dashboard/DashboardEmpty.jsx
function DashboardEmpty({message="No data available.",as:Tag="div",className=""}){

 return(
  <Tag className={`dashboard-empty ${className}`.trim()}>
   {message}
  </Tag>
 );
}

export default DashboardEmpty;