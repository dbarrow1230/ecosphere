import {months} from "./dashboardFilters.js";

export const emptyDashboardData={
 stats:[],
 lowStockItems:[],
 expiringItems:[],
 recentItems:[],
 missingItems:[],
 categoryCosts:[],
 gardenTasks:[],
 recentJournalEntries:[],
 plantHealthItems:[],
 plantLifecycleItems:[],
 growingInstanceItems:[],
 harvestItems:[],
 environmentItems:[]
};

const dashboardDateKeys=[
 "date",
 "purchaseDate",
 "dueDate",
 "taskDate",
 "entryDate",
 "harvestDate",
 "plantedDate",
 "dateObserved",
 "observedAt",
 "reportingDate"
];

const getRows=value=>Array.isArray(value)?value:[];

export const normalizeDashboardData=value=>({
 stats:getRows(value?.stats),
 lowStockItems:getRows(value?.lowStockItems),
 expiringItems:getRows(value?.expiringItems),
 recentItems:getRows(value?.recentItems),
 missingItems:getRows(value?.missingItems),
 categoryCosts:getRows(value?.categoryCosts),
 gardenTasks:getRows(value?.gardenTasks),
 recentJournalEntries:getRows(value?.recentJournalEntries),
 plantHealthItems:getRows(value?.plantHealthItems),
 plantLifecycleItems:getRows(value?.plantLifecycleItems),
 growingInstanceItems:getRows(value?.growingInstanceItems),
 harvestItems:getRows(value?.harvestItems),
 environmentItems:getRows(value?.environmentItems)
});

export const getObjectId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;

 if(typeof value==="object"){
  if(typeof value.$oid==="string")return value.$oid;
  if(typeof value._id==="string")return value._id;
  if(typeof value.id==="string")return value.id;
  if(typeof value._id?.$oid==="string")return value._id.$oid;
  if(typeof value.id?.$oid==="string")return value.id.$oid;
 }

 return "";
};

const getDashboardDateValues=item=>{
 if(!item||typeof item!=="object")return [];

 const primaryDate=item.reportingDate||
  item.date||
  item.observedAt||
  item.plantedDate||
  item.harvestDate||
  item.entryDate||
  item.dueDate||
  item.taskDate||
  item.purchaseDate||
  item.dateObserved;

 if(primaryDate)return [primaryDate];

 return dashboardDateKeys.map(key=>item[key]).filter(Boolean);
};

const matchesDashboardPeriod=(item,yearFilter,monthFilter)=>{
 if(yearFilter==="all"&&monthFilter==="all")return true;

 return getDashboardDateValues(item).some(value=>{
  const date=new Date(value);
  if(Number.isNaN(date.getTime()))return false;

  const matchesYear=yearFilter==="all"||String(date.getFullYear())===yearFilter;
  const matchesMonth=monthFilter==="all"||String(date.getMonth())===monthFilter;

  return matchesYear&&matchesMonth;
 });
};

export const filterDashboardRows=(items,yearFilter,monthFilter)=>{
 return items.filter(item=>matchesDashboardPeriod(item,yearFilter,monthFilter));
};

export const collectDashboardYears=(...collections)=>{
 const years=new Set();

 collections.flat().forEach(item=>{
  getDashboardDateValues(item).forEach(value=>{
   const date=new Date(value);
   if(!Number.isNaN(date.getTime()))years.add(date.getFullYear());
  });
 });

 return [...years].sort((a,b)=>b-a);
};

export const buildChartData=(items,type)=>{
 const totals={};

 items
  .filter(item=>item?.type===type)
  .forEach(item=>{
   const key=item.category||"Uncategorized";
   totals[key]=(totals[key]||0)+Number(item.cost||0);
  });

 const rows=Object.entries(totals)
  .map(([category,cost])=>({category,cost}))
  .sort((a,b)=>b.cost-a.cost);

 const max=rows.length?rows[0].cost:0;

 return rows.map(row=>({
  ...row,
  width:max?`${(row.cost/max)*100}%`:"0%"
 }));
};

export const buildFilteredStats=(stats,{gardenTasks,harvestItems,plantHealthItems,plantLifecycleItems,growingInstanceItems})=>{
 return stats.map(item=>{
  if(item.label==="Open Tasks"){
   return {
    ...item,
    value:gardenTasks.length,
    breakdown:[{label:"Filtered tasks",value:gardenTasks.length,variant:gardenTasks.length?"warning":"success"}]
   };
  }

  if(item.label==="Harvests This Month"){
   return {
    ...item,
    label:"Harvests",
    value:harvestItems.length,
    breakdown:[{label:"Filtered harvests",value:harvestItems.length,variant:"success"}]
   };
  }

  if(item.label==="Issues"){
   return {
    ...item,
    value:plantHealthItems.length,
    breakdown:[{label:"Filtered open issues",value:plantHealthItems.length,variant:plantHealthItems.length?"danger":"success"}]
   };
  }

  if(item.label==="Plant Deaths"){
   return {
    ...item,
    value:plantLifecycleItems.length,
    breakdown:[{label:"Filtered deaths",value:plantLifecycleItems.length,variant:plantLifecycleItems.length?"danger":"success"}]
   };
  }

  if(item.label==="Plant Records"){
   return {
    ...item,
    value:growingInstanceItems.length,
    breakdown:[{label:"Filtered instances",value:growingInstanceItems.length,variant:"success"}]
   };
  }

  return item;
 });
};

export const getDashboardPeriodSummary=(yearFilter,monthFilter)=>{
 if(yearFilter==="all"){
  return {
   title:"Viewing all years",
   detail:"Showing every dashboard record across all available years.",
   badge:"All years"
  };
 }

 if(monthFilter==="all"){
  return {
   title:`Viewing ${yearFilter}`,
   detail:`Showing dashboard records dated anywhere in ${yearFilter}.`,
   badge:yearFilter
  };
 }

 const monthLabel=months.find(month=>month.value===monthFilter)?.label||"All months";

 return {
  title:`Viewing ${monthLabel} ${yearFilter}`,
  detail:`Showing dashboard records dated in ${monthLabel} ${yearFilter}.`,
  badge:`${monthLabel} ${yearFilter}`
 };
};
