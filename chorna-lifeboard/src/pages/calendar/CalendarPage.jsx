// src/pages/calendar/CalendarPage.jsx
import LifeboardListPage from "../../components/lifeboard/LifeboardListPage.jsx";

function CalendarPage(){
 return(
  <LifeboardListPage
   title="Calendar"
   text="View appointments, birthdays, reminders, important dates, personal events, and recurring events."
   endpoint="/api/calendar-events"
   dataKey="calendarEvents"
   emptyText="No calendar events found."
   createPath="/calendar/new"
   createLabel="Add Event"
   filters={[
    {name:"eventType",label:"Event Type",field:"eventType",options:[
     {value:"appointment",label:"Appointment"},
     {value:"birthday",label:"Birthday"},
     {value:"reminder",label:"Reminder"},
     {value:"deadline",label:"Deadline"},
     {value:"personal",label:"Personal"},
     {value:"work",label:"Work"},
     {value:"health",label:"Health"},
     {value:"family",label:"Family"},
     {value:"holiday",label:"Holiday"},
     {value:"other",label:"Other"}
    ]}
   ]}
   columns={[
    {key:"title",label:"Title"},
    {key:"eventType",label:"Type"},
    {key:"startDateDisplay",label:"Start"},
    {key:"endDateDisplay",label:"End"},
    {key:"status",label:"Status"},
    {key:"location",label:"Location"}
   ]}
  />
 );
}

export default CalendarPage;