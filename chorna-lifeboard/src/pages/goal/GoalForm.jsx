// src/pages/goal/GoalForm.jsx
import LifeboardFormPage from "../../components/lifeboard/LifeboardFormPage.jsx";

function GoalForm(){
 return(
  <LifeboardFormPage
   title="New Goal"
   eyebrow="Goals"
   text="Create a goal with progress, priority, and target date."
   endpoint="/api/goals"
   redirectPath="/goals"
   submitLabel="Save Goal"
   initialValues={{
    title:"",
    description:"",
    goalType:"short-term",
    status:"not-started",
    priority:"medium",
    progress:0,
    startDate:"",
    targetDate:""
   }}
   fields={[
    {name:"title",label:"Title",required:true},
    {name:"goalType",label:"Goal Type",type:"select",options:[
     {value:"daily",label:"Daily"},
     {value:"weekly",label:"Weekly"},
     {value:"monthly",label:"Monthly"},
     {value:"yearly",label:"Yearly"},
     {value:"short-term",label:"Short-Term"},
     {value:"long-term",label:"Long-Term"}
    ]},
    {name:"status",label:"Status",type:"select",options:[
     {value:"not-started",label:"Not Started"},
     {value:"in-progress",label:"In Progress"},
     {value:"completed",label:"Completed"},
     {value:"paused",label:"Paused"},
     {value:"cancelled",label:"Cancelled"},
     {value:"archived",label:"Archived"}
    ]},
    {name:"priority",label:"Priority",type:"select",options:[
     {value:"low",label:"Low"},
     {value:"medium",label:"Medium"},
     {value:"high",label:"High"},
     {value:"urgent",label:"Urgent"}
    ]},
    {name:"progress",label:"Progress",type:"number",min:"0",max:"100"},
    {name:"startDate",label:"Start Date",type:"date"},
    {name:"targetDate",label:"Target Date",type:"date"},
    {name:"description",label:"Description",type:"textarea",rows:5,full:true}
   ]}
  />
 );
}

export default GoalForm;