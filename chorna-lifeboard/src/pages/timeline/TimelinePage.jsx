// src/pages/timeline/TimelinePage.jsx
import LifeboardListPage from "../../components/lifeboard/LifeboardListPage.jsx";

function TimelinePage(){
 return(
  <LifeboardListPage
   title="Timeline"
   text="View your chronological life record across journal entries, goals, memories, notes, events, and milestones."
   endpoint="/api/timeline"
   dataKey="timelineEntries"
   emptyText="No timeline entries found."
   createPath="/timeline/new"
   createLabel="Add Timeline Entry"
   filters={[
    {name:"entryType",label:"Entry Type",field:"entryType",options:[
     {value:"task",label:"Task"},
     {value:"goal",label:"Goal"},
     {value:"habit",label:"Habit"},
     {value:"journal",label:"Journal"},
     {value:"mindfulness",label:"Mindfulness"},
     {value:"note",label:"Note"},
     {value:"milestone",label:"Milestone"},
     {value:"mood",label:"Mood"},
     {value:"memory",label:"Memory"},
     {value:"event",label:"Event"},
     {value:"other",label:"Other"}
    ]}
   ]}
   columns={[
    {key:"title",label:"Title"},
    {key:"entryType",label:"Type"},
    {key:"entryDateDisplay",label:"Date"},
    {key:"sourceModel",label:"Source"},
    {key:"lifeArea.name",label:"Life Area"},
    {key:"isPrivate",label:"Private"}
   ]}
  />
 );
}

export default TimelinePage;