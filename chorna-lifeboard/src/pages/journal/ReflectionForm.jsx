// src/pages/journal/ReflectionForm.jsx
import LifeboardFormPage from "../../components/lifeboard/LifeboardFormPage.jsx";

function ReflectionForm(){
 return(
  <LifeboardFormPage
   title="Reflection Entry"
   eyebrow="Journal"
   text="Create a reflection entry to process lessons, progress, challenges, and next steps."
   endpoint="/api/journal"
   redirectPath="/journal"
   submitLabel="Save Reflection"
   initialValues={{
    title:"",
    journalType:"reflection",
    entryDate:new Date().toISOString().slice(0,10),
    mood:"",
    energy:"",
    content:"",
    lessons:"",
    nextSteps:"",
    isPrivate:false
   }}
   fields={[
    {name:"title",label:"Title",required:true},
    {name:"entryDate",label:"Entry Date",type:"date",required:true},
    {name:"mood",label:"Mood"},
    {name:"energy",label:"Energy",type:"number",min:"1",max:"10"},
    {name:"content",label:"Reflection",type:"textarea",rows:7,full:true},
    {name:"lessons",label:"Lessons",type:"textarea",rows:4,arrayFromLines:true},
    {name:"nextSteps",label:"Next Steps",type:"textarea",rows:4,arrayFromLines:true},
    {name:"isPrivate",label:"Private",type:"checkbox",checkboxLabel:"Keep this reflection private"}
   ]}
  />
 );
}

export default ReflectionForm;