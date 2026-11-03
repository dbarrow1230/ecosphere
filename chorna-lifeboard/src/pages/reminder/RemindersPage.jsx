// src/pages/reminder/RemindersPage.jsx
import LifeboardListPage from "../../components/lifeboard/LifeboardListPage.jsx";

function RemindersPage(){
 return(
  <LifeboardListPage
   title="Reminders"
   text="Manage email, SMS, and in-app reminders."
   endpoint="/api/reminders"
   dataKey="reminders"
   emptyText="No reminders found."
   createPath="/reminders/new"
   createLabel="Add Reminder"
   filters={[
    {name:"reminderType",label:"Reminder Type",field:"reminderType",options:[
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
    {name:"status",label:"Status",field:"status",options:[
     {value:"pending",label:"Pending"},
     {value:"processing",label:"Processing"},
     {value:"sent",label:"Sent"},
     {value:"failed",label:"Failed"},
     {value:"paused",label:"Paused"},
     {value:"dismissed",label:"Dismissed"},
     {value:"completed",label:"Completed"},
     {value:"cancelled",label:"Cancelled"}
    ]}
   ]}
   columns={[
    {key:"title",label:"Title"},
    {key:"reminderType",label:"Type"},
    {key:"sendAtDisplay",label:"Send At"},
    {key:"status",label:"Status"},
    {key:"priority",label:"Priority"},
    {key:"isRecurring",label:"Recurring"}
   ]}
  />
 );
}

export default RemindersPage;