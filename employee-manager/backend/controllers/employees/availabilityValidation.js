const time=/^(?:[01]\d|2[0-3]):[0-5]\d$/;
export function validateAvailability(body){
 if(!Array.isArray(body.weekly)||body.weekly.length>7)throw Error("Provide up to seven weekly availability days.");
 const days=new Set();
 const rangesFor=entry=>{
  if(typeof entry.isAvailable!=="boolean"||!Array.isArray(entry.ranges)||entry.ranges.length>12)throw Error("Check availability and time ranges.");
  const ranges=entry.ranges.map(range=>{
   if(!time.test(range.start)||!time.test(range.end)||range.start>=range.end)throw Error("Each time range must end after it starts.");
   return {start:range.start,end:range.end};
  }).sort((a,b)=>a.start.localeCompare(b.start));
  for(let i=1;i<ranges.length;i++)if(ranges[i].start<ranges[i-1].end)throw Error("Availability time ranges cannot overlap.");
  if(entry.isAvailable&&!ranges.length)throw Error("Add a time range for each available day.");
  return ranges;
 };
 const weekly=body.weekly.map(day=>{
  if(!Number.isInteger(day.dayOfWeek)||day.dayOfWeek<0||day.dayOfWeek>6||days.has(day.dayOfWeek))throw Error("Each weekday must appear once at most.");
  days.add(day.dayOfWeek);return {dayOfWeek:day.dayOfWeek,isAvailable:day.isAvailable,ranges:rangesFor(day)};
 });
 if(!Array.isArray(body.overrides||[])||(body.overrides||[]).length>366)throw Error("Check date overrides.");
 const overrides=(body.overrides||[]).map(day=>{
  const date=new Date(day.date);
  if(Number.isNaN(date.getTime()))throw Error("Check override dates.");
  return {date,isAvailable:day.isAvailable,ranges:rangesFor(day),note:String(day.note||"").slice(0,2000)};
 });
 return {weekly,overrides};
}
