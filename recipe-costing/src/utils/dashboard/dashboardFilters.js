// src/utils/dashboard/dashboardFilters.js
export const months=[
 {value:"0",label:"January"},
 {value:"1",label:"February"},
 {value:"2",label:"March"},
 {value:"3",label:"April"},
 {value:"4",label:"May"},
 {value:"5",label:"June"},
 {value:"6",label:"July"},
 {value:"7",label:"August"},
 {value:"8",label:"September"},
 {value:"9",label:"October"},
 {value:"10",label:"November"},
 {value:"11",label:"December"}
];

export const getAvailableYears=rows=>{
 const years=rows
  .map(row=>row.date?new Date(row.date).getFullYear():null)
  .filter(Boolean);

 return [...new Set(years)].sort((left,right)=>right-left);
};

export const filterCategoryCosts=(rows,yearFilter,monthFilter)=>{
 return rows.filter(row=>{
  if(!row.date)return true;

  const date=new Date(row.date);
  const yearMatches=yearFilter==="all"||String(date.getFullYear())===String(yearFilter);
  const monthMatches=monthFilter==="all"||String(date.getMonth())===String(monthFilter);

  return yearMatches&&monthMatches;
 });
};