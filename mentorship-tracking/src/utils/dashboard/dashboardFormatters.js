// src/utils/dashboard/dashboardFormatters.js
const normalizeType=value=>String(value||"").trim().toLowerCase();

const formatTypeLabel=value=>{
 const clean=String(value||"").replace(/[-_]+/g," ").trim();
 if(!clean) return "Other";
 return clean.replace(/\b\w/g,char=>char.toUpperCase());
};

const getDynamicFillClass=type=>{
 const normalized=normalizeType(type);
 if(normalized==="pantry") return "dashboard-bar-fill-pantry";
 if(normalized==="household") return "dashboard-bar-fill-household";
 if(normalized==="grocery") return "dashboard-bar-fill-grocery";
 if(normalized==="personal") return "dashboard-bar-fill-personal";
 if(normalized==="clothing") return "dashboard-bar-fill-clothing";
 if(normalized==="furniture") return "dashboard-bar-fill-furniture";
 if(normalized==="other") return "dashboard-bar-fill-other";
 return "dashboard-bar-fill-dynamic";
};

export const buildCategoryChartData=(categoryCosts=[],type="")=>{
 const totals={};

 categoryCosts
  .filter(item=>normalizeType(item?.type)===normalizeType(type))
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

export const buildDynamicCategoryChartGroups=(categoryCosts=[],baseTypes=[])=>{
 const excluded=new Set(baseTypes.map(type=>normalizeType(type)));
 const discoveredTypes=[...new Set(
  categoryCosts
   .map(item=>normalizeType(item?.type))
   .filter(Boolean)
   .filter(type=>!excluded.has(type))
 )].sort((a,b)=>a.localeCompare(b));

 return discoveredTypes.map(type=>({
  type,
  label:formatTypeLabel(type),
  title:`${formatTypeLabel(type)} Categories`,
  data:buildCategoryChartData(categoryCosts,type),
  fillClass:getDynamicFillClass(type)
 }));
};

export const formatCurrency=(value=0)=>{
 return `$${Number(value||0).toFixed(2)}`;
};