// src/pages/journal/GratitudeForm.jsx
import LifeboardFormPage from "../../components/lifeboard/LifeboardFormPage.jsx";

function GratitudeForm(){
 return(
  <LifeboardFormPage
   title="Gratitude Entry"
   eyebrow="Journal"
   text="Record gratitude, highlights, and meaningful moments."
   endpoint="/api/journal"
   redirectPath="/journal"
   submitLabel="Save Gratitude Entry"
   initialValues={{
    title:"Gratitude",
    journalType:"gratitude",
    entryDate:new Date().toISOString().slice(0,10),
    gratitude:"",
    highlights:"",
    content:"",
    isPrivate:false
   }}
   fields={[
    {name:"title",label:"Title",required:true},
    {name:"entryDate",label:"Entry Date",type:"date",required:true},
    {name:"gratitude",label:"Gratitude Items",type:"textarea",rows:5,arrayFromLines:true,full:true},
    {name:"highlights",label:"Highlights",type:"textarea",rows:4,arrayFromLines:true},
    {name:"content",label:"Notes",type:"textarea",rows:4},
    {name:"isPrivate",label:"Private",type:"checkbox",checkboxLabel:"Keep this entry private"}
   ]}
  />
 );
}

export default GratitudeForm;