// src/pages/journal/PrivateJournalForm.jsx
import LifeboardFormPage from "../../components/lifeboard/LifeboardFormPage.jsx";

function PrivateJournalForm(){
 return(
  <LifeboardFormPage
   title="Private Journal Entry"
   eyebrow="Journal"
   text="Create a private journal entry for personal thoughts, reflections, memories, or processing."
   endpoint="/api/journal"
   redirectPath="/journal/private"
   submitLabel="Save Private Entry"
   initialValues={{
    title:"",
    journalType:"private",
    entryDate:new Date().toISOString().slice(0,10),
    mood:"",
    energy:"",
    content:"",
    isPrivate:true
   }}
   fields={[
    {name:"title",label:"Title",required:true},
    {name:"entryDate",label:"Entry Date",type:"date",required:true},
    {name:"mood",label:"Mood"},
    {name:"energy",label:"Energy",type:"number",min:"1",max:"10"},
    {name:"content",label:"Entry",type:"textarea",rows:10,full:true,required:true},
    {name:"isPrivate",label:"Private",type:"checkbox",checkboxLabel:"Keep this entry private"}
   ]}
  />
 );
}

export default PrivateJournalForm;