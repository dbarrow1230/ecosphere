// src/pages/journal/JournalPage.jsx
import LifeboardListPage from "../../components/lifeboard/LifeboardListPage.jsx";

function JournalPage(){
 return(
  <LifeboardListPage
   title="Journal"
   text="Review daily entries, reflections, gratitude, memories, dreams, and free-writing."
   endpoint="/api/journal"
   dataKey="journalEntries"
   emptyText="No journal entries found."
   createPath="/journal/daily/new"
   createLabel="New Daily Entry"
   filters={[
    {name:"journalType",label:"Journal Type",field:"journalType",options:[
     {value:"daily",label:"Daily"},
     {value:"private",label:"Private"},
     {value:"reflection",label:"Reflection"},
     {value:"gratitude",label:"Gratitude"},
     {value:"memory",label:"Memory"},
     {value:"dream",label:"Dream"},
     {value:"free-write",label:"Free Write"}
    ]}
   ]}
   columns={[
    {key:"title",label:"Title"},
    {key:"journalType",label:"Type"},
    {key:"entryDateDisplay",label:"Entry Date"},
    {key:"mood",label:"Mood"},
    {key:"energy",label:"Energy"},
    {key:"lifeArea.name",label:"Life Area"}
   ]}
  />
 );
}

export default JournalPage;