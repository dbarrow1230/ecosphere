// src/pages/routine/RoutineForm.jsx
import LifeboardFormPage from "../../components/lifeboard/LifeboardFormPage.jsx";

function RoutineForm(){
 return(
  <LifeboardFormPage
   title="New Routine"
   eyebrow="Routines"
   text="Create a grouped routine such as morning reset, weekly reset, self-care, study, or fitness."
   endpoint="/api/routines"
   redirectPath="/routines"
   submitLabel="Save Routine"
   initialValues={{
    title:"",
    description:"",
    routineType:"custom",
    frequency:"daily",
    status:"active",
    startDate:"",
    endDate:""
   }}
   fields={[
    {name:"title",label:"Title",required:true},
    {name:"routineType",label:"Routine Type",type:"select",options:[
     {value:"morning",label:"Morning"},
     {value:"afternoon",label:"Afternoon"},
     {value:"evening",label:"Evening"},
     {value:"night",label:"Night"},
     {value:"weekly-reset",label:"Weekly Reset"},
     {value:"monthly-reset",label:"Monthly Reset"},
     {value:"mindfulness",label:"Mindfulness"},
     {value:"self-care",label:"Self-Care"},
     {value:"work",label:"Work"},
     {value:"study",label:"Study"},
     {value:"fitness",label:"Fitness"},
     {value:"custom",label:"Custom"}
    ]},
    {name:"frequency",label:"Frequency",type:"select",options:[
     {value:"daily",label:"Daily"},
     {value:"weekly",label:"Weekly"},
     {value:"monthly",label:"Monthly"},
     {value:"yearly",label:"Yearly"},
     {value:"custom",label:"Custom"}
    ]},
    {name:"status",label:"Status",type:"select",options:[
     {value:"active",label:"Active"},
     {value:"paused",label:"Paused"},
     {value:"completed",label:"Completed"},
     {value:"archived",label:"Archived"}
    ]},
    {name:"startDate",label:"Start Date",type:"date"},
    {name:"endDate",label:"End Date",type:"date"},
    {name:"description",label:"Description",type:"textarea",rows:5,full:true}
   ]}
  />
 );
}

export default RoutineForm;