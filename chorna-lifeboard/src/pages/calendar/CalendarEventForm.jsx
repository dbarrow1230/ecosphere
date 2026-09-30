// src/pages/calendar/CalendarEventForm.jsx
import LifeboardFormPage from "../../components/lifeboard/LifeboardFormPage.jsx";

function CalendarEventForm(){
 return(
  <LifeboardFormPage
   title="New Calendar Event"
   eyebrow="Calendar"
   text="Create an appointment, birthday, reminder, deadline, personal event, or recurring event."
   endpoint="/api/calendar-events"
   redirectPath="/calendar"
   submitLabel="Save Event"
   initialValues={{
    title:"",
    description:"",
    eventType:"personal",
    startDate:"",
    endDate:"",
    allDay:false,
    location:"",
    status:"scheduled",
    priority:"medium",
    isRecurring:false
   }}
   fields={[
    {name:"title",label:"Title",required:true},
    {name:"eventType",label:"Event Type",type:"select",options:[
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
    ]},
    {name:"startDate",label:"Start Date",type:"datetime-local",required:true},
    {name:"endDate",label:"End Date",type:"datetime-local"},
    {name:"status",label:"Status",type:"select",options:[
     {value:"scheduled",label:"Scheduled"},
     {value:"completed",label:"Completed"},
     {value:"cancelled",label:"Cancelled"},
     {value:"missed",label:"Missed"}
    ]},
    {name:"priority",label:"Priority",type:"select",options:[
     {value:"low",label:"Low"},
     {value:"medium",label:"Medium"},
     {value:"high",label:"High"},
     {value:"urgent",label:"Urgent"}
    ]},
    {name:"location",label:"Location"},
    {name:"allDay",label:"All Day",type:"checkbox",checkboxLabel:"All-day event"},
    {name:"isRecurring",label:"Recurring",type:"checkbox",checkboxLabel:"This event repeats"},
    {name:"description",label:"Description",type:"textarea",rows:5,full:true}
   ]}
  />
 );
}

export default CalendarEventForm;