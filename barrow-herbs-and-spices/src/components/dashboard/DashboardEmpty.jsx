import {createElement} from "react";

function DashboardEmpty({message="No dashboard data available.",as="div",className=""}){
 return createElement(as,{className:`dashboard-empty ${className}`.trim()},message);
}

export default DashboardEmpty;
