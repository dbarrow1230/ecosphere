// src/components/dashboard/DashboardCalendar.jsx
import {useMemo} from "react";
import {Calendar,dateFnsLocalizer,Views} from "react-big-calendar";
import {format,parse,startOfWeek,getDay} from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales={"en-US":enUS};

const localizer=dateFnsLocalizer({
 format,
 parse,
 startOfWeek,
 getDay,
 locales
});

const parseLocalDate=value=>{
 if(!value)return new Date();
 if(value instanceof Date)return value;

 const text=String(value);
 const match=text.match(/^(\d{4})-(\d{2})-(\d{2})/);
 if(match)return new Date(Number(match[1]),Number(match[2])-1,Number(match[3]));

 const date=new Date(value);
 return Number.isNaN(date.getTime())?new Date():date;
};

const toInputDate=value=>{
 const date=parseLocalDate(value);
 return [
  date.getFullYear(),
  String(date.getMonth()+1).padStart(2,"0"),
  String(date.getDate()).padStart(2,"0")
 ].join("-");
};

const buildEventDate=value=>{
 const date=parseLocalDate(value);
 if(Number.isNaN(date.getTime()))return null;
 return date;
};

const getObjectId=value=>{
 if(!value)return "";
 if(typeof value._id==="string")return value._id;
 return "";
};

const getFirstEntry=note=>{
 const entries=Array.isArray(note?.entries)?note.entries:[];
 return entries[0]||{};
};

const getReference=item=>{
 const start=item?.chapterStart||item?.chapter;
 const verseStart=item?.verseStart;
 const verseEnd=item?.verseEnd;

 if(item?.reference)return item.reference;
 if(!item?.book)return "";
 if(!start)return item.book;
 return `${item.book} ${start}${verseStart?`:${verseStart}`:""}${verseEnd?`-${verseEnd}`:""}`;
};

const periodToCalendarView=period=>{
 if(period==="day"||period==="today")return Views.DAY;
 return Views.MONTH;
};

const calendarViewToPeriod=view=>{
 if(view===Views.DAY)return "today";
 return "month";
};

const getYearDates=year=>Array.from({length:12},(_,index)=>new Date(year,index,1));

