// src/pages/timeline/TimelineForm.jsx
import LifeboardFormPage from "../../components/lifeboard/LifeboardFormPage.jsx";

function TimelineForm(){
 return(
  <LifeboardFormPage
   title="New Timeline Entry"
   eyebrow="Timeline"
   text="Create a chronological record for your life board."
   endpoint="/api/timeline"
   redirectPath="/timeline"
   submitLabel="Save Timeline Entry"
   initialValues={{
    title:"",
    description:"",
    entryDate:new Date().toISOString().slice(0,10),
    entryType:"other",
    isPrivate:false
   }}
   fields={[
    {name:"title",label:"Title",required:true},
    {name:"entryDate",label:"Entry Date",type:"date",required:true},
    {name:"entryType",label:"Entry Type",type:"select",options:[
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
    ]},
    {name:"description",label:"Description",type:"textarea",rows:7,full:true},
    {name:"isPrivate",label:"Private",type:"checkbox",checkboxLabel:"Keep this timeline entry private"}
   ]}
  />
 );
}

export default TimelineForm;