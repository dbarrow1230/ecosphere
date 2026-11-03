import {useMemo} from "react";

function DashboardCalendarCard({year,month}){

 const calendarData=useMemo(()=>{
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
   const isToday=day===now.getDate()&&month===now.getMonth()&&year===now.getFullYear();
   cells.push({key:`day-${day}`,label:day,isCurrentMonth:true,isToday});
  }

  while(cells.length%7!==0){
   cells.push({key:`empty-end-${cells.length}`,label:"",isCurrentMonth:false,isToday:false});
  }

  return cells;
 },[year,month]);

 const monthLabel=new Date(year,month,1).toLocaleString("en-US",{month:"long",year:"numeric"});
 const weekdayLabels=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

 return(
  <section className="dashboard-section dashboard-calendar-card">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Production Calendar</p>
     <h2 className="dashboard-section-title">{monthLabel}</h2>
    </div>
   </div>

   <div className="dashboard-calendar">
    {weekdayLabels.map((label)=>(
     <div key={label} className="dashboard-calendar-weekday">{label}</div>
    ))}

    {calendarData.map((cell)=>(
     <div
      key={cell.key}
      className={`dashboard-calendar-day ${cell.isCurrentMonth?"":"dashboard-calendar-day-muted"} ${cell.isToday?"dashboard-calendar-day-today":""}`.trim()}
     >
      {cell.label}
     </div>
    ))}
   </div>
  </section>
 );
}

export default DashboardCalendarCard;