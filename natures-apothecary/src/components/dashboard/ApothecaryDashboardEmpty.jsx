import {createElement} from "react";

function ApothecaryDashboardEmpty({message="No apothecary data available.",as="div",className=""}){
 return createElement(as,{className:`dashboard-empty ${className}`.trim()},message);
}

export default ApothecaryDashboardEmpty;
