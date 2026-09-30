import {useMemo} from "react";
import {
 Line,
 LineChart,
 ResponsiveContainer,
 Tooltip,
 XAxis,
 YAxis,
 CartesianGrid,
 Legend,
} from "recharts";
import DashboardEmpty from "./DashboardEmpty";

const monthNames=[
 "January",
 "February",
 "March",
 "April",
 "May",
 "June",
 "July",
 "August",
 "September",
 "October",
 "November",
 "December",
];

const defaultDateAccessor=poem=>{
 const rawDate=poem?.copyright||poem?.writtenAt||poem?.completedAt||poem?.publishedAt||poem?.createdAt||poem?.dateCreated||poem?.created_at;
 const date=new Date(rawDate);
 return Number.isNaN(date.getTime())?null:date;
};

const startOfDay=date=>new Date(date.getFullYear(),date.getMonth(),date.getDate());

const startOfWeek=date=>{
 const start=startOfDay(date);
 start.setDate(start.getDate()-start.getDay());
 return start;
};

const addDays=(date,days)=>{
 const next=new Date(date);
 next.setDate(next.getDate()+days);
 return next;
};

const sameDay=(a,b)=>startOfDay(a).getTime()===startOfDay(b).getTime();

const formatFullDate=date=>new Intl.DateTimeFormat("en-US",{
 month:"long",
 day:"numeric",
 year:"numeric"
}).format(date);

const countPoemsByHour=(poems,targetDate,dateAccessor=defaultDateAccessor)=>{
 const counts=Array.from({length:24},()=>0);

 poems.forEach(poem=>{
  const date=dateAccessor(poem);
  if(!date||!sameDay(date,targetDate))return;
  counts[date.getHours()]+=1;
 });

 return counts;
};

const countPoemsByWeekDay=(poems,weekStart,dateAccessor=defaultDateAccessor)=>{
 const counts=Array.from({length:7},()=>0);

 poems.forEach(poem=>{
  const date=dateAccessor(poem);
  if(!date)return;

  for(let index=0;index<7;index+=1){
   if(sameDay(date,addDays(weekStart,index))){
    counts[index]+=1;
    break;
   }
  }
 });

 return counts;
};

const countPoemsByDay=(poems,year,month,dateAccessor=defaultDateAccessor)=>{
 const daysInMonth=new Date(year,month+1,0).getDate();
 const counts=Array.from({length:daysInMonth},()=>0);

 poems.forEach(poem=>{
  const date=dateAccessor(poem);
  if(!date)return;
  if(date.getFullYear()!==year||date.getMonth()!==month)return;

  counts[date.getDate()-1]+=1;
 });

 return counts;
};

const countPoemsByMonth=(poems,year,dateAccessor=defaultDateAccessor)=>{
 const counts=Array.from({length:12},()=>0);

 poems.forEach(poem=>{
  const date=dateAccessor(poem);
  if(!date||date.getFullYear()!==year)return;
  counts[date.getMonth()]+=1;
 });

 return counts;
};

const buildDailyChartData=(poems,selectedDate,dateAccessor)=>{
 const previousDate=new Date(selectedDate);
 previousDate.setFullYear(previousDate.getFullYear()-1);
 const currentCounts=countPoemsByHour(poems,selectedDate,dateAccessor);
 const previousCounts=countPoemsByHour(poems,previousDate,dateAccessor);

 return Array.from({length:24},(_,index)=>({
  label:index===0?"12 AM":index<12?`${index} AM`:index===12?"12 PM":`${index-12} PM`,
  current:currentCounts[index]||0,
  previous:previousCounts[index]||0
 }));
};

const buildWeeklyChartData=(poems,selectedDate,dateAccessor)=>{
 const weekStart=startOfWeek(selectedDate);
 const previousWeekStart=new Date(weekStart);
 previousWeekStart.setFullYear(previousWeekStart.getFullYear()-1);
 const currentCounts=countPoemsByWeekDay(poems,weekStart,dateAccessor);
 const previousCounts=countPoemsByWeekDay(poems,previousWeekStart,dateAccessor);
 const weekdayNames=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

 return weekdayNames.map((label,index)=>({
  label,
  current:currentCounts[index]||0,
  previous:previousCounts[index]||0
 }));
};

const buildMonthlyChartData=(poems,year,month,dateAccessor)=>{
 const currentYear=Number(year);
 const currentMonth=Number(month);
 const previousYear=currentYear-1;
 const currentCounts=countPoemsByDay(poems,currentYear,currentMonth,dateAccessor);
 const previousCounts=countPoemsByDay(poems,previousYear,currentMonth,dateAccessor);
 const rowCount=Math.max(currentCounts.length,previousCounts.length);

 return Array.from({length:rowCount},(_,index)=>({
  label:String(index+1),
  current:currentCounts[index]||0,
  previous:previousCounts[index]||0
 }));
};

const buildYearlyChartData=(poems,year,dateAccessor)=>{
 const currentYear=Number(year);
 const previousYear=currentYear-1;
 const currentCounts=countPoemsByMonth(poems,currentYear,dateAccessor);
 const previousCounts=countPoemsByMonth(poems,previousYear,dateAccessor);

 return monthNames.map((name,index)=>({
  label:name.slice(0,3),
  current:currentCounts[index]||0,
  previous:previousCounts[index]||0
 }));
};

