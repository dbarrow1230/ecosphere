// src/pages/reminder/ReminderForm.jsx
import LifeboardFormPage from "../../components/lifeboard/LifeboardFormPage.jsx";

function ReminderForm(){
 return(
  <LifeboardFormPage
   title="New Reminder"
   eyebrow="Reminders"
   text="Create an email, SMS, or in-app reminder."
   endpoint="/api/reminders"
   redirectPath="/reminders"
   submitLabel="Save Reminder"
   initialValues={{
    title:"",
    message:"",
    reminderType:"custom",
    priority:"medium",
    audienceType:"selected",
    sendAt:"",
    status:"pending",
    isRecurring:false,
    recurrenceRule:"",
    recurrenceEndAt:"",
    reminderOffsetMinutes:30
   }}
   fields={[
    {name:"title",label:"Title",required:true},
    {name:"reminderType",label:"Reminder Type",type:"select",options:[
     {value:"task",label:"Task"},
     {value:"goal",label:"Goal"},
     {value:"habit",label:"Habit"},
     {value:"routine",label:"Routine"},
     {value:"journal",label:"Journal"},
     {value:"mindfulness",label:"Mindfulness"},
     {value:"calendarEvent",label:"Calendar Event"},
     {value:"review",label:"Review"},
     {value:"custom",label:"Custom"}
    ]},
    {name:"priority",label:"Priority",type:"select",options:[
     {value:"low",label:"Low"},
     {value:"medium",label:"Medium"},
     {value:"high",label:"High"},
     {value:"urgent",label:"Urgent"}
    ]},
    {name:"sendAt",label:"Send At",type:"datetime-local",required:true},
    {name:"reminderOffsetMinutes",label:"Offset Minutes",type:"number",min:"0"},
    {name:"isRecurring",label:"Recurring",type:"checkbox",checkboxLabel:"Repeat this reminder"},
    {name:"recurrenceRule",label:"Recurrence",type:"select",options:[
     {value:"",label:"None"},
     {value:"daily",label:"Daily"},
     {value:"weekly",label:"Weekly"},
     {value:"bi-weekly",label:"Bi-weekly"},
     {value:"monthly",label:"Monthly"},
     {value:"yearly",label:"Yearly"}
    ]},
    {name:"recurrenceEndAt",label:"Recurrence End",type:"date"},
    {name:"message",label:"Message",type:"textarea",rows:5,full:true,required:true}
   ]}
  />
 );
}

export default ReminderForm;