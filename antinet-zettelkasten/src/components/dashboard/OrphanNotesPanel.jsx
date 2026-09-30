import {Network} from "lucide-react";
import DashboardListPanel from "./DashboardListPanel";

function OrphanNotesPanel({
 orphanNotes=[],
 loading=false,
 getTitle=item=>item.title||item.name||"Untitled note",
 getMeta=item=>`${item.noteType?.name||item.noteTypeRef?.name||item.type||"Note"} · ${item.notebook?.name||item.notebookRef?.name||"Unfiled"}`,
 getLink=null
}){

 return(
  <DashboardListPanel
   className="dashboard-section-priority"
   kicker="Connection Review"
   title="Unlinked Notes"
   linkTo="/links"
   linkLabel="View links"
   loading={loading}
   loadingMessage="Loading unlinked notes..."
   emptyMessage="No unlinked working notes right now."
   items={orphanNotes}
   icon={<Network size={17} strokeWidth={2.2}/>}
   getTitle={getTitle}
   getMeta={getMeta}
   getLink={getLink}
  />
 );
}

export default OrphanNotesPanel;
