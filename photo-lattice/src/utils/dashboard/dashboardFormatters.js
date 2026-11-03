// src/utils/dashboard/dashboardFormatters.js
const normalizeType=value=>String(value||"").trim().toLowerCase();

const formatTypeLabel=value=>{
 const clean=String(value||"").replace(/[-_]+/g," ").trim();
 if(!clean) return "Other";
 return clean.replace(/\b\w/g,char=>char.toUpperCase());
};

const getDynamicFillClass=type=>{
 const normalized=normalizeType(type);
 if(["note","notes","note type","note-type"].includes(normalized))return "dashboard-bar-fill-primary";
 if(["notebook","notebooks","tag","tags","link","links","reference","references"].includes(normalized))return "dashboard-bar-fill-secondary";
 return "dashboard-bar-fill-primary";
};

export const buildKnowledgeChartData=(items=[],type="")=>{
 const totals={};

 items
  .filter(item=>normalizeType(item?.type)===normalizeType(type))
  .forEach(item=>{
   const key=item.category||"Uncategorized";
   totals[key]=(totals[key]||0)+Number(item.count||item.value||0);
  });

 const chartRows=Object.entries(totals)
  .map(([category,count])=>({category,count}))
  .sort((a,b)=>b.count-a.count);

 const max=chartRows.length?chartRows[0].count:0;

 return chartRows.map(row=>({
  ...row,
  width:max?`${(row.count/max)*100}%`:"0%"
 }));
};

export const buildDynamicKnowledgeChartGroups=(items=[],baseTypes=[])=>{
 const excluded=new Set(baseTypes.map(type=>normalizeType(type)));
 const discoveredTypes=[...new Set(
  items
   .map(item=>normalizeType(item?.type))
   .filter(Boolean)
   .filter(type=>!excluded.has(type))
 )].sort((a,b)=>a.localeCompare(b));

 return discoveredTypes.map(type=>({
  type,
  label:formatTypeLabel(type),
  title:formatTypeLabel(type),
  data:buildKnowledgeChartData(items,type),
  fillClass:getDynamicFillClass(type)
 }));
};

export const formatCount=(value=0)=>{
 return Number(value||0).toLocaleString();
};
