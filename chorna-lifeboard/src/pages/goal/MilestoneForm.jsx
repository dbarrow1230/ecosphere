// src/pages/goal/MilestoneForm.jsx
import LifeboardFormPage from "../../components/lifeboard/LifeboardFormPage.jsx";

function MilestoneForm(){
 return(
  <LifeboardFormPage
   title="New Milestone"
   eyebrow="Milestones"
   text="Create an important marker for your timeline, goal progress, or life record."
   endpoint="/api/milestones"
   redirectPath="/milestones"
   submitLabel="Save Milestone"
   initialValues={{
    title:"",
    description:"",
    milestoneDate:new Date().toISOString().slice(0,10),
    milestoneType:"personal"
   }}
   fields={[
    {name:"title",label:"Title",required:true},
    {name:"milestoneDate",label:"Milestone Date",type:"date",required:true},
    {name:"milestoneType",label:"Type",type:"select",options:[
     {value:"goal",label:"Goal"},
     {value:"personal",label:"Personal"},
     {value:"career",label:"Career"},
     {value:"health",label:"Health"},
     {value:"creative",label:"Creative"},
     {value:"financial",label:"Financial"},
     {value:"relationship",label:"Relationship"},
     {value:"education",label:"Education"},
     {value:"spiritual",label:"Spiritual"},
     {value:"other",label:"Other"}
    ]},
    {name:"description",label:"Description",type:"textarea",rows:6,full:true}
   ]}
  />
 );
}

export default MilestoneForm;