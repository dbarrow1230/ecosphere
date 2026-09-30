// src/components/dashboard/DashboardEmpty.jsx
import React from "react";

function DashboardEmpty({message="No data available.",as="div",className=""}){
 return React.createElement(as,{className:`dashboard-empty ${className}`.trim()},message);
}

export default DashboardEmpty;