function DashboardCalendar({
 period="month",
 reportDate="",
 studies=[],
 dailyNotes=[],
 tasks=[],
 memoryVerses=[],
 onPeriodChange,
 onReportDateChange
}){
 const selectedDate=useMemo(()=>parseLocalDate(reportDate),[reportDate]);
 const calendarView=periodToCalendarView(period);
 const yearDates=useMemo(()=>getYearDates(selectedDate.getFullYear()),[selectedDate]);

 const events=useMemo(()=>{
  const studyEvents=(Array.isArray(studies)?studies:[]).flatMap(study=>{
   const start=buildEventDate(study.startedAt||study.updatedAt||study.createdAt);
   if(!start)return [];

   return [{
    id:`study-${getObjectId(study)}`,
    title:study.title||"Untitled study",
    start,
    end:new Date(start.getTime()+60*60*1000),
    allDay:true,
    resource:{type:"study",item:study}
   }];
  });

  const noteEvents=(Array.isArray(dailyNotes)?dailyNotes:[]).flatMap(note=>{
   const start=buildEventDate(note.journalDate);
   if(!start)return [];
   const entry=getFirstEntry(note);

   return [{
    id:`daily-note-${getObjectId(note)}`,
    title:note.title||getReference(entry)||"Daily note",
    start,
    end:new Date(start.getTime()+60*60*1000),
    allDay:true,
    resource:{type:"daily-note",item:note}
   }];
  });

  const taskEvents=(Array.isArray(tasks)?tasks:[]).flatMap(task=>{
   const start=buildEventDate(task.dueDate||task.updatedAt||task.createdAt);
   if(!start)return [];

   return [{
    id:`task-${getObjectId(task)}`,
    title:task.title||"Study task",
    start,
    end:new Date(start.getTime()+60*60*1000),
    allDay:true,
    resource:{type:"task",item:task}
   }];
  });

  const memoryEvents=(Array.isArray(memoryVerses)?memoryVerses:[]).flatMap(memoryVerse=>{
   const start=buildEventDate(memoryVerse.nextReviewAt||memoryVerse.updatedAt||memoryVerse.createdAt);
   if(!start)return [];

   return [{
    id:`memory-${getObjectId(memoryVerse)}`,
    title:`Memory: ${memoryVerse.reference||"Verse"}`,
    start,
    end:new Date(start.getTime()+60*60*1000),
    allDay:true,
    resource:{type:"memory",item:memoryVerse}
   }];
  });

  return [...studyEvents,...noteEvents,...taskEvents,...memoryEvents];
 },[dailyNotes,memoryVerses,studies,tasks]);

 const handleNavigate=date=>{
  onReportDateChange?.(toInputDate(date));
 };

 const handleView=view=>{
  onPeriodChange?.(calendarViewToPeriod(view));
 };

 const handleSelectSlot=slot=>{
  onReportDateChange?.(toInputDate(slot.start));
 };

 const eventPropGetter=event=>{
  const type=event?.resource?.type;
  return {
   className:type?`dashboard-calendar-event dashboard-calendar-event-${type}`:"dashboard-calendar-event"
  };
 };

 const handleYearNavigate=direction=>{
  const nextDate=new Date(selectedDate);
  nextDate.setFullYear(selectedDate.getFullYear()+direction,0,1);
  onReportDateChange?.(toInputDate(nextDate));
 };

 const handleYearToday=()=>{
  const today=new Date();
  onReportDateChange?.(toInputDate(new Date(today.getFullYear(),0,1)));
 };

 const selectYearSlot=slot=>{
  onPeriodChange?.("today");
  onReportDateChange?.(toInputDate(slot.start));
 };

 const selectYearEvent=event=>{
  onPeriodChange?.("today");
  onReportDateChange?.(toInputDate(event.start));
 };

 return(
  <section className="dashboard-section dashboard-calendar-section">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Bible Study Calendar</p>
     <h2 className="dashboard-section-title">Select Dashboard Date</h2>
    </div>
    <p className="dashboard-calendar-current">{format(selectedDate,"MMMM d, yyyy")}</p>
   </div>

   {period==="year"?(
    <div className="dashboard-calendar-year-wrap">
     <div className="dashboard-calendar-year-toolbar">
      <div className="dashboard-calendar-button-group">
       <button type="button" onClick={handleYearToday}>Today</button>
       <button type="button" onClick={()=>handleYearNavigate(-1)}>Back</button>
       <button type="button" onClick={()=>handleYearNavigate(1)}>Next</button>
      </div>
      <span>{selectedDate.getFullYear()}</span>
      <div className="dashboard-calendar-button-group">
       <button type="button" onClick={()=>onPeriodChange?.("month")}>Month</button>
       <button type="button" onClick={()=>onPeriodChange?.("today")}>Day</button>
       <button type="button" className="active">Year</button>
      </div>
     </div>

     <div className="dashboard-calendar-year-grid">
      {yearDates.map(monthDate=>(
       <article key={monthDate.toISOString()} className="dashboard-calendar-mini-month">
        <h3>{format(monthDate,"MMMM")}</h3>
        <Calendar
         localizer={localizer}
         events={events}
         date={monthDate}
         view={Views.MONTH}
         views={[Views.MONTH]}
         toolbar={false}
         startAccessor="start"
         endAccessor="end"
         selectable
         popup
         onSelectSlot={selectYearSlot}
         onSelectEvent={selectYearEvent}
         eventPropGetter={eventPropGetter}
        />
       </article>
      ))}
     </div>
    </div>
   ):(
    <div className="dashboard-calendar-wrap">
     <Calendar
      localizer={localizer}
      events={events}
      date={selectedDate}
      view={calendarView}
      views={[Views.MONTH,Views.DAY]}
      startAccessor="start"
      endAccessor="end"
      selectable
      popup
      onNavigate={handleNavigate}
      onView={handleView}
      onSelectSlot={handleSelectSlot}
      eventPropGetter={eventPropGetter}
     />
    </div>
   )}
  </section>
 );
}

export default DashboardCalendar;
