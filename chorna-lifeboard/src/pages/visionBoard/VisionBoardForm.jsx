// src/pages/visionBoard/VisionBoardForm.jsx
import LifeboardFormPage from "../../components/lifeboard/LifeboardFormPage.jsx";

function VisionBoardForm(){
 return(
  <LifeboardFormPage
   title="New Vision Board"
   eyebrow="Vision"
   text="Create a personal, yearly, monthly, or goal-based vision board."
   endpoint="/api/vision-boards"
   redirectPath="/vision-boards"
   submitLabel="Save Vision Board"
   initialValues={{
    title:"",
    description:"",
    boardType:"personal",
    year:new Date().getFullYear(),
    month:"",
    isActive:true,
    isPrivate:true
   }}
   fields={[
    {name:"title",label:"Title",required:true},
    {name:"boardType",label:"Board Type",type:"select",options:[
     {value:"personal",label:"Personal"},
     {value:"yearly",label:"Yearly"},
     {value:"monthly",label:"Monthly"},
     {value:"goal",label:"Goal"},
     {value:"career",label:"Career"},
     {value:"health",label:"Health"},
     {value:"creative",label:"Creative"},
     {value:"relationship",label:"Relationship"},
     {value:"financial",label:"Financial"},
     {value:"spiritual",label:"Spiritual"},
     {value:"custom",label:"Custom"}
    ]},
    {name:"year",label:"Year",type:"number"},
    {name:"month",label:"Month",type:"number",min:"1",max:"12"},
    {name:"isActive",label:"Active",type:"checkbox",checkboxLabel:"Vision board is active"},
    {name:"isPrivate",label:"Private",type:"checkbox",checkboxLabel:"Keep this vision board private"},
    {name:"description",label:"Description",type:"textarea",rows:5,full:true}
   ]}
  />
 );
}

export default VisionBoardForm;