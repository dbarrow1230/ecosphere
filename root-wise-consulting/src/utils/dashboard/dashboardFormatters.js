// src/utils/dashboard/dashboardFormatters.js
export const buildCategoryChartData=(rows,type)=>{
 const totals=rows
  .filter(row=>row.type===type)
  .reduce((map,row)=>{
   const category=row.category||"Uncategorized";
   map.set(category,(map.get(category)||0)+Number(row.cost||0));
   return map;
  },new Map());

 return [...totals.entries()]
  .map(([label,value])=>({label,value}))
  .sort((left,right)=>right.value-left.value);
};