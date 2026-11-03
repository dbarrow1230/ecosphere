export const DATE_FORMAT="MM/DD/YYYY";

export function formatDate(value){
 if(value==null||value==="")return "—";
 const dateOnly=typeof value==="string"&&value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
 if(dateOnly){
  const [,year,month,day]=dateOnly;
  const check=new Date(Number(year),Number(month)-1,Number(day));
  if(check.getFullYear()!==Number(year)||check.getMonth()+1!==Number(month)||check.getDate()!==Number(day))return "—";
  return month+"/"+day+"/"+year;
 }
 const date=value instanceof Date?value:new Date(value);
 if(Number.isNaN(date.getTime()))return "—";
 return String(date.getMonth()+1).padStart(2,"0")+"/"+String(date.getDate()).padStart(2,"0")+"/"+date.getFullYear();
}

export function formatDateTime(value){
 const day=formatDate(value);
 if(day==="—")return day;
 const date=value instanceof Date?value:new Date(value);
 return day+" "+date.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"});
}
