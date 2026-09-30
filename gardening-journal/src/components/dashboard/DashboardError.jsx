// src/components/dashboard/DashboardError.jsx
import React from "react";

function DashboardError({message="Unable to load this dashboard section right now.",as="div",className=""}){
 return React.createElement(as,{className:`dashboard-empty ${className}`.trim()},message);
}

export default DashboardError;
