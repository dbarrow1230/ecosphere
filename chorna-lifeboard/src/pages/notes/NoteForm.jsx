// src/pages/notes/NoteForm.jsx
import LifeboardFormPage from "../../components/lifeboard/LifeboardFormPage.jsx";

function NoteForm(){
 return(
  <LifeboardFormPage
   title="New Note"
   eyebrow="Notes"
   text="Create a note, brain dump, outline, Cornell note, or other note-taking record."
   endpoint="/api/notes"
   redirectPath="/notes"
   submitLabel="Save Note"
   initialValues={{
    title:"",
    noteType:"general",
    noteDate:new Date().toISOString().slice(0,10),
    content:"",
    summary:"",
    keyPoints:"",
    actionItems:""
   }}
   fields={[
    {name:"title",label:"Title",required:true},
    {name:"noteDate",label:"Note Date",type:"date"},
    {name:"noteType",label:"Note Type",type:"select",options:[
     {value:"general",label:"General"},
     {value:"cornell",label:"Cornell"},
     {value:"mindmap",label:"Mind Map"},
     {value:"outline",label:"Outline"},
     {value:"boxing",label:"Boxing"},
     {value:"charting",label:"Charting"},
     {value:"sentence",label:"Sentence"},
     {value:"slides",label:"Slides"},
     {value:"brain-dump",label:"Brain Dump"},
     {value:"bullet",label:"Bullet"}
    ]},
    {name:"content",label:"Content",type:"textarea",rows:8,full:true},
    {name:"summary",label:"Summary",type:"textarea",rows:4,full:true},
    {name:"keyPoints",label:"Key Points",type:"textarea",rows:4,arrayFromLines:true},
    {name:"actionItems",label:"Action Items",type:"textarea",rows:4,arrayFromLines:true}
   ]}
  />
 );
}

export default NoteForm;