function PoetryNewPoemsLineChart({
 poems=[],
 activeView="monthly",
 year,
 month,
 selectedDate=new Date(),
 dateAccessor=defaultDateAccessor,
 availableYears=[],
 onCurrentRange,
 onYearChange,
 onMonthChange
}){
 const safeYear=year==="all"?selectedDate.getFullYear():Number(year);
 const safeMonth=month==="all"?selectedDate.getMonth():Number(month);
 const chartDate=useMemo(()=>new Date(safeYear,safeMonth,selectedDate.getDate()),[safeYear,safeMonth,selectedDate]);

 const chartData=useMemo(()=>{
  if(activeView==="daily")return buildDailyChartData(poems,chartDate,dateAccessor);
  if(activeView==="weekly")return buildWeeklyChartData(poems,chartDate,dateAccessor);
  if(activeView==="yearly")return buildYearlyChartData(poems,safeYear,dateAccessor);
  return buildMonthlyChartData(poems,safeYear,safeMonth,dateAccessor);
 },[poems,activeView,chartDate,dateAccessor,safeYear,safeMonth]);

 const currentTotal=chartData.reduce((total,row)=>total+row.current,0);
 const previousTotal=chartData.reduce((total,row)=>total+(row.previous||0),0);
 const previousYear=safeYear-1;
 const monthLabel=monthNames[safeMonth]||"Month";
 const selectedWeekStart=startOfWeek(chartDate);
 const selectedWeekEnd=addDays(selectedWeekStart,6);
 const previousWeekStart=new Date(selectedWeekStart);
 previousWeekStart.setFullYear(previousWeekStart.getFullYear()-1);
 const previousWeekEnd=addDays(previousWeekStart,6);
 const chartTitle=activeView==="daily"
  ?formatFullDate(chartDate)
  :activeView==="weekly"
   ?`${formatFullDate(selectedWeekStart)} - ${formatFullDate(selectedWeekEnd)}`
   :activeView==="yearly"
    ?String(safeYear)
    :`${monthLabel} ${safeYear}`;
 const previousLabel=activeView==="daily"
  ?formatFullDate(new Date(previousYear,chartDate.getMonth(),chartDate.getDate()))
  :activeView==="weekly"
   ?`${formatFullDate(previousWeekStart)} - ${formatFullDate(previousWeekEnd)}`
   :activeView==="yearly"
    ?String(previousYear)
    :`${monthLabel} ${previousYear}`;

 return(
  <section className="dashboard-section dashboard-poem-chart-card">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">New Poems</p>
     <h2 className="dashboard-section-title">{chartTitle}</h2>
    </div>

    <div className="dashboard-poem-chart-controls">
     <button
      type="button"
      className="dashboard-chart-current-button"
      onClick={onCurrentRange}
     >
      Current
     </button>

     <label className="dashboard-filter">
      <span className="dashboard-filter-label">Month</span>
      <select
       className="dashboard-filter-select"
       value={activeView==="yearly"?"all":String(month)}
       onChange={event=>onMonthChange?.(event.target.value==="all"?"all":Number(event.target.value))}
       disabled={activeView==="yearly"}
      >
       {activeView==="yearly"?<option value="all">All Months</option>:null}
       {monthNames.map((name,index)=>(
        <option key={name} value={String(index)}>{name}</option>
       ))}
      </select>
     </label>

     <label className="dashboard-filter">
      <span className="dashboard-filter-label">Year</span>
      <select
       className="dashboard-filter-select"
       value={String(year)}
       onChange={event=>onYearChange?.(event.target.value==="all"?"all":Number(event.target.value))}
      >
       <option value="all">All Years</option>
       {availableYears.map(item=>(
        <option key={item} value={String(item)}>{item}</option>
       ))}
      </select>
     </label>
    </div>
   </div>

   <div className="dashboard-poem-chart-summary">
    <span>{currentTotal} in {chartTitle}</span>
    <span>{previousTotal} in {previousLabel}</span>
   </div>

   <div className="dashboard-poem-chart-caption">
    Comparing new poems for the selected {activeView} view with the matching period in {previousYear}.
   </div>

   {currentTotal||previousTotal?(
    <div className="dashboard-poem-line-chart">
     <ResponsiveContainer width="100%" height={260}>
      <LineChart data={chartData} margin={{top:10,right:16,bottom:0,left:-12}}>
       <CartesianGrid strokeDasharray="3 3" vertical={false}/>
       <XAxis dataKey="label" tickLine={false} axisLine={false}/>
       <YAxis allowDecimals={false} tickLine={false} axisLine={false}/>
       <Tooltip
        labelFormatter={value=>value}
        formatter={(value,name)=>[
         value,
         name==="current"?`${chartTitle} poems`:`${previousLabel} poems`
        ]}
       />
       <Legend/>
       <Line
        type="monotone"
        dataKey="current"
        name={chartTitle}
        stroke="var(--primary)"
        strokeWidth={3}
        dot={false}
        activeDot={{r:5}}
       />
       <Line
        type="monotone"
        dataKey="previous"
        name={previousLabel}
        stroke="var(--accent-2)"
        strokeWidth={3}
        strokeDasharray="6 5"
        dot={false}
        activeDot={{r:5}}
       />
      </LineChart>
     </ResponsiveContainer>
    </div>
   ):(
    <DashboardEmpty message={`No poems found for ${chartTitle}.`}/>
   )}
  </section>
 );
}

export default PoetryNewPoemsLineChart;
