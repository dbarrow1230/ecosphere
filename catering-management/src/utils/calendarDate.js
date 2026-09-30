// Event dates are calendar dates, persisted by Mongo as UTC midnight.
export const calendarDate=value=>{
 if(!value)return "";
 if(typeof value==="string"&&/^\d{4}-\d{2}-\d{2}(?:T|$)/.test(value))return value.slice(0,10);
 const date=new Date(value);
 return Number.isNaN(date.getTime())?"":date.toISOString().slice(0,10);
};

export const localEventDate=value=>{
 const day=calendarDate(value);
 return day?new Date(`${day}T00:00:00`):new Date(NaN);
};
