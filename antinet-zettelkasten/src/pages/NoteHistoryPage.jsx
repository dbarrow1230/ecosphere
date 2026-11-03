import ZettelkastenListPage from "./ZettelkastenListPage.jsx";
import {renderDate,renderNoteLink} from "../utils/zettelkastenRenderers.jsx";

function NoteHistoryPage(){
 return(
  <ZettelkastenListPage
   title="Note History"
   eyebrow="Review Queue"
   endpoint="/api/note-history"
   emptyMessage="No note history records found yet."
   columns={[
    {key:"note",label:"Note",render:row=>renderNoteLink(row.note)},
    {key:"version",label:"Version"},
    {key:"changeType",label:"Change"},
    {key:"title",label:"Snapshot Title"},
    {key:"notebook",label:"Notebook"},
    {key:"updatedAt",label:"Updated",render:row=>renderDate(row.updatedAt||row.createdAt)}
   ]}
   getDeleteUrl={row=>`/api/note-history/${row._id}`}
  />
 );
}

export default NoteHistoryPage;
