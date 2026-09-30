// src/pages/notes/NotesPage.jsx
import LifeboardListPage from "../../components/lifeboard/LifeboardListPage.jsx";

function NotesPage(){
 return(
  <LifeboardListPage
   title="Notes"
   text="View notes, brain dumps, outlines, Cornell notes, mind maps, and other note-taking methods."
   endpoint="/api/notes"
   dataKey="notes"
   emptyText="No notes found."
   createPath="/notes/new"
   createLabel="Add Note"
   filters={[
    {name:"noteType",label:"Note Type",field:"noteType",options:[
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
    ]}
   ]}
   columns={[
    {key:"title",label:"Title"},
    {key:"noteType",label:"Type"},
    {key:"noteDateDisplay",label:"Date"},
    {key:"summary",label:"Summary"},
    {key:"lifeArea.name",label:"Life Area"}
   ]}
  />
 );
}

export default NotesPage;