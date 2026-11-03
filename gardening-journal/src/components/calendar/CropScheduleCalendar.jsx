import {useMemo,useState} from "react";
import {Calendar,momentLocalizer} from "react-big-calendar";
import moment from "moment";
import {buildCropCalendarEvents} from "../../utils/growing/cropCalendarEvents.js";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer=momentLocalizer(moment);
const eventClass=event=>({className:event.resource.className});

export default function CropScheduleCalendar({rows,date,onNavigate,onEdit}){
 const [view,setView]=useState("month");
 const year=date.getFullYear();
 const events=useMemo(()=>[year-1,year,year+1].flatMap(value=>buildCropCalendarEvents(rows,value)),[rows,year]);
 return <section className="crop-big-calendar" aria-label="Crop planning calendar">
  <div className="crop-calendar-legend"><span className="crop-legend-sow">Sow</span><span className="crop-legend-plant">Plant</span><span className="crop-legend-harvest">Harvest</span></div>
  <p className="crop-calendar-help">Monthly planning windows repeat each year. Select a crop on the calendar to edit its schedule.</p>
  <Calendar localizer={localizer} events={events} date={date} onNavigate={onNavigate} view={view} onView={setView} views={["month","week","agenda"]} startAccessor="start" endAccessor="end" onSelectEvent={event=>onEdit(event.resource.record)} eventPropGetter={eventClass} popup/>
 </section>;
}
