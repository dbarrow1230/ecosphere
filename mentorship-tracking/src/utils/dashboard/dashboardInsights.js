export const buildYearlySpendingData=(categoryCosts=[],yearFilter)=>{
 const year=Number(yearFilter);
 const labels=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
 const totals=new Array(12).fill(0);

 categoryCosts.forEach((item)=>{
  if(!item?.date) return;
  const date=new Date(item.date);
  if(date.getFullYear()!==year) return;
  totals[date.getMonth()]+=Number(item.cost||0);
 });

 return labels.map((label,index)=>({
  label,
  value:totals[index]
 }));
};

export const buildMonthlySpendingData=(categoryCosts=[],yearFilter,monthFilter)=>{
 const year=Number(yearFilter);
 const month=Number(monthFilter);
 const daysInMonth=new Date(year,month+1,0).getDate();
 const totals=new Array(daysInMonth).fill(0);

 categoryCosts.forEach((item)=>{
  if(!item?.date) return;
  const date=new Date(item.date);
  if(date.getFullYear()!==year||date.getMonth()!==month) return;
  totals[date.getDate()-1]+=Number(item.cost||0);
 });

 return totals.map((value,index)=>({
  label:String(index+1),
  value
 }));
};