import {useMemo} from "react";

const getDateKey=date=>{
 const yearValue=date.getFullYear();
 const monthValue=String(date.getMonth()+1).padStart(2,"0");
 const dayValue=String(date.getDate()).padStart(2,"0");
 return `${yearValue}-${monthValue}-${dayValue}`;
};

const getSafeDate=value=>{
 const date=new Date(value);
 return Number.isNaN(date.getTime())?null:date;
};

function DashboardCalendarCard({
 year,
 month,
 selectedDate=new Date(),
 poems=[],
 poemDateAccessor,
 newPoemDateAccessor,
 onDateSelect,
 onMonthChange,
 onCurrentMonth
}){
 const isSingleMonth=year!=="all"&&month!=="all";
 const selectedDateKey=getDateKey(selectedDate);

 const dayCounts=useMemo(()=>{
  const counts={};

  poems.forEach(poem=>{
   const poemDate=getSafeDate(poemDateAccessor?poemDateAccessor(poem):poem?.copyright||poem?.createdAt);
   const createdDate=getSafeDate(newPoemDateAccessor?newPoemDateAccessor(poem):poem?.createdAt);

   if(poemDate){
    const key=getDateKey(poemDate);
    counts[key]={
     poems:(counts[key]?.poems||0)+1,
     newPoems:counts[key]?.newPoems||0
    };
   }

   if(createdDate){
    const key=getDateKey(createdDate);
    counts[key]={
     poems:counts[key]?.poems||0,
     newPoems:(counts[key]?.newPoems||0)+1
    };
   }
  });

  return counts;
 },[poems,poemDateAccessor,newPoemDateAccessor]);

 const calendarData=useMemo(()=>{
  if(!isSingleMonth)return [];

  const firstDay=new Date(year,month,1);
  const lastDay=new Date(year,month+1,0);
  const startOffset=firstDay.getDay();
  const daysInMonth=lastDay.getDate();
  const cells=[];

  for(let i=0;i<startOffset;i++){
   cells.push({key:`empty-start-${i}`,label:"",isCurrentMonth:false,isToday:false});
  }

  for(let day=1;day<=daysInMonth;day++){
   const now=new Date();
   const date=new Date(year,month,day);
   const dateKey=getDateKey(date);
   const isToday=day===now.getDate()&&month===now.getMonth()&&year===now.getFullYear();
   cells.push({
    key:`day-${day}`,
    label:day,
    date,
    dateKey,
    isCurrentMonth:true,
    isToday,
    isSelected:dateKey===selectedDateKey,
    counts:dayCounts[dateKey]||{poems:0,newPoems:0}
   });
  }

  while(cells.length%7!==0){
   cells.push({key:`empty-end-${cells.length}`,label:"",isCurrentMonth:false,isToday:false});
  }

  return cells;
 },[year,month,isSingleMonth,selectedDateKey,dayCounts]);

 const monthLabel=isSingleMonth
  ?new Date(year,month,1).toLocaleString("en-US",{month:"long",year:"numeric"})
  :year==="all"&&month==="all"
   ?"All Months, All Years"
   :year==="all"
    ?`${new Date(2026,month,1).toLocaleString("en-US",{month:"long"})}, All Years`
    :`All Months, ${year}`;
 const weekdayLabels=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

 const handleMonthStep=step=>{
  if(!isSingleMonth||!onMonthChange)return;
  const nextDate=new Date(year,month+step,1);
  onMonthChange(nextDate);
 };

 const handleDayClick=cell=>{
  if(!cell?.date||!onDateSelect)return;
  onDateSelect(cell.date);
 };

 return(
  <section className="dashboard-section dashboard-calendar-card">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Poetry Calendar</p>
     <h2 className="dashboard-section-title">{monthLabel}</h2>
    </div>

    {isSingleMonth?(
     <div className="dashboard-calendar-card-actions">
      <button type="button" onClick={()=>handleMonthStep(-1)}>Back</button>
      <button type="button" onClick={onCurrentMonth}>Current</button>
      <button type="button" onClick={()=>handleMonthStep(1)}>Next</button>
     </div>
    ):null}
   </div>

   {isSingleMonth?(
    <div className="dashboard-calendar">
     {weekdayLabels.map((label)=>(
      <div key={label} className="dashboard-calendar-weekday">{label}</div>
     ))}

     {calendarData.map((cell)=>(
      <button
       type="button"
       key={cell.key}
       className={`dashboard-calendar-day ${cell.isCurrentMonth?"":"dashboard-calendar-day-muted"} ${cell.isToday?"dashboard-calendar-day-today":""} ${cell.isSelected?"dashboard-calendar-day-selected":""}`.trim()}
       onClick={()=>handleDayClick(cell)}
       disabled={!cell.isCurrentMonth}
      >
       <span className="dashboard-calendar-day-number">{cell.label}</span>
       {cell.isCurrentMonth&&(cell.counts.poems||cell.counts.newPoems)?(
        <span className="dashboard-calendar-day-metrics">
         {cell.counts.poems?`${cell.counts.poems} poem${cell.counts.poems===1?"":"s"}`:null}
         {cell.counts.newPoems?`${cell.counts.newPoems} new`:null}
        </span>
       ):null}
      </button>
     ))}
    </div>
   ):(
    <div className="dashboard-calendar-empty">
     Select a single month and year to show the calendar grid.
    </div>
   )}
  </section>
 );
}

export default DashboardCalendarCard;
