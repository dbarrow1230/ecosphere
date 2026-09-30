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

export const getAvailableYears=(categoryCosts=[])=>{
 return [...new Set(
  categoryCosts
   .map((item)=>item?.date?new Date(item.date).getFullYear():null)
   .filter(Boolean)
 )].sort((a,b)=>b-a);
};

export const filterCategoryCosts=(categoryCosts=[],yearFilter="all",monthFilter="all")=>{
 return categoryCosts.filter((item)=>{
  if(!item?.date) return false;
  const itemDate=new Date(item.date);
  const itemYear=String(itemDate.getFullYear());
  const itemMonth=String(itemDate.getMonth());
  const matchYear=yearFilter==="all"||itemYear===yearFilter;
  const matchMonth=monthFilter==="all"||itemMonth===monthFilter;
  return matchYear&&matchMonth;
 });
};