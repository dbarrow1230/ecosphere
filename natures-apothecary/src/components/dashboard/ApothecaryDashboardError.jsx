import {createElement} from "react";

function ApothecaryDashboardError({message="Unable to load this apothecary dashboard section right now.",as="div",className=""}){
 return createElement(as,{className:`dashboard-empty ${className}`.trim()},message);
}

export default ApothecaryDashboardError;